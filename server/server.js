import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { connectDB } from './db.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import Scheme from './models/Scheme.js';
import Document from './models/Document.js';
import { schemesData } from '../src/data/schemes.ts';
import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import { validateJwtConfig } from './config/jwtConfig.js';
import { corsOptionsDelegate, isOriginAllowed } from './config/corsConfig.js';

const seedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@govscheme.in';
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      const isProduction = process.env.NODE_ENV === 'production';
      const adminPassword = process.env.ADMIN_SEED_PASSWORD;

      if (isProduction && !adminPassword) {
        console.warn('[Security Notice] ADMIN_SEED_PASSWORD is not set in production. Skipping default admin account creation to prevent insecure password fallback.');
        return;
      }

      const seedPassword = adminPassword || 'password123';
      await User.create({
        fullName: 'Super Admin',
        email: adminEmail,
        password: seedPassword,
        role: 'Super Admin',
        isActive: true
      });
      if (!isProduction) {
        console.log(`[Security] Admin seeded: ${adminEmail} (development default)`);
      } else {
        console.log(`[Security] Admin seeded: ${adminEmail} (custom production password)`);
      }
    }
  } catch (error) {
    console.error('Failed to seed admin', error);
  }
};


const seedMockData = async () => {
  try {
    const schemeCount = await Scheme.countDocuments();
    if (schemeCount === 0) {
      await Scheme.insertMany(schemesData);
      
      const mockCitizen = await User.create({
        fullName: 'John Doe',
        email: 'citizen1@test.com',
        password: 'password123',
        role: 'Citizen',
        state: 'Maharashtra',
        category: 'OBC'
      });
      
      const mockCitizen2 = await User.create({
        fullName: 'Jane Smith',
        email: 'citizen2@test.com',
        password: 'password123',
        role: 'Citizen',
        state: 'Karnataka',
        category: 'General'
      });

      const schemes = await Scheme.find().limit(3);
      
      const app1 = await Application.create({ userId: mockCitizen._id, schemeId: schemes[0]?._id?.toString() || '1', status: 'Submitted' });
      const app2 = await Application.create({ userId: mockCitizen._id, schemeId: schemes[1]?._id?.toString() || '2', status: 'Approved' });
      const app3 = await Application.create({ userId: mockCitizen2._id, schemeId: schemes[2]?._id?.toString() || '3', status: 'Under Review' });

      // Seed mock documents for verification queue
      const docCount = await Document.countDocuments();
      if (docCount === 0) {
        await Document.create([
          {
            userId: mockCitizen._id,
            type: 'Income Certificate',
            cloudinaryUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&auto=format&fit=crop&q=60',
            ocrStatus: 'Completed',
            extractedData: { fullName: 'John Doe', annualIncome: 120000, state: 'Maharashtra', docNumber: 'INC/MH/2026/0942' },
            confidenceScore: 94,
            status: 'Pending',
            docNumber: 'INC/MH/2026/0942'
          },
          {
            userId: mockCitizen._id,
            type: 'Aadhaar',
            cloudinaryUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=60',
            ocrStatus: 'Completed',
            extractedData: { fullName: 'John Doe', dob: '1990-05-15', gender: 'Male', state: 'Maharashtra' },
            confidenceScore: 97,
            status: 'Verified',
            docNumber: 'XXXX-XXXX-4829',
            verified: true
          },
          {
            userId: mockCitizen2._id,
            type: 'Community Certificate',
            cloudinaryUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=60',
            ocrStatus: 'Completed',
            extractedData: { fullName: 'Jane Smith', category: 'General', state: 'Karnataka' },
            confidenceScore: 88,
            status: 'Pending',
            docNumber: 'CC/KA/2026/1844'
          }
        ]);
      }
      console.log('Mock citizens, applications, and documents seeded');
    }
  } catch (error) {
    console.error('Failed to seed mock data', error);
  }
};

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT || 5000;

// Trust reverse proxy (Render, Cloudflare, Nginx) so req.ip and express-rate-limit read real client IP
app.set('trust proxy', 1);

// Production-hardened CORS configuration with strict origin allowlist
app.use(cors(corsOptionsDelegate));


// Security Middleware
app.use(helmet());

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// Dedicated Authentication Rate Limiter (Mitigates brute-force and credential stuffing)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'test' ? 1000 : 60, // 60 auth requests per 15 minutes in production/development
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth', authLimiter);

app.use(express.json({ limit: '10mb' }));

// Security Hardening (SEC-02): Remove unauthenticated public access to the uploads directory.
// Direct access to /uploads is strictly forbidden. Authenticated retrieval must go through /api/documents/:documentId/file.
app.use('/uploads', (req, res) => {
  res.status(403).json({
    success: false,
    message: 'Direct access to uploaded documents is forbidden. Use authenticated document endpoints.'
  });
});

import schemeRoutes from './routes/schemeRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import userRoutes from './routes/userRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import ocrRoutes from './routes/ocrRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import Application from './models/Application.js';

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/documents', documentRoutes);

// Health check endpoint with dynamic database connection inspection
app.get('/api/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.status(isDbConnected ? 200 : 503).json({
    status: isDbConnected ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: isDbConnected ? 'connected' : 'disconnected',
      server: 'online'
    }
  });
});

// Global structured JSON error handler (avoids sending default Express HTML 500 pages)
app.use((err, req, res, next) => {
  if (err && err.message && err.message.includes('CORS policy')) {
    return res.status(403).json({
      success: false,
      message: err.message
    });
  }
  console.error('[Global Server Error Caught]:', err.message || err);
  if (err.name === 'MulterError') {
    return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
  }
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An unexpected error occurred on the server.'
  });
});

import http from 'http';
import { Server } from 'socket.io';

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        return callback(null, true);
      }
      return callback(new Error('CORS policy: Not allowed by Access-Control-Allow-Origin for WebSocket'));
    },
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Expose io to routes if needed
app.set('io', io);

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

const startServer = async () => {
  // Fail fast before accepting any network connections if JWT_SECRET is missing or empty
  validateJwtConfig();

  try {
    await connectDB();
    await seedAdmin();
    if (process.env.NODE_ENV !== 'production') {
      await seedMockData();
    }
  } catch (err) {
    console.error('[Critical Startup Error] Database initialization failed:', err);
    throw err;
  }

  return new Promise((resolve) => {
    server.listen(PORT, () => {
      console.log(`GovScheme AI Express Backend running on port ${PORT}`);
      resolve(server);
    });
  });
};

const isMainModule = process.argv[1] && (
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url) ||
  process.argv[1].endsWith('server.js')
);

if (isMainModule) {
  startServer();
}

export { app, server, startServer };
export default app;
