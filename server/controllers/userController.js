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

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const profileData = {
      id: user._id.toString(),
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      mobile: user.mobile || '',
      avatarUrl: user.avatarUrl || '',
      role: user.role,
      savedSchemeIds: user.savedSchemeIds || [],
      age: user.profile?.age ?? 25,
      gender: user.profile?.gender || 'Male',
      maritalStatus: user.profile?.maritalStatus || 'Single',
      state: user.profile?.state || '',
      district: user.profile?.district || '',
      annualIncome: user.profile?.annualIncome ?? 0,
      category: user.profile?.category || 'General',
      occupation: user.profile?.occupation || '',
      educationLevel: user.profile?.educationLevel || '',
      landHoldingAcres: user.profile?.landHoldingAcres ?? 0,
      familyMembersCount: user.profile?.familyMembersCount ?? 1,
      hasDisability: user.profile?.hasDisability || false,
      disabilityPercentage: user.profile?.disabilityPercentage ?? 0,
      isRegisteredWorker: user.profile?.isRegisteredWorker || false,
      verificationBadge: user.profile?.verificationBadge || false,
      profileCompletionScore: user.profile?.profileCompletionScore ?? 0,
      interests: user.profile?.interests || []
    };

    res.json({ success: true, user: profileData, profile: profileData });
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
    user.profile = {
      ...user.profile,
      age: p.age !== undefined && p.age !== '' ? Number(p.age) : user.profile?.age,
      gender: p.gender || user.profile?.gender,
      maritalStatus: p.maritalStatus || user.profile?.maritalStatus,
      state: p.state !== undefined ? p.state : user.profile?.state,
      district: p.district !== undefined ? p.district : user.profile?.district,
      annualIncome: p.annualIncome !== undefined && p.annualIncome !== '' ? Number(p.annualIncome) : user.profile?.annualIncome,
      category: p.category || user.profile?.category,
      occupation: p.occupation !== undefined ? p.occupation : user.profile?.occupation,
      educationLevel: p.educationLevel !== undefined ? p.educationLevel : user.profile?.educationLevel,
      landHoldingAcres: p.landHoldingAcres !== undefined && p.landHoldingAcres !== '' ? Number(p.landHoldingAcres) : user.profile?.landHoldingAcres,
      familyMembersCount: p.familyMembersCount !== undefined ? Number(p.familyMembersCount) : user.profile?.familyMembersCount,
      hasDisability: p.hasDisability !== undefined ? Boolean(p.hasDisability) : user.profile?.hasDisability,
      disabilityPercentage: p.disabilityPercentage !== undefined ? Number(p.disabilityPercentage) : user.profile?.disabilityPercentage,
      isRegisteredWorker: p.isRegisteredWorker !== undefined ? Boolean(p.isRegisteredWorker) : user.profile?.isRegisteredWorker,
      verificationBadge: p.verificationBadge !== undefined ? Boolean(p.verificationBadge) : user.profile?.verificationBadge,
      profileCompletionScore: p.profileCompletionScore !== undefined ? Number(p.profileCompletionScore) : user.profile?.profileCompletionScore,
      interests: Array.isArray(p.interests) ? p.interests : user.profile?.interests
    };

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    const flatProfile = {
      id: updatedUser._id.toString(),
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      mobile: updatedUser.mobile || '',
      avatarUrl: updatedUser.avatarUrl || '',
      role: updatedUser.role,
      savedSchemeIds: updatedUser.savedSchemeIds || [],
      age: updatedUser.profile?.age ?? 25,
      gender: updatedUser.profile?.gender || 'Male',
      maritalStatus: updatedUser.profile?.maritalStatus || 'Single',
      state: updatedUser.profile?.state || '',
      district: updatedUser.profile?.district || '',
      annualIncome: updatedUser.profile?.annualIncome ?? 0,
      category: updatedUser.profile?.category || 'General',
      occupation: updatedUser.profile?.occupation || '',
      educationLevel: updatedUser.profile?.educationLevel || '',
      landHoldingAcres: updatedUser.profile?.landHoldingAcres ?? 0,
      familyMembersCount: updatedUser.profile?.familyMembersCount ?? 1,
      hasDisability: updatedUser.profile?.hasDisability || false,
      disabilityPercentage: updatedUser.profile?.disabilityPercentage ?? 0,
      isRegisteredWorker: updatedUser.profile?.isRegisteredWorker || false,
      verificationBadge: updatedUser.profile?.verificationBadge || false,
      profileCompletionScore: updatedUser.profile?.profileCompletionScore ?? 0,
      interests: updatedUser.profile?.interests || []
    };

    res.json({
      success: true,
      user: flatProfile,
      profile: flatProfile
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

