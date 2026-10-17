import mongoose from 'mongoose';

export const SCHEME_VERIFICATION_STATUSES = [
  'UNVERIFIED',
  'PENDING',
  'PORTAL_CURATED',
  'ADMIN_VERIFIED',
  'OFFICIALLY_VERIFIED',
  'Verified' // Retained for backwards compatibility with legacy documents
];

const SchemeSchema = new mongoose.Schema({
  schemeId: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  },
  // Legacy id alias for frontend backwards compatibility
  id: { 
    type: String, 
    required: true, 
    unique: true, 
    index: true 
  },
  schemeName: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  shortDescription: { type: String, required: true },
  detailedDescription: { type: String },

  governmentLevel: { 
    type: String, 
    enum: ['Central', 'State', 'District', 'Municipal'],
    default: 'Central',
    index: true
  },
  state: { type: String, required: true, index: true },
  ministry: { type: String },
  department: { type: String, required: true },

  category: { 
    type: String, 
    required: true, 
    index: true 
  },
  subcategory: { type: String },
  subCategory: { type: String },

  benefits: { type: mongoose.Schema.Types.Mixed, required: true },
  benefitsSummary: { type: String },
  benefitAmount: { type: mongoose.Schema.Types.Mixed, default: "" },
  financialBenefitAmount: { type: mongoose.Schema.Types.Mixed, default: "" },
  benefitFrequency: { 
    type: String, 
    default: 'As needed' 
  },

  // Structured eligibility conditions
  minimumAge: { type: Number, default: 0 },
  maximumAge: { type: Number, default: 120 },
  incomeLimit: { type: mongoose.Schema.Types.Mixed, default: null }, // number or null
  eligibleOccupations: [{ type: String }],
  educationRequirements: { type: mongoose.Schema.Types.Mixed, default: [] },
  genderRequirements: { type: mongoose.Schema.Types.Mixed, default: 'All' },
  applicableSocialCategories: { type: mongoose.Schema.Types.Mixed, default: ['All'] },
  
  disabilityRequirements: { type: mongoose.Schema.Types.Mixed, default: 'All' },
  studentRequirements: { type: mongoose.Schema.Types.Mixed, default: 'No' },
  farmerRequirements: { type: mongoose.Schema.Types.Mixed, default: 'No' },
  firstGraduateRequirements: { type: mongoose.Schema.Types.Mixed, default: 'No' },
  residenceRequirements: { type: mongoose.Schema.Types.Mixed, default: 'Citizen of India' },

  otherEligibilityRules: { type: mongoose.Schema.Types.Mixed, default: {} },
  
  // Legacy compatibility rules block
  eligibilityRules: {
    incomeLimit: { type: Number, default: 0 },
    ageMin: { type: Number, default: 0 },
    ageMax: { type: Number, default: 120 },
    minAge: { type: Number, default: 0 },
    maxAge: { type: Number, default: 120 },
    gender: { type: [String], default: ['All'] },
    allowedGenders: { type: [String], default: ['All'] },
    occupation: { type: [String], default: [] },
    allowedOccupations: { type: [String], default: [] },
    education: { type: [String], default: [] },
    category: { type: [String], default: ['All'] },
    allowedCategories: { type: [String], default: ['All'] },
    allowedStates: { type: [String], default: ['All'] },
    disabilityRequired: { type: Boolean, default: false },
    familySizeMax: { type: Number, default: 99 },
    landOwnershipMax: { type: Number, default: 999 },
    maxLandHoldingAcres: { type: Number, default: 999 }
  },

  requiredDocuments: [{ type: String }],
  documentsRequired: [{ type: String }],

  applicationMode: { 
    type: String, 
    default: 'Online' 
  },
  applicationSteps: [{ type: String }],

  officialWebsite: { type: String },
  officialApplicationUrl: { type: String },
  officialApplyUrl: { type: String },
  applyURL: { type: String },
  officialHelpline: { type: String },
  helpline: { type: String },

  sourceUrl: { type: String, required: true },
  curationSource: { type: String, default: 'Official Government Portal' },
  lastVerifiedAt: { type: Date, default: Date.now },
  verificationStatus: { 
    type: String, 
    enum: [
      'UNVERIFIED',
      'PENDING',
      'PORTAL_CURATED',
      'ADMIN_VERIFIED',
      'OFFICIALLY_VERIFIED',
      'Verified' // Retained for backwards compatibility with legacy documents
    ],
    default: 'PORTAL_CURATED',
    index: true
  },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verificationEvidence: { type: String },
  activeStatus: { type: Boolean, default: true, index: true },
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Archived', 'Suspended'],
    default: 'Published',
    index: true
  },
  keywords: [{ type: String }],
  tags: [{ type: String }],

  faqs: [{
    question: { type: String },
    answer: { type: String }
  }],

  version: { type: Number, default: 1 }
}, { timestamps: true });

// Auto-sync legacy fields before saving
SchemeSchema.pre('save', function() {
  if (this.schemeId && !this.id) this.id = this.schemeId;
  if (this.id && !this.schemeId) this.schemeId = this.id;
  if (this.schemeName && !this.name) this.name = this.schemeName;
  if (this.name && !this.schemeName) this.schemeName = this.name;
  if (this.description && !this.shortDescription) this.shortDescription = this.description;
  if (this.shortDescription && !this.description) this.description = this.shortDescription;
  if (this.benefitAmount && !this.financialBenefitAmount) this.financialBenefitAmount = this.benefitAmount;
  if (this.financialBenefitAmount && !this.benefitAmount) this.benefitAmount = this.financialBenefitAmount;
  if (this.officialApplicationUrl && !this.applyURL) this.applyURL = this.officialApplicationUrl;
  if (this.applyURL && !this.officialApplicationUrl) this.officialApplicationUrl = this.applyURL;
  if (this.officialHelpline && !this.helpline) this.helpline = this.officialHelpline;
  if (this.helpline && !this.officialHelpline) this.officialHelpline = this.helpline;
  if (this.requiredDocuments && !this.documentsRequired) this.documentsRequired = this.requiredDocuments;
  if (this.documentsRequired && !this.requiredDocuments) this.requiredDocuments = this.documentsRequired;
  if (this.keywords && !this.tags) this.tags = this.keywords;
  if (this.tags && !this.keywords) this.keywords = this.tags;
});

export default mongoose.model('Scheme', SchemeSchema);
