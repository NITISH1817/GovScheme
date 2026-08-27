export type LanguageCode = 'en' | 'hi' | 'ta' | 'te' | 'kn' | 'ml' | 'mr' | 'gu' | 'pa' | 'bn';

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

export interface DocumentRecord {
  id: string;
  type: 'Aadhaar' | 'PAN' | 'Income Certificate' | 'Community Certificate' | 'Bank Passbook' | 'Ration Card' | 'Education Certificate';
  docNumber: string;
  status: 'Verified' | 'Pending' | 'Expired';
  ocrExtracted: {
    fullName?: string;
    dob?: string;
    annualIncome?: number;
    state?: string;
    gender?: string;
    confidenceScore: number;
    issueDate?: string;
  };
  fileUrl?: string;
  uploadedAt: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  mobile: string;
  email: string;
  age: number;
  gender: TargetGender;
  state: string;
  district: string;
  category: CategorySocial;
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
  name: string;
  shortDescription: string;
  department: string;
  ministry: string;
  category: SchemeCategory;
  state: string; // 'Central' or State name e.g. 'Tamil Nadu'
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
}

export interface RuleEvaluationResult {
  schemeId: string;
  status: 'Eligible' | 'Conditionally Eligible' | 'Not Eligible';
  matchedCriteria: string[];
  failedCriteria: string[];
  missingDocuments: string[];
  overallReason: string;
}

export interface MLRecommendationResult {
  schemeId: string;
  confidenceScore: number; // 0 - 100%
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
