import express from 'express';
import { registerUser, loginUser, adminLogin, generateOTP, verifyOTP, googleAuth } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/admin-login', adminLogin);
router.post('/generate-otp', generateOTP);
router.post('/verify-otp', verifyOTP);
router.post('/google', googleAuth);

export default router;
