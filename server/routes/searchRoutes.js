import express from 'express';
import { globalSearch } from '../controllers/searchController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, adminOnly, globalSearch);

export default router;
