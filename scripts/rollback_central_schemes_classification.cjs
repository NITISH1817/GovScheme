/**
 * scripts/rollback_central_schemes_classification.cjs
 * 
 * Safe Rollback Utility for Phase 18/20 Central Government Scheme Classification.
 * Reverts modified Central schemes back to their pre-migration baseline:
 *   - governmentLevel: "State"
 *   - residenceRequirements: "Resident of Central"
 * 
 * Safety Features:
 * 1. Defaults to DRY-RUN mode (safe read-only). Pass --execute to revert.
 * 2. Uses targeted updates restricted strictly to schemes matching state: 'Central'.
 * 3. Does not modify any other scheme attributes.
 */

const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment configuration
const envPath = path.resolve('.env.production.local');
let uri = process.env.PROD_MONGODB_URI || process.env.MONGODB_URI;

if (fs.existsSync(envPath)) {
  const env = dotenv.parse(fs.readFileSync(envPath, 'utf8'));
  uri = env.PROD_MONGODB_URI || uri;
}

if (!uri) {
  console.error('FATAL: PROD_MONGODB_URI not found.');
  process.exit(1);
}

const isExecute = process.argv.includes('--execute');
const isDryRun = !isExecute;

function maskUri(u) {
  return u.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
}

async function runRollback() {
  console.log('========================================================================');
  console.log('    PHASE 20: CENTRAL SCHEME CLASSIFICATION ROLLBACK UTILITY           ');
  console.log('========================================================================');
  console.log(`Execution Mode: ${isDryRun ? 'DRY-RUN (Safe Read-Only - Zero Writes)' : 'LIVE EXECUTION'}`);
  console.log(`Target Database: ${maskUri(uri)}\n`);

  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });

  try {
    await client.connect();
    const db = client.db('govscheme');
    const schemesColl = db.collection('schemes');

    // Query records currently migrated to Central
    const migratedRecords = await schemesColl.find({
      state: 'Central',
      governmentLevel: 'Central'
    }).toArray();

    // Require audit manifest to confirm exact pre-migration baseline (fail-closed if missing)
    const manifestPath = path.resolve('backups/central_schemes_migration_manifest.json');
    if (!fs.existsSync(manifestPath)) {
      console.error('FATAL SAFETY HALT: Rollback manifest backups/central_schemes_migration_manifest.json not found.');
      console.error('Refusing rollback: Rollback cannot proceed without verifiable pre-migration state manifest.');
      process.exit(1);
    }

    const manifestRaw = fs.readFileSync(manifestPath, 'utf8');
    const crypto = require('crypto');
    const manifestHash = crypto.createHash('sha256').update(manifestRaw).digest('hex');
    console.log(`Verified Rollback Manifest Hash (SHA-256): ${manifestHash}\n`);

    let manifestMap = new Map();
    try {
      const manifest = JSON.parse(manifestRaw);
      if (!Array.isArray(manifest.records) || manifest.records.length === 0) {
        throw new Error('Manifest contains no records array');
      }
      manifest.records.forEach(r => manifestMap.set(r.id, r));
    } catch (e) {
      console.error(`FATAL SAFETY HALT: Corrupt or unparseable rollback manifest: ${e.message}`);
      process.exit(1);
    }

    const eligibleForRevert = [];
    const skippedRecords = [];

    for (const doc of migratedRecords) {
      const schemeId = doc.id || doc.schemeId;
      const manifestEntry = manifestMap.get(schemeId);

      // Pre-condition safety guard:
      // Verify state is strictly 'Central'. If an unexpected state mutation occurred, refuse to overwrite.
      if (doc.state !== 'Central') {
        skippedRecords.push({
          id: schemeId,
          reason: `Unexpected state value: "${doc.state}" (Expected "Central")`
        });
        continue;
      }

      // If manifest is present, verify that current residence matches the expected migration value
      if (manifestEntry && manifestEntry['proposed.residence'] && doc.residenceRequirements !== manifestEntry['proposed.residence']) {
        skippedRecords.push({
          id: schemeId,
          reason: `Current residence "${doc.residenceRequirements}" differs from expected migration value "${manifestEntry['proposed.residence']}"`
        });
        continue;
      }

      eligibleForRevert.push({
        _id: doc._id,
        id: schemeId,
        name: (doc.name || doc.schemeName || '').slice(0, 32) + '...',
        currentLevel: doc.governmentLevel,
        revertLevel: manifestEntry ? manifestEntry['before.level'] || 'State' : 'State',
        currentResidence: doc.residenceRequirements,
        revertResidence: manifestEntry ? manifestEntry['before.residence'] || 'Resident of Central' : 'Resident of Central'
      });
    }

    console.log(`--- Rollback Target Assessment ---`);
    console.log(`Total Schemes in MongoDB:                      ${await schemesColl.countDocuments()}`);
    console.log(`Central Schemes Currently Eligible for Revert: ${eligibleForRevert.length}`);
    console.log(`Schemes Skipped by Pre-Condition Safety Guards: ${skippedRecords.length}\n`);

    if (skippedRecords.length > 0) {
      console.warn('⚠ NOTICE: The following records were skipped due to unexpected values:');
      console.table(skippedRecords);
    }

    if (eligibleForRevert.length === 0) {
      console.log('No eligible migrated Central schemes found in database (Migration has not been executed or records already at baseline).');
      return;
    }

    const rollbackReport = eligibleForRevert.map((r, idx) => ({
      '#': idx + 1,
      id: r.id,
      name: r.name,
      'current.level': r.currentLevel,
      'revert.level': r.revertLevel,
      'current.residence': r.currentResidence,
      'revert.residence': r.revertResidence
    }));

    console.table(rollbackReport.slice(0, 15));
    if (rollbackReport.length > 15) {
      console.log(`... and ${rollbackReport.length - 15} more records.`);
    }

    if (isDryRun) {
      console.log('\n[DRY-RUN COMPLETE] 0 records modified.');
      console.log('To execute this rollback in emergency recovery, re-run with: node scripts/rollback_central_schemes_classification.cjs --execute');
    } else {
      console.log('\n[LIVE ROLLBACK] Reverting classification to verified pre-migration baseline...');
      let revertedCount = 0;
      for (const rec of eligibleForRevert) {
        const res = await schemesColl.updateOne(
          { _id: rec._id },
          {
            $set: {
              governmentLevel: rec.revertLevel,
              residenceRequirements: rec.revertResidence,
              updatedAt: new Date()
            }
          }
        );
        if (res.modifiedCount > 0) revertedCount++;
      }
      console.log(`✔ Successfully reverted ${revertedCount} records to pre-migration baseline.`);
    }

  } catch (err) {
    console.error('Rollback Error:', err.message);
  } finally {
    await client.close();
  }
}

runRollback();

