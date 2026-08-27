import { UserProfile, ApplicationTrackerRecord, NotificationItem } from '../types';

export const initialUserProfile: UserProfile = {
  id: "usr-rural-001",
  fullName: "Ramesh Kumar",
  mobile: "+91 98402 12345",
  email: "ramesh.kumar@rural.gov.in",
  age: 42,
  gender: "Male",
  state: "Tamil Nadu",
  district: "Madurai",
  category: "OBC",
  occupation: "Farmer",
  annualIncome: 95000,
  landHoldingAcres: 2.5,
  educationLevel: "Class 10 Pass",
  familyMembersCount: 4,
  hasDisability: false,
  disabilityPercentage: 0,
  isRegisteredWorker: true,
  avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
  verificationBadge: true,
  profileCompletionScore: 88,
  savedSchemeIds: ["pm-kisan", "pmay-g", "tn-pudhumai-penn"],
  documents: [
    {
      id: "doc-aadhaar-1",
      type: "Aadhaar",
      docNumber: "5489 3201 9845",
      status: "Verified",
      ocrExtracted: {
        fullName: "Ramesh Kumar",
        dob: "1984-05-12",
        state: "Tamil Nadu",
        gender: "Male",
        confidenceScore: 98,
      },
      uploadedAt: "2026-01-15"
    },
    {
      id: "doc-pan-1",
      type: "PAN",
      docNumber: "ABCDE1234F",
      status: "Verified",
      ocrExtracted: {
        fullName: "RAMESH KUMAR",
        dob: "1984-05-12",
        confidenceScore: 95,
      },
      uploadedAt: "2026-02-10"
    },
    {
      id: "doc-inc-1",
      type: "Income Certificate",
      docNumber: "TN-INC-2026-98124",
      status: "Verified",
      ocrExtracted: {
        fullName: "Ramesh Kumar",
        annualIncome: 95000,
        state: "Tamil Nadu",
        confidenceScore: 92,
      },
      uploadedAt: "2026-03-01"
    }
  ]
};

export const initialApplications: ApplicationTrackerRecord[] = [
  {
    id: "app-2026-101",
    schemeId: "pm-kisan",
    schemeName: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
    appliedDate: "2026-05-10",
    status: "Approved",
    officialPortalLink: "https://pmkisan.gov.in/",
    applicationNumber: "PMK-TN-682194",
    statusTimeline: [
      { stage: "Application Started", date: "2026-05-10", completed: true },
      { stage: "Documents Uploaded", date: "2026-05-10", completed: true },
      { stage: "Submitted to Nodal Officer", date: "2026-05-12", completed: true },
      { stage: "Under Review by District Welfare", date: "2026-05-18", completed: true },
      { stage: "Approved by Agriculture Ministry", date: "2026-06-01", completed: true },
      { stage: "Benefit Released (17th Installment)", date: "2026-06-05", completed: true, remarks: "₹2,000 credited to SBI A/c ending 9845" }
    ]
  },
  {
    id: "app-2026-102",
    schemeId: "pmay-g",
    schemeName: "Pradhan Mantri Awas Yojana - Gramin (PMAY-G)",
    appliedDate: "2026-07-02",
    status: "Under Review",
    officialPortalLink: "https://pmayg.nic.in/",
    applicationNumber: "PMAYG-TN-440129",
    statusTimeline: [
      { stage: "Application Started", date: "2026-07-02", completed: true },
      { stage: "Documents Uploaded", date: "2026-07-02", completed: true },
      { stage: "Submitted to Gram Sabha", date: "2026-07-05", completed: true },
      { stage: "Under Review (AwasSoft Geo-tagging)", date: "2026-07-20", completed: true, remarks: "Site inspection scheduled by BDO officer" },
      { stage: "Approved", date: "Pending", completed: false },
      { stage: "Benefit Released", date: "Pending", completed: false }
    ]
  }
];

export const initialNotifications: NotificationItem[] = [
  {
    id: "notif-1",
    title: "PM-KISAN 17th Installment Released",
    description: "₹2,000 DBT installment credited to your State Bank of India account.",
    category: "Application",
    timestamp: "2 hours ago",
    read: false,
    link: "https://pmkisan.gov.in/"
  },
  {
    id: "notif-2",
    title: "New State Welfare Scheme Added",
    description: "Tamil Nadu Pudhumai Penn Scheme updated with new monthly incentives.",
    category: "Scheme",
    timestamp: "1 day ago",
    read: false,
  },
  {
    id: "notif-3",
    title: "Income Certificate Verification Completed",
    description: "Your OCR uploaded Income Certificate has been verified by the Rule Engine.",
    category: "Document",
    timestamp: "3 days ago",
    read: false,
  }
];
