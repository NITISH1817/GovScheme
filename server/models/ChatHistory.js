import mongoose from 'mongoose';

const ChatHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['Text', 'Voice'], default: 'Text' },
  messages: [{
    role: { type: String, enum: ['user', 'assistant', 'system'] },
    content: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  contextData: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

export default mongoose.model('ChatHistory', ChatHistorySchema);
