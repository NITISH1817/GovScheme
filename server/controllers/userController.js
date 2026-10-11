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
    
    if (q) {
      filter.$or = [
        { fullName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { mobile: { $regex: q, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const users = await User.find(filter)
      .select('-password')
      .sort('-createdAt')
      .skip(skip)
      .limit(limitNum);
      
    const total = await User.countDocuments(filter);
    
    res.json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user status (activate/suspend)
// @route   PUT /api/users/:id/status
// @access  Private (Admin)
export const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    
    const user = await User.findById(req.params.id);
    
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
    res.status(500).json({ success: false, message: error.message });
  }
};

export const formatUserProfile = (user) => {
  if (!user) return null;
  const p = user.profile || {};
  const profileDetails = {
    age: p.age !== undefined && p.age !== null ? Number(p.age) : 25,
    gender: p.gender || 'Male',
    maritalStatus: p.maritalStatus || 'Single',
    state: p.state || '',
    district: p.district || '',
    annualIncome: p.annualIncome !== undefined && p.annualIncome !== null ? Number(p.annualIncome) : 0,
    category: p.category || 'General',
    occupation: p.occupation || '',
    educationLevel: p.educationLevel || '',
    landHoldingAcres: p.landHoldingAcres !== undefined && p.landHoldingAcres !== null ? Number(p.landHoldingAcres) : 0,
    familyMembersCount: p.familyMembersCount !== undefined && p.familyMembersCount !== null ? Number(p.familyMembersCount) : 1,
    hasDisability: Boolean(p.hasDisability),
    disabilityPercentage: p.disabilityPercentage !== undefined && p.disabilityPercentage !== null ? Number(p.disabilityPercentage) : 0,
    isRegisteredWorker: Boolean(p.isRegisteredWorker),
    verificationBadge: Boolean(p.verificationBadge),
    profileCompletionScore: p.profileCompletionScore !== undefined && p.profileCompletionScore !== null ? Number(p.profileCompletionScore) : 0,
    interests: Array.isArray(p.interests) ? p.interests : []
  };

  return {
    id: user._id.toString(),
    _id: user._id,
    fullName: user.fullName || '',
    email: user.email || '',
    mobile: user.mobile || '',
    avatarUrl: user.avatarUrl || '',
    role: user.role || 'Citizen',
    savedSchemeIds: user.savedSchemeIds || [],
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
    res.json({
      success: true,
      ...formatted,
      user: formatted,
      profile: formatted
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (req.body.fullName) user.fullName = req.body.fullName.trim();
    if (req.body.mobile !== undefined) user.mobile = req.body.mobile;
    if (req.body.avatarUrl) user.avatarUrl = req.body.avatarUrl;
    if (Array.isArray(req.body.savedSchemeIds)) {
      user.savedSchemeIds = req.body.savedSchemeIds;
    }

    // Merge profile fields whether provided flat or nested under profile
    const p = req.body.profile || req.body;
    if (!user.profile) {
      user.profile = {};
    }

    if (p.age !== undefined && p.age !== '') user.profile.age = Number(p.age);
    if (p.gender !== undefined) user.profile.gender = p.gender;
    if (p.maritalStatus !== undefined) user.profile.maritalStatus = p.maritalStatus;
    if (p.state !== undefined) user.profile.state = p.state;
    if (p.district !== undefined) user.profile.district = p.district;
    if (p.annualIncome !== undefined && p.annualIncome !== '') user.profile.annualIncome = Number(p.annualIncome);
    if (p.category !== undefined) user.profile.category = p.category;
    if (p.occupation !== undefined) user.profile.occupation = p.occupation;
    if (p.educationLevel !== undefined) user.profile.educationLevel = p.educationLevel;
    if (p.landHoldingAcres !== undefined && p.landHoldingAcres !== '') user.profile.landHoldingAcres = Number(p.landHoldingAcres);
    if (p.familyMembersCount !== undefined && p.familyMembersCount !== '') user.profile.familyMembersCount = Number(p.familyMembersCount);
    if (p.hasDisability !== undefined) user.profile.hasDisability = Boolean(p.hasDisability);
    if (p.disabilityPercentage !== undefined && p.disabilityPercentage !== '') user.profile.disabilityPercentage = Number(p.disabilityPercentage);
    if (p.isRegisteredWorker !== undefined) user.profile.isRegisteredWorker = Boolean(p.isRegisteredWorker);
    if (p.verificationBadge !== undefined) user.profile.verificationBadge = Boolean(p.verificationBadge);
    if (p.profileCompletionScore !== undefined && p.profileCompletionScore !== '') user.profile.profileCompletionScore = Number(p.profileCompletionScore);
    if (Array.isArray(p.interests)) user.profile.interests = p.interests;

    if (req.body.password) {
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
    res.status(500).json({ success: false, message: error.message });
  }
};


// @desc    Get detailed citizen profile with their applications and documents
// @route   GET /api/users/:id/details
// @access  Private (Admin)
export const getCitizenDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Citizen not found' });
    }

    const [applications, documents] = await Promise.all([
      Application.find({ userId: user._id }).populate('schemeId', 'name department category'),
      Document.find({ userId: user._id })
    ]);

    res.json({
      success: true,
      user,
      applications,
      documents
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

