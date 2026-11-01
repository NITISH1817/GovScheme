import express from 'express';
import { chatWithAI, streamChatWithAI, streamTTSAudio } from '../controllers/aiController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/chat', optionalAuth, chatWithAI);
router.post('/stream', optionalAuth, streamChatWithAI);
router.get('/tts', streamTTSAudio);

export default router;
