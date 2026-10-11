import AuditLog from '../models/AuditLog.js';

// @desc    Get all audit logs
// @route   GET /api/audit
// @access  Private (Admin)
export const getAuditLogs = async (req, res) => {
  try {
    const { action, entityType, q, page = 1, limit = 50 } = req.query;
    let filter = {};

    if (action && action !== 'All') {
      filter.action = action;
    }
    if (entityType && entityType !== 'All') {
      filter.entityType = entityType;
    }
    if (q) {
      filter.$or = [
        { action: { $regex: q, $options: 'i' } },
        { adminName: { $regex: q, $options: 'i' } },
        { entityType: { $regex: q, $options: 'i' } },
        { entityId: { $regex: q, $options: 'i' } },
        { details: { $regex: q, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await AuditLog.countDocuments(filter);

    res.json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      logs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
