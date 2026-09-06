import User from '../models/User.js';
import Scheme from '../models/Scheme.js';
import Application from '../models/Application.js';

// @desc    Global Search across Schemes, Users, and Applications
// @route   GET /api/search?q=query
// @access  Private (Admin)
export const globalSearch = async (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.json({ success: true, results: [] });
  }

  try {
    const regex = new RegExp(q, 'i');
    const results = [];

    // Search Schemes
    const schemes = await Scheme.find({ 
      $or: [{ name: regex }, { department: regex }, { id: regex }] 
    }).limit(5).select('id name department status');

    schemes.forEach(s => {
      results.push({
        type: 'Scheme',
        id: s._id,
        title: s.name,
        subtitle: s.department,
        status: s.status,
        url: `/admin/schemes` // In a real app we'd deep link
      });
    });

    // Search Users
    const users = await User.find({
      $or: [{ fullName: regex }, { phone: regex }, { email: regex }]
    }).limit(5).select('_id fullName phone role');

    users.forEach(u => {
      results.push({
        type: 'User',
        id: u._id,
        title: u.fullName,
        subtitle: u.phone,
        status: u.role,
        url: `/admin/users`
      });
    });

    // Search Applications
    const applications = await Application.find({
      $or: [{ id: regex }]
    }).populate('schemeId', 'name').limit(5);

    applications.forEach(a => {
      results.push({
        type: 'Application',
        id: a._id,
        title: a.id,
        subtitle: a.schemeId ? a.schemeId.name : 'Unknown Scheme',
        status: a.status,
        url: `/admin/applications`
      });
    });

    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
