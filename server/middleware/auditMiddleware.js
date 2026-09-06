import AuditLog from '../models/AuditLog.js';

export const auditLog = (action) => {
  return async (req, res, next) => {
    // We capture the response finish event to ensure the action succeeded
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          let entityId = req.params.id || req.body.id || req.body._id;
          
          await AuditLog.create({
            adminId: req.user?._id || null,
            adminName: req.user?.fullName || 'System',
            action: action,
            entityType: req.baseUrl.split('/').pop(), // e.g. 'schemes', 'applications'
            entityId: entityId || 'N/A',
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
            details: `Method: ${req.method} | URL: ${req.originalUrl}`,
            createdAt: new Date()
          });
        } catch (error) {
          console.error('Audit Log failed:', error);
        }
      }
    });
    next();
  };
};
