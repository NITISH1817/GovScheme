/**
 * GovScheme AI — Boundary-Case Trust, Freshness & Deterministic Eligibility Verification Suite
 * 
 * Verifies:
 * 1. Age boundary conditions (exact threshold, boundary - 1, boundary + 1)
 * 2. Income limit boundaries (exact ceiling, ceiling + 1, zero income, missing income)
 * 3. State applicability (TN specific vs Central vs cross-state mismatch)
 * 4. Government domain validation & SSRF defense
 * 5. Data freshness classification (Recently verified, Verification due, Stale, Source unavailable)
 * 6. Standard 5-tier eligibility classifications and transparent disclaimers
 */

import { evaluateSchemeEligibility } from '../src/engine/ruleEngine';
import { isApprovedGovernmentDomain, evaluateSchemeFreshness, getDaysSinceDate } from '../src/services/dataFreshnessService';
import { Scheme, UserProfile } from '../src/types';

// Minimal mock user builder
function createMockUser(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    id: 'test-user-001',
    fullName: 'Test Citizen',
    email: 'citizen@govscheme.test',
    phoneNumber: '+91 9876543210',
    age: 25,
    gender: 'female',
    state: 'Tamil Nadu',
    district: 'Chennai',
    urbanRural: 'urban',
    annualIncome: 150000,
    educationLevel: 'Graduate',
    currentOccupation: 'Student',
    casteCategory: 'OBC',
    maritalStatus: 'unmarried',
    differentlyAbled: false,
    disabilityPercentage: 0,
    landHoldingAcres: 0,
    hasRationCard: true,
    rationCardType: 'PHH',
    documents: [],
    profileCompletionScore: 100,
    ...overrides
  };
}

// Minimal mock scheme builder
function createMockScheme(overrides: Partial<Scheme> = {}): Scheme {
  return {
    id: 'test-scheme-001',
    name: 'Tamil Nadu Higher Education Assistance Scheme',
    officialWebsite: 'https://umang.tn.gov.in',
    officialApplyUrl: 'https://umang.tn.gov.in/apply',
    sourceUrl: 'https://tnega.tn.gov.in',
    department: 'Higher Education Department',
    state: 'Tamil Nadu',
    category: 'Education & Learning',
    description: 'Financial assistance for female college students.',
    eligibilityRules: {
      minAge: 18,
      maxAge: 25,
      maxAnnualIncome: 250000,
      allowedGenders: ['female'],
      allowedStates: ['Tamil Nadu']
    },
    benefitType: 'Cash Grant',
    financialBenefit: '₹1,000 / month',
    dataVersion: '2026.1',
    eligibilityRulesVersion: '2026.1',
    lastVerifiedAt: new Date().toISOString(),
    ...overrides
  };
}

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    console.error(`  ✗ [FAIL] ${testName}`);
    if (details) console.error(`    Details: ${details}`);
  }
}

console.log('\n=============================================================');
console.log(' GOVSCHEME AI: TRUST, FRESHNESS & ELIGIBILITY VERIFICATION');
console.log('=============================================================\n');

// -------------------------------------------------------------
// 1. AGE BOUNDARY CONDITIONS
// -------------------------------------------------------------
console.log('--- 1. Age Boundary Thresholds ---');

const baseScheme = createMockScheme({
  eligibilityRules: {
    minAge: 18,
    maxAge: 35,
    allowedStates: ['Tamil Nadu']
  }
});

// Age boundary - 1 (17 years old) -> Must be INELIGIBLE
const user17 = createMockUser({ age: 17 });
const res17 = evaluateSchemeEligibility(user17, baseScheme);
assert(
  !res17.eligible && res17.classification === 'LIKELY_INELIGIBLE',
  'Underage applicant (17 on minAge 18) is classified LIKELY_INELIGIBLE',
  `Result: eligible=${res17.eligible}, class=${res17.classification}`
);

// Age exact min boundary (18 years old) -> Must be eligible
const user18 = createMockUser({ age: 18 });
const res18 = evaluateSchemeEligibility(user18, baseScheme);
assert(
  res18.eligible && (res18.classification === 'LIKELY_ELIGIBLE' || res18.classification === 'POSSIBLY_ELIGIBLE'),
  'Exact minAge boundary applicant (18 on minAge 18) is ELIGIBLE',
  `Result: eligible=${res18.eligible}, class=${res18.classification}`
);

// Age exact max boundary (35 years old) -> Must be eligible
const user35 = createMockUser({ age: 35 });
const res35 = evaluateSchemeEligibility(user35, baseScheme);
assert(
  res35.eligible && (res35.classification === 'LIKELY_ELIGIBLE' || res35.classification === 'POSSIBLY_ELIGIBLE'),
  'Exact maxAge boundary applicant (35 on maxAge 35) is ELIGIBLE',
  `Result: eligible=${res35.eligible}, class=${res35.classification}`
);

// Age boundary + 1 (36 years old) -> Must be INELIGIBLE
const user36 = createMockUser({ age: 36 });
const res36 = evaluateSchemeEligibility(user36, baseScheme);
assert(
  !res36.eligible && res36.classification === 'LIKELY_INELIGIBLE',
  'Overage applicant (36 on maxAge 35) is classified LIKELY_INELIGIBLE',
  `Result: eligible=${res36.eligible}, class=${res36.classification}`
);

// -------------------------------------------------------------
// 2. INCOME LIMIT BOUNDARIES
// -------------------------------------------------------------
console.log('\n--- 2. Income Limit Ceiling Boundaries ---');

const incomeScheme = createMockScheme({
  eligibilityRules: {
    maxAnnualIncome: 200000,
    allowedStates: ['Tamil Nadu']
  }
});

// Exact income ceiling (₹2,00,000) -> Must be eligible
const userExactIncome = createMockUser({ annualIncome: 200000 });
const resExactIncome = evaluateSchemeEligibility(userExactIncome, incomeScheme);
assert(
  resExactIncome.eligible,
  'Exact income ceiling (₹2,00,000 on limit ₹2,00,000) is ELIGIBLE',
  `Result: eligible=${resExactIncome.eligible}`
);

// ₹1 over ceiling (₹2,00,001) -> Must be INELIGIBLE
const userOverIncome = createMockUser({ annualIncome: 200001 });
const resOverIncome = evaluateSchemeEligibility(userOverIncome, incomeScheme);
assert(
  !resOverIncome.eligible && resOverIncome.classification === 'LIKELY_INELIGIBLE',
  '₹1 over income ceiling (₹2,00,001 on limit ₹2,00,000) is LIKELY_INELIGIBLE',
  `Result: eligible=${resOverIncome.eligible}, class=${resOverIncome.classification}`
);

// Zero income (₹0) -> Must be eligible for income-capped scheme
const userZeroIncome = createMockUser({ annualIncome: 0 });
const resZeroIncome = evaluateSchemeEligibility(userZeroIncome, incomeScheme);
assert(
  resZeroIncome.eligible,
  'Zero income applicant (₹0) is ELIGIBLE for income-capped welfare',
  `Result: eligible=${resZeroIncome.eligible}`
);

// Missing income in profile -> Classified as POSSIBLY_ELIGIBLE or INSUFFICIENT_INFORMATION with missing criteria noted
const userMissingIncome = createMockUser({ annualIncome: undefined });
const resMissingIncome = evaluateSchemeEligibility(userMissingIncome, incomeScheme);
assert(
  resMissingIncome.classification === 'POSSIBLY_ELIGIBLE' || resMissingIncome.classification === 'INSUFFICIENT_INFORMATION',
  'Citizen without recorded income gets POSSIBLY_ELIGIBLE or INSUFFICIENT_INFORMATION without false rejection',
  `Result: class=${resMissingIncome.classification}, missing=${JSON.stringify(resMissingIncome.missingInfo)}`
);

// -------------------------------------------------------------
// 3. STATE APPLICABILITY
// -------------------------------------------------------------
console.log('\n--- 3. State Applicability & Cross-State Defense ---');

const tnSpecificScheme = createMockScheme({
  state: 'Tamil Nadu',
  eligibilityRules: {
    allowedStates: ['Tamil Nadu']
  }
});

// Tamil Nadu resident evaluating Tamil Nadu scheme -> Match
const userTN = createMockUser({ state: 'Tamil Nadu' });
const resTN = evaluateSchemeEligibility(userTN, tnSpecificScheme);
assert(
  resTN.eligible,
  'Tamil Nadu resident is ELIGIBLE for Tamil Nadu State Scheme',
  `Result: eligible=${resTN.eligible}`
);

// Karnataka resident evaluating Tamil Nadu scheme -> INELIGIBLE
const userKA = createMockUser({ state: 'Karnataka' });
const resKA = evaluateSchemeEligibility(userKA, tnSpecificScheme);
assert(
  !resKA.eligible && resKA.classification === 'LIKELY_INELIGIBLE',
  'Karnataka resident is rejected with LIKELY_INELIGIBLE for Tamil Nadu exclusive scheme',
  `Result: eligible=${resKA.eligible}, class=${resKA.classification}`
);

// Central scheme evaluating any state resident -> Match
const centralScheme = createMockScheme({
  state: 'Central',
  eligibilityRules: {
    allowedStates: ['All India', 'Central', 'All']
  }
});
const resCentral = evaluateSchemeEligibility(userKA, centralScheme);
assert(
  resCentral.eligible,
  'Karnataka resident is ELIGIBLE for Central Government Scheme',
  `Result: eligible=${resCentral.eligible}`
);

// -------------------------------------------------------------
// 4. SSRF & DOMAIN WHITELISTING
// -------------------------------------------------------------
console.log('\n--- 4. Official Domain Verification & SSRF Defense ---');

const validGovDomains = [
  'https://myscheme.gov.in/schemes/pm-kisan',
  'https://swavlambancard.gov.in/apply-udid',
  'https://scholarships.gov.in/fresh',
  'https://tnega.tn.gov.in/citizen-services',
  'https://pmkisan.gov.in',
  'https://pmjay.gov.in',
  'https://kerala.gov.in/schemes',
  'https://proteantech.in/services'
];

for (const url of validGovDomains) {
  assert(
    isApprovedGovernmentDomain(url),
    `Approved government portal correctly verified: ${url}`
  );
}

const maliciousOrPrivateDomains = [
  'https://evil-phishing-gov.in.attacker.org/steal',
  'https://myscheme.fakegov.com',
  'https://fake-tn-gov.org',
  'http://169.254.169.254/latest/meta-data/', // AWS/GCP cloud metadata SSRF
  'http://127.0.0.1:5000/internal-admin',      // Loopback internal SSRF
  'http://localhost:3000',
  'javascript:alert(1)',
  ''
];

for (const url of maliciousOrPrivateDomains) {
  assert(
    !isApprovedGovernmentDomain(url),
    `Untrusted / suspicious / SSRF target correctly rejected: ${url || '(empty)'}`
  );
}

// -------------------------------------------------------------
// 5. DATA FRESHNESS & AUDIT ENGINE
// -------------------------------------------------------------
console.log('\n--- 5. Scheme Freshness Policy Engine ---');

const now = new Date();

// Recently verified (10 days ago) -> RECENTLY_VERIFIED
const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString();
const freshScheme = createMockScheme({ lastVerifiedAt: tenDaysAgo });
assert(
  evaluateSchemeFreshness(freshScheme) === 'RECENTLY_VERIFIED',
  'Scheme verified 10 days ago is categorized RECENTLY_VERIFIED'
);

// Verification due (60 days ago) -> VERIFICATION_DUE
const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString();
const dueScheme = createMockScheme({ lastVerifiedAt: sixtyDaysAgo });
assert(
  evaluateSchemeFreshness(dueScheme) === 'VERIFICATION_DUE',
  'Scheme verified 60 days ago is categorized VERIFICATION_DUE'
);

// Stale (120 days ago) -> STALE
const fourMonthsAgo = new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000).toISOString();
const staleScheme = createMockScheme({ lastVerifiedAt: fourMonthsAgo });
assert(
  evaluateSchemeFreshness(staleScheme) === 'STALE',
  'Scheme verified 120 days ago is categorized STALE'
);

// Missing portal link -> SOURCE_UNAVAILABLE
const unavailableScheme = createMockScheme({ officialApplyUrl: '#', officialWebsite: '' });
assert(
  evaluateSchemeFreshness(unavailableScheme) === 'SOURCE_UNAVAILABLE',
  'Scheme without functioning URL is categorized SOURCE_UNAVAILABLE'
);

// -------------------------------------------------------------
// 6. MANDATORY TRANSPARENT DISCLAIMER INCLUSION
// -------------------------------------------------------------
console.log('\n--- 6. Transparency Disclaimers & Grounded Sourcing ---');

const evalRes = evaluateSchemeEligibility(userTN, baseScheme);
assert(
  typeof evalRes.disclaimer === 'string' && evalRes.disclaimer.length > 20,
  'Every evaluation includes a non-binding advisory transparency disclaimer'
);
assert(
  typeof evalRes.classification === 'string',
  'Evaluation outputs standard 5-tier classification code'
);
assert(
  evalRes.officialSourceUrl === baseScheme.officialApplyUrl,
  'Evaluation anchors directly to official government source URL'
);

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------
console.log('\n=============================================================');
console.log(` RESULTS: ${passedTests} / ${totalTests} CHECKS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('=============================================================\n');

if (passedTests === totalTests) {
  console.log(' ALL TRUST, FRESHNESS & ELIGIBILITY VERIFICATIONS SUCCEEDED.\n');
  process.exit(0);
} else {
  console.error(` ✗ ${totalTests - passedTests} CHECKS FAILED.\n`);
  process.exit(1);
}

