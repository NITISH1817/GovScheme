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
    res.json({ success: true, user });
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

    user.fullName = req.body.fullName || user.fullName;
    user.mobile = req.body.mobile || user.mobile;
    
    if (req.body.profile) {
      user.profile = {
        ...user.profile,
        ...req.body.profile
      };
    }

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      _id: updatedUser._id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      mobile: updatedUser.mobile,
      profile: updatedUser.profile,
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

