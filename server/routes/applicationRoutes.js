import express from 'express';
import { getApplications, updateApplicationStatus, createApplication, getUserApplications } from '../controllers/applicationController.js';
import { protect, adminOnly, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, authorizeRoles('Citizen'), createApplication)
  .get(protect, adminOnly, getApplications);

router.route('/my-applications')
  .get(protect, authorizeRoles('Citizen'), getUserApplications);

router.route('/:id/status')
  .put(protect, adminOnly, updateApplicationStatus);

export default router;
