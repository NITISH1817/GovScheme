import mongoose from 'mongoose';
import User from '../models/User.js';
import Application from '../models/Application.js';
import Document from '../models/Document.js';

// @desc    Get all users (citizens)
// @route   GET /api/users
// @access  Private (Admin)
export const getUsers = async (req, res) => {
  try {
    const { role = 'Citizen', state, isActive, page = 1, limit = 20, q } = req.query;
    
    let filter = {};
    if (role && role !== 'All') {
      filter.role = role;
    }
    if (state && state !== 'All') {
      filter['profile.state'] = state;
    }
    if (isActive !== undefined && isActive !== 'All' && isActive !== '') {
      filter.isActive = isActive === 'true' || isActive === true;
    }
    
    if (q && typeof q === 'string' && q.trim()) {
      const safeQ = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { fullName: { $regex: safeQ, $options: 'i' } },
        { email: { $regex: safeQ, $options: 'i' } },
        { mobile: { $regex: safeQ, $options: 'i' } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const users = await User.find(filter)
      .select('-password -twoFactorSecret -resetPasswordToken -otpTokens -__v')
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum);
      
    const total = await User.countDocuments(filter);
    
    res.json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      citizens: users,
      users
    });
  } catch (error) {
    console.error('[Get Users Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve citizens.' });
  }
};

// @desc    Update user status (activate/suspend)
// @route   PUT /api/users/:id/status
// @access  Private (Admin)
export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID format' });
    }

    const { isActive } = req.body;
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Prevent suspending another SuperAdmin or yourself
    if (user.role === 'Super Admin' || req.user._id.toString() === user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot suspend this admin account' });
    }
    
    user.isActive = isActive;
    await user.save();
    
    res.json({ success: true, user: { _id: user._id, fullName: user.fullName, isActive: user.isActive } });
  } catch (error) {
    console.error('[Update User Status Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to update user status.' });
  }
};

export const formatUserProfile = (user) => {
  if (!user) return null;
  const p = user.profile || {};
  const profileDetails = {
    age: p.age !== undefined && p.age !== null && p.age !== '' ? Number(p.age) : undefined,
    gender: p.gender || '',
    maritalStatus: p.maritalStatus || '',
    state: p.state || '',
    district: p.district || '',
    annualIncome: p.annualIncome !== undefined && p.annualIncome !== null && p.annualIncome !== '' ? Number(p.annualIncome) : undefined,
    category: p.category || '',
    occupation: p.occupation || '',
    educationLevel: p.educationLevel || '',
    landHoldingAcres: p.landHoldingAcres !== undefined && p.landHoldingAcres !== null && p.landHoldingAcres !== '' ? Number(p.landHoldingAcres) : 0,
    familyMembersCount: p.familyMembersCount !== undefined && p.familyMembersCount !== null && p.familyMembersCount !== '' ? Number(p.familyMembersCount) : 1,
    hasDisability: Boolean(p.hasDisability),
    disabilityPercentage: p.disabilityPercentage !== undefined && p.disabilityPercentage !== null && p.disabilityPercentage !== '' ? Number(p.disabilityPercentage) : 0,
    isRegisteredWorker: Boolean(p.isRegisteredWorker),
    verificationBadge: Boolean(p.verificationBadge),
    profileCompletionScore: p.profileCompletionScore !== undefined && p.profileCompletionScore !== null ? Number(p.profileCompletionScore) : 0,
    interests: Array.isArray(p.interests) ? p.interests : []
  };

  return {
    id: user._id ? user._id.toString() : (user.id || ''),
    _id: user._id,
    fullName: user.fullName || '',
    email: user.email || '',
    mobile: user.mobile || '',
    avatarUrl: user.avatarUrl || '',
    role: user.role || 'Citizen',
    savedSchemeIds: Array.isArray(user.savedSchemeIds) ? user.savedSchemeIds : [],
    ...profileDetails,
    profile: profileDetails
  };
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const formatted = formatUserProfile(user);
    const documents = await Document.find({ userId: req.user._id }).sort({ createdAt: -1 });
    formatted.documents = documents;
    if (formatted.profile) {
      formatted.profile.documents = documents;
    }

    res.json({
      success: true,
      ...formatted,
      user: formatted,
      profile: formatted,
      documents
    });
  } catch (error) {
    console.error('[Get User Profile Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to load citizen profile.' });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.body.fullName !== undefined) {
      if (typeof req.body.fullName !== 'string' || !req.body.fullName.trim()) {
        return res.status(400).json({ success: false, message: 'Full name cannot be empty' });
      }
      user.fullName = req.body.fullName.trim();
    }

    if (req.body.mobile !== undefined) user.mobile = String(req.body.mobile).trim();
    if (req.body.avatarUrl !== undefined) user.avatarUrl = String(req.body.avatarUrl).trim();
    if (Array.isArray(req.body.savedSchemeIds)) {
      user.savedSchemeIds = req.body.savedSchemeIds;
    }

    // Merge profile fields whether provided flat or nested under profile
    const p = req.body.profile && typeof req.body.profile === 'object' ? req.body.profile : req.body;
    if (!user.profile) {
      user.profile = {};
    }

    if (p.age !== undefined && p.age !== null && p.age !== '') {
      const ageNum = Number(p.age);
      if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
        return res.status(400).json({ success: false, message: 'Invalid age: must be a number between 1 and 120' });
      }
      user.profile.age = ageNum;
    }

    if (p.annualIncome !== undefined && p.annualIncome !== null && p.annualIncome !== '') {
      const incomeNum = Number(p.annualIncome);
      if (isNaN(incomeNum) || incomeNum < 0) {
        return res.status(400).json({ success: false, message: 'Invalid annual income: must be non-negative' });
      }
      user.profile.annualIncome = incomeNum;
    }

    if (p.landHoldingAcres !== undefined && p.landHoldingAcres !== null && p.landHoldingAcres !== '') {
      const landNum = Number(p.landHoldingAcres);
      if (isNaN(landNum) || landNum < 0) {
        return res.status(400).json({ success: false, message: 'Invalid land holding acres: must be non-negative' });
      }
      user.profile.landHoldingAcres = landNum;
    }

    if (p.disabilityPercentage !== undefined && p.disabilityPercentage !== null && p.disabilityPercentage !== '') {
      const disNum = Number(p.disabilityPercentage);
      if (isNaN(disNum) || disNum < 0 || disNum > 100) {
        return res.status(400).json({ success: false, message: 'Invalid disability percentage: must be between 0 and 100' });
      }
      user.profile.disabilityPercentage = disNum;
    }

    if (p.familyMembersCount !== undefined && p.familyMembersCount !== null && p.familyMembersCount !== '') {
      const famNum = Number(p.familyMembersCount);
      if (isNaN(famNum) || famNum < 1) {
        return res.status(400).json({ success: false, message: 'Family members count must be at least 1' });
      }
      user.profile.familyMembersCount = famNum;
    }

    if (p.gender !== undefined) user.profile.gender = String(p.gender).trim();
    if (p.maritalStatus !== undefined) user.profile.maritalStatus = String(p.maritalStatus).trim();
    if (p.state !== undefined) user.profile.state = String(p.state).trim();
    if (p.district !== undefined) user.profile.district = String(p.district).trim();
    if (p.category !== undefined) user.profile.category = String(p.category).trim();
    if (p.occupation !== undefined) user.profile.occupation = String(p.occupation).trim();
    if (p.educationLevel !== undefined) user.profile.educationLevel = String(p.educationLevel).trim();
    if (p.hasDisability !== undefined) user.profile.hasDisability = Boolean(p.hasDisability);
    if (p.isRegisteredWorker !== undefined) user.profile.isRegisteredWorker = Boolean(p.isRegisteredWorker);
    if (p.verificationBadge !== undefined) user.profile.verificationBadge = Boolean(p.verificationBadge);
    if (Array.isArray(p.interests)) user.profile.interests = p.interests;

    // Calculate authoritative profile completion score on backend
    let score = 0;
    if (user.fullName && user.fullName.trim()) score += 10;
    if (user.mobile && user.mobile.trim()) score += 10;
    if (typeof user.profile.age === 'number' && user.profile.age > 0) score += 10;
    if (user.profile.gender && user.profile.gender.trim()) score += 10;
    if (user.profile.state && user.profile.state.trim()) score += 10;
    if (user.profile.district && user.profile.district.trim()) score += 10;
    if (user.profile.occupation && user.profile.occupation.trim()) score += 15;
    if (user.profile.annualIncome !== undefined && user.profile.annualIncome !== null) score += 15;
    if (user.profile.educationLevel && user.profile.educationLevel.trim()) score += 10;
    user.profile.profileCompletionScore = Math.min(100, score);

    // Security: Never allow a user to alter their role via profile updates
    // Any req.body.role or p.role is strictly ignored.

    if (req.body.password !== undefined) {
      if (typeof req.body.password !== 'string' || req.body.password.length < 8) {
        return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long' });
      }
      user.password = req.body.password;
    }

    user.markModified('profile');
    const updatedUser = await user.save();
    const formatted = formatUserProfile(updatedUser);

    res.json({
      success: true,
      ...formatted,
      user: formatted,
      profile: formatted
    });
  } catch (error) {
    console.error('[Update User Profile Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to update citizen profile.' });
  }
};


// @desc    Get detailed citizen profile with their applications and documents
// @route   GET /api/users/:id/details
// @access  Private (Admin)
export const getCitizenDetails = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid citizen ID format' });
    }

    const user = await User.findById(id).select('-password -twoFactorSecret -resetPasswordToken -otpTokens -__v');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Citizen not found' });
    }

    const [applications, documents] = await Promise.all([
      Application.find({ userId: user._id }).populate('schemeId', 'name department category'),
      Document.find({ userId: user._id }).select('-extractedData.rawText')
    ]);

    res.json({
      success: true,
      citizen: user,
      user,
      applications,
      documents
    });
  } catch (error) {
    console.error('[Get Citizen Details Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve citizen details.' });
  }
};

