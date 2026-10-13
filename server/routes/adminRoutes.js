import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Application from '../models/Application.js';
import Document from '../models/Document.js';
import { getUsers, getCitizenDetails, updateUserStatus } from '../controllers/userController.js';
import { getDashboardAnalytics } from '../controllers/analyticsController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes in /api/admin require authentication and admin role
router.use(protect, adminOnly);

/**
 * GET /api/admin/citizens
 * Paginated list of citizens with search and filters
 */
router.get('/citizens', getUsers);

/**
 * GET /api/admin/citizens/:id
 * Authorized citizen profile details with applications and documents
 */
router.get('/citizens/:id', getCitizenDetails);

/**
 * PUT /api/admin/citizens/:id/status
 * Activate or suspend a citizen account
 */
router.put('/citizens/:id/status', updateUserStatus);

/**
 * GET /api/admin/analytics
 * Platform analytics and metrics derived from actual database records
 */
router.get('/analytics', getDashboardAnalytics);

export default router;
