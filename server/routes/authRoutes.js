import express from 'express';
import { registerUser, loginUser, generateOTP, verifyOTP } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/generate-otp', generateOTP);
router.post('/verify-otp', verifyOTP);

export default router;
