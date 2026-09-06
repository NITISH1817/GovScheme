import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['Aadhaar', 'PAN', 'Income Certificate', 'Community Certificate', 'Ration Card', 'Bank Passbook', 'Other'],
    required: true
  },
  cloudinaryUrl: { type: String, required: true },
  ocrStatus: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
  extractedData: { type: mongoose.Schema.Types.Mixed },
  confidenceScore: { type: Number },
  verified: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Document', DocumentSchema);
