import User from '../models/User.js';
import Application from '../models/Application.js';
import Scheme from '../models/Scheme.js';
import AuditLog from '../models/AuditLog.js';

// @desc    Generate report based on period
// @route   GET /api/reports?period=daily|weekly|monthly|yearly
// @access  Private (Admin)
export const generateReport = async (req, res) => {
  const { period = 'daily' } = req.query;

  try {
    let dateLimit = new Date();
    switch (period) {
      case 'daily':
        dateLimit.setDate(dateLimit.getDate() - 1);
        break;
      case 'weekly':
        dateLimit.setDate(dateLimit.getDate() - 7);
        break;
      case 'monthly':
        dateLimit.setMonth(dateLimit.getMonth() - 1);
        break;
      case 'yearly':
        dateLimit.setFullYear(dateLimit.getFullYear() - 1);
        break;
      default:
        dateLimit.setDate(dateLimit.getDate() - 1);
    }

    const reportData = [];

    const newUsers = await User.countDocuments({ role: 'Citizen', createdAt: { $gte: dateLimit } });
    reportData.push({ id: 1, date: new Date().toISOString().split('T')[0], metric: 'New Registrations', value: newUsers });

    const newApplications = await Application.countDocuments({ createdAt: { $gte: dateLimit } });
    reportData.push({ id: 2, date: new Date().toISOString().split('T')[0], metric: 'Applications Submitted', value: newApplications });

    const approvedApplications = await Application.countDocuments({ status: 'Approved', updatedAt: { $gte: dateLimit } });
    reportData.push({ id: 3, date: new Date().toISOString().split('T')[0], metric: 'Applications Approved', value: approvedApplications });

    const rejectedApplications = await Application.countDocuments({ status: 'Rejected', updatedAt: { $gte: dateLimit } });
    reportData.push({ id: 4, date: new Date().toISOString().split('T')[0], metric: 'Applications Rejected', value: rejectedApplications });

    const newSchemes = await Scheme.countDocuments({ createdAt: { $gte: dateLimit } });
    reportData.push({ id: 5, date: new Date().toISOString().split('T')[0], metric: 'New Schemes Created', value: newSchemes });

    res.json({ success: true, report: reportData, period });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
