/**
 * scripts/migrate_application_numbers.cjs
 * 
 * Safe, idempotent recovery utility to extract acknowledgement numbers embedded in application remarks
 * and set them into the dedicated first-class 'applicationNumber' field.
 * 
 * Safety features:
 * 1. Defaults to DRY-RUN mode (safe read-only). Pass --execute to apply changes.
 * 2. Non-destructive: Does NOT alter, truncate, or overwrite existing 'remarks' text.
 * 3. Only targets records where 'applicationNumber' is currently undefined, null, or empty.
 * 4. Regex parsing: /Ack Number:\s*([^\n\r]+)/i
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
  console.error('FATAL: PROD_MONGODB_URI or MONGODB_URI not found.');
  process.exit(1);
}

const isExecute = process.argv.includes('--execute');
const isDryRun = !isExecute;

function maskUri(u) {
  return u.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
}

async function run() {
  console.log('========================================================================');
  console.log('   PHASE 18: APPLICATION NUMBER EXTRACTION & RECOVERY UTILITY          ');
  console.log('========================================================================');
  console.log(`Execution Mode: ${isDryRun ? 'DRY-RUN (Safe Read-Only - Zero Writes)' : 'LIVE EXECUTION'}`);
  console.log(`Target Database: ${maskUri(uri)}\n`);

  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 8000 });

  try {
    await client.connect();
    const db = client.db('govscheme');
    const appsColl = db.collection('applications');

    const totalApps = await appsColl.countDocuments();
    console.log(`--- Application Data Assessment ---`);
    console.log(`Total Applications in 'govscheme.applications': ${totalApps}`);

    // Query for records lacking applicationNumber
    const candidateQuery = {
      $or: [
        { applicationNumber: { $exists: false } },
        { applicationNumber: null },
        { applicationNumber: '' }
      ]
    };

    const candidates = await appsColl.find(candidateQuery).toArray();
    console.log(`Records lacking dedicated applicationNumber: ${candidates.length}`);

    const ackRegex = /Ack Number:\s*([^\n\r]+)/i;
    const recoverableRecords = [];
    const seenAppNumbers = new Map();

    for (const app of candidates) {
      if (app.remarks && typeof app.remarks === 'string') {
        const match = app.remarks.match(ackRegex);
        if (match && match[1]) {
          const rawExtracted = match[1].trim();
          // Safety guards:
          // 1. Filter out empty, placeholders or trivial entries ('N/A', 'none', '-', 'null')
          if (!rawExtracted || /^(none|n\/a|null|-+|\.+)$/i.test(rawExtracted)) {
            continue;
          }
          // 2. Sanitize and bound length (100 characters max)
          const cleanAppNumber = rawExtracted.replace(/[\x00-\x1F\x7F]/g, '').slice(0, 100).trim();
          if (!cleanAppNumber) continue;

          // 3. Collision / Duplication detection
          if (seenAppNumbers.has(cleanAppNumber)) {
            console.warn(`[WARNING] Duplicate applicationNumber detected: "${cleanAppNumber}" on App ID ${app._id} (Already seen on ${seenAppNumbers.get(cleanAppNumber)}). Flagging for manual review.`);
          }
          seenAppNumbers.set(cleanAppNumber, app._id.toString());

          recoverableRecords.push({
            id: app._id.toString(),
            userId: app.userId ? app.userId.toString() : 'UNKNOWN',
            currentRemarks: app.remarks,
            extractedAppNumber: cleanAppNumber,
            existingAppNumber: app.applicationNumber || '<none>'
          });
        }
      }
    }

    console.log(`Records with recoverable acknowledgement number in remarks: ${recoverableRecords.length}\n`);

    if (recoverableRecords.length > 0) {
      console.log('Targeted Records Detail:');
      console.log('------------------------------------------------------------------------');
      recoverableRecords.forEach((r, idx) => {
        console.log(`[${idx + 1}] ID: ${r.id} | User: ${r.userId}`);
        console.log(`    Current Remarks: "${r.currentRemarks}"`);
        console.log(`    Extracted Ack:   "${r.extractedAppNumber}"`);
        console.log(`    Operation:       $set: { applicationNumber: "${r.extractedAppNumber}" } (remarks preserved)`);
      });
      console.log('------------------------------------------------------------------------\n');
    }

    if (isDryRun) {
      console.log('========================================================================');
      console.log(' DRY-RUN SUMMARY');
      console.log('========================================================================');
      console.log(`- Total Records Inspected:    ${totalApps}`);
      console.log(`- Records Missing Field:      ${candidates.length}`);
      console.log(`- Recoverable From Remarks:   ${recoverableRecords.length}`);
      console.log(`- Records Modified:           0 (DRY-RUN SAFE MODE)`);
      console.log(`- Remarks Integrity:          Preserved (No mutations)\n`);
      console.log('To apply these changes when approved, execute with --execute flag.');
    } else {
      console.log('APPLYING RECOVERY MUTATIONS...');
      let updatedCount = 0;
      for (const rec of recoverableRecords) {
        const result = await appsColl.updateOne(
          { _id: require('mongodb').ObjectId.createFromHexString(rec.id) },
          { $set: { applicationNumber: rec.extractedAppNumber } }
        );
        if (result.modifiedCount > 0) updatedCount++;
      }
      console.log(`Live migration complete: ${updatedCount} records successfully updated.`);
    }

  } catch (err) {
    console.error('Migration utility error:', err.message);
  } finally {
    await client.close();
  }
}

run();

