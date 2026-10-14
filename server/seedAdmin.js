import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import dotenv from 'dotenv';
dotenv.config();

// Assuming we want to connect to the same DB logic
import { connectDB } from './db.js';

const seedAdmin = async () => {
  try {
    await connectDB();
    
    const adminExists = await User.findOne({ email: 'admin@govscheme.in' });
    
    if (adminExists) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    const isProduction = process.env.NODE_ENV === 'production';
    const adminPassword = process.env.ADMIN_SEED_PASSWORD;
    if (isProduction && !adminPassword) {
      console.error('[Security Error] In production, ADMIN_SEED_PASSWORD must be explicitly provided in environment variables.');
      process.exit(1);
    }

    const admin = await User.create({
      fullName: 'Super Admin',
      email: process.env.ADMIN_EMAIL || 'admin@govscheme.in',
      password: adminPassword || 'password123',
      role: 'SuperAdmin',
      isActive: true
    });

    console.log('Admin user created successfully!');
    console.log(`Email: ${admin.email}`);
    if (!isProduction) {
      console.log('Password: password123 (development default)');
    } else {
      console.log('Password: [SECURE - configured via ADMIN_SEED_PASSWORD]');
    }
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
