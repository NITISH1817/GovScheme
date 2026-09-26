import express from 'express';
import { getNotifications, createNotification, deleteNotification } from '../controllers/notificationController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getNotifications)
  .post(protect, adminOnly, createNotification);

router.route('/:id')
  .delete(protect, adminOnly, deleteNotification);

export default router;
