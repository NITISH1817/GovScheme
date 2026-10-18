import type { Scheme } from '../types';

// Note on PM-KISAN eligibility: Per official GoI Union Cabinet Decision on 31-May-2019 (PIB Release ID 1572996, checked Oct 2026),
// the original 2-hectare (5 acre) landholding limit was removed; all landholding farmer families across India are eligible.
export const schemesData: Scheme[] = [
  {
    "id": "pm-kisan",
    "name": "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
    "shortDescription": "Income support of ₹6,000 per year in three equal installments to all landholding farmer families across India.",
    "department": "Department of Agriculture & Farmers Welfare",
    "ministry": "Ministry of Agriculture & Farmers Welfare",
    "category": "Agriculture & Farmers",
    "state": "Central",
    "benefitsSummary": "₹6,000 annually credited directly into bank accounts in 3 equal installments of ₹2,000 every 4 months.",
    "financialBenefitAmount": 6000,
    "eligibilityRules": {
      "allowedOccupations": [
        "Farmer",
        "Agriculture Worker",
        "Self Employed Farmer"
      ],
      "requiredDocuments": [
        "Aadhaar",
        "Land Record (Khata/Khasra)",
        "Bank Passbook"
      ],
      "allowedCategories": [
        "General",
        "OBC",
        "SC",
        "ST",
        "EWS"
      ]
    },
    "requiredDocuments": [
      "Aadhaar Card",
      "Land Ownership Documents / Khasra Khatoni",
      "Savings Bank Account Passbook",
      "Mobile Number Linked to Aadhaar"
    ],
    "applicationSteps": [
      "Visit official portal pmkisan.gov.in or nearest CSC Kendra.",
      "Click on 'Farmers Corner' -> 'New Farmer Registration'.",
      "Enter Aadhaar Number, Select Rural/Urban Farmer, State, and District.",
      "Fill land detail details (Khata Number, Survey Number, Area in Hectares).",
      "Upload Land Ownership Document and submit."
    ],
    "officialApplyUrl": "https://pmkisan.gov.in/",
    "officialWebsite": "https://pmkisan.gov.in/",
    "helplineNumber": "155261 / 011-24300606",
    "deadline": "Open All Year",
    "tags": [
      "Farmer",
      "Direct Benefit Transfer",
      "Agriculture",
      "PM KISAN"
    ],
    "faqs": [
      {
        "question": "Who is eligible for PM-KISAN?",
        "answer": "All landholding farmer families having cultivable land in their names are eligible, subject to institutional landholder exclusion criteria."
      },
      {
        "question": "Is tenant farmer eligible?",
        "answer": "Currently, land ownership in land records is mandatory for PM-KISAN registration."
      }
    ],
    "lastUpdated": "2026-08-01",
    "popularityScore": 98
  },
  {
    "id": "pmay-g",
    "name": "Pradhan Mantri Awas Yojana - Gramin (PMAY-G)",
    "shortDescription": "Financial assistance to construct pucca houses with basic amenities for homeless and kutcha house dwellers in rural areas.",
    "department": "Department of Rural Development",
    "ministry": "Ministry of Rural Development",
    "category": "Housing & Shelter",
    "state": "Central",
    "benefitsSummary": "Financial grant of ₹1,20,000 in plain areas and ₹1,30,000 in hilly/hilly states + 90 days MGNREGA unskilled labor wages.",
    "financialBenefitAmount": 120000,
    "eligibilityRules": {
      "maxAnnualIncome": 180000,
      "allowedOccupations": [
        "Daily Wager",
        "Agricultural Laborer",
        "Artisan",
        "Unemployed",
        "Farmer"
      ],
      "requiredDocuments": [
        "Aadhaar",
        "Job Card",
        "Bank Passbook",
        "Income Certificate"
      ]
    },
    "requiredDocuments": [
      "Aadhaar Card",
      "MGNREGA Job Card",
      "Bank Account Details",
      "Swachh Bharat Mission (SBM) Registration Number",
      "Consent Letter to use Aadhaar"
    ],
    "applicationSteps": [
      "Contact your Gram Panchayat / Gram Sabha administrator or visit pmayg.nic.in.",
      "Gram Sabha verifies houseless/kutcha house status from SECC list.",
      "AwasSoft geo-tagging officer captures existing site photo.",
      "Installment released directly into bank account in 3 construction stages."
    ],
    "officialApplyUrl": "https://pmayg.nic.in/",
    "officialWebsite": "https://pmayg.nic.in/",
    "helplineNumber": "1800-11-6446",
    "deadline": "Open All Year",
    "tags": [
      "Housing",
      "Gramin",
      "PMAY",
      "Rural Development"
    ],
    "faqs": [
      {
        "question": "How is the beneficiary selected?",
        "answer": "Beneficiaries are selected based on housing deprivation parameters in SEC 2011 data and validated by Gram Sabha."
      }
    ],
    "lastUpdated": "2026-07-15",
    "popularityScore": 95
  },
  {
    "id": "pmjay-ayushman",
    "name": "Ayushman Bharat - PM Jan Arogya Yojana (PM-JAY)",
    "shortDescription": "World's largest health insurance scheme providing ₹5 Lakh per family per year for secondary and tertiary hospitalization.",
    "department": "National Health Authority",
    "ministry": "Ministry of Health and Family Welfare",
    "category": "Health & Healthcare",
    "state": "Central",
    "benefitsSummary": "Cashless health cover up to ₹5,00,000 per family per year for inpatient medical treatment across 27,000+ empanelled hospitals.",
    "financialBenefitAmount": 500000,
    "eligibilityRules": {
      "maxAnnualIncome": 250000,
      "requiredDocuments": [
        "Aadhaar",
        "Ration Card"
      ]
    },
    "requiredDocuments": [
      "Aadhaar Card",
      "Ration Card / SECC Family Identity Card",
      "Mobile Number"
    ],
    "applicationSteps": [
      "Check eligibility on mera.pmjay.gov.in or visit any empanelled Govt/Private hospital Arogyamitra Desk.",
      "Provide Aadhaar card or Ration card to Arogyamitra for instant e-KYC verification.",
      "Get Ayushman Card generated instantly."
    ],
    "officialApplyUrl": "https://pmjay.gov.in/",
    "officialWebsite": "https://pmjay.gov.in/",
    "helplineNumber": "14555 / 1800-11-4477",
    "deadline": "Open All Year",
    "tags": [
      "Health",
      "Insurance",
      "Hospitalization",
      "PMJAY"
    ],
    "faqs": [
      {
        "question": "Is there any cap on family size or age?",
        "answer": "No, there is no restriction on family size, age, or gender."
      }
    ],
    "lastUpdated": "2026-08-10",
    "popularityScore": 99
  },
  {
    "id": "pm-ujjwala",
    "name": "Pradhan Mantri Ujjwala Yojana 2.0 (PMUY)",
    "shortDescription": "Free LPG gas connection with first refill and stove free for adult women from low-income rural households.",
    "department": "Ministry of Petroleum and Natural Gas",
    "ministry": "Ministry of Petroleum and Natural Gas",
    "category": "Women & Child Welfare",
    "state": "Central",
    "benefitsSummary": "Deposit-free LPG connection + Free hotplate (stove) + First 14.2kg LPG cylinder refill + ₹300 subsidy per cylinder.",
    "financialBenefitAmount": 3600,
    "eligibilityRules": {
      "allowedGenders": [
        "Female"
      ],
      "minAge": 18,
      "maxAnnualIncome": 200000,
      "requiredDocuments": [
        "Aadhaar",
        "Ration Card",
        "Bank Passbook"
      ]
    },
    "requiredDocuments": [
      "Aadhaar Card of Applicant Woman & Adult Family Members",
      "Ration Card issued by State Govt",
      "Bank Account Number and IFSC Code",
      "14-Point Declaration"
    ],
    "applicationSteps": [
      "Visit any LPG distributor (Indane, Bharatgas, HP Gas) or pmuy.gov.in.",
      "Fill online/offline Ujjwala application form with family details.",
      "Submit Aadhaar e-KYC and Ration Card details.",
      "Collect free LPG connection & stove from distributor."
    ],
    "officialApplyUrl": "https://www.pmuy.gov.in/",
    "officialWebsite": "https://www.pmuy.gov.in/",
    "helplineNumber": "1800-266-6696",
    "deadline": "Open All Year",
    "tags": [
      "LPG",
      "Women",
      "Gas Connection",
      "Ujjwala"
    ],
    "faqs": [
      {
        "question": "Can men apply for Ujjwala?",
        "answer": "No, LPG connection under PMUY is issued exclusively in the name of an adult woman of the household."
      }
    ],
    "lastUpdated": "2026-06-20",
    "popularityScore": 92
  },
  {
    "id": "sukanya-samriddhi",
    "name": "Sukanya Samriddhi Yojana (SSY)",
    "shortDescription": "High-interest government savings scheme for girl children offering tax benefits and guaranteed returns for higher education & marriage.",
    "department": "Department of Posts / Department of Financial Services",
    "ministry": "Ministry of Finance",
    "category": "Women & Child Welfare",
    "state": "Central",
    "benefitsSummary": "Interest rate of 8.2% p.a. tax-free under Section 80C. Deposits from ₹250 to ₹1.5 Lakh per year.",
    "financialBenefitAmount": 150000,
    "eligibilityRules": {
      "maxAge": 10,
      "allowedGenders": [
        "Female"
      ],
      "requiredDocuments": [
        "Birth Certificate",
        "Aadhaar"
      ]
    },
    "requiredDocuments": [
      "Girl Child Birth Certificate",
      "Parent/Legal Guardian Aadhaar Card",
      "Parent Identity & Address Proof",
      "Passport Size Photograph"
    ],
    "applicationSteps": [
      "Visit nearest India Post Office or empanelled public/private bank branch.",
      "Fill Sukanya Samriddhi Account Opening Form.",
      "Submit Girl Child birth certificate and Parent Aadhaar copy.",
      "Deposit initial minimum amount (min ₹250) and collect passbook."
    ],
    "officialApplyUrl": "https://www.indiapost.gov.in/",
    "officialWebsite": "https://www.indiapost.gov.in/",
    "helplineNumber": "1800-266-6868",
    "deadline": "Open All Year",
    "tags": [
      "Girl Child",
      "Savings",
      "Tax Free",
      "Post Office"
    ],
    "faqs": [
      {
        "question": "Up to what age can an account be opened?",
        "answer": "Account can be opened anytime from birth till the girl child reaches 10 years of age."
      }
    ],
    "lastUpdated": "2026-07-01",
    "popularityScore": 90
  },
  {
    "id": "nsap-old-age-pension",
    "name": "Indira Gandhi National Old Age Pension Scheme (IGNOAPS)",
    "shortDescription": "Monthly pension support for senior citizens aged 60+ living below poverty line in rural & urban India.",
    "department": "Department of Rural Development",
    "ministry": "Ministry of Rural Development",
    "category": "Pensions & Senior Care",
    "state": "Central",
    "benefitsSummary": "Monthly pension of ₹1,000 to ₹3,000 per month (combined Central + State contribution) credited to bank account.",
    "financialBenefitAmount": 24000,
    "eligibilityRules": {
      "minAge": 60,
      "maxAnnualIncome": 120000,
      "requiredDocuments": [
        "Aadhaar",
        "Income Certificate",
        "Age Proof",
        "Bank Passbook"
      ]
    },
    "requiredDocuments": [
      "Aadhaar Card",
      "BPL Card / Income Certificate from Tehsildar",
      "Age Proof Certificate",
      "Bank Account Passbook"
    ],
    "applicationSteps": [
      "Visit local Block Development Office (BDO) / Gram Panchayat or nsap.nic.in.",
      "Fill IGNOAPS Pension Application Form.",
      "Attach BPL proof, age proof and Aadhaar card.",
      "Upon verification by Social Welfare Inspector, pension starts monthly."
    ],
    "officialApplyUrl": "https://nsap.nic.in/",
    "officialWebsite": "https://nsap.nic.in/",
    "helplineNumber": "1800-11-0001",
    "deadline": "Open All Year",
    "tags": [
      "Pension",
      "Senior Citizen",
      "NSAP",
      "BPL"
    ],
    "faqs": [
      {
        "question": "What is the minimum age criterion?",
        "answer": "Applicant must be at least 60 years old and belong to a BPL household."
      }
    ],
    "lastUpdated": "2026-05-18",
    "popularityScore": 89
  },
  {
    "id": "pm-vishwakarma",
    "name": "PM Vishwakarma Scheme",
    "shortDescription": "Holistic support to traditional artisans and craftspeople including toolkit incentives, skill training, and collateral-free loans up to ₹3 Lakh.",
    "department": "Ministry of Micro, Small and Medium Enterprises",
    "ministry": "Ministry of MSME",
    "category": "Employment & Micro Enterprises",
    "state": "Central",
    "benefitsSummary": "₹15,000 Toolkit Incentive + ₹500/day stipend during training + Collateral-free loan of ₹1 Lakh (Tranche 1) & ₹2 Lakh (Tranche 2) at 5% interest.",
    "financialBenefitAmount": 315000,
    "eligibilityRules": {
      "minAge": 18,
      "allowedOccupations": [
        "Artisan",
        "Carpenter",
        "Blacksmith",
        "Locksmith",
        "Sculptor",
        "Goldsmith",
        "Cobbler",
        "Tailor",
        "Mason",
        "Barber",
        "Washerman"
      ],
      "requiredDocuments": [
        "Aadhaar",
        "Bank Passbook",
        "Skill Certificate"
      ]
    },
    "requiredDocuments": [
      "Aadhaar Card",
      "Bank Passbook Details",
      "Mobile Number Linked to Aadhaar",
      "Trade/Craft Verification by Gram Panchayat Pradhan"
    ],
    "applicationSteps": [
      "Visit nearest Common Service Centre (CSC) or pmvishwakarma.gov.in.",
      "Complete Aadhaar e-KYC and trade registration.",
      "Gram Panchayat Level 1 verification followed by District Committee approval.",
      "Receive PM Vishwakarma Digital ID Card, toolkit grant, and loan eligibility."
    ],
    "officialApplyUrl": "https://pmvishwakarma.gov.in/",
    "officialWebsite": "https://pmvishwakarma.gov.in/",
    "helplineNumber": "1800-267-7777",
    "deadline": "Open All Year",
    "tags": [
      "Artisan",
      "Craftsman",
      "MSME",
      "Loans",
      "PM Vishwakarma"
    ],
    "faqs": [
      {
        "question": "Which trades are covered under PM Vishwakarma?",
        "answer": "18 traditional trades including Carpenter, Boat Maker, Armorer, Blacksmith, Locksmith, Hammer & Tool Kit Maker, Sculptor, Goldsmith, Potter, Cobbler, Mason, Basket/Mat Weaver, Doll & Toy Maker, Barber, Garland Maker, Washerman, Tailor, and Fishing Net Weaver."
      }
    ],
    "lastUpdated": "2026-08-05",
    "popularityScore": 94
  },
  {
    "id": "pm-mudra",
    "name": "Pradhan Mantri MUDRA Yojana (PMMY)",
    "shortDescription": "Collateral-free micro loans up to ₹10 Lakhs for micro-enterprises, small businesses, shopkeepers, and self-employed entrepreneurs.",
    "department": "Department of Financial Services",
    "ministry": "Ministry of Finance",
    "category": "Financial Inclusion & Credit",
    "state": "Central",
    "benefitsSummary": "Collateral-free business loans under 3 categories: Shishu (Up to ₹50,000), Kishor (₹50,000 to ₹5 Lakh), and Tarun (₹5 Lakh to ₹10 Lakh).",
    "financialBenefitAmount": 1000000,
    "eligibilityRules": {
      "minAge": 18,
      "allowedOccupations": [
        "Self Employed",
        "Shopkeeper",
        "Micro Entrepreneur",
        "Vendor",
        "Artisan",
        "Small Business Owner"
      ],
      "requiredDocuments": [
        "Aadhaar",
        "PAN",
        "Bank Passbook",
        "Business Proposal"
      ]
    },
    "requiredDocuments": [
      "Aadhaar Card & PAN Card",
      "Proof of Identity & Business Address",
      "Bank Account Statements (last 6 months)",
      "Business Model / Quotation of Machinery or Items to be Purchased"
    ],
    "applicationSteps": [
      "Visit any Commercial Bank, RRB, MFI, or Udyami Mitra portal (udyamimitra.in).",
      "Fill MUDRA Loan Application Form selecting Shishu, Kishor, or Tarun category.",
      "Submit identity proof, address proof, and business proposal.",
      "Bank sanctions and disburses loan with Mudra Debit Card."
    ],
    "officialApplyUrl": "https://www.mudra.org.in/",
    "officialWebsite": "https://www.mudra.org.in/",
    "helplineNumber": "1800-180-1111",
    "deadline": "Open All Year",
    "tags": [
      "MUDRA",
      "Business Loan",
      "Micro Finance",
      "Self Employed"
    ],
    "faqs": [
      {
        "question": "Is collateral security required for MUDRA loan?",
        "answer": "No collateral security is required for loans under PMMY."
      }
    ],
    "lastUpdated": "2026-07-22",
    "popularityScore": 91
  },
  {
    "id": "pm-svanidhi",
    "name": "PM Street Vendor's AtmaNirbhar Nidhi (PM SVANidhi)",
    "shortDescription": "Special micro-credit facility providing affordable collateral-free working capital loans to urban and peri-urban street vendors.",
    "department": "Ministry of Housing and Urban Affairs",
    "ministry": "Ministry of Housing and Urban Affairs",
    "category": "Financial Inclusion & Credit",
    "state": "Central",
    "benefitsSummary": "First tranche working capital loan of ₹10,000 (7% interest subsidy), 2nd tranche ₹20,000, 3rd tranche ₹50,000 + cashback on digital transactions.",
    "financialBenefitAmount": 50000,
    "eligibilityRules": {
      "minAge": 18,
      "allowedOccupations": [
        "Street Vendor",
        "Hawker",
        "Vendor",
        "Daily Wager"
      ],
      "requiredDocuments": [
        "Aadhaar",
        "Vendor ID Card / Letter of Recommendation",
        "Bank Passbook"
      ]
    },
    "requiredDocuments": [
      "Aadhaar Card",
      "Certificate of Vending / Vendor Identity Card / Letter of Recommendation (LoR) from ULB",
      "Bank Account Details"
    ],
    "applicationSteps": [
      "Visit pmsvanidhi.mohua.gov.in or nearest CSC Centre.",
      "Check vendor status with Aadhaar number.",
      "Fill loan application and select preferred lending bank.",
      "Bank processes e-KYC and credits loan within 7 working days."
    ],
    "officialApplyUrl": "https://pmsvanidhi.mohua.gov.in/",
    "officialWebsite": "https://pmsvanidhi.mohua.gov.in/",
    "helplineNumber": "1800-11-1979",
    "deadline": "Open All Year",
    "tags": [
      "Street Vendor",
      "SVANidhi",
      "Micro Loan",
      "Working Capital"
    ],
    "faqs": [
      {
        "question": "What is the interest subsidy provided?",
        "answer": "Vendors paying timely installments receive 7% interest subsidy per annum directly into their bank accounts."
      }
    ],
    "lastUpdated": "2026-06-12",
    "popularityScore": 88
  },
  {
    "id": "mgnrega",
    "name": "Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA)",
    "shortDescription": "Guarantees at least 100 days of wage employment in a financial year to every rural household whose adult members volunteer to do unskilled manual work.",
    "department": "Department of Rural Development",
    "ministry": "Ministry of Rural Development",
    "category": "Employment & Micro Enterprises",
    "state": "Central",
    "benefitsSummary": "Guaranteed 100 days of wage employment per rural household per year at statutory state wage rates (avg ₹240-₹375/day).",
    "financialBenefitAmount": 30000,
    "eligibilityRules": {
      "minAge": 18,
      "allowedOccupations": [
        "Unemployed",
        "Agricultural Laborer",
        "Daily Wager",
        "Farmer"
      ],
      "requiredDocuments": [
        "Aadhaar",
        "Job Card",
        "Bank Passbook"
      ]
    },
    "requiredDocuments": [
      "Aadhaar Card",
      "MGNREGA Job Card",
      "Bank / Post Office Savings Account Passbook"
    ],
    "applicationSteps": [
      "Submit application for Job Card registration to local Gram Panchayat.",
      "Gram Panchayat issues Job Card free of cost within 15 days.",
      "Submit written work demand application to Gram Panchayat for wage employment.",
      "Work allotted within 5 km radius of village within 15 days."
    ],
    "officialApplyUrl": "https://nrega.nic.in/",
    "officialWebsite": "https://nrega.nic.in/",
    "helplineNumber": "1800-11-1555",
    "deadline": "Open All Year",
    "tags": [
      "Job Card",
      "MGNREGA",
      "Employment",
      "Rural Wages"
    ],
    "faqs": [
      {
        "question": "What if work is not provided within 15 days?",
        "answer": "If work is not provided within 15 days of applying, the applicant is entitled to unemployment allowance."
      }
    ],
    "lastUpdated": "2026-08-02",
    "popularityScore": 97
  },
  {
    "id": "post-matric-scholarship",
    "name": "Post-Matric Scholarship for SC/ST/OBC Students",
    "shortDescription": "Financial assistance for post-secondary/higher education students belonging to SC, ST, and OBC categories.",
    "department": "Department of Social Justice and Empowerment",
    "ministry": "Ministry of Social Justice and Empowerment",
    "category": "Education & Skill",
    "state": "Central",
    "benefitsSummary": "Full tuition fee reimbursement + monthly maintenance allowance up to ₹13,500/year directly to student accounts.",
    "financialBenefitAmount": 40000,
    "eligibilityRules": {
      "maxAnnualIncome": 250000,
      "allowedCategories": [
        "SC",
        "ST",
        "OBC",
        "EWS"
      ],
      "requiredEducation": [
        "Class 10 Pass",
        "Class 12 Pass",
        "Diploma",
        "Graduate",
        "Post Graduate"
      ],
      "requiredDocuments": [
        "Aadhaar",
        "Community Certificate",
        "Income Certificate",
        "Education Certificate",
        "Bank Passbook"
      ]
    },
    "requiredDocuments": [
      "Aadhaar Card",
      "Community / Caste Certificate issued by competent authority",
      "Family Annual Income Certificate",
      "Mark Sheet of Previous Passed Exam",
      "College Fee Receipt & Student ID",
      "Bank Account Linked to Aadhaar"
    ],
    "applicationSteps": [
      "Visit National Scholarship Portal (scholarships.gov.in).",
      "Register using One-Time Student Registration (OTR) with Aadhaar e-KYC.",
      "Select State and Post-Matric Scholarship Scheme for SC/ST/OBC.",
      "Upload documents, college admission proof, and submit.",
      "Institution verifies application online followed by State Nodal Officer."
    ],
    "officialApplyUrl": "https://scholarships.gov.in/",
    "officialWebsite": "https://scholarships.gov.in/",
    "helplineNumber": "0120-6619540",
    "deadline": "31st October 2026",
    "tags": [
      "Scholarship",
      "Post Matric",
      "SC ST OBC",
      "Higher Education"
    ],
    "faqs": [
      {
        "question": "Can I apply for multiple scholarships simultaneously?",
        "answer": "No, a student can avail benefit under only one government scholarship scheme in an academic year."
      }
    ],
    "lastUpdated": "2026-07-28",
    "popularityScore": 93
  },
  {
    "id": "tn-pudhumai-penn",
    "name": "Moovalur Ramamirtham Ammaiyar Higher Education Assurance (Pudhumai Penn - Tamil Nadu)",
    "shortDescription": "Monthly financial assistance of ₹1,000 for female students from Govt schools pursuing higher education in Tamil Nadu.",
    "department": "Social Welfare and Women Empowerment Department",
    "ministry": "Government of Tamil Nadu",
    "category": "Women & Child Welfare",
    "state": "Tamil Nadu",
    "benefitsSummary": "₹1,000 every month directly transferred to bank accounts until completion of UG Degree, Diploma, ITI, or Professional course.",
    "financialBenefitAmount": 12000,
    "eligibilityRules": {
      "allowedGenders": [
        "Female"
      ],
      "allowedStates": [
        "Tamil Nadu"
      ],
      "minAge": 17,
      "requiredEducation": [
        "Class 6 to 12 in Govt School"
      ],
      "requiredDocuments": [
        "Aadhaar",
        "School Certificate",
        "Bank Passbook"
      ]
    },
    "requiredDocuments": [
      "Aadhaar Card",
      "School Transfer Certificate / Bonafide proving Class 6 to 12 studied in Govt School",
      "College Admission ID / Bonafide Certificate",
      "Bank Account Details"
    ],
    "applicationSteps": [
      "Visit penkalvi.tn.gov.in or apply through College Nodal Officer.",
      "Enter EMIS ID and Aadhaar details for automatic Govt school verification.",
      "Upload college bonafide certificate and bank passbook.",
      "Monthly payout starts directly upon nodal officer approval."
    ],
    "officialApplyUrl": "https://penkalvi.tn.gov.in/",
    "officialWebsite": "https://penkalvi.tn.gov.in/",
    "helplineNumber": "1800-425-0126",
    "deadline": "Open All Year",
    "tags": [
      "Tamil Nadu",
      "Girl Student",
      "Higher Education",
      "Pudhumai Penn"
    ],
    "faqs": [
      {
        "question": "Is private school education eligible?",
        "answer": "No, female students must have studied Class 6 to 12 continuously in Government Schools of Tamil Nadu."
      }
    ],
    "lastUpdated": "2026-08-01",
    "popularityScore": 96
  },
  {
    "id": "up-kanya-sumangala",
    "name": "Mukhya Mantri Kanya Sumangala Yojana (Uttar Pradesh)",
    "shortDescription": "Phased financial incentive total ₹25,000 for girl child from birth through education stages in Uttar Pradesh.",
    "department": "Women and Child Development Department",
    "ministry": "Government of Uttar Pradesh",
    "category": "Women & Child Welfare",
    "state": "Uttar Pradesh",
    "benefitsSummary": "Total ₹25,000 distributed in 6 installments from birth (₹5,000), vaccination, Class 1, Class 6, Class 9, and Degree/Diploma entry.",
    "financialBenefitAmount": 25000,
    "eligibilityRules": {
      "allowedGenders": [
        "Female"
      ],
      "allowedStates": [
        "Uttar Pradesh"
      ],
      "maxAnnualIncome": 300000,
      "requiredDocuments": [
        "Aadhaar",
        "Birth Certificate",
        "Income Certificate",
        "Bank Passbook"
      ]
    },
    "requiredDocuments": [
      "Parents' & Girl Child Aadhaar Card",
      "Girl Child Birth Certificate",
      "Family Income Certificate (Max ₹3 Lakh/year)",
      "Bank Account Passbook",
      "School Admission Certificate (for education stages)"
    ],
    "applicationSteps": [
      "Visit mksy.up.gov.in portal.",
      "Register as new user with mobile number and district.",
      "Select applicable stage (Birth, Vaccination, Class 1/6/9, Degree).",
      "Upload birth/school certificate and submit for District Welfare Officer approval."
    ],
    "officialApplyUrl": "https://mksy.up.gov.in/",
    "officialWebsite": "https://mksy.up.gov.in/",
    "helplineNumber": "1800-180-0300",
    "deadline": "Open All Year",
    "tags": [
      "Uttar Pradesh",
      "Kanya Sumangala",
      "Girl Child",
      "UP Scheme"
    ],
    "faqs": [
      {
        "question": "How many girl children per family are covered?",
        "answer": "Maximum 2 girl children per family can avail benefits under this scheme."
      }
    ],
    "lastUpdated": "2026-07-10",
    "popularityScore": 92
  },
  {
    "id": "telangana-rythu-bandhu",
    "name": "Rythu Bandhu Investment Support Scheme (Telangana)",
    "shortDescription": "Crop investment support of ₹10,000 per acre per year for landholding farmers in Telangana for purchase of seeds, fertilizers & inputs.",
    "department": "Agriculture Department",
    "ministry": "Government of Telangana",
    "category": "Agriculture & Farmers",
    "state": "Telangana",
    "benefitsSummary": "₹5,000 per acre per season (Rabi and Kharif), total ₹10,000 per acre per year credited directly to Pattadar bank accounts.",
    "financialBenefitAmount": 10000,
    "eligibilityRules": {
      "allowedStates": [
        "Telangana"
      ],
      "allowedOccupations": [
        "Farmer",
        "Agriculture Worker"
      ],
      "requiredDocuments": [
        "Pattadar Passbook",
        "Aadhaar",
        "Bank Passbook"
      ]
    },
    "requiredDocuments": [
      "Pattadar Dharani Passbook",
      "Aadhaar Card",
      "Bank Account Details (Aadhaar linked)"
    ],
    "applicationSteps": [
      "Ensure land is registered on Dharani Portal (dharani.telangana.gov.in).",
      "Submit Pattadar passbook details to local Agriculture Extension Officer (AEO).",
      "Direct Benefit Transfer automatically executed every season."
    ],
    "officialApplyUrl": "https://dharani.telangana.gov.in/",
    "officialWebsite": "https://dharani.telangana.gov.in/",
    "helplineNumber": "1800-425-2939",
    "deadline": "Open All Year",
    "tags": [
      "Telangana",
      "Rythu Bandhu",
      "Farmer Support",
      "Agriculture"
    ],
    "faqs": [
      {
        "question": "Is there any upper acreage limit for Rythu Bandhu?",
        "answer": "No, investment support is provided per acre for every landholding farmer regardless of total land size."
      }
    ],
    "lastUpdated": "2026-06-25",
    "popularityScore": 94
  },
  {
    "id": "karnataka-gruha-lakshmi",
    "name": "Gruha Lakshmi Scheme (Karnataka)",
    "shortDescription": "Monthly financial aid of ₹2,000 to the woman head of every eligible household in Karnataka.",
    "department": "Women and Child Development Department",
    "ministry": "Government of Karnataka",
    "category": "Women & Child Welfare",
    "state": "Karnataka",
    "benefitsSummary": "₹2,000 per month directly deposited to the bank account of the designated female head of the family.",
    "financialBenefitAmount": 24000,
    "eligibilityRules": {
      "allowedGenders": [
        "Female"
      ],
      "allowedStates": [
        "Karnataka"
      ],
      "maxAnnualIncome": 200000,
      "requiredDocuments": [
        "Aadhaar",
        "Ration Card",
        "Bank Passbook"
      ]
    },
    "requiredDocuments": [
      "Aadhaar Card of Woman Head of Household",
      "Husband's Aadhaar Card",
      "BPL / APL Ration Card (showing applicant as female head)",
      "Aadhaar-seeded Bank Account Details"
    ],
    "applicationSteps": [
      "Visit Seva Sindhu Portal (sevasindhugs.karnataka.gov.in) or nearest Grama One / Karnataka One center.",
      "Enter Ration Card number to fetch family details.",
      "Perform Aadhaar biometric authentication.",
      "DBT monthly payout initiated upon verification."
    ],
    "officialApplyUrl": "https://sevasindhugs.karnataka.gov.in/",
    "officialWebsite": "https://sevasindhugs.karnataka.gov.in/",
    "helplineNumber": "1902",
    "deadline": "Open All Year",
    "tags": [
      "Karnataka",
      "Gruha Lakshmi",
      "Women Support",
      "DBT"
    ],
    "faqs": [
      {
        "question": "Are income tax paying households eligible?",
        "answer": "Women or husbands who pay income tax or file GST returns are excluded from Gruha Lakshmi."
      }
    ],
    "lastUpdated": "2026-08-04",
    "popularityScore": 95
  },
  {
    "id": "igndps-disability-pension",
    "name": "Indira Gandhi National Disability Pension Scheme (IGNDPS)",
    "shortDescription": "Monthly pension assistance for individuals aged 18-79 living below poverty line with severe (80%+) disability.",
    "department": "Department of Rural Development",
    "ministry": "Ministry of Rural Development",
    "category": "Disability Empowerment",
    "state": "Central",
    "benefitsSummary": "Monthly pension of ₹1,000 to ₹2,500 credited directly into bank account.",
    "financialBenefitAmount": 18000,
    "eligibilityRules": {
      "minAge": 18,
      "maxAge": 79,
      "requiresDisability": true,
      "minDisabilityPercentage": 80,
      "maxAnnualIncome": 120000,
      "requiredDocuments": [
        "Aadhaar",
        "Disability Certificate (UDID)",
        "Income Certificate",
        "Bank Passbook"
      ]
    },
    "requiredDocuments": [
      "Aadhaar Card",
      "Unique Disability ID (UDID) Card / Certificate (80%+ disability)",
      "BPL Ration Card or Income Certificate",
      "Bank Account Passbook"
    ],
    "applicationSteps": [
      "Apply through Social Welfare Department or Block Development Office (BDO).",
      "Submit UDID card copy and BPL details.",
      "Medical Board verifies disability level.",
      "Monthly pension commences upon approval."
    ],
    "officialApplyUrl": "https://swavlambancard.gov.in/",
    "officialWebsite": "https://swavlambancard.gov.in/",
    "helplineNumber": "1800-11-0001",
    "deadline": "Open All Year",
    "tags": [
      "Disability",
      "UDID",
      "Pension",
      "IGNDPS"
    ],
    "faqs": [
      {
        "question": "What disability percentage is required?",
        "answer": "A minimum of 80% severe disability as certified by a competent medical authority or UDID card is required."
      }
    ],
    "lastUpdated": "2026-05-30",
    "popularityScore": 87
  },
  {
    "id": "pm-fasal-bima",
    "name": "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    "shortDescription": "Comprehensive crop insurance scheme providing financial support to farmers suffering crop loss from natural calamities, pests, and diseases.",
    "department": "Department of Agriculture & Farmers Welfare",
    "ministry": "Ministry of Agriculture & Farmers Welfare",
    "category": "Agriculture & Farmers",
    "state": "Central",
    "benefitsSummary": "Full coverage of sum insured for crop loss due to natural calamities. Farmers pay 2% premium for Kharif, 1.5% for Rabi, and 5% for commercial/horticultural crops.",
    "financialBenefitAmount": 200000,
    "eligibilityRules": {
      "allowedOccupations": [
        "Farmer",
        "Agriculture Worker",
        "Self Employed Farmer"
      ],
      "requiredDocuments": [
        "Aadhaar",
        "Land Record (Khata/Khasra)",
        "Bank Passbook"
      ],
      "allowedCategories": [
        "General",
        "OBC",
        "SC",
        "ST",
        "EWS"
      ]
    },
    "requiredDocuments": [
      "Aadhaar Card",
      "Land Record / Khasra Khatauni",
      "Bank Account Passbook",
      "Sowing Certificate from Patwari"
    ],
    "applicationSteps": [
      "Visit pmfby.gov.in or nearest bank/CSC to enroll before sowing season.",
      "Select crop, sowing season, and enter land details.",
      "Pay nominal premium amount (2% for Kharif crops).",
      "In case of crop loss, file intimation within 72 hours via Crop Insurance App or helpline."
    ],
    "officialApplyUrl": "https://pmfby.gov.in/",
    "officialWebsite": "https://pmfby.gov.in/",
    "helplineNumber": "1800-180-1111",
    "deadline": "Before Kharif/Rabi Sowing",
    "tags": [
      "Crop Insurance",
      "Farmer",
      "PMFBY",
      "Natural Calamity"
    ],
    "faqs": [
      {
        "question": "What crops are covered under PMFBY?",
        "answer": "All food crops (cereals, millets, pulses), oilseeds, and annual commercial/horticultural crops are covered."
      }
    ],
    "lastUpdated": "2026-08-10",
    "popularityScore": 93
  },
  {
    "id": "atal-pension-yojana",
    "name": "Atal Pension Yojana (APY)",
    "shortDescription": "Government-backed pension scheme for unorganized sector workers guaranteeing fixed monthly pension of ₹1,000 to ₹5,000 after age 60.",
    "department": "Pension Fund Regulatory and Development Authority (PFRDA)",
    "ministry": "Ministry of Finance",
    "category": "Pensions & Senior Care",
    "state": "Central",
    "benefitsSummary": "Guaranteed monthly pension of ₹1,000 / ₹2,000 / ₹3,000 / ₹4,000 / ₹5,000 depending on contribution amount and age of entry. Government co-contributes 50% for eligible subscribers.",
    "financialBenefitAmount": 60000,
    "eligibilityRules": {
      "minAge": 18,
      "maxAge": 40,
      "requiredDocuments": [
        "Aadhaar",
        "Bank Passbook"
      ]
    },
    "requiredDocuments": [
      "Aadhaar Card",
      "Bank Account (Aadhaar-seeded Savings Account)",
      "Mobile Number"
    ],
    "applicationSteps": [
      "Visit any bank branch or apply via netbanking / mobile banking.",
      "Fill APY subscriber registration form with Aadhaar and bank details.",
      "Select desired monthly pension amount (₹1,000 - ₹5,000).",
      "Auto-debit of monthly contribution starts from savings account."
    ],
    "officialApplyUrl": "https://npscra.proteantech.in/scheme-details.php",
    "officialWebsite": "https://www.pfrda.org.in",
    "helplineNumber": "1800-110-069",
    "deadline": "Open All Year",
    "tags": [
      "Pension",
      "APY",
      "Unorganized Workers",
      "Retirement"
    ],
    "faqs": [
      {
        "question": "Can I have both APY and NPS?",
        "answer": "Yes, APY and NPS are independent schemes. Citizens can subscribe to both simultaneously."
      }
    ],
    "lastUpdated": "2026-07-01",
    "popularityScore": 88
  },
  {
    "id": "pm-jan-dhan",
    "name": "Pradhan Mantri Jan Dhan Yojana (PMJDY)",
    "shortDescription": "Financial inclusion mission to provide universal access to basic banking, remittance, credit, insurance, and pension facilities for the unbanked.",
    "department": "Department of Financial Services",
    "ministry": "Ministry of Finance",
    "category": "Financial Inclusion & Credit",
    "state": "Central",
    "benefitsSummary": "Free zero-balance savings account + RuPay debit card + ₹2 Lakh accident insurance + ₹30,000 life cover + ₹10,000 overdraft facility after 6 months.",
    "financialBenefitAmount": 230000,
    "eligibilityRules": {
      "minAge": 10,
      "requiredDocuments": [
        "Aadhaar",
        "Bank Passbook"
      ]
    },
    "requiredDocuments": [
      "Aadhaar Card",
      "Address Proof (if address differs from Aadhaar)",
      "Passport size photograph"
    ],
    "applicationSteps": [
      "Visit any nationalized bank, RRB, or Bank Mitra (Business Correspondent).",
      "Fill PMJDY account opening form with Aadhaar eKYC.",
      "Get zero-balance savings account opened instantly.",
      "Receive free RuPay Debit Card with ₹2 Lakh accidental insurance."
    ],
    "officialApplyUrl": "https://pmjdy.gov.in/",
    "officialWebsite": "https://pmjdy.gov.in/",
    "helplineNumber": "1800-11-0001",
    "deadline": "Open All Year",
    "tags": [
      "Jan Dhan",
      "Bank Account",
      "Financial Inclusion",
      "RuPay"
    ],
    "faqs": [
      {
        "question": "Is a minimum balance required to maintain the PMJDY account?",
        "answer": "No, PMJDY accounts are zero-balance accounts. No minimum balance is required."
      }
    ],
    "lastUpdated": "2026-08-15",
    "popularityScore": 96
  },
  {
    "id": "startup-india-seed-fund",
    "name": "Startup India Seed Fund Scheme (SISFS)",
    "shortDescription": "Financial assistance of up to ₹20 Lakh (PoC grant) and up to ₹50 Lakh (investment at convertible debenture) for early-stage Indian startups.",
    "department": "Startup India Division, DPIIT",
    "ministry": "Ministry of Commerce and Industry",
    "category": "Employment & Micro Enterprises",
    "state": "Central",
    "benefitsSummary": "Grant of up to ₹20 Lakh for PoC/prototype, and investment up to ₹50 Lakh for market entry & commercialization via empanelled incubators.",
    "financialBenefitAmount": 5000000,
    "eligibilityRules": {
      "minAge": 18,
      "allowedOccupations": [
        "Entrepreneur",
        "Self Employed",
        "Micro Entrepreneur",
        "Small Business Owner"
      ],
      "requiredDocuments": [
        "Aadhaar",
        "PAN",
        "Bank Passbook"
      ]
    },
    "requiredDocuments": [
      "Startup India Registration (DIPP Certificate)",
      "Aadhaar & PAN of Founders",
      "Business Plan / Pitch Deck",
      "Bank Account Details"
    ],
    "applicationSteps": [
      "Register on Startup India Portal (startupindia.gov.in) and get DIPP recognition.",
      "Apply to empanelled incubators under SISFS via the portal.",
      "Submit detailed business plan, product demo, and financial projections.",
      "Incubator evaluates and disburses seed funding in tranches."
    ],
    "officialApplyUrl": "https://seedfund.startupindia.gov.in/",
    "officialWebsite": "https://seedfund.startupindia.gov.in/",
    "helplineNumber": "1800-115-565",
    "deadline": "Open All Year (Rolling Basis)",
    "tags": [
      "Startup",
      "Seed Fund",
      "Innovation",
      "Entrepreneurship",
      "DPIIT"
    ],
    "faqs": [
      {
        "question": "What stage of startup can apply for SISFS?",
        "answer": "Startups with a business idea or product at ideation/validation/early traction stage with less than 2 years of incorporation can apply."
      }
    ],
    "lastUpdated": "2026-08-01",
    "popularityScore": 85
  },
  {
    "id": "pm-garib-kalyan-anna",
    "name": "Pradhan Mantri Garib Kalyan Anna Yojana (PMGKAY)",
    "shortDescription": "Free food grain distribution scheme providing 5 kg of wheat/rice per person per month to 81 Crore National Food Security Act beneficiaries.",
    "department": "Department of Food and Public Distribution",
    "ministry": "Ministry of Consumer Affairs, Food and Public Distribution",
    "category": "Food & Nutrition",
    "state": "Central",
    "benefitsSummary": "5 kg free food grain (wheat/rice) per person per month through Ration Card at Fair Price Shops under NFSA.",
    "financialBenefitAmount": 6000,
    "eligibilityRules": {
      "maxAnnualIncome": 200000,
      "requiredDocuments": [
        "Aadhaar",
        "Ration Card"
      ]
    },
    "requiredDocuments": [
      "Aadhaar Card (linked to Ration Card)",
      "NFSA Ration Card (PHH / AAY)"
    ],
    "applicationSteps": [
      "Ensure NFSA Ration Card is issued by State Food Department.",
      "Link Aadhaar to Ration Card at nearest Fair Price Shop or CSC.",
      "Collect free food grains monthly from designated Fair Price Shop."
    ],
    "officialApplyUrl": "https://nfsa.gov.in/",
    "officialWebsite": "https://nfsa.gov.in/",
    "helplineNumber": "14445",
    "deadline": "Open All Year",
    "tags": [
      "Food Security",
      "Ration Card",
      "PMGKAY",
      "Free Food Grains",
      "NFSA"
    ],
    "faqs": [
      {
        "question": "Who is covered under PMGKAY?",
        "answer": "All NFSA beneficiaries (PHH and AAY ration card holders) covering approximately 81 Crore persons are eligible."
      }
    ],
    "lastUpdated": "2026-08-20",
    "popularityScore": 98
  },
  {
    "id": "udid-disability-scheme",
    "name": "Unique Disability ID (UDID) & Divyangjan Welfare Schemes",
    "shortDescription": "Centralized disability registration and ID card scheme enabling Divyangjan to access all disability benefits, concessions, and welfare schemes seamlessly.",
    "department": "Department of Empowerment of Persons with Disabilities (DEPwD)",
    "ministry": "Ministry of Social Justice and Empowerment",
    "category": "Disability Empowerment",
    "state": "Central",
    "benefitsSummary": "UDID Card enables: 3% reservation in govt jobs, 5% reservation in govt housing, income tax benefits (₹75,000 - ₹1,25,000 deduction under Sec 80U), free railway travel concession, and free/subsidized assistive devices.",
    "financialBenefitAmount": 125000,
    "eligibilityRules": {
      "requiresDisability": true,
      "minDisabilityPercentage": 40,
      "requiredDocuments": [
        "Aadhaar",
        "Disability Certificate (UDID)"
      ]
    },
    "requiredDocuments": [
      "Aadhaar Card",
      "Medical Certificate from Govt Hospital (showing 40%+ disability)",
      "Passport size photographs",
      "Address Proof"
    ],
    "applicationSteps": [
      "Visit swavlambancard.gov.in or nearest District Disability Rehabilitation Centre (DDRC).",
      "Fill UDID application with Aadhaar details and disability information.",
      "Medical assessment by Govt hospital's Medical Board.",
      "UDID card issued with QR code for seamless scheme access."
    ],
    "officialApplyUrl": "https://swavlambancard.gov.in/",
    "officialWebsite": "https://swavlambancard.gov.in/",
    "helplineNumber": "1800-11-4515",
    "deadline": "Open All Year",
    "tags": [
      "Disability",
      "UDID",
      "Divyangjan",
      "Reservation",
      "Assistive Device"
    ],
    "faqs": [
      {
        "question": "What is the minimum disability percentage to get UDID?",
        "answer": "A minimum of 40% disability as assessed by a government Medical Authority is required to obtain UDID card."
      }
    ],
    "lastUpdated": "2026-07-20",
    "popularityScore": 86
  },
  {
    "id": "edu-tn-tamil-puthalvan",
    "name": "Tamil Puthalvan Scheme",
    "shortDescription": "₹1,000 per month for male college students who completed schooling in TN government schools.",
    "department": "Social Welfare and Women Empowerment Department",
    "ministry": "Government of Tamil Nadu",
    "category": "Education & Skill",
    "state": "Tamil Nadu",
    "benefitsSummary": "₹1,000 monthly direct bank transfer for the duration of collegiate course.",
    "financialBenefitAmount": 12000,
    "eligibilityRules": {
      "minAge": 17,
      "maxAge": 25,
      "allowedGenders": [
        "Male"
      ],
      "allowedStates": [
        "Tamil Nadu"
      ],
      "allowedOccupations": [
        "Student"
      ],
      "requiredDocuments": [
        "Aadhaar",
        "Govt School 6-12 Mark Sheets",
        "College ID",
        "Bank Passbook"
      ]
    },
    "requiredDocuments": [
      "Aadhaar",
      "Govt School 6-12 Mark Sheets",
      "College ID",
      "Bank Passbook"
    ],
    "applicationSteps": [
      "Confirm eligibility: male student enrolled in a recognized higher education program who completed schooling from Class 6 to 12 in Tamil Nadu Government schools.",
      "Submit required schooling proofs (such as EMIS number or Transfer Certificate), Aadhaar, and active bank account details to your college nodal officer.",
      "The college administration registers and verifies the student's schooling credentials on the official Tamil Nadu higher education portal.",
      "Complete Aadhaar authentication and verify that your bank account is active and seeded to receive direct benefit transfers upon department approval."
    ],
    "officialApplyUrl": "https://www.tn.gov.in",
    "officialWebsite": "https://www.tn.gov.in",
    "helplineNumber": "044-25670772",
    "deadline": "Open All Year",
    "tags": [
      "Tamil Puthalvan",
      "Boys Education",
      "Tamil Nadu",
      "Higher Education"
    ],
    "faqs": [
      {
        "question": "Who can apply for Tamil Puthalvan Scheme?",
        "answer": "Eligible Indian citizens meeting criteria (Male, states: Tamil Nadu) can apply."
      },
      {
        "question": "Where can I apply?",
        "answer": "Applications are submitted online at https://www.tn.gov.in or nearest official Common Service Centre (CSC)."
      }
    ],
    "lastUpdated": "2026-08-25",
    "popularityScore": 88
  },
  {
    "id": "edu-tn-first-graduate",
    "name": "Tamil Nadu First Graduate Tuition Fee Concession",
    "shortDescription": "Tuition fee waiver up to ₹25,000 per year for first-generation degree students in engineering and arts colleges.",
    "department": "Higher Education Department",
    "ministry": "Government of Tamil Nadu",
    "category": "Education & Skill",
    "state": "Tamil Nadu",
    "benefitsSummary": "Tuition fee waiver up to ₹25,000 per year directly adjusted in government counseling fee.",
    "financialBenefitAmount": 25000,
    "eligibilityRules": {
      "minAge": 17,
      "maxAge": 28,
      "allowedGenders": [
        "All"
      ],
      "allowedStates": [
        "Tamil Nadu"
      ],
      "allowedOccupations": [
        "Student"
      ],
      "requiredDocuments": [
        "Aadhaar",
        "First Graduate Certificate from Tahsildar",
        "Family No-Graduate Joint Declaration",
        "Allotment Order"
      ]
    },
    "requiredDocuments": [
      "Aadhaar",
      "First Graduate Certificate from Tahsildar",
      "Family No-Graduate Joint Declaration",
      "Allotment Order"
    ],
    "applicationSteps": [
      "Apply for the First Graduate Certificate through the Tamil Nadu e-Sevai portal (tnesevai.tn.gov.in) or at an authorized local e-Sevai centre.",
      "Submit applicant and parent identity proofs, school transfer certificates, and the required family joint declaration confirming no prior degree holder in the family.",
      "The Revenue Department (VAO, Revenue Inspector, and Tahsildar) verifies family education records and issues the digitally signed certificate.",
      "Produce the certificate during admission counseling (such as TNEA, TNDALU, or collegiate admissions) to claim tuition fee concession on the allotment order."
    ],
    "officialApplyUrl": "https://tnesevai.tn.gov.in",
    "officialWebsite": "https://www.tndce.tn.gov.in",
    "helplineNumber": "1800-425-1333",
    "deadline": "Open All Year",
    "tags": [
      "First Graduate",
      "TNEA",
      "Tuition Fee Waiver",
      "Tamil Nadu",
      "Engineering"
    ],
    "faqs": [
      {
        "question": "Who can apply for Tamil Nadu First Graduate Tuition Fee Concession?",
        "answer": "Eligible Indian citizens meeting criteria (All, states: Tamil Nadu) can apply."
      },
      {
        "question": "Where can I apply?",
        "answer": "Applications are submitted online at https://www.tndce.tn.gov.in or nearest official Common Service Centre (CSC)."
      }
    ],
    "lastUpdated": "2026-08-25",
    "popularityScore": 87
  },
  {
    "id": "edu-nsp-merit-means",
    "name": "National Means-cum-Merit Scholarship Scheme (NMMSS)",
    "shortDescription": "₹12,000 per year to prevent school dropouts after Class 8 for students with family income under ₹3.5 Lakh.",
    "department": "Department of School Education & Literacy",
    "ministry": "Ministry of Education",
    "category": "Education & Skill",
    "state": "Central",
    "benefitsSummary": "₹12,000 per academic year directly paid into Aadhaar-linked savings account.",
    "financialBenefitAmount": 12000,
    "eligibilityRules": {
      "minAge": 13,
      "maxAge": 18,
      "allowedGenders": [
        "All"
      ],
      "allowedStates": [
        "All"
      ],
      "maxAnnualIncome": 350000,
      "allowedOccupations": [
        "Student"
      ],
      "requiredDocuments": [
        "Aadhaar",
        "Class 8 Mark Sheet",
        "Income Certificate",
        "Bank Passbook"
      ]
    },
    "requiredDocuments": [
      "Aadhaar",
      "Class 8 Mark Sheet",
      "Income Certificate",
      "Bank Passbook"
    ],
    "applicationSteps": [
      "Appear for and qualify in the State-level NMMSS selection examination conducted for Class 8 students by the State Education Department or SCERT.",
      "Register on the National Scholarship Portal (scholarships.gov.in) with One-Time Registration (OTR) using Aadhaar-linked verification.",
      "Submit the online scholarship application under the Department of School Education & Literacy section with academic, family income, and bank details.",
      "Ensure your school principal or designated nodal officer conducts online institutional verification (Level-1) of your regular enrollment.",
      "Track application verification by the District Nodal Officer on the portal; eligible awardees receive scholarship disbursements via DBT as notified by the Ministry."
    ],
    "officialApplyUrl": "https://scholarships.gov.in",
    "officialWebsite": "https://scholarships.gov.in",
    "helplineNumber": "0120-6619540",
    "deadline": "Open All Year",
    "tags": [
      "NMMSS",
      "Class 9",
      "School Scholarship",
      "Education",
      "Merit"
    ],
    "faqs": [
      {
        "question": "Who can apply for National Means-cum-Merit Scholarship Scheme (NMMSS)?",
        "answer": "Eligible Indian citizens meeting criteria (All, states: All) can apply."
      },
      {
        "question": "Where can I apply?",
        "answer": "Applications are submitted online at https://scholarships.gov.in or nearest official Common Service Centre (CSC)."
      }
    ],
    "lastUpdated": "2026-08-25",
    "popularityScore": 96
  },
  {
    "id": "edu-pm-usp-central-sector",
    "name": "Central Sector Scheme of Scholarship for College and University Students (PM-USP)",
    "shortDescription": "₹12,000/year for UG and ₹20,000/year for PG studies for meritorious college students.",
    "department": "Department of Higher Education",
    "ministry": "Ministry of Education",
    "category": "Education & Skill",
    "state": "Central",
    "benefitsSummary": "₹12,000 annually for first 3 years of UG; ₹20,000 annually for PG degree.",
    "financialBenefitAmount": 12000,
    "eligibilityRules": {
      "minAge": 17,
      "maxAge": 25,
      "allowedGenders": [
        "All"
      ],
      "allowedStates": [
        "All"
      ],
      "maxAnnualIncome": 450000,
      "allowedOccupations": [
        "Student"
      ],
      "requiredDocuments": [
        "Aadhaar",
        "Class 12 Mark Sheet (Top 20th percentile)",
        "Income Certificate",
        "Bonafide Certificate"
      ]
    },
    "requiredDocuments": [
      "Aadhaar",
      "Class 12 Mark Sheet (Top 20th percentile)",
      "Income Certificate",
      "Bonafide Certificate"
    ],
    "applicationSteps": [
      "Apply through National Scholarship Portal under Department of Higher Education.",
      "Institute verification by college principal followed by state verification."
    ],
    "officialApplyUrl": "https://scholarships.gov.in",
    "officialWebsite": "https://scholarships.gov.in",
    "helplineNumber": "0120-6619540",
    "deadline": "Open All Year",
    "tags": [
      "Central Sector",
      "Higher Education",
      "College Scholarship",
      "PM-USP"
    ],
    "faqs": [
      {
        "question": "Who can apply for Central Sector Scheme of Scholarship for College and University Students (PM-USP)?",
        "answer": "Eligible Indian citizens meeting criteria (All, states: All) can apply."
      },
      {
        "question": "Where can I apply?",
        "answer": "Applications are submitted online at https://scholarships.gov.in or nearest official Common Service Centre (CSC)."
      }
    ],
    "lastUpdated": "2026-08-25",
    "popularityScore": 94
  },
  {
    "id": "edu-aicte-pragati",
    "name": "AICTE Pragati Scholarship for Girl Students",
    "shortDescription": "₹50,000 per year for female engineering and technical diploma students.",
    "department": "All India Council for Technical Education (AICTE)",
    "ministry": "Ministry of Education",
    "category": "Education & Skill",
    "state": "Central",
    "benefitsSummary": "₹50,000 per year for every year of technical course duration.",
    "financialBenefitAmount": 50000,
    "eligibilityRules": {
      "minAge": 17,
      "maxAge": 25,
      "allowedGenders": [
        "Female",
        "Male"
      ],
      "allowedStates": [
        "All"
      ],
      "maxAnnualIncome": 800000,
      "allowedOccupations": [
        "Student"
      ],
      "requiredDocuments": [
        "Aadhaar",
        "AICTE Allotment Letter",
        "Income Certificate",
        "Tuition Fee Receipt"
      ]
    },
    "requiredDocuments": [
      "Aadhaar",
      "AICTE Allotment Letter",
      "Income Certificate",
      "Tuition Fee Receipt"
    ],
    "applicationSteps": [
      "Apply through National Scholarship Portal under AICTE scheme tab.",
      "Upload college admission slip and fee receipts."
    ],
    "officialApplyUrl": "https://scholarships.gov.in",
    "officialWebsite": "https://www.aicte-india.org",
    "helplineNumber": "011-29581333",
    "deadline": "Open All Year",
    "tags": [
      "AICTE",
      "Pragati",
      "Girl Students",
      "BTech",
      "Engineering Scholarship"
    ],
    "faqs": [
      {
        "question": "Who can apply for AICTE Pragati Scholarship for Girl Students?",
        "answer": "Eligible Indian citizens meeting criteria (Female, Male, states: All) can apply."
      },
      {
        "question": "Where can I apply?",
        "answer": "Applications are submitted online at https://www.aicte-india.org or nearest official Common Service Centre (CSC)."
      }
    ],
    "lastUpdated": "2026-08-25",
    "popularityScore": 88
  },
  {
    "id": "edu-aicte-saksham",
    "name": "AICTE Saksham Scholarship for Specially-Abled Students",
    "shortDescription": "₹50,000 annually for technical and engineering students with registered disability.",
    "department": "All India Council for Technical Education (AICTE)",
    "ministry": "Ministry of Education",
    "category": "Disability Empowerment",
    "state": "Central",
    "benefitsSummary": "₹50,000 per year towards tuition, books, and assistive devices.",
    "financialBenefitAmount": 50000,
    "eligibilityRules": {
      "minAge": 17,
      "maxAge": 35,
      "allowedGenders": [
        "All"
      ],
      "allowedStates": [
        "All"
      ],
      "maxAnnualIncome": 800000,
      "allowedOccupations": [
        "Student"
      ],
      "requiresDisability": true,
      "minDisabilityPercentage": 40,
      "requiredDocuments": [
        "Aadhaar",
        "UDID Disability Certificate (≥40%)",
        "AICTE College Admission Proof",
        "Income Certificate"
      ]
    },
    "requiredDocuments": [
      "Aadhaar",
      "UDID Disability Certificate (≥40%)",
      "AICTE College Admission Proof",
      "Income Certificate"
    ],
    "applicationSteps": [
      "Register on National Scholarship Portal with UDID disability certificate.",
      "Submit college enrollment credentials."
    ],
    "officialApplyUrl": "https://scholarships.gov.in",
    "officialWebsite": "https://www.aicte-india.org",
    "helplineNumber": "011-29581338",
    "deadline": "Open All Year",
    "tags": [
      "Saksham",
      "Disability",
      "AICTE",
      "Engineering",
      "Differently Abled"
    ],
    "faqs": [
      {
        "question": "Who can apply for AICTE Saksham Scholarship for Specially-Abled Students?",
        "answer": "Eligible Indian citizens meeting criteria (All, states: All) can apply."
      },
      {
        "question": "Where can I apply?",
        "answer": "Applications are submitted online at https://www.aicte-india.org or nearest official Common Service Centre (CSC)."
      }
    ],
    "lastUpdated": "2026-08-25",
    "popularityScore": 93
  },
  {
    "id": "edu-tn-bc-mbc-scholarship",
    "name": "Tamil Nadu BC/MBC/DNC Post-Matric Scholarship",
    "shortDescription": "Tuition and maintenance grant for BC/MBC students in Tamil Nadu with family income under ₹2.5 Lakh.",
    "department": "Backward Classes, Most Backward Classes and Minorities Welfare Department",
    "ministry": "Government of Tamil Nadu",
    "category": "Education & Skill",
    "state": "Tamil Nadu",
    "benefitsSummary": "Tuition fee waiver and maintenance allowance up to ₹10,000 per year.",
    "financialBenefitAmount": 10000,
    "eligibilityRules": {
      "minAge": 16,
      "maxAge": 30,
      "allowedGenders": [
        "All"
      ],
      "allowedStates": [
        "Tamil Nadu"
      ],
      "maxAnnualIncome": 250000,
      "allowedOccupations": [
        "Student"
      ],
      "allowedCategories": [
        "OBC"
      ],
      "requiredDocuments": [
        "Aadhaar",
        "Community Certificate (BC/MBC/DNC)",
        "Income Certificate",
        "Bank Passbook"
      ]
    },
    "requiredDocuments": [
      "Aadhaar",
      "Community Certificate (BC/MBC/DNC)",
      "Income Certificate",
      "Bank Passbook"
    ],
    "applicationSteps": [
      "Submit application through college scholarship nodal officer via e-Scholarship portal.",
      "Verification by District BC/MBC Welfare Officer."
    ],
    "officialApplyUrl": "https://tnescholarship.tn.gov.in",
    "officialWebsite": "https://bcmbcmw.tn.gov.in",
    "helplineNumber": "044-28515288",
    "deadline": "Open All Year",
    "tags": [
      "BC",
      "MBC",
      "Tamil Nadu",
      "Post Matric",
      "Backward Classes"
    ],
    "faqs": [
      {
        "question": "Who can apply for Tamil Nadu BC/MBC/DNC Post-Matric Scholarship?",
        "answer": "Eligible Indian citizens meeting criteria (All, states: Tamil Nadu) can apply."
      },
      {
        "question": "Where can I apply?",
        "answer": "Applications are submitted online at https://bcmbcmw.tn.gov.in or nearest official Common Service Centre (CSC)."
      }
    ],
    "lastUpdated": "2026-08-25",
    "popularityScore": 86
  },
  {
    "id": "edu-national-fellowship-obc",
    "name": "National Fellowship for OBC Students (NFOBC)",
    "shortDescription": "Monthly fellowship up to ₹35,000 + HRA for OBC doctoral and research scholars.",
    "department": "University Grants Commission (UGC)",
    "ministry": "Ministry of Social Justice and Empowerment",
    "category": "Education & Skill",
    "state": "Central",
    "benefitsSummary": "JRF fellowship ₹31,000/month; SRF ₹35,000/month + contingency allowance.",
    "financialBenefitAmount": 420000,
    "eligibilityRules": {
      "minAge": 21,
      "maxAge": 38,
      "allowedGenders": [
        "All"
      ],
      "allowedStates": [
        "All"
      ],
      "maxAnnualIncome": 800000,
      "allowedOccupations": [
        "Student"
      ],
      "allowedCategories": [
        "OBC"
      ],
      "requiredDocuments": [
        "Aadhaar",
        "OBC Non-Creamy Layer Certificate",
        "NET/UGC Qualification",
        "University Enrollment Proof"
      ]
    },
    "requiredDocuments": [
      "Aadhaar",
      "OBC Non-Creamy Layer Certificate",
      "NET/UGC Qualification",
      "University Enrollment Proof"
    ],
    "applicationSteps": [
      "Apply through UGC fellowship portal upon qualifying UGC-NET.",
      "Monthly claim verification by university registrar."
    ],
    "officialApplyUrl": "https://ugcnet.nta.ac.in",
    "officialWebsite": "https://www.ugc.gov.in",
    "helplineNumber": "011-23604446",
    "deadline": "Open All Year",
    "tags": [
      "NFOBC",
      "PhD",
      "UGC",
      "OBC Fellowship",
      "Research"
    ],
    "faqs": [
      {
        "question": "Who can apply for National Fellowship for OBC Students (NFOBC)?",
        "answer": "Eligible Indian citizens meeting criteria (All, states: All) can apply."
      },
      {
        "question": "Where can I apply?",
        "answer": "Applications are submitted online at https://www.ugc.gov.in or nearest official Common Service Centre (CSC)."
      }
    ],
    "lastUpdated": "2026-08-25",
    "popularityScore": 88
  },
  {
    "id": "edu-tn-free-education-degree",
    "name": "Tamil Nadu Free Education Scheme for Undergraduates",
    "shortDescription": "Free college tuition for undergraduate courses in government arts & science colleges.",
    "department": "Directorate of Collegiate Education",
    "ministry": "Government of Tamil Nadu",
    "category": "Education & Skill",
    "state": "Tamil Nadu",
    "benefitsSummary": "100% waiver of special fees and tuition fees in government arts & science colleges.",
    "financialBenefitAmount": 8000,
    "eligibilityRules": {
      "minAge": 17,
      "maxAge": 25,
      "allowedGenders": [
        "All"
      ],
      "allowedStates": [
        "Tamil Nadu"
      ],
      "maxAnnualIncome": 250000,
      "allowedOccupations": [
        "Student"
      ],
      "allowedCategories": [
        "OBC",
        "SC",
        "ST"
      ],
      "requiredDocuments": [
        "Aadhaar",
        "Income Certificate",
        "Community Certificate",
        "Class 12 Marksheet"
      ]
    },
    "requiredDocuments": [
      "Aadhaar",
      "Income Certificate",
      "Community Certificate",
      "Class 12 Marksheet"
    ],
    "applicationSteps": [
      "Submit income declaration at college admission counter.",
      "Fee concession applied on college identity card."
    ],
    "officialApplyUrl": "https://www.tngasa.in",
    "officialWebsite": "https://www.tndce.tn.gov.in",
    "helplineNumber": "044-28260447",
    "deadline": "Open All Year",
    "tags": [
      "Free Education",
      "Tamil Nadu",
      "Undergraduate",
      "Arts and Science"
    ],
    "faqs": [
      {
        "question": "Who can apply for Tamil Nadu Free Education Scheme for Undergraduates?",
        "answer": "Eligible Indian citizens meeting criteria (All, states: Tamil Nadu) can apply."
      },
      {
        "question": "Where can I apply?",
        "answer": "Applications are submitted online at https://www.tndce.tn.gov.in or nearest official Common Service Centre (CSC)."
      }
    ],
    "lastUpdated": "2026-08-25",
    "popularityScore": 98
  },
  {
    "id": "edu-pm-vidyalaxmi-education-loan",
    "name": "PM Vidyalaxmi Education Loan Scheme",
    "shortDescription": "Collateral-free higher education loans up to ₹7.5 Lakh with 3% interest subsidy for family income under ₹8 Lakh.",
    "department": "Department of Higher Education",
    "ministry": "Ministry of Education",
    "category": "Education & Skill",
    "state": "Central",
    "benefitsSummary": "Up to ₹7.5 Lakh collateral-free loan with 3% interest subsidy during moratorium period.",
    "financialBenefitAmount": 750000,
    "eligibilityRules": {
      "minAge": 17,
      "maxAge": 30,
      "allowedGenders": [
        "All"
      ],
      "allowedStates": [
        "All"
      ],
      "maxAnnualIncome": 800000,
      "allowedOccupations": [
        "Student"
      ],
      "requiredDocuments": [
        "Aadhaar",
        "Admission Letter",
        "Fee Structure",
        "Family Income Certificate",
        "PAN"
      ]
    },
    "requiredDocuments": [
      "Aadhaar",
      "Admission Letter",
      "Fee Structure",
      "Family Income Certificate",
      "PAN"
    ],
    "applicationSteps": [
      "Register on PM Vidyalaxmi portal (vidyalakshmi.co.in).",
      "Fill Common Educational Loan Application Form (CELAF) and submit."
    ],
    "officialApplyUrl": "https://www.vidyalakshmi.co.in",
    "officialWebsite": "https://www.vidyalakshmi.co.in",
    "helplineNumber": "022-24994000",
    "deadline": "Open All Year",
    "tags": [
      "PM Vidyalaxmi",
      "Education Loan",
      "Interest Subsidy",
      "Collateral Free"
    ],
    "faqs": [
      {
        "question": "Who can apply for PM Vidyalaxmi Education Loan Scheme?",
        "answer": "Eligible Indian citizens meeting criteria (All, states: All) can apply."
      },
      {
        "question": "Where can I apply?",
        "answer": "Applications are submitted online at https://www.vidyalakshmi.co.in or nearest official Common Service Centre (CSC)."
      }
    ],
    "lastUpdated": "2026-08-25",
    "popularityScore": 97
  },
  {
    "id": "agri-pm-kusum-solar-pump",
    "name": "PM-KUSUM Scheme (Solar Agricultural Pumps)",
    "shortDescription": "60% subsidy (30% Central + 30% State) for standalone solar water pumping systems.",
    "department": "MNRE",
    "ministry": "Ministry of New and Renewable Energy",
    "category": "Agriculture & Farmers",
    "state": "Central",
    "benefitsSummary": "Up to 60% capital subsidy for installing 3HP to 10HP solar powered water pumps.",
    "financialBenefitAmount": 180000,
    "eligibilityRules": {
      "minAge": 18,
      "maxAge": 85,
      "allowedGenders": [
        "All"
      ],
      "allowedStates": [
        "All"
      ],
      "allowedOccupations": [
        "Farmer",
        "Water User Association",
        "FPO"
      ],
      "requiredDocuments": [
        "Aadhaar",
        "Land Patta",
        "Electricity Connection / No-Power Certificate",
        "Bank Passbook"
      ]
    },
    "requiredDocuments": [
      "Aadhaar",
      "Land Patta",
      "Electricity Connection / No-Power Certificate",
      "Bank Passbook"
    ],
    "applicationSteps": [
      "Register on state renewable energy agency portal (e.g. TEDA in Tamil Nadu).",
      "Pay 10% farmer share and track pump installation."
    ],
    "officialApplyUrl": "https://pmkusum.mnre.gov.in",
    "officialWebsite": "https://pmkusum.mnre.gov.in",
    "helplineNumber": "1800-180-3333",
    "deadline": "Open All Year",
    "tags": [
      "PM KUSUM",
      "Solar Pump",
      "Irrigation",
      "Agriculture",
      "Clean Energy"
    ],
    "faqs": [
      {
        "question": "Who can apply for PM-KUSUM Scheme (Solar Agricultural Pumps)?",
        "answer": "Eligible Indian citizens meeting criteria (All, states: All) can apply."
      },
      {
        "question": "Where can I apply?",
        "answer": "Applications are submitted online at https://pmkusum.mnre.gov.in or nearest official Common Service Centre (CSC)."
      }
    ],
    "lastUpdated": "2026-08-25",
    "popularityScore": 90
  },
  {
    "id": "agri-kisan-credit-card",
    "name": "Kisan Credit Card (KCC) Scheme",
    "shortDescription": "Crop loan up to ₹3 Lakh at 4% interest rate with 3% prompt repayment incentive.",
    "department": "NABARD & Department of Financial Services",
    "ministry": "Ministry of Agriculture and Farmers Welfare",
    "category": "Agriculture & Farmers",
    "state": "Central",
    "benefitsSummary": "Collateral-free agricultural loan up to ₹1.6 Lakh and low interest loan up to ₹3 Lakh at 4% effective interest.",
    "financialBenefitAmount": 300000,
    "eligibilityRules": {
      "minAge": 18,
      "maxAge": 75,
      "allowedGenders": [
        "All"
      ],
      "allowedStates": [
        "All"
      ],
      "allowedOccupations": [
        "Farmer",
        "Fisherman",
        "Dairy Farmer",
        "Poultry Farmer"
      ],
      "requiredDocuments": [
        "Aadhaar",
        "Land Record (Pattadar Passbook)",
        "Crop Cultivation Certificate",
        "Bank Passbook"
      ]
    },
    "requiredDocuments": [
      "Aadhaar",
      "Land Record (Pattadar Passbook)",
      "Crop Cultivation Certificate",
      "Bank Passbook"
    ],
    "applicationSteps": [
      "Download 1-page KCC application form from bank website or visit nearest bank/PACCS.",
      "Submit with land documents and crop plan."
    ],
    "officialApplyUrl": "https://www.myscheme.gov.in/schemes/kcc",
    "officialWebsite": "https://myscheme.gov.in",
    "helplineNumber": "1800-11-5526",
    "deadline": "Open All Year",
    "tags": [
      "KCC",
      "Kisan Credit Card",
      "Agriculture Loan",
      "4 percent interest"
    ],
    "faqs": [
      {
        "question": "Who can apply for Kisan Credit Card (KCC) Scheme?",
        "answer": "Eligible Indian citizens meeting criteria (All, states: All) can apply."
      },
      {
        "question": "Where can I apply?",
        "answer": "Applications are submitted online at https://myscheme.gov.in or nearest official Common Service Centre (CSC)."
      }
    ],
    "lastUpdated": "2026-08-25",
    "popularityScore": 92
  },
  {
    "id": "agri-tn-kuruvai-cultivation-package",
    "name": "Tamil Nadu Kuruvai Cultivation Special Package",
    "shortDescription": "100% subsidy on certified paddy seeds, urea, DAP, and potash kits for Cauvery delta farmers.",
    "department": "Department of Agriculture and Farmers Welfare",
    "ministry": "Government of Tamil Nadu",
    "category": "Agriculture & Farmers",
    "state": "Tamil Nadu",
    "benefitsSummary": "Free fertilizer and seed inputs worth ₹4,000 per acre (up to maximum 1 acre per farmer).",
    "financialBenefitAmount": 4000,
    "eligibilityRules": {
      "minAge": 18,
      "maxAge": 85,
      "allowedGenders": [
        "All"
      ],
      "allowedStates": [
        "Tamil Nadu"
      ],
      "allowedOccupations": [
        "Farmer"
      ],
      "requiredDocuments": [
        "Aadhaar",
        "Land Chitta / Adangal",
        "Uzhavan App Registration"
      ]
    },
    "requiredDocuments": [
      "Aadhaar",
      "Land Chitta / Adangal",
      "Uzhavan App Registration"
    ],
    "applicationSteps": [
      "Register land through Uzhavan Mobile App or at local Agricultural Extension Centre.",
      "Collect subsidized input tokens."
    ],
    "officialApplyUrl": "https://tnagrisnet.tn.gov.in",
    "officialWebsite": "https://www.agritech.tnau.ac.in",
    "helplineNumber": "1800-180-1551",
    "deadline": "Open All Year",
    "tags": [
      "Kuruvai",
      "Tamil Nadu",
      "Paddy",
      "Cauvery Delta",
      "Fertilizer Subsidy"
    ],
    "faqs": [
      {
        "question": "Who can apply for Tamil Nadu Kuruvai Cultivation Special Package?",
        "answer": "Eligible Indian citizens meeting criteria (All, states: Tamil Nadu) can apply."
      },
      {
        "question": "Where can I apply?",
        "answer": "Applications are submitted online at https://www.agritech.tnau.ac.in or nearest official Common Service Centre (CSC)."
      }
    ],
    "lastUpdated": "2026-08-25",
    "popularityScore": 91
  },
  {
    "id": "agri-pm-krishi-sinchayee-micro-irrigation",
    "name": "Pradhan Mantri Krishi Sinchayee Yojana - Per Drop More Crop",
    "shortDescription": "Up to 100% subsidy for small/marginal farmers and 75% for other farmers for drip irrigation.",
    "department": "Department of Agriculture & Farmers Welfare",
    "ministry": "Ministry of Agriculture and Farmers Welfare",
    "category": "Agriculture & Farmers",
    "state": "Central",
    "benefitsSummary": "100% capital subsidy on drip/sprinkler equipment for small & marginal farmers in Tamil Nadu.",
    "financialBenefitAmount": 45000,
    "eligibilityRules": {
      "minAge": 18,
      "maxAge": 90,
      "allowedGenders": [
        "All"
      ],
      "allowedStates": [
        "All"
      ],
      "allowedOccupations": [
        "Farmer"
      ],
      "requiredDocuments": [
        "Aadhaar",
        "Land Patta / Chitta",
        "Field Map Sketch",
        "Water Source Availability Proof"
      ]
    },
    "requiredDocuments": [
      "Aadhaar",
      "Land Patta / Chitta",
      "Field Map Sketch",
      "Water Source Availability Proof"
    ],
    "applicationSteps": [
      "Register on Tamil Nadu Micro Irrigation Portal (tnhorticulture.tn.gov.in/mip).",
      "Field inspection by Assistant Director of Horticulture."
    ],
    "officialApplyUrl": "https://tnhorticulture.tn.gov.in/mip",
    "officialWebsite": "https://pmksy.gov.in",
    "helplineNumber": "044-28524714",
    "deadline": "Open All Year",
    "tags": [
      "PMKSY",
      "Micro Irrigation",
      "Drip Irrigation",
      "Water Conservation",
      "Farmer"
    ],
    "faqs": [
      {
        "question": "Who can apply for Pradhan Mantri Krishi Sinchayee Yojana - Per Drop More Crop?",
        "answer": "Eligible Indian citizens meeting criteria (All, states: All) can apply."
      },
      {
        "question": "Where can I apply?",
        "answer": "Applications are submitted online at https://pmksy.gov.in or nearest official Common Service Centre (CSC)."
      }
    ],
    "lastUpdated": "2026-08-25",
    "popularityScore": 84
  },
  {
    "id": "agri-soil-health-card",
    "name": "Soil Health Card Scheme",
    "shortDescription": "Free soil testing and report cards every 3 years with precise fertilizer dosing advice.",
    "department": "Department of Agriculture & Farmers Welfare",
    "ministry": "Ministry of Agriculture and Farmers Welfare",
    "category": "Agriculture & Farmers",
    "state": "Central",
    "benefitsSummary": "Comprehensive 12-parameter soil test report and tailored nutrient guidance completely free of charge.",
    "financialBenefitAmount": 500,
    "eligibilityRules": {
      "minAge": 18,
      "maxAge": 95,
      "allowedGenders": [
        "All"
      ],
      "allowedStates": [
        "All"
      ],
      "allowedOccupations": [
        "Farmer"
      ],
      "requiredDocuments": [
        "Aadhaar",
        "Land Survey Number"
      ]
    },
    "requiredDocuments": [
      "Aadhaar",
      "Land Survey Number"
    ],
    "applicationSteps": [
      "Contact your local village agricultural officer, Krishi Vigyan Kendra (KVK), or visit the nearest block-level Soil Testing Laboratory (STL).",
      "Provide land identification details (such as Khasra, Khata, or survey number) and farmer contact information for sample registration.",
      "Follow agricultural extension staff guidance to collect representative soil samples from your field or assist field teams during sample collection.",
      "The sample is tested across standard nutrient and physical parameters at the laboratory; farmers receive testing results and fertilizer advisory via SMS or digital download at soilhealth.dac.gov.in."
    ],
    "officialApplyUrl": "https://soilhealth.dac.gov.in",
    "officialWebsite": "https://soilhealth.dac.gov.in",
    "helplineNumber": "011-23381012",
    "deadline": "Open All Year",
    "tags": [
      "Soil Health Card",
      "Fertilizer",
      "Soil Test",
      "Agriculture"
    ],
    "faqs": [
      {
        "question": "Who can apply for Soil Health Card Scheme?",
        "answer": "Eligible Indian citizens meeting criteria (All, states: All) can apply."
      },
      {
        "question": "Where can I apply?",
        "answer": "Applications are submitted online at https://soilhealth.dac.gov.in or nearest official Common Service Centre (CSC)."
      }
    ],
    "lastUpdated": "2026-08-25",
    "popularityScore": 91
  },
  {
    "id": "agri-pm-matsya-sampada-fisheries",
    "name": "Pradhan Mantri Matsya Sampada Yojana (PMMSY)",
    "shortDescription": "60% subsidy for SC/ST/Women and 40% for general fishers to purchase fishing nets, boats, and build biofloc units.",
    "department": "Department of Fisheries",
    "ministry": "Ministry of Fisheries, Animal Husbandry and Dairying",
    "category": "Agriculture & Farmers",
    "state": "Central",
    "benefitsSummary": "Financial grant up to ₹3,00,000 for individual aquaculture pond / modern fishing equipment.",
    "financialBenefitAmount": 300000,
    "eligibilityRules": {
      "minAge": 18,
      "maxAge": 70,
      "allowedGenders": [
        "All"
      ],
      "allowedStates": [
        "All"
      ],
      "allowedOccupations": [
        "Fisherman",
        "Aquaculture Farmer",
        "Fish Vendor"
      ],
      "requiredDocuments": [
        "Aadhaar",
        "Fisherman Identity Card",
        "Aquaculture Project Details",
        "Bank Passbook"
      ]
    },
    "requiredDocuments": [
      "Aadhaar",
      "Fisherman Identity Card",
      "Aquaculture Project Details",
      "Bank Passbook"
    ],
    "applicationSteps": [
      "Submit project proposal on pmmsy.dof.gov.in.",
      "Approval by District Level Committee and release of DBT milestone subsidy."
    ],
    "officialApplyUrl": "https://pmmsy.dof.gov.in",
    "officialWebsite": "https://pmmsy.dof.gov.in",
    "helplineNumber": "1800-425-1660",
    "deadline": "Open All Year",
    "tags": [
      "PMMSY",
      "Fisheries",
      "Aquaculture",
      "Fish Farming",
      "Subsidy"
    ],
    "faqs": [
      {
        "question": "Who can apply for Pradhan Mantri Matsya Sampada Yojana (PMMSY)?",
        "answer": "Eligible Indian citizens meeting criteria (All, states: All) can apply."
      },
      {
        "question": "Where can I apply?",
        "answer": "Applications are submitted online at https://pmmsy.dof.gov.in or nearest official Common Service Centre (CSC)."
      }
    ],
    "lastUpdated": "2026-08-25",
    "popularityScore": 95
  },
  {
    "id": "health-tn-cmchis-insurance",
    "name": "Chief Minister's Comprehensive Health Insurance Scheme (CMCHIS - Tamil Nadu)",
    "shortDescription": "₹5 Lakh annual health coverage for Tamil Nadu families with annual income under ₹1,20,000.",
    "department": "Health and Family Welfare Department",
    "ministry": "Government of Tamil Nadu",
    "category": "Health & Healthcare",
    "state": "Tamil Nadu",
    "benefitsSummary": "₹5 Lakh annual cashless treatment, diagnostic procedures, and follow-up medications.",
    "financialBenefitAmount": 500000,
    "eligibilityRules": {
      "minAge": 0,
      "maxAge": 120,
      "allowedGenders": [
        "All"
      ],
      "allowedStates": [
        "Tamil Nadu"
      ],
      "maxAnnualIncome": 120000,
      "requiredDocuments": [
        "Aadhaar",
        "Smart Family Ration Card",
        "Income Certificate from Tahsildar"
      ]
    },
    "requiredDocuments": [
      "Aadhaar",
      "Smart Family Ration Card",
      "Income Certificate from Tahsildar"
    ],
    "applicationSteps": [
      "Visit District Kiosk at District Collectorate with Smart Ration Card and Income Certificate.",
      "Bio-metric enrollment and on-the-spot CMCHIS smart card generation."
    ],
    "officialApplyUrl": "https://www.cmchistn.com",
    "officialWebsite": "https://www.cmchistn.com",
    "helplineNumber": "1800-425-3993",
    "deadline": "Open All Year",
    "tags": [
      "CMCHIS",
      "Tamil Nadu Health",
      "Kalaignar Health Insurance",
      "Cashless Surgery"
    ],
    "faqs": [
      {
        "question": "Who can apply for Chief Minister's Comprehensive Health Insurance Scheme (CMCHIS - Tamil Nadu)?",
        "answer": "Eligible Indian citizens meeting criteria (All, states: Tamil Nadu) can apply."
      },
      {
        "question": "Where can I apply?",
        "answer": "Applications are submitted online at https://www.cmchistn.com or nearest official Common Service Centre (CSC)."
      }
    ],
    "lastUpdated": "2026-08-25",
    "popularityScore": 93
  },
  {
    "id": "health-pm-matru-vandana",
    "name": "Pradhan Mantri Matru Vandana Yojana (PMMVY)",
    "shortDescription": "Direct cash benefit up to ₹6,000 to compensate wage loss and ensure institutional nutrition during childbirth.",
    "department": "MWCD",
    "ministry": "Ministry of Women and Child Development",
    "category": "Health & Healthcare",
    "state": "Central",
    "benefitsSummary": "Direct bank transfer of ₹5,000 in two installments (or ₹6,000 for second girl child).",
    "financialBenefitAmount": 6000,
    "eligibilityRules": {
      "minAge": 19,
      "maxAge": 45,
      "allowedGenders": [
        "Female",
        "Male"
      ],
      "allowedStates": [
        "All"
      ],
      "maxAnnualIncome": 800000,
      "requiredDocuments": [
        "Aadhaar",
        "Mother and Child Protection (MCP) Card",
        "Bank Passbook",
        "Birth Certificate of Child"
      ]
    },
    "requiredDocuments": [
      "Aadhaar",
      "Mother and Child Protection (MCP) Card",
      "Bank Passbook",
      "Birth Certificate of Child"
    ],
    "applicationSteps": [
      "Register on pmmvy.wcd.gov.in or through local Anganwadi worker.",
      "Submit MCP card proof for timely release of DBT installments."
    ],
    "officialApplyUrl": "https://pmmvy.wcd.gov.in",
    "officialWebsite": "https://pmmvy.wcd.gov.in",
    "helplineNumber": "1098 / 181",
    "deadline": "Open All Year",
    "tags": [
      "PMMVY",
      "Maternity Benefit",
      "Pregnant Women",
      "Cash Incentive",
      "Mother and Child"
    ],
    "faqs": [
      {
        "question": "Who can apply for Pradhan Mantri Matru Vandana Yojana (PMMVY)?",
        "answer": "Eligible Indian citizens meeting criteria (Female, Male, states: All) can apply."
      },
      {
        "question": "Where can I apply?",
        "answer": "Applications are submitted online at https://pmmvy.wcd.gov.in or nearest official Common Service Centre (CSC)."
      }
    ],
    "lastUpdated": "2026-08-25",
    "popularityScore": 95
  },
  {
    "id": "health-tn-muthulakshmi-reddy-maternity",
    "name": "Dr. Muthulakshmi Reddy Maternity Benefit Scheme",
    "shortDescription": "₹18,000 total maternal assistance including nutrition kits for pregnant women living in poverty in Tamil Nadu.",
    "department": "Public Health and Preventive Medicine Department",
    "ministry": "Government of Tamil Nadu",
    "category": "Health & Healthcare",
    "state": "Tamil Nadu",
    "benefitsSummary": "₹14,000 cash credited directly to bank account in 5 installments plus 2 nutrition kits valued at ₹4,000.",
    "financialBenefitAmount": 18000,
    "eligibilityRules": {
      "minAge": 19,
      "maxAge": 45,
      "allowedGenders": [
        "Female",
        "Male"
      ],
      "allowedStates": [
        "Tamil Nadu"
      ],
      "maxAnnualIncome": 120000,
      "requiredDocuments": [
        "Aadhaar",
        "RCH ID from PICME",
        "Smart Ration Card",
        "Bank Passbook"
      ]
    },
    "requiredDocuments": [
      "Aadhaar",
      "RCH ID from PICME",
      "Smart Ration Card",
      "Bank Passbook"
    ],
    "applicationSteps": [
      "Register pregnancy within 12 weeks on PICME portal through Village Health Nurse (VHN).",
      "Attend institutional delivery at government primary health centre or hospital."
    ],
    "officialApplyUrl": "https://picme.tn.gov.in",
    "officialWebsite": "https://picme.tn.gov.in",
    "helplineNumber": "104",
    "deadline": "Open All Year",
    "tags": [
      "Muthulakshmi Reddy",
      "Maternity Benefit",
      "PICME",
      "Tamil Nadu",
      "Nutrition Kit"
    ],
    "faqs": [
      {
        "question": "Who can apply for Dr. Muthulakshmi Reddy Maternity Benefit Scheme?",
        "answer": "Eligible Indian citizens meeting criteria (Female, Male, states: Tamil Nadu) can apply."
      },
      {
        "question": "Where can I apply?",
        "answer": "Applications are submitted online at https://picme.tn.gov.in or nearest official Common Service Centre (CSC)."
      }
    ],
    "lastUpdated": "2026-08-25",
    "popularityScore": 90
  },
  {
    "id": "health-pm-bjp-jan-aushadhi",
    "name": "Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP)",
    "shortDescription": "Quality generic medicines at 50-90% lower prices through 10,000+ Jan Aushadhi Kendras.",
    "department": "Pharmaceuticals & Medical Devices Bureau of India (PMBI)",
    "ministry": "Ministry of Chemicals and Fertilizers",
    "category": "Health & Healthcare",
    "state": "Central",
    "benefitsSummary": "Direct cost savings of 50-90% across 2,000+ generic medicines and surgical items.",
    "financialBenefitAmount": 6000,
    "eligibilityRules": {
      "minAge": 0,
      "maxAge": 120,
      "allowedGenders": [
        "All"
      ],
      "allowedStates": [
        "All"
      ],
      "requiredDocuments": [
        "Doctor's Prescription"
      ]
    },
    "requiredDocuments": [
      "Doctor's Prescription"
    ],
    "applicationSteps": [
      "Locate nearest Janaushadhi Kendra via Jan Aushadhi Sugam mobile app.",
      "Show prescription and purchase generic medicines over the counter."
    ],
    "officialApplyUrl": "https://janaushadhi.gov.in",
    "officialWebsite": "https://janaushadhi.gov.in",
    "helplineNumber": "1800-180-8080",
    "deadline": "Open All Year",
    "tags": [
      "Jan Aushadhi",
      "Generic Medicine",
      "PMBJP",
      "Affordable Medicine",
      "Pharmacy"
    ],
    "faqs": [
      {
        "question": "Who can apply for Pradhan Mantri Bhartiya Janaushadhi Pariyojana (PMBJP)?",
        "answer": "Eligible Indian citizens meeting criteria (All, states: All) can apply."
      },
      {
        "question": "Where can I apply?",
        "answer": "Applications are submitted online at https://janaushadhi.gov.in or nearest official Common Service Centre (CSC)."
      }
    ],
    "lastUpdated": "2026-08-25",
    "popularityScore": 95
  },
  {
    "id": "health-nikshay-poshan-tb",
    "name": "Ni-kshay Poshan Yojana (Nutritional Support for TB Patients)",
    "shortDescription": "Monthly direct cash transfer for nutritional support throughout active TB treatment.",
    "department": "Central TB Division",
    "ministry": "Ministry of Health and Family Welfare",
    "category": "Health & Healthcare",
    "state": "Central",
    "benefitsSummary": "₹500 to ₹1,000 monthly bank transfer throughout course of treatment (minimum 6 months).",
    "financialBenefitAmount": 6000,
    "eligibilityRules": {
      "minAge": 0,
      "maxAge": 120,
      "allowedGenders": [
        "All"
      ],
      "allowedStates": [
        "All"
      ],
      "requiredDocuments": [
        "Aadhaar",
        "TB Notification Proof / Ni-kshay ID",
        "Bank Account Passbook"
      ]
    },
    "requiredDocuments": [
      "Aadhaar",
      "TB Notification Proof / Ni-kshay ID",
      "Bank Account Passbook"
    ],
    "applicationSteps": [
      "Diagnosed at public health facility or registered by private doctor on Ni-kshay portal.",
      "Bank account details seeded for automated monthly DBT transfer."
    ],
    "officialApplyUrl": "https://nikshay.in",
    "officialWebsite": "https://nikshay.in",
    "helplineNumber": "1800-11-6666",
    "deadline": "Open All Year",
    "tags": [
      "Nikshay Poshan",
      "TB",
      "Tuberculosis",
      "Nutrition",
      "DBT Health"
    ],
    "faqs": [
      {
        "question": "Who can apply for Ni-kshay Poshan Yojana (Nutritional Support for TB Patients)?",
        "answer": "Eligible Indian citizens meeting criteria (All, states: All) can apply."
      },
      {
        "question": "Where can I apply?",
        "answer": "Applications are submitted online at https://nikshay.in or nearest official Common Service Centre (CSC)."
      }
    ],
    "lastUpdated": "2026-08-25",
    "popularityScore": 84
  },
  {
    "id": "health-tn-innuyir-kaappon-nammai-kakkum-48",
    "name": "Innuyir Kaappom - Nammai Kaakkum 48 (Emergency Road Accident Care)",
    "shortDescription": "Free emergency treatment up to ₹1 Lakh in first 48 hours for road traffic accident victims, regardless of state/nation.",
    "department": "Health and Family Welfare Department",
    "ministry": "Government of Tamil Nadu",
    "category": "Health & Healthcare",
    "state": "Tamil Nadu",
    "benefitsSummary": "Emergency treatment coverage up to ₹1,00,000 per victim across 81 designated procedures.",
    "financialBenefitAmount": 100000,
    "eligibilityRules": {
      "minAge": 0,
      "maxAge": 120,
      "allowedGenders": [
        "All"
      ],
      "allowedStates": [
        "All"
      ],
      "requiredDocuments": [
        "Emergency Admission via 108 Ambulance / Police Memo"
      ]
    },
    "requiredDocuments": [
      "Emergency Admission via 108 Ambulance / Police Memo"
    ],
    "applicationSteps": [
      "Hospital immediately admits accident victim under NK48 protocol.",
      "Treatment provided without cash deposit for first 48 hours."
    ],
    "officialApplyUrl": "https://www.cmchistn.com/nk48.php",
    "officialWebsite": "https://www.cmchistn.com",
    "helplineNumber": "108",
    "deadline": "Open All Year",
    "tags": [
      "Innuyir Kaappom",
      "NK48",
      "Road Accident",
      "Golden Hour",
      "Trauma Care"
    ],
    "faqs": [
      {
        "question": "Who can apply for Innuyir Kaappom - Nammai Kaakkum 48 (Emergency Road Accident Care)?",
        "answer": "Eligible Indian citizens meeting criteria (All, states: All) can apply."
      },
      {
        "question": "Where can I apply?",
        "answer": "Applications are submitted online at https://www.cmchistn.com or nearest official Common Service Centre (CSC)."
      }
    ],
    "lastUpdated": "2026-08-25",
    "popularityScore": 86
  },
  {
    "id": "health-pm-national-dialysis-programme",
    "name": "Pradhan Mantri National Dialysis Programme (PMNDP)",
    "shortDescription": "100% free life-saving dialysis treatment at government district hospitals for BPL families.",
    "department": "National Health Mission (NHM)",
    "ministry": "Ministry of Health and Family Welfare",
    "category": "Health & Healthcare",
    "state": "Central",
    "benefitsSummary": "Free dialysis sessions, dialysis consumables, and nephrology consultation.",
    "financialBenefitAmount": 48000,
    "eligibilityRules": {
      "minAge": 5,
      "maxAge": 100,
      "allowedGenders": [
        "All"
      ],
      "allowedStates": [
        "All"
      ],
      "maxAnnualIncome": 250000,
      "requiredDocuments": [
        "Aadhaar",
        "BPL Ration Card / Ayushman Card",
        "Kidney Diagnosis Report"
      ]
    },
    "requiredDocuments": [
      "Aadhaar",
      "BPL Ration Card / Ayushman Card",
      "Kidney Diagnosis Report"
    ],
    "applicationSteps": [
      "Register at District Headquarter Hospital dialysis unit.",
      "Sessions booked free of cost through national PMNDP portal."
    ],
    "officialApplyUrl": "https://pmndp.mohfw.gov.in",
    "officialWebsite": "https://pmndp.mohfw.gov.in",
    "helplineNumber": "1800-180-1104",
    "deadline": "Open All Year",
    "tags": [
      "PMNDP",
      "Dialysis",
      "Kidney Disease",
      "BPL",
      "Free Hospital Treatment"
    ],
    "faqs": [
      {
        "question": "Who can apply for Pradhan Mantri National Dialysis Programme (PMNDP)?",
        "answer": "Eligible Indian citizens meeting criteria (All, states: All) can apply."
      },
      {
        "question": "Where can I apply?",
        "answer": "Applications are submitted online at https://pmndp.mohfw.gov.in or nearest official Common Service Centre (CSC)."
      }
    ],
    "lastUpdated": "2026-08-25",
    "popularityScore": 96
  },
  {
    "id": "house-pmay-urban-2",
    "name": "Pradhan Mantri Awas Yojana - Urban 2.0 (PMAY-U 2.0)",
    "shortDescription": "Interest subsidy up to ₹1.80 Lakh and direct construction aid of ₹2.5 Lakh for urban households without a pucca house.",
    "department": "MoHUA",
    "ministry": "Ministry of Housing and Urban Affairs",
    "category": "Housing & Shelter",
    "state": "Central",
    "benefitsSummary": "Direct subsidy of ₹2.5 Lakh for Beneficiary-Led Construction or 4% interest subsidy on housing loans.",
    "financialBenefitAmount": 250000,
    "eligibilityRules": {
      "minAge": 21,
      "maxAge": 70,
      "allowedGenders": [
        "All"
      ],
      "allowedStates": [
        "All"
      ],
      "maxAnnualIncome": 600000,
      "requiredDocuments": [
        "Aadhaar",
        "Income Certificate",
        "Land / Flat Agreement",
        "Bank Passbook"
      ]
    },
    "requiredDocuments": [
      "Aadhaar",
      "Income Certificate",
      "Land / Flat Agreement",
      "Bank Passbook"
    ],
    "applicationSteps": [
      "Apply through pmaymis.gov.in or municipality citizen service centre.",
      "Submit land ownership proof and building plan."
    ],
    "officialApplyUrl": "https://pmaymis.gov.in",
    "officialWebsite": "https://pmaymis.gov.in",
    "helplineNumber": "011-23063285",
    "deadline": "Open All Year",
    "tags": [
      "PMAY-U",
      "PMAY 2.0",
      "Urban Housing",
      "Interest Subsidy",
      "Home Loan"
    ],
    "faqs": [
      {
        "question": "Who can apply for Pradhan Mantri Awas Yojana - Urban 2.0 (PMAY-U 2.0)?",
        "answer": "Eligible Indian citizens meeting criteria (All, states: All) can apply."
      },
      {
        "question": "Where can I apply?",
        "answer": "Applications are submitted online at https://pmaymis.gov.in or nearest official Common Service Centre (CSC)."
      }
    ],
    "lastUpdated": "2026-08-25",
    "popularityScore": 93
  },
  {
    "id": "house-tn-kalaignar-kanavu-illam",
    "name": "Kalaignar Kanavu Illam Scheme (Tamil Nadu)",
    "shortDescription": "₹3.5 Lakh grant per family to reconstruct huts into modern pucca houses in rural villages of Tamil Nadu.",
    "department": "Rural Development and Panchayat Raj Department",
    "ministry": "Government of Tamil Nadu",
    "category": "Housing & Shelter",
    "state": "Tamil Nadu",
    "benefitsSummary": "Direct unit cost assistance of ₹3,50,000 per house credited in construction-linked stages.",
    "financialBenefitAmount": 350000,
    "eligibilityRules": {
      "minAge": 18,
      "maxAge": 95,
      "allowedGenders": [
        "All"
      ],
      "allowedStates": [
        "Tamil Nadu"
      ],
      "maxAnnualIncome": 120000,
      "allowedOccupations": [
        "Agricultural Labourer",
        "Worker",
        "Artisan"
      ],
      "requiredDocuments": [
        "Aadhaar",
        "Smart Ration Card",
        "Hut Geo-tag Survey Identification",
        "Bank Passbook"
      ]
    },
    "requiredDocuments": [
      "Aadhaar",
      "Smart Ration Card",
      "Hut Geo-tag Survey Identification",
      "Bank Passbook"
    ],
    "applicationSteps": [
      "Village Panchayat surveys existing huts and validates resident family.",
      "Approval by District Collector followed by fund disbursement."
    ],
    "officialApplyUrl": "https://tnrd.tn.gov.in",
    "officialWebsite": "https://tnrd.tn.gov.in",
    "helplineNumber": "044-24338495",
    "deadline": "Open All Year",
    "tags": [
      "Kalaignar Kanavu Illam",
      "Hut Free Tamil Nadu",
      "Rural Housing",
      "3.5 Lakh Housing"
    ],
    "faqs": [
      {
        "question": "Who can apply for Kalaignar Kanavu Illam Scheme (Tamil Nadu)?",
        "answer": "Eligible Indian citizens meeting criteria (All, states: Tamil Nadu) can apply."
      },
      {
        "question": "Where can I apply?",
        "answer": "Applications are submitted online at https://tnrd.tn.gov.in or nearest official Common Service Centre (CSC)."
      }
    ],
    "lastUpdated": "2026-08-25",
    "popularityScore": 85
  },
  {
    "id": "house-tn-urban-habitat-slum-clearance",
    "name": "Tamil Nadu Urban Habitat Development Board Housing Allotment",
    "shortDescription": "Subsidized permanent flats in urban multi-storey tenements for low-income urban families.",
    "department": "Tamil Nadu Urban Habitat Development Board (TNUHDB)",
    "ministry": "Government of Tamil Nadu",
    "category": "Housing & Shelter",
    "state": "Tamil Nadu",
    "benefitsSummary": "Permanent alloted multi-storey flat with heavy capital subsidy; beneficiary pays minimal contribution.",
    "financialBenefitAmount": 600000,
    "eligibilityRules": {
      "minAge": 21,
      "maxAge": 85,
      "allowedGenders": [
        "All"
      ],
      "allowedStates": [
        "Tamil Nadu"
      ],
      "maxAnnualIncome": 300000,
      "allowedOccupations": [
        "Daily Wage Earner",
        "Informal Worker",
        "Vendor"
      ],
      "requiredDocuments": [
        "Aadhaar",
        "Smart Ration Card",
        "Slum Enumeration Token",
        "Bank Passbook"
      ]
    },
    "requiredDocuments": [
      "Aadhaar",
      "Smart Ration Card",
      "Slum Enumeration Token",
      "Bank Passbook"
    ],
    "applicationSteps": [
      "Biometric enumeration by TNUHDB field survey officers.",
      "Lottery allotment and handover of ownership patta."
    ],
    "officialApplyUrl": "https://tnuhdb.tn.gov.in",
    "officialWebsite": "https://tnuhdb.tn.gov.in",
    "helplineNumber": "044-24670081",
    "deadline": "Open All Year",
    "tags": [
      "TNUHDB",
      "Slum Clearance",
      "Tamil Nadu Flat",
      "Urban Habitat",
      "Chennai Housing"
    ],
    "faqs": [
      {
        "question": "Who can apply for Tamil Nadu Urban Habitat Development Board Housing Allotment?",
        "answer": "Eligible Indian citizens meeting criteria (All, states: Tamil Nadu) can apply."
      },
      {
        "question": "Where can I apply?",
        "answer": "Applications are submitted online at https://tnuhdb.tn.gov.in or nearest official Common Service Centre (CSC)."
      }
    ],
    "lastUpdated": "2026-08-25",
    "popularityScore": 94
  },
  {
    "id": "house-swachh-bharat-ग्रामीण-toilet",
    "name": "Swachh Bharat Mission (Gramin) Individual Household Latrine (IHHL)",
    "shortDescription": "₹12,000 cash grant to construct an individual household latrine in rural residences.",
    "department": "Department of Drinking Water and Sanitation",
    "ministry": "Ministry of Jal Shakti",
    "category": "Housing & Shelter",
    "state": "Central",
    "benefitsSummary": "₹12,000 incentive paid upon toilet completion and photograph verification.",
    "financialBenefitAmount": 12000,
    "eligibilityRules": {
      "minAge": 18,
      "maxAge": 95,
      "allowedGenders": [
        "All"
      ],
      "allowedStates": [
        "All"
      ],
      "maxAnnualIncome": 250000,
      "requiredDocuments": [
        "Aadhaar",
        "Bank Account Passbook",
        "Residence Proof"
      ]
    },
    "requiredDocuments": [
      "Aadhaar",
      "Bank Account Passbook",
      "Residence Proof"
    ],
    "applicationSteps": [
      "Apply on sbm.gov.in/sbmphase2.",
      "Upload geo-tagged photo of completed toilet to receive ₹12,000 in bank account."
    ],
    "officialApplyUrl": "https://sbm.gov.in/sbmphase2/",
    "officialWebsite": "https://sbm.gov.in",
    "helplineNumber": "1800-180-0404",
    "deadline": "Open All Year",
    "tags": [
      "IHHL",
      "Toilet Subsidy",
      "Swachh Bharat",
      "12000 rupees",
      "Sanitation"
    ],
    "faqs": [
      {
        "question": "Who can apply for Swachh Bharat Mission (Gramin) Individual Household Latrine (IHHL)?",
        "answer": "Eligible Indian citizens meeting criteria (All, states: All) can apply."
      },
      {
        "question": "Where can I apply?",
        "answer": "Applications are submitted online at https://sbm.gov.in or nearest official Common Service Centre (CSC)."
      }
    ],
    "lastUpdated": "2026-08-25",
    "popularityScore": 92
  },
  {
    "id": "house-pm-surya-ghar-solar-rooftop",
    "name": "PM-Surya Ghar: Muft Bijli Yojana (Rooftop Solar)",
    "shortDescription": "Up to ₹78,000 direct subsidy for residential rooftop solar installation plus 300 units free electricity every month.",
    "department": "MNRE",
    "ministry": "Ministry of New and Renewable Energy",
    "category": "Housing & Shelter",
    "state": "Central",
    "benefitsSummary": "Subsidy of ₹30,000 for 1kW, ₹60,000 for 2kW, and ₹78,000 for 3kW or higher systems.",
    "financialBenefitAmount": 78000,
    "eligibilityRules": {
      "minAge": 18,
      "maxAge": 90,
      "allowedGenders": [
        "All"
      ],
      "allowedStates": [
        "All"
      ],
      "requiredDocuments": [
        "Aadhaar",
        "Electricity Bill (CA Number)",
        "Bank Account Passbook",
        "Roof Ownership Proof"
      ]
    },
    "requiredDocuments": [
      "Aadhaar",
      "Electricity Bill (CA Number)",
      "Bank Account Passbook",
      "Roof Ownership Proof"
    ],
    "applicationSteps": [
      "Register consumer account on pmsuryaghar.gov.in.",
      "Select empaneled vendor and submit net-metering application to DISCOM."
    ],
    "officialApplyUrl": "https://pmsuryaghar.gov.in",
    "officialWebsite": "https://pmsuryaghar.gov.in",
    "helplineNumber": "15555",
    "deadline": "Open All Year",
    "tags": [
      "PM Surya Ghar",
      "Muft Bijli",
      "Solar Rooftop",
      "78000 subsidy",
      "Electricity"
    ],
    "faqs": [
      {
        "question": "Who can apply for PM-Surya Ghar: Muft Bijli Yojana (Rooftop Solar)?",
        "answer": "Eligible Indian citizens meeting criteria (All, states: All) can apply."
      },
      {
        "question": "Where can I apply?",
        "answer": "Applications are submitted online at https://pmsuryaghar.gov.in or nearest official Common Service Centre (CSC)."
      }
    ],
    "lastUpdated": "2026-08-25",
    "popularityScore": 92
  },
  {
    "id": "emp-tn-unemployed-youth-allowance",
    "name": "Tamil Nadu Unemployment Allowance for Job Seekers",
    "shortDescription": "Monthly stipend up to ₹1,000 for educated unemployed youth registered with District Employment Exchange.",
    "department": "Department of Employment and Training",
    "ministry": "Government of Tamil Nadu",
    "category": "Employment & Micro Enterprises",
    "state": "Tamil Nadu",
    "benefitsSummary": "Monthly assistance: SSLC (₹200), HSC (₹300), Graduate/PG (₹600), Differently Abled (up to ₹1,000/month).",
    "financialBenefitAmount": 7200,
    "eligibilityRules": {
      "minAge": 18,
      "maxAge": 40,
      "allowedGenders": [
        "All"
      ],
      "allowedStates": [
        "Tamil Nadu"
      ],
      "maxAnnualIncome": 72000,
      "allowedOccupations": [
        "Unemployed",
        "Job Seeker"
      ],
      "requiredDocuments": [
        "Aadhaar",
        "Employment Exchange Registration Card (≥5 years active)",
        "Income Certificate",
        "Bank Passbook"
      ]
    },
    "requiredDocuments": [
      "Aadhaar",
      "Employment Exchange Registration Card (≥5 years active)",
      "Income Certificate",
      "Bank Passbook"
    ],
    "applicationSteps": [
      "Submit Form at District Employment and Career Guidance Centre.",
      "Monthly DBT credited to savings account."
    ],
    "officialApplyUrl": "https://employmentexchange.tn.gov.in",
    "officialWebsite": "https://employmentexchange.tn.gov.in",
    "helplineNumber": "044-22501002",
    "deadline": "Open All Year",
    "tags": [
      "Unemployment Allowance",
      "Tamil Nadu",
      "Job Seeker",
      "Employment Exchange",
      "Monthly Stipend"
    ],
    "faqs": [
      {
        "question": "Who can apply for Tamil Nadu Unemployment Allowance for Job Seekers?",
        "answer": "Eligible Indian citizens meeting criteria (All, states: Tamil Nadu) can apply."
      },
      {
        "question": "Where can I apply?",
        "answer": "Applications are submitted online at https://employmentexchange.tn.gov.in or nearest official Common Service Centre (CSC)."
      }
    ],
    "lastUpdated": "2026-08-25",
    "popularityScore": 93
  },
  {
    "id": "emp-pradhan-mantri-kaushal-vikas-4",
    "name": "Pradhan Mantri Kaushal Vikas Yojana 4.0 (PMKVY 4.0)",
    "shortDescription": "100% free skill certification with placement assistance in AI, robotics, drones, logistics, healthcare, and green skills.",
    "department": "NSDC",
    "ministry": "Ministry of Skill Development and Entrepreneurship",
    "category": "Employment & Micro Enterprises",
    "state": "Central",
    "benefitsSummary": "Free complete training, toolkits, assessment fee waiver, and government recognized National Skills Qualification Framework (NSQF) certificate.",
    "financialBenefitAmount": 15000,
    "eligibilityRules": {
      "minAge": 15,
      "maxAge": 45,
      "allowedGenders": [
        "All"
      ],
      "allowedStates": [
        "All"
      ],
      "allowedOccupations": [
        "Unemployed",
        "Student",
        "Dropout",
        "Youth"
      ],
      "requiredDocuments": [
        "Aadhaar",
        "Educational Qualification Proof (if any)",
        "Bank Account Passbook"
      ]
    },
    "requiredDocuments": [
      "Aadhaar",
      "Educational Qualification Proof (if any)",
      "Bank Account Passbook"
    ],
    "applicationSteps": [
      "Find training center on skillindia.gov.in or PMKVY portal.",
      "Enroll in course batch and pass assessment."
    ],
    "officialApplyUrl": "https://www.skillindiadigital.gov.in",
    "officialWebsite": "https://www.pmkvyofficial.org",
    "helplineNumber": "088000-55555",
    "deadline": "Open All Year",
    "tags": [
      "PMKVY",
      "Skill India",
      "Free Skill Training",
      "Certification",
      "NSDC"
    ],
    "faqs": [
      {
        "question": "Who can apply for Pradhan Mantri Kaushal Vikas Yojana 4.0 (PMKVY 4.0)?",
        "answer": "Eligible Indian citizens meeting criteria (All, states: All) can apply."
      },
      {
        "question": "Where can I apply?",
        "answer": "Applications are submitted online at https://www.pmkvyofficial.org or nearest official Common Service Centre (CSC)."
      }
    ],
    "lastUpdated": "2026-08-25",
    "popularityScore": 95
  },
  {
    "id": "emp-tn-naan-mudhalvan",
    "name": "Naan Mudhalvan Skill Development Scheme",
    "shortDescription": "Free dynamic skill enhancement and job placement platform for over 10 lakh Tamil Nadu youth annually.",
    "department": "Tamil Nadu Skill Development Corporation (TNSDC)",
    "ministry": "Government of Tamil Nadu",
    "category": "Employment & Micro Enterprises",
    "state": "Tamil Nadu",
    "benefitsSummary": "Free access to global certifications, hackathons, Cambridge English training, and campus placement drives.",
    "financialBenefitAmount": 20000,
    "eligibilityRules": {
      "minAge": 17,
      "maxAge": 28,
      "allowedGenders": [
        "All"
      ],
      "allowedStates": [
        "Tamil Nadu"
      ],
      "allowedOccupations": [
        "Student",
        "Job Seeker",
        "College Graduate"
      ],
      "requiredDocuments": [
        "Aadhaar",
        "College Student ID / Register Number"
      ]
    },
    "requiredDocuments": [
      "Aadhaar",
      "College Student ID / Register Number"
    ],
    "applicationSteps": [
      "Access the official Naan Mudhalvan portal (naanmudhalvan.tn.gov.in) using your college student credentials or university registration number.",
      "Browse and select the prescribed industry-aligned skill development courses or domain tracks available for your ongoing semester.",
      "Participate in the scheduled training modules, lab exercises, and mentor sessions conducted in partnership with your college and training partners.",
      "Complete course assessments to earn skill certifications and explore placement and internship opportunities facilitated through the portal."
    ],
    "officialApplyUrl": "https://naanmudhalvan.tn.gov.in",
    "officialWebsite": "https://naanmudhalvan.tn.gov.in",
    "helplineNumber": "044-22501006",
    "deadline": "Open All Year",
    "tags": [
      "Naan Mudhalvan",
      "Tamil Nadu",
      "Skill Training",
      "TNSDC",
      "IT Jobs"
    ],
    "faqs": [
      {
        "question": "Who can apply for Naan Mudhalvan Skill Development Scheme?",
        "answer": "Eligible Indian citizens meeting criteria (All, states: Tamil Nadu) can apply."
      },
      {
        "question": "Where can I apply?",
        "answer": "Applications are submitted online at https://naanmudhalvan.tn.gov.in or nearest official Common Service Centre (CSC)."
      }
    ],
    "lastUpdated": "2026-08-25",
    "popularityScore": 98
  },
  {
    "id": "emp-national-apprenticeship-promotion-naps",
    "name": "National Apprenticeship Promotion Scheme (NAPS)",
    "shortDescription": "On-the-job apprenticeship with monthly government-supported stipend and industrial certification.",
    "department": "Directorate General of Training (DGT)",
    "ministry": "Ministry of Skill Development and Entrepreneurship",
    "category": "Employment & Micro Enterprises",
    "state": "Central",
    "benefitsSummary": "Monthly stipend up to ₹10,000 (with ₹1,500 direct DBT government contribution) + national apprenticeship certificate.",
    "financialBenefitAmount": 18000,
    "eligibilityRules": {
      "minAge": 16,
      "maxAge": 35,
      "allowedGenders": [
        "All"
      ],
      "allowedStates": [
        "All"
      ],
      "allowedOccupations": [
        "Apprentice",
        "Job Seeker",
        "ITI Graduate",
        "Diploma Holder"
      ],
      "requiredDocuments": [
        "Aadhaar",
        "Educational Certificate",
        "Bank Account Passbook"
      ]
    },
    "requiredDocuments": [
      "Aadhaar",
      "Educational Certificate",
      "Bank Account Passbook"
    ],
    "applicationSteps": [
      "Register on apprenticeshipindia.gov.in portal.",
      "Apply for company apprenticeship vacancies and sign online contract."
    ],
    "officialApplyUrl": "https://www.apprenticeshipindia.gov.in",
    "officialWebsite": "https://www.apprenticeshipindia.gov.in",
    "helplineNumber": "011-25841261",
    "deadline": "Open All Year",
    "tags": [
      "NAPS",
      "Apprenticeship",
      "Stipend",
      "Industrial Training",
      "Job Training"
    ],
    "faqs": [
      {
        "question": "Who can apply for National Apprenticeship Promotion Scheme (NAPS)?",
        "answer": "Eligible Indian citizens meeting criteria (All, states: All) can apply."
      },
      {
        "question": "Where can I apply?",
        "answer": "Applications are submitted online at https://www.apprenticeshipindia.gov.in or nearest official Common Service Centre (CSC)."
      }
    ],
    "lastUpdated": "2026-08-25",
    "popularityScore": 84
  },
  {
    "id": "wc-tn-moovalur-ramamirtham-marriage-aid",
    "name": "Tamil Nadu Marriage Assistance Scheme (Moovalur Ramamirtham Marriage Grant)",
    "shortDescription": "Up to ₹50,000 cash grant + 8g Gold Coin for poor brides from low-income families in Tamil Nadu.",
    "department": "Social Welfare and Women Empowerment Department",
    "ministry": "Government of Tamil Nadu",
    "category": "Women & Child Welfare",
    "state": "Tamil Nadu",
    "benefitsSummary": "₹25,000 for 10th pass or ₹50,000 for degree holders + 1 Sovereign (8 grams) 22ct Gold Coin.",
    "financialBenefitAmount": 50000,
    "eligibilityRules": {
      "minAge": 18,
      "maxAge": 35,
      "allowedGenders": [
        "Female",
        "Male"
      ],
      "allowedStates": [
        "Tamil Nadu"
      ],
      "maxAnnualIncome": 72000,
      "requiredDocuments": [
        "Aadhaar",
        "Income Certificate from Tahsildar",
        "Wedding Invitation",
        "Educational Marksheet",
        "Age Proof"
      ]
    },
    "requiredDocuments": [
      "Aadhaar",
      "Income Certificate from Tahsildar",
      "Wedding Invitation",
      "Educational Marksheet",
      "Age Proof"
    ],
    "applicationSteps": [
      "Submit application on e-Sevai portal 40 days prior to marriage date.",
      "Verification by District Social Welfare Officer."
    ],
    "officialApplyUrl": "https://tnesevai.tn.gov.in",
    "officialWebsite": "https://www.tnsocialwelfare.tn.gov.in",
    "helplineNumber": "181",
    "deadline": "Open All Year",
    "tags": [
      "Marriage Assistance",
      "Gold Coin",
      "Tamil Nadu",
      "Moovalur Ramamirtham",
      "Thalikku Thangam"
    ],
    "faqs": [
      {
        "question": "Who can apply for Tamil Nadu Marriage Assistance Scheme (Moovalur Ramamirtham Marriage Grant)?",
        "answer": "Eligible Indian citizens meeting criteria (Female, Male, states: Tamil Nadu) can apply."
      },
      {
        "question": "Where can I apply?",
        "answer": "Applications are submitted online at https://www.tnsocialwelfare.tn.gov.in or nearest official Common Service Centre (CSC)."
      }
    ],
    "lastUpdated": "2026-08-25",
    "popularityScore": 86
  },
  {
    "id": "wc-tn-kalaignar-magalir-urimai-thogai",
    "name": "Kalaignar Magalir Urimai Thogai Scheme (KMUT)",
    "shortDescription": "₹1,000 per month unconditional cash transfer honoring women's unpaid care work across Tamil Nadu.",
    "department": "Special Programme Implementation Department",
    "ministry": "Government of Tamil Nadu",
    "category": "Women & Child Welfare",
    "state": "Tamil Nadu",
    "benefitsSummary": "₹1,000 per month (₹12,000 annually) transferred on the 15th of every month into Aadhaar-linked bank accounts.",
    "financialBenefitAmount": 12000,
    "eligibilityRules": {
      "minAge": 21,
      "maxAge": 85,
      "allowedGenders": [
        "Female",
        "Male"
      ],
      "allowedStates": [
        "Tamil Nadu"
      ],
      "maxAnnualIncome": 250000,
      "allowedOccupations": [
        "Homemaker",
        "Worker",
        "Agricultural Labourer",
        "Vendor"
      ],
      "requiredDocuments": [
        "Aadhaar",
        "Smart Family Card",
        "Electricity Bill",
        "Bank Passbook"
      ]
    },
    "requiredDocuments": [
      "Aadhaar",
      "Smart Family Card",
      "Electricity Bill",
      "Bank Passbook"
    ],
    "applicationSteps": [
      "Special ration shop camps organized across Tamil Nadu for bio-metric application.",
      "Monthly DBT credited on 15th directly via e-Kuber system."
    ],
    "officialApplyUrl": "https://kmut.tn.gov.in",
    "officialWebsite": "https://kmut.tn.gov.in",
    "helplineNumber": "044-25619222",
    "deadline": "Open All Year",
    "tags": [
      "Kalaignar Magalir Urimai",
      "KMUT",
      "1000 rupees women",
      "Women Rights",
      "Tamil Nadu"
    ],
    "faqs": [
      {
        "question": "Who can apply for Kalaignar Magalir Urimai Thogai Scheme (KMUT)?",
        "answer": "Eligible Indian citizens meeting criteria (Female, Male, states: Tamil Nadu) can apply."
      },
      {
        "question": "Where can I apply?",
        "answer": "Applications are submitted online at https://kmut.tn.gov.in or nearest official Common Service Centre (CSC)."
      }
    ],
    "lastUpdated": "2026-08-25",
    "popularityScore": 84
  },
  {
    "id": "wc-beti-bachao-beti-padhao",
    "name": "Beti Bachao Beti Padhao (BBBP)",
    "shortDescription": "District-level scholarship, medical safety, and educational retention support for girl children.",
    "department": "MWCD",
    "ministry": "Ministry of Women and Child Development",
    "category": "Women & Child Welfare",
    "state": "Central",
    "benefitsSummary": "Direct educational kits, zero school dropout monitoring, and specialized district skill vouchers.",
    "financialBenefitAmount": 5000,
    "eligibilityRules": {
      "minAge": 0,
      "maxAge": 18,
      "allowedGenders": [
        "Female",
        "Male"
      ],
      "allowedStates": [
        "All"
      ],
      "requiredDocuments": [
        "Birth Certificate",
        "Aadhaar"
      ]
    },
    "requiredDocuments": [
      "Birth Certificate",
      "Aadhaar"
    ],
    "applicationSteps": [
      "District task force facilitates school enrollment and healthcare checkup.",
      "Tracked via Poshan Tracker and UDISE+ databases."
    ],
    "officialApplyUrl": "https://wcd.nic.in/bbbp-schemes",
    "officialWebsite": "https://wcd.nic.in/bbbp-schemes",
    "helplineNumber": "1098",
    "deadline": "Open All Year",
    "tags": [
      "Beti Bachao",
      "Girl Child Education",
      "Child Sex Ratio",
      "Women Protection"
    ],
    "faqs": [
      {
        "question": "Who can apply for Beti Bachao Beti Padhao (BBBP)?",
        "answer": "Eligible Indian citizens meeting criteria (Female, Male, states: All) can apply."
      },
      {
        "question": "Where can I apply?",
        "answer": "Applications are submitted online at https://wcd.nic.in/bbbp-schemes or nearest official Common Service Centre (CSC)."
      }
    ],
    "lastUpdated": "2026-08-25",
    "popularityScore": 97
  },
  {
    "id": "wc-mission-vatsalya-child-protection",
    "name": "Mission Vatsalya (Child Protection and Sponsorship Scheme)",
    "shortDescription": "₹4,000 per month family sponsorship for children without parental care or living in acute distress.",
    "department": "Child Protection Division",
    "ministry": "Ministry of Women and Child Development",
    "category": "Women & Child Welfare",
    "state": "Central",
    "benefitsSummary": "₹4,000 per month credited directly to the joint bank account of child and guardian until age 18.",
    "financialBenefitAmount": 48000,
    "eligibilityRules": {
      "minAge": 0,
      "maxAge": 18,
      "allowedGenders": [
        "All"
      ],
      "allowedStates": [
        "All"
      ],
      "maxAnnualIncome": 144000,
      "requiredDocuments": [
        "Child Birth Certificate",
        "Death Certificate of Parent(s) if applicable",
        "Income Certificate",
        "Aadhaar",
        "School Bonafide"
      ]
    },
    "requiredDocuments": [
      "Child Birth Certificate",
      "Death Certificate of Parent(s) if applicable",
      "Income Certificate",
      "Aadhaar",
      "School Bonafide"
    ],
    "applicationSteps": [
      "Submit application to District Child Protection Officer (DCPO) at District Collectorate.",
      "Approval by Child Welfare Committee (CWC)."
    ],
    "officialApplyUrl": "https://wcd.nic.in",
    "officialWebsite": "https://wcd.nic.in",
    "helplineNumber": "1098",
    "deadline": "Open All Year",
    "tags": [
      "Mission Vatsalya",
      "Child Sponsorship",
      "Orphan Support",
      "4000 rupees monthly",
      "DCPU"
    ],
    "faqs": [
      {
        "question": "Who can apply for Mission Vatsalya (Child Protection and Sponsorship Scheme)?",
        "answer": "Eligible Indian citizens meeting criteria (All, states: All) can apply."
      },
      {
        "question": "Where can I apply?",
        "answer": "Applications are submitted online at https://wcd.nic.in or nearest official Common Service Centre (CSC)."
      }
    ],
    "lastUpdated": "2026-08-25",
    "popularityScore": 98
  },
  {
    "id": "wc-tn-sivagami-ammaiyar-girl-child-protection",
    "name": "Chief Minister's Girl Child Protection Scheme (Sivagami Ammaiyar Scheme)",
    "shortDescription": "₹50,000 fixed deposit in the name of the girl child to promote small family norms and eliminate female infanticide.",
    "department": "Social Welfare and Women Empowerment Department",
    "ministry": "Government of Tamil Nadu",
    "category": "Women & Child Welfare",
    "state": "Tamil Nadu",
    "benefitsSummary": "₹50,000 initial bond deposit maturing to over ₹2.5 Lakh for higher education at age 18 + annual incentive.",
    "financialBenefitAmount": 50000,
    "eligibilityRules": {
      "minAge": 0,
      "maxAge": 3,
      "allowedGenders": [
        "Female",
        "Male"
      ],
      "allowedStates": [
        "Tamil Nadu"
      ],
      "maxAnnualIncome": 72000,
      "requiredDocuments": [
        "Birth Certificate of Girl Child",
        "Sterilization Certificate of Parent",
        "Income Certificate (<₹72,000)",
        "Aadhaar"
      ]
    },
    "requiredDocuments": [
      "Birth Certificate of Girl Child",
      "Sterilization Certificate of Parent",
      "Income Certificate (<₹72,000)",
      "Aadhaar"
    ],
    "applicationSteps": [
      "Apply through e-Sevai centre before girl child completes 3 years.",
      "Bond certificate issued by District Social Welfare Office."
    ],
    "officialApplyUrl": "https://tnesevai.tn.gov.in",
    "officialWebsite": "https://www.tnsocialwelfare.tn.gov.in",
    "helplineNumber": "181",
    "deadline": "Open All Year",
    "tags": [
      "Girl Child Protection",
      "Tamil Nadu",
      "Fixed Deposit",
      "Female Education",
      "Sivagami Ammaiyar"
    ],
    "faqs": [
      {
        "question": "Who can apply for Chief Minister's Girl Child Protection Scheme (Sivagami Ammaiyar Scheme)?",
        "answer": "Eligible Indian citizens meeting criteria (Female, Male, states: Tamil Nadu) can apply."
      },
      {
        "question": "Where can I apply?",
        "answer": "Applications are submitted online at https://www.tnsocialwelfare.tn.gov.in or nearest official Common Service Centre (CSC)."
      }
    ],
    "lastUpdated": "2026-08-25",
    "popularityScore": 98
  },
  {
    "id": "GOV-ENT-001",
    "name": "Prime Minister's Employment Generation Programme (PMEGP)",
    "shortDescription": "Credit-linked subsidy programme aimed at generating self-employment opportunities through establishment of micro-enterprises in non-farm sector.",
    "department": "KVIC (Khadi and Village Industries Commission)",
    "ministry": "Ministry of Micro, Small and Medium Enterprises",
    "category": "Employment & Micro Enterprises",
    "state": "Central",
    "benefitsSummary": "Government subsidy up to 35% of project cost in rural areas (25% in urban areas) for special categories (SC/ST/OBC/Minorities/Women/Ex-servicemen/PH). Bank finance up to 90-95% of project cost. Maximum project cost ₹50 Lakhs for manufacturing sector and ₹20 Lakhs for service sector",
    "financialBenefitAmount": 0,
    "eligibilityRules": {
      "minAge": 18,
      "maxAge": 65,
      "allowedGenders": [
        "All"
      ],
      "allowedStates": [
        "All"
      ],
      "allowedOccupations": [
        "Aspiring Entrepreneur",
        "Artisan",
        "Unemployed Youth",
        "Self-Employed"
      ],
      "allowedCategories": [
        "General",
        "OBC",
        "SC",
        "ST",
        "Minority"
      ],
      "requiredDocuments": [
        "Aadhaar Card",
        "PAN Card",
        "Detailed Project Report (DPR)",
        "Educational Qualification Certificate (8th / 10th / Degree)",
        "Community / Caste Certificate (for subsidy margin)",
        "Rural Area Certificate from local authority (if applying under rural category)",
        "EDP Training Certificate (before loan disbursement)"
      ]
    },
    "requiredDocuments": [
      "Aadhaar Card",
      "PAN Card",
      "Detailed Project Report (DPR)",
      "Educational Qualification Certificate (8th / 10th / Degree)",
      "Community / Caste Certificate (for subsidy margin)",
      "Rural Area Certificate from local authority (if applying under rural category)",
      "EDP Training Certificate (before loan disbursement)"
    ],
    "applicationSteps": [
      "Register on the KVIC PMEGP e-Portal",
      "Fill online applicant details and upload DPR, photo, and identity documents",
      "Scorecard gets reviewed by District Task Force Committee (DTFC)",
      "Sanction by nominated financing bank",
      "Mandatory Entrepreneurship Development Programme (EDP) training",
      "Subsidy credited into Margin Money TDR account"
    ],
    "officialApplyUrl": "https://www.kviconline.gov.in/pmegpeportal/jsp/pmegponline.jsp",
    "officialWebsite": "https://www.kviconline.gov.in/pmegpeportal",
    "helplineNumber": "1800-180-6763",
    "deadline": "Open All Year",
    "tags": [
      "PMEGP",
      "KVIC",
      "MSME",
      "loan subsidy",
      "business startup",
      "manufacturing loan",
      "rural industry"
    ],
    "faqs": [
      {
        "question": "Who can apply for Prime Minister's Employment Generation Programme (PMEGP)?",
        "answer": "Eligible Indian citizens meeting criteria (All, states: All) can apply."
      },
      {
        "question": "Where can I apply?",
        "answer": "Applications are submitted online at https://www.kviconline.gov.in/pmegpeportal or nearest official Common Service Centre (CSC)."
      }
    ],
    "lastUpdated": "2026-08-25",
    "popularityScore": 96
  },
  {
    "id": "GOV-ENT-002",
    "name": "Stand-Up India Scheme",
    "shortDescription": "Facilitates bank loans between ₹10 lakh and ₹1 crore to at least one Scheduled Caste (SC) or Scheduled Tribe (ST) borrower and at least one woman borrower per bank branch for setting up greenfield enterprises.",
    "department": "Department of Financial Services / SIDBI",
    "ministry": "Ministry of Finance",
    "category": "Financial Inclusion & Credit",
    "state": "Central",
    "benefitsSummary": "Bank composite loan (term loan + working capital) between ₹10 Lakhs and ₹1 Crore. Margin money support up to 15% under convergence schemes. Handholding support through Lead District Managers (LDM) and SIDBI",
    "financialBenefitAmount": 0,
    "eligibilityRules": {
      "minAge": 18,
      "maxAge": 65,
      "allowedGenders": [
        "Female",
        "Male"
      ],
      "allowedStates": [
        "All"
      ],
      "allowedOccupations": [
        "Aspiring Entrepreneur",
        "Business Owner"
      ],
      "allowedCategories": [
        "SC",
        "ST"
      ],
      "requiredDocuments": [
        "Aadhaar Card",
        "PAN Card",
        "Proof of SC/ST category (if applicable)",
        "Project report with capital expenditure and operational budget",
        "Business address proof and lease agreement",
        "Bank statement for past 6 months"
      ]
    },
    "requiredDocuments": [
      "Aadhaar Card",
      "PAN Card",
      "Proof of SC/ST category (if applicable)",
      "Project report with capital expenditure and operational budget",
      "Business address proof and lease agreement",
      "Bank statement for past 6 months"
    ],
    "applicationSteps": [
      "Access Stand-Up India portal (standupmitra.in)",
      "Register as borrower and select category (SC/ST/Woman)",
      "Choose preferred bank and branch",
      "Upload business project proposal",
      "Track processing and receive bank sanction"
    ],
    "officialApplyUrl": "https://www.standupmitra.in/Login/Register",
    "officialWebsite": "https://www.standupmitra.in",
    "helplineNumber": "1800-180-1111",
    "deadline": "Open All Year",
    "tags": [
      "Stand Up India",
      "SC ST business",
      "Women entrepreneur",
      "SIDBI",
      "greenfield loan",
      "1 crore loan"
    ],
    "faqs": [
      {
        "question": "Who can apply for Stand-Up India Scheme?",
        "answer": "Eligible Indian citizens meeting criteria (Female, Male, states: All) can apply."
      },
      {
        "question": "Where can I apply?",
        "answer": "Applications are submitted online at https://www.standupmitra.in or nearest official Common Service Centre (CSC)."
      }
    ],
    "lastUpdated": "2026-08-25",
    "popularityScore": 87
  },
  {
    "id": "GOV-ENT-004",
    "name": "Tamil Nadu New Entrepreneur-cum-Enterprise Development Scheme (NEEDS)",
    "shortDescription": "Flagship Tamil Nadu state government scheme assisting educated youth to become first-generation entrepreneurs by providing capital subsidy and interest subvention for setting up manufacturing and service enterprises.",
    "department": "Micro, Small and Medium Enterprises Department",
    "ministry": "Government of Tamil Nadu",
    "category": "Financial Inclusion & Credit",
    "state": "Tamil Nadu",
    "benefitsSummary": "25% capital subsidy on project cost with a ceiling of ₹75 Lakhs. 3% interest subvention for the entire loan repayment tenure. State-sponsored Entrepreneurship Development Programme (EDP) training. Eligible project costs from ₹10 Lakhs up to ₹5 Crores",
    "financialBenefitAmount": 0,
    "eligibilityRules": {
      "minAge": 21,
      "maxAge": 35,
      "allowedGenders": [
        "All"
      ],
      "allowedStates": [
        "Tamil Nadu"
      ],
      "allowedOccupations": [
        "Aspiring Entrepreneur",
        "First Generation Entrepreneur",
        "Graduates"
      ],
      "allowedCategories": [
        "General",
        "OBC",
        "SC",
        "ST",
        "Minority"
      ],
      "requiredDocuments": [
        "Aadhaar Card",
        "Proof of Nativity / Residence in Tamil Nadu",
        "Educational Certificate (Degree / Diploma / ITI marksheet)",
        "Community Certificate",
        "Project Report with cost of plant, machinery, and working capital",
        "Passport size photo"
      ]
    },
    "requiredDocuments": [
      "Aadhaar Card",
      "Proof of Nativity / Residence in Tamil Nadu",
      "Educational Certificate (Degree / Diploma / ITI marksheet)",
      "Community Certificate",
      "Project Report with cost of plant, machinery, and working capital",
      "Passport size photo"
    ],
    "applicationSteps": [
      "Apply through the MSME Tamil Nadu online portal (msmeonline.tn.gov.in)",
      "Select NEEDS scheme and upload project report and educational records",
      "Application screened by District Level Task Force Committee headed by District Collector",
      "Interview and provisional selection",
      "Complete mandatory 25-day EDP training by EDII-TN",
      "Bank sanction and subsidy release by DIC"
    ],
    "officialApplyUrl": "https://msmeonline.tn.gov.in/needs/newuser.php",
    "officialWebsite": "https://msmeonline.tn.gov.in/needs",
    "helplineNumber": "044-22501494",
    "deadline": "Open All Year",
    "tags": [
      "NEEDS",
      "Tamil Nadu MSME",
      "EDII",
      "first generation entrepreneur",
      "capital subsidy",
      "DIC loan"
    ],
    "faqs": [
      {
        "question": "Who can apply for Tamil Nadu New Entrepreneur-cum-Enterprise Development Scheme (NEEDS)?",
        "answer": "Eligible Indian citizens meeting criteria (All, states: Tamil Nadu) can apply."
      },
      {
        "question": "Where can I apply?",
        "answer": "Applications are submitted online at https://msmeonline.tn.gov.in/needs or nearest official Common Service Centre (CSC)."
      }
    ],
    "lastUpdated": "2026-08-25",
    "popularityScore": 88
  },
  {
    "id": "GOV-ENT-005",
    "name": "PM Formalisation of Micro Food Processing Enterprises (PM FME)",
    "shortDescription": "Centrally sponsored scheme designed to enhance the competitiveness of existing individual micro-enterprises in the unorganized food processing sector and support Farmer Producer Organizations (FPOs), SHGs, and producer cooperatives.",
    "department": "National Institute of Food Technology Entrepreneurship and Management",
    "ministry": "Ministry of Food Processing Industries (MoFPI)",
    "category": "Financial Inclusion & Credit",
    "state": "Central",
    "benefitsSummary": "Credit-linked capital subsidy at 35% of eligible project cost with a maximum ceiling of ₹10 Lakhs per micro food processing unit. Seed capital of ₹40,000 per member of SHG for working capital and small tools. Support for common infrastructure and branding/marketing",
    "financialBenefitAmount": 0,
    "eligibilityRules": {
      "minAge": 18,
      "maxAge": 65,
      "allowedGenders": [
        "All"
      ],
      "allowedStates": [
        "All"
      ],
      "allowedOccupations": [
        "Food Processor",
        "Baker",
        "Pickle Manufacturer",
        "Oil Mill Operator",
        "Dairy Farmer",
        "SHG Member"
      ],
      "allowedCategories": [
        "General",
        "OBC",
        "SC",
        "ST",
        "Minority"
      ],
      "requiredDocuments": [
        "Aadhaar Card",
        "PAN Card",
        "Bank passbook / statement",
        "Proof of enterprise existence (FSSAI license / electricity bill / Udhyam)",
        "Project proposal for expansion / technology upgradation",
        "Quotation of machinery"
      ]
    },
    "requiredDocuments": [
      "Aadhaar Card",
      "PAN Card",
      "Bank passbook / statement",
      "Proof of enterprise existence (FSSAI license / electricity bill / Udhyam)",
      "Project proposal for expansion / technology upgradation",
      "Quotation of machinery"
    ],
    "applicationSteps": [
      "Register on the PMFME MIS portal (pmfme.mofpi.gov.in)",
      "Submit application with District Resource Person (DRP) assistance",
      "State Nodal Agency examines and recommends to chosen bank",
      "Bank inspects unit and sanctions loan",
      "Subsidy released into beneficiary loan account"
    ],
    "officialApplyUrl": "https://pmfme.mofpi.gov.in/pmfme/#/login",
    "officialWebsite": "https://pmfme.mofpi.gov.in",
    "helplineNumber": "1800-111-555",
    "deadline": "Open All Year",
    "tags": [
      "PMFME",
      "food processing",
      "ODOP",
      "pickle maker",
      "oil extraction",
      "MoFPI",
      "SHG food business"
    ],
    "faqs": [
      {
        "question": "Who can apply for PM Formalisation of Micro Food Processing Enterprises (PM FME)?",
        "answer": "Eligible Indian citizens meeting criteria (All, states: All) can apply."
      },
      {
        "question": "Where can I apply?",
        "answer": "Applications are submitted online at https://pmfme.mofpi.gov.in or nearest official Common Service Centre (CSC)."
      }
    ],
    "lastUpdated": "2026-08-25",
    "popularityScore": 94
  },
  {
    "id": "GOV-FIN-001",
    "name": "Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)",
    "shortDescription": "One-year life insurance scheme renewable from year to year offering life cover for death due to any reason at an extremely affordable premium of ₹436 per annum.",
    "department": "Department of Financial Services",
    "ministry": "Ministry of Finance",
    "category": "Financial Inclusion & Credit",
    "state": "Central",
    "benefitsSummary": "₹2,00,000 death benefit payable to nominee in case of death of the insured member due to any cause. Extremely affordable premium of ₹436 per annum auto-debited from bank/post office savings account",
    "financialBenefitAmount": 0,
    "eligibilityRules": {
      "minAge": 18,
      "maxAge": 50,
      "allowedGenders": [
        "All"
      ],
      "allowedStates": [
        "All"
      ],
      "allowedOccupations": [
        "All Occupations",
        "Unorganized Worker",
        "Farmer",
        "Domestic Worker",
        "Salaried"
      ],
      "allowedCategories": [
        "General",
        "OBC",
        "SC",
        "ST",
        "Minority"
      ],
      "requiredDocuments": [
        "Aadhaar Card",
        "Active Savings Bank Account Passbook",
        "Nominee Details (Aadhaar & Relationship)"
      ]
    },
    "requiredDocuments": [
      "Aadhaar Card",
      "Active Savings Bank Account Passbook",
      "Nominee Details (Aadhaar & Relationship)"
    ],
    "applicationSteps": [
      "Visit home bank branch or log in to internet/mobile banking",
      "Fill PMJJBY consent-cum-declaration form designating nominee",
      "Provide consent for auto-debit of ₹436 annual premium",
      "Receive policy Certificate of Insurance via SMS/Email"
    ],
    "officialApplyUrl": "https://www.jansuraksha.gov.in",
    "officialWebsite": "https://financialservices.gov.in/beta/en/pmjjby",
    "helplineNumber": "1800-180-1111",
    "deadline": "Open All Year",
    "tags": [
      "PMJJBY",
      "life insurance",
      "Jansuraksha",
      "436 premium",
      "death benefit",
      "social security"
    ],
    "faqs": [
      {
        "question": "Who can apply for Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)?",
        "answer": "Eligible Indian citizens meeting criteria (All, states: All) can apply."
      },
      {
        "question": "Where can I apply?",
        "answer": "Applications are submitted online at https://financialservices.gov.in/beta/en/pmjjby or nearest official Common Service Centre (CSC)."
      }
    ],
    "lastUpdated": "2026-08-25",
    "popularityScore": 84
  },
  {
    "id": "GOV-FIN-002",
    "name": "Pradhan Mantri Suraksha Bima Yojana (PMSBY)",
    "shortDescription": "One-year accidental insurance scheme renewable from year to year offering coverage for accidental death and permanent disability at a nominal premium of ₹20 per year.",
    "department": "Department of Financial Services",
    "ministry": "Ministry of Finance",
    "category": "Financial Inclusion & Credit",
    "state": "Central",
    "benefitsSummary": "₹2,00,000 for accidental death or permanent total disability (loss of both eyes or loss of use of both hands or feet). ₹1,00,000 for permanent partial disability (loss of one eye or loss of use of one hand or foot). Unmatched annual premium of just ₹20 per year",
    "financialBenefitAmount": 0,
    "eligibilityRules": {
      "minAge": 18,
      "maxAge": 70,
      "allowedGenders": [
        "All"
      ],
      "allowedStates": [
        "All"
      ],
      "allowedOccupations": [
        "All Occupations",
        "Daily Wage Earner",
        "Driver",
        "Construction Worker",
        "Farmer"
      ],
      "allowedCategories": [
        "General",
        "OBC",
        "SC",
        "ST",
        "Minority"
      ],
      "requiredDocuments": [
        "Aadhaar Card",
        "Savings Bank Account Passbook",
        "Nominee Details"
      ]
    },
    "requiredDocuments": [
      "Aadhaar Card",
      "Savings Bank Account Passbook",
      "Nominee Details"
    ],
    "applicationSteps": [
      "Visit the bank branch where you maintain a savings account",
      "Fill PMSBY enrollment form giving nominee name and address",
      "Authorize auto-debit of ₹20 from savings balance",
      "Acknowledgment receipt issued immediately"
    ],
    "officialApplyUrl": "https://www.jansuraksha.gov.in",
    "officialWebsite": "https://financialservices.gov.in/beta/en/pmsby",
    "helplineNumber": "1800-180-1111",
    "deadline": "Open All Year",
    "tags": [
      "PMSBY",
      "accidental insurance",
      "disability cover",
      "20 rupee premium",
      "Jansuraksha"
    ],
    "faqs": [
      {
        "question": "Who can apply for Pradhan Mantri Suraksha Bima Yojana (PMSBY)?",
        "answer": "Eligible Indian citizens meeting criteria (All, states: All) can apply."
      },
      {
        "question": "Where can I apply?",
        "answer": "Applications are submitted online at https://financialservices.gov.in/beta/en/pmsby or nearest official Common Service Centre (CSC)."
      }
    ],
    "lastUpdated": "2026-08-25",
    "popularityScore": 87
  },
  {
    "id": "GOV-FIN-005",
    "name": "Tamil Nadu Maintenance Allowance for Differently Abled Persons",
    "shortDescription": "Tamil Nadu state government social security scheme granting monthly maintenance allowance to persons with severe disabilities, muscular dystrophy, and intellectual disabilities.",
    "department": "Welfare of Differently Abled Persons Department",
    "ministry": "Government of Tamil Nadu",
    "category": "Disability Empowerment",
    "state": "Tamil Nadu",
    "benefitsSummary": "Monthly maintenance allowance of ₹2,000 per month (enhanced from ₹1,500) disbursed directly through DBT. Free bus passes and assistive devices support",
    "financialBenefitAmount": 0,
    "eligibilityRules": {
      "minAge": 0,
      "maxAge": 100,
      "allowedGenders": [
        "All"
      ],
      "allowedStates": [
        "Tamil Nadu"
      ],
      "allowedOccupations": [
        "Any"
      ],
      "allowedCategories": [
        "General",
        "OBC",
        "SC",
        "ST",
        "Minority"
      ],
      "requiresDisability": true,
      "minDisabilityPercentage": 40,
      "requiredDocuments": [
        "National Disability ID (UDID Card) or State Disability Identity Card",
        "Aadhaar Card",
        "Ration Card / Smart Card",
        "Bank Account Passbook (single or joint with guardian)",
        "Medical Board Certificate showing percentage of disability"
      ]
    },
    "requiredDocuments": [
      "National Disability ID (UDID Card) or State Disability Identity Card",
      "Aadhaar Card",
      "Ration Card / Smart Card",
      "Bank Account Passbook (single or joint with guardian)",
      "Medical Board Certificate showing percentage of disability"
    ],
    "applicationSteps": [
      "Obtain UDID / Medical Disability Certificate from Government District Headquarters Hospital",
      "Submit application at District Differently Abled Welfare Officer (DDAWO) in District Collectorate or via e-Sevai",
      "Verification by rehabilitation officer",
      "Sanction order issued and monthly ₹2,000 credited to bank account"
    ],
    "officialApplyUrl": "https://tnesevai.tn.gov.in",
    "officialWebsite": "https://www.scd.tn.gov.in",
    "helplineNumber": "1800-425-0111",
    "deadline": "Open All Year",
    "tags": [
      "Disability allowance",
      "Tamil Nadu UDID",
      "DDAWO",
      "maintenance allowance",
      "differently abled",
      "PWD financial help"
    ],
    "faqs": [
      {
        "question": "Who can apply for Tamil Nadu Maintenance Allowance for Differently Abled Persons?",
        "answer": "Eligible Indian citizens meeting criteria (All, states: Tamil Nadu) can apply."
      },
      {
        "question": "Where can I apply?",
        "answer": "Applications are submitted online at https://www.scd.tn.gov.in or nearest official Common Service Centre (CSC)."
      }
    ],
    "lastUpdated": "2026-08-25",
    "popularityScore": 96
  },
  {
    "id": "GOV-FIN-006",
    "name": "Pradhan Mantri Shram Yogi Maan-dhan (PM-SYM)",
    "shortDescription": "Voluntary and contributory pension scheme for unorganized workers like street vendors, domestic workers, rickshaw pullers, and agricultural laborers ensuring old age protection.",
    "department": "Directorate General Labour Welfare",
    "ministry": "Ministry of Labour and Employment",
    "category": "Pensions & Senior Care",
    "state": "Central",
    "benefitsSummary": "Guaranteed monthly pension of ₹3,000 on attaining age 60. 50% matching contribution paid by Central Government into beneficiary pension account. Family pension of 50% (₹1,500/month) to spouse upon subscriber's death",
    "financialBenefitAmount": 0,
    "eligibilityRules": {
      "minAge": 18,
      "maxAge": 40,
      "allowedGenders": [
        "All"
      ],
      "allowedStates": [
        "All"
      ],
      "maxAnnualIncome": 180000,
      "allowedOccupations": [
        "Street Vendor",
        "Rickshaw Puller",
        "Construction Worker",
        "Agricultural Laborer",
        "Domestic Worker",
        "Handloom Worker"
      ],
      "allowedCategories": [
        "General",
        "OBC",
        "SC",
        "ST",
        "Minority"
      ],
      "requiredDocuments": [
        "Aadhaar Card",
        "Savings Bank Account / Jan Dhan Account with IFSC",
        "Mobile Number"
      ]
    },
    "requiredDocuments": [
      "Aadhaar Card",
      "Savings Bank Account / Jan Dhan Account with IFSC",
      "Mobile Number"
    ],
    "applicationSteps": [
      "Visit any Common Service Centre (CSC) or visit maandhan.in",
      "Provide Aadhaar and Bank account details for e-KYC verification",
      "First monthly contribution (₹55 to ₹200 depending on entry age) paid in cash at CSC",
      "Auto-debit mandate signed",
      "Shram Yogi Pension Card generated immediately with unique SYM number"
    ],
    "officialApplyUrl": "https://maandhan.in/shramyogi",
    "officialWebsite": "https://maandhan.in",
    "helplineNumber": "1800-267-6888",
    "deadline": "Open All Year",
    "tags": [
      "PM-SYM",
      "Shram Yogi",
      "unorganized workers pension",
      "3000 pension",
      "CSC",
      "labour welfare"
    ],
    "faqs": [
      {
        "question": "Who can apply for Pradhan Mantri Shram Yogi Maan-dhan (PM-SYM)?",
        "answer": "Eligible Indian citizens meeting criteria (All, states: All) can apply."
      },
      {
        "question": "Where can I apply?",
        "answer": "Applications are submitted online at https://maandhan.in or nearest official Common Service Centre (CSC)."
      }
    ],
    "lastUpdated": "2026-08-25",
    "popularityScore": 88
  },
  {
    "id": "paramparagat-krishi-vikas",
    "name": "Paramparagat Krishi Vikas Yojana (PKVY)",
    "shortDescription": "Promotion of commercial organic farming through cluster formation and PGS certification.",
    "department": "Department of Agriculture and Farmers Welfare",
    "ministry": "Ministry of Agriculture & Farmers Welfare",
    "category": "Agriculture & Farmers",
    "state": "Central",
    "benefitsSummary": "₹50,000 per hectare assistance over 3 years for organic inputs, certification, and direct marketing.",
    "financialBenefitAmount": 50000,
    "eligibilityRules": {
      "minAge": 18,
      "maxAge": 70,
      "allowedGenders": [
        "All"
      ],
      "allowedStates": [
        "All"
      ],
      "allowedOccupations": [
        "Farmer",
        "Self Employed Farmer"
      ],
      "requiredDocuments": [
        "Aadhaar",
        "Land Record (Khata/Khasra)",
        "Bank Passbook"
      ]
    },
    "requiredDocuments": [
      "Aadhaar Card",
      "Land Record Details",
      "Bank Passbook",
      "Farmer Group/Cluster Membership Form"
    ],
    "applicationSteps": [
      "Form or join a cluster of 20 or more farmers (50 acres minimum).",
      "Register on the Jaivik Kheti portal.",
      "Assistance disbursed directly into bank account in tranches."
    ],
    "officialApplyUrl": "https://pgsindia-ncof.gov.in/",
    "officialWebsite": "https://pgsindia-ncof.gov.in/",
    "helplineNumber": "0120-2764906",
    "deadline": "Open All Year",
    "tags": [
      "Organic Farming",
      "PKVY",
      "Natural Farming",
      "Bio Fertilizers"
    ],
    "faqs": [
      {
        "question": "How much financial support is provided?",
        "answer": "₹50,000 per hectare for 3 years, of which ₹31,000 is given directly for organic inputs."
      }
    ],
    "lastUpdated": "2026-07-25",
    "popularityScore": 84
  },
  {
    "id": "national-beekeeping-mission",
    "name": "National Beekeeping & Honey Mission (NBHM)",
    "shortDescription": "Promotion of scientific beekeeping to augment farmers' income, crop pollination, and honey production.",
    "department": "National Bee Board",
    "ministry": "Ministry of Agriculture & Farmers Welfare",
    "category": "Agriculture & Farmers",
    "state": "Central",
    "benefitsSummary": "Up to 50% subsidy on beehives, bee colonies, and honey extraction equipment for individuals and clusters.",
    "financialBenefitAmount": 40000,
    "eligibilityRules": {
      "minAge": 18,
      "maxAge": 70,
      "allowedGenders": [
        "All"
      ],
      "allowedStates": [
        "All"
      ],
      "allowedOccupations": [
        "Farmer",
        "Beekeeper",
        "Rural Youth",
        "Self Employed"
      ],
      "requiredDocuments": [
        "Aadhaar",
        "Bank Passbook"
      ]
    },
    "requiredDocuments": [
      "Aadhaar Card",
      "Bank Account Details",
      "Land or Training Certificate (if available)"
    ],
    "applicationSteps": [
      "Register on Madhukranti portal (madhukranti.in).",
      "Apply for subsidized bee boxes through National Bee Board.",
      "Field inspection and subsidy release."
    ],
    "officialApplyUrl": "https://nbhm.gov.in/",
    "officialWebsite": "https://nbhm.gov.in/",
    "helplineNumber": "011-23382012",
    "deadline": "Open All Year",
    "tags": [
      "Beekeeping",
      "Honey",
      "NBHM",
      "Sweet Revolution"
    ],
    "faqs": [
      {
        "question": "Can small farmers take up beekeeping under NBHM?",
        "answer": "Yes, small and marginal farmers get up to 50% subsidy on bee colonies and boxes."
      }
    ],
    "lastUpdated": "2026-06-20",
    "popularityScore": 78
  },
  {
    "id": "mission-indradhanush",
    "name": "Intensified Mission Indradhanush (IMI)",
    "shortDescription": "Universal full immunization coverage for pregnant women and children up to 2 years against 12 vaccine-preventable diseases.",
    "department": "Immunization Division",
    "ministry": "Ministry of Health and Family Welfare",
    "category": "Health & Healthcare",
    "state": "Central",
    "benefitsSummary": "Free vaccines protecting children and pregnant women against Tuberculosis, Polio, Measles, Hepatitis B, Tetanus, and Diphtheria.",
    "financialBenefitAmount": 15000,
    "eligibilityRules": {
      "minAge": 18,
      "maxAge": 5,
      "allowedGenders": [
        "All"
      ],
      "allowedStates": [
        "All"
      ],
      "requiredDocuments": [
        "Mother-Child Protection Card (MCP Card)"
      ]
    },
    "requiredDocuments": [
      "Mother and Child Protection (MCP) Card",
      "Aadhaar Card of Parent",
      "Birth Certificate"
    ],
    "applicationSteps": [
      "Visit any Anganwadi Center, Primary Health Center (PHC), or Sub-Center on vaccination days.",
      "ANM updates MCP card and administers due vaccines for free."
    ],
    "officialApplyUrl": "https://nhm.gov.in/index1.php?lang=1&level=2&sublinkid=822&lid=220",
    "officialWebsite": "https://mohfw.gov.in/",
    "helplineNumber": "1075",
    "deadline": "Open All Year",
    "tags": [
      "Vaccination",
      "Immunization",
      "Child Care",
      "Mission Indradhanush"
    ],
    "faqs": [
      {
        "question": "Are the vaccines free under Mission Indradhanush?",
        "answer": "Yes, all 12 vaccines under the Universal Immunization Programme are administered completely free."
      }
    ],
    "lastUpdated": "2026-08-05",
    "popularityScore": 91
  },
  {
    "id": "rashtriya-arogya-nidhi",
    "name": "Rashtriya Arogya Nidhi (RAN)",
    "shortDescription": "One-time financial grant for poor patients suffering from major life-threatening diseases for treatment at government super-specialty hospitals.",
    "department": "Department of Health and Family Welfare",
    "ministry": "Ministry of Health and Family Welfare",
    "category": "Health & Healthcare",
    "state": "Central",
    "benefitsSummary": "Financial grant up to ₹15 Lakh for life-saving medical treatment at AIIMS and central government tertiary hospitals.",
    "financialBenefitAmount": 1500000,
    "eligibilityRules": {
      "minAge": 18,
      "maxAge": 70,
      "allowedGenders": [
        "All"
      ],
      "allowedStates": [
        "All"
      ],
      "maxAnnualIncome": 180000,
      "requiredDocuments": [
        "Aadhaar",
        "Income Certificate",
        "Medical Certificate"
      ]
    },
    "requiredDocuments": [
      "Aadhaar Card",
      "BPL Certificate / State Income Certificate",
      "Hospital Medical Treatment Estimate signed by Medical Superintendent"
    ],
    "applicationSteps": [
      "Consult treating physician at empanelled Central Government Hospital (e.g. AIIMS).",
      "Doctor and Medical Superintendent forward application and estimate to RAN committee.",
      "Funds released directly to the hospital for patient's surgery/therapy."
    ],
    "officialApplyUrl": "https://mohfw.gov.in/major-programmes/other-national-health-programmes/rashtriya-arogya-nidhi",
    "officialWebsite": "https://mohfw.gov.in/",
    "helplineNumber": "011-23061342",
    "deadline": "Open All Year",
    "tags": [
      "RAN",
      "Critical Illness",
      "Cancer",
      "Super Specialty Treatment"
    ],
    "faqs": [
      {
        "question": "What is the maximum grant under RAN?",
        "answer": "Up to ₹15 Lakh for life-threatening diseases, and up to ₹50 Lakh under Rare Diseases policy."
      }
    ],
    "lastUpdated": "2026-07-30",
    "popularityScore": 85
  },
  {
    "id": "tele-manas-mental-health",
    "name": "Tele MANAS (National Tele Mental Health Programme)",
    "shortDescription": "24x7 toll-free comprehensive mental health counseling and psychiatric support across all Indian states in 20+ languages.",
    "department": "National Tele Mental Health Cell",
    "ministry": "Ministry of Health and Family Welfare",
    "category": "Health & Healthcare",
    "state": "Central",
    "benefitsSummary": "100% free confidential mental health consultation, crisis counseling, and referral to specialist psychiatric centers.",
    "financialBenefitAmount": 5000,
    "eligibilityRules": {
      "minAge": 18,
      "maxAge": 70,
      "allowedGenders": [
        "All"
      ],
      "allowedStates": [
        "All"
      ],
      "requiredDocuments": []
    },
    "requiredDocuments": [
      "No documents required - completely open and confidential telephone service."
    ],
    "applicationSteps": [
      "Dial toll-free number 14416 or 1800-891-4416.",
      "Select preferred language.",
      "Speak directly to trained clinical psychologists and counselors."
    ],
    "officialApplyUrl": "https://telemanas.mohfw.gov.in/",
    "officialWebsite": "https://telemanas.mohfw.gov.in/",
    "helplineNumber": "14416 / 1800-891-4416",
    "deadline": "24x7 Open All Year",
    "tags": [
      "Mental Health",
      "Counseling",
      "Tele MANAS",
      "Toll Free Helpline"
    ],
    "faqs": [
      {
        "question": "Is Tele MANAS confidential?",
        "answer": "Yes, all consultations are completely confidential and free of charge."
      }
    ],
    "lastUpdated": "2026-08-14",
    "popularityScore": 90
  },
  {
    "id": "pm-svamitva-property-card",
    "name": "SVAMITVA Scheme (Rural Property Cards)",
    "shortDescription": "Survey of villages and mapping with improvised technology in village areas to issue legal property ownership cards to rural owners.",
    "department": "Ministry of Panchayati Raj",
    "ministry": "Ministry of Panchayati Raj",
    "category": "Housing & Shelter",
    "state": "Central",
    "benefitsSummary": "Official Government Property Card enabling rural homeowners to use property as financial asset for taking bank loans and resolving disputes.",
    "financialBenefitAmount": 50000,
    "eligibilityRules": {
      "minAge": 18,
      "maxAge": 70,
      "allowedGenders": [
        "All"
      ],
      "allowedStates": [
        "All"
      ],
      "allowedOccupations": [
        "Rural Resident",
        "Farmer",
        "Daily Wager"
      ],
      "requiredDocuments": [
        "Aadhaar"
      ]
    },
    "requiredDocuments": [
      "Aadhaar Card",
      "Existing Village House Tax Receipt / Chulha Tax Receipt"
    ],
    "applicationSteps": [
      "Survey of India conducts drone mapping of inhabited village area (Abadi).",
      "Ground validation by Revenue officials and Gram Panchayat.",
      "Property Card generated with QR code and handed to homeowner."
    ],
    "officialApplyUrl": "https://svamitva.nic.in/",
    "officialWebsite": "https://panchayat.gov.in/",
    "helplineNumber": "011-23389012",
    "deadline": "Open All Year",
    "tags": [
      "SVAMITVA",
      "Property Card",
      "Rural Land Records",
      "Panchayat"
    ],
    "faqs": [
      {
        "question": "Can SVAMITVA Property Card be used for bank loans?",
        "answer": "Yes, it is a legally recognized ownership record for financial collateral."
      }
    ],
    "lastUpdated": "2026-07-28",
    "popularityScore": 88
  },
  {
    "id": "deendayal-antodaya-shelter",
    "name": "Shelter for Urban Homeless (DAY-NULM SUH)",
    "shortDescription": "Permanent all-weather community shelters with basic amenities for urban homeless populations across cities.",
    "department": "Mission Directorate DAY-NULM",
    "ministry": "Ministry of Housing and Urban Affairs",
    "category": "Housing & Shelter",
    "state": "Central",
    "benefitsSummary": "Free 24x7 night shelter with clean beds, drinking water, sanitation, lockers, healthcare checkups, and social security linkage.",
    "financialBenefitAmount": 18000,
    "eligibilityRules": {
      "minAge": 18,
      "maxAge": 70,
      "allowedGenders": [
        "All"
      ],
      "allowedStates": [
        "All"
      ],
      "requiredDocuments": []
    },
    "requiredDocuments": [
      "No documents strictly required - identity cards linked after shelter admission."
    ],
    "applicationSteps": [
      "Walk in to nearest Urban Night Shelter (Rain Basera) run by Municipal Corporation.",
      "Free registration and accommodation provided immediately."
    ],
    "officialApplyUrl": "https://nulm.gov.in/",
    "officialWebsite": "https://mohua.gov.in/",
    "helplineNumber": "1800-11-2022",
    "deadline": "24x7 Open All Year",
    "tags": [
      "Shelter",
      "Urban Homeless",
      "DAY NULM",
      "Rain Basera"
    ],
    "faqs": [
      {
        "question": "Is there any charge for staying in NULM shelters?",
        "answer": "No, staying in government urban homeless shelters is 100% free."
      }
    ],
    "lastUpdated": "2026-06-30",
    "popularityScore": 80
  },
  {
    "id": "affordable-rental-housing",
    "name": "Affordable Rental Housing Complexes (ARHCs)",
    "shortDescription": "Ease of living for urban migrants and industrial workers through dignified affordable rental housing near workplaces.",
    "department": "Ministry of Housing and Urban Affairs",
    "ministry": "Ministry of Housing and Urban Affairs",
    "category": "Housing & Shelter",
    "state": "Central",
    "benefitsSummary": "Subsidized rental housing apartments with piped water, electricity, and security at low rents for urban workers.",
    "financialBenefitAmount": 36000,
    "eligibilityRules": {
      "minAge": 18,
      "maxAge": 70,
      "allowedGenders": [
        "All"
      ],
      "allowedStates": [
        "All"
      ],
      "maxAnnualIncome": 300000,
      "allowedOccupations": [
        "Industrial Worker",
        "Daily Wager",
        "Street Vendor",
        "Driver",
        "Security Guard"
      ],
      "requiredDocuments": [
        "Aadhaar",
        "Employment Proof"
      ]
    },
    "requiredDocuments": [
      "Aadhaar Card",
      "Employment ID / Letter from Employer",
      "Bank Passbook"
    ],
    "applicationSteps": [
      "Apply online on arhc.mohua.gov.in or through employer/concessionaire.",
      "Verification of urban migrant status.",
      "Allotment of rental unit on subsidized monthly lease."
    ],
    "officialApplyUrl": "https://arhc.mohua.gov.in/",
    "officialWebsite": "https://arhc.mohua.gov.in/",
    "helplineNumber": "011-23063285",
    "deadline": "Open All Year",
    "tags": [
      "ARHC",
      "Rental Housing",
      "Migrant Workers",
      "Affordable Rent"
    ],
    "faqs": [
      {
        "question": "Who is eligible for ARHC housing?",
        "answer": "Urban migrants, factory workers, street vendors, and low-wage service personnel."
      }
    ],
    "lastUpdated": "2026-07-15",
    "popularityScore": 82
  }
];
