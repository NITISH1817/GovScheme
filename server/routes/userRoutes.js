import express from 'express';
import { getUsers, updateUserStatus, getUserProfile, updateUserProfile } from '../controllers/userController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.route('/')
  .get(protect, adminOnly, getUsers);

router.route('/:id/status')
  .put(protect, adminOnly, updateUserStatus);

export default router;
