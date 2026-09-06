import express from 'express';
import { chatWithAI, streamChatWithAI } from '../controllers/aiController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/chat', protect, authorizeRoles('Citizen'), chatWithAI);
router.post('/stream', protect, authorizeRoles('Citizen'), streamChatWithAI);

export default router;
