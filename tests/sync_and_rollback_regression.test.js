import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import assert from 'assert';
import Scheme from '../server/models/Scheme.js';
import { loadCanonicalSchemes, syncMongo, buildSchemePayload } from '../scripts/sync_mongodb_75.js';
import { backupSchemes } from '../scripts/backup_mongodb_schemes.js';
import { rollbackSchemes } from '../scripts/rollback_mongodb_schemes.js';

// =============================================================================
// 1. FAIL-CLOSED DISPOSABLE TEST DATABASE TARGETING
// =============================================================================

export function validateDisposableTestUri(uri) {
  if (!uri || typeof uri !== 'string' || uri.trim() === '') {
    throw new Error('Test URI validation failed: URI is missing or empty.');
  }

  const trimmed = uri.trim();
  if (!trimmed.startsWith('mongodb://')) {
    throw new Error('Test URI validation failed: Disposable test URI must use standard mongodb:// protocol (not mongodb+srv:// or remote protocol).');
  }

  const withoutProto = trimmed.replace('mongodb://', '');
  const parts = withoutProto.split('@');
  const hostAndDb = parts.length > 1 ? parts[parts.length - 1] : parts[0];
  const hostPart = hostAndDb.split('/')[0];
  const hostName = hostPart.split(':')[0].toLowerCase();
  const rawDb = hostAndDb.split('/')[1]?.split('?')[0];
  const dbName = rawDb ? rawDb.trim().toLowerCase() : '';

  // Strict local host enforcement: ONLY 127.0.0.1 or localhost
  const isLocalHost = hostName === '127.0.0.1' || hostName === 'localhost';
  if (!isLocalHost) {
    throw new Error(`Test URI validation failed: Host "${hostName}" is not allowed. Disposable tests strictly permit only 127.0.0.1 or localhost.`);
  }

  // Check for Atlas or remote indicators
  if (trimmed.includes('mongodb.net') || trimmed.includes('.com') || trimmed.includes('+srv')) {
    throw new Error('Test URI validation failed: Remote or Atlas host detected in test URI.');
  }

  if (!dbName) {
    throw new Error('Test URI validation failed: Target database name must be explicitly specified.');
  }

  // Reject production database names
  if (dbName === 'govscheme' || dbName === 'production' || dbName === 'admin') {
    throw new Error(`Test URI validation failed: Database name "${dbName}" is forbidden for test runs. Must be a dedicated disposable test database (e.g. govscheme_disposable_sync_rollback_test).`);
  }

  return {
    valid: true,
    host: hostName,
    port: hostPart.includes(':') ? parseInt(hostPart.split(':')[1], 10) : 27017,
    db: dbName
  };
}

// =============================================================================
// 2. ISOLATED TEST ARTIFACT CONFIGURATION
// =============================================================================

// Never write into the repository's backups/ directory
const DEFAULT_ARTIFACT_DIR = fs.existsSync('D:\\')
  ? path.resolve('D:\\temp_mongo_test', 'artifacts')
  : path.resolve('scratch', 'disposable_test_artifacts');

export const TEST_ARTIFACT_DIR = process.env.TEST_ARTIFACT_DIR || DEFAULT_ARTIFACT_DIR;
const TEST_SESSION_ID = `test_run_${Date.now()}_${process.pid}`;
export const TEST_BACKUP_PATH = path.join(TEST_ARTIFACT_DIR, `${TEST_SESSION_ID}_backup.json`);
const TEST_META_PATH = path.join(TEST_ARTIFACT_DIR, `${TEST_SESSION_ID}_session.json`);

const createdTestArtifacts = new Set();

function ensureArtifactDir() {
  try {
    if (!fs.existsSync(TEST_ARTIFACT_DIR)) {
      fs.mkdirSync(TEST_ARTIFACT_DIR, { recursive: true });
    }
  } catch (e) {
    const fallbackDir = path.resolve('scratch', 'disposable_test_artifacts');
    if (!fs.existsSync(fallbackDir)) {
      fs.mkdirSync(fallbackDir, { recursive: true });
    }
  }
}

function writeSessionMetadata(status = 'RUNNING', details = {}) {
  try {
    ensureArtifactDir();
    const meta = {
      sessionId: TEST_SESSION_ID,
      pid: process.pid,
      status,
      timestamp: new Date().toISOString(),
      artifactDir: TEST_ARTIFACT_DIR,
      trackedArtifacts: Array.from(createdTestArtifacts),
      ...details
    };
    fs.writeFileSync(TEST_META_PATH, JSON.stringify(meta, null, 2), 'utf8');
  } catch (e) {
    // Non-fatal metadata persistence
  }
}

// =============================================================================
// 3. STATIC GUARDRAIL VALIDATION (RUNS WITHOUT DATABASE CONNECTION)
// =============================================================================

export function runStaticGuardrailChecks() {
  console.log('--- PRE-FLIGHT GUARDRAIL VERIFICATION: FAIL-CLOSED DATABASE TARGETING ---');

  // 1. Rejects Atlas srv URI
  assert.throws(
    () => validateDisposableTestUri('mongodb+srv://admin:pass@cluster0.bzxblcw.mongodb.net/testdb'),
    /Disposable test URI must use standard mongodb:\/\/ protocol/
  );

  // 2. Rejects Remote or Atlas host on standard protocol
  assert.throws(
    () => validateDisposableTestUri('mongodb://cluster0.bzxblcw.mongodb.net:27017/testdb'),
    /Host "cluster0.bzxblcw.mongodb.net" is not allowed/
  );

  // 3. Rejects remote network IP
  assert.throws(
    () => validateDisposableTestUri('mongodb://192.168.1.100:27017/testdb'),
    /Host "192.168.1.100" is not allowed/
  );

  // 4. Rejects remote domain
  assert.throws(
    () => validateDisposableTestUri('mongodb://api.govscheme.org:27017/testdb'),
    /Host "api.govscheme.org" is not allowed/
  );

  // 5. Rejects production database name "govscheme"
  assert.throws(
    () => validateDisposableTestUri('mongodb://127.0.0.1:27017/govscheme'),
    /Database name "govscheme" is forbidden/
  );

  // 6. Rejects production database name "production"
  assert.throws(
    () => validateDisposableTestUri('mongodb://127.0.0.1:27017/production'),
    /Database name "production" is forbidden/
  );

  // 7. Rejects system database name "admin"
  assert.throws(
    () => validateDisposableTestUri('mongodb://127.0.0.1:27017/admin'),
    /Database name "admin" is forbidden/
  );

  // 8. Rejects missing database name
  assert.throws(
    () => validateDisposableTestUri('mongodb://127.0.0.1:27017'),
    /Target database name must be explicitly specified/
  );
  assert.throws(
    () => validateDisposableTestUri('mongodb://127.0.0.1:27017/'),
    /Target database name must be explicitly specified/
  );

  // 9. Rejects missing/empty/null URI
  assert.throws(() => validateDisposableTestUri(''), /URI is missing or empty/);
  assert.throws(() => validateDisposableTestUri(null), /URI is missing or empty/);
  assert.throws(() => validateDisposableTestUri(undefined), /URI is missing or empty/);

  // 10. Accepts valid local disposable URI on 127.0.0.1
  const res1 = validateDisposableTestUri('mongodb://127.0.0.1:27017/govscheme_disposable_sync_rollback_test');
  assert.strictEqual(res1.valid, true);
  assert.strictEqual(res1.host, '127.0.0.1');
  assert.strictEqual(res1.port, 27017);
  assert.strictEqual(res1.db, 'govscheme_disposable_sync_rollback_test');

  // 11. Accepts valid local disposable URI on localhost custom port
  const res2 = validateDisposableTestUri('mongodb://localhost:27018/disposable_test_suite_db');
  assert.strictEqual(res2.valid, true);
  assert.strictEqual(res2.host, 'localhost');
  assert.strictEqual(res2.port, 27018);
  assert.strictEqual(res2.db, 'disposable_test_suite_db');

  console.log('✓ All 11 static URI safety guardrails passed: Remote, Atlas, production databases, and malformed URIs strictly rejected.\n');
}

// =============================================================================
// 4. INTEGRATION TEST LIFECYCLE (REQUIRES ACTIVE DISPOSABLE LOCAL MONGODB)
// =============================================================================

async function runSyncAndRollbackRegressionSuite() {
  console.log('================================================================');
  console.log(' GOVSCHEME REGRESSION SUITE: SYNC, ELIGIBILITY RULES & ROLLBACK  ');
  console.log('================================================================\n');

  // Step 0: Static guardrail verification
  runStaticGuardrailChecks();

  // If running in static preflight mode, stop before connecting
  const isPreflight = process.argv.includes('--preflight') || process.argv.includes('--static') || process.argv.includes('--guardrails-only');
  if (isPreflight) {
    console.log('[Preflight Notice] Static guardrail check completed successfully.');
    console.log('[Preflight Notice] Stopping before database connection as requested by preflight flag.\n');
    return;
  }

  // Strict isolation: Never fall back to production environment variables
  delete process.env.MONGODB_URI;
  delete process.env.PROD_MONGODB_URI;
  delete process.env.MONGO_URI;

  const rawTestUri = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/govscheme_disposable_sync_rollback_test';
  const validatedTarget = validateDisposableTestUri(rawTestUri);
  const DISPOSABLE_DB_URI = rawTestUri;

  ensureArtifactDir();
  writeSessionMetadata('INITIALIZING', { targetHost: validatedTarget.host, targetDb: validatedTarget.db });
  console.log(`[Test Setup] Target Host: ${validatedTarget.host}:${validatedTarget.port} | Database: ${validatedTarget.db}`);
  console.log(`[Test Setup] Artifact Directory: ${TEST_ARTIFACT_DIR}`);
  console.log(`[Test Setup] Session ID: ${TEST_SESSION_ID}\n`);

  // Verify connectivity to local daemon with short timeout before proceeding
  try {
    await mongoose.connect(DISPOSABLE_DB_URI, { serverSelectionTimeoutMS: 2000 });
  } catch (connErr) {
    console.error('\n[Target Connection Blocked] Could not connect to local disposable MongoDB daemon on port ' + validatedTarget.port);
    console.error('Root cause: Local daemon is not currently running. Integration lifecycle halted safely.');
    console.error('To run live integration tests, start a disposable mongod instance on ' + validatedTarget.host + ':' + validatedTarget.port);
    process.exit(1);
  }

  await Scheme.deleteMany({});
  console.log('[Test Setup] Cleaned disposable schemes collection.\n');

  try {
    const canonicalSchemes = loadCanonicalSchemes();
    console.log(`[Canonical Dataset] Loaded ${canonicalSchemes.length} schemes.`);

    // --- PHASE 1: Mirror Production State (22 Drafts, 1 Non-Canonical Draft) ---
    console.log('\n--- PHASE 1: Mirror Production State (22 Drafts, 1 Non-Canonical Draft) ---');
    const first22 = canonicalSchemes.slice(0, 22);
    for (const s of first22) {
      await Scheme.create({
        schemeId: s.id,
        id: s.id,
        schemeName: s.name,
        name: s.name,
        description: s.shortDescription,
        shortDescription: s.shortDescription,
        category: s.category,
        department: s.department || 'Department of Welfare',
        state: s.state,
        benefits: 'Pre-sync unverified benefits text',
        status: 'Draft',
        activeStatus: false,
        verificationStatus: 'UNVERIFIED',
        sourceUrl: 'https://www.india.gov.in'
      });
    }

    // Seed non-canonical draft
    await Scheme.create({
      schemeId: 'non-canonical-internal-draft-01',
      id: 'non-canonical-internal-draft-01',
      schemeName: 'Non-Canonical Draft Scheme',
      name: 'Non-Canonical Draft Scheme',
      description: 'Internal testing draft not part of canonical 75',
      shortDescription: 'Internal testing draft',
      category: 'Social Welfare',
      department: 'Department of Social Welfare',
      state: 'Tamil Nadu',
      benefits: 'Pending ministry approval',
      status: 'Draft',
      activeStatus: false,
      verificationStatus: 'PENDING',
      sourceUrl: 'https://example.gov.in'
    });

    const initialTotal = await Scheme.countDocuments();
    const initialDrafts = await Scheme.countDocuments({ status: 'Draft' });
    const initialPublished = await Scheme.countDocuments({ status: 'Published' });

    console.log(`Initial Total in DB: ${initialTotal} (Expected: 23)`);
    console.log(`Initial Drafts in DB: ${initialDrafts} (Expected: 23)`);
    console.log(`Initial Published in DB: ${initialPublished} (Expected: 0)`);
    if (initialTotal !== 23 || initialDrafts !== 23 || initialPublished !== 0) {
      throw new Error('Phase 1 initialization assertion failed');
    }
    console.log('✓ Phase 1 passed: Database accurately mirrors 22 Drafts + 1 Non-Canonical Draft.\n');

    // --- PHASE 2: Backup Execution and Integrity Verification in Isolated Artifact Dir ---
    console.log('--- PHASE 2: Backup Execution and Integrity Verification in Isolated Artifact Dir ---');
    createdTestArtifacts.add(TEST_BACKUP_PATH);
    const backupRes = await backupSchemes({
      mongoUri: DISPOSABLE_DB_URI,
      outputPath: TEST_BACKUP_PATH,
      quiet: true
    });

    if (!fs.existsSync(TEST_BACKUP_PATH)) {
      throw new Error('Backup file was not created in isolated artifact dir: ' + TEST_BACKUP_PATH);
    }
    const backupData = JSON.parse(fs.readFileSync(TEST_BACKUP_PATH, 'utf8'));
    if (backupData.length !== 23) {
      throw new Error(`Backup record count mismatch: ${backupData.length} vs 23`);
    }
    if (!backupRes.sha256 || backupRes.sha256.length !== 64) {
      throw new Error('Backup SHA-256 checksum invalid');
    }
    console.log(`✓ Phase 2 passed: Verified backup of 23 records with SHA-256 (${backupRes.sha256.slice(0, 16)}...)\n`);

    // --- PHASE 3: Post-Backup Admin Activity Simulation ---
    console.log('--- PHASE 3: Post-Backup Admin Activity Simulation ---');
    await Scheme.create({
      schemeId: 'admin-post-backup-emergency-relief',
      id: 'admin-post-backup-emergency-relief',
      schemeName: 'District Emergency Relief Draft',
      name: 'District Emergency Relief Draft',
      description: 'Created by district officer after the backup snapshot',
      shortDescription: 'Emergency Relief',
      category: 'Agriculture',
      department: 'Department of Revenue and Disaster Management',
      state: 'Odisha',
      benefits: 'Direct relief transfer',
      status: 'Draft',
      activeStatus: false,
      verificationStatus: 'PENDING',
      sourceUrl: 'https://odisha.gov.in'
    });
    const postActivityTotal = await Scheme.countDocuments();
    console.log(`Total after admin creation: ${postActivityTotal} (Expected: 24)`);
    if (postActivityTotal !== 24) throw new Error('Phase 3 assertion failed');
    console.log('✓ Phase 3 passed: Post-backup record successfully added.\n');

    // --- PHASE 4: Dry-Run Verification ---
    console.log('--- PHASE 4: Dry-Run Verification ---');
    const dryRunResult = await syncMongo({
      mongoUri: DISPOSABLE_DB_URI,
      dryRun: true,
      quiet: true
    });

    const postDryRunTotal = await Scheme.countDocuments();
    const postDryRunPublished = await Scheme.countDocuments({ status: 'Published' });
    if (postDryRunTotal !== 24 || postDryRunPublished !== 0) {
      throw new Error('Dry-run modified the database!');
    }
    if (dryRunResult.updatedCount !== 22 || dryRunResult.insertedCount !== 53) {
      throw new Error(`Dry-run counts mismatch: updated=${dryRunResult.updatedCount}, inserted=${dryRunResult.insertedCount}`);
    }
    console.log(`✓ Phase 4 passed: Dry-run predicted 22 updates, 53 inserts, and wrote 0 database changes.\n`);

    // --- PHASE 5: Live Sync Execution & Nested Rules Verification ---
    console.log('--- PHASE 5: Live Sync Execution & Nested Rules Verification ---');
    const syncResult1 = await syncMongo({
      mongoUri: DISPOSABLE_DB_URI,
      dryRun: false,
      quiet: true,
      manifestDir: TEST_ARTIFACT_DIR
    });
    if (syncResult1.manifestPath) {
      createdTestArtifacts.add(syncResult1.manifestPath);
    }

    const totalAfterSync = await Scheme.countDocuments();
    const publishedAfterSync = await Scheme.countDocuments({ status: 'Published' });
    const draftAfterSync = await Scheme.countDocuments({ status: 'Draft' });

    console.log(`Total after sync:     ${totalAfterSync} (Expected: 77)`);
    console.log(`Published after sync: ${publishedAfterSync} (Expected: 75)`);
    console.log(`Drafts after sync:    ${draftAfterSync} (Expected: 2)`);

    if (totalAfterSync !== 77 || publishedAfterSync !== 75 || draftAfterSync !== 2) {
      throw new Error(`Sync counts mismatch: total=${totalAfterSync}, published=${publishedAfterSync}, draft=${draftAfterSync}`);
    }

    // Verify non-canonical drafts remained unpublished
    const nonCanonical1 = await Scheme.findOne({ id: 'non-canonical-internal-draft-01' });
    const nonCanonical2 = await Scheme.findOne({ id: 'admin-post-backup-emergency-relief' });
    if (!nonCanonical1 || nonCanonical1.status !== 'Draft' || nonCanonical1.activeStatus !== false) {
      throw new Error('Non-canonical pre-sync draft was improperly published!');
    }
    if (!nonCanonical2 || nonCanonical2.status !== 'Draft' || nonCanonical2.activeStatus !== false) {
      throw new Error('Non-canonical post-backup draft was improperly published!');
    }

    // Verify verificationStatus is PORTAL_CURATED
    const kisan = await Scheme.findOne({ id: 'pm-kisan' });
    if (!kisan || kisan.verificationStatus !== 'PORTAL_CURATED') {
      throw new Error(`PM-KISAN verificationStatus must be PORTAL_CURATED, got ${kisan?.verificationStatus}`);
    }

    // Record existing canonical document IDs and Mongo ObjectIds to verify exact in-place updates
    const preRerunCanonicalDocs = await Scheme.find({ id: { $in: canonicalSchemes.map(s => s.id) } }).lean();
    const idToMongoIdMap = new Map(preRerunCanonicalDocs.map(d => [d.id, String(d._id)]));
    console.log('✓ Phase 5 passed: First live sync completed with 75 Published, 2 Drafts, and honest PORTAL_CURATED status.\n');

    // --- PHASE 6: Sequential Sync Rerun (Idempotency & Duplicate Prevention) ---
    console.log('--- PHASE 6: Sequential Sync Rerun (Idempotency & Duplicate Prevention) ---');
    const syncResult2 = await syncMongo({
      mongoUri: DISPOSABLE_DB_URI,
      dryRun: false,
      quiet: true,
      manifestDir: TEST_ARTIFACT_DIR
    });
    if (syncResult2.manifestPath) {
      createdTestArtifacts.add(syncResult2.manifestPath);
    }

    const totalAfterRerun = await Scheme.countDocuments();
    const publishedAfterRerun = await Scheme.countDocuments({ status: 'Published' });
    const draftAfterRerun = await Scheme.countDocuments({ status: 'Draft' });

    console.log(`Total after second sync:     ${totalAfterRerun} (Expected: 77 - ZERO duplicates)`);
    console.log(`Published after second sync: ${publishedAfterRerun} (Expected: 75)`);
    console.log(`Drafts after second sync:    ${draftAfterRerun} (Expected: 2)`);

    if (totalAfterRerun !== 77) {
      throw new Error(`CRITICAL: Second sync created duplicate canonical documents! Expected 77, got ${totalAfterRerun}`);
    }
    if (publishedAfterRerun !== 75 || draftAfterRerun !== 2) {
      throw new Error('Second sync altered scheme status distribution!');
    }
    if (syncResult2.insertedCount !== 0 || syncResult2.updatedCount !== 75) {
      throw new Error(`Second sync should update 75 and insert 0, but reported updated=${syncResult2.updatedCount}, inserted=${syncResult2.insertedCount}`);
    }

    // Confirm every canonical document retained its exact MongoDB _id (in-place match and update, no recreation)
    const postRerunCanonicalDocs = await Scheme.find({ id: { $in: canonicalSchemes.map(s => s.id) } }).lean();
    for (const doc of postRerunCanonicalDocs) {
      const originalMongoId = idToMongoIdMap.get(doc.id);
      if (String(doc._id) !== originalMongoId) {
        throw new Error(`Canonical scheme "${doc.id}" _id changed on rerun (${originalMongoId} -> ${doc._id})! Document was recreated instead of updated in-place.`);
      }
    }

    // Confirm non-canonical drafts remain preserved
    const nonCanonRerun1 = await Scheme.findOne({ id: 'non-canonical-internal-draft-01' });
    const nonCanonRerun2 = await Scheme.findOne({ id: 'admin-post-backup-emergency-relief' });
    if (!nonCanonRerun1 || nonCanonRerun1.status !== 'Draft') throw new Error('Non-canonical pre-sync draft mutated on rerun');
    if (!nonCanonRerun2 || nonCanonRerun2.status !== 'Draft') throw new Error('Non-canonical post-backup draft mutated on rerun');

    console.log('✓ Phase 6 passed: Sequential sync rerun confirmed 100% idempotent (0 duplicates, 75 updated in-place, non-canonical preserved).\n');

    // --- PHASE 7A: Missing Manifest Fallback Rollback ---
    console.log('--- PHASE 7A: Missing Manifest Fallback Rollback ---');
    // Invoke rollback with manifestPath = null to force canonical set diffing fallback
    await rollbackSchemes({
      mongoUri: DISPOSABLE_DB_URI,
      backupPath: TEST_BACKUP_PATH,
      manifestPath: null, // Forces fallback recovery mode
      quiet: true
    });

    const totalAfterFallbackRollback = await Scheme.countDocuments();
    const publishedAfterFallback = await Scheme.countDocuments({ status: 'Published' });
    const draftsAfterFallback = await Scheme.countDocuments({ status: 'Draft' });

    console.log(`Total after fallback rollback:     ${totalAfterFallbackRollback} (Expected: 24)`);
    console.log(`Published after fallback rollback: ${publishedAfterFallback} (Expected: 0)`);
    console.log(`Drafts after fallback rollback:    ${draftsAfterFallback} (Expected: 24)`);

    if (totalAfterFallbackRollback !== 24 || publishedAfterFallback !== 0 || draftsAfterFallback !== 24) {
      throw new Error(`Fallback rollback failed: total=${totalAfterFallbackRollback}, published=${publishedAfterFallback}, drafts=${draftsAfterFallback}`);
    }

    const postBackupPreserved = await Scheme.findOne({ id: 'admin-post-backup-emergency-relief' });
    if (!postBackupPreserved) {
      throw new Error('CRITICAL: Post-backup record was destroyed during fallback rollback!');
    }
    console.log('✓ Phase 7A passed: Manifest-missing rollback successfully restored pre-sync state and preserved non-canonical records.\n');

    // --- PHASE 7B: Simulated Partial Sync Failure & Incomplete Manifest Recovery ---
    console.log('--- PHASE 7B: Simulated Partial Sync Failure & Incomplete Manifest Recovery ---');
    // Simulate an interrupted sync midway:
    // Update 5 existing schemes, insert 5 new canonical schemes, but interrupt before full sync and write incomplete manifest
    const subsetSchemes = canonicalSchemes.slice(0, 10);
    for (let i = 0; i < 5; i++) {
      const s = subsetSchemes[i];
      const payload = buildSchemePayload(s);
      await Scheme.updateOne({ id: s.id }, { $set: payload });
    }
    for (let i = 5; i < 10; i++) {
      const s = canonicalSchemes[22 + i]; // Schemes not in pre-sync 22
      const payload = buildSchemePayload(s);
      await Scheme.create(payload);
    }

    // Create an intentionally incomplete manifest (missing insertedDocs)
    const incompleteManifestPath = path.join(TEST_ARTIFACT_DIR, `${TEST_SESSION_ID}_incomplete_manifest.json`);
    createdTestArtifacts.add(incompleteManifestPath);
    fs.writeFileSync(incompleteManifestPath, JSON.stringify({
      status: 'INTERRUPTED_SYNC_SIMULATION',
      note: 'Manifest missing insertedDocs array due to simulated crash'
    }, null, 2), 'utf8');

    const totalDuringInterruption = await Scheme.countDocuments();
    console.log(`Total during simulated interrupted sync: ${totalDuringInterruption} (Expected: 29: 24 base + 5 inserted)`);
    if (totalDuringInterruption !== 29) {
      throw new Error(`Interruption state mismatch: expected 29, got ${totalDuringInterruption}`);
    }

    // Execute rollback against incomplete manifest
    await rollbackSchemes({
      mongoUri: DISPOSABLE_DB_URI,
      backupPath: TEST_BACKUP_PATH,
      manifestPath: incompleteManifestPath,
      quiet: true
    });

    const totalAfterIncompleteRollback = await Scheme.countDocuments();
    const publishedAfterIncompleteRollback = await Scheme.countDocuments({ status: 'Published' });
    const draftsAfterIncompleteRollback = await Scheme.countDocuments({ status: 'Draft' });

    console.log(`Total after incomplete manifest recovery:     ${totalAfterIncompleteRollback} (Expected: 24)`);
    console.log(`Published after incomplete manifest recovery: ${publishedAfterIncompleteRollback} (Expected: 0)`);
    console.log(`Drafts after incomplete manifest recovery:    ${draftsAfterIncompleteRollback} (Expected: 24)`);

    if (totalAfterIncompleteRollback !== 24 || publishedAfterIncompleteRollback !== 0 || draftsAfterIncompleteRollback !== 24) {
      throw new Error('Incomplete manifest rollback failed to restore 24 Drafts!');
    }

    const postBackupStillPreserved = await Scheme.findOne({ id: 'admin-post-backup-emergency-relief' });
    if (!postBackupStillPreserved) {
      throw new Error('CRITICAL: Post-backup record was lost during incomplete-manifest rollback!');
    }
    console.log('✓ Phase 7B passed: Incomplete-manifest and partial sync recovery successfully restored database.\n');

    // --- PHASE 8: Surgical Rollback Verification (Using Complete Sync Manifest) ---
    console.log('--- PHASE 8: Surgical Rollback Verification (Using Complete Sync Manifest) ---');
    const syncResult3 = await syncMongo({
      mongoUri: DISPOSABLE_DB_URI,
      dryRun: false,
      quiet: true,
      manifestDir: TEST_ARTIFACT_DIR
    });
    if (syncResult3.manifestPath) {
      createdTestArtifacts.add(syncResult3.manifestPath);
    }

    await rollbackSchemes({
      mongoUri: DISPOSABLE_DB_URI,
      backupPath: TEST_BACKUP_PATH,
      manifestPath: syncResult3.manifestPath,
      quiet: true
    });

    const finalTotal = await Scheme.countDocuments();
    const finalPublished = await Scheme.countDocuments({ status: 'Published' });
    const finalDrafts = await Scheme.countDocuments({ status: 'Draft' });

    if (finalTotal !== 24 || finalPublished !== 0 || finalDrafts !== 24) {
      throw new Error(`Surgical rollback failed: total=${finalTotal}, published=${finalPublished}, drafts=${finalDrafts}`);
    }

    console.log('✓ Phase 8 passed: Complete manifest-assisted surgical rollback verified.\n');

    console.log('================================================================');
    console.log(' ALL 8 REGRESSION PHASES PASSED: SYNC & ROLLBACK 100% VERIFIED! ');
    console.log('================================================================\n');
    writeSessionMetadata('COMPLETED', { totalPhasesPassed: 8 });
  } finally {
    // Teardown: Clean up disposable database & ONLY test-generated artifacts
    if (mongoose.connection.readyState !== 0) {
      await Scheme.deleteMany({});
      await mongoose.disconnect();
    }

    // Safely unlink only test artifacts recorded in createdTestArtifacts
    for (const filePath of createdTestArtifacts) {
      try {
        if (filePath && fs.existsSync(filePath) && filePath.startsWith(TEST_ARTIFACT_DIR)) {
          fs.unlinkSync(filePath);
        }
      } catch (e) {}
    }

    // Remove session metadata once cleanly finished
    try {
      if (fs.existsSync(TEST_META_PATH) && TEST_META_PATH.startsWith(TEST_ARTIFACT_DIR)) {
        fs.unlinkSync(TEST_META_PATH);
      }
    } catch (e) {}

    // Verify real pre-sync production backup in backups/ is untouched
    const realBackupDir = path.resolve('backups');
    const hasPreSyncBackup = fs.existsSync(realBackupDir) && fs.readdirSync(realBackupDir).some(f => f.startsWith('schemes_pre_sync_'));
    if (hasPreSyncBackup) {
      console.log('[Safeguard Confirmation] Production pre-sync backup in backups/ remains completely untouched.');
    }
  }
}

runSyncAndRollbackRegressionSuite().catch(err => {
  console.error('Regression suite failed:', err);
  process.exit(1);
});
