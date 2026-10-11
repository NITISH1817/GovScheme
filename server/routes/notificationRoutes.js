import express from 'express';
import { getNotifications, createNotification, deleteNotification, markNotificationRead, markAllNotificationsRead } from '../controllers/notificationController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getNotifications)
  .post(protect, adminOnly, createNotification);

router.put('/read-all', protect, adminOnly, markAllNotificationsRead);

router.route('/:id/read')
  .put(protect, adminOnly, markNotificationRead);

router.route('/:id')
  .delete(protect, adminOnly, deleteNotification);

export default router;
