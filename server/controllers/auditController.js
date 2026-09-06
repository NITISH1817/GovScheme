import AuditLog from '../models/AuditLog.js';

// @desc    Get all audit logs
// @route   GET /api/audit
// @access  Private (Admin)
export const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
