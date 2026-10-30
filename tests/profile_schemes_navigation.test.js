// tests/profile_schemes_navigation.test.js
// Regression test suite for:
// 1. Sign-up automatic profile prompting and persistence
// 2. Sign-in automatic profile details display
// 3. Recommended Schemes vs Total Available Schemes options
// 4. Detailed "Why Not Applicable" explanations for ineligible schemes
// 5. Full 10-language localization for scheme navigation & ineligibility

import assert from 'assert';
import { isProfileComplete, getMissingProfileFields, normalizeUserProfile } from '../src/utils/profileUtils.ts';
import { evaluateSchemeEligibility } from '../src/engine/ruleEngine.ts';
import { translations } from '../src/data/translations.ts';
import { schemesData } from '../src/data/schemes.ts';

function pass(name) {
  console.log(`  [PASS] ${name}`);
}

async function runProfileSchemesNavigationTests() {
  console.log('================================================================');
  console.log(' GOVSCHEME PROFILE DETAILS, RECOMMENDED VS TOTAL & INELIGIBILITY');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // Test 1: Sign-up Automatic Profile Prompting & Persistence
  // -------------------------------------------------------------
  console.log('--- Test 1: Sign-up Flow & Profile Incompleteness Detection ---');
  {
    // A fresh signup has only name and email
    const freshlyRegisteredCitizen = normalizeUserProfile({
      fullName: 'Aarav Patel',
      email: 'aarav.patel@example.com',
      role: 'Citizen'
    });

    assert.strictEqual(isProfileComplete(freshlyRegisteredCitizen), false, 'Fresh signup must require profile completion');
    const missing = getMissingProfileFields(freshlyRegisteredCitizen);
    assert(missing.length > 0, 'Missing fields must be flagged');
    assert(missing.includes('Age'), 'Age is missing');
    assert(missing.includes('State'), 'State is missing');
    assert(missing.includes('Annual Income'), 'Annual Income is missing');

    // Simulate user filling out the wizard and saving
    const completedCitizen = normalizeUserProfile({
      ...freshlyRegisteredCitizen,
      age: 29,
      gender: 'Male',
      maritalStatus: 'Married',
      state: 'Tamil Nadu',
      district: 'Coimbatore',
      residenceType: 'Rural',
      occupation: 'Farmer',
      educationLevel: 'Graduate',
      annualIncome: 180000,
      category: 'OBC',
      landHoldingAcres: 2.5,
      familyMembersCount: 4,
      hasDisability: false,
      isRegisteredWorker: true,
      onboardingCompleted: true
    });

    assert.strictEqual(isProfileComplete(completedCitizen), true, 'Completed profile must be marked complete');
    assert.strictEqual(completedCitizen.age, 29);
    assert.strictEqual(completedCitizen.annualIncome, 180000);
    assert.strictEqual(completedCitizen.state, 'Tamil Nadu');
    assert.strictEqual(completedCitizen.category, 'OBC');
    pass('1.1: Sign-up accurately detects incomplete profile and stores complete profile attributes');
  }

  // -------------------------------------------------------------
  // Test 2: Sign-in Flow & Profile Details Model
  // -------------------------------------------------------------
  console.log('\n--- Test 2: Sign-in Flow & Profile Details Model ---');
  {
    const existingCitizen = normalizeUserProfile({
      id: 'cit-9988',
      fullName: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      mobile: '9876543210',
      age: 32,
      gender: 'Female',
      maritalStatus: 'Single',
      state: 'Maharashtra',
      district: 'Pune',
      residenceType: 'Urban',
      occupation: 'Self Employed',
      educationLevel: 'Post Graduate',
      annualIncome: 250000,
      category: 'General',
      landHoldingAcres: 0,
      familyMembersCount: 3,
      hasDisability: false,
      documents: [
        { id: 'doc-1', type: 'Aadhaar', status: 'Verified' },
        { id: 'doc-2', type: 'PAN', status: 'Verified' }
      ]
    });

    assert.strictEqual(isProfileComplete(existingCitizen), true, 'Existing citizen profile is complete');
    assert.strictEqual(existingCitizen.documents.length, 2, 'Vault documents are retained');
    assert.strictEqual(existingCitizen.gender, 'Female');
    assert.strictEqual(existingCitizen.annualIncome, 250000);
    assert.strictEqual(existingCitizen.district, 'Pune');
    pass('2.1: Authoritative profile attributes are verified for display on sign-in');
  }

  // -------------------------------------------------------------
  // Test 3: Recommended Schemes vs Total Available Schemes
  // -------------------------------------------------------------
  console.log('\n--- Test 3: Recommended Schemes vs Total Available Schemes ---');
  {
    const schemes = schemesData;
    assert(schemes.length >= 60, `Schemes catalogue must contain 60+ schemes (found ${schemes.length})`);

    const farmerProfile = normalizeUserProfile({
      age: 40,
      gender: 'Male',
      state: 'Tamil Nadu',
      district: 'Thanjavur',
      occupation: 'Farmer',
      annualIncome: 120000,
      category: 'OBC',
      landHoldingAcres: 2.0
    });

    let recommendedCount = 0;
    let ineligibleCount = 0;
    const totalCount = schemes.length;

    for (const scheme of schemes) {
      const res = evaluateSchemeEligibility(farmerProfile, scheme);
      if (res.status === 'Eligible' || res.status === 'Conditionally Eligible') {
        recommendedCount++;
      } else if (res.status === 'Not Eligible' || res.status === 'Almost Eligible') {
        ineligibleCount++;
      }
    }

    assert(recommendedCount > 0, 'Farmer must have recommended matching schemes');
    assert(ineligibleCount > 0, 'Farmer must have ineligible schemes (e.g. schemes for women, students, or other states)');
    assert(totalCount > recommendedCount, 'Total schemes available must exceed recommended schemes');
    assert.strictEqual(totalCount, schemes.length, 'Total schemes available equals catalogue size');

    pass(`3.1: Recommended schemes (${recommendedCount}) cleanly partitioned from Total Available (${totalCount}) and Ineligible (${ineligibleCount})`);
  }

  // -------------------------------------------------------------
  // Test 4: Detailed "Why Not Applicable" Explanations
  // -------------------------------------------------------------
  console.log('\n--- Test 4: Explainable Ineligibility Reasons ---');
  {
    // Profile: Male, age 50, income 8 Lakhs, resident of Karnataka
    const maleHighIncomeProfile = normalizeUserProfile({
      age: 50,
      gender: 'Male',
      state: 'Karnataka',
      annualIncome: 800000,
      occupation: 'Business',
      category: 'General'
    });

    // Test a women-only scheme (e.g. Sukanya Samriddhi or Mahila Samman)
    const femaleScheme = schemesData.find(s => 
      s.eligibilityRules?.allowedGenders?.length === 1 && 
      s.eligibilityRules.allowedGenders[0] === 'Female'
    );

    if (femaleScheme) {
      const res = evaluateSchemeEligibility(maleHighIncomeProfile, femaleScheme);
      assert.strictEqual(res.status, 'Not Eligible', 'Male profile must be Not Eligible for female-only scheme');
      assert(res.failedCriteria.length > 0, 'failedCriteria must contain reasons');
      const hasGenderReason = res.failedCriteria.some(r => r.toLowerCase().includes('female') || r.toLowerCase().includes('gender'));
      assert(hasGenderReason, 'failedCriteria must explain gender restriction');
      pass(`4.1: Female-only scheme explains gender restriction: "${res.failedCriteria[0]}"`);
    }

    // Test a youth/student scheme with max age limit
    const youthScheme = schemesData.find(s => 
      s.eligibilityRules?.maxAge !== undefined && s.eligibilityRules.maxAge <= 35
    );

    if (youthScheme) {
      const res = evaluateSchemeEligibility(maleHighIncomeProfile, youthScheme);
      assert.strictEqual(res.status, 'Not Eligible', '50-yr profile must be Not Eligible for youth scheme');
      assert(res.failedCriteria.length > 0, 'failedCriteria must contain age reason');
      const hasAgeReason = res.failedCriteria.some(r => r.toLowerCase().includes('age') || r.includes('50'));
      assert(hasAgeReason, 'failedCriteria must explain age requirement failure');
      pass(`4.2: Youth scheme explains age mismatch: "${res.failedCriteria.find(r => r.toLowerCase().includes('age'))}"`);
    }

    // Test an income-restricted scheme (e.g. maxIncome <= 300000)
    const lowIncomeScheme = schemesData.find(s => 
      s.eligibilityRules?.maxAnnualIncome !== undefined && s.eligibilityRules.maxAnnualIncome <= 300000
    );

    if (lowIncomeScheme) {
      const res = evaluateSchemeEligibility(maleHighIncomeProfile, lowIncomeScheme);
      assert.strictEqual(res.status, 'Not Eligible', 'High-income profile must be Not Eligible');
      assert(res.failedCriteria.length > 0, 'failedCriteria must contain income failure');
      const hasIncomeReason = res.failedCriteria.some(r => r.toLowerCase().includes('income'));
      assert(hasIncomeReason, 'failedCriteria must explain income limit exceeded');
      pass(`4.3: Income-restricted scheme explains income limit exceeded: "${res.failedCriteria.find(r => r.toLowerCase().includes('income'))}"`);
    }

    // Test a state-restricted scheme (e.g. Tamil Nadu or Maharashtra only)
    const stateRestrictedScheme = schemesData.find(s => 
      s.state !== 'Central' && s.eligibilityRules?.allowedStates && s.eligibilityRules.allowedStates.length > 0 && !s.eligibilityRules.allowedStates.includes('Karnataka')
    );

    if (stateRestrictedScheme) {
      const res = evaluateSchemeEligibility(maleHighIncomeProfile, stateRestrictedScheme);
      assert.strictEqual(res.status, 'Not Eligible', 'Out-of-state citizen must be Not Eligible');
      const hasStateReason = res.failedCriteria.some(r => r.toLowerCase().includes('resident') || r.toLowerCase().includes('karnataka') || r.toLowerCase().includes('state') || r.toLowerCase().includes(stateRestrictedScheme.state.toLowerCase()));
      const stateReason = res.failedCriteria.find(r => r.toLowerCase().includes('restricted') || r.toLowerCase().includes('karnataka') || r.toLowerCase().includes('state'));
      assert(stateReason, 'State reason must be found');
      pass(`4.4: State-restricted scheme explains domicile requirement: "${stateReason}"`);
    }
  }

  // -------------------------------------------------------------
  // Test 5: Full 10-Language Localization Verification
  // -------------------------------------------------------------
  console.log('\n--- Test 5: 10-Language Localization Verification ---');
  {
    const requiredKeys = [
      'recommendedForYou',
      'totalSchemesAvailable',
      'notApplicableForYou',
      'whyNotApplicable',
      'viewRecommended',
      'exploreAllCatalog',
      'seeWhyIneligible',
      'signInToCheckEligibility'
    ];

    const supportedLanguages = ['en', 'hi', 'ta', 'te', 'kn', 'ml', 'mr', 'gu', 'pa', 'bn'];

    for (const lang of supportedLanguages) {
      assert(translations[lang], `Language '${lang}' dictionary must exist`);
      for (const key of requiredKeys) {
        assert(
          translations[lang][key] && translations[lang][key].trim().length > 0,
          `Key '${key}' must exist and be non-empty in '${lang}'`
        );
      }
    }

    pass('5.1: All 8 scheme navigation and ineligibility translation keys are defined across all 10 Indic languages');
  }

  console.log('\n================================================================');
  console.log(' ALL PROFILE DETAILS, SCHEMES & INELIGIBILITY TESTS PASSED!    ');
  console.log('================================================================\n');
}

runProfileSchemesNavigationTests()
  .then(() => {
    process.exit(0);
  })
  .catch(err => {
    console.error('Test Suite Failed:', err);
    process.exit(1);
  });
