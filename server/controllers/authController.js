import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id, name, role) => {
  return jwt.sign({ id, name, role }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

export const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      fullName,
      email,
      password,
      role: role || 'Citizen'
    });

    if (user) {
      const userPayload = {
        _id: user._id,
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        age: user.age || 25,
        gender: user.gender || 'Female',
        state: user.state || 'Maharashtra',
        annualIncome: user.annualIncome || 200000,
        occupation: user.occupation || 'Employed',
        category: user.category || 'General',
        profileCompletionScore: 60,
      };

      res.status(201).json({
        success: true,
        ...userPayload,
        user: userPayload,
        token: generateToken(user._id, user.fullName, user.role),
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const device = req.headers['user-agent'] || 'Unknown';

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
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

      const userPayload = {
        _id: user._id,
        id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        age: user.age || 35,
        gender: user.gender || 'Female',
        state: user.state || 'Maharashtra',
        annualIncome: user.annualIncome || 250000,
        occupation: user.occupation || 'Employed',
        category: user.category || 'General',
        profileCompletionScore: 100,
      };

      res.json({
        success: true,
        ...userPayload,
        user: userPayload,
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
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generateOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    user.otpTokens = {
      ...user.otpTokens,
      email: { token: otp, expires }
    };
    await user.save();

    // Mock sending email via Nodemailer
    console.log(`[MOCK EMAIL] OTP for ${email} is ${otp}`);

    res.json({ success: true, message: 'OTP sent successfully to email' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const tokenObj = user.otpTokens?.email;
    if (!tokenObj || !tokenObj.token) {
      return res.status(400).json({ success: false, message: 'No OTP generated for this user' });
    }

    if (new Date() > tokenObj.expires) {
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    if (tokenObj.token !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    // OTP Verified successfully
    user.otpTokens.email = undefined;
    await user.save();

    res.json({ 
      success: true, 
      message: 'OTP verified successfully',
      token: generateToken(user._id, user.fullName, user.role)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { idToken, accessToken, email: rawEmail, name: rawName, picture: rawPicture } = req.body;
    let verifiedEmail = '';
    let verifiedName = '';
    let verifiedPicture = '';
    let googleSub = '';

    // Verify token with Google's endpoint (supports id_token tokeninfo or userinfo via access_token)
    if (idToken) {
      const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
      if (!response.ok) {
        return res.status(401).json({ success: false, message: 'Invalid or expired Google ID token' });
      }
      const payload = await response.json();
      
      const configuredClientId = process.env.GOOGLE_CLIENT_ID;
      if (configuredClientId && payload.aud && payload.aud !== configuredClientId) {
        return res.status(401).json({ success: false, message: 'Google Token audience mismatch' });
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

    let user = await User.findOne({ email: verifiedEmail });

    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
      user = await User.create({
        fullName: verifiedName,
        email: verifiedEmail,
        googleId: googleSub,
        avatarUrl: verifiedPicture,
        password: randomPassword,
        role: 'Citizen',
        profile: {
          age: 25,
          gender: 'Male',
          maritalStatus: 'Single',
          state: '',
          district: '',
          annualIncome: 0,
          category: 'General',
          occupation: '',
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

    res.json({
      success: true,
      _id: user._id,
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      savedSchemeIds: user.savedSchemeIds || [],
      profile: user.profile || {},
      token,
      user
    });
  } catch (error) {
    console.error('[Google Auth Error]:', error);
    res.status(500).json({ success: false, message: 'Google authentication service failure' });
  }
};

