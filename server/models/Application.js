import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  schemeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Scheme', required: true },
  status: { 
    type: String, 
    enum: ['Started', 'Documents Uploaded', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Benefit Released'],
    default: 'Started' 
  },
  uploadedDocuments: [{
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
    verified: { type: Boolean, default: false }
  }],
  timeline: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    remarks: String,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } 
  }],
  remarks: { type: String },
  assignedOfficerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Application', ApplicationSchema);
