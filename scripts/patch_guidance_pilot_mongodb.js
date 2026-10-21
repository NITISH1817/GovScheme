// scripts/patch_guidance_pilot_mongodb.js
// Enterprise Surgical Targeted Patch Utility for GovScheme Guidance Pilot
// Target: 5 approved schemes (applicationSteps only)
// 1. edu-tn-tamil-puthalvan
// 2. edu-tn-first-graduate
// 3. edu-nsp-merit-means
// 4. agri-soil-health-card
// 5. emp-tn-naan-mudhalvan

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Scheme from '../server/models/Scheme.js';

dotenv.config();
if (fs.existsSync('.env.production.local')) {
  dotenv.config({ path: '.env.production.local', override: true });
}

export const PILOT_SCHEME_IDS = [
  'edu-tn-tamil-puthalvan',
  'edu-tn-first-graduate',
  'edu-nsp-merit-means',
  'agri-soil-health-card',
  'emp-tn-naan-mudhalvan'
];

export function sanitizeError(err) {
  const msg = err && err.message ? err.message : String(err);
  return msg.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)@/gi, '$1***@');
}

export function getSanitizedTarget(uri) {
  try {
    const isSrv = uri.startsWith('mongodb+srv://');
    const withoutProto = uri.replace('mongodb+srv://', '').replace('mongodb://', '');
    const parts = withoutProto.split('@');
    const hostAndDb = parts.length > 1 ? parts[parts.length - 1] : parts[0];
    const host = hostAndDb.split('/')[0];
    const rawDb = hostAndDb.split('/')[1]?.split('?')[0];
    const db = rawDb && rawDb.trim() !== '' ? rawDb.trim() : null;
    const isLocal = host.includes('127.0.0.1') || host.includes('localhost');
    return { isLocal, host, db, isSrv };
  } catch {
    return { isLocal: false, host: 'unknown', db: null, isSrv: false };
  }
}

export function arraysEqual(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export function loadCanonicalPilotSteps(schemesFilePath = 'src/data/schemes.ts') {
  if (!fs.existsSync(schemesFilePath)) {
    throw new Error(`Canonical schemes file not found at: ${schemesFilePath}`);
  }
  const rawCode = fs.readFileSync(schemesFilePath, 'utf8')
    .replace("import type { Scheme } from '../types';", '')
    .replace('export const schemesData: Scheme[] =', 'const schemesData =');
  const fn = new Function(rawCode + '; return schemesData;');
  const allSchemes = fn();

  if (!Array.isArray(allSchemes) || allSchemes.length !== 75) {
    throw new Error(`Expected exactly 75 canonical schemes in ${schemesFilePath}, found ${allSchemes ? allSchemes.length : 0}`);
  }

  const pilotMap = new Map();
  for (const id of PILOT_SCHEME_IDS) {
    const scheme = allSchemes.find(s => s.id === id);
    if (!scheme) {
      throw new Error(`Target pilot scheme '${id}' not found in canonical dataset (${schemesFilePath}).`);
    }
    if (!Array.isArray(scheme.applicationSteps) || scheme.applicationSteps.length < 3) {
      throw new Error(`Pilot scheme '${id}' must have at least 3 applicationSteps in canonical dataset.`);
    }
    pilotMap.set(id, scheme.applicationSteps);
  }

  return pilotMap;
}

export function deterministicSerialize(val) {
  if (val === null || val === undefined) return 'null';
  if (val instanceof Date) return JSON.stringify(val.toISOString());
  if (Array.isArray(val)) {
    return '[' + val.map(item => deterministicSerialize(item)).join(',') + ']';
  }
  if (typeof val === 'object') {
    const keys = Object.keys(val).filter(k => k !== '__v').sort();
    return '{' + keys.map(k => JSON.stringify(k) + ':' + deterministicSerialize(val[k])).join(',') + '}';
  }
  return JSON.stringify(val);
}

export function computeUnrelatedFingerprint(docs) {
  const sorted = [...docs].sort((a, b) => (a.id || '').localeCompare(b.id || ''));
  const serialized = '[' + sorted.map(d => deterministicSerialize(d)).join(',') + ']';
  return crypto.createHash('sha256').update(serialized).digest('hex');
}

export function validateFingerprintArtifact(filePath) {
  if (!filePath || typeof filePath !== 'string') {
    throw new Error('Fingerprint artifact validation failed: A valid file path must be provided.');
  }
  if (!fs.existsSync(filePath)) {
    throw new Error(`Fingerprint artifact validation failed: File not found at '${filePath}'`);
  }
  const stat = fs.statSync(filePath);
  if (stat.size === 0) {
    throw new Error(`Fingerprint artifact validation failed: File at '${filePath}' is empty (0 bytes)`);
  }
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    throw new Error(`Fingerprint artifact validation failed: File at '${filePath}' contains corrupt JSON: ${err.message}`);
  }
  if (!parsed || typeof parsed !== 'object') {
    throw new Error(`Fingerprint artifact validation failed: Root JSON object required in '${filePath}'`);
  }
  const hex64Regex = /^[a-f0-9]{64}$/i;
  if (!parsed.preUpdateFingerprint || !hex64Regex.test(parsed.preUpdateFingerprint)) {
    throw new Error(`Fingerprint artifact validation failed: Missing or invalid preUpdateFingerprint in '${filePath}'`);
  }
  if (parsed.status === 'verified_unchanged') {
    if (!parsed.postUpdateFingerprint || !hex64Regex.test(parsed.postUpdateFingerprint)) {
      throw new Error(`Fingerprint artifact validation failed: Missing or invalid postUpdateFingerprint in verified artifact '${filePath}'`);
    }
    if (parsed.preUpdateFingerprint !== parsed.postUpdateFingerprint) {
      throw new Error(`Fingerprint artifact validation failed: preUpdateFingerprint does not match postUpdateFingerprint in '${filePath}'`);
    }
  }
  return parsed;
}

export function validateRollbackPath(rollbackFile, backupDir = 'backups') {
  if (!rollbackFile || typeof rollbackFile !== 'string') {
    throw new Error('Rollback aborted: A valid backup file path must be provided.');
  }

  const resolvedBackupDir = path.resolve(backupDir);
  const resolvedRollbackPath = path.resolve(rollbackFile);

  // Require lexical path to be strictly inside backupDir
  const relative = path.relative(resolvedBackupDir, resolvedRollbackPath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(
      `Rollback aborted: Backup path '${rollbackFile}' is outside the authorized backups directory '${backupDir}'. Path traversal rejected.`
    );
  }

  const filename = path.basename(resolvedRollbackPath);
  // Filename validation: must match guidance_pilot_backup_*.json
  const validPattern = /^guidance_pilot_backup_[\w-]+\.json$/;
  if (!validPattern.test(filename)) {
    throw new Error(
      `Rollback aborted: Invalid backup filename '${filename}'. Expected format: guidance_pilot_backup_<timestamp>.json`
    );
  }

  if (!fs.existsSync(resolvedRollbackPath)) {
    throw new Error(`Rollback aborted: Backup file not found at: ${resolvedRollbackPath}`);
  }

  // Symlink protection: resolve real filesystem paths to prevent symlink traversal
  try {
    const realBackupDir = fs.realpathSync.native ? fs.realpathSync.native(resolvedBackupDir) : fs.realpathSync(resolvedBackupDir);
    const realRollbackPath = fs.realpathSync.native ? fs.realpathSync.native(resolvedRollbackPath) : fs.realpathSync(resolvedRollbackPath);

    const realRel = path.relative(realBackupDir, realRollbackPath);
    if (realRel.startsWith('..') || path.isAbsolute(realRel)) {
      throw new Error(
        `Rollback aborted: Backup path '${rollbackFile}' resolves via symlink outside authorized backups directory. Symlink traversal rejected.`
      );
    }

    return realRollbackPath;
  } catch (err) {
    if (err.message.includes('Symlink traversal rejected')) {
      throw err;
    }
    throw new Error(`Rollback aborted: Failed to resolve real filesystem path for '${rollbackFile}': ${err.message}`);
  }
}

export async function patchGuidancePilot({
  mongoUri,
  dryRun = false,
  backupOnly = false,
  apply = false,
  rollbackFile = null,
  backupDir = 'backups',
  schemesFilePath = 'src/data/schemes.ts',
  quiet = false,
  _onBeforeUpdate = null
} = {}) {
  // Fail closed: enforce valid mode
  if (!dryRun && !backupOnly && !apply && !rollbackFile) {
    throw new Error('Must specify one valid operation mode: --dry-run, --backup-only, --apply, or --rollback=<file>');
  }

  // 1. Read proposed applicationSteps directly from canonical dataset (Requirement 2)
  const canonicalPilotSteps = loadCanonicalPilotSteps(schemesFilePath);

  // 2. Resolve database connection (Requirement 10: Never log credentials)
  const uri = mongoUri || process.env.PROD_MONGODB_URI || process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    throw new Error('Connection aborted: No MongoDB URI supplied. Pass via --uri= or PROD_MONGODB_URI / MONGODB_URI.');
  }

  const target = getSanitizedTarget(uri);
  if (!quiet) {
    console.log(`[Target Database] Host: ${target.host} | DB: ${target.db || 'default'} | Local: ${target.isLocal ? 'YES' : 'NO'}`);
  }

  let connectedHere = false;
  if (mongoose.connection.readyState === 0) {
    if (!quiet) console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    connectedHere = true;
    if (!quiet) console.log('Connected successfully.');
  }

  try {
    // 3. Pre-condition checks (Requirement 4: Exactly 75 schemes, each target exists exactly once)
    const totalCount = await Scheme.countDocuments();
    if (totalCount !== 75) {
      throw new Error(`Pre-condition failed: Expected exactly 75 schemes in database, but found ${totalCount}.`);
    }

    for (const targetId of PILOT_SCHEME_IDS) {
      const matchCount = await Scheme.countDocuments({ id: targetId });
      if (matchCount === 0) {
        throw new Error(`Target document with id '${targetId}' not found in database.`);
      }
      if (matchCount > 1) {
        throw new Error(`Ambiguity error: Expected exactly 1 document with id '${targetId}', found ${matchCount}.`);
      }
    }

    // Fetch existing documents for all 5 targets
    const currentDocs = await Scheme.find({ id: { $in: PILOT_SCHEME_IDS } }).lean();
    if (currentDocs.length !== 5) {
      throw new Error(`Expected to retrieve 5 target documents, but fetched ${currentDocs.length}.`);
    }
    const currentDocsMap = new Map(currentDocs.map(d => [d.id, d]));

    // 4. Rollback mode (Requirement 9 & Hardening 1)
    if (rollbackFile) {
      const resolvedRollbackFile = validateRollbackPath(rollbackFile, backupDir);
      const rawBackup = fs.readFileSync(resolvedRollbackFile, 'utf8');
      let backupDocs;
      try {
        backupDocs = JSON.parse(rawBackup);
      } catch (e) {
        throw new Error(`Rollback aborted: Backup file does not contain valid JSON: ${e.message}`);
      }

      if (!Array.isArray(backupDocs) || backupDocs.length !== 5) {
        throw new Error(`Rollback aborted: Backup file must contain an array of exactly 5 scheme documents.`);
      }

      for (const targetId of PILOT_SCHEME_IDS) {
        const backupItem = backupDocs.find(d => d.id === targetId);
        if (!backupItem || !Array.isArray(backupItem.applicationSteps)) {
          throw new Error(`Rollback aborted: Backup file missing valid record for '${targetId}'.`);
        }
      }

      // Check current values against proposed pilot steps before rollback
      for (const backupItem of backupDocs) {
        const currentDoc = currentDocsMap.get(backupItem.id);
        const proposedSteps = canonicalPilotSteps.get(backupItem.id);
        if (!arraysEqual(currentDoc.applicationSteps, proposedSteps)) {
          throw new Error(
            `Rollback guard tripped for '${backupItem.id}': Current applicationSteps in database do not match proposed pilot steps. A subsequent edit may have occurred. Aborting rollback to prevent overwriting newer changes.`
          );
        }
      }

      if (dryRun) {
        if (!quiet) {
          console.log('\n[ROLLBACK DRY-RUN] All 5 records validated for rollback.');
          console.log('No database writes performed.');
        }
        return { success: true, mode: 'rollback-dry-run', count: 5 };
      }

      if (!quiet) {
        console.log(`\nExecuting rollback from backup: ${resolvedRollbackFile}`);
      }

      for (const backupItem of backupDocs) {
        const proposedSteps = canonicalPilotSteps.get(backupItem.id);
        const res = await Scheme.updateOne(
          { id: backupItem.id, applicationSteps: proposedSteps },
          { $set: { applicationSteps: backupItem.applicationSteps } },
          { timestamps: false }
        );
        if (res.matchedCount !== 1 || res.modifiedCount !== 1) {
          throw new Error(`Rollback write failed for '${backupItem.id}': matched=${res.matchedCount}, modified=${res.modifiedCount}`);
        }
      }

      // Verify post-rollback
      for (const backupItem of backupDocs) {
        const verified = await Scheme.findOne({ id: backupItem.id }).lean();
        if (!arraysEqual(verified.applicationSteps, backupItem.applicationSteps)) {
          throw new Error(`Post-rollback verification failed for '${backupItem.id}'.`);
        }
      }

      if (!quiet) {
        console.log('[ROLLBACK COMPLETE] All 5 records successfully restored to original applicationSteps.');
      }

      return {
        success: true,
        mode: 'rollback-applied',
        restoredCount: 5
      };
    }

    // 5. Dry-Run Mode (Requirement 3: strictly read-only, NO writes, NO backup file)
    if (dryRun) {
      if (!quiet) {
        console.log('\n[DRY RUN] Read-only verification successful.');
        console.log('Pre-conditions validated: Exactly 75 schemes in database; all 5 targets exist uniquely.');
        console.log('\nProposed applicationSteps changes for the 5 target schemes:');
        for (const targetId of PILOT_SCHEME_IDS) {
          const doc = currentDocsMap.get(targetId);
          const proposed = canonicalPilotSteps.get(targetId);
          console.log(`\n--- Scheme: [${targetId}] ${doc.name} ---`);
          console.log(`Current steps count: ${doc.applicationSteps?.length || 0}`);
          console.log(`Proposed steps count: ${proposed.length}`);
          proposed.forEach((s, i) => console.log(`  ${i + 1}. ${s}`));
        }
        console.log('\nZero writes executed. Database is untouched.');
      }

      return {
        success: true,
        mode: 'dry-run',
        totalSchemesCount: totalCount,
        targetsCount: 5,
        targets: PILOT_SCHEME_IDS
      };
    }

    // 6. Pre-update Backup (Requirement 5: Back up all 5 complete original documents)
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilePath = path.join(backupDir, `guidance_pilot_backup_${timestamp}.json`);

    fs.writeFileSync(backupFilePath, JSON.stringify(currentDocs, null, 2), 'utf8');

    // Validate backup file on disk before proceeding (Requirement 5)
    if (!fs.existsSync(backupFilePath)) {
      throw new Error(`Backup validation failed: File was not created at ${backupFilePath}`);
    }
    const backupStat = fs.statSync(backupFilePath);
    if (backupStat.size === 0) {
      throw new Error(`Backup validation failed: File at ${backupFilePath} is empty (0 bytes).`);
    }

    const readBackBackup = JSON.parse(fs.readFileSync(backupFilePath, 'utf8'));
    if (!Array.isArray(readBackBackup) || readBackBackup.length !== 5) {
      throw new Error(`Backup validation failed: Parsed backup contains ${readBackBackup?.length} items, expected 5.`);
    }
    for (const targetId of PILOT_SCHEME_IDS) {
      const bDoc = readBackBackup.find(d => d.id === targetId);
      if (!bDoc || !bDoc.id || !bDoc.name || !Array.isArray(bDoc.applicationSteps)) {
        throw new Error(`Backup validation failed: Record '${targetId}' incomplete in backup file.`);
      }
    }

    if (!quiet) {
      console.log(`\n[Backup Verified] 5 complete documents saved to: ${backupFilePath} (${backupStat.size} bytes)`);
    }

    if (backupOnly) {
      return {
        success: true,
        mode: 'backup-only',
        backupFilePath,
        backupSize: backupStat.size,
        backedUpCount: 5
      };
    }

    // 7. Apply Mode (Requirement 6, 7 & 8)
    if (!apply) {
      throw new Error('Internal error: Unknown execution path.');
    }

    // Capture pre-update snapshot of the other 70 schemes (Requirement 8)
    const otherDocsPre = await Scheme.find({ id: { $nin: PILOT_SCHEME_IDS } }).lean();
    if (otherDocsPre.length !== 70) {
      throw new Error(`Expected exactly 70 unrelated schemes, found ${otherDocsPre.length}.`);
    }
    const preFingerprint = computeUnrelatedFingerprint(otherDocsPre);

    // Persist pre-update fingerprint artifact alongside target-record backup
    const fingerprintFilePath = backupFilePath.replace('guidance_pilot_backup_', 'guidance_pilot_fingerprint_');
    const initialFingerprintArtifact = {
      timestamp,
      backupFile: path.basename(backupFilePath),
      fingerprintFile: path.basename(fingerprintFilePath),
      totalCatalogueCount: totalCount,
      unrelatedCount: 70,
      targetSchemeIds: PILOT_SCHEME_IDS,
      serializationAlgorithm: 'deterministicSerialize_v1',
      hashAlgorithm: 'SHA-256',
      preUpdateFingerprint: preFingerprint,
      postUpdateFingerprint: null,
      status: 'pending_write',
      databaseHost: target.host,
      databaseName: target.db || 'default'
    };
    fs.writeFileSync(fingerprintFilePath, JSON.stringify(initialFingerprintArtifact, null, 2), 'utf8');
    validateFingerprintArtifact(fingerprintFilePath);

    if (!quiet) {
      console.log(`[Fingerprint Stored] Pre-update fingerprint saved to: ${fingerprintFilePath}`);
      console.log('\nApplying guarded updates to 5 target schemes...');
    }

    // Execute guarded write for each target scheme (Requirement 6 & 7: update ONLY applicationSteps)
    let modifiedCount = 0;
    for (const targetId of PILOT_SCHEME_IDS) {
      const originalDoc = currentDocsMap.get(targetId);
      const newSteps = canonicalPilotSteps.get(targetId);

      if (typeof _onBeforeUpdate === 'function') {
        await _onBeforeUpdate({ targetId, modifiedCount });
      }

      let updateResult;
      try {
        // Guarded write: matches exact current applicationSteps (timestamps: false preserves updatedAt)
        updateResult = await Scheme.updateOne(
          { id: targetId, applicationSteps: originalDoc.applicationSteps },
          { $set: { applicationSteps: newSteps } },
          { timestamps: false }
        );
      } catch (writeErr) {
        if (modifiedCount > 0) {
          throw new Error(
            `CRITICAL: Partial update failure after modifying ${modifiedCount} of 5 schemes. Write error on '${targetId}': ${writeErr.message}. ` +
            `The database is in a partially applied state. Validated backup is available at: ${backupFilePath}. ` +
            `The operator must manually inspect the database state before initiating rollback. Do not retry automatically.`
          );
        }
        throw writeErr;
      }

      if (updateResult.matchedCount !== 1 || updateResult.modifiedCount !== 1) {
        if (modifiedCount > 0) {
          throw new Error(
            `CRITICAL: Partial update failure after modifying ${modifiedCount} of 5 schemes. Guarded write failed on '${targetId}' (concurrent modification or unmatched document: matched=${updateResult.matchedCount}, modified=${updateResult.modifiedCount}). ` +
            `The database is in a partially applied state. Validated backup is available at: ${backupFilePath}. ` +
            `The operator must manually inspect the database state before initiating rollback. Do not retry automatically.`
          );
        }
        throw new Error(
          `Guarded write failed for '${targetId}': Concurrent modification detected or document not matched. Expected matched=1, modified=1; got matched=${updateResult.matchedCount}, modified=${updateResult.modifiedCount}. Aborting.`
        );
      }
      modifiedCount++;
    }

    // 8. Post-Update Verification (Requirement 8)
    // 8.1 Verify all 5 target records
    let verifiedCount = 0;
    for (const targetId of PILOT_SCHEME_IDS) {
      const updatedDoc = await Scheme.findOne({ id: targetId }).lean();
      const expectedSteps = canonicalPilotSteps.get(targetId);
      const originalDoc = currentDocsMap.get(targetId);

      if (!arraysEqual(updatedDoc.applicationSteps, expectedSteps)) {
        throw new Error(`Verification failed for '${targetId}': applicationSteps do not match expected canonical steps.`);
      }

      // Verify no other fields were inadvertently altered (Requirement 6)
      const ignoredKeys = new Set(['applicationSteps', '__v']);
      for (const key of Object.keys(originalDoc)) {
        if (ignoredKeys.has(key)) continue;
        const origVal = JSON.stringify(originalDoc[key]);
        const updatedVal = JSON.stringify(updatedDoc[key]);
        if (origVal !== updatedVal) {
          throw new Error(`Integrity violation on '${targetId}': Field '${key}' was modified unexpectedly.`);
        }
      }
      verifiedCount++;
    }

    // 8.2 Verify total database count is still 75
    const postTotalCount = await Scheme.countDocuments();
    if (postTotalCount !== 75) {
      throw new Error(`Post-update verification failed: Total scheme count is ${postTotalCount}, expected 75.`);
    }

    // 8.3 Verify all other 70 schemes are completely unchanged (Requirement 8)
    const otherDocsPost = await Scheme.find({ id: { $nin: PILOT_SCHEME_IDS } }).lean();
    if (otherDocsPost.length !== 70) {
      throw new Error(`Post-update verification failed: Unrelated scheme count is ${otherDocsPost.length}, expected 70.`);
    }
    const postFingerprint = computeUnrelatedFingerprint(otherDocsPost);
    if (preFingerprint !== postFingerprint) {
      throw new Error('Integrity violation: Deterministic fingerprint of the other 70 schemes changed!');
    }

    // Persist and validate final post-update fingerprint artifact on disk
    const updatedFingerprintArtifact = {
      ...initialFingerprintArtifact,
      postUpdateFingerprint: postFingerprint,
      status: 'verified_unchanged',
      completedAt: new Date().toISOString()
    };
    fs.writeFileSync(fingerprintFilePath, JSON.stringify(updatedFingerprintArtifact, null, 2), 'utf8');
    validateFingerprintArtifact(fingerprintFilePath);

    // 9. Summary Report (Requirement 11)
    if (!quiet) {
      console.log('\n================================================================');
      console.log('   GOVSCHEME GUIDANCE PILOT PATCH SUMMARY');
      console.log('================================================================');
      console.log(`  Target Schemes Matched:    ${PILOT_SCHEME_IDS.length}`);
      console.log(`  Target Schemes Modified:   ${modifiedCount}`);
      console.log(`  Target Schemes Verified:   ${verifiedCount}`);
      console.log(`  Unrelated Schemes Kept:   70 (Fingerprint Verified Untouched)`);
      console.log(`  Total Schemes in Database: ${postTotalCount}`);
      console.log(`  Backup Archive:            ${backupFilePath}`);
      console.log(`  Fingerprint Archive:       ${fingerprintFilePath}`);
      console.log('================================================================\n');
    }

    return {
      success: true,
      mode: 'applied',
      backupFilePath,
      fingerprintFilePath,
      preFingerprint,
      postFingerprint,
      matchedCount: PILOT_SCHEME_IDS.length,
      modifiedCount,
      verifiedCount,
      unchangedCount: 70,
      totalCount: postTotalCount
    };
  } finally {
    if (connectedHere) {
      await mongoose.disconnect();
      if (!quiet) console.log('Disconnected from MongoDB.');
    }
  }
}

// CLI entry point
if (process.argv[1] && process.argv[1].endsWith('patch_guidance_pilot_mongodb.js')) {
  const isDryRun = process.argv.includes('--dry-run');
  const isBackupOnly = process.argv.includes('--backup-only');
  const isApply = process.argv.includes('--apply');
  const rollbackArg = process.argv.find(a => a.startsWith('--rollback='));
  const rollbackFile = rollbackArg ? rollbackArg.split('=')[1] : null;
  const uriArg = process.argv.find(a => a.startsWith('--uri='));
  const mongoUri = uriArg ? uriArg.split('=')[1] : undefined;

  if (!isDryRun && !isBackupOnly && !isApply && !rollbackFile) {
    console.log(`
GovScheme Guidance Pilot Targeted MongoDB Patch Utility
Usage:
  node scripts/patch_guidance_pilot_mongodb.js --dry-run [--uri=<mongo_uri>]
  node scripts/patch_guidance_pilot_mongodb.js --backup-only [--uri=<mongo_uri>]
  node scripts/patch_guidance_pilot_mongodb.js --apply [--uri=<mongo_uri>]
  node scripts/patch_guidance_pilot_mongodb.js --rollback=<backup_path> [--uri=<mongo_uri>]

Safety Rules:
  - Updates ONLY the 5 approved schemes: edu-tn-tamil-puthalvan, edu-tn-first-graduate, edu-nsp-merit-means, agri-soil-health-card, emp-tn-naan-mudhalvan.
  - Updates strictly applicationSteps using guarded writes.
  - Preserves all other 70 schemes with cryptographic fingerprint verification.
  - Creates and validates a complete 5-record backup before writing.
`);
    process.exit(0);
  }

  patchGuidancePilot({
    mongoUri,
    dryRun: isDryRun,
    backupOnly: isBackupOnly,
    apply: isApply,
    rollbackFile,
    quiet: false
  })
    .then(result => {
      console.log('\nOperation completed successfully. Mode:', result.mode);
      process.exit(0);
    })
    .catch(err => {
      console.error('\nOperation failed:', sanitizeError(err));
      process.exit(1);
    });
}
