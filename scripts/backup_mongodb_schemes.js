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

export async function backupSchemes({ mongoUri, outputPath, quiet = false, requireProduction = false } = {}) {
  const uri = mongoUri || process.env.PROD_MONGODB_URI || process.env.MONGODB_URI || process.env.MONGO_URI || (requireProduction ? null : 'mongodb://127.0.0.1:27017/govscheme');

  if (!uri) {
    throw new Error('Backup aborted: Production mode requested, but no production URI was supplied via --uri= or PROD_MONGODB_URI/MONGODB_URI/MONGO_URI environment variable.');
  }

  const target = getSanitizedTarget(uri);
  if (requireProduction && target.isLocal) {
    throw new Error(`Backup aborted: Production flag (--production) was specified, but target host resolved to local environment (${target.host}). Operation stopped to prevent targeting the wrong database.`);
  }

  if (requireProduction && (!target.db || target.db !== 'govscheme')) {
    throw new Error(`Backup aborted: Target database must explicitly be "govscheme", but resolved to "${target.db || 'unspecified'}". Please ensure your connection URI specifies /govscheme.`);
  }

  if (!quiet) {
    console.log(`[Target Environment] Host: ${target.host} | Database: ${target.db || 'default'} | Local: ${target.isLocal ? 'YES' : 'NO'}`);
  }

  const shouldDisconnect = mongoose.connection.readyState === 0;
  if (shouldDisconnect) {
    if (!quiet) console.log('Connecting to MongoDB for backup...');
    await mongoose.connect(uri);
    if (!quiet) console.log('Connected to MongoDB successfully.');
  }

  if (requireProduction && mongoose.connection.name !== 'govscheme') {
    if (shouldDisconnect) await mongoose.disconnect();
    throw new Error(`Backup aborted: Connected database name is "${mongoose.connection.name}", but expected "govscheme".`);
  }

  const schemes = await Scheme.find().lean();
  const countInDb = schemes.length;

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const targetDir = path.resolve('backups');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const finalPath = outputPath || path.join(targetDir, `schemes_pre_sync_${timestamp}.json`);
  if (fs.existsSync(finalPath)) {
    if (shouldDisconnect) await mongoose.disconnect();
    throw new Error(`Backup aborted: target file already exists at ${finalPath}. Existing backups cannot be overwritten.`);
  }

  const jsonContent = JSON.stringify(schemes, null, 2);
  fs.writeFileSync(finalPath, jsonContent, 'utf8');

  // Verification step
  const stats = fs.statSync(finalPath);
  if (stats.size === 0) {
    throw new Error(`Backup verification failed: written file is 0 bytes at ${finalPath}`);
  }

  const parsed = JSON.parse(fs.readFileSync(finalPath, 'utf8'));
  if (parsed.length !== countInDb) {
    throw new Error(`Backup verification failed: written record count (${parsed.length}) does not match MongoDB count (${countInDb})`);
  }

  const hash = crypto.createHash('sha256').update(jsonContent).digest('hex');

  if (!quiet) {
    console.log('\n========================================');
    console.log('       MONGODB SCHEMES BACKUP VERIFIED   ');
    console.log('========================================');
    console.log(`Backup Destination: ${finalPath}`);
    console.log(`Records Exported:   ${parsed.length}`);
    console.log(`File Size:          ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`SHA-256 Checksum:   ${hash}`);
    console.log('========================================\n');
  }

  if (shouldDisconnect) {
    await mongoose.disconnect();
  }

  return {
    success: true,
    filePath: finalPath,
    recordCount: parsed.length,
    fileSizeBytes: stats.size,
    sha256: hash
  };
}

const isDirectCli = process.argv[1] && (
  process.argv[1].endsWith('backup_mongodb_schemes.js') || 
  process.argv[1].endsWith('backup_mongodb_schemes')
);

if (isDirectCli) {
  const customOut = process.argv.find(arg => arg.startsWith('--out='))?.split('=')[1];
  const customUri = process.argv.find(arg => arg.startsWith('--uri='))?.split('=')[1];
  const requireProd = process.argv.includes('--production') || process.argv.includes('--target=production');

  backupSchemes({ mongoUri: customUri, outputPath: customOut, requireProduction: requireProd })
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Backup error:', sanitizeError(err));
      process.exit(1);
    });
}
