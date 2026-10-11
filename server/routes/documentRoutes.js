import express from 'express';
import { getDocuments, verifyDocument } from '../controllers/documentController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { auditLog } from '../middleware/auditMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, adminOnly, getDocuments);

router.route('/:id/verify')
  .put(protect, adminOnly, auditLog('VERIFY_DOCUMENT'), verifyDocument);

export default router;
