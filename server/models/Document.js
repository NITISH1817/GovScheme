import mongoose from 'mongoose';

export const VALID_DOCUMENT_TYPES = [
  'Aadhaar',
  'aadhaar',
  'Ration Card',
  'ration_card',
  'Income Certificate',
  'income_certificate',
  'Community Certificate',
  'community_certificate',
  'First Graduate Certificate',
  'first_graduate',
  'Residence Certificate',
  'residence_certificate',
  'Birth Certificate',
  'birth_certificate',
  'Disability Certificate',
  'disability_certificate',
  'Voter ID',
  'voter_id',
  'Farmer Certificate',
  'farmer_certificate',
  'PAN',
  'pan',
  'Bank Passbook',
  'bank_passbook',
  'Education Certificate',
  'education_certificate',
  'Other',
  'other'
];

export const VERIFICATION_STATUSES = [
  'PENDING',
  'PROCESSING',
  'TEXT_EXTRACTED',
  'NEEDS_REVIEW',
  'CHECKS_PASSED',
  'ADMIN_VERIFIED',
  'OFFICIALLY_VERIFIED',
  'VERIFICATION_FAILED',
  'INCONCLUSIVE'
];

const DocumentSchema = new mongoose.Schema({
  documentId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  documentType: { 
    type: String, 
    enum: VALID_DOCUMENT_TYPES,
    required: true,
    index: true
  },
  // Legacy alias for backwards compatibility
  type: {
    type: String,
    enum: VALID_DOCUMENT_TYPES
  },
  originalFileName: { type: String },
  fileMimeType: { type: String },
  fileSize: { type: Number },
  fileUrl: { type: String, required: true },
  
  // OCR processing workflow fields
  ocrStatus: { 
    type: String, 
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'NEEDS_REVIEW'],
    default: 'PENDING',
    index: true
  },
  rawOcrText: { type: String, default: '' },
  
  // Structured fields directly from OCR
  extractedFields: {
    fullName: { type: String },
    dob: { type: String },
    gender: { type: String },
    state: { type: String },
    district: { type: String },
    annualIncome: { type: Number },
    category: { type: String },
    docNumber: { type: String },
    issueDate: { type: String },
    issuingAuthority: { type: String },
    occupation: { type: String },
    fatherName: { type: String },
    address: { type: String },
    age: { type: Number },
    disabilityPercentage: { type: Number },
    rawFields: { type: mongoose.Schema.Types.Mixed, default: {} }
  },

  // Per-field defensible confidence scores from OCR (0-100)
  fieldConfidences: {
    fullName: { type: Number },
    dob: { type: Number },
    gender: { type: Number },
    state: { type: Number },
    district: { type: Number },
    annualIncome: { type: Number },
    category: { type: Number },
    docNumber: { type: Number },
    issueDate: { type: Number },
    issuingAuthority: { type: Number },
    overall: { type: Number }
  },

  // Missing, ambiguous, or invalid value flags detected by OCR engine
  fieldFlags: [{
    field: { type: String, required: true },
    type: { type: String, enum: ['MISSING', 'AMBIGUOUS', 'POTENTIALLY_INVALID', 'LOW_CONFIDENCE'] },
    message: { type: String }
  }],

  // User-corrected fields saved strictly separately from original OCR output
  correctedFields: {
    fullName: { type: String },
    dob: { type: String },
    gender: { type: String },
    state: { type: String },
    district: { type: String },
    annualIncome: { type: Number },
    category: { type: String },
    docNumber: { type: String },
    issueDate: { type: String },
    issuingAuthority: { type: String },
    occupation: { type: String },
    fatherName: { type: String },
    address: { type: String },
    age: { type: Number },
    disabilityPercentage: { type: Number }
  },

  isUserConfirmed: { type: Boolean, default: false },
  correctionTimestamp: { type: Date },
  extractedAt: { type: Date },

  // Verification Module 4 fields
  verificationStatus: {
    type: String,
    enum: VERIFICATION_STATUSES,
    default: 'PENDING',
    index: true
  },
  verificationChecks: [{
    checkName: { type: String, required: true },
    passed: { type: Boolean, required: true },
    details: { type: String },
    severity: { type: String, enum: ['INFO', 'WARNING', 'ERROR'], default: 'INFO' }
  }],
  verificationLimitations: [{ type: String }],
  verificationOutcomeReason: { type: String },
  verifiedAt: { type: Date },

  // Document metadata and admin compatibility
  docNumber: { type: String },
  verified: { type: Boolean, default: false },
  status: { type: String, default: 'Pending' }
}, { timestamps: true });

// Auto-sync legacy fields
DocumentSchema.pre('save', function() {
  if (this.documentType && !this.type) {
    this.type = this.documentType;
  } else if (this.type && !this.documentType) {
    this.documentType = this.type;
  }
  const effectiveNum = this.correctedFields?.docNumber || this.extractedFields?.docNumber;
  if (effectiveNum && !this.docNumber) {
    this.docNumber = effectiveNum;
  }
  this.verified = this.status === 'Verified' || this.verificationStatus === 'ADMIN_VERIFIED' || this.verificationStatus === 'OFFICIALLY_VERIFIED' || this.verificationStatus === 'CHECKS_PASSED';
});

export default mongoose.model('Document', DocumentSchema);
