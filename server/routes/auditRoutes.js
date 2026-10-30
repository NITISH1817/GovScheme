import express from 'express';
import { getAuditLogs } from '../controllers/auditController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, authorizeRoles('Super Admin', 'State Admin', 'Ministry Admin'), getAuditLogs);

export default router;
