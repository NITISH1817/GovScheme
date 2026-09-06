import express from 'express';
import cors from 'cors';
import { connectDB } from './db.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import Scheme from './models/Scheme.js';
import { schemesData } from '../src/data/schemes.js';
import authRoutes from './routes/authRoutes.js';

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@govscheme.in' });
    if (!adminExists) {
      await User.create({
        fullName: 'Super Admin',
        email: 'admin@govscheme.in',
        password: 'password123', // hooks handle hashing
        role: 'SuperAdmin',
        isActive: true
      });
      console.log('Default Admin seeded: admin@govscheme.in / password123');
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
      
      await Application.create([
        { userId: mockCitizen._id, schemeId: schemes[0]?._id?.toString() || '1', status: 'Pending' },
        { userId: mockCitizen._id, schemeId: schemes[1]?._id?.toString() || '2', status: 'Approved' },
        { userId: mockCitizen2._id, schemeId: schemes[2]?._id?.toString() || '3', status: 'Pending' }
      ]);
      console.log('Mock citizens and applications seeded');
    }
  } catch (error) {
    console.error('Failed to seed mock data', error);
  }
};

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB and seed
connectDB().then(() => {
  seedAdmin();
  seedMockData();
});

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

app.use(cors());
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

server.listen(PORT, () => {
  console.log(`GovScheme AI Express Backend running on port ${PORT}`);
});
