import express from 'express';
import { getUsers, updateUserStatus, getUserProfile, updateUserProfile, getCitizenDetails } from '../controllers/userController.js';
import { protect, adminOnly, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.route('/')
  .get(protect, adminOnly, getUsers);

router.route('/:id/details')
  .get(protect, adminOnly, getCitizenDetails);

router.route('/:id/status')
  .put(protect, authorizeRoles('Super Admin', 'State Admin', 'Ministry Admin', 'District Officer'), updateUserStatus);

export default router;
