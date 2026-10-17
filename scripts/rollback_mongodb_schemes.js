import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import Scheme from '../server/models/Scheme.js';
import { loadCanonicalSchemes } from './sync_mongodb_75.js';

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

export async function rollbackSchemes({ mongoUri, backupPath, manifestPath, quiet = false, requireProduction = false } = {}) {
  const uri = mongoUri || process.env.PROD_MONGODB_URI || process.env.MONGODB_URI || process.env.MONGO_URI || (requireProduction ? null : 'mongodb://127.0.0.1:27017/govscheme');

  if (!uri) {
    throw new Error('Rollback aborted: Production mode requested, but no production URI was supplied via --uri= or PROD_MONGODB_URI/MONGODB_URI/MONGO_URI environment variable.');
  }

  const target = getSanitizedTarget(uri);
  if (requireProduction && target.isLocal) {
    throw new Error(`Rollback aborted: Production flag (--production) was specified, but target host resolved to local environment (${target.host}). Operation stopped to prevent targeting the wrong database.`);
  }

  if (requireProduction && (!target.db || target.db !== 'govscheme')) {
    throw new Error(`Rollback aborted: Target database must explicitly be "govscheme", but resolved to "${target.db || 'unspecified'}". Please ensure your connection URI specifies /govscheme.`);
  }

  if (!quiet) {
    console.log(`[Target Environment] Host: ${target.host} | Database: ${target.db || 'default'} | Local: ${target.isLocal ? 'YES' : 'NO'}`);
  }

  if (!backupPath || !fs.existsSync(backupPath)) {
    throw new Error(`Rollback aborted: backup file not found at ${backupPath}`);
  }

  const raw = fs.readFileSync(backupPath, 'utf8');
  const backedUpRecords = JSON.parse(raw);

  if (!Array.isArray(backedUpRecords) || backedUpRecords.length === 0) {
    throw new Error(`Rollback aborted: backup file contains 0 records or invalid JSON array`);
  }

  // Load sync manifest if provided
  let manifestInsertedIds = null;
  if (manifestPath && fs.existsSync(manifestPath)) {
    try {
      const manifestData = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      if (Array.isArray(manifestData.insertedDocs)) {
        manifestInsertedIds = new Set(manifestData.insertedDocs.map(d => String(d._id)));
      }
    } catch (e) {
      console.warn('[Rollback] Could not parse sync manifest, falling back to canonical ID diffing:', e.message);
    }
  }

  const shouldDisconnect = mongoose.connection.readyState === 0;
  if (shouldDisconnect) {
    if (!quiet) console.log('Connecting to MongoDB for rollback...');
    await mongoose.connect(uri);
    if (!quiet) console.log('Connected to MongoDB successfully.');
  }

  if (requireProduction && mongoose.connection.name !== 'govscheme') {
    if (shouldDisconnect) await mongoose.disconnect();
    throw new Error(`Rollback aborted: Connected database name is "${mongoose.connection.name}", but expected "govscheme".`);
  }

  const canonicalSchemes = loadCanonicalSchemes();
  const canonicalIds = new Set(canonicalSchemes.map(s => s.id));

  const backedUpMongoIds = new Set(backedUpRecords.map(r => String(r._id)));
  const backedUpSchemeIds = new Set(backedUpRecords.map(r => r.id || r.schemeId));

  if (!quiet) {
    console.log(`[Rollback Engine] Read ${backedUpRecords.length} records from backup file.`);
    if (manifestInsertedIds) {
      console.log(`[Rollback Engine] Sync manifest identified ${manifestInsertedIds.size} inserted record _ids.`);
    }
  }

  // 1. Restore all backed-up records to their exact backed-up state
  let restoredCount = 0;
  for (const record of backedUpRecords) {
    const mongoId = record._id;
    await Scheme.replaceOne({ _id: mongoId }, record, { upsert: true });
    restoredCount++;
  }

  // 2. Identify and remove only records inserted by the sync
  const allCurrentInDb = await Scheme.find().lean();
  let deletedSyncInsertedCount = 0;
  let preservedPostBackupCount = 0;
  const preservedIds = [];

  for (const doc of allCurrentInDb) {
    const docMongoId = String(doc._id);
    const docSchemeId = doc.id || doc.schemeId;

    if (!backedUpMongoIds.has(docMongoId)) {
      // Determine if this doc was inserted by the sync script
      const isSyncInserted = manifestInsertedIds
        ? manifestInsertedIds.has(docMongoId)
        : (canonicalIds.has(docSchemeId) && !backedUpSchemeIds.has(docSchemeId));

      if (isSyncInserted) {
        await Scheme.deleteOne({ _id: doc._id });
        deletedSyncInsertedCount++;
      } else {
        // This is a new record created by an admin/user (e.g. custom draft or admin scheme)
        // PRESERVE IT COMPLETELY!
        preservedPostBackupCount++;
        preservedIds.push(docSchemeId || docMongoId);
      }
    }
  }

  const totalAfterRollback = await Scheme.countDocuments();

  if (!quiet) {
    console.log('\n========================================');
    console.log('       MONGODB SCHEMES ROLLBACK COMPLETE  ');
    console.log('========================================');
    console.log(`Pre-sync Records Restored:     ${restoredCount}`);
    console.log(`Sync-inserted Schemes Removed: ${deletedSyncInsertedCount}`);
    console.log(`Post-backup Records Preserved: ${preservedPostBackupCount}`);
    if (preservedPostBackupCount > 0) {
      console.log(`Preserved Post-backup Record IDs: ${preservedIds.join(', ')}`);
    }
    console.log(`Total Schemes in DB Now:       ${totalAfterRollback}`);
    console.log('========================================\n');
  }

  if (shouldDisconnect) {
    await mongoose.disconnect();
  }

  return {
    success: true,
    restoredCount,
    deletedSyncInsertedCount,
    preservedPostBackupCount,
    preservedIds,
    totalAfterRollback
  };
}

const isDirectCli = process.argv[1] && (
  process.argv[1].endsWith('rollback_mongodb_schemes.js') || 
  process.argv[1].endsWith('rollback_mongodb_schemes')
);

if (isDirectCli) {
  const backupArg = process.argv.find(arg => arg.startsWith('--backup='))?.split('=')[1];
  const manifestArg = process.argv.find(arg => arg.startsWith('--manifest='))?.split('=')[1];
  const customUri = process.argv.find(arg => arg.startsWith('--uri='))?.split('=')[1];
  const requireProd = process.argv.includes('--production') || process.argv.includes('--target=production');

  if (!backupArg) {
    console.error('Usage: node scripts/rollback_mongodb_schemes.js --backup=backups/schemes_pre_sync_<timestamp>.json [--manifest=backups/sync_manifest_<timestamp>.json] [--uri=<MONGO_URI>] [--production]');
    process.exit(1);
  }
  rollbackSchemes({ backupPath: backupArg, manifestPath: manifestArg, mongoUri: customUri, requireProduction: requireProd })
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Rollback error:', sanitizeError(err));
      process.exit(1);
    });
}
