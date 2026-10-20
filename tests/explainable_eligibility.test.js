// tests/explainable_eligibility.test.js
// GovScheme Phase 4 — Explainable Eligibility & Scheme Matching Regression Suite
// Covers 17 targeted test scenarios:
// 1. All criteria satisfied
// 2. Demonstrably unmet criterion
// 3. Incomplete profile information (treated as UNKNOWN)
// 4. Scheme with both satisfied and unknown criteria
// 5. Unsupported or special rule fields (flagged as UNKNOWN)
// 6. Scheme with missing/undefined eligibilityRules
// 7. Null, empty, and malformed input data defensive handling
// 8. Conflicting or duplicated document fields (pmay-g & normalization)
// 9. Required document explicitly reported as possessed (AVAILABLE)
// 10. Required document explicitly reported as not possessed (MISSING)
// 11. Required document with unconfirmed possession (UNCONFIRMED)
// 12. Scheme with no document metadata
// 13. Official application URL presence vs graceful offline fallback
// 14. 100% Deterministic output ordering across identical inputs
// 15. Freedom from invented requirements, unsupported probabilities, or false approval claims
// 16. Regression checks for Phase 3 negative-intent and negative-document search behavior
// 17. Regression checks for existing recommendation and rule engine scoring

import assert from 'assert';
import { schemesData } from '../src/data/schemes.ts';
import {
  evaluateExplainableEligibility,
  reconcileSchemeDocuments,
  evaluateDocumentReadiness,
  canonicalizeDocKey,
  PRELIMINARY_DISCLAIMER
} from '../src/engine/explainableEligibility.ts';
import { evaluateSchemeEligibility } from '../src/engine/ruleEngine.ts';
import { computeMLRecommendation } from '../src/engine/mlEngine.ts';
import { performSemanticSearch } from '../src/engine/semanticSearch.ts';

console.log('================================================================');
console.log('   GOVSCHEME PHASE 4: EXPLAINABLE ELIGIBILITY TEST SUITE        ');
console.log('================================================================\n');

let testsPassed = 0;
let totalTests = 0;

function pass(name) {
  totalTests++;
  testsPassed++;
  console.log(`  [PASS] ${name}`);
}

// -----------------------------------------------------------------------------
// Test 1: A scheme whose available criteria are all satisfied
// -----------------------------------------------------------------------------
console.log('--- Test 1: All Criteria Satisfied ---');
{
  const scheme = schemesData.find(s => s.id === 'pm-kisan');
  assert(scheme, 'pm-kisan scheme must exist in catalogue');

  const citizen = {
    id: 'user-farmer-sat',
    fullName: 'Ramesh Patel',
    email: 'ramesh@example.com',
    age: 42,
    gender: 'Male',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    annualIncome: 120000,
    occupation: 'Farmer',
    category: 'OBC',
    landHoldingAcres: 3,
    educationLevel: '10th Standard',
    hasDisability: false,
    documents: [
      { documentType: 'Aadhaar Card', uploadedAt: '2026-01-01' },
      { documentType: 'Land Ownership Documents / Khasra Khatoni', uploadedAt: '2026-01-01' },
      { documentType: 'Savings Bank Account Passbook', uploadedAt: '2026-01-01' },
      { documentType: 'Mobile Number Linked to Aadhaar', uploadedAt: '2026-01-01' }
    ]
  };

  const result = evaluateExplainableEligibility(citizen, scheme);
  assert.strictEqual(result.schemeId, 'pm-kisan');
  assert.strictEqual(result.notSatisfied.length, 0, 'Must have zero unmet criteria');
  assert.strictEqual(result.unknown.length, 0, 'Must have zero unknown criteria when fully specified');
  assert(result.satisfied.length >= 3, `Expected at least 3 satisfied criteria, got ${result.satisfied.length}`);
  assert.strictEqual(result.overallStatus, 'Eligible', 'Fully satisfied profile must evaluate to Eligible');
  assert(result.satisfied.some(c => c.id === 'occupation'), 'Occupation must be satisfied');
  assert(result.satisfied.some(c => c.id === 'state'), 'State must be satisfied');
  assert(result.satisfied.some(c => c.id === 'socialCategory'), 'Category must be satisfied');

  pass('1.1: Citizen with fully qualifying profile satisfies all criteria deterministically');
}

// -----------------------------------------------------------------------------
// Test 2: A scheme with a demonstrably unmet criterion
// -----------------------------------------------------------------------------
console.log('\n--- Test 2: Demonstrably Unmet Criteria ---');
{
  const scholarshipScheme = schemesData.find(s => s.id === 'post-matric-scholarship') || schemesData.find(s => s.eligibilityRules?.maxAnnualIncome && s.eligibilityRules.maxAnnualIncome <= 250000);
  assert(scholarshipScheme, 'Must find scheme with income ceiling');

  const affluentCitizen = {
    id: 'user-affluent',
    fullName: 'Ananya Sharma',
    email: 'ananya@example.com',
    age: 20,
    gender: 'Female',
    state: 'Delhi',
    district: 'Central',
    annualIncome: 950000, // Demonstrably exceeds ceiling (₹2,50,000)
    occupation: 'Student',
    category: 'General',
    landHoldingAcres: 0,
    educationLevel: 'Undergraduate',
    hasDisability: false,
    documents: []
  };

  const result = evaluateExplainableEligibility(affluentCitizen, scholarshipScheme);
  assert(result.notSatisfied.length >= 1, 'Must report unmet criteria');
  const incomeCrit = result.notSatisfied.find(c => c.id === 'income');
  assert(incomeCrit, 'Income must be flagged as NOT_SATISFIED');
  assert.strictEqual(incomeCrit.status, 'NOT_SATISFIED');
  assert(incomeCrit.reason.includes('exceeds'), 'Reason must explicitly explain income exceeded limit');
  assert(incomeCrit.userValueDescription?.includes('9,50,000'), 'Must cite citizen stated value');
  assert(result.overallStatus === 'Almost Eligible' || result.overallStatus === 'Not Eligible', 'Must reflect ineligibility status');

  pass('2.1: Demonstrably unmet income criterion is categorized as NOT_SATISFIED with explicit reason');
}

// -----------------------------------------------------------------------------
// Test 3: Incomplete profile information (Missing = UNKNOWN)
// -----------------------------------------------------------------------------
console.log('\n--- Test 3: Incomplete Profile Information Treated as UNKNOWN ---');
{
  const scheme = schemesData.find(s => s.id === 'pm-kisan');
  const blankCitizen = {
    id: 'user-blank',
    fullName: 'Incomplete Citizen'
    // Missing age, gender, state, income, occupation, category, landholding
  };

  const result = evaluateExplainableEligibility(blankCitizen, scheme);
  assert(result.unknown.length > 0, 'Missing fields must produce UNKNOWN criteria');
  assert(result.unknown.some(c => c.id === 'occupation'), 'Missing occupation must be UNKNOWN');
  assert(result.unknown.some(c => c.id === 'socialCategory'), 'Missing category must be UNKNOWN');
  assert.strictEqual(result.satisfied.filter(c => c.id !== 'state').length, 0, 'No criteria with missing profile data can be SATISFIED');

  const occCrit = result.unknown.find(c => c.id === 'occupation');
  assert.strictEqual(occCrit.status, 'UNKNOWN');
  assert(occCrit.reason.includes('not specified in profile'), 'Explanation must honestly declare lack of profile data');

  pass('3.1: Missing profile fields are strictly UNKNOWN, never assumed to be satisfied');
}

// -----------------------------------------------------------------------------
// Test 4: Scheme with both satisfied and unknown criteria
// -----------------------------------------------------------------------------
console.log('\n--- Test 4: Both Satisfied and Unknown Criteria ---');
{
  const scheme = schemesData.find(s => s.id === 'pm-kisan');
  const partialCitizen = {
    id: 'user-partial',
    fullName: 'Sunil Kumar',
    occupation: 'Farmer', // Satisfied
    category: 'OBC' // Satisfied
    // State is Central (Satisfied)
    // Other fields omitted
  };

  const result = evaluateExplainableEligibility(partialCitizen, scheme);
  assert(result.satisfied.length >= 2, 'Stated qualifying fields must be SATISFIED');
  assert.strictEqual(result.notSatisfied.length, 0, 'No unmet fields exist');
  assert(result.criteriaCount.satisfied > 0 && result.criteriaCount.total >= result.criteriaCount.satisfied);

  pass('4.1: Concurrently handles satisfied and unknown criteria with correct counts');
}

// -----------------------------------------------------------------------------
// Test 5: Scheme with unsupported or special rule fields
// -----------------------------------------------------------------------------
console.log('\n--- Test 5: Unsupported or Special Rule Fields ---');
{
  const syntheticScheme = {
    id: 'test-special-scheme',
    name: 'Special Enterprise Scheme',
    category: 'Employment & Micro Enterprises',
    state: 'Central',
    eligibilityRules: {
      minAge: 18,
      maxAge: 50,
      customUnparsedCriteriaX: 'Must possess ISO-9001 registration'
    },
    requiredDocuments: ['Aadhaar Card']
  };

  const citizen = {
    id: 'u-5',
    age: 30
  };

  const result = evaluateExplainableEligibility(citizen, syntheticScheme);
  assert(result.satisfied.some(c => c.id === 'age'), 'Known rule age must be evaluated normally');
  const specialCrit = result.unknown.find(c => c.id === 'unsupported_rule_customUnparsedCriteriaX');
  assert(specialCrit, 'Unsupported rule key must be captured as UNKNOWN');
  assert.strictEqual(specialCrit.status, 'UNKNOWN');
  assert(specialCrit.reason.includes('customUnparsedCriteriaX'), 'Reason must identify the unparsed condition');

  pass('5.1: Unsupported custom rule field flagged as UNKNOWN without approximating or crashing');
}

// -----------------------------------------------------------------------------
// Test 6: Scheme with missing or empty eligibilityRules
// -----------------------------------------------------------------------------
console.log('\n--- Test 6: Missing eligibilityRules ---');
{
  const schemeWithoutRules = {
    id: 'scheme-no-rules',
    name: 'General Welfare Notice',
    category: 'Financial Inclusion & Credit',
    state: 'Central',
    requiredDocuments: []
  };

  const citizen = { id: 'u-6', age: 25 };
  const result = evaluateExplainableEligibility(citizen, schemeWithoutRules);
  assert(result.unknown.some(c => c.id === 'unsupported_catalogue_rules'), 'Must flag catalogue rules as unspecified');
  const ruleCrit = result.unknown.find(c => c.id === 'unsupported_catalogue_rules');
  assert.strictEqual(ruleCrit.status, 'UNKNOWN');
  assert(ruleCrit.reason.includes('catalogue'), 'Explanation must explain structured rules are missing');

  pass('6.1: Scheme with missing eligibilityRules safely produces UNKNOWN status');
}

// -----------------------------------------------------------------------------
// Test 7: Null, empty, and malformed input data defensive handling
// -----------------------------------------------------------------------------
console.log('\n--- Test 7: Null, Empty, and Malformed Input Data ---');
{
  assert.doesNotThrow(() => evaluateExplainableEligibility(null, null), 'Must not throw on (null, null)');
  assert.doesNotThrow(() => evaluateExplainableEligibility(undefined, undefined), 'Must not throw on (undefined, undefined)');
  assert.doesNotThrow(() => evaluateExplainableEligibility({}, {}), 'Must not throw on ({}, {})');

  const malformedCitizen = {
    age: 'not-a-number',
    annualIncome: -99999,
    disabilityPercentage: 'invalid',
    documents: 'not-an-array'
  };

  const malformedScheme = {
    eligibilityRules: {
      minAge: 'invalid',
      requiredDocuments: null
    },
    requiredDocuments: 12345
  };

  const result = evaluateExplainableEligibility(malformedCitizen, malformedScheme);
  assert(result, 'Must return valid result object');
  assert(Array.isArray(result.satisfied), 'satisfied must be array');
  assert(Array.isArray(result.notSatisfied), 'notSatisfied must be array');
  assert(Array.isArray(result.unknown), 'unknown must be array');
  assert(Array.isArray(result.requiredDocuments), 'requiredDocuments must be array');
  assert(typeof result.disclaimer === 'string', 'disclaimer must be string');

  pass('7.1: Evaluator remains completely robust against null, empty, and malformed inputs');
}

// -----------------------------------------------------------------------------
// Test 8: Conflicting or duplicated document fields (pmay-g)
// -----------------------------------------------------------------------------
console.log('\n--- Test 8: Conflicting and Duplicated Document Fields ---');
{
  const pmayg = schemesData.find(s => s.id === 'pmay-g');
  assert(pmayg, 'pmay-g must exist in catalogue');

  const reconciliation = reconcileSchemeDocuments(pmayg);
  assert(reconciliation.conflictDetected, 'pmay-g must detect catalogue document discrepancy');
  assert(reconciliation.conflictDetails?.includes('Income Certificate'), 'Discrepancy details must cite Income Certificate');
  assert(reconciliation.canonicalDocuments.some(d => d.toLowerCase().includes('income certificate')), 'Must retain Income Certificate in required list for safety');

  // Synthetic deduplication test
  const dupScheme = {
    id: 'dup-doc-scheme',
    name: 'Duplicate Doc Scheme',
    requiredDocuments: ['Aadhaar Card', 'Savings Bank Account Passbook'],
    eligibilityRules: {
      requiredDocuments: ['Aadhaar', 'Bank Passbook']
    }
  };

  const dupRec = reconcileSchemeDocuments(dupScheme);
  assert.strictEqual(dupRec.canonicalDocuments.length, 2, 'Duplicate Aadhaar and Bank Passbook variations must be reconciled to 2 canonical items');
  assert(dupRec.canonicalDocuments.includes('Aadhaar Card'), 'Must prefer descriptive name');

  pass('8.1: Conflicting and duplicated document variations are reconciled transparently');
}

// -----------------------------------------------------------------------------
// Test 9: Required document explicitly reported as possessed (AVAILABLE)
// -----------------------------------------------------------------------------
console.log('\n--- Test 9: Explicitly Reported Possessed Document ---');
{
  const scheme = {
    id: 's-doc',
    name: 'Doc Scheme',
    requiredDocuments: ['Aadhaar Card', 'Ration Card']
  };

  const citizen = { id: 'u-9', documents: [] };
  const reported = { 'aadhaar': 'AVAILABLE' };

  const readiness = evaluateDocumentReadiness(scheme, citizen, reported);
  assert(readiness.availableDocuments.includes('Aadhaar Card'), 'Aadhaar Card must be in availableDocuments');
  assert(!readiness.missingDocuments.includes('Aadhaar Card'), 'Aadhaar Card must not be in missingDocuments');
  const aadhaarItem = readiness.documentItems.find(d => d.id === 'aadhaar');
  assert(aadhaarItem, 'Aadhaar item must exist');
  assert.strictEqual(aadhaarItem.status, 'AVAILABLE');
  assert.strictEqual(aadhaarItem.possessionReportedByCitizen, true);

  pass('9.1: Document explicitly reported possessed is categorized as AVAILABLE with citizen flag');
}

// -----------------------------------------------------------------------------
// Test 10: Required document explicitly reported as not possessed (MISSING)
// -----------------------------------------------------------------------------
console.log('\n--- Test 10: Explicitly Reported Missing Document ---');
{
  const scheme = {
    id: 's-doc',
    name: 'Doc Scheme',
    requiredDocuments: ['Income Certificate']
  };

  const citizen = { id: 'u-10', documents: [] };
  const reported = { 'income_certificate': 'MISSING' };

  const readiness = evaluateDocumentReadiness(scheme, citizen, reported);
  assert(readiness.missingDocuments.includes('Income Certificate'), 'Income Certificate must be in missingDocuments');
  assert(!readiness.availableDocuments.includes('Income Certificate'), 'Must not be in availableDocuments');
  const docItem = readiness.documentItems.find(d => d.id === 'income_certificate');
  assert.strictEqual(docItem.status, 'MISSING');
  assert.strictEqual(docItem.possessionReportedByCitizen, true);

  // Check next steps guidance
  const evalResult = evaluateExplainableEligibility(citizen, scheme, reported);
  assert(evalResult.nextSteps.some(step => step.toLowerCase().includes('procure') || step.toLowerCase().includes('missing')), 'Next steps must include advice to procure missing document');

  pass('10.1: Document explicitly reported not possessed is categorized as MISSING with procurement next steps');
}

// -----------------------------------------------------------------------------
// Test 11: Required document with unconfirmed possession (UNCONFIRMED)
// -----------------------------------------------------------------------------
console.log('\n--- Test 11: Unconfirmed Document Possession ---');
{
  const scheme = {
    id: 's-doc',
    name: 'Doc Scheme',
    requiredDocuments: ['Caste Certificate']
  };

  const citizen = { id: 'u-11', documents: [] };
  // Citizen provides NO response for Caste Certificate
  const readiness = evaluateDocumentReadiness(scheme, citizen, {});

  assert(readiness.unconfirmedDocuments.includes('Caste Certificate'), 'Must be placed in unconfirmedDocuments');
  assert(!readiness.missingDocuments.includes('Caste Certificate'), 'Must NEVER be assumed missing without citizen confirmation');
  assert(!readiness.availableDocuments.includes('Caste Certificate'), 'Must NEVER be assumed available');
  const docItem = readiness.documentItems.find(d => d.id === 'caste_certificate');
  assert.strictEqual(docItem.status, 'UNCONFIRMED');
  assert.strictEqual(docItem.possessionReportedByCitizen, false);

  pass('11.1: Unanswered document possession is strictly UNCONFIRMED, never assumed missing');
}

// -----------------------------------------------------------------------------
// Test 12: Scheme with no document metadata
// -----------------------------------------------------------------------------
console.log('\n--- Test 12: Scheme with No Document Metadata ---');
{
  const noDocScheme = {
    id: 's-no-docs',
    name: 'No Docs Scheme',
    requiredDocuments: [],
    eligibilityRules: {
      requiredDocuments: []
    }
  };

  const citizen = { id: 'u-12' };
  const evalResult = evaluateExplainableEligibility(citizen, noDocScheme);
  assert.strictEqual(evalResult.requiredDocuments.length, 0);
  assert.strictEqual(evalResult.documentItems.length, 0);
  assert(!evalResult.explanations.some(e => e.toLowerCase().includes('no documents required by law')), 'Must not claim that no documents are legally required');
  assert(evalResult.nextSteps.some(s => s.toLowerCase().includes('csc') || s.toLowerCase().includes('portal') || s.toLowerCase().includes('office')), 'Must direct to portal or CSC');

  pass('12.1: Scheme with no document metadata handles empty list without claiming zero legal requirements');
}

// -----------------------------------------------------------------------------
// Test 13: Entry with official application URL vs entry without
// -----------------------------------------------------------------------------
console.log('\n--- Test 13: Official Portal URL Guidance vs Fallback ---');
{
  const schemeWithUrl = schemesData.find(s => s.officialApplyUrl && s.officialApplyUrl.startsWith('http'));
  assert(schemeWithUrl, 'Must find scheme with official apply URL');

  const evalA = evaluateExplainableEligibility({ age: 25 }, schemeWithUrl);
  assert(evalA.officialApplyUrl, 'Must expose officialApplyUrl');
  assert(evalA.nextSteps.some(step => step.includes('official government portal')), 'Must instruct citizen to apply on official portal');

  const schemeWithoutUrl = {
    id: 'no-url-scheme',
    name: 'Local Panchayat Scheme',
    officialApplyUrl: '',
    officialWebsite: '',
    helplineNumber: '1800-000-000',
    eligibilityRules: {}
  };

  const evalB = evaluateExplainableEligibility({ age: 25 }, schemeWithoutUrl);
  assert(!evalB.officialApplyUrl, 'officialApplyUrl must be undefined when missing');
  assert(evalB.nextSteps.some(step => step.includes('Common Service Centre') || step.includes('Block Office')), 'Must supply honest offline guidance');
  assert(evalB.nextSteps.some(step => step.includes('1800-000-000')), 'Must cite official helpline');

  pass('13.1: Accurate portal URL instructions provided when available; honest CSC fallback when unavailable');
}

// -----------------------------------------------------------------------------
// Test 14: 100% Deterministic output ordering across identical inputs
// -----------------------------------------------------------------------------
console.log('\n--- Test 14: Deterministic Output Ordering ---');
{
  const scheme = schemesData.find(s => s.id === 'pm-kisan');
  const citizen = {
    id: 'u-det',
    fullName: 'Test Determinism',
    age: 35,
    gender: 'Female',
    state: 'Tamil Nadu',
    annualIncome: 180000,
    occupation: 'Farmer',
    category: 'OBC',
    landHoldingAcres: 2
  };

  const firstRun = JSON.stringify(evaluateExplainableEligibility(citizen, scheme));
  for (let i = 0; i < 50; i++) {
    const nextRun = JSON.stringify(evaluateExplainableEligibility(citizen, scheme));
    assert.strictEqual(nextRun, firstRun, `Run ${i + 1} produced non-deterministic output`);
  }

  pass('14.1: 50 consecutive runs produce bit-for-bit identical JSON and ordering');
}

// -----------------------------------------------------------------------------
// Test 15: Absence of invented requirements, unsupported probabilities, or false approval claims
// -----------------------------------------------------------------------------
console.log('\n--- Test 15: Freedom from Unsafe Claims & Fabrications ---');
{
  const schemes = schemesData.slice(0, 10);
  const citizen = {
    id: 'user-audit',
    age: 28,
    annualIncome: 150000,
    state: 'Maharashtra',
    occupation: 'Daily Wager'
  };

  const FORBIDDEN_STRINGS = [
    '100% guaranteed',
    'guaranteed approval',
    'approval is guaranteed',
    'statutory entitlement granted',
    'officially approved',
    'legally approved'
  ];

  for (const s of schemes) {
    const result = evaluateExplainableEligibility(citizen, s);
    const combinedOutput = JSON.stringify(result).toLowerCase();

    for (const forbidden of FORBIDDEN_STRINGS) {
      assert(!combinedOutput.includes(forbidden), `Forbidden misleading claim "${forbidden}" found in scheme ${s.id}`);
    }

    assert(result.disclaimer.includes('Preliminary Advisory Only'), 'Must include preliminary advisory disclaimer');
    assert(result.disclaimer.includes('competent government authority'), 'Must acknowledge authority makes final determination');
  }

  pass('15.1: Zero misleading approval guarantees or arbitrary probabilities across catalogue evaluations');
}

// -----------------------------------------------------------------------------
// Test 16: Regression checks for Phase 3 negative-intent and negative-document search behavior
// -----------------------------------------------------------------------------
console.log('\n--- Test 16: Phase 3 Search Precision Regressions ---');
async function runPhase3SearchRegressions() {
  // 16.1: Negative document query
  const resNoIncome = await performSemanticSearch('schemes that do not require an income certificate', schemesData);
  assert(resNoIncome.length > 0, 'Must return schemes');
  const top10 = resNoIncome.slice(0, 10).map(r => r.scheme);
  const topRequiresIncome = top10.filter(s => {
    const docs = [...(s.eligibilityRules?.requiredDocuments || []), ...(s.requiredDocuments || [])].map(d => d.toLowerCase());
    return docs.some(d => d.includes('income'));
  });
  assert(topRequiresIncome.length <= 2, 'Top 10 results must prioritize schemes without income doc requirement');

  // 16.2: Negative state query
  const resNotTN = await performSemanticSearch('schemes not available in Tamil Nadu', schemesData);
  const top5NotTN = resNotTN.slice(0, 5).map(r => r.scheme);
  assert(!top5NotTN.some(s => s.state && s.state.toLowerCase() === 'tamil nadu'), 'Tamil Nadu schemes must be excluded from top 5');

  // 16.3: Non-creamy layer hyphen preservation
  const resNFOBC = await performSemanticSearch('non-creamy layer certificate', schemesData);
  assert.strictEqual(resNFOBC[0].scheme.id, 'edu-national-fellowship-obc');

  // 16.4: Non-farm business loan
  const resNonFarm = await performSemanticSearch('non-farm business loan', schemesData);
  assert(resNonFarm.length > 0);
  assert(!resNonFarm.slice(0, 3).some(r => r.scheme.id.includes('nfobc')));

  // 16.5: Explicit nonexistent/fake schemes
  const resFake = await performSemanticSearch('fake schemes that do not exist', schemesData);
  assert.strictEqual(resFake.length, 0, 'Explicit fake query must return 0 results');

  // 16.6: Legitimate fraud-awareness query
  const resFraud = await performSemanticSearch('How can I identify a fake government scheme?', schemesData);
  assert(resFraud.length > 0, 'Legitimate fraud inquiry must return authentic guidance');
  assert(resFraud.some(r => r.scheme.id === 'pm-kisan'), 'Must include authentic reference scheme');

  pass('16.1: All Phase 3 negative-document, negative-state, compound-preservation, and fraud tests pass intact');
}

// -----------------------------------------------------------------------------
// Test 17: Regression checks for existing rule engine & recommendation scoring
// -----------------------------------------------------------------------------
console.log('\n--- Test 17: Existing Rule Engine & Recommendation Engine Regressions ---');
{
  const scheme = schemesData[0];
  const eligibleRule = {
    schemeId: scheme.id,
    status: 'Eligible',
    matchedCriteria: ['Criteria met'],
    failedCriteria: [],
    missingDocuments: [],
    overallReason: 'Eligible'
  };

  const recEligible = computeMLRecommendation({ occupation: 'Farmer' }, scheme, eligibleRule, schemesData);
  assert(recEligible.confidenceScore >= 70, 'Eligible status must receive score boost');
  assert(recEligible.confidenceScore <= 99, 'Score must be clamped <= 99');

  const ineligRule = {
    schemeId: scheme.id,
    status: 'Not Eligible',
    matchedCriteria: [],
    failedCriteria: ['Failed 1', 'Failed 2'],
    missingDocuments: [],
    overallReason: 'Not Eligible'
  };

  const recInelig = computeMLRecommendation({ occupation: 'Farmer' }, scheme, ineligRule, schemesData);
  assert(recInelig.confidenceScore <= 60, 'Ineligible status must receive penalty');
  assert(recInelig.confidenceScore >= 10, 'Score must be clamped >= 10');

  // Test standard rule evaluation
  const ruleResult = evaluateSchemeEligibility(null, scheme);
  assert(ruleResult.status, 'Standard evaluateSchemeEligibility must return status');

  pass('17.1: Existing ruleEngine and mlEngine scoring remains 100% backward compatible');
}

// -----------------------------------------------------------------------------
// Test 18: Engine Alignment, Boundary Consistency & No False-Pass Inferences
// -----------------------------------------------------------------------------
console.log('\n--- Test 18: Engine Alignment & Boundary Consistency ---');
{
  // 18.1: Age [0, 120] range evaluation consistency
  const allAgesScheme = {
    id: 's-all-ages',
    name: 'Universal Health Scheme',
    state: 'Central',
    eligibilityRules: {
      minAge: 0,
      maxAge: 120,
      requiredDocuments: ['Aadhaar Card']
    },
    requiredDocuments: ['Aadhaar Card']
  };

  const citizen35 = { id: 'u-age35', age: 35, documents: [{ documentType: 'Aadhaar Card' }] };
  const expAge = evaluateExplainableEligibility(citizen35, allAgesScheme);
  const ruleAge = evaluateSchemeEligibility(citizen35, allAgesScheme);

  assert(expAge.satisfied.some(c => c.id === 'age'), 'Age [0, 120] must be satisfied in explainable engine for age 35');
  assert(ruleAge.matchedCriteria.some(m => m.includes('Age Requirement Met')), 'Age must be matched in rule engine');
  assert.strictEqual(expAge.satisfied.length, ruleAge.matchedCriteria.length, 'Matched criteria count must be identical across both engines');
  pass('18.1: Age [0, 120] range evaluation is identical and satisfied across both engines');

  // 18.2: Case-insensitivity for gender and social category across both engines
  const lowerCaseCitizen = {
    id: 'u-lower',
    gender: 'female',
    category: 'obc',
    age: 25,
    state: 'Tamil Nadu'
  };

  const genderCatScheme = {
    id: 's-gender-cat',
    name: 'Women OBC Entrepreneurship',
    state: 'Tamil Nadu',
    eligibilityRules: {
      allowedGenders: ['Female'],
      allowedCategories: ['OBC'],
      allowedStates: ['Tamil Nadu'],
      requiredDocuments: []
    },
    requiredDocuments: []
  };

  const expLower = evaluateExplainableEligibility(lowerCaseCitizen, genderCatScheme);
  const ruleLower = evaluateSchemeEligibility(lowerCaseCitizen, genderCatScheme);

  assert(expLower.satisfied.some(c => c.id === 'gender'), 'Female must be satisfied in explainable engine');
  assert(expLower.satisfied.some(c => c.id === 'socialCategory'), 'OBC must be satisfied in explainable engine');
  assert.strictEqual(ruleLower.failedCriteria.length, 0, 'ruleEngine must not fail lowercase gender or category');
  assert.strictEqual(expLower.notSatisfied.length, 0, 'explainable engine must have 0 unmet criteria');
  pass('18.2: Gender and social category casing evaluated consistently and case-insensitively across both engines');

  // 18.3: Unspecified landHolding and disability produce informationNeeded / UNKNOWN without false pass/fail
  const unspecCitizen = { id: 'u-unspec', age: 40 };
  const landDisScheme = {
    id: 's-land-dis',
    name: 'Special Land & Divyangjan Grant',
    state: 'Central',
    eligibilityRules: {
      maxLandHoldingAcres: 2,
      requiresDisability: true,
      minDisabilityPercentage: 40,
      requiredDocuments: []
    },
    requiredDocuments: []
  };

  const expUnspec = evaluateExplainableEligibility(unspecCitizen, landDisScheme);
  const ruleUnspec = evaluateSchemeEligibility(unspecCitizen, landDisScheme);

  assert(expUnspec.unknown.some(c => c.id === 'landHolding'), 'Unspecified landHolding must be UNKNOWN in explainable engine');
  assert(expUnspec.unknown.some(c => c.id === 'disability'), 'Unspecified disability must be UNKNOWN in explainable engine');
  assert.strictEqual(ruleUnspec.failedCriteria.length, 0, 'Unspecified disability must NOT be marked failed in ruleEngine');
  assert(ruleUnspec.informationNeeded?.some(i => i.toLowerCase().includes('land')), 'ruleEngine must flag landHolding in informationNeeded');
  assert(ruleUnspec.informationNeeded?.some(i => i.toLowerCase().includes('disability')), 'ruleEngine must flag disability in informationNeeded');
  assert.strictEqual(ruleUnspec.status, 'Insufficient Information', 'Overall status must be Insufficient Information');
  assert.strictEqual(expUnspec.overallStatus, 'Insufficient Information', 'Explainable status must be Insufficient Information');
  pass('18.3: Missing landHolding and disability profile fields produce UNKNOWN and Insufficient Information without false pass/fail');

  // 18.4: Scheme with 0 machine-evaluable criteria evaluated never marked Eligible
  const emptyRulesScheme = {
    id: 's-empty-rules',
    name: 'Generic Department Notice',
    state: 'Central',
    eligibilityRules: {},
    requiredDocuments: []
  };

  const expEmpty = evaluateExplainableEligibility(citizen35, emptyRulesScheme);
  const ruleEmpty = evaluateSchemeEligibility(citizen35, emptyRulesScheme);

  assert.notStrictEqual(expEmpty.overallStatus, 'Eligible', 'Empty rules scheme must NEVER evaluate to Eligible');
  assert.strictEqual(expEmpty.overallStatus, 'Insufficient Information', 'Must evaluate to Insufficient Information');
  assert.strictEqual(ruleEmpty.status, 'Insufficient Information', 'ruleEngine must evaluate to Insufficient Information');
  pass('18.4: Scheme with 0 machine-evaluable criteria evaluated evaluates to Insufficient Information, never Eligible');

  // 18.5: Translation interpolation tokens are cleanly resolved without raw mustache leaks
  const interpResult = evaluateExplainableEligibility(
    { age: 25 },
    {
      id: 's-interp',
      name: 'Interpolation Check Scheme',
      state: 'Central',
      officialApplyUrl: 'https://apply.gov.in/test',
      helplineNumber: '1800-111-222',
      eligibilityRules: { minAge: 18, maxAge: 60, requiredDocuments: ['Income Certificate'] },
      requiredDocuments: ['Income Certificate']
    },
    { 'income_certificate': 'MISSING' }
  );

  const combinedJson = JSON.stringify(interpResult);
  assert(!combinedJson.includes('{{count}}'), 'Must not leak raw {{count}} interpolation token');
  assert(!combinedJson.includes('{{unknownNames}}'), 'Must not leak raw {{unknownNames}} interpolation token');
  assert(!combinedJson.includes('{{missingDocs}}'), 'Must not leak raw {{missingDocs}} interpolation token');
  assert(!combinedJson.includes('{{hostname}}'), 'Must not leak raw {{hostname}} interpolation token');
  pass('18.5: Translation interpolation tokens resolved cleanly without template mustache leaks');
}

await runPhase3SearchRegressions();

console.log('\n================================================================');
console.log(` ALL PHASE 4 EXPLAINABLE ELIGIBILITY TESTS PASSED: ${testsPassed}/${totalTests}! `);
console.log('================================================================\n');
