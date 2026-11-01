import express from 'express';
import { getApplications, updateApplicationStatus, createApplication, getUserApplications } from '../controllers/applicationController.js';
import { protect, adminOnly, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createApplication)
  .get(protect, adminOnly, getApplications);

router.route('/my-applications')
  .get(protect, getUserApplications);

router.route('/:id/status')
  .put(protect, authorizeRoles('Super Admin', 'State Admin', 'Ministry Admin', 'District Officer', 'Nodal Officer'), updateApplicationStatus);

export default router;
