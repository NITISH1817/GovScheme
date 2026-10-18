export type LanguageCode = 'en' | 'hi' | 'ta' | 'te' | 'ml' | 'kn' | 'mr' | 'gu' | 'bn' | 'pa';

export type SchemeCategory =
  | 'Agriculture & Farmers'
  | 'Health & Healthcare'
  | 'Housing & Shelter'
  | 'Education & Skill'
  | 'Financial Inclusion & Credit'
  | 'Pensions & Senior Care'
  | 'Women & Child Welfare'
  | 'Employment & Micro Enterprises'
  | 'Disability Empowerment'
  | 'Food & Nutrition';

export type TargetGender = 'All' | 'Female' | 'Male' | 'Transgender';
export type CategorySocial = 'All' | 'General' | 'OBC' | 'SC' | 'ST' | 'EWS' | 'Minority';

export type VerificationStatusType = 
  | 'PENDING'
  | 'PROCESSING'
  | 'TEXT_EXTRACTED'
  | 'NEEDS_REVIEW'
  | 'CHECKS_PASSED'
  | 'OFFICIALLY_VERIFIED'
  | 'VERIFICATION_FAILED'
  | 'INCONCLUSIVE';

export interface DocumentRecord {
  _id?: string;
  id?: string;
  documentId?: string;
  documentType?: string;
  type?: string;
  originalFileName?: string;
  fileMimeType?: string;
  fileSize?: number;
  fileUrl?: string;
  ocrStatus?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  rawOcrText?: string;
  extractedFields?: Record<string, any>;
  fieldConfidences?: Record<string, number>;
  fieldFlags?: Record<string, string[]>;
  correctedFields?: Record<string, any>;
  isUserConfirmed?: boolean;
  userConfirmedAt?: string;
  verificationStatus?: VerificationStatusType;
  verificationChecks?: Array<{
    checkName: string;
    passed: boolean;
    details: string;
  }>;
  verificationLimitations?: string;
  verificationOutcomeReason?: string;
  verifiedAt?: string;
  status?: string;
  docNumber?: string;
  ocrExtracted?: any;
  uploadedAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile {
  id: string;
  _id?: string;
  fullName: string;
  mobile?: string;
  phone?: string;
  email: string;
  age: number;
  gender: TargetGender;
  maritalStatus?: string;
  state: string;
  district: string;
  residenceType?: 'Rural' | 'Urban' | 'Semi-Urban';
  category: CategorySocial;
  interests?: string[];
  occupation: string;
  annualIncome: number; // In INR ₹
  landHoldingAcres: number;
  educationLevel: string;
  familyMembersCount: number;
  hasDisability: boolean;
  disabilityPercentage?: number;
  isRegisteredWorker?: boolean;
  avatarUrl?: string;
  verificationBadge: boolean;
  profileCompletionScore: number; // 0-100%
  savedSchemeIds: string[];
  documents: DocumentRecord[];
  role?: string;
  token?: string;
  onboardingCompleted?: boolean;
  createdAt?: string;
}

export interface EligibilityRules {
  minAge?: number;
  maxAge?: number;
  allowedGenders?: TargetGender[];
  allowedStates?: string[]; // Empty or ["All"] means all India
  maxAnnualIncome?: number;
  allowedOccupations?: string[];
  allowedCategories?: CategorySocial[];
  maxLandHoldingAcres?: number;
  requiresDisability?: boolean;
  minDisabilityPercentage?: number;
  requiredEducation?: string[];
  requiredDocuments: string[];
}

export interface Scheme {
  id: string;
  schemeId?: string;
  name: string;
  schemeName?: string;
  shortDescription: string;
  description?: string;
  detailedDescription?: string;
  department: string;
  ministry: string;
  category: SchemeCategory;
  state: string; // 'Central' or State name e.g. 'Tamil Nadu'
  governmentLevel?: string;
  benefitsSummary: string;
  financialBenefitAmount?: number; // In INR ₹ per annum or lump sum
  eligibilityRules: EligibilityRules;
  requiredDocuments: string[];
  applicationSteps: string[];
  officialApplyUrl: string;
  officialWebsite: string;
  helplineNumber: string;
  deadline: string;
  tags: string[];
  faqs: { question: string; answer: string }[];
  lastUpdated: string;
  popularityScore: number;
  verificationStatus?: 'UNVERIFIED' | 'PENDING' | 'PORTAL_CURATED' | 'ADMIN_VERIFIED' | 'OFFICIALLY_VERIFIED';
  curationSource?: string;
  sourceUrl?: string;
  lastVerifiedAt?: string;
  status?: 'Draft' | 'Published' | 'Archived' | 'Suspended';
  activeStatus?: boolean;
}

export interface RuleEvaluationResult {
  schemeId: string;
  status: 'Eligible' | 'Conditionally Eligible' | 'Almost Eligible' | 'Not Eligible' | 'Insufficient Information';
  matchedCriteria: string[];
  failedCriteria: string[];
  missingDocuments: string[];
  informationNeeded?: string[];
  overallReason: string;
}

export interface MLRecommendationResult {
  schemeId: string;
  confidenceScore: number; // 0 - 100%
  scoreBreakdown?: {
    demographic: number;
    financial: number;
    need: number;
  };
  matchReason: string;
  urgencyLevel: 'High' | 'Medium' | 'Standard';
  relatedSchemeIds: string[];
}

export interface CombinedSchemeAnalysis {
  scheme: Scheme;
  ruleResult: RuleEvaluationResult;
  mlResult: MLRecommendationResult;
}

export interface ApplicationTrackerRecord {
  id: string;
  schemeId: string;
  schemeName: string;
  appliedDate: string;
  status: 'Started' | 'Documents Uploaded' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Benefit Released';
  statusTimeline: {
    stage: string;
    date: string;
    completed: boolean;
    remarks?: string;
  }[];
  officialPortalLink: string;
  applicationNumber: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedPrompts?: string[];
  referencedSchemes?: Scheme[];
  audioPlaybackAvailable?: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  category: 'Application' | 'Scheme' | 'Document' | 'AI Suggestion';
  timestamp: string;
  read: boolean;
  link?: string;
}
