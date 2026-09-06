import express from 'express';
import { getNotifications, createNotification } from '../controllers/notificationController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, adminOnly, getNotifications)
  .post(protect, adminOnly, createNotification);

export default router;
