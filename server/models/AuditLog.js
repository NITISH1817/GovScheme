import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  adminName: { type: String, default: 'System' },
  action: { type: String, required: true },
  entityType: { type: String },
  entityId: { type: String },
  oldValue: { type: mongoose.Schema.Types.Mixed },
  newValue: { type: mongoose.Schema.Types.Mixed },
  details: { type: String },
  ipAddress: { type: String },
  userAgent: { type: String },
  device: { type: String }
}, { timestamps: true });

export default mongoose.model('AuditLog', AuditLogSchema);
