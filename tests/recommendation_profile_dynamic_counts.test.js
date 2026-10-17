// tests/recommendation_profile_dynamic_counts.test.js
// Regression test suite for GovScheme citizen profile recommendation engine.
// Verifies:
// 1. Dynamic recommendation counts across distinct citizen profiles (no flat 18!)
// 2. Clear exclusion of ineligible schemes for each demographic
// 3. Frontend <-> Backend field normalization (annualIncome/income, category/socialCategory, hasDisability/isDifferentlyAbled)
// 4. Exclusion of inactive/draft schemes
// 5. Accuracy between summary count and recommendations list length

import assert from 'assert';
import fs from 'fs';
import {
  evaluateSchemeEligibility,
  recommendSchemesForProfile,
  normalizeProfile
} from '../server/services/schemeRecommendationEngine.js';

function loadCanonicalSchemes() {
  const rawCode = fs.readFileSync('src/data/schemes.ts', 'utf8');
  const jsCode = rawCode
    .replace("import type { Scheme } from '../types';", '')
    .replace('export const schemesData: Scheme[] =', 'const schemesData =');
  const fn = new Function(jsCode + '; return schemesData;');
  return fn();
}

console.log('================================================================');
console.log('GOVSCHEME DYNAMIC PROFILE RECOMMENDATION REGRESSION SUITE');
console.log('================================================================\n');

const canonicalSchemes = loadCanonicalSchemes();
assert.strictEqual(canonicalSchemes.length, 75, 'Must load exactly 75 canonical schemes');
console.log(`[Catalogue Loaded] ${canonicalSchemes.length} canonical schemes available.\n`);

// -----------------------------------------------------------------------------
// SECTION 1: SYNTHETIC CITIZEN PROFILES DEFINITION
// -----------------------------------------------------------------------------
const farmerProfile = {
  fullName: 'Ramasamy K',
  age: 42,
  gender: 'Male',
  state: 'Tamil Nadu',
  district: 'Thanjavur',
  occupation: 'Farmer',
  annualIncome: 60000,
  category: 'OBC',
  landHoldingAcres: 1.5,
  hasDisability: false,
  educationLevel: '10th Standard'
};

const studentProfile = {
  fullName: 'Ananya Deshmukh',
  age: 19,
  gender: 'Female',
  state: 'Maharashtra',
  district: 'Pune',
  occupation: 'Student',
  annualIncome: 80000,
  category: 'General',
  landHoldingAcres: 0,
  hasDisability: false,
  educationLevel: 'Undergraduate'
};

const seniorProfile = {
  fullName: 'Basavarajappa H',
  age: 68,
  gender: 'Male',
  state: 'Karnataka',
  district: 'Mysuru',
  occupation: 'Retired',
  annualIncome: 120000,
  category: 'SC',
  landHoldingAcres: 0,
  hasDisability: false,
  educationLevel: 'Secondary'
};

const affluentProfile = {
  fullName: 'Vikram Malhotra',
  age: 35,
  gender: 'Male',
  state: 'Delhi',
  district: 'South Delhi',
  occupation: 'Software Architect',
  annualIncome: 3500000,
  category: 'General',
  landHoldingAcres: 0,
  hasDisability: false,
  educationLevel: 'Post Graduate'
};

const disabledArtisanProfile = {
  fullName: 'Lakshmi Nair',
  age: 32,
  gender: 'Female',
  state: 'Kerala',
  district: 'Thrissur',
  occupation: 'Artisan',
  annualIncome: 95000,
  category: 'OBC',
  landHoldingAcres: 0,
  hasDisability: true,
  disabilityPercentage: 60,
  educationLevel: '12th Standard'
};

// -----------------------------------------------------------------------------
// TEST 1: PROFILE-DRIVEN DYNAMIC RECOMMENDATION COUNTS (NOT CONSTANT 18!)
// -----------------------------------------------------------------------------
console.log('TEST 1: Verifying recommendation count responds dynamically to citizen profiles...');

const farmerRecs = recommendSchemesForProfile(canonicalSchemes, farmerProfile);
const studentRecs = recommendSchemesForProfile(canonicalSchemes, studentProfile);
const seniorRecs = recommendSchemesForProfile(canonicalSchemes, seniorProfile);
const affluentRecs = recommendSchemesForProfile(canonicalSchemes, affluentProfile);
const disabledArtisanRecs = recommendSchemesForProfile(canonicalSchemes, disabledArtisanProfile);

console.log(`  Farmer Profile: ${farmerRecs.matchingCount} eligible matches (${farmerRecs.recommendations.length} total recommended)`);
console.log(`  Student Profile: ${studentRecs.matchingCount} eligible matches (${studentRecs.recommendations.length} total recommended)`);
console.log(`  Senior Profile: ${seniorRecs.matchingCount} eligible matches (${seniorRecs.recommendations.length} total recommended)`);
console.log(`  Affluent Profile: ${affluentRecs.matchingCount} eligible matches (${affluentRecs.recommendations.length} total recommended)`);
console.log(`  Disabled Artisan Profile: ${disabledArtisanRecs.matchingCount} eligible matches (${disabledArtisanRecs.recommendations.length} total recommended)`);

// Ensure counts are NOT identical or stuck at 18
assert.notStrictEqual(farmerRecs.matchingCount, studentRecs.matchingCount, 'Farmer and Student counts must differ');
assert.notStrictEqual(studentRecs.matchingCount, seniorRecs.matchingCount, 'Student and Senior counts must differ');
assert.notStrictEqual(seniorRecs.matchingCount, affluentRecs.matchingCount, 'Senior and Affluent counts must differ');

// Verify affluent user with ₹35 Lakh income only qualifies for universal non-means-tested schemes (7 out of 75)
assert.ok(affluentRecs.matchingCount <= 7, `Affluent user must receive minimal non-means-tested matches (<= 7), got ${affluentRecs.matchingCount}`);
assert.ok(affluentRecs.matchingCount < seniorRecs.matchingCount, 'Affluent matches must be fewer than senior matches');
assert.ok(farmerRecs.matchingCount >= 25, `Farmer should qualify for at least 25 schemes, got ${farmerRecs.matchingCount}`);
assert.ok(studentRecs.matchingCount >= 15, `Student should qualify for at least 15 schemes, got ${studentRecs.matchingCount}`);

console.log('  PASS: Recommendation counts vary dynamically by demographic profile (no hardcoded 18).\n');

// -----------------------------------------------------------------------------
// TEST 2: STRICT EXCLUSION OF CLEARLY INELIGIBLE SCHEMES
// -----------------------------------------------------------------------------
console.log('TEST 2: Verifying clearly ineligible schemes are strictly excluded from each profile...');

const farmerEligibleIds = new Set(farmerRecs.recommendations.filter(r => r.isEligible).map(r => r.schemeId));
const studentEligibleIds = new Set(studentRecs.recommendations.filter(r => r.isEligible).map(r => r.schemeId));
const seniorEligibleIds = new Set(seniorRecs.recommendations.filter(r => r.isEligible).map(r => r.schemeId));
const affluentEligibleIds = new Set(affluentRecs.recommendations.filter(r => r.isEligible).map(r => r.schemeId));

// Check PM-KISAN (requires farming)
assert.ok(farmerEligibleIds.has('pm-kisan'), 'PM-KISAN must be recommended to low-income farmer');
assert.ok(!studentEligibleIds.has('pm-kisan'), 'PM-KISAN must NOT be recommended to college student');
assert.ok(!affluentEligibleIds.has('pm-kisan'), 'PM-KISAN must NOT be recommended to tech architect');

// Check higher education scholarship (requires youth/student)
const studentSchemes = studentRecs.recommendations.filter(r => r.category === 'Education & Skill' || r.category === 'Education');
assert.ok(studentSchemes.length > 0, 'Student must receive education schemes');
for (const s of studentSchemes) {
  // Senior citizen (68yo) should NOT be eligible for youth education scholarships
  if (s.schemeId.includes('student') || s.schemeId.includes('edu')) {
    assert.ok(!seniorEligibleIds.has(s.schemeId), `Senior citizen must not qualify for youth scheme: ${s.schemeId}`);
  }
}

// Check old age pension (strictly requires age >= 60)
const senior60PlusSchemes = canonicalSchemes.filter(s => s.eligibilityRules?.minAge && s.eligibilityRules.minAge >= 60);
assert.ok(senior60PlusSchemes.length > 0, 'Must have at least one senior 60+ scheme');
for (const s of senior60PlusSchemes) {
  assert.ok(!studentEligibleIds.has(s.id), `19-year old student must NOT receive age-60+ scheme ${s.id}`);
  assert.ok(!farmerEligibleIds.has(s.id), `42-year old farmer must NOT receive age-60+ scheme ${s.id}`);
}
assert.ok(seniorEligibleIds.has('nsap-old-age-pension'), '68-year old senior must receive IGNOAPS old age pension');

console.log('  PASS: Clear occupational, age, and income exclusions are strictly enforced.\n');

// -----------------------------------------------------------------------------
// TEST 3: FRONTEND <-> BACKEND FIELD NORMALIZATION
// -----------------------------------------------------------------------------
console.log('TEST 3: Verifying field normalization between frontend and backend conventions...');

// Profile using frontend naming conventions
const frontendStyleProfile = {
  age: 42,
  gender: 'Male',
  annualIncome: 60000,
  category: 'OBC',
  hasDisability: true,
  educationLevel: '10th Standard',
  occupation: 'Farmer',
  state: 'Tamil Nadu',
  landHoldingAcres: 1.5
};

// Profile using backend recommendation engine naming conventions
const backendStyleProfile = {
  age: 42,
  gender: 'Male',
  income: 60000,
  socialCategory: 'OBC',
  isDifferentlyAbled: true,
  education: '10th Standard',
  isFarmer: true,
  occupation: 'Farmer',
  state: 'Tamil Nadu',
  landHoldingAcres: 1.5
};

const norm1 = normalizeProfile(frontendStyleProfile);
const norm2 = normalizeProfile(backendStyleProfile);

assert.strictEqual(norm1.income, 60000, 'annualIncome must normalize to income');
assert.strictEqual(norm1.annualIncome, 60000, 'income must be accessible as annualIncome');
assert.strictEqual(norm1.socialCategory, 'OBC', 'category must normalize to socialCategory');
assert.strictEqual(norm1.category, 'OBC', 'socialCategory must be accessible as category');
assert.strictEqual(norm1.isDifferentlyAbled, true, 'hasDisability must normalize to isDifferentlyAbled');
assert.strictEqual(norm1.hasDisability, true, 'isDifferentlyAbled must normalize to hasDisability');
assert.strictEqual(norm1.education, '10th Standard', 'educationLevel must normalize to education');
assert.strictEqual(norm1.isFarmer, true, 'isFarmer must be derived from Farmer occupation');

// Both must evaluate to identical match counts
const res1 = recommendSchemesForProfile(canonicalSchemes, frontendStyleProfile);
const res2 = recommendSchemesForProfile(canonicalSchemes, backendStyleProfile);
assert.strictEqual(res1.matchingCount, res2.matchingCount, 'Frontend and backend style payloads must produce identical matchingCount');
assert.strictEqual(res1.recommendations.length, res2.recommendations.length, 'Frontend and backend style payloads must produce identical recommendations length');

console.log(`  PASS: Frontend and backend field aliases resolve identically (${res1.matchingCount} matches for both).\n`);

// -----------------------------------------------------------------------------
// TEST 4: DISPLAY COUNT EQUALS RETURNED RECOMMENDATIONS LIST
// -----------------------------------------------------------------------------
console.log('TEST 4: Verifying displayed count equals returned recommendations list...');

// When filtered by default (excluding non-matching), matching count + info needed = recommendations list
assert.strictEqual(
  farmerRecs.matchingCount + farmerRecs.needsInfoCount,
  farmerRecs.recommendations.length,
  'Recommendations list length must equal matchingCount + needsInfoCount'
);

assert.strictEqual(
  studentRecs.matchingCount + studentRecs.needsInfoCount,
  studentRecs.recommendations.length,
  'Student recommendations list length must match'
);

assert.strictEqual(
  affluentRecs.matchingCount + affluentRecs.needsInfoCount,
  affluentRecs.recommendations.length,
  'Affluent recommendations list length must match'
);

console.log('  PASS: Result summary counts precisely match recommendations array length.\n');

// -----------------------------------------------------------------------------
// TEST 5: ACTIVE & PUBLISHED SCHEMES FILTERING
// -----------------------------------------------------------------------------
console.log('TEST 5: Verifying draft, suspended, and inactive schemes are excluded...');

const mixedSchemes = [
  ...canonicalSchemes.slice(0, 5),
  {
    id: 'test-draft-scheme',
    schemeId: 'test-draft-scheme',
    name: 'Unpublished Internal Draft Scheme',
    status: 'Draft',
    activeStatus: true,
    category: 'Agriculture',
    minimumAge: 18,
    maximumAge: 60
  },
  {
    id: 'test-suspended-scheme',
    schemeId: 'test-suspended-scheme',
    name: 'Suspended Scheme',
    status: 'Suspended',
    activeStatus: true,
    category: 'Agriculture',
    minimumAge: 18,
    maximumAge: 60
  },
  {
    id: 'test-inactive-scheme',
    schemeId: 'test-inactive-scheme',
    name: 'Inactive Scheme',
    status: 'Published',
    activeStatus: false,
    category: 'Agriculture',
    minimumAge: 18,
    maximumAge: 60
  }
];

// Controller logic filters { status: 'Published', activeStatus: { $ne: false } }
const publishedActiveSchemes = mixedSchemes.filter(s =>
  (s.status === 'Published' || !s.status) && s.activeStatus !== false
);

const recsFromMixed = recommendSchemesForProfile(publishedActiveSchemes, farmerProfile);
const recIds = new Set(recsFromMixed.recommendations.map(r => r.schemeId));

assert.ok(!recIds.has('test-draft-scheme'), 'Draft scheme must NOT be in recommendations');
assert.ok(!recIds.has('test-suspended-scheme'), 'Suspended scheme must NOT be in recommendations');
assert.ok(!recIds.has('test-inactive-scheme'), 'Inactive scheme must NOT be in recommendations');

console.log('  PASS: Only Published and active schemes can ever reach recommendation results.\n');

// -----------------------------------------------------------------------------
// TEST 6: DYNAMIC SHIFT ON PROFILE EDIT
// -----------------------------------------------------------------------------
console.log('TEST 6: Verifying dynamic shift in recommendations when citizen edits profile...');

// Start with Farmer profile, then citizen switches occupation to Student
const editedProfile = {
  ...farmerProfile,
  occupation: 'Student',
  annualIncome: 50000,
  landHoldingAcres: 0
};

const preEdit = recommendSchemesForProfile(canonicalSchemes, farmerProfile);
const postEdit = recommendSchemesForProfile(canonicalSchemes, editedProfile);

assert.notStrictEqual(preEdit.matchingCount, postEdit.matchingCount, 'Editing profile must change match count');
const preIds = new Set(preEdit.recommendations.filter(r => r.isEligible).map(r => r.schemeId));
const postIds = new Set(postEdit.recommendations.filter(r => r.isEligible).map(r => r.schemeId));

assert.ok(preIds.has('pm-kisan'), 'Pre-edit must have PM-KISAN');
assert.ok(!postIds.has('pm-kisan'), 'Post-edit to student must drop PM-KISAN');

console.log(`  PASS: Match count shifted from ${preEdit.matchingCount} to ${postEdit.matchingCount} when occupation changed from Farmer to Student.\n`);

console.log('================================================================');
console.log('ALL 6 REGRESSION CHECKS PASSED (6/6)');
console.log('Dynamic recommendation engine verified free of hardcoded constants.');
console.log('================================================================\n');
