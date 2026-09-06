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

    const admin = await User.create({
      fullName: 'Super Admin',
      email: 'admin@govscheme.in',
      password: 'password123',
      role: 'SuperAdmin',
      isActive: true
    });

    console.log('Admin user created successfully!');
    console.log(`Email: ${admin.email}`);
    console.log('Password: password123');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
