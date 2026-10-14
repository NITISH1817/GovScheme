import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Scheme from '../server/models/Scheme.js';

dotenv.config();

export async function backupSchemes({ mongoUri, outputPath, quiet = false } = {}) {
  const uri = mongoUri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/govscheme';

  const shouldDisconnect = mongoose.connection.readyState === 0;
  if (shouldDisconnect) {
    if (!quiet) console.log('Connecting to MongoDB for backup...');
    await mongoose.connect(uri);
    if (!quiet) console.log('Connected to MongoDB successfully.');
  }

  const schemes = await Scheme.find().lean();
  const countInDb = schemes.length;

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const targetDir = path.resolve('backups');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const finalPath = outputPath || path.join(targetDir, `schemes_pre_sync_${timestamp}.json`);
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
  backupSchemes({ outputPath: customOut })
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Backup error:', err);
      process.exit(1);
    });
}
