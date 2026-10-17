import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import Scheme from '../server/models/Scheme.js';
import { loadCanonicalSchemes, syncMongo } from '../scripts/sync_mongodb_75.js';
import { backupSchemes } from '../scripts/backup_mongodb_schemes.js';
import { rollbackSchemes } from '../scripts/rollback_mongodb_schemes.js';

const DISPOSABLE_DB_URI = 'mongodb://127.0.0.1:27017/govscheme_disposable_sync_rollback_test';
const TEST_BACKUP_PATH = path.resolve('backups', 'test_disposable_pre_sync_backup.json');

async function runSyncAndRollbackRegressionSuite() {
  console.log('================================================================');
  console.log(' GOVSCHEME REGRESSION SUITE: SYNC, ELIGIBILITY RULES & ROLLBACK  ');
  console.log('================================================================\n');

  console.log(`[Test Setup] Connecting to disposable database: ${DISPOSABLE_DB_URI}`);
  await mongoose.connect(DISPOSABLE_DB_URI);
  await Scheme.deleteMany({});
  console.log('[Test Setup] Cleaned disposable schemes collection.\n');

  let syncResult = null;
  try {
    const canonicalSchemes = loadCanonicalSchemes();
    console.log(`[Canonical Dataset] Loaded ${canonicalSchemes.length} schemes.`);

    // --- STEP 1: Seed 22 Canonical Drafts & 1 Non-Canonical Draft ---
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
        verificationStatus: 'Unverified',
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
      verificationStatus: 'Pending',
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

    // --- STEP 2: Execute and Verify Backup ---
    console.log('--- PHASE 2: Backup Execution and Integrity Verification ---');
    const backupRes = await backupSchemes({
      mongoUri: DISPOSABLE_DB_URI,
      outputPath: TEST_BACKUP_PATH,
      quiet: true
    });

    if (!fs.existsSync(TEST_BACKUP_PATH)) {
      throw new Error('Backup file was not created');
    }
    const backupData = JSON.parse(fs.readFileSync(TEST_BACKUP_PATH, 'utf8'));
    if (backupData.length !== 23) {
      throw new Error(`Backup record count mismatch: ${backupData.length} vs 23`);
    }
    if (!backupRes.sha256 || backupRes.sha256.length !== 64) {
      throw new Error('Backup SHA-256 checksum invalid');
    }
    console.log(`✓ Phase 2 passed: Verified backup of 23 records with SHA-256 (${backupRes.sha256.slice(0, 16)}...)\n`);

    // --- STEP 3: Simulate Post-Backup Admin Activity ---
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
      verificationStatus: 'Under Review',
      sourceUrl: 'https://odisha.gov.in'
    });
    const postActivityTotal = await Scheme.countDocuments();
    console.log(`Total after admin creation: ${postActivityTotal} (Expected: 24)`);
    if (postActivityTotal !== 24) throw new Error('Phase 3 assertion failed');
    console.log('✓ Phase 3 passed: Post-backup record successfully added.\n');

    // --- STEP 4: Execute Dry-Run First ---
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

    // --- STEP 5: Execute Fixed Sync Engine ---
    console.log('--- PHASE 5: Live Sync Execution & Nested Rules Verification ---');
    syncResult = await syncMongo({
      mongoUri: DISPOSABLE_DB_URI,
      dryRun: false,
      quiet: true
    });

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
    console.log('✓ Non-canonical drafts strictly remained in Draft / activeStatus=false status.');

    // Verify nested eligibilityRules on canonical schemes
    const kisan = await Scheme.findOne({ id: 'pm-kisan' });
    if (!kisan || !kisan.eligibilityRules) {
      throw new Error('PM-KISAN missing nested eligibilityRules');
    }
    if (!Array.isArray(kisan.eligibilityRules.allowedOccupations) || !kisan.eligibilityRules.allowedOccupations.includes('Farmer')) {
      throw new Error('PM-KISAN nested eligibilityRules.allowedOccupations missing Farmer');
    }
    if (kisan.status !== 'Published' || kisan.activeStatus !== true) {
      throw new Error('PM-KISAN not set to Published / activeStatus=true');
    }
    if (kisan.verificationStatus !== 'PORTAL_CURATED') {
      throw new Error(`PM-KISAN verificationStatus must be PORTAL_CURATED, got ${kisan.verificationStatus}`);
    }

    const educationScheme = await Scheme.findOne({ id: 'edu-tn-tamil-puthalvan' });
    if (!educationScheme || !educationScheme.eligibilityRules) {
      throw new Error('edu-tn-tamil-puthalvan missing nested eligibilityRules');
    }
    if (educationScheme.status !== 'Published') {
      throw new Error('edu-tn-tamil-puthalvan not published');
    }
    if (educationScheme.verificationStatus !== 'PORTAL_CURATED') {
      throw new Error(`edu-tn-tamil-puthalvan verificationStatus must be PORTAL_CURATED, got ${educationScheme.verificationStatus}`);
    }
    console.log('✓ Canonical schemes contain complete nested eligibilityRules, Published status, and honest PORTAL_CURATED verification status.\n');

    // --- STEP 6: Execute Surgical Rollback ---
    console.log('--- PHASE 6: Surgical Rollback Verification (Using Sync Manifest) ---');
    const rollbackRes = await rollbackSchemes({
      mongoUri: DISPOSABLE_DB_URI,
      backupPath: TEST_BACKUP_PATH,
      manifestPath: syncResult.manifestPath,
      quiet: true
    });

    const totalAfterRollback = await Scheme.countDocuments();
    const publishedAfterRollback = await Scheme.countDocuments({ status: 'Published' });
    const draftsAfterRollback = await Scheme.countDocuments({ status: 'Draft' });

    console.log(`Total after rollback:     ${totalAfterRollback} (Expected: 24)`);
    console.log(`Published after rollback: ${publishedAfterRollback} (Expected: 0)`);
    console.log(`Drafts after rollback:    ${draftsAfterRollback} (Expected: 24)`);

    if (totalAfterRollback !== 24 || publishedAfterRollback !== 0 || draftsAfterRollback !== 24) {
      throw new Error(`Rollback counts mismatch: total=${totalAfterRollback}, published=${publishedAfterRollback}, draft=${draftsAfterRollback}`);
    }

    // Verify 22 schemes restored to original draft state
    const kisanAfterRollback = await Scheme.findOne({ id: 'pm-kisan' });
    if (!kisanAfterRollback || kisanAfterRollback.status !== 'Draft' || kisanAfterRollback.activeStatus !== false) {
      throw new Error('PM-KISAN was not restored to Draft status');
    }
    if (kisanAfterRollback.benefits !== 'Pre-sync unverified benefits text') {
      throw new Error('PM-KISAN content was not restored to pre-sync state');
    }

    // Verify 53 inserted schemes were removed
    const eduAfterRollback = await Scheme.findOne({ id: 'edu-tn-tamil-puthalvan' });
    if (eduAfterRollback) {
      throw new Error('Inserted scheme edu-tn-tamil-puthalvan was not removed during rollback');
    }

    // Verify post-backup record survived rollback
    const postBackupRecord = await Scheme.findOne({ id: 'admin-post-backup-emergency-relief' });
    if (!postBackupRecord) {
      throw new Error('CRITICAL: Post-backup admin record was accidentally destroyed during rollback!');
    }
    console.log('✓ Post-backup record admin-post-backup-emergency-relief safely preserved in DB.');
    console.log('✓ All 22 pre-sync records restored to exact initial Draft state.');
    console.log('✓ All 53 sync-inserted records safely purged.');
    console.log('✓ Phase 6 passed: Surgical rollback fully verified.\n');

    console.log('================================================================');
    console.log(' ALL REGRESSION CHECKS PASSED: SYNC & ROLLBACK 100% VERIFIED!    ');
    console.log('================================================================');
  } finally {
    // Clean up temporary database & test backup file
    await Scheme.deleteMany({});
    await mongoose.disconnect();
    if (syncResult && syncResult.manifestPath && fs.existsSync(syncResult.manifestPath)) {
      fs.unlinkSync(syncResult.manifestPath);
    }
    if (fs.existsSync(TEST_BACKUP_PATH)) {
      fs.unlinkSync(TEST_BACKUP_PATH);
    }
  }
}

runSyncAndRollbackRegressionSuite().catch(err => {
  console.error('Regression suite failed:', err);
  process.exit(1);
});
