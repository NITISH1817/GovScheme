import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['Broadcast', 'System', 'ApplicationUpdate', 'SchemeAlert'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  actionUrl: { type: String },
  targetAudience: {
    state: String,
    category: String,
    occupation: String,
    ageMin: Number,
    ageMax: Number
  }
}, { timestamps: true });

export default mongoose.model('Notification', NotificationSchema);
