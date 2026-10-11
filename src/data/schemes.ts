import type { Scheme } from '../types';

export const schemesData: Scheme[] = [
  {
    id: "pm-kisan",
    name: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
    shortDescription: "Income support of ₹6,000 per year in three equal installments to all landholding farmer families across India.",
    department: "Department of Agriculture & Farmers Welfare",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    category: "Agriculture & Farmers",
    state: "Central",
    benefitsSummary: "₹6,000 annually credited directly into bank accounts in 3 equal installments of ₹2,000 every 4 months.",
    financialBenefitAmount: 6000,
    eligibilityRules: {
      allowedOccupations: ["Farmer", "Agriculture Worker", "Self Employed Farmer"],
      maxLandHoldingAcres: 5.0,
      requiredDocuments: ["Aadhaar", "Land Record (Khata/Khasra)", "Bank Passbook"],
      allowedCategories: ["General", "OBC", "SC", "ST", "EWS"],
    },
    requiredDocuments: [
      "Aadhaar Card",
      "Land Ownership Documents / Khasra Khatoni",
      "Savings Bank Account Passbook",
      "Mobile Number Linked to Aadhaar"
    ],
    applicationSteps: [
      "Visit official portal pmkisan.gov.in or nearest CSC Kendra.",
      "Click on 'Farmers Corner' -> 'New Farmer Registration'.",
      "Enter Aadhaar Number, Select Rural/Urban Farmer, State, and District.",
      "Fill land detail details (Khata Number, Survey Number, Area in Hectares).",
      "Upload Land Ownership Document and submit."
    ],
    officialApplyUrl: "https://pmkisan.gov.in/",
    officialWebsite: "https://pmkisan.gov.in/",
    helplineNumber: "155261 / 011-24300606",
    deadline: "Open All Year",
    tags: ["Farmer", "Direct Benefit Transfer", "Agriculture", "PM KISAN"],
    faqs: [
      {
        question: "Who is eligible for PM-KISAN?",
        answer: "All landholding farmer families having cultivable land in their names are eligible, subject to institutional landholder exclusion criteria."
      },
      {
        question: "Is tenant farmer eligible?",
        answer: "Currently, land ownership in land records is mandatory for PM-KISAN registration."
      }
    ],
    lastUpdated: "2026-08-01",
    popularityScore: 98
  },
  {
    id: "pmay-g",
    name: "Pradhan Mantri Awas Yojana - Gramin (PMAY-G)",
    shortDescription: "Financial assistance to construct pucca houses with basic amenities for homeless and kutcha house dwellers in rural areas.",
    department: "Department of Rural Development",
    ministry: "Ministry of Rural Development",
    category: "Housing & Shelter",
    state: "Central",
    benefitsSummary: "Financial grant of ₹1,20,000 in plain areas and ₹1,30,000 in hilly/hilly states + 90 days MGNREGA unskilled labor wages.",
    financialBenefitAmount: 120000,
    eligibilityRules: {
      maxAnnualIncome: 180000,
      allowedOccupations: ["Daily Wager", "Agricultural Laborer", "Artisan", "Unemployed", "Farmer"],
      requiredDocuments: ["Aadhaar", "Job Card", "Bank Passbook", "Income Certificate"],
    },
    requiredDocuments: [
      "Aadhaar Card",
      "MGNREGA Job Card",
      "Bank Account Details",
      "Swachh Bharat Mission (SBM) Registration Number",
      "Consent Letter to use Aadhaar"
    ],
    applicationSteps: [
      "Contact your Gram Panchayat / Gram Sabha administrator or visit pmayg.nic.in.",
      "Gram Sabha verifies houseless/kutcha house status from SECC list.",
      "AwasSoft geo-tagging officer captures existing site photo.",
      "Installment released directly into bank account in 3 construction stages."
    ],
    officialApplyUrl: "https://pmayg.nic.in/",
    officialWebsite: "https://pmayg.nic.in/",
    helplineNumber: "1800-11-6446",
    deadline: "Open All Year",
    tags: ["Housing", "Gramin", "PMAY", "Rural Development"],
    faqs: [
      {
        question: "How is the beneficiary selected?",
        answer: "Beneficiaries are selected based on housing deprivation parameters in SEC 2011 data and validated by Gram Sabha."
      }
    ],
    lastUpdated: "2026-07-15",
    popularityScore: 95
  },
  {
    id: "pmjay-ayushman",
    name: "Ayushman Bharat - PM Jan Arogya Yojana (PM-JAY)",
    shortDescription: "World's largest health insurance scheme providing ₹5 Lakh per family per year for secondary and tertiary hospitalization.",
    department: "National Health Authority",
    ministry: "Ministry of Health and Family Welfare",
    category: "Health & Healthcare",
    state: "Central",
    benefitsSummary: "Cashless health cover up to ₹5,00,000 per family per year for inpatient medical treatment across 27,000+ empanelled hospitals.",
    financialBenefitAmount: 500000,
    eligibilityRules: {
      maxAnnualIncome: 250000,
      requiredDocuments: ["Aadhaar", "Ration Card"],
    },
    requiredDocuments: [
      "Aadhaar Card",
      "Ration Card / SECC Family Identity Card",
      "Mobile Number"
    ],
    applicationSteps: [
      "Check eligibility on mera.pmjay.gov.in or visit any empanelled Govt/Private hospital Arogyamitra Desk.",
      "Provide Aadhaar card or Ration card to Arogyamitra for instant e-KYC verification.",
      "Get Ayushman Card generated instantly."
    ],
    officialApplyUrl: "https://pmjay.gov.in/",
    officialWebsite: "https://pmjay.gov.in/",
    helplineNumber: "14555 / 1800-11-4477",
    deadline: "Open All Year",
    tags: ["Health", "Insurance", "Hospitalization", "PMJAY"],
    faqs: [
      {
        question: "Is there any cap on family size or age?",
        answer: "No, there is no restriction on family size, age, or gender."
      }
    ],
    lastUpdated: "2026-08-10",
    popularityScore: 99
  },
  {
    id: "pm-ujjwala",
    name: "Pradhan Mantri Ujjwala Yojana 2.0 (PMUY)",
    shortDescription: "Free LPG gas connection with first refill and stove free for adult women from low-income rural households.",
    department: "Ministry of Petroleum and Natural Gas",
    ministry: "Ministry of Petroleum and Natural Gas",
    category: "Women & Child Welfare",
    state: "Central",
    benefitsSummary: "Deposit-free LPG connection + Free hotplate (stove) + First 14.2kg LPG cylinder refill + ₹300 subsidy per cylinder.",
    financialBenefitAmount: 3600,
    eligibilityRules: {
      allowedGenders: ["Female"],
      minAge: 18,
      maxAnnualIncome: 200000,
      requiredDocuments: ["Aadhaar", "Ration Card", "Bank Passbook"],
    },
    requiredDocuments: [
      "Aadhaar Card of Applicant Woman & Adult Family Members",
      "Ration Card issued by State Govt",
      "Bank Account Number and IFSC Code",
      "14-Point Declaration"
    ],
    applicationSteps: [
      "Visit any LPG distributor (Indane, Bharatgas, HP Gas) or pmuy.gov.in.",
      "Fill online/offline Ujjwala application form with family details.",
      "Submit Aadhaar e-KYC and Ration Card details.",
      "Collect free LPG connection & stove from distributor."
    ],
    officialApplyUrl: "https://www.pmuy.gov.in/",
    officialWebsite: "https://www.pmuy.gov.in/",
    helplineNumber: "1800-266-6696",
    deadline: "Open All Year",
    tags: ["LPG", "Women", "Gas Connection", "Ujjwala"],
    faqs: [
      {
        question: "Can men apply for Ujjwala?",
        answer: "No, LPG connection under PMUY is issued exclusively in the name of an adult woman of the household."
      }
    ],
    lastUpdated: "2026-06-20",
    popularityScore: 92
  },
  {
    id: "sukanya-samriddhi",
    name: "Sukanya Samriddhi Yojana (SSY)",
    shortDescription: "High-interest government savings scheme for girl children offering tax benefits and guaranteed returns for higher education & marriage.",
    department: "Department of Posts / Department of Financial Services",
    ministry: "Ministry of Finance",
    category: "Women & Child Welfare",
    state: "Central",
    benefitsSummary: "Interest rate of 8.2% p.a. tax-free under Section 80C. Deposits from ₹250 to ₹1.5 Lakh per year.",
    financialBenefitAmount: 150000,
    eligibilityRules: {
      maxAge: 10,
      allowedGenders: ["Female"],
      requiredDocuments: ["Birth Certificate", "Aadhaar"],
    },
    requiredDocuments: [
      "Girl Child Birth Certificate",
      "Parent/Legal Guardian Aadhaar Card",
      "Parent Identity & Address Proof",
      "Passport Size Photograph"
    ],
    applicationSteps: [
      "Visit nearest India Post Office or empanelled public/private bank branch.",
      "Fill Sukanya Samriddhi Account Opening Form.",
      "Submit Girl Child birth certificate and Parent Aadhaar copy.",
      "Deposit initial minimum amount (min ₹250) and collect passbook."
    ],
    officialApplyUrl: "https://www.indiapost.gov.in/",
    officialWebsite: "https://www.indiapost.gov.in/",
    helplineNumber: "1800-266-6868",
    deadline: "Open All Year",
    tags: ["Girl Child", "Savings", "Tax Free", "Post Office"],
    faqs: [
      {
        question: "Up to what age can an account be opened?",
        answer: "Account can be opened anytime from birth till the girl child reaches 10 years of age."
      }
    ],
    lastUpdated: "2026-07-01",
    popularityScore: 90
  },
  {
    id: "nsap-old-age-pension",
    name: "Indira Gandhi National Old Age Pension Scheme (IGNOAPS)",
    shortDescription: "Monthly pension support for senior citizens aged 60+ living below poverty line in rural & urban India.",
    department: "Department of Rural Development",
    ministry: "Ministry of Rural Development",
    category: "Pensions & Senior Care",
    state: "Central",
    benefitsSummary: "Monthly pension of ₹1,000 to ₹3,000 per month (combined Central + State contribution) credited to bank account.",
    financialBenefitAmount: 24000,
    eligibilityRules: {
      minAge: 60,
      maxAnnualIncome: 120000,
      requiredDocuments: ["Aadhaar", "Income Certificate", "Age Proof", "Bank Passbook"],
    },
    requiredDocuments: [
      "Aadhaar Card",
      "BPL Card / Income Certificate from Tehsildar",
      "Age Proof Certificate",
      "Bank Account Passbook"
    ],
    applicationSteps: [
      "Visit local Block Development Office (BDO) / Gram Panchayat or nsap.nic.in.",
      "Fill IGNOAPS Pension Application Form.",
      "Attach BPL proof, age proof and Aadhaar card.",
      "Upon verification by Social Welfare Inspector, pension starts monthly."
    ],
    officialApplyUrl: "https://nsap.nic.in/",
    officialWebsite: "https://nsap.nic.in/",
    helplineNumber: "1800-11-0001",
    deadline: "Open All Year",
    tags: ["Pension", "Senior Citizen", "NSAP", "BPL"],
    faqs: [
      {
        question: "What is the minimum age criterion?",
        answer: "Applicant must be at least 60 years old and belong to a BPL household."
      }
    ],
    lastUpdated: "2026-05-18",
    popularityScore: 89
  },
  {
    id: "pm-vishwakarma",
    name: "PM Vishwakarma Scheme",
    shortDescription: "Holistic support to traditional artisans and craftspeople including toolkit incentives, skill training, and collateral-free loans up to ₹3 Lakh.",
    department: "Ministry of Micro, Small and Medium Enterprises",
    ministry: "Ministry of MSME",
    category: "Employment & Micro Enterprises",
    state: "Central",
    benefitsSummary: "₹15,000 Toolkit Incentive + ₹500/day stipend during training + Collateral-free loan of ₹1 Lakh (Tranche 1) & ₹2 Lakh (Tranche 2) at 5% interest.",
    financialBenefitAmount: 315000,
    eligibilityRules: {
      minAge: 18,
      allowedOccupations: ["Artisan", "Carpenter", "Blacksmith", "Locksmith", "Sculptor", "Goldsmith", "Cobbler", "Tailor", "Mason", "Barber", "Washerman"],
      requiredDocuments: ["Aadhaar", "Bank Passbook", "Skill Certificate"],
    },
    requiredDocuments: [
      "Aadhaar Card",
      "Bank Passbook Details",
      "Mobile Number Linked to Aadhaar",
      "Trade/Craft Verification by Gram Panchayat Pradhan"
    ],
    applicationSteps: [
      "Visit nearest Common Service Centre (CSC) or pmvishwakarma.gov.in.",
      "Complete Aadhaar e-KYC and trade registration.",
      "Gram Panchayat Level 1 verification followed by District Committee approval.",
      "Receive PM Vishwakarma Digital ID Card, toolkit grant, and loan eligibility."
    ],
    officialApplyUrl: "https://pmvishwakarma.gov.in/",
    officialWebsite: "https://pmvishwakarma.gov.in/",
    helplineNumber: "1800-267-7777",
    deadline: "Open All Year",
    tags: ["Artisan", "Craftsman", "MSME", "Loans", "PM Vishwakarma"],
    faqs: [
      {
        question: "Which trades are covered under PM Vishwakarma?",
        answer: "18 traditional trades including Carpenter, Boat Maker, Armorer, Blacksmith, Locksmith, Hammer & Tool Kit Maker, Sculptor, Goldsmith, Potter, Cobbler, Mason, Basket/Mat Weaver, Doll & Toy Maker, Barber, Garland Maker, Washerman, Tailor, and Fishing Net Weaver."
      }
    ],
    lastUpdated: "2026-08-05",
    popularityScore: 94
  },
  {
    id: "pm-mudra",
    name: "Pradhan Mantri MUDRA Yojana (PMMY)",
    shortDescription: "Collateral-free micro loans up to ₹10 Lakhs for micro-enterprises, small businesses, shopkeepers, and self-employed entrepreneurs.",
    department: "Department of Financial Services",
    ministry: "Ministry of Finance",
    category: "Financial Inclusion & Credit",
    state: "Central",
    benefitsSummary: "Collateral-free business loans under 3 categories: Shishu (Up to ₹50,000), Kishor (₹50,000 to ₹5 Lakh), and Tarun (₹5 Lakh to ₹10 Lakh).",
    financialBenefitAmount: 1000000,
    eligibilityRules: {
      minAge: 18,
      allowedOccupations: ["Self Employed", "Shopkeeper", "Micro Entrepreneur", "Vendor", "Artisan", "Small Business Owner"],
      requiredDocuments: ["Aadhaar", "PAN", "Bank Passbook", "Business Proposal"],
    },
    requiredDocuments: [
      "Aadhaar Card & PAN Card",
      "Proof of Identity & Business Address",
      "Bank Account Statements (last 6 months)",
      "Business Model / Quotation of Machinery or Items to be Purchased"
    ],
    applicationSteps: [
      "Visit any Commercial Bank, RRB, MFI, or Udyami Mitra portal (udyamimitra.in).",
      "Fill MUDRA Loan Application Form selecting Shishu, Kishor, or Tarun category.",
      "Submit identity proof, address proof, and business proposal.",
      "Bank sanctions and disburses loan with Mudra Debit Card."
    ],
    officialApplyUrl: "https://www.mudra.org.in/",
    officialWebsite: "https://www.mudra.org.in/",
    helplineNumber: "1800-180-1111",
    deadline: "Open All Year",
    tags: ["MUDRA", "Business Loan", "Micro Finance", "Self Employed"],
    faqs: [
      {
        question: "Is collateral security required for MUDRA loan?",
        answer: "No collateral security is required for loans under PMMY."
      }
    ],
    lastUpdated: "2026-07-22",
    popularityScore: 91
  },
  {
    id: "pm-svanidhi",
    name: "PM Street Vendor's AtmaNirbhar Nidhi (PM SVANidhi)",
    shortDescription: "Special micro-credit facility providing affordable collateral-free working capital loans to urban and peri-urban street vendors.",
    department: "Ministry of Housing and Urban Affairs",
    ministry: "Ministry of Housing and Urban Affairs",
    category: "Financial Inclusion & Credit",
    state: "Central",
    benefitsSummary: "First tranche working capital loan of ₹10,000 (7% interest subsidy), 2nd tranche ₹20,000, 3rd tranche ₹50,000 + cashback on digital transactions.",
    financialBenefitAmount: 50000,
    eligibilityRules: {
      minAge: 18,
      allowedOccupations: ["Street Vendor", "Hawker", "Vendor", "Daily Wager"],
      requiredDocuments: ["Aadhaar", "Vendor ID Card / Letter of Recommendation", "Bank Passbook"],
    },
    requiredDocuments: [
      "Aadhaar Card",
      "Certificate of Vending / Vendor Identity Card / Letter of Recommendation (LoR) from ULB",
      "Bank Account Details"
    ],
    applicationSteps: [
      "Visit pmsvanidhi.mohua.gov.in or nearest CSC Centre.",
      "Check vendor status with Aadhaar number.",
      "Fill loan application and select preferred lending bank.",
      "Bank processes e-KYC and credits loan within 7 working days."
    ],
    officialApplyUrl: "https://pmsvanidhi.mohua.gov.in/",
    officialWebsite: "https://pmsvanidhi.mohua.gov.in/",
    helplineNumber: "1800-11-1979",
    deadline: "Open All Year",
    tags: ["Street Vendor", "SVANidhi", "Micro Loan", "Working Capital"],
    faqs: [
      {
        question: "What is the interest subsidy provided?",
        answer: "Vendors paying timely installments receive 7% interest subsidy per annum directly into their bank accounts."
      }
    ],
    lastUpdated: "2026-06-12",
    popularityScore: 88
  },
  {
    id: "mgnrega",
    name: "Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA)",
    shortDescription: "Guarantees at least 100 days of wage employment in a financial year to every rural household whose adult members volunteer to do unskilled manual work.",
    department: "Department of Rural Development",
    ministry: "Ministry of Rural Development",
    category: "Employment & Micro Enterprises",
    state: "Central",
    benefitsSummary: "Guaranteed 100 days of wage employment per rural household per year at statutory state wage rates (avg ₹240-₹375/day).",
    financialBenefitAmount: 30000,
    eligibilityRules: {
      minAge: 18,
      allowedOccupations: ["Unemployed", "Agricultural Laborer", "Daily Wager", "Farmer"],
      requiredDocuments: ["Aadhaar", "Job Card", "Bank Passbook"],
    },
    requiredDocuments: [
      "Aadhaar Card",
      "MGNREGA Job Card",
      "Bank / Post Office Savings Account Passbook"
    ],
    applicationSteps: [
      "Submit application for Job Card registration to local Gram Panchayat.",
      "Gram Panchayat issues Job Card free of cost within 15 days.",
      "Submit written work demand application to Gram Panchayat for wage employment.",
      "Work allotted within 5 km radius of village within 15 days."
    ],
    officialApplyUrl: "https://nrega.nic.in/",
    officialWebsite: "https://nrega.nic.in/",
    helplineNumber: "1800-11-1555",
    deadline: "Open All Year",
    tags: ["Job Card", "MGNREGA", "Employment", "Rural Wages"],
    faqs: [
      {
        question: "What if work is not provided within 15 days?",
        answer: "If work is not provided within 15 days of applying, the applicant is entitled to unemployment allowance."
      }
    ],
    lastUpdated: "2026-08-02",
    popularityScore: 97
  },
  {
    id: "post-matric-scholarship",
    name: "Post-Matric Scholarship for SC/ST/OBC Students",
    shortDescription: "Financial assistance for post-secondary/higher education students belonging to SC, ST, and OBC categories.",
    department: "Department of Social Justice and Empowerment",
    ministry: "Ministry of Social Justice and Empowerment",
    category: "Education & Skill",
    state: "Central",
    benefitsSummary: "Full tuition fee reimbursement + monthly maintenance allowance up to ₹13,500/year directly to student accounts.",
    financialBenefitAmount: 40000,
    eligibilityRules: {
      maxAnnualIncome: 250000,
      allowedCategories: ["SC", "ST", "OBC", "EWS"],
      requiredEducation: ["Class 10 Pass", "Class 12 Pass", "Diploma", "Graduate", "Post Graduate"],
      requiredDocuments: ["Aadhaar", "Community Certificate", "Income Certificate", "Education Certificate", "Bank Passbook"],
    },
    requiredDocuments: [
      "Aadhaar Card",
      "Community / Caste Certificate issued by competent authority",
      "Family Annual Income Certificate",
      "Mark Sheet of Previous Passed Exam",
      "College Fee Receipt & Student ID",
      "Bank Account Linked to Aadhaar"
    ],
    applicationSteps: [
      "Visit National Scholarship Portal (scholarships.gov.in).",
      "Register using One-Time Student Registration (OTR) with Aadhaar e-KYC.",
      "Select State and Post-Matric Scholarship Scheme for SC/ST/OBC.",
      "Upload documents, college admission proof, and submit.",
      "Institution verifies application online followed by State Nodal Officer."
    ],
    officialApplyUrl: "https://scholarships.gov.in/",
    officialWebsite: "https://scholarships.gov.in/",
    helplineNumber: "0120-6619540",
    deadline: "31st October 2026",
    tags: ["Scholarship", "Post Matric", "SC ST OBC", "Higher Education"],
    faqs: [
      {
        question: "Can I apply for multiple scholarships simultaneously?",
        answer: "No, a student can avail benefit under only one government scholarship scheme in an academic year."
      }
    ],
    lastUpdated: "2026-07-28",
    popularityScore: 93
  },
  {
    id: "tn-pudhumai-penn",
    name: "Moovalur Ramamirtham Ammaiyar Higher Education Assurance (Pudhumai Penn - Tamil Nadu)",
    shortDescription: "Monthly financial assistance of ₹1,000 for female students from Govt schools pursuing higher education in Tamil Nadu.",
    department: "Social Welfare and Women Empowerment Department",
    ministry: "Government of Tamil Nadu",
    category: "Women & Child Welfare",
    state: "Tamil Nadu",
    benefitsSummary: "₹1,000 every month directly transferred to bank accounts until completion of UG Degree, Diploma, ITI, or Professional course.",
    financialBenefitAmount: 12000,
    eligibilityRules: {
      allowedGenders: ["Female"],
      allowedStates: ["Tamil Nadu"],
      minAge: 17,
      requiredEducation: ["Class 6 to 12 in Govt School"],
      requiredDocuments: ["Aadhaar", "School Certificate", "Bank Passbook"],
    },
    requiredDocuments: [
      "Aadhaar Card",
      "School Transfer Certificate / Bonafide proving Class 6 to 12 studied in Govt School",
      "College Admission ID / Bonafide Certificate",
      "Bank Account Details"
    ],
    applicationSteps: [
      "Visit penkalvi.tn.gov.in or apply through College Nodal Officer.",
      "Enter EMIS ID and Aadhaar details for automatic Govt school verification.",
      "Upload college bonafide certificate and bank passbook.",
      "Monthly payout starts directly upon nodal officer approval."
    ],
    officialApplyUrl: "https://penkalvi.tn.gov.in/",
    officialWebsite: "https://penkalvi.tn.gov.in/",
    helplineNumber: "1800-425-0126",
    deadline: "Open All Year",
    tags: ["Tamil Nadu", "Girl Student", "Higher Education", "Pudhumai Penn"],
    faqs: [
      {
        question: "Is private school education eligible?",
        answer: "No, female students must have studied Class 6 to 12 continuously in Government Schools of Tamil Nadu."
      }
    ],
    lastUpdated: "2026-08-01",
    popularityScore: 96
  },
  {
    id: "up-kanya-sumangala",
    name: "Mukhya Mantri Kanya Sumangala Yojana (Uttar Pradesh)",
    shortDescription: "Phased financial incentive total ₹25,000 for girl child from birth through education stages in Uttar Pradesh.",
    department: "Women and Child Development Department",
    ministry: "Government of Uttar Pradesh",
    category: "Women & Child Welfare",
    state: "Uttar Pradesh",
    benefitsSummary: "Total ₹25,000 distributed in 6 installments from birth (₹5,000), vaccination, Class 1, Class 6, Class 9, and Degree/Diploma entry.",
    financialBenefitAmount: 25000,
    eligibilityRules: {
      allowedGenders: ["Female"],
      allowedStates: ["Uttar Pradesh"],
      maxAnnualIncome: 300000,
      requiredDocuments: ["Aadhaar", "Birth Certificate", "Income Certificate", "Bank Passbook"],
    },
    requiredDocuments: [
      "Parents' & Girl Child Aadhaar Card",
      "Girl Child Birth Certificate",
      "Family Income Certificate (Max ₹3 Lakh/year)",
      "Bank Account Passbook",
      "School Admission Certificate (for education stages)"
    ],
    applicationSteps: [
      "Visit mksy.up.gov.in portal.",
      "Register as new user with mobile number and district.",
      "Select applicable stage (Birth, Vaccination, Class 1/6/9, Degree).",
      "Upload birth/school certificate and submit for District Welfare Officer approval."
    ],
    officialApplyUrl: "https://mksy.up.gov.in/",
    officialWebsite: "https://mksy.up.gov.in/",
    helplineNumber: "1800-180-0300",
    deadline: "Open All Year",
    tags: ["Uttar Pradesh", "Kanya Sumangala", "Girl Child", "UP Scheme"],
    faqs: [
      {
        question: "How many girl children per family are covered?",
        answer: "Maximum 2 girl children per family can avail benefits under this scheme."
      }
    ],
    lastUpdated: "2026-07-10",
    popularityScore: 92
  },
  {
    id: "telangana-rythu-bandhu",
    name: "Rythu Bandhu Investment Support Scheme (Telangana)",
    shortDescription: "Crop investment support of ₹10,000 per acre per year for landholding farmers in Telangana for purchase of seeds, fertilizers & inputs.",
    department: "Agriculture Department",
    ministry: "Government of Telangana",
    category: "Agriculture & Farmers",
    state: "Telangana",
    benefitsSummary: "₹5,000 per acre per season (Rabi and Kharif), total ₹10,000 per acre per year credited directly to Pattadar bank accounts.",
    financialBenefitAmount: 10000,
    eligibilityRules: {
      allowedStates: ["Telangana"],
      allowedOccupations: ["Farmer", "Agriculture Worker"],
      requiredDocuments: ["Pattadar Passbook", "Aadhaar", "Bank Passbook"],
    },
    requiredDocuments: [
      "Pattadar Dharani Passbook",
      "Aadhaar Card",
      "Bank Account Details (Aadhaar linked)"
    ],
    applicationSteps: [
      "Ensure land is registered on Dharani Portal (dharani.telangana.gov.in).",
      "Submit Pattadar passbook details to local Agriculture Extension Officer (AEO).",
      "Direct Benefit Transfer automatically executed every season."
    ],
    officialApplyUrl: "https://dharani.telangana.gov.in/",
    officialWebsite: "https://dharani.telangana.gov.in/",
    helplineNumber: "1800-425-2939",
    deadline: "Open All Year",
    tags: ["Telangana", "Rythu Bandhu", "Farmer Support", "Agriculture"],
    faqs: [
      {
        question: "Is there any upper acreage limit for Rythu Bandhu?",
        answer: "No, investment support is provided per acre for every landholding farmer regardless of total land size."
      }
    ],
    lastUpdated: "2026-06-25",
    popularityScore: 94
  },
  {
    id: "karnataka-gruha-lakshmi",
    name: "Gruha Lakshmi Scheme (Karnataka)",
    shortDescription: "Monthly financial aid of ₹2,000 to the woman head of every eligible household in Karnataka.",
    department: "Women and Child Development Department",
    ministry: "Government of Karnataka",
    category: "Women & Child Welfare",
    state: "Karnataka",
    benefitsSummary: "₹2,000 per month directly deposited to the bank account of the designated female head of the family.",
    financialBenefitAmount: 24000,
    eligibilityRules: {
      allowedGenders: ["Female"],
      allowedStates: ["Karnataka"],
      maxAnnualIncome: 200000,
      requiredDocuments: ["Aadhaar", "Ration Card", "Bank Passbook"],
    },
    requiredDocuments: [
      "Aadhaar Card of Woman Head of Household",
      "Husband's Aadhaar Card",
      "BPL / APL Ration Card (showing applicant as female head)",
      "Aadhaar-seeded Bank Account Details"
    ],
    applicationSteps: [
      "Visit Seva Sindhu Portal (sevasindhugs.karnataka.gov.in) or nearest Grama One / Karnataka One center.",
      "Enter Ration Card number to fetch family details.",
      "Perform Aadhaar biometric authentication.",
      "DBT monthly payout initiated upon verification."
    ],
    officialApplyUrl: "https://sevasindhugs.karnataka.gov.in/",
    officialWebsite: "https://sevasindhugs.karnataka.gov.in/",
    helplineNumber: "1902",
    deadline: "Open All Year",
    tags: ["Karnataka", "Gruha Lakshmi", "Women Support", "DBT"],
    faqs: [
      {
        question: "Are income tax paying households eligible?",
        answer: "Women or husbands who pay income tax or file GST returns are excluded from Gruha Lakshmi."
      }
    ],
    lastUpdated: "2026-08-04",
    popularityScore: 95
  },
  {
    id: "igndps-disability-pension",
    name: "Indira Gandhi National Disability Pension Scheme (IGNDPS)",
    shortDescription: "Monthly pension assistance for individuals aged 18-79 living below poverty line with severe (80%+) disability.",
    department: "Department of Rural Development",
    ministry: "Ministry of Rural Development",
    category: "Disability Empowerment",
    state: "Central",
    benefitsSummary: "Monthly pension of ₹1,000 to ₹2,500 credited directly into bank account.",
    financialBenefitAmount: 18000,
    eligibilityRules: {
      minAge: 18,
      maxAge: 79,
      requiresDisability: true,
      minDisabilityPercentage: 80,
      maxAnnualIncome: 120000,
      requiredDocuments: ["Aadhaar", "Disability Certificate (UDID)", "Income Certificate", "Bank Passbook"],
    },
    requiredDocuments: [
      "Aadhaar Card",
      "Unique Disability ID (UDID) Card / Certificate (80%+ disability)",
      "BPL Ration Card or Income Certificate",
      "Bank Account Passbook"
    ],
    applicationSteps: [
      "Apply through Social Welfare Department or Block Development Office (BDO).",
      "Submit UDID card copy and BPL details.",
      "Medical Board verifies disability level.",
      "Monthly pension commences upon approval."
    ],
    officialApplyUrl: "https://swavlambancard.gov.in/",
    officialWebsite: "https://swavlambancard.gov.in/",
    helplineNumber: "1800-11-0001",
    deadline: "Open All Year",
    tags: ["Disability", "UDID", "Pension", "IGNDPS"],
    faqs: [
      {
        question: "What disability percentage is required?",
        answer: "A minimum of 80% severe disability as certified by a competent medical authority or UDID card is required."
      }
    ],
    lastUpdated: "2026-05-30",
    popularityScore: 87
  },
  {
    id: "pm-fasal-bima",
    name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    shortDescription: "Comprehensive crop insurance scheme providing financial support to farmers suffering crop loss from natural calamities, pests, and diseases.",
    department: "Department of Agriculture & Farmers Welfare",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    category: "Agriculture & Farmers",
    state: "Central",
    benefitsSummary: "Full coverage of sum insured for crop loss due to natural calamities. Farmers pay 2% premium for Kharif, 1.5% for Rabi, and 5% for commercial/horticultural crops.",
    financialBenefitAmount: 200000,
    eligibilityRules: {
      allowedOccupations: ["Farmer", "Agriculture Worker", "Self Employed Farmer"],
      requiredDocuments: ["Aadhaar", "Land Record (Khata/Khasra)", "Bank Passbook"],
      allowedCategories: ["General", "OBC", "SC", "ST", "EWS"],
    },
    requiredDocuments: [
      "Aadhaar Card",
      "Land Record / Khasra Khatauni",
      "Bank Account Passbook",
      "Sowing Certificate from Patwari"
    ],
    applicationSteps: [
      "Visit pmfby.gov.in or nearest bank/CSC to enroll before sowing season.",
      "Select crop, sowing season, and enter land details.",
      "Pay nominal premium amount (2% for Kharif crops).",
      "In case of crop loss, file intimation within 72 hours via Crop Insurance App or helpline."
    ],
    officialApplyUrl: "https://pmfby.gov.in/",
    officialWebsite: "https://pmfby.gov.in/",
    helplineNumber: "1800-180-1111",
    deadline: "Before Kharif/Rabi Sowing",
    tags: ["Crop Insurance", "Farmer", "PMFBY", "Natural Calamity"],
    faqs: [
      {
        question: "What crops are covered under PMFBY?",
        answer: "All food crops (cereals, millets, pulses), oilseeds, and annual commercial/horticultural crops are covered."
      }
    ],
    lastUpdated: "2026-08-10",
    popularityScore: 93
  },
  {
    id: "atal-pension-yojana",
    name: "Atal Pension Yojana (APY)",
    shortDescription: "Government-backed pension scheme for unorganized sector workers guaranteeing fixed monthly pension of ₹1,000 to ₹5,000 after age 60.",
    department: "Pension Fund Regulatory and Development Authority (PFRDA)",
    ministry: "Ministry of Finance",
    category: "Pensions & Senior Care",
    state: "Central",
    benefitsSummary: "Guaranteed monthly pension of ₹1,000 / ₹2,000 / ₹3,000 / ₹4,000 / ₹5,000 depending on contribution amount and age of entry. Government co-contributes 50% for eligible subscribers.",
    financialBenefitAmount: 60000,
    eligibilityRules: {
      minAge: 18,
      maxAge: 40,
      requiredDocuments: ["Aadhaar", "Bank Passbook"],
    },
    requiredDocuments: [
      "Aadhaar Card",
      "Bank Account (Aadhaar-seeded Savings Account)",
      "Mobile Number"
    ],
    applicationSteps: [
      "Visit any bank branch or apply via netbanking / mobile banking.",
      "Fill APY subscriber registration form with Aadhaar and bank details.",
      "Select desired monthly pension amount (₹1,000 - ₹5,000).",
      "Auto-debit of monthly contribution starts from savings account."
    ],
    officialApplyUrl: "https://npscra.nsdl.co.in/scheme-details.php",
    officialWebsite: "https://www.npscra.nsdl.co.in/",
    helplineNumber: "1800-110-069",
    deadline: "Open All Year",
    tags: ["Pension", "APY", "Unorganized Workers", "Retirement"],
    faqs: [
      {
        question: "Can I have both APY and NPS?",
        answer: "Yes, APY and NPS are independent schemes. Citizens can subscribe to both simultaneously."
      }
    ],
    lastUpdated: "2026-07-01",
    popularityScore: 88
  },
  {
    id: "pm-jan-dhan",
    name: "Pradhan Mantri Jan Dhan Yojana (PMJDY)",
    shortDescription: "Financial inclusion mission to provide universal access to basic banking, remittance, credit, insurance, and pension facilities for the unbanked.",
    department: "Department of Financial Services",
    ministry: "Ministry of Finance",
    category: "Financial Inclusion & Credit",
    state: "Central",
    benefitsSummary: "Free zero-balance savings account + RuPay debit card + ₹2 Lakh accident insurance + ₹30,000 life cover + ₹10,000 overdraft facility after 6 months.",
    financialBenefitAmount: 230000,
    eligibilityRules: {
      minAge: 10,
      requiredDocuments: ["Aadhaar", "Bank Passbook"],
    },
    requiredDocuments: [
      "Aadhaar Card",
      "Address Proof (if address differs from Aadhaar)",
      "Passport size photograph"
    ],
    applicationSteps: [
      "Visit any nationalized bank, RRB, or Bank Mitra (Business Correspondent).",
      "Fill PMJDY account opening form with Aadhaar eKYC.",
      "Get zero-balance savings account opened instantly.",
      "Receive free RuPay Debit Card with ₹2 Lakh accidental insurance."
    ],
    officialApplyUrl: "https://pmjdy.gov.in/",
    officialWebsite: "https://pmjdy.gov.in/",
    helplineNumber: "1800-11-0001",
    deadline: "Open All Year",
    tags: ["Jan Dhan", "Bank Account", "Financial Inclusion", "RuPay"],
    faqs: [
      {
        question: "Is a minimum balance required to maintain the PMJDY account?",
        answer: "No, PMJDY accounts are zero-balance accounts. No minimum balance is required."
      }
    ],
    lastUpdated: "2026-08-15",
    popularityScore: 96
  },
  {
    id: "startup-india-seed-fund",
    name: "Startup India Seed Fund Scheme (SISFS)",
    shortDescription: "Financial assistance of up to ₹20 Lakh (PoC grant) and up to ₹50 Lakh (investment at convertible debenture) for early-stage Indian startups.",
    department: "Startup India Division, DPIIT",
    ministry: "Ministry of Commerce and Industry",
    category: "Employment & Micro Enterprises",
    state: "Central",
    benefitsSummary: "Grant of up to ₹20 Lakh for PoC/prototype, and investment up to ₹50 Lakh for market entry & commercialization via empanelled incubators.",
    financialBenefitAmount: 5000000,
    eligibilityRules: {
      minAge: 18,
      allowedOccupations: ["Entrepreneur", "Self Employed", "Micro Entrepreneur", "Small Business Owner"],
      requiredDocuments: ["Aadhaar", "PAN", "Bank Passbook"],
    },
    requiredDocuments: [
      "Startup India Registration (DIPP Certificate)",
      "Aadhaar & PAN of Founders",
      "Business Plan / Pitch Deck",
      "Bank Account Details"
    ],
    applicationSteps: [
      "Register on Startup India Portal (startupindia.gov.in) and get DIPP recognition.",
      "Apply to empanelled incubators under SISFS via the portal.",
      "Submit detailed business plan, product demo, and financial projections.",
      "Incubator evaluates and disburses seed funding in tranches."
    ],
    officialApplyUrl: "https://seedfund.startupindia.gov.in/",
    officialWebsite: "https://seedfund.startupindia.gov.in/",
    helplineNumber: "1800-115-565",
    deadline: "Open All Year (Rolling Basis)",
    tags: ["Startup", "Seed Fund", "Innovation", "Entrepreneurship", "DPIIT"],
    faqs: [
      {
        question: "What stage of startup can apply for SISFS?",
        answer: "Startups with a business idea or product at ideation/validation/early traction stage with less than 2 years of incorporation can apply."
      }
    ],
    lastUpdated: "2026-08-01",
    popularityScore: 85
  },
  {
    id: "pm-garib-kalyan-anna",
    name: "Pradhan Mantri Garib Kalyan Anna Yojana (PMGKAY)",
    shortDescription: "Free food grain distribution scheme providing 5 kg of wheat/rice per person per month to 81 Crore National Food Security Act beneficiaries.",
    department: "Department of Food and Public Distribution",
    ministry: "Ministry of Consumer Affairs, Food and Public Distribution",
    category: "Food & Nutrition",
    state: "Central",
    benefitsSummary: "5 kg free food grain (wheat/rice) per person per month through Ration Card at Fair Price Shops under NFSA.",
    financialBenefitAmount: 6000,
    eligibilityRules: {
      maxAnnualIncome: 200000,
      requiredDocuments: ["Aadhaar", "Ration Card"],
    },
    requiredDocuments: [
      "Aadhaar Card (linked to Ration Card)",
      "NFSA Ration Card (PHH / AAY)"
    ],
    applicationSteps: [
      "Ensure NFSA Ration Card is issued by State Food Department.",
      "Link Aadhaar to Ration Card at nearest Fair Price Shop or CSC.",
      "Collect free food grains monthly from designated Fair Price Shop."
    ],
    officialApplyUrl: "https://nfsa.gov.in/",
    officialWebsite: "https://nfsa.gov.in/",
    helplineNumber: "14445",
    deadline: "Open All Year",
    tags: ["Food Security", "Ration Card", "PMGKAY", "Free Food Grains", "NFSA"],
    faqs: [
      {
        question: "Who is covered under PMGKAY?",
        answer: "All NFSA beneficiaries (PHH and AAY ration card holders) covering approximately 81 Crore persons are eligible."
      }
    ],
    lastUpdated: "2026-08-20",
    popularityScore: 98
  },
  {
    id: "udid-disability-scheme",
    name: "Unique Disability ID (UDID) & Divyangjan Welfare Schemes",
    shortDescription: "Centralized disability registration and ID card scheme enabling Divyangjan to access all disability benefits, concessions, and welfare schemes seamlessly.",
    department: "Department of Empowerment of Persons with Disabilities (DEPwD)",
    ministry: "Ministry of Social Justice and Empowerment",
    category: "Disability Empowerment",
    state: "Central",
    benefitsSummary: "UDID Card enables: 3% reservation in govt jobs, 5% reservation in govt housing, income tax benefits (₹75,000 - ₹1,25,000 deduction under Sec 80U), free railway travel concession, and free/subsidized assistive devices.",
    financialBenefitAmount: 125000,
    eligibilityRules: {
      requiresDisability: true,
      minDisabilityPercentage: 40,
      requiredDocuments: ["Aadhaar", "Disability Certificate (UDID)"],
    },
    requiredDocuments: [
      "Aadhaar Card",
      "Medical Certificate from Govt Hospital (showing 40%+ disability)",
      "Passport size photographs",
      "Address Proof"
    ],
    applicationSteps: [
      "Visit swavlambancard.gov.in or nearest District Disability Rehabilitation Centre (DDRC).",
      "Fill UDID application with Aadhaar details and disability information.",
      "Medical assessment by Govt hospital's Medical Board.",
      "UDID card issued with QR code for seamless scheme access."
    ],
    officialApplyUrl: "https://swavlambancard.gov.in/",
    officialWebsite: "https://swavlambancard.gov.in/",
    helplineNumber: "1800-11-4515",
    deadline: "Open All Year",
    tags: ["Disability", "UDID", "Divyangjan", "Reservation", "Assistive Device"],
    faqs: [
      {
        question: "What is the minimum disability percentage to get UDID?",
        answer: "A minimum of 40% disability as assessed by a government Medical Authority is required to obtain UDID card."
      }
    ],
    lastUpdated: "2026-07-20",
    popularityScore: 86
  }
];
