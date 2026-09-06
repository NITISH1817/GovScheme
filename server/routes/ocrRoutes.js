import express from 'express';
import { processOCR } from '../controllers/ocrController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/scan', protect, authorizeRoles('Citizen'), processOCR);

export default router;
