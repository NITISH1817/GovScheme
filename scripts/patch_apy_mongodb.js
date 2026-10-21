import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import Scheme from '../server/models/Scheme.js';

dotenv.config();
if (fs.existsSync('.env.production.local')) {
  dotenv.config({ path: '.env.production.local', override: true });
}

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
  } catch (e) {
    return { isLocal: false, host: 'unknown', db: null, isSrv: false };
  }
}

export const APY_TARGET_UPDATES = {
  officialWebsite: 'https://www.pfrda.org.in',
  officialApplyUrl: 'https://npscra.proteantech.in/scheme-details.php',
  officialApplicationUrl: 'https://npscra.proteantech.in/scheme-details.php',
  applyURL: 'https://npscra.proteantech.in/scheme-details.php',
  sourceUrl: 'https://www.pfrda.org.in',
  lastVerifiedAt: new Date('2026-10-18T12:00:00.000Z')
};

export async function patchApyScheme({
  mongoUri,
  dryRun = false,
  backupOnly = false,
  rollbackFile = null,
  backupDir = 'backups',
  quiet = false
} = {}) {
  const uri = mongoUri || process.env.PROD_MONGODB_URI || process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!uri) {
    throw new Error('Connection aborted: No MongoDB URI supplied. Pass via --uri= or PROD_MONGODB_URI / MONGODB_URI environment variable.');
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
    // 1. Strict Cardinality & Existence Check (Requirement 4)
    const matchingCount = await Scheme.countDocuments({ id: 'atal-pension-yojana' });
    if (matchingCount === 0) {
      throw new Error("Target document with id 'atal-pension-yojana' not found in database.");
    }
    if (matchingCount > 1) {
      throw new Error(`Ambiguity error: Expected exactly 1 document with id 'atal-pension-yojana', but found ${matchingCount}. Aborting to prevent unintended modifications.`);
    }

    // Fetch the single complete original document (Requirement 2 & 3)
    const currentDoc = await Scheme.findOne({ id: 'atal-pension-yojana' }).lean();

    if (!quiet) {
      console.log(`\nFound target document: [${currentDoc.id}] ${currentDoc.name || currentDoc.schemeName}`);
      console.log('Current URL values in database:');
      console.log(`  - officialWebsite:        ${currentDoc.officialWebsite}`);
      console.log(`  - officialApplyUrl:        ${currentDoc.officialApplyUrl}`);
      console.log(`  - officialApplicationUrl:  ${currentDoc.officialApplicationUrl}`);
      console.log(`  - applyURL:                ${currentDoc.applyURL}`);
      console.log(`  - sourceUrl:               ${currentDoc.sourceUrl}`);
      console.log(`  - total document fields:   ${Object.keys(currentDoc).length}`);
    }

    // 2. Rollback mode (Requirement 7)
    if (rollbackFile) {
      if (!fs.existsSync(rollbackFile)) {
        throw new Error(`Rollback file not found at: ${rollbackFile}`);
      }
      const rawBackup = fs.readFileSync(rollbackFile, 'utf8');
      const backupData = JSON.parse(rawBackup);

      // Validate backup file schema and target identity
      if (!backupData || typeof backupData !== 'object') {
        throw new Error('Rollback aborted: Backup file does not contain a valid JSON object.');
      }
      if (backupData.id !== 'atal-pension-yojana') {
        throw new Error(`Rollback aborted: Backup file document id is '${backupData.id}', expected 'atal-pension-yojana'.`);
      }
      if (!backupData.officialWebsite || !backupData.officialApplyUrl) {
        throw new Error('Rollback aborted: Backup file missing required URL fields.');
      }

      const restoreFields = {
        officialWebsite: backupData.officialWebsite,
        officialApplyUrl: backupData.officialApplyUrl,
        officialApplicationUrl: backupData.officialApplicationUrl || backupData.officialApplyUrl,
        applyURL: backupData.applyURL || backupData.officialApplyUrl,
        sourceUrl: backupData.sourceUrl || backupData.officialWebsite,
        lastVerifiedAt: backupData.lastVerifiedAt || new Date()
      };

      if (!quiet) {
        console.log(`\nRestoring APY record from backup file: ${rollbackFile}`);
        console.log('Restore fields:', restoreFields);
      }

      if (dryRun) {
        console.log('\n[DRY RUN] Read-only mode: No database writes performed. Would execute:');
        console.log(`Scheme.updateOne({ id: 'atal-pension-yojana' }, { $set: ${JSON.stringify(restoreFields, null, 2)} })`);
        return { success: true, mode: 'rollback-dry-run', restoreFields };
      }

      const updateRes = await Scheme.updateOne(
        { id: 'atal-pension-yojana' },
        { $set: restoreFields }
      );
      if (!quiet) {
        console.log(`Rollback update result -> Matched: ${updateRes.matchedCount}, Modified: ${updateRes.modifiedCount}`);
      }
      return { success: true, mode: 'rollback-applied', updateRes };
    }

    // 3. Dry-Run Mode (Requirement 1: Strictly read-only, NO database writes, NO file writes)
    if (dryRun) {
      if (!quiet) {
        console.log('\n[DRY RUN] Read-only verification successful.');
        console.log('No database writes and no backup file writes were performed.');
        console.log('Target document exists, is unique (count: 1), and ready for targeted patch.');
        console.log('Proposed $set patch (only URL/timestamp fields):');
        console.log(JSON.stringify(APY_TARGET_UPDATES, null, 2));
      }
      return {
        success: true,
        mode: 'dry-run',
        currentDocId: currentDoc.id,
        currentDocFieldsCount: Object.keys(currentDoc).length,
        proposedUpdates: APY_TARGET_UPDATES
      };
    }

    // 4. Backup Mode / Pre-Apply Backup (Requirement 2 & 3: Complete original document saved)
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFilePath = path.join(backupDir, `apy_backup_${timestamp}.json`);

    // Save the entire original document
    fs.writeFileSync(backupFilePath, JSON.stringify(currentDoc, null, 2), 'utf8');
    const backupStats = fs.statSync(backupFilePath);

    if (!quiet) {
      console.log(`\n[Backup Created] Complete original document saved.`);
      console.log(`  - File path: ${backupFilePath}`);
      console.log(`  - File size: ${backupStats.size} bytes`);
      console.log(`  - Fields backed up: ${Object.keys(currentDoc).length}`);
    }

    if (backupOnly) {
      return {
        success: true,
        mode: 'backup-only',
        backupFilePath,
        backupSize: backupStats.size,
        fieldCount: Object.keys(currentDoc).length
      };
    }

    // 5. Apply Minimal Targeted Update (Requirement 5: Only URL fields updated via $set)
    if (!quiet) {
      console.log('\nApplying targeted single-document update...');
    }
    const updateResult = await Scheme.updateOne(
      { id: 'atal-pension-yojana' },
      { $set: APY_TARGET_UPDATES }
    );

    if (!quiet) {
      console.log(`Update execution result -> Matched: ${updateResult.matchedCount}, Modified: ${updateResult.modifiedCount}`);
    }

    // 6. Post-Update Verification (Requirement 6)
    const verifiedDoc = await Scheme.findOne({ id: 'atal-pension-yojana' }).lean();
    const hasNsdl = [
      verifiedDoc.officialWebsite,
      verifiedDoc.officialApplyUrl,
      verifiedDoc.officialApplicationUrl,
      verifiedDoc.applyURL,
      verifiedDoc.sourceUrl
    ].some(val => val && val.includes('nsdl.co.in'));

    if (hasNsdl) {
      throw new Error('Verification failed: Updated document still contains references to nsdl.co.in');
    }

    if (verifiedDoc.officialWebsite !== APY_TARGET_UPDATES.officialWebsite ||
        verifiedDoc.officialApplyUrl !== APY_TARGET_UPDATES.officialApplyUrl) {
      throw new Error('Verification failed: Updated fields do not match expected targets.');
    }

    if (!quiet) {
      console.log('\n[VERIFICATION PASSED]');
      console.log(`  - officialWebsite:        ${verifiedDoc.officialWebsite} (PFRDA)`);
      console.log(`  - officialApplyUrl:        ${verifiedDoc.officialApplyUrl} (Protean CRA)`);
      console.log('  - All references to nsdl.co.in eliminated: 100%');
      console.log(`  - Document fields preserved: ${Object.keys(verifiedDoc).length}`);
    }

    return {
      success: true,
      mode: 'applied',
      backupFilePath,
      updateResult: {
        matchedCount: updateResult.matchedCount,
        modifiedCount: updateResult.modifiedCount
      },
      verifiedDoc: {
        id: verifiedDoc.id,
        name: verifiedDoc.name,
        officialWebsite: verifiedDoc.officialWebsite,
        officialApplyUrl: verifiedDoc.officialApplyUrl,
        officialApplicationUrl: verifiedDoc.officialApplicationUrl,
        applyURL: verifiedDoc.applyURL,
        sourceUrl: verifiedDoc.sourceUrl
      }
    };
  } finally {
    if (connectedHere) {
      await mongoose.disconnect();
      if (!quiet) console.log('Disconnected from MongoDB.');
    }
  }
}

// CLI entry point
if (process.argv[1] && process.argv[1].endsWith('patch_apy_mongodb.js')) {
  const isDryRun = process.argv.includes('--dry-run');
  const isBackupOnly = process.argv.includes('--backup-only');
  const isApply = process.argv.includes('--apply');
  const rollbackArg = process.argv.find(a => a.startsWith('--rollback='));
  const rollbackFile = rollbackArg ? rollbackArg.split('=')[1] : null;
  const uriArg = process.argv.find(a => a.startsWith('--uri='));
  const mongoUri = uriArg ? uriArg.split('=')[1] : undefined;

  if (!isDryRun && !isBackupOnly && !isApply && !rollbackFile) {
    console.log(`
GovScheme APY Targeted URL Patch Utility
Usage:
  node scripts/patch_apy_mongodb.js --dry-run [--uri=<mongo_uri>]
  node scripts/patch_apy_mongodb.js --backup-only [--uri=<mongo_uri>]
  node scripts/patch_apy_mongodb.js --apply [--uri=<mongo_uri>]
  node scripts/patch_apy_mongodb.js --rollback=<backup_path> [--uri=<mongo_uri>]

Safety Rules:
  - Updates ONLY the single document with id: 'atal-pension-yojana'.
  - Creates a timestamped backup before applying any change.
  - Never deletes or modifies any other scheme.
`);
    process.exit(0);
  }

  patchApyScheme({
    mongoUri,
    dryRun: isDryRun,
    backupOnly: isBackupOnly,
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
