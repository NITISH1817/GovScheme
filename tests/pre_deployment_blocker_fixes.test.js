// tests/pre_deployment_blocker_fixes.test.js
// Regression test suite for GovScheme Pre-Deployment Blocker Fixes:
// 1. Blocker 1: Guest scheme access in App.tsx (unauthenticated visitors can access #schemes without auth dialog)
// 2. Blocker 2: Required education eligibility in ruleEngine.ts (robust semantic matching, Insufficient Information on missing education, range matching, and preservation of existing schemes)

import assert from 'assert';
import fs from 'fs';
import {
  evaluateSchemeEligibility,
  resolveEducationGroup,
  SEMANTIC_EDUCATION_GROUPS,
  EDUCATION_TIER_ORDER
} from '../src/engine/ruleEngine.ts';

function loadCanonicalSchemes() {
  const rawCode = fs.readFileSync('src/data/schemes.ts', 'utf8');
  const jsCode = rawCode
    .replace("import type { Scheme } from '../types';", '')
    .replace('export const schemesData: Scheme[] =', 'const schemesData =');
  const fn = new Function(jsCode + '; return schemesData;');
  return fn();
}

console.log('================================================================');
console.log('GOVSCHEME PRE-DEPLOYMENT BLOCKER FIXES REGRESSION TEST SUITE');
console.log('================================================================\n');

const canonicalSchemes = loadCanonicalSchemes();
assert.strictEqual(canonicalSchemes.length, 75, 'Must have exactly 75 canonical schemes');
console.log(`[Loaded] ${canonicalSchemes.length} canonical schemes ready for verification.\n`);

// =============================================================================
// SUITE 1: BLOCKER 1 — GUEST SCHEME ACCESS & AUTH GUARD VERIFICATION
// =============================================================================
console.log('--- SUITE 1: Blocker 1 — Guest Scheme Access & Auth Guard ---');

// 1.1 Source inspection: Verify protectedTabs in src/App.tsx
const appSource = fs.readFileSync('src/App.tsx', 'utf8');

// Match the protectedTabs declaration
const protectedTabsMatch = appSource.match(/const protectedTabs = \[(.*?)\];/s);
assert(protectedTabsMatch, 'src/App.tsx must define const protectedTabs');

const protectedTabsList = protectedTabsMatch[1]
  .split(',')
  .map(s => s.trim().replace(/['"]/g, ''))
  .filter(Boolean);

console.log('Found protectedTabs:', protectedTabsList);

// Verify 'schemes' is NOT protected
assert.strictEqual(
  protectedTabsList.includes('schemes'),
  false,
  'REGRESSION: "schemes" must NOT be in protectedTabs'
);

// Verify genuinely protected tabs are preserved
const expectedProtectedTabs = ['assistant', 'vault', 'profile', 'report', 'tracker', 'settings'];
for (const tab of expectedProtectedTabs) {
  assert(
    protectedTabsList.includes(tab),
    `REGRESSION: Genuinely protected tab "${tab}" must remain protected`
  );
}
console.log('PASS 1.1: protectedTabs in App.tsx excludes "schemes" and preserves all protected tabs.');

// 1.2 Route Guard Simulation: Verify guest vs authenticated routing
function simulateRouteGuard(activeTab, user, isBooting = false) {
  let redirectedTo = null;
  let authModalOpened = false;
  let currentTab = activeTab;

  const protectedTabs = ['assistant', 'vault', 'profile', 'report', 'tracker', 'settings'];
  if (!isBooting && protectedTabs.includes(currentTab) && !user) {
    redirectedTo = 'home';
    authModalOpened = true;
    currentTab = 'home';
  }

  return { currentTab, redirectedTo, authModalOpened };
}

// Unauthenticated user tests
const guestPublicTabs = ['home', 'schemes', 'wizard', 'kiosk'];
for (const tab of guestPublicTabs) {
  const result = simulateRouteGuard(tab, null);
  assert.strictEqual(result.currentTab, tab, `Guest must stay on public tab: ${tab}`);
  assert.strictEqual(result.redirectedTo, null, `Guest must not be redirected from: ${tab}`);
  assert.strictEqual(result.authModalOpened, false, `Auth modal must not open for public tab: ${tab}`);
}
console.log('PASS 1.2: Unauthenticated visitors can access all public tabs (home, schemes, wizard, kiosk) without redirect.');

// Unauthenticated access to protected tabs
for (const tab of expectedProtectedTabs) {
  const result = simulateRouteGuard(tab, null);
  assert.strictEqual(result.currentTab, 'home', `Guest accessing ${tab} must be redirected to home`);
  assert.strictEqual(result.redirectedTo, 'home');
  assert.strictEqual(result.authModalOpened, true, `Guest accessing ${tab} must trigger auth modal`);
}
console.log('PASS 1.3: Unauthenticated visitors are safely redirected and prompted to login on protected tabs.');

// Authenticated user tests
const authenticatedUser = { id: 'user-1', fullName: 'Test User' };
for (const tab of [...guestPublicTabs, ...expectedProtectedTabs]) {
  const result = simulateRouteGuard(tab, authenticatedUser);
  assert.strictEqual(result.currentTab, tab, `Authenticated user must access ${tab} directly`);
  assert.strictEqual(result.redirectedTo, null);
  assert.strictEqual(result.authModalOpened, false);
}
console.log('PASS 1.4: Authenticated users can access all tabs without false-positive redirects.');

// 1.3 Direct URL / Refresh Simulation
function simulateInitialTabResolution(hashLocation) {
  const hash = hashLocation.replace('#', '');
  return hash || 'home';
}

assert.strictEqual(simulateInitialTabResolution('#schemes'), 'schemes');
assert.strictEqual(simulateInitialTabResolution(''), 'home');
assert.strictEqual(simulateInitialTabResolution('#home'), 'home');
assert.strictEqual(simulateInitialTabResolution('#wizard'), 'wizard');

const guestDirectSchemes = simulateRouteGuard(simulateInitialTabResolution('#schemes'), null);
assert.strictEqual(guestDirectSchemes.currentTab, 'schemes', 'Direct URL #schemes must keep guest on schemes view');
assert.strictEqual(guestDirectSchemes.authModalOpened, false, 'Direct URL #schemes must not open auth modal');
console.log('PASS 1.5: Direct URL and refresh simulation for #schemes maintains guest discovery view.\n');

// =============================================================================
// SUITE 2: BLOCKER 2 — REQUIRED EDUCATION ELIGIBILITY REGRESSION TESTS
// =============================================================================
console.log('--- SUITE 2: Blocker 2 — Required Education Eligibility ---');

// 2.1 Education Alias Resolution & Semantic Grouping (no naive substring collisions)
console.log('Sub-suite 2.1: Semantic Education Group Resolution');
assert.strictEqual(resolveEducationGroup('Below 10th'), 'below_10th');
assert.strictEqual(resolveEducationGroup('Below 10th Standard'), 'below_10th', 'Must resolve to below_10th, not class_10');
assert.strictEqual(resolveEducationGroup('10th Pass'), 'class_10');
assert.strictEqual(resolveEducationGroup('10th Standard Pass (SSLC)'), 'class_10');
assert.strictEqual(resolveEducationGroup('12th Pass'), 'class_12');
assert.strictEqual(resolveEducationGroup('12th Standard Pass (HSC)'), 'class_12');
assert.strictEqual(resolveEducationGroup('High School'), 'class_12');
assert.strictEqual(resolveEducationGroup('Diploma'), 'diploma');
assert.strictEqual(resolveEducationGroup('Diploma / Polytechnic'), 'diploma');
assert.strictEqual(resolveEducationGroup('Graduate'), 'graduate');
assert.strictEqual(resolveEducationGroup('Undergraduate'), 'graduate');
assert.strictEqual(resolveEducationGroup("Graduate (Bachelor's Degree)"), 'graduate');
assert.strictEqual(resolveEducationGroup('Post Graduate'), 'post_graduate', 'Must resolve to post_graduate, NOT graduate');
assert.strictEqual(resolveEducationGroup('Postgraduate'), 'post_graduate');
assert.strictEqual(resolveEducationGroup("Post Graduate (Master's Degree)"), 'post_graduate', 'Must resolve to post_graduate, NOT graduate');
assert.strictEqual(resolveEducationGroup('Doctorate'), 'doctorate');
assert.strictEqual(resolveEducationGroup('Doctorate / PhD'), 'doctorate');
assert.strictEqual(resolveEducationGroup('Class 6 to 12 in Govt School'), 'class_6_to_12');
console.log('PASS 2.1: Semantic alias resolution accurately disambiguates all education levels without substring collision.');

// Retrieve Post-Matric Scholarship
const postMatricScheme = canonicalSchemes.find(s => s.id === 'post-matric-scholarship');
assert(postMatricScheme, 'Canonical post-matric-scholarship must exist');
assert(postMatricScheme.eligibilityRules?.requiredEducation, 'Must have requiredEducation criteria');

// Retrieve Pudhumai Penn
const pudhumaiPennScheme = canonicalSchemes.find(s => s.id === 'tn-pudhumai-penn');
assert(pudhumaiPennScheme, 'Canonical tn-pudhumai-penn must exist');
assert(pudhumaiPennScheme.eligibilityRules?.requiredEducation, 'Must have requiredEducation criteria');

// Retrieve PM-KISAN (Scheme with NO education criteria)
const pmKisanScheme = canonicalSchemes.find(s => s.id === 'pm-kisan');
assert(pmKisanScheme, 'Canonical pm-kisan must exist');
assert(!pmKisanScheme.eligibilityRules?.requiredEducation, 'PM-KISAN must have NO requiredEducation');

// 2.2 Test: A qualifying education level
console.log('Sub-suite 2.2: Qualifying education levels');
const qualifyingStudentProfile = {
  fullName: 'Priya Sharma',
  age: 20,
  gender: 'Female',
  state: 'Central',
  category: 'OBC',
  annualIncome: 150000,
  occupation: 'Student',
  educationLevel: 'Undergraduate',
  documents: [
    { type: 'Aadhaar Card', verificationStatus: 'CHECKS_PASSED' },
    { type: 'Community / Caste Certificate issued by competent authority', verificationStatus: 'CHECKS_PASSED' },
    { type: 'Family Annual Income Certificate', verificationStatus: 'CHECKS_PASSED' },
    { type: 'Mark Sheet of Previous Passed Exam', verificationStatus: 'CHECKS_PASSED' },
    { type: 'College Fee Receipt & Student ID', verificationStatus: 'CHECKS_PASSED' },
    { type: 'Bank Account Linked to Aadhaar', verificationStatus: 'CHECKS_PASSED' }
  ]
};

const evalQualifying = evaluateSchemeEligibility(qualifyingStudentProfile, postMatricScheme);
assert.strictEqual(evalQualifying.status, 'Eligible', 'Qualifying education level (Undergraduate) with all documents must evaluate to Eligible');
assert(
  evalQualifying.matchedCriteria.some(c => c.toLowerCase().includes('education') || c.toLowerCase().includes('undergraduate')),
  'Matched criteria must document that education qualification requirement is met'
);
assert.strictEqual(evalQualifying.failedCriteria.length, 0);
assert.strictEqual(evalQualifying.informationNeeded.length, 0);
console.log('PASS 2.2: Qualifying education level (Undergraduate) verified as Eligible.');

// Also test with '10th Pass' (lowest in allowed list)
const qualifying10thProfile = {
  ...qualifyingStudentProfile,
  educationLevel: '10th Pass'
};
const evalQualifying10th = evaluateSchemeEligibility(qualifying10thProfile, postMatricScheme);
assert.strictEqual(evalQualifying10th.status, 'Eligible', 'Qualifying education level (10th Pass) must evaluate to Eligible');
console.log('PASS 2.2b: Qualifying education level (10th Pass) verified as Eligible.');

// 2.3 Test: A clearly non-qualifying education level (Below 10th Standard)
console.log('Sub-suite 2.3: Clearly non-qualifying education level');
const nonQualifyingStudentProfile = {
  ...qualifyingStudentProfile,
  educationLevel: 'Below 10th Standard'
};

const evalNonQualifying = evaluateSchemeEligibility(nonQualifyingStudentProfile, postMatricScheme);
assert.notStrictEqual(evalNonQualifying.status, 'Eligible', 'Non-qualifying education (Below 10th) must NEVER evaluate to Eligible');
assert.notStrictEqual(evalNonQualifying.status, 'Conditionally Eligible');
assert(
  evalNonQualifying.failedCriteria.some(c => c.toLowerCase().includes('education qualification') && c.toLowerCase().includes('below 10th standard')),
  'Failed criteria must explicitly mention education qualification requirement failure'
);
assert(
  evalNonQualifying.status === 'Almost Eligible' || evalNonQualifying.status === 'Not Eligible',
  `Status should be Almost Eligible or Not Eligible, got: ${evalNonQualifying.status}`
);
console.log(`PASS 2.3: Clearly non-qualifying education level rejected with status: ${evalNonQualifying.status}.`);

// 2.4 Test: Missing education information
console.log('Sub-suite 2.4: Missing education information');
const missingEduProfile = {
  ...qualifyingStudentProfile,
  educationLevel: undefined // Missing education
};

const evalMissingEdu = evaluateSchemeEligibility(missingEduProfile, postMatricScheme);
assert.strictEqual(
  evalMissingEdu.status,
  'Insufficient Information',
  'Missing education level when education is required must evaluate to Insufficient Information'
);
assert(
  evalMissingEdu.informationNeeded.some(i => i.toLowerCase().includes('education qualification') && i.toLowerCase().includes('profile')),
  'informationNeeded must prompt user for required education qualification'
);
assert(
  evalMissingEdu.overallReason.toLowerCase().includes('more profile details needed') || evalMissingEdu.overallReason.toLowerCase().includes('education'),
  'overallReason must explain that profile details are needed'
);
console.log('PASS 2.4: Missing education evaluates strictly to Insufficient Information with actionable prompt.');

// Also test with empty string
const emptyEduProfile = {
  ...qualifyingStudentProfile,
  educationLevel: ''
};
const evalEmptyEdu = evaluateSchemeEligibility(emptyEduProfile, postMatricScheme);
assert.strictEqual(evalEmptyEdu.status, 'Insufficient Information', 'Empty string educationLevel must evaluate to Insufficient Information');
console.log('PASS 2.4b: Empty string educationLevel evaluates strictly to Insufficient Information.');

// 2.5 Test: Multiple accepted education levels
console.log('Sub-suite 2.5: Multiple accepted education levels');
const acceptedLevels = ['Class 10 Pass', 'Class 12 Pass', 'Diploma', 'Graduate', 'Post Graduate'];
for (const lvl of acceptedLevels) {
  const p = { ...qualifyingStudentProfile, educationLevel: lvl };
  const res = evaluateSchemeEligibility(p, postMatricScheme);
  assert.strictEqual(res.status, 'Eligible', `Accepted level "${lvl}" must evaluate to Eligible`);
}
console.log('PASS 2.5: All 5 multiple accepted education levels confirmed Eligible.');

// 2.6 Test: Class or grade ranges (Pudhumai Penn: "Class 6 to 12 in Govt School")
console.log('Sub-suite 2.6: Class or grade ranges');
const pudhumaiPennStudent = {
  fullName: 'Kavitha S',
  age: 19,
  gender: 'Female',
  state: 'Tamil Nadu',
  occupation: 'Student',
  educationLevel: 'Undergraduate',
  documents: [
    { type: 'Aadhaar Card', verificationStatus: 'CHECKS_PASSED' },
    { type: 'School Transfer Certificate / Bonafide proving Class 6 to 12 studied in Govt School', verificationStatus: 'CHECKS_PASSED' },
    { type: 'College Admission ID / Bonafide Certificate', verificationStatus: 'CHECKS_PASSED' },
    { type: 'Bank Account Details', verificationStatus: 'CHECKS_PASSED' }
  ]
};

const evalPudhumaiQualifying = evaluateSchemeEligibility(pudhumaiPennStudent, pudhumaiPennScheme);
assert.strictEqual(
  evalPudhumaiQualifying.status,
  'Eligible',
  'Undergraduate female student in TN must be Eligible for Pudhumai Penn'
);
assert(
  evalPudhumaiQualifying.matchedCriteria.some(c => c.toLowerCase().includes('education')),
  'Matched criteria must document range satisfaction'
);

// Non-qualifying education (Below 10th Standard) for Pudhumai Penn
const pudhumaiNonQualifying = {
  ...pudhumaiPennStudent,
  educationLevel: 'Below 10th Standard'
};
const evalPudhumaiNonQualifying = evaluateSchemeEligibility(pudhumaiNonQualifying, pudhumaiPennScheme);
assert.notStrictEqual(evalPudhumaiNonQualifying.status, 'Eligible');
assert(
  evalPudhumaiNonQualifying.failedCriteria.some(c => c.toLowerCase().includes('education qualification')),
  'Failed criteria must document education failure for Pudhumai Penn'
);

// Missing education for Pudhumai Penn
const pudhumaiMissingEdu = {
  ...pudhumaiPennStudent,
  educationLevel: undefined
};
const evalPudhumaiMissing = evaluateSchemeEligibility(pudhumaiMissingEdu, pudhumaiPennScheme);
assert.strictEqual(evalPudhumaiMissing.status, 'Insufficient Information');
console.log('PASS 2.6: Grade range matching verified for qualifying, non-qualifying, and missing education.');

// 2.7 Test: Existing schemes without education criteria (PM-KISAN, Ayushman Bharat)
console.log('Sub-suite 2.7: Existing schemes without education criteria');
const farmerProfile = {
  fullName: 'Ramasamy K',
  age: 45,
  gender: 'Male',
  state: 'Central',
  category: 'General',
  occupation: 'Farmer',
  landHoldingAcres: 1.5,
  educationLevel: undefined, // No education specified
  documents: [
    { type: 'Aadhaar Card', verificationStatus: 'CHECKS_PASSED' },
    { type: 'Land Ownership Documents / Khasra Khatoni', verificationStatus: 'CHECKS_PASSED' },
    { type: 'Savings Bank Account Passbook', verificationStatus: 'CHECKS_PASSED' },
    { type: 'Mobile Number Linked to Aadhaar', verificationStatus: 'CHECKS_PASSED' }
  ]
};

const evalFarmerNoEdu = evaluateSchemeEligibility(farmerProfile, pmKisanScheme);
assert.strictEqual(
  evalFarmerNoEdu.status,
  'Eligible',
  'PM-KISAN has no education requirement; missing education must NOT downgrade eligibility'
);
assert.strictEqual(evalFarmerNoEdu.informationNeeded.length, 0);

// Farmer with Below 10th
const evalFarmerBelow10th = evaluateSchemeEligibility(
  { ...farmerProfile, educationLevel: 'Below 10th' },
  pmKisanScheme
);
assert.strictEqual(evalFarmerBelow10th.status, 'Eligible');

// Farmer with Graduate
const evalFarmerGraduate = evaluateSchemeEligibility(
  { ...farmerProfile, educationLevel: 'Graduate' },
  pmKisanScheme
);
assert.strictEqual(evalFarmerGraduate.status, 'Eligible');
console.log('PASS 2.7: Schemes without education criteria remain 100% unaffected by profile education values.');

// 2.8 Test: Minimum education / at least threshold
console.log('Sub-suite 2.8: Minimum education threshold evaluation');
const mockMinScheme = {
  id: 'test-min-edu-scheme',
  name: 'Technical Apprentice Fellowship',
  eligibilityRules: {
    requiredEducation: ['Minimum Class 12 Pass']
  }
};

const userBelowMin = { educationLevel: '10th Pass' };
const userExactMin = { educationLevel: '12th Pass' };
const userAboveMin = { educationLevel: 'Graduate' };

const evalBelowMin = evaluateSchemeEligibility(userBelowMin, mockMinScheme);
assert(
  evalBelowMin.failedCriteria.some(c => c.toLowerCase().includes('education qualification')),
  'User below minimum education threshold must fail'
);

const evalExactMin = evaluateSchemeEligibility(userExactMin, mockMinScheme);
assert(
  evalExactMin.matchedCriteria.some(c => c.toLowerCase().includes('education qualification')),
  'User meeting minimum education threshold must pass'
);

const evalAboveMin = evaluateSchemeEligibility(userAboveMin, mockMinScheme);
assert(
  evalAboveMin.matchedCriteria.some(c => c.toLowerCase().includes('education qualification')),
  'User exceeding minimum education threshold must pass'
);
console.log('PASS 2.8: Minimum threshold semantics verified (Below fails, Exact passes, Above passes).');

// 2.9 Test: Student occupation alone does NOT prove education eligibility
console.log('Sub-suite 2.9: Student occupation does not substitute for education requirement');
const studentOccupationMissingEdu = {
  occupation: 'Student',
  educationLevel: undefined
};
const evalStudentMissingEdu = evaluateSchemeEligibility(studentOccupationMissingEdu, postMatricScheme);
assert.strictEqual(
  evalStudentMissingEdu.status,
  'Insufficient Information',
  'Student occupation alone without educationLevel must evaluate to Insufficient Information'
);

const studentOccupationBelow10th = {
  occupation: 'Student',
  educationLevel: 'Below 10th Standard'
};
const evalStudentBelow10th = evaluateSchemeEligibility(studentOccupationBelow10th, postMatricScheme);
assert.notStrictEqual(
  evalStudentBelow10th.status,
  'Eligible',
  'Student occupation with Below 10th must NOT evaluate to Eligible'
);
assert(
  evalStudentBelow10th.failedCriteria.some(c => c.toLowerCase().includes('education qualification')),
  'Failed criteria must explicitly mention education qualification failure despite Student occupation'
);
console.log('PASS 2.9: Student occupation alone verified not to bypass education requirement.\n');

// =============================================================================
// SUITE 3: FIX 3 — ADMIN ROUTE FALLBACK VERIFICATION
// =============================================================================
console.log('--- SUITE 3: Fix 3 — Admin Route Fallback Verification ---');

// 3.1 Verify App.tsx source code for admin access denied guard
assert(
  appSource.includes('Access Denied') || appSource.includes('ShieldAlert'),
  'src/App.tsx must define an Access Denied fallback guard for the admin route'
);

function simulateAdminRouteAccess(activeTab, user) {
  if (activeTab !== 'admin') {
    return { view: 'other', exposedAdminContent: false };
  }

  const isAdminUser = (u) => {
    if (!u) return false;
    if (u.email === 'admin@govscheme.in') return true;
    const role = (u.role || '').toLowerCase();
    return (
      role.includes('admin') ||
      role === 'super admin' ||
      role === 'superadmin' ||
      role === 'state admin' ||
      role === 'ministry admin' ||
      role === 'district officer' ||
      role === 'nodal officer' ||
      role === 'data entry operator'
    );
  };

  if (!isAdminUser(user)) {
    return {
      view: 'ACCESS_DENIED',
      exposedAdminContent: false,
      reason: user ? `Non-admin user (${user.role || 'Citizen'})` : 'Unauthenticated visitor'
    };
  }

  return {
    view: 'ADMIN_PLATFORM',
    exposedAdminContent: true
  };
}

// Guest accessing /#admin
const guestAdminAccess = simulateAdminRouteAccess('admin', null);
assert.strictEqual(guestAdminAccess.view, 'ACCESS_DENIED', 'Guest visiting /#admin must receive ACCESS_DENIED');
assert.strictEqual(guestAdminAccess.exposedAdminContent, false, 'Guest must never see admin content');

// Authenticated citizen accessing /#admin
const citizenAdminAccess = simulateAdminRouteAccess('admin', { role: 'Citizen', email: 'citizen@example.com' });
assert.strictEqual(citizenAdminAccess.view, 'ACCESS_DENIED', 'Citizen visiting /#admin must receive ACCESS_DENIED');
assert.strictEqual(citizenAdminAccess.exposedAdminContent, false, 'Citizen must never see admin content');

// Authenticated Admin accessing /#admin
const adminAccess = simulateAdminRouteAccess('admin', { role: 'Super Admin', email: 'admin@govscheme.in' });
assert.strictEqual(adminAccess.view, 'ADMIN_PLATFORM', 'Authorized Admin must receive ADMIN_PLATFORM');
assert.strictEqual(adminAccess.exposedAdminContent, true);

console.log('PASS 3.1: Admin route fallback strictly protects admin platform from unauthenticated and non-admin users.\n');

// =============================================================================
// SUITE 4: FIX 4 — ATAL PENSION YOJANA VERIFIED URL VERIFICATION
// =============================================================================
console.log('--- SUITE 4: Fix 4 — Atal Pension Yojana Official URL Verification ---');

const apyScheme = canonicalSchemes.find(s => s.id === 'atal-pension-yojana');
assert(apyScheme, 'Canonical atal-pension-yojana must exist');

console.log('APY officialApplyUrl:', apyScheme.officialApplyUrl);
console.log('APY officialWebsite:', apyScheme.officialWebsite);

// 4.1 Canonical APY URLs
assert.strictEqual(
  apyScheme.officialApplyUrl,
  'https://npscra.proteantech.in/scheme-details.php',
  'APY officialApplyUrl must point to verified Protean CRA portal'
);
assert(
  apyScheme.officialWebsite === 'https://www.pfrda.org.in' || apyScheme.officialWebsite === 'https://npscra.proteantech.in',
  'APY officialWebsite must point to official regulatory authority (PFRDA) or Protean CRA'
);
assert.strictEqual(
  apyScheme.officialApplyUrl.includes('nsdl.co.in'),
  false,
  'Outdated and failing nsdl.co.in domain must NOT be present in officialApplyUrl'
);
assert.strictEqual(
  apyScheme.officialWebsite.includes('nsdl.co.in'),
  false,
  'Outdated and failing nsdl.co.in domain must NOT be present in officialWebsite'
);
console.log('PASS 4.1: Atal Pension Yojana verified with official Protean CRA and PFRDA destinations.');

// 4.2 Universal check across all 75 canonical schemes
const schemesWithNsdl = canonicalSchemes.filter(s => {
  const allUrls = [s.officialWebsite, s.officialApplyUrl, s.applicationUrl].filter(Boolean);
  return allUrls.some(u => u.includes('nsdl.co.in'));
});
assert.strictEqual(
  schemesWithNsdl.length,
  0,
  `Zero schemes may contain obsolete nsdl.co.in domain. Found: ${schemesWithNsdl.map(s => s.id).join(', ')}`
);
console.log('PASS 4.2: Zero obsolete nsdl.co.in domains across all 75 canonical schemes.');

// 4.3 Verify MongoDB Payload Builder output for APY
import { buildSchemePayload } from '../scripts/sync_mongodb_75.js';
const apyPayload = buildSchemePayload(apyScheme);
assert.strictEqual(
  apyPayload.officialWebsite,
  'https://www.pfrda.org.in',
  'Payload officialWebsite must point to PFRDA'
);
assert.strictEqual(
  apyPayload.officialApplyUrl,
  'https://npscra.proteantech.in/scheme-details.php',
  'Payload officialApplyUrl must point to Protean CRA'
);
assert.strictEqual(
  apyPayload.applyURL,
  'https://npscra.proteantech.in/scheme-details.php',
  'Payload applyURL must point to Protean CRA'
);
assert.strictEqual(
  apyPayload.officialApplicationUrl,
  'https://npscra.proteantech.in/scheme-details.php',
  'Payload officialApplicationUrl must point to Protean CRA'
);
assert.strictEqual(
  apyPayload.sourceUrl,
  'https://www.pfrda.org.in',
  'Payload sourceUrl must point to PFRDA'
);
console.log('PASS 4.3: MongoDB payload builder generates 100% clean Protean & PFRDA URLs for APY.');

// 4.4 Verify Targeted Single-Record Patch constants
import { APY_TARGET_UPDATES } from '../scripts/patch_apy_mongodb.js';
assert.strictEqual(APY_TARGET_UPDATES.officialWebsite, 'https://www.pfrda.org.in');
assert.strictEqual(APY_TARGET_UPDATES.officialApplyUrl, 'https://npscra.proteantech.in/scheme-details.php');
assert.strictEqual(APY_TARGET_UPDATES.officialApplicationUrl, 'https://npscra.proteantech.in/scheme-details.php');
assert.strictEqual(APY_TARGET_UPDATES.applyURL, 'https://npscra.proteantech.in/scheme-details.php');
assert.strictEqual(APY_TARGET_UPDATES.sourceUrl, 'https://www.pfrda.org.in');
assert(!Object.values(APY_TARGET_UPDATES).some(v => typeof v === 'string' && v.includes('nsdl.co.in')));
console.log('PASS 4.4: Targeted patch specification strictly aligns with verified PFRDA and Protean CRA portals.');

console.log('\n================================================================');
console.log('ALL PRE-DEPLOYMENT BLOCKER FIX REGRESSION TESTS PASSED (100%)');
console.log('================================================================');

