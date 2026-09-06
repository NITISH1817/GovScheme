import mongoose from 'mongoose';

const SchemeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  department: { type: String, required: true },
  ministry: { type: String },
  state: { type: String, required: true },
  category: { type: String, required: true },
  subCategory: { type: String },
  shortDescription: { type: String, required: true },
  detailedDescription: { type: String },
  benefits: { type: String },
  
  financialBenefitAmount: { type: Number, default: 0 },
  financialBenefitType: { type: String, default: 'None' },
  
  eligibilityRules: {
    incomeLimit: { type: Number, default: 0 },
    ageMin: { type: Number, default: 0 },
    ageMax: { type: Number, default: 100 },
    gender: { type: [String], default: ['All'] },
    occupation: { type: [String], default: [] },
    education: { type: [String], default: [] },
    category: { type: [String], default: ['All'] },
    disabilityRequired: { type: Boolean, default: false },
    familySizeMax: { type: Number, default: 99 },
    landOwnershipMax: { type: Number, default: 999 },
  },
  
  dynamicRules: [{
    field: { type: String, required: true },
    operator: { type: String, required: true, enum: ['=', '!=', '>', '<', '>=', '<=', 'IN', 'NOT_IN'] },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    logic: { type: String, enum: ['AND', 'OR'], default: 'AND' }
  }],
  
  documentsRequired: [{ type: String }],
  applicationDeadline: { type: Date },
  officialWebsite: { type: String },
  applyURL: { type: String },
  helpline: { type: String },
  
  faqs: [{
    question: { type: String },
    answer: { type: String }
  }],
  
  seo: {
    title: { type: String },
    keywords: [{ type: String }],
    metaDescription: { type: String }
  },

  featuredImageUrl: { type: String },

  version: { type: Number, default: 1 },
  versionHistory: [{
    version: Number,
    updatedAt: Date,
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changes: String
  }],
  
  status: { type: String, enum: ['Draft', 'Published', 'Archived'], default: 'Draft' },
  publishedAt: { type: Date },
}, { timestamps: true });

export default mongoose.model('Scheme', SchemeSchema);
