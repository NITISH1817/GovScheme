import express from 'express';
import { getAuditLogs, createAuditLog } from '../controllers/auditController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', optionalAuth, getAuditLogs);
router.post('/', optionalAuth, createAuditLog);

export default router;
