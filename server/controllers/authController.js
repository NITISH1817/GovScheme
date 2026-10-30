import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import Document from '../models/Document.js';
import { formatUserProfile } from './userController.js';
import { getJwtSecret } from '../config/jwtConfig.js';
import { isValidAdminRole, isAuthorizedAdminEmail } from '../config/adminPolicy.js';

const generateToken = (id, name, role) => {
  return jwt.sign({ id, name, role }, getJwtSecret(), {
    expiresIn: '30d',
  });
};

export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    if (typeof fullName !== 'string' || !fullName.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide a valid full name' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
    }

    const normalizedEmail = (email || '').trim().toLowerCase();

    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists. Please sign in.'
      });
    }

    // Security Hardening (SEC-01): Public registration must unconditionally assign the 'Citizen' role.
    // Any user-supplied role is strictly ignored to prevent privilege escalation.
    const user = await User.create({
      fullName: (fullName || '').trim(),
      email: normalizedEmail,
      password,
      role: 'Citizen'
    });

    if (user) {
      const userPayload = formatUserProfile(user);
      userPayload.documents = [];
      if (userPayload.profile) {
        userPayload.profile.documents = [];
      }

      res.status(201).json({
        success: true,
        isNewUser: true,
        ...userPayload,
        user: userPayload,
        profile: userPayload.profile,
        documents: [],
        token: generateToken(user._id, user.fullName, user.role),
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    if (
      error.code === 11000 ||
      (error.name === 'MongoServerError' && error.code === 11000) ||
      (typeof error.message === 'string' && error.message.includes('E11000'))
    ) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists. Please sign in.'
      });
    }
    console.error('[Registration Error]:', error);
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const device = req.headers?.['user-agent'] || 'Unknown';

    if (!email || !password || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide both email and password' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    const normalizedEmail = (email || '').trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.isActive === false) {
      return res.status(403).json({ success: false, message: 'Your account has been suspended by an administrator. Please contact support.' });
    }

    // Check Lockout
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(423).json({ success: false, message: 'Account locked. Try again later.' });
    }

    if (await user.matchPassword(password)) {
      // Successful Login
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      
      // Update Login History
      user.loginHistory.push({ ipAddress, device, status: 'Success' });
      if (user.loginHistory.length > 50) user.loginHistory.shift(); // Keep last 50 records
      
      await user.save();

      const userPayload = formatUserProfile(user);
      const userDocs = await Document.find({ userId: user._id }).sort({ createdAt: -1 });
      userPayload.documents = userDocs;
      if (userPayload.profile) {
        userPayload.profile.documents = userDocs;
      }

      res.json({
        success: true,
        ...userPayload,
        user: userPayload,
        profile: userPayload.profile,
        documents: userDocs,
        token: generateToken(user._id, user.fullName, user.role),
      });
    } else {
      // Failed Login
      user.loginAttempts += 1;
      
      if (user.loginAttempts >= 5) {
        // Lock for 15 minutes
        user.lockUntil = Date.now() + 15 * 60 * 1000;
      }

      user.loginHistory.push({ ipAddress, device, status: 'Failed' });
      if (user.loginHistory.length > 50) user.loginHistory.shift();
      
      await user.save();

      const message = user.loginAttempts >= 5 
        ? 'Account locked due to too many failed attempts.' 
        : 'Invalid email or password';
        
      res.status(401).json({ success: false, message });
    }
  } catch (error) {
    console.error('[Login Error]:', error);
    res.status(500).json({ success: false, message: 'Login service encountered an unexpected error. Please try again.' });
  }
};

/**
 * Dedicated Administrator Login Endpoint
 * Enforces:
 * - Active account status check.
 * - Authoritative MongoDB role verification against approved administrative roles.
 * - Server-side email allowlist validation for Super Admin accounts.
 * - Issues a real signed JWT upon success.
 * - Rejects non-administrative users with HTTP 403 Forbidden.
 */
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const device = req.headers?.['user-agent'] || 'Unknown';

    if (!email || !password || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide both admin email and password' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof email !== 'string' || !emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    const normalizedEmail = (email || '').trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid administrator email or password' });
    }

    if (user.isActive === false) {
      return res.status(403).json({ success: false, message: 'Your administrative account has been suspended. Please contact the system administrator.' });
    }

    // Check Lockout
    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(423).json({ success: false, message: 'Account locked due to consecutive failed attempts. Try again later.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = Date.now() + 15 * 60 * 1000;
      }
      user.loginHistory.push({ ipAddress, device, status: 'Failed' });
      if (user.loginHistory.length > 50) user.loginHistory.shift();
      await user.save();

      const message = user.loginAttempts >= 5
        ? 'Account locked due to too many failed attempts.'
        : 'Invalid administrator email or password';
      return res.status(401).json({ success: false, message });
    }

    // Authoritative Database Role Verification
    if (!isValidAdminRole(user.role) || String(user.role).toLowerCase() === 'citizen') {
      user.loginHistory.push({ ipAddress, device, status: 'Failed' });
      await user.save();
      return res.status(403).json({
        success: false,
        message: 'Access denied: Account does not have administrative privileges.'
      });
    }

    // Server-Side Email Allowlist Validation for Super Admin accounts
    if ((user.role === 'Super Admin' || String(user.role).toLowerCase() === 'superadmin') && !isAuthorizedAdminEmail(normalizedEmail)) {
      user.loginHistory.push({ ipAddress, device, status: 'Failed' });
      await user.save();
      return res.status(403).json({
        success: false,
        message: 'Access denied: Account is not in the authorized administrator allowlist.'
      });
    }

    // Successful Admin Login
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.loginHistory.push({ ipAddress, device, status: 'Success' });
    if (user.loginHistory.length > 50) user.loginHistory.shift();
    await user.save();

    const token = generateToken(user._id, user.fullName, user.role);

    res.json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        token
      },
      token
    });
  } catch (error) {
    console.error('[Admin Login Error]:', error);
    res.status(500).json({ success: false, message: 'Administrator authentication service encountered an error. Please try again.' });
  }
};

export const generateOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = (email || '').trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Cryptographically secure 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    if (!user.otpTokens) user.otpTokens = {};
    user.otpTokens.email = { token: otp, expires, attempts: 0 };
    user.markModified('otpTokens');
    await user.save();

    const isProduction = process.env.NODE_ENV === 'production';
    const hasSmtpConfigured = !!(process.env.SMTP_HOST || process.env.SENDGRID_API_KEY);

    if (isProduction && !hasSmtpConfigured) {
      return res.status(503).json({
        success: false,
        message: 'OTP delivery provider is not configured for production. Please sign in with your password or contact support.'
      });
    }

    res.json({
      success: true,
      message: 'OTP generated successfully',
      isMockDelivery: !hasSmtpConfigured,
      ...(process.env.NODE_ENV !== 'production' ? { devOtp: otp } : {})
    });
  } catch (error) {
    console.error('[Generate OTP Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to generate OTP. Please try again.' });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = (email || '').trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const tokenObj = user.otpTokens?.email;
    if (!tokenObj || !tokenObj.token) {
      return res.status(400).json({ success: false, message: 'No OTP generated for this user' });
    }

    if (new Date() > tokenObj.expires) {
      delete user.otpTokens.email;
      user.markModified('otpTokens');
      await user.save();
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    tokenObj.attempts = (tokenObj.attempts || 0) + 1;

    if (tokenObj.attempts > 5) {
      delete user.otpTokens.email;
      user.markModified('otpTokens');
      await user.save();
      return res.status(429).json({ success: false, message: 'Too many invalid attempts. This OTP has been invalidated. Please generate a new one.' });
    }

    if (tokenObj.token !== otp) {
      user.markModified('otpTokens');
      await user.save();
      return res.status(400).json({ success: false, message: `Invalid OTP. ${5 - tokenObj.attempts} attempts remaining.` });
    }

    // OTP Verified successfully
    delete user.otpTokens.email;
    user.markModified('otpTokens');
    await user.save();

    res.json({ 
      success: true, 
      message: 'OTP verified successfully',
      token: generateToken(user._id, user.fullName, user.role)
    });
  } catch (error) {
    console.error('[Verify OTP Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to verify OTP. Please try again.' });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { idToken, accessToken, email: rawEmail, name: rawName, picture: rawPicture } = req.body;
    let verifiedEmail = '';
    let verifiedName = '';
    let verifiedPicture = '';
    let googleSub = '';

    const configuredClientId = process.env.GOOGLE_CLIENT_ID;

    // Fail closed in production if Google Auth is unconfigured
    if (process.env.NODE_ENV === 'production' && !configuredClientId) {
      return res.status(500).json({ success: false, message: 'Google authentication service is not configured on this server.' });
    }

    // Verify token with Google's endpoint (supports id_token tokeninfo or userinfo via access_token)
    if (idToken) {
      const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
      if (!response.ok) {
        return res.status(401).json({ success: false, message: 'Invalid or expired Google ID token' });
      }
      const payload = await response.json();

      // Issuer validation: Must be Google
      const validIssuers = ['accounts.google.com', 'https://accounts.google.com'];
      if (!payload.iss || !validIssuers.includes(payload.iss)) {
        return res.status(401).json({ success: false, message: 'Invalid token issuer' });
      }

      // Audience validation: Fail closed
      if (configuredClientId) {
        if (!payload.aud || payload.aud !== configuredClientId) {
          return res.status(401).json({ success: false, message: 'Google Token audience mismatch' });
        }
      } else if (process.env.NODE_ENV === 'production') {
        return res.status(401).json({ success: false, message: 'Google Client ID validation required in production' });
      }

      // Email verification check
      const isEmailVerified = payload.email_verified === true || payload.email_verified === 'true';
      if (!isEmailVerified) {
        return res.status(401).json({ success: false, message: 'Google email address is not verified' });
      }

      verifiedEmail = payload.email;
      verifiedName = payload.name || payload.given_name || 'Citizen User';
      verifiedPicture = payload.picture || '';
      googleSub = payload.sub;
    } else if (accessToken) {
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!response.ok) {
        return res.status(401).json({ success: false, message: 'Invalid or expired Google Access token' });
      }
      const userInfo = await response.json();

      const isEmailVerified = userInfo.email_verified === true || userInfo.email_verified === 'true';
      if (!isEmailVerified) {
        return res.status(401).json({ success: false, message: 'Google email address is not verified' });
      }

      verifiedEmail = userInfo.email;
      verifiedName = userInfo.name || 'Citizen User';
      verifiedPicture = userInfo.picture || '';
      googleSub = userInfo.sub;
    } else if (process.env.NODE_ENV !== 'production' && rawEmail) {
      // Local development test fallback only
      verifiedEmail = rawEmail;
      verifiedName = rawName || 'Test User';
      verifiedPicture = rawPicture || '';
    } else {
      return res.status(400).json({ success: false, message: 'Google authentication credential is required' });
    }

    if (!verifiedEmail) {
      return res.status(400).json({ success: false, message: 'Google account did not provide a valid email' });
    }

    verifiedEmail = verifiedEmail.trim().toLowerCase();
    let user = await User.findOne({ email: verifiedEmail });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
      user = await User.create({
        fullName: verifiedName,
        email: verifiedEmail,
        googleId: googleSub,
        avatarUrl: verifiedPicture,
        password: randomPassword,
        role: 'Citizen',
        profile: {
          age: null,
          gender: '',
          maritalStatus: '',
          state: '',
          district: '',
          annualIncome: undefined,
          category: '',
          occupation: '',
          educationLevel: '',
          profileCompletionScore: 0
        }
      });
    } else {
      if (googleSub && !user.googleId) {
        user.googleId = googleSub;
      }
      if (verifiedPicture && !user.avatarUrl) {
        user.avatarUrl = verifiedPicture;
      }
      await user.save();
    }

    const token = generateToken(user._id, user.fullName, user.role);
    const userPayload = formatUserProfile(user);
    const userDocs = await Document.find({ userId: user._id }).sort({ createdAt: -1 });
    userPayload.documents = userDocs;
    if (userPayload.profile) {
      userPayload.profile.documents = userDocs;
    }

    res.json({
      success: true,
      isNewUser,
      ...userPayload,
      user: userPayload,
      profile: userPayload.profile,
      documents: userDocs,
      token
    });
  } catch (error) {
    console.error('[Google Auth Error]:', error);
    res.status(500).json({ success: false, message: 'Google authentication service failure' });
  }
};

