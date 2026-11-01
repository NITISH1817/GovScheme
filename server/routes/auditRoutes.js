import express from 'express';
import { getAuditLogs, createAuditLog, clearAuditLogs } from '../controllers/auditController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', optionalAuth, getAuditLogs);
router.post('/', optionalAuth, createAuditLog);
router.delete('/', optionalAuth, clearAuditLogs);

export default router;
