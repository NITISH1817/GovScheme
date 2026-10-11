// server/data/schemes_entrepreneur_finance.js
// 6 Entrepreneurship schemes + 6 Financial Help schemes (Total 12)
// Authoritative Government Schemes: Central & Tamil Nadu

export const entrepreneurshipSchemes = [
  {
    schemeId: "GOV-ENT-001",
    schemeName: "Prime Minister's Employment Generation Programme (PMEGP)",
    description: "Credit-linked subsidy programme aimed at generating self-employment opportunities through establishment of micro-enterprises in non-farm sector.",
    governmentLevel: "Central",
    ministry: "Ministry of Micro, Small and Medium Enterprises",
    department: "KVIC (Khadi and Village Industries Commission)",
    category: "Entrepreneurship",
    subcategory: "Micro Enterprises & Self-Employment",
    benefits: [
      "Government subsidy up to 35% of project cost in rural areas (25% in urban areas) for special categories (SC/ST/OBC/Minorities/Women/Ex-servicemen/PH)",
      "Bank finance up to 90-95% of project cost",
      "Maximum project cost ₹50 Lakhs for manufacturing sector and ₹20 Lakhs for service sector"
    ],
    benefitAmount: "Up to ₹50 Lakhs project cost with 15% to 35% margin money subsidy",
    benefitFrequency: "One-time capital subsidy",
    minimumAge: 18,
    maximumAge: 65,
    incomeLimit: null, // No family income ceiling
    eligibleOccupations: ["Aspiring Entrepreneur", "Artisan", "Unemployed Youth", "Self-Employed"],
    educationRequirements: "Minimum 8th standard pass for manufacturing projects above ₹10 Lakhs and service projects above ₹5 Lakhs",
    genderRequirements: "All",
    applicableSocialCategories: ["General", "OBC", "SC", "ST", "Minority"],
    disabilityRequirements: "All",
    studentRequirements: "No",
    farmerRequirements: "No",
    firstGraduateRequirements: "No",
    residenceRequirements: "Citizen of India",
    otherEligibilityRules: {
      newProjectsOnly: true,
      existingUnitsNotEligible: true,
      selfContributionPercentage: "5% for special categories, 10% for general category"
    },
    requiredDocuments: [
      "Aadhaar Card",
      "PAN Card",
      "Detailed Project Report (DPR)",
      "Educational Qualification Certificate (8th / 10th / Degree)",
      "Community / Caste Certificate (for subsidy margin)",
      "Rural Area Certificate from local authority (if applying under rural category)",
      "EDP Training Certificate (before loan disbursement)"
    ],
    applicationMode: "Online",
    applicationSteps: [
      "Register on the KVIC PMEGP e-Portal",
      "Fill online applicant details and upload DPR, photo, and identity documents",
      "Scorecard gets reviewed by District Task Force Committee (DTFC)",
      "Sanction by nominated financing bank",
      "Mandatory Entrepreneurship Development Programme (EDP) training",
      "Subsidy credited into Margin Money TDR account"
    ],
    officialWebsite: "https://www.kviconline.gov.in/pmegpeportal",
    officialApplicationUrl: "https://www.kviconline.gov.in/pmegpeportal/jsp/pmegponline.jsp",
    officialHelpline: "1800-180-6763",
    sourceUrl: "https://msme.gov.in/node/1484",
    lastVerifiedAt: new Date("2025-01-15"),
    verificationStatus: "Verified",
    activeStatus: true,
    keywords: ["PMEGP", "KVIC", "MSME", "loan subsidy", "business startup", "manufacturing loan", "rural industry"]
  },
  {
    schemeId: "GOV-ENT-002",
    schemeName: "Stand-Up India Scheme",
    description: "Facilitates bank loans between ₹10 lakh and ₹1 crore to at least one Scheduled Caste (SC) or Scheduled Tribe (ST) borrower and at least one woman borrower per bank branch for setting up greenfield enterprises.",
    governmentLevel: "Central",
    ministry: "Ministry of Finance",
    department: "Department of Financial Services / SIDBI",
    category: "Entrepreneurship",
    subcategory: "Inclusive Enterprise Credit",
    benefits: [
      "Bank composite loan (term loan + working capital) between ₹10 Lakhs and ₹1 Crore",
      "Margin money support up to 15% under convergence schemes",
      "Handholding support through Lead District Managers (LDM) and SIDBI"
    ],
    benefitAmount: "₹10,00,000 to ₹1,00,00,000 bank loan",
    benefitFrequency: "Loan facility repayable in 7 years with maximum moratorium period of 18 months",
    minimumAge: 18,
    maximumAge: 65,
    incomeLimit: null,
    eligibleOccupations: ["Aspiring Entrepreneur", "Business Owner"],
    educationRequirements: "Any",
    genderRequirements: "Women or SC/ST Male",
    applicableSocialCategories: ["SC", "ST", "Women of any category"],
    disabilityRequirements: "All",
    studentRequirements: "No",
    farmerRequirements: "No",
    firstGraduateRequirements: "No",
    residenceRequirements: "Citizen of India",
    otherEligibilityRules: {
      greenfieldOnly: true,
      inNonIndividualEnterprises: "At least 51% of the shareholding and controlling stake held by SC/ST and/or woman entrepreneur",
      borrowerNotDefaulter: true
    },
    requiredDocuments: [
      "Aadhaar Card",
      "PAN Card",
      "Proof of SC/ST category (if applicable)",
      "Project report with capital expenditure and operational budget",
      "Business address proof and lease agreement",
      "Bank statement for past 6 months"
    ],
    applicationMode: "Online / Bank Branch",
    applicationSteps: [
      "Access Stand-Up India portal (standupmitra.in)",
      "Register as borrower and select category (SC/ST/Woman)",
      "Choose preferred bank and branch",
      "Upload business project proposal",
      "Track processing and receive bank sanction"
    ],
    officialWebsite: "https://www.standupmitra.in",
    officialApplicationUrl: "https://www.standupmitra.in/Login/Register",
    officialHelpline: "1800-180-1111",
    sourceUrl: "https://financialservices.gov.in/beta/en/stand-up-india-scheme",
    lastVerifiedAt: new Date("2025-01-15"),
    verificationStatus: "Verified",
    activeStatus: true,
    keywords: ["Stand Up India", "SC ST business", "Women entrepreneur", "SIDBI", "greenfield loan", "1 crore loan"]
  },
  {
    schemeId: "GOV-ENT-003",
    schemeName: "Pradhan Mantri MUDRA Yojana (PMMY)",
    description: "Provides collateral-free institutional credit up to ₹20 lakh (expanded from ₹10 lakh in Budget 2024) to micro and small business enterprises in non-farm and non-corporate sectors under Shishu, Kishore, and Tarun categories.",
    governmentLevel: "Central",
    ministry: "Ministry of Finance",
    department: "Department of Financial Services",
    category: "Entrepreneurship",
    subcategory: "Collateral-Free Micro Credit",
    benefits: [
      "Shishu: Loans up to ₹50,000",
      "Kishore: Loans from ₹50,001 to ₹5,00,000",
      "Tarun / Tarun Plus: Loans from ₹5,00,001 up to ₹20,00,000 for entrepreneurs who previously successfully repaid",
      "No collateral or third-party guarantee required",
      "Affordable interest rates based on RBI/bank guidelines"
    ],
    benefitAmount: "Up to ₹20,00,000 collateral-free loan",
    benefitFrequency: "Loan facility with repayment tenure up to 5 years",
    minimumAge: 18,
    maximumAge: 65,
    incomeLimit: null,
    eligibleOccupations: ["Shopkeeper", "Vendor", "Artisan", "Micro Manufacturer", "Small Business Owner", "Self-Employed"],
    educationRequirements: "Any",
    genderRequirements: "All",
    applicableSocialCategories: ["General", "OBC", "SC", "ST", "Minority"],
    disabilityRequirements: "All",
    studentRequirements: "No",
    farmerRequirements: "No",
    firstGraduateRequirements: "No",
    residenceRequirements: "Citizen of India",
    otherEligibilityRules: {
      nonCorporateBusiness: true,
      nonFarmActivities: true,
      goodCreditRecord: true
    },
    requiredDocuments: [
      "Identity Proof (Aadhaar / Voter ID / Passport)",
      "Address Proof",
      "Business establishment license / registration / Udyam registration",
      "Quotation of machinery / raw material items to be purchased",
      "Bank statement of existing account (last 6 months)"
    ],
    applicationMode: "Online via UdyamiMitra / Any Bank Branch",
    applicationSteps: [
      "Choose MUDRA category (Shishu, Kishore, or Tarun)",
      "Apply through Udyamimitra portal or visit any public/private commercial bank or NBFC",
      "Submit loan application form with business proposal and identity proof",
      "Bank assesses viability and issues MUDRA Card / disburses loan"
    ],
    officialWebsite: "https://www.mudra.org.in",
    officialApplicationUrl: "https://www.udyamimitra.in",
    officialHelpline: "1800-180-1111",
    sourceUrl: "https://www.mudra.org.in/Offerings",
    lastVerifiedAt: new Date("2025-01-15"),
    verificationStatus: "Verified",
    activeStatus: true,
    keywords: ["MUDRA", "Shishu", "Kishore", "Tarun", "PMMY", "collateral free loan", "small business loan"]
  },
  {
    schemeId: "GOV-ENT-004",
    schemeName: "Tamil Nadu New Entrepreneur-cum-Enterprise Development Scheme (NEEDS)",
    description: "Flagship Tamil Nadu state government scheme assisting educated youth to become first-generation entrepreneurs by providing capital subsidy and interest subvention for setting up manufacturing and service enterprises.",
    governmentLevel: "State",
    state: "Tamil Nadu",
    ministry: "Government of Tamil Nadu",
    department: "Micro, Small and Medium Enterprises Department",
    category: "Entrepreneurship",
    subcategory: "First Generation Youth Entrepreneurs",
    benefits: [
      "25% capital subsidy on project cost with a ceiling of ₹75 Lakhs",
      "3% interest subvention for the entire loan repayment tenure",
      "State-sponsored Entrepreneurship Development Programme (EDP) training",
      "Eligible project costs from ₹10 Lakhs up to ₹5 Crores"
    ],
    benefitAmount: "25% subsidy up to ₹75,00,000 + 3% interest subvention",
    benefitFrequency: "One-time capital subsidy with ongoing interest subvention",
    minimumAge: 21,
    maximumAge: 35, // Relaxed to 45 years for SC/ST/BC/MBC/Minority/Women/Ex-servicemen/Transgenders/Differently Abled
    incomeLimit: null,
    eligibleOccupations: ["Aspiring Entrepreneur", "First Generation Entrepreneur", "Graduates"],
    educationRequirements: "Any Degree / Diploma / ITI / Vocational Training from a recognized institution",
    genderRequirements: "All",
    applicableSocialCategories: ["General", "OBC", "SC", "ST", "Minority"],
    disabilityRequirements: "All",
    studentRequirements: "No",
    farmerRequirements: "No",
    firstGraduateRequirements: "No",
    residenceRequirements: "Resident of Tamil Nadu for minimum 3 years",
    otherEligibilityRules: {
      firstGenerationEntrepreneur: true,
      promoterContribution: "10% for general, 5% for special categories",
      mustBeNewEnterprise: true
    },
    requiredDocuments: [
      "Aadhaar Card",
      "Proof of Nativity / Residence in Tamil Nadu",
      "Educational Certificate (Degree / Diploma / ITI marksheet)",
      "Community Certificate",
      "Project Report with cost of plant, machinery, and working capital",
      "Passport size photo"
    ],
    applicationMode: "Online",
    applicationSteps: [
      "Apply through the MSME Tamil Nadu online portal (msmeonline.tn.gov.in)",
      "Select NEEDS scheme and upload project report and educational records",
      "Application screened by District Level Task Force Committee headed by District Collector",
      "Interview and provisional selection",
      "Complete mandatory 25-day EDP training by EDII-TN",
      "Bank sanction and subsidy release by DIC"
    ],
    officialWebsite: "https://msmeonline.tn.gov.in/needs",
    officialApplicationUrl: "https://msmeonline.tn.gov.in/needs/newuser.php",
    officialHelpline: "044-22501494",
    sourceUrl: "https://msmeonline.tn.gov.in/needs/about_needs.php",
    lastVerifiedAt: new Date("2025-01-15"),
    verificationStatus: "Verified",
    activeStatus: true,
    keywords: ["NEEDS", "Tamil Nadu MSME", "EDII", "first generation entrepreneur", "capital subsidy", "DIC loan"]
  },
  {
    schemeId: "GOV-ENT-005",
    schemeName: "PM Formalisation of Micro Food Processing Enterprises (PM FME)",
    description: "Centrally sponsored scheme designed to enhance the competitiveness of existing individual micro-enterprises in the unorganized food processing sector and support Farmer Producer Organizations (FPOs), SHGs, and producer cooperatives.",
    governmentLevel: "Central",
    ministry: "Ministry of Food Processing Industries (MoFPI)",
    department: "National Institute of Food Technology Entrepreneurship and Management",
    category: "Entrepreneurship",
    subcategory: "Food Processing Industry",
    benefits: [
      "Credit-linked capital subsidy at 35% of eligible project cost with a maximum ceiling of ₹10 Lakhs per micro food processing unit",
      "Seed capital of ₹40,000 per member of SHG for working capital and small tools",
      "Support for common infrastructure and branding/marketing"
    ],
    benefitAmount: "35% subsidy up to ₹10,00,000 per enterprise",
    benefitFrequency: "One-time capital subsidy",
    minimumAge: 18,
    maximumAge: 65,
    incomeLimit: null,
    eligibleOccupations: ["Food Processor", "Baker", "Pickle Manufacturer", "Oil Mill Operator", "Dairy Farmer", "SHG Member"],
    educationRequirements: "Minimum 8th standard pass preferred",
    genderRequirements: "All",
    applicableSocialCategories: ["General", "OBC", "SC", "ST", "Minority"],
    disabilityRequirements: "All",
    studentRequirements: "No",
    farmerRequirements: "No",
    firstGraduateRequirements: "No",
    residenceRequirements: "Citizen of India",
    otherEligibilityRules: {
      foodProcessingSectorOnly: true,
      oneDistrictOneProductAlignment: "Priority given to ODOP products identified for the district"
    },
    requiredDocuments: [
      "Aadhaar Card",
      "PAN Card",
      "Bank passbook / statement",
      "Proof of enterprise existence (FSSAI license / electricity bill / Udhyam)",
      "Project proposal for expansion / technology upgradation",
      "Quotation of machinery"
    ],
    applicationMode: "Online",
    applicationSteps: [
      "Register on the PMFME MIS portal (pmfme.mofpi.gov.in)",
      "Submit application with District Resource Person (DRP) assistance",
      "State Nodal Agency examines and recommends to chosen bank",
      "Bank inspects unit and sanctions loan",
      "Subsidy released into beneficiary loan account"
    ],
    officialWebsite: "https://pmfme.mofpi.gov.in",
    officialApplicationUrl: "https://pmfme.mofpi.gov.in/pmfme/#/login",
    officialHelpline: "1800-111-555",
    sourceUrl: "https://mofpi.gov.in/pmfme",
    lastVerifiedAt: new Date("2025-01-15"),
    verificationStatus: "Verified",
    activeStatus: true,
    keywords: ["PMFME", "food processing", "ODOP", "pickle maker", "oil extraction", "MoFPI", "SHG food business"]
  },
  {
    schemeId: "GOV-ENT-006",
    schemeName: "Startup India Seed Fund Scheme (SISFS)",
    description: "Provides financial assistance to DPIIT-recognized startups for proof of concept, prototype development, product trials, market entry, and commercialization through registered incubators.",
    governmentLevel: "Central",
    ministry: "Ministry of Commerce and Industry",
    department: "Department for Promotion of Industry and Internal Trade (DPIIT)",
    category: "Entrepreneurship",
    subcategory: "Tech Startups & Innovation",
    benefits: [
      "Grant up to ₹20 Lakhs for validation of Proof of Concept, or prototype development, or product trials",
      "Debt investment or convertible debentures up to ₹50 Lakhs for market entry, commercialization, or scaling up",
      "Incubator mentoring, workspace, and investor networking"
    ],
    benefitAmount: "Up to ₹20 Lakhs (Grant) or up to ₹50 Lakhs (Debt/Convertible)",
    benefitFrequency: "Milestone-based disbursement",
    minimumAge: 18,
    maximumAge: 70,
    incomeLimit: null,
    eligibleOccupations: ["Startup Founder", "Innovator", "Tech Entrepreneur"],
    educationRequirements: "Any",
    genderRequirements: "All",
    applicableSocialCategories: ["General", "OBC", "SC", "ST", "Minority"],
    disabilityRequirements: "All",
    studentRequirements: "No",
    farmerRequirements: "No",
    firstGraduateRequirements: "No",
    residenceRequirements: "Citizen of India",
    otherEligibilityRules: {
      dpiitRecognitionRequired: true,
      incorporatedLessThanTwoYears: true,
      innovativeTechnologyOrBusinessModel: true,
      shouldNotHaveReceivedMoreThan10LakhMonetarySupport: true
    },
    requiredDocuments: [
      "DPIIT Startup Recognition Certificate",
      "Certificate of Incorporation (MCA)",
      "Pitch Deck / Business Plan",
      "Founders' Aadhaar and PAN Cards",
      "Company Bank Account Details"
    ],
    applicationMode: "Online",
    applicationSteps: [
      "Obtain DPIIT Recognition through Startup India portal",
      "Login to Seed Fund Portal (seedfund.startupindia.gov.in)",
      "Select up to 3 incubators in order of preference",
      "Submit application with problem statement, solution, and fund requirement",
      "Incubator evaluation committee conducts pitch presentation and sanctions funds"
    ],
    officialWebsite: "https://seedfund.startupindia.gov.in",
    officialApplicationUrl: "https://seedfund.startupindia.gov.in/apply",
    officialHelpline: "1800-115-565",
    sourceUrl: "https://www.startupindia.gov.in/content/sih/en/signature_initiatives/seed-fund-scheme.html",
    lastVerifiedAt: new Date("2025-01-15"),
    verificationStatus: "Verified",
    activeStatus: true,
    keywords: ["Startup India", "Seed Fund", "SISFS", "DPIIT", "prototype grant", "incubator funding", "innovation"]
  }
];

export const financialHelpSchemes = [
  {
    schemeId: "GOV-FIN-001",
    schemeName: "Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)",
    description: "One-year life insurance scheme renewable from year to year offering life cover for death due to any reason at an extremely affordable premium of ₹436 per annum.",
    governmentLevel: "Central",
    ministry: "Ministry of Finance",
    department: "Department of Financial Services",
    category: "Financial Help",
    subcategory: "Affordable Life Insurance",
    benefits: [
      "₹2,00,000 death benefit payable to nominee in case of death of the insured member due to any cause",
      "Extremely affordable premium of ₹436 per annum auto-debited from bank/post office savings account"
    ],
    benefitAmount: "₹2,00,000 life insurance cover",
    benefitFrequency: "Annual coverage (1st June to 31st May)",
    minimumAge: 18,
    maximumAge: 50,
    incomeLimit: null,
    eligibleOccupations: ["All Occupations", "Unorganized Worker", "Farmer", "Domestic Worker", "Salaried"],
    educationRequirements: "None",
    genderRequirements: "All",
    applicableSocialCategories: ["General", "OBC", "SC", "ST", "Minority"],
    disabilityRequirements: "All",
    studentRequirements: "No",
    farmerRequirements: "No",
    firstGraduateRequirements: "No",
    residenceRequirements: "Citizen of India",
    otherEligibilityRules: {
      mustHaveActiveSavingsBankOrPostOfficeAccount: true,
      autoDebitConsentRequired: true
    },
    requiredDocuments: [
      "Aadhaar Card",
      "Active Savings Bank Account Passbook",
      "Nominee Details (Aadhaar & Relationship)"
    ],
    applicationMode: "Bank Branch / Net Banking / India Post",
    applicationSteps: [
      "Visit home bank branch or log in to internet/mobile banking",
      "Fill PMJJBY consent-cum-declaration form designating nominee",
      "Provide consent for auto-debit of ₹436 annual premium",
      "Receive policy Certificate of Insurance via SMS/Email"
    ],
    officialWebsite: "https://financialservices.gov.in/beta/en/pmjjby",
    officialApplicationUrl: "https://www.jansuraksha.gov.in",
    officialHelpline: "1800-180-1111",
    sourceUrl: "https://financialservices.gov.in/beta/en/pmjjby",
    lastVerifiedAt: new Date("2025-01-15"),
    verificationStatus: "Verified",
    activeStatus: true,
    keywords: ["PMJJBY", "life insurance", "Jansuraksha", "436 premium", "death benefit", "social security"]
  },
  {
    schemeId: "GOV-FIN-002",
    schemeName: "Pradhan Mantri Suraksha Bima Yojana (PMSBY)",
    description: "One-year accidental insurance scheme renewable from year to year offering coverage for accidental death and permanent disability at a nominal premium of ₹20 per year.",
    governmentLevel: "Central",
    ministry: "Ministry of Finance",
    department: "Department of Financial Services",
    category: "Financial Help",
    subcategory: "Accidental Insurance",
    benefits: [
      "₹2,00,000 for accidental death or permanent total disability (loss of both eyes or loss of use of both hands or feet)",
      "₹1,00,000 for permanent partial disability (loss of one eye or loss of use of one hand or foot)",
      "Unmatched annual premium of just ₹20 per year"
    ],
    benefitAmount: "₹2,00,000 (Death/Permanent Total Disability) or ₹1,00,000 (Partial Disability)",
    benefitFrequency: "Annual coverage (1st June to 31st May)",
    minimumAge: 18,
    maximumAge: 70,
    incomeLimit: null,
    eligibleOccupations: ["All Occupations", "Daily Wage Earner", "Driver", "Construction Worker", "Farmer"],
    educationRequirements: "None",
    genderRequirements: "All",
    applicableSocialCategories: ["General", "OBC", "SC", "ST", "Minority"],
    disabilityRequirements: "All",
    studentRequirements: "No",
    farmerRequirements: "No",
    firstGraduateRequirements: "No",
    residenceRequirements: "Citizen of India",
    otherEligibilityRules: {
      mustHaveActiveSavingsBankOrPostOfficeAccount: true,
      autoDebitConsentRequired: true
    },
    requiredDocuments: [
      "Aadhaar Card",
      "Savings Bank Account Passbook",
      "Nominee Details"
    ],
    applicationMode: "Bank Branch / Net Banking / India Post",
    applicationSteps: [
      "Visit the bank branch where you maintain a savings account",
      "Fill PMSBY enrollment form giving nominee name and address",
      "Authorize auto-debit of ₹20 from savings balance",
      "Acknowledgment receipt issued immediately"
    ],
    officialWebsite: "https://financialservices.gov.in/beta/en/pmsby",
    officialApplicationUrl: "https://www.jansuraksha.gov.in",
    officialHelpline: "1800-180-1111",
    sourceUrl: "https://financialservices.gov.in/beta/en/pmsby",
    lastVerifiedAt: new Date("2025-01-15"),
    verificationStatus: "Verified",
    activeStatus: true,
    keywords: ["PMSBY", "accidental insurance", "disability cover", "20 rupee premium", "Jansuraksha"]
  },
  {
    schemeId: "GOV-FIN-003",
    schemeName: "Atal Pension Yojana (APY)",
    description: "Guaranteed pension scheme administered by PFRDA aimed at unorganized sector workers, providing a fixed monthly pension ranging from ₹1,000 to ₹5,000 upon reaching age 60.",
    governmentLevel: "Central",
    ministry: "Ministry of Finance",
    department: "Pension Fund Regulatory and Development Authority (PFRDA)",
    category: "Financial Help",
    subcategory: "Old Age Pension & Social Security",
    benefits: [
      "Guaranteed monthly pension of ₹1,000, ₹2,00, ₹3,000, ₹4,000, or ₹5,000 from age 60 until death",
      "Same pension amount continues to the spouse upon demise of subscriber",
      "Accumulated corpus returned to the nominee after demise of both subscriber and spouse"
    ],
    benefitAmount: "₹1,000 to ₹5,000 per month guaranteed lifetime pension",
    benefitFrequency: "Monthly pension after age 60",
    minimumAge: 18,
    maximumAge: 40,
    incomeLimit: null,
    eligibleOccupations: ["Unorganized Worker", "Self-Employed", "Daily Wage Earner", "Artisan", "Driver"],
    educationRequirements: "None",
    genderRequirements: "All",
    applicableSocialCategories: ["General", "OBC", "SC", "ST", "Minority"],
    disabilityRequirements: "All",
    studentRequirements: "No",
    farmerRequirements: "No",
    firstGraduateRequirements: "No",
    residenceRequirements: "Citizen of India",
    otherEligibilityRules: {
      notIncomeTaxPayer: true, // Non-taxpayers only as per rules effective Oct 2022
      mustHaveActiveSavingsBankOrPostOfficeAccount: true
    },
    requiredDocuments: [
      "Aadhaar Card",
      "Active Savings Bank Account Passbook",
      "Mobile number linked to bank account",
      "Spouse and Nominee details"
    ],
    applicationMode: "Bank Branch / Net Banking / Post Office",
    applicationSteps: [
      "Visit bank or post office where you hold a savings account",
      "Fill APY Registration Form selecting desired pension tier (₹1,000 to ₹5,000)",
      "Set auto-debit frequency (monthly, quarterly, half-yearly)",
      "PRAN (Permanent Retirement Account Number) card issued"
    ],
    officialWebsite: "https://www.npscra.nsdl.co.in/scheme-details.php",
    officialApplicationUrl: "https://enps.nsdl.com/eNPS/ApySubRegistration.html",
    officialHelpline: "1800-110-069",
    sourceUrl: "https://pfrda.org.in/index1.cshtml?lsid=106",
    lastVerifiedAt: new Date("2025-01-15"),
    verificationStatus: "Verified",
    activeStatus: true,
    keywords: ["Atal Pension", "APY", "PFRDA", "unorganized pension", "guaranteed retirement", "monthly pension"]
  },
  {
    schemeId: "GOV-FIN-004",
    schemeName: "Indira Gandhi National Old Age Pension Scheme (IGNOAPS)",
    description: "Centrally sponsored social assistance programme under NSAP providing monthly financial assistance to senior citizens living below the poverty line.",
    governmentLevel: "Central",
    ministry: "Ministry of Rural Development",
    department: "National Social Assistance Programme (NSAP)",
    category: "Financial Help",
    subcategory: "BPL Senior Citizen Assistance",
    benefits: [
      "Monthly pension of ₹1,000 per month (combined central NSAP assistance + Tamil Nadu state top-up through OAP scheme)",
      "Direct DBT transfer into beneficiary bank or post office account"
    ],
    benefitAmount: "₹1,000 per month",
    benefitFrequency: "Monthly direct bank transfer",
    minimumAge: 60,
    maximumAge: 120,
    incomeLimit: 100000, // Below Poverty Line / BPL Card holder
    eligibleOccupations: ["Retired", "Elderly", "Homemaker", "Destitute"],
    educationRequirements: "None",
    genderRequirements: "All",
    applicableSocialCategories: ["General", "OBC", "SC", "ST", "Minority"],
    disabilityRequirements: "All",
    studentRequirements: "No",
    farmerRequirements: "No",
    firstGraduateRequirements: "No",
    residenceRequirements: "Resident of India / Tamil Nadu",
    otherEligibilityRules: {
      bplCategory: true,
      destituteOrNoRegularSourceOfIncome: true
    },
    requiredDocuments: [
      "Aadhaar Card",
      "Age Proof / Birth Certificate / Voter ID",
      "Ration Card / BPL Card / PHH Card",
      "Income Certificate from Village Administrative Officer (VAO) / Tahsildar",
      "Bank Account Passbook"
    ],
    applicationMode: "e-Sevai Centre / Tahsildar Office / Umang App",
    applicationSteps: [
      "Apply through nearest e-Sevai centre or e-District TN portal",
      "Upload age proof, income certificate, and ration card",
      "Field verification conducted by Village Administrative Officer (VAO) and Revenue Inspector (RI)",
      "Approval by Special Tahsildar (Social Security Schemes)",
      "Pension credited every month"
    ],
    officialWebsite: "https://nsap.nic.in",
    officialApplicationUrl: "https://tnesevai.tn.gov.in",
    officialHelpline: "1800-425-1333",
    sourceUrl: "https://nsap.nic.in/schemes.html",
    lastVerifiedAt: new Date("2025-01-15"),
    verificationStatus: "Verified",
    activeStatus: true,
    keywords: ["IGNOAPS", "OAP", "old age pension", "NSAP", "senior citizen welfare", "BPL pension"]
  },
  {
    schemeId: "GOV-FIN-005",
    schemeName: "Tamil Nadu Maintenance Allowance for Differently Abled Persons",
    description: "Tamil Nadu state government social security scheme granting monthly maintenance allowance to persons with severe disabilities, muscular dystrophy, and intellectual disabilities.",
    governmentLevel: "State",
    state: "Tamil Nadu",
    ministry: "Government of Tamil Nadu",
    department: "Welfare of Differently Abled Persons Department",
    category: "Financial Help",
    subcategory: "Disability Financial Assistance",
    benefits: [
      "Monthly maintenance allowance of ₹2,000 per month (enhanced from ₹1,500) disbursed directly through DBT",
      "Free bus passes and assistive devices support"
    ],
    benefitAmount: "₹2,000 per month",
    benefitFrequency: "Monthly direct bank transfer",
    minimumAge: 0,
    maximumAge: 100,
    incomeLimit: null, // No income ceiling for 75%+ or intellectual disabilities in TN
    eligibleOccupations: ["Any"],
    educationRequirements: "None",
    genderRequirements: "All",
    applicableSocialCategories: ["General", "OBC", "SC", "ST", "Minority"],
    disabilityRequirements: "Yes (40% or more disability, or severe / intellectual / muscular dystrophy)",
    studentRequirements: "No",
    farmerRequirements: "No",
    firstGraduateRequirements: "No",
    residenceRequirements: "Resident of Tamil Nadu",
    otherEligibilityRules: {
      differentlyAbledCertificate: true,
      minimumDisabilityPercentage: 40
    },
    requiredDocuments: [
      "National Disability ID (UDID Card) or State Disability Identity Card",
      "Aadhaar Card",
      "Ration Card / Smart Card",
      "Bank Account Passbook (single or joint with guardian)",
      "Medical Board Certificate showing percentage of disability"
    ],
    applicationMode: "District Differently Abled Welfare Office (DDAWO) / e-Sevai",
    applicationSteps: [
      "Obtain UDID / Medical Disability Certificate from Government District Headquarters Hospital",
      "Submit application at District Differently Abled Welfare Officer (DDAWO) in District Collectorate or via e-Sevai",
      "Verification by rehabilitation officer",
      "Sanction order issued and monthly ₹2,000 credited to bank account"
    ],
    officialWebsite: "https://www.scd.tn.gov.in",
    officialApplicationUrl: "https://tnesevai.tn.gov.in",
    officialHelpline: "1800-425-0111",
    sourceUrl: "https://cms.tn.gov.in/sites/default/files/go/welfare_pwd_e_4_2022.pdf",
    lastVerifiedAt: new Date("2025-01-15"),
    verificationStatus: "Verified",
    activeStatus: true,
    keywords: ["Disability allowance", "Tamil Nadu UDID", "DDAWO", "maintenance allowance", "differently abled", "PWD financial help"]
  },
  {
    schemeId: "GOV-FIN-006",
    schemeName: "Pradhan Mantri Shram Yogi Maan-dhan (PM-SYM)",
    description: "Voluntary and contributory pension scheme for unorganized workers like street vendors, domestic workers, rickshaw pullers, and agricultural laborers ensuring old age protection.",
    governmentLevel: "Central",
    ministry: "Ministry of Labour and Employment",
    department: "Directorate General Labour Welfare",
    category: "Financial Help",
    subcategory: "Unorganized Worker Pension",
    benefits: [
      "Guaranteed monthly pension of ₹3,000 on attaining age 60",
      "50% matching contribution paid by Central Government into beneficiary pension account",
      "Family pension of 50% (₹1,500/month) to spouse upon subscriber's death"
    ],
    benefitAmount: "₹3,000 per month guaranteed pension",
    benefitFrequency: "Monthly pension after age 60",
    minimumAge: 18,
    maximumAge: 40,
    incomeLimit: 180000, // Monthly income ₹15,000 or below (₹1,80,000/year)
    eligibleOccupations: ["Street Vendor", "Rickshaw Puller", "Construction Worker", "Agricultural Laborer", "Domestic Worker", "Handloom Worker"],
    educationRequirements: "None",
    genderRequirements: "All",
    applicableSocialCategories: ["General", "OBC", "SC", "ST", "Minority"],
    disabilityRequirements: "All",
    studentRequirements: "No",
    farmerRequirements: "No",
    firstGraduateRequirements: "No",
    residenceRequirements: "Citizen of India",
    otherEligibilityRules: {
      notCoveredUnderNPSOrESICOrEPFO: true,
      notAnIncomeTaxPayer: true
    },
    requiredDocuments: [
      "Aadhaar Card",
      "Savings Bank Account / Jan Dhan Account with IFSC",
      "Mobile Number"
    ],
    applicationMode: "Common Services Centres (CSC) / Online Maandhan Portal",
    applicationSteps: [
      "Visit any Common Service Centre (CSC) or visit maandhan.in",
      "Provide Aadhaar and Bank account details for e-KYC verification",
      "First monthly contribution (₹55 to ₹200 depending on entry age) paid in cash at CSC",
      "Auto-debit mandate signed",
      "Shram Yogi Pension Card generated immediately with unique SYM number"
    ],
    officialWebsite: "https://maandhan.in",
    officialApplicationUrl: "https://maandhan.in/shramyogi",
    officialHelpline: "1800-267-6888",
    sourceUrl: "https://labour.gov.in/pm-sym",
    lastVerifiedAt: new Date("2025-01-15"),
    verificationStatus: "Verified",
    activeStatus: true,
    keywords: ["PM-SYM", "Shram Yogi", "unorganized workers pension", "3000 pension", "CSC", "labour welfare"]
  }
];
