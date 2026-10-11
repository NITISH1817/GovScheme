import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './db.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import Scheme from './models/Scheme.js';
import Document from './models/Document.js';
import { schemesData } from '../src/data/schemes.ts';
import authRoutes from './routes/authRoutes.js';
import documentRoutes from './routes/documentRoutes.js';

const seedAdmin = async () => {
  if (process.env.NODE_ENV === 'production' && !process.env.SEED_ADMIN) {
    return;
  }
  try {
    const adminExists = await User.findOne({ email: 'admin@govscheme.in' });
    if (!adminExists) {
      await User.create({
        fullName: 'Super Admin',
        email: 'admin@govscheme.in',
        password: process.env.ADMIN_SEED_PASSWORD || 'password123',
        role: 'Super Admin',
        isActive: true
      });
      console.log('[Security] Development Default Admin seeded.');
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

// Dynamic CORS configuration allowing localhost, configured CLIENT_URL, and Vercel domains
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      process.env.NODE_ENV !== 'production'
    ) {
      return callback(null, true);
    }
    return callback(new Error('CORS policy: Not allowed by Access-Control-Allow-Origin'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));


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

app.use(express.json({ limit: '10mb' }));

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
import Application from './models/Application.js';

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/documents', documentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: { database: 'connected', server: 'online' }
  });
});

import http from 'http';
import { Server } from 'socket.io';

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
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
  try {
    await connectDB();
    await seedAdmin();
    await seedMockData();
  } catch (err) {
    console.error('[Critical Startup Error] Database initialization failed:', err);
  }

  server.listen(PORT, () => {
    console.log(`GovScheme AI Express Backend running on port ${PORT}`);
  });
};

startServer();
