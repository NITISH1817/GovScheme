import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

export const connectDB = async () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const mongoUri = process.env.MONGO_URI || (isProduction ? null : 'mongodb://127.0.0.1:27017/govscheme');

  if (mongoUri) {
    try {
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
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
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[Database] Local Development In-Memory MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Failed to initialize in-memory development database: ${error.message}`);
    throw error;
  }
};

