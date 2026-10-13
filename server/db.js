import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

export const ensureDatabaseSync = async (conn, targetDbName) => {
  try {
    const client = conn.connection.client;
    if (!client) return;

    const activeDb = conn.connection.db;
    if (activeDb.databaseName !== 'test') {
      const testDb = client.db('test');
      const collections = await testDb.listCollections({ name: 'users' }).toArray().catch(() => []);
      if (collections.length > 0) {
        const testUsersColl = testDb.collection('users');
        const testUserCount = await testUsersColl.countDocuments().catch(() => 0);

        if (testUserCount > 0) {
          const targetUsersColl = activeDb.collection('users');
          const testUsers = await testUsersColl.find({}).toArray().catch(() => []);

          let migratedCount = 0;
          for (const userDoc of testUsers) {
            const normalizedEmail = (userDoc.email || '').trim().toLowerCase();
            const exists = await targetUsersColl.findOne({
              $or: [{ _id: userDoc._id }, { email: normalizedEmail }]
            });
            if (!exists) {
              await targetUsersColl.insertOne({
                ...userDoc,
                email: normalizedEmail
              });
              migratedCount++;
            }
          }
          if (migratedCount > 0) {
            console.log(`[Database Migration] Preserved and safely migrated ${migratedCount} user(s) from 'test' to '${activeDb.databaseName}'. Original records in 'test' remain preserved.`);
          }
        }
      }
    }
  } catch (error) {
    // Non-blocking check for environments with restricted database listing privileges
    console.warn(`[Database Migration Notice] Safe data migration from 'test' checked: ${error.message}`);
  }
};

export const connectDB = async () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const targetDbName = process.env.MONGO_DB_NAME || 'govscheme';
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || (isProduction ? null : 'mongodb://127.0.0.1:27017/govscheme');

  if (mongoUri) {
    try {
      const conn = await mongoose.connect(mongoUri, {
        dbName: targetDbName,
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`[Database] MongoDB Connected: ${conn.connection.host} (Active Database: ${conn.connection.db.databaseName})`);
      await ensureDatabaseSync(conn, targetDbName);
      return conn;
    } catch (error) {
      console.error(`[Database Error] Failed connecting to configured MongoDB: ${error.message}`);
      if (isProduction) {
        throw new Error(`Production MongoDB connection failed: ${error.message}`);
      }
      console.warn('[Database] Falling back to local development memory store...');
    }
  } else if (isProduction) {
    throw new Error('[Database Error] MONGO_URI environment variable is missing in production environment. Persistent database is required.');
  }

  // Development / test fallback only
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    process.env.MONGOMS_VERSION = '6.0.4';
    const mongoServer = await MongoMemoryServer.create();
    const memoryUri = mongoServer.getUri();
    const conn = await mongoose.connect(memoryUri, {
      dbName: targetDbName,
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] Local Development In-Memory MongoDB Connected: ${conn.connection.host} (Active Database: ${conn.connection.db.databaseName})`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Failed to initialize in-memory development database: ${error.message}`);
    throw error;
  }
};

export default connectDB;

