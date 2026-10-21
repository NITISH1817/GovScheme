// tests/patch_guidance_pilot.test.js
// Unit & Integration Test Suite for scripts/patch_guidance_pilot_mongodb.js
// Uses isolated, disposable MongoMemoryServer — NEVER touches production.

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import Scheme from '../server/models/Scheme.js';
import {
  PILOT_SCHEME_IDS,
  loadCanonicalPilotSteps,
  computeUnrelatedFingerprint,
  validateFingerprintArtifact,
  arraysEqual,
  validateRollbackPath,
  patchGuidancePilot
} from '../scripts/patch_guidance_pilot_mongodb.js';

function loadCanonical75() {
  const rawCode = fs.readFileSync('src/data/schemes.ts', 'utf8')
    .replace("import type { Scheme } from '../types';", '')
    .replace('export const schemesData: Scheme[] =', 'const schemesData =');
  const fn = new Function(rawCode + '; return schemesData;');
  return fn();
}

console.log('================================================================');
console.log('GOVSCHEME GUIDANCE PILOT PATCH TEST SUITE (IN-MEMORY DB)');
console.log('================================================================\n');

let mongoServer;
let mongoUri;
const tempBackupDir = path.join('backups', 'test_tmp');

async function seedDatabase(schemes) {
  await Scheme.deleteMany({});
  const docs = schemes.map(s => ({
    schemeId: s.id,
    id: s.id,
    schemeName: s.name,
    name: s.name,
    description: s.description || s.shortDescription || 'Description',
    shortDescription: s.shortDescription || 'Short description',
    department: s.department || 'Department',
    state: s.state || 'All India',
    category: s.category || 'General',
    benefits: s.benefits || 'Benefits description',
    requiredDocuments: s.requiredDocuments || ['Aadhaar Card'],
    applicationSteps: s.applicationSteps || ['Initial Step 1', 'Initial Step 2'],
    officialWebsite: s.officialWebsite || 'https://example.gov.in',
    officialApplyUrl: s.officialApplyUrl || 'https://example.gov.in/apply',
    sourceUrl: s.sourceUrl || s.officialWebsite || 'https://example.gov.in',
    eligibilityRules: s.eligibilityRules || {}
  }));
  await Scheme.insertMany(docs);
}

// Clean up test backup directory
function cleanupTestBackups() {
  if (fs.existsSync(tempBackupDir)) {
    fs.rmSync(tempBackupDir, { recursive: true, force: true });
  }
}

try {
  // 1. Test canonical loading
  console.log('--- TEST 1: Canonical Pilot Steps Loader ---');
  const canonicalSteps = loadCanonicalPilotSteps('src/data/schemes.ts');
  assert.strictEqual(canonicalSteps.size, 5, 'Must load exactly 5 pilot schemes');
  for (const id of PILOT_SCHEME_IDS) {
    const steps = canonicalSteps.get(id);
    assert(Array.isArray(steps), `Scheme '${id}' steps must be an array`);
    assert(steps.length >= 3, `Scheme '${id}' must have at least 3 steps, got ${steps.length}`);
  }
  console.log('[PASS] Canonical pilot steps loaded and validated from src/data/schemes.ts.\n');

  // Start in-memory Mongo server
  mongoServer = await MongoMemoryServer.create();
  mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  const canonical75 = loadCanonical75();
  assert.strictEqual(canonical75.length, 75);

  // Prepare database with baseline (pre-pilot) steps for the 5 schemes to simulate production before update
  const baselineSchemes = canonical75.map(s => {
    if (PILOT_SCHEME_IDS.includes(s.id)) {
      return {
        ...s,
        applicationSteps: ['Legacy step 1 for test', 'Legacy step 2 for test']
      };
    }
    return s;
  });

  // 2. Test Dry-Run Mode
  console.log('--- TEST 2: Dry-Run Mode (Read-Only) ---');
  await seedDatabase(baselineSchemes);
  cleanupTestBackups();

  const dryRunRes = await patchGuidancePilot({
    mongoUri,
    dryRun: true,
    backupDir: tempBackupDir,
    quiet: true
  });

  assert.strictEqual(dryRunRes.success, true);
  assert.strictEqual(dryRunRes.mode, 'dry-run');
  assert.strictEqual(dryRunRes.totalSchemesCount, 75);
  assert.strictEqual(dryRunRes.targetsCount, 5);

  // Verify database was untouched
  const dryCheck = await Scheme.findOne({ id: 'edu-tn-tamil-puthalvan' }).lean();
  assert.strictEqual(dryCheck.applicationSteps.length, 2, 'Dry-run must not modify database');
  assert.strictEqual(fs.existsSync(tempBackupDir), false, 'Dry-run must not create backup file');
  console.log('[PASS] Dry-run mode successfully validates pre-conditions without writes.\n');

  // 3. Test Cardinality & Wrong Target Count Guards
  console.log('--- TEST 3: Pre-condition Checks (Wrong Counts) ---');
  // 3.1: DB has 74 schemes (missing 1)
  await seedDatabase(baselineSchemes.slice(0, 74));
  await assert.rejects(
    async () => {
      await patchGuidancePilot({ mongoUri, dryRun: true, quiet: true });
    },
    /Pre-condition failed: Expected exactly 75 schemes in database/,
    'Must fail closed when total schemes !== 75'
  );

  // 3.2: DB has 75 schemes, but one target ID is missing
  const missingTargetSchemes = baselineSchemes.map(s => {
    if (s.id === 'agri-soil-health-card') {
      return { ...s, id: 'agri-dummy-scheme', schemeId: 'agri-dummy-scheme' };
    }
    return s;
  });
  await seedDatabase(missingTargetSchemes);
  await assert.rejects(
    async () => {
      await patchGuidancePilot({ mongoUri, dryRun: true, quiet: true });
    },
    /Target document with id 'agri-soil-health-card' not found in database/,
    'Must fail closed when target ID is missing'
  );

  // 3.3: Duplicate target ID
  await seedDatabase(baselineSchemes);
  await Scheme.collection.dropIndex('id_1').catch(() => {});
  await Scheme.collection.insertOne({
    id: 'emp-tn-naan-mudhalvan',
    schemeId: 'emp-tn-naan-mudhalvan-dup',
    name: 'Duplicate Naan Mudhalvan',
    applicationSteps: ['Duplicate step']
  });
  await assert.rejects(
    async () => {
      await patchGuidancePilot({ mongoUri, dryRun: true, quiet: true });
    },
    /Pre-condition failed: Expected exactly 75 schemes in database|Ambiguity error: Expected exactly 1 document with id 'emp-tn-naan-mudhalvan'/,
    'Must fail closed on duplicate target document'
  );
  console.log('[PASS] Count guards and duplicate detection fail closed as expected.\n');

  // 4. Test Backup-Only Mode
  console.log('--- TEST 4: Backup-Only Mode ---');
  await seedDatabase(baselineSchemes);
  cleanupTestBackups();

  const backupRes = await patchGuidancePilot({
    mongoUri,
    backupOnly: true,
    backupDir: tempBackupDir,
    quiet: true
  });

  assert.strictEqual(backupRes.success, true);
  assert.strictEqual(backupRes.mode, 'backup-only');
  assert(fs.existsSync(backupRes.backupFilePath));
  const backupJson = JSON.parse(fs.readFileSync(backupRes.backupFilePath, 'utf8'));
  assert.strictEqual(backupJson.length, 5);
  for (const id of PILOT_SCHEME_IDS) {
    const bDoc = backupJson.find(d => d.id === id);
    assert(bDoc, `Backup must contain target '${id}'`);
    assert.deepStrictEqual(bDoc.applicationSteps, ['Legacy step 1 for test', 'Legacy step 2 for test']);
  }
  // Database still has 2 steps
  const checkPostBackup = await Scheme.findOne({ id: 'edu-tn-first-graduate' }).lean();
  assert.strictEqual(checkPostBackup.applicationSteps.length, 2);
  console.log('[PASS] Backup-only mode saves complete 5-scheme archive without altering DB.\n');

  // 5. Test Apply Mode (Surgical updates & unrelated preservation)
  console.log('--- TEST 5: Apply Mode (Targeted updates & 70-scheme preservation) ---');
  await seedDatabase(baselineSchemes);
  cleanupTestBackups();

  const pre70Docs = await Scheme.find({ id: { $nin: PILOT_SCHEME_IDS } }).lean();
  const preFingerprint = computeUnrelatedFingerprint(pre70Docs);

  const applyRes = await patchGuidancePilot({
    mongoUri,
    apply: true,
    backupDir: tempBackupDir,
    quiet: true
  });

  assert.strictEqual(applyRes.success, true);
  assert.strictEqual(applyRes.mode, 'applied');
  assert.strictEqual(applyRes.matchedCount, 5);
  assert.strictEqual(applyRes.modifiedCount, 5);
  assert.strictEqual(applyRes.verifiedCount, 5);
  assert.strictEqual(applyRes.unchangedCount, 70);
  assert.strictEqual(applyRes.totalCount, 75);

  // Verify all 5 target records have new canonical steps
  for (const id of PILOT_SCHEME_IDS) {
    const updated = await Scheme.findOne({ id }).lean();
    const expected = canonicalSteps.get(id);
    assert.deepStrictEqual(updated.applicationSteps, expected);
    // Verify name, category, and eligibilityRules are preserved
    const baseline = baselineSchemes.find(s => s.id === id);
    assert.strictEqual(updated.name, baseline.name);
    assert.strictEqual(updated.category, baseline.category);
  }

  // Verify other 70 schemes are 100% untouched
  const post70Docs = await Scheme.find({ id: { $nin: PILOT_SCHEME_IDS } }).lean();
  const postFingerprint = computeUnrelatedFingerprint(post70Docs);
  assert.strictEqual(postFingerprint, preFingerprint, '70 unrelated schemes must be 100% byte-for-byte identical');
  console.log('[PASS] Apply mode successfully updates 5 targets and preserves 70 unrelated schemes.\n');

  // 6. Test Concurrent Edit Protection (Guarded Write on first scheme)
  console.log('--- TEST 6: Concurrent Edit Protection Guard ---');
  await seedDatabase(baselineSchemes);
  cleanupTestBackups();

  // Attempt apply with _onBeforeUpdate hook simulating race condition on the very first scheme
  await assert.rejects(
    async () => {
      await patchGuidancePilot({
        mongoUri,
        apply: true,
        backupDir: tempBackupDir,
        quiet: true,
        _onBeforeUpdate: async ({ targetId }) => {
          if (targetId === 'edu-tn-tamil-puthalvan') {
            await Scheme.updateOne(
              { id: 'edu-tn-tamil-puthalvan' },
              { $set: { applicationSteps: ['Concurrent edit step made by another user'] } },
              { timestamps: false }
            );
          }
        }
      });
    },
    /Guarded write failed for 'edu-tn-tamil-puthalvan': Concurrent modification detected/,
    'Must trip guard and fail closed when concurrent modification occurs'
  );
  console.log('[PASS] Guarded write prevents overwriting concurrent modifications.\n');

  // 7. Test Rollback Mode & Rollback Guard
  console.log('--- TEST 7: Rollback Mode & Rollback Guard ---');
  // First, apply clean pilot updates
  await seedDatabase(baselineSchemes);
  cleanupTestBackups();

  const cleanApply = await patchGuidancePilot({
    mongoUri,
    apply: true,
    backupDir: tempBackupDir,
    quiet: true
  });
  const validBackupFile = cleanApply.backupFilePath;

  // 7.1: Clean rollback
  const rollbackRes = await patchGuidancePilot({
    mongoUri,
    rollbackFile: validBackupFile,
    quiet: true
  });
  assert.strictEqual(rollbackRes.success, true);
  assert.strictEqual(rollbackRes.mode, 'rollback-applied');
  assert.strictEqual(rollbackRes.restoredCount, 5);

  // Check restored values
  for (const id of PILOT_SCHEME_IDS) {
    const restored = await Scheme.findOne({ id }).lean();
    assert.deepStrictEqual(restored.applicationSteps, ['Legacy step 1 for test', 'Legacy step 2 for test']);
  }
  console.log('[PASS] Clean rollback restores original applicationSteps accurately.');

  // 7.2: Rollback Guard when a subsequent legitimate edit occurred
  // Re-apply pilot update
  await patchGuidancePilot({
    mongoUri,
    apply: true,
    backupDir: tempBackupDir,
    quiet: true
  });

  // Simulate subsequent edit after pilot update on agri-soil-health-card
  await Scheme.updateOne(
    { id: 'agri-soil-health-card' },
    { $set: { applicationSteps: ['New official step from Ministry released tomorrow'] } }
  );

  // Rollback must refuse to overwrite subsequent edit!
  await assert.rejects(
    async () => {
      await patchGuidancePilot({
        mongoUri,
        rollbackFile: validBackupFile,
        quiet: true
      });
    },
    /Rollback guard tripped for 'agri-soil-health-card': Current applicationSteps in database do not match proposed pilot steps/,
    'Rollback guard must abort if current values do not match proposed pilot values'
  );
  // 7.3: Backup file validation tests (missing and corrupted backups)
  await assert.rejects(
    async () => {
      await patchGuidancePilot({
        mongoUri,
        rollbackFile: path.join(tempBackupDir, 'guidance_pilot_backup_nonexistent.json'),
        backupDir: tempBackupDir,
        quiet: true
      });
    },
    /Rollback aborted: Backup file not found/,
    'Must fail closed when backup file is missing'
  );

  const corruptFile = path.join(tempBackupDir, 'guidance_pilot_backup_corrupt.json');
  fs.writeFileSync(corruptFile, '{"notAnArray": true}', 'utf8');
  await assert.rejects(
    async () => {
      await patchGuidancePilot({
        mongoUri,
        rollbackFile: corruptFile,
        backupDir: tempBackupDir,
        quiet: true
      });
    },
    /Rollback aborted: Backup file must contain an array of exactly 5 scheme documents/,
    'Must fail closed when backup file structure is corrupt'
  );
  console.log('[PASS] Backup file validation and corrupt rollback rejection verified.\n');

  // 8. Test Rollback Path Confinement & Traversal Protection (Hardening 1)
  console.log('--- TEST 8: Rollback Path Confinement & Traversal Protection ---');
  // 8.1 Path traversal attempt (starts with .. outside backupDir)
  assert.throws(
    () => {
      validateRollbackPath('../../etc/passwd', tempBackupDir);
    },
    /Path traversal rejected/,
    'Must reject paths escaping backup directory'
  );

  // 8.2 Non-standard filename inside backupDir
  assert.throws(
    () => {
      validateRollbackPath(path.join(tempBackupDir, 'arbitrary_data.json'), tempBackupDir);
    },
    /Invalid backup filename/,
    'Must reject invalid backup filename pattern'
  );

  // 8.3 Relative traversal trick
  assert.throws(
    () => {
      validateRollbackPath(path.join(tempBackupDir, '..', 'guidance_pilot_backup_test.json'), tempBackupDir);
    },
    /Path traversal rejected/,
    'Must reject relative paths navigating out of backup directory'
  );

  // 8.4 Symlink traversal attempt (pointing outside backupDir)
  const symlinkBackupName = 'guidance_pilot_backup_symlink_test.json';
  const symlinkPath = path.join(tempBackupDir, symlinkBackupName);
  const outsideTarget = path.resolve('package.json');
  try {
    if (!fs.existsSync(tempBackupDir)) {
      fs.mkdirSync(tempBackupDir, { recursive: true });
    }
    if (fs.existsSync(symlinkPath)) {
      try { fs.unlinkSync(symlinkPath); } catch {}
    }
    fs.symlinkSync(outsideTarget, symlinkPath, 'file');
    assert.throws(
      () => {
        validateRollbackPath(symlinkPath, tempBackupDir);
      },
      /Symlink traversal rejected/,
      'Must reject symlink resolving outside authorized backups directory'
    );
    console.log('[PASS] Symlink traversal outside backup directory successfully rejected.');
  } catch (symlinkErr) {
    if (symlinkErr.code === 'EPERM' || symlinkErr.code === 'EACCES') {
      console.log('[SKIP] Symlink creation requires elevated permissions on this OS; symlink test skipped safely.');
    } else {
      throw symlinkErr;
    }
  } finally {
    if (fs.existsSync(symlinkPath)) {
      try { fs.unlinkSync(symlinkPath); } catch {}
    }
  }
  console.log('[PASS] Rollback path confinement and traversal attempts rejected.\n');

  // 9. Test Partial-Apply Recovery Message & State Preservation (Hardening 2)
  console.log('--- TEST 9: Partial-Apply Recovery Message & State Preservation ---');
  await seedDatabase(baselineSchemes);
  cleanupTestBackups();

  let partialError = null;
  try {
    await patchGuidancePilot({
      mongoUri,
      apply: true,
      backupDir: tempBackupDir,
      quiet: true,
      _onBeforeUpdate: async ({ targetId, modifiedCount }) => {
        // After 2 successful writes, simulate a concurrent modification on write 3
        if (modifiedCount === 2) {
          await Scheme.updateOne(
            { id: targetId },
            { $set: { applicationSteps: ['Simulated concurrent modification on scheme 3'] } },
            { timestamps: false }
          );
        }
      }
    });
  } catch (err) {
    partialError = err;
  }

  assert(partialError, 'Must throw error on partial apply failure');
  assert(
    partialError.message.includes('CRITICAL: Partial update failure after modifying 2 of 5 schemes'),
    'Error message must indicate exact number of modified schemes'
  );
  assert(
    partialError.message.includes('The database is in a partially applied state'),
    'Error message must state partially applied state'
  );
  assert(
    partialError.message.includes('Validated backup is available at:'),
    'Error message must provide backup file location'
  );
  assert(
    partialError.message.includes('The operator must manually inspect the database state before initiating rollback'),
    'Error message must instruct operator to inspect state'
  );
  assert(
    partialError.message.includes('Do not retry automatically'),
    'Error message must prohibit automatic retries'
  );

  // Verify that the database was indeed left in partial state without automatic rollback
  const scheme1 = await Scheme.findOne({ id: PILOT_SCHEME_IDS[0] }).lean();
  const scheme2 = await Scheme.findOne({ id: PILOT_SCHEME_IDS[1] }).lean();
  const scheme3 = await Scheme.findOne({ id: PILOT_SCHEME_IDS[2] }).lean();
  assert.deepStrictEqual(scheme1.applicationSteps, canonicalSteps.get(PILOT_SCHEME_IDS[0]), 'Scheme 1 was modified');
  assert.deepStrictEqual(scheme2.applicationSteps, canonicalSteps.get(PILOT_SCHEME_IDS[1]), 'Scheme 2 was modified');
  assert.notDeepStrictEqual(scheme3.applicationSteps, canonicalSteps.get(PILOT_SCHEME_IDS[2]), 'Scheme 3 was not updated to pilot');
  console.log('[PASS] Partial apply recovery message and partial state preservation verified.\n');

  // 10. Test Full-Document Fingerprint Sensitivity (Fix 1)
  console.log('--- TEST 10: Full-Document Fingerprint Sensitivity ---');
  await seedDatabase(baselineSchemes);
  const unrelated70 = await Scheme.find({ id: { $nin: PILOT_SCHEME_IDS } }).lean();
  assert.strictEqual(unrelated70.length, 70);
  const baselineHash = computeUnrelatedFingerprint(unrelated70);

  // 10.1: Mutation of description
  const mutatedDesc = unrelated70.map((d, i) => i === 0 ? { ...d, description: (d.description || '') + ' - mutated' } : d);
  assert.notStrictEqual(computeUnrelatedFingerprint(mutatedDesc), baselineHash, 'Must detect description mutation');

  // 10.2: Mutation of benefits
  const mutatedBenefits = unrelated70.map((d, i) => i === 0 ? { ...d, benefits: 'Mutated benefits' } : d);
  assert.notStrictEqual(computeUnrelatedFingerprint(mutatedBenefits), baselineHash, 'Must detect benefits mutation');

  // 10.3: Mutation of status
  const mutatedStatus = unrelated70.map((d, i) => i === 0 ? { ...d, status: 'Archived' } : d);
  assert.notStrictEqual(computeUnrelatedFingerprint(mutatedStatus), baselineHash, 'Must detect status mutation');

  // 10.4: Mutation of updatedAt
  const mutatedUpdatedAt = unrelated70.map((d, i) => i === 0 ? { ...d, updatedAt: new Date('2026-10-18T19:00:00Z') } : d);
  assert.notStrictEqual(computeUnrelatedFingerprint(mutatedUpdatedAt), baselineHash, 'Must detect updatedAt mutation');

  // 10.5: Mutation of nested eligibility rule
  const mutatedRule = unrelated70.map((d, i) => i === 0 ? { ...d, eligibilityRules: { ...d.eligibilityRules, ageMin: 99 } } : d);
  assert.notStrictEqual(computeUnrelatedFingerprint(mutatedRule), baselineHash, 'Must detect nested eligibilityRules mutation');

  // 10.6: Deterministic idempotency check
  assert.strictEqual(computeUnrelatedFingerprint(unrelated70), baselineHash, 'Must produce deterministic identical hash');
  console.log('[PASS] Full-document fingerprint sensitivity verified across all persisted fields.\n');

  // 11. Test Persistent Fingerprint Artifacts & Fail-Closed Validation (Part B)
  console.log('--- TEST 11: Persistent Fingerprint Artifacts & Fail-Closed Validation ---');
  await seedDatabase(baselineSchemes);
  cleanupTestBackups();

  // 11.1 Apply mode produces valid fingerprint artifact alongside backup
  const applyWithFingerprint = await patchGuidancePilot({
    mongoUri,
    apply: true,
    backupDir: tempBackupDir,
    quiet: true
  });
  assert(applyWithFingerprint.fingerprintFilePath, 'Apply mode must return fingerprintFilePath');
  assert(fs.existsSync(applyWithFingerprint.fingerprintFilePath), 'Fingerprint artifact must exist on disk');
  const validatedArtifact = validateFingerprintArtifact(applyWithFingerprint.fingerprintFilePath);
  assert.strictEqual(validatedArtifact.status, 'verified_unchanged');
  assert.strictEqual(validatedArtifact.preUpdateFingerprint, applyWithFingerprint.preFingerprint);
  assert.strictEqual(validatedArtifact.postUpdateFingerprint, applyWithFingerprint.postFingerprint);
  assert.strictEqual(validatedArtifact.preUpdateFingerprint, validatedArtifact.postUpdateFingerprint);
  assert.strictEqual(validatedArtifact.unrelatedCount, 70);
  assert.strictEqual(validatedArtifact.totalCatalogueCount, 75);
  console.log('[PASS] Fingerprint artifact successfully persisted alongside backup and validated on disk.');

  // 11.2 Unrelated scheme modification during write fails closed
  await seedDatabase(baselineSchemes);
  cleanupTestBackups();
  await assert.rejects(
    async () => {
      await patchGuidancePilot({
        mongoUri,
        apply: true,
        backupDir: tempBackupDir,
        quiet: true,
        _onBeforeUpdate: async ({ modifiedCount }) => {
          if (modifiedCount === 1) {
            // Modify an unrelated scheme during the write phase
            const firstUnrelated = await Scheme.findOne({ id: { $nin: PILOT_SCHEME_IDS } });
            await Scheme.updateOne(
              { _id: firstUnrelated._id },
              { $set: { department: 'Mutated Department by Concurrent Rogue Job' } },
              { timestamps: false }
            );
          }
        }
      });
    },
    /Integrity violation: Deterministic fingerprint of the other 70 schemes changed!/,
    'Must fail closed when any unrelated record changes during update'
  );
  console.log('[PASS] Concurrent or mid-update mutation of unrelated scheme trips integrity violation.');

  // 11.3 Missing fingerprint artifact fails closed
  assert.throws(
    () => {
      validateFingerprintArtifact(path.join(tempBackupDir, 'nonexistent_fingerprint.json'));
    },
    /Fingerprint artifact validation failed: File not found/,
    'Missing fingerprint artifact must fail closed'
  );

  // 11.4 Corrupt JSON fingerprint artifact fails closed
  const corruptFingerprintPath = path.join(tempBackupDir, 'corrupt_fingerprint.json');
  fs.writeFileSync(corruptFingerprintPath, '{ invalid json content !!!', 'utf8');
  assert.throws(
    () => {
      validateFingerprintArtifact(corruptFingerprintPath);
    },
    /contains corrupt JSON/,
    'Corrupt JSON fingerprint artifact must fail closed'
  );

  // 11.5 Missing preUpdateFingerprint hash fails closed
  const missingHashFingerprintPath = path.join(tempBackupDir, 'missing_hash_fingerprint.json');
  fs.writeFileSync(missingHashFingerprintPath, JSON.stringify({ status: 'pending_write' }), 'utf8');
  assert.throws(
    () => {
      validateFingerprintArtifact(missingHashFingerprintPath);
    },
    /Missing or invalid preUpdateFingerprint/,
    'Fingerprint artifact missing valid 64-hex hash must fail closed'
  );

  // 11.6 Mismatched pre/post fingerprint in verified artifact fails closed
  const mismatchedFingerprintPath = path.join(tempBackupDir, 'mismatched_fingerprint.json');
  fs.writeFileSync(
    mismatchedFingerprintPath,
    JSON.stringify({
      status: 'verified_unchanged',
      preUpdateFingerprint: 'a'.repeat(64),
      postUpdateFingerprint: 'b'.repeat(64)
    }),
    'utf8'
  );
  assert.throws(
    () => {
      validateFingerprintArtifact(mismatchedFingerprintPath);
    },
    /preUpdateFingerprint does not match postUpdateFingerprint/,
    'Mismatched pre/post hashes in verified artifact must fail closed'
  );
  console.log('[PASS] Missing, corrupt, or invalid fingerprint artifacts fail closed as expected.\n');

  console.log('================================================================');
  console.log('ALL GUIDANCE PILOT PATCH TESTS PASSED (100%)');
  console.log('================================================================');

} finally {
  cleanupTestBackups();
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
}
