import express from 'express';
import { getDashboardAnalytics } from '../controllers/analyticsController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/dashboard')
  .get(protect, adminOnly, getDashboardAnalytics);

export default router;
