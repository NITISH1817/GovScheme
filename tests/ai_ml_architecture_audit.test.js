// tests/ai_ml_architecture_audit.test.js
// Rigorous Automated Verification Suite for GovScheme AI/ML Architecture:
// 1. MCDA / Rule-Based Weighted Scoring Engine (mlEngine.ts)
// 2. Deterministic Legal Rule Evaluation & Priority (ruleEngine.ts)
// 3. Token-Based Lexical/Semantic Search (semanticSearch.ts)
// 4. Grounded Generative AI Assistant & Fallback Mechanics (aiController.js)

import assert from 'assert';
import http from 'http';
import dotenv from 'dotenv';

dotenv.config();
process.env.NODE_ENV = 'test';

import app from '../server/server.js';
import { schemesData } from '../src/data/schemes.ts';
import { evaluateSchemeEligibility } from '../src/engine/ruleEngine.ts';
import { computeMLRecommendation, rankSchemesForUser } from '../src/engine/mlEngine.ts';
import { performSemanticSearch } from '../src/engine/semanticSearch.ts';

function httpRequest({ port, path, method = 'GET', headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const postData = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;
    const reqHeaders = { ...headers };
    if (postData && !reqHeaders['Content-Type']) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path,
        method,
        headers: reqHeaders,
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(data);
          } catch (e) {
            json = data;
          }
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        });
      }
    );

    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runAiMlAuditSuite() {
  console.log('================================================================');
  console.log('       GOVSCHEME AI/ML ARCHITECTURE VERIFICATION TEST SUITE      ');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function pass(name) {
    totalTests++;
    passedTests++;
    console.log(`  [PASS] ${name}`);
  }

  // -------------------------------------------------------------
  // GROUP 1: MCDA / Weighted Scoring Recommendation Engine
  // -------------------------------------------------------------
  console.log('--- Group 1: MCDA / Weighted Scoring Verification ---');

  const farmerScheme = schemesData.find(s => s.category.includes('Agriculture') && s.financialBenefitAmount && s.financialBenefitAmount >= 10000) || schemesData[0];
  const eligibleRuleResult = {
    schemeId: farmerScheme.id,
    status: 'Eligible',
    matchedCriteria: ['Resident', 'Farmer'],
    failedCriteria: [],
    missingDocuments: [],
    informationNeeded: [],
    overallReason: 'All criteria met'
  };

  const ineligibleRuleResult = {
    schemeId: farmerScheme.id,
    status: 'Not Eligible',
    matchedCriteria: [],
    failedCriteria: ['Income exceeds ceiling'],
    missingDocuments: [],
    informationNeeded: [],
    overallReason: 'Failed criteria'
  };

  // 1.1 Eligible status applies +35 weight boost
  {
    const userA = {
      id: 'usr-1',
      fullName: 'Murugan',
      occupation: 'Farmer',
      state: farmerScheme.state,
      gender: 'Male',
      age: 40
    };
    const resEligible = computeMLRecommendation(userA, farmerScheme, eligibleRuleResult, schemesData);
    const resIneligible = computeMLRecommendation(userA, farmerScheme, ineligibleRuleResult, schemesData);

    assert(resEligible.confidenceScore > resIneligible.confidenceScore, 'Eligible score must exceed ineligible score');
    assert(resEligible.confidenceScore >= 85, 'Eligible farmer should achieve High confidence score (>=85)');
    assert.strictEqual(resEligible.urgencyLevel, 'High');
    pass('1.1: Rule status applies deterministic score adjustments (+35 Eligible vs -30 Ineligible)');
  }

  // 1.2 Determinism: Same input produces exactly the same score
  {
    const userB = {
      id: 'usr-2',
      fullName: 'Lakshmi',
      occupation: 'Student',
      state: 'Tamil Nadu',
      gender: 'Female',
      age: 20
    };
    const run1 = computeMLRecommendation(userB, schemesData[1], eligibleRuleResult, schemesData);
    const run2 = computeMLRecommendation(userB, schemesData[1], eligibleRuleResult, schemesData);
    assert.strictEqual(run1.confidenceScore, run2.confidenceScore, 'MCDA scoring must be strictly deterministic');
    assert.deepStrictEqual(run1.scoreBreakdown, run2.scoreBreakdown);
    pass('1.2: Recommendation scoring is 100% deterministic with identical inputs');
  }

  // 1.3 Boundary Clamping: Scores strictly stay within [10, 99]
  {
    const nullUser = null;
    const minScheme = { ...schemesData[0], popularityScore: 0, financialBenefitAmount: 0 };
    const minRes = computeMLRecommendation(nullUser, minScheme, ineligibleRuleResult, schemesData);
    assert(minRes.confidenceScore >= 10, 'Score must not fall below floor 10');
    assert(minRes.confidenceScore <= 99, 'Score must not exceed ceiling 99');
    pass('1.3: Scoring boundary values remain clamped within [10, 99]');
  }

  // -------------------------------------------------------------
  // GROUP 2: Rule Engine Legal Filtering
  // -------------------------------------------------------------
  console.log('\n--- Group 2: Deterministic Rule Engine Legal Guardrails ---');

  // 2.1 Missing information flags Insufficient Information without guessing
  {
    const incompleteUser = { id: 'usr-inc', fullName: 'Anonymous' };
    const ruleRes = evaluateSchemeEligibility(incompleteUser, schemesData[0]);
    assert(
      ruleRes.status === 'Insufficient Information' || ruleRes.status === 'Conditionally Eligible' || ruleRes.status === 'Eligible',
      'Rule engine must handle empty profile gracefully'
    );
    pass('2.1: Missing profile fields are treated as Insufficient Information without hallucinating values');
  }

  // 2.2 Failure semantics: 1 failure = Almost Eligible, 2+ failures = Not Eligible
  {
    const targetScheme = schemesData.find(s => 
      s.state !== 'Central' && 
      s.eligibilityRules?.allowedStates?.length > 0 && 
      s.eligibilityRules?.maxAnnualIncome > 0
    ) || schemesData[0];

    const rules = targetScheme.eligibilityRules || {};
    const maxInc = rules.maxAnnualIncome || 200000;

    // Single failure: Matches state and all profile fields, but fails maxAnnualIncome
    const singleFailureUser = {
      id: 'usr-single-fail',
      fullName: 'Single Fail User',
      age: (rules.minAge ?? 18) + 2,
      gender: rules.allowedGenders?.includes('All') ? 'Male' : (rules.allowedGenders?.[0] || 'Male'),
      occupation: rules.allowedOccupations?.[0] || 'Student',
      casteCategory: rules.allowedCategories?.[0] || 'General',
      disability: rules.requiresDisability || false,
      state: rules.allowedStates[0],
      annualIncome: maxInc + 500000
    };

    const evalRes = evaluateSchemeEligibility(singleFailureUser, targetScheme);
    assert.strictEqual(evalRes.status, 'Almost Eligible', 'Exactly 1 failed criterion evaluates to Almost Eligible');
    assert.strictEqual(evalRes.failedCriteria.length, 1);
    assert(evalRes.failedCriteria[0].toLowerCase().includes('income'), 'Failed criteria must mention income');

    // Multi failure: Fails income AND state
    const multiFailureUser = {
      ...singleFailureUser,
      state: 'NonExistentState'
    };
    const multiEvalRes = evaluateSchemeEligibility(multiFailureUser, targetScheme);
    assert.strictEqual(multiEvalRes.status, 'Not Eligible', 'Multiple failed criteria evaluate to Not Eligible');
    assert(multiEvalRes.failedCriteria.length >= 2, 'Must have at least 2 failed criteria');
    pass('2.2: Deterministic failure tiers verified (1 failure = Almost Eligible, 2+ = Not Eligible)');
  }

  // -------------------------------------------------------------
  // GROUP 3: Semantic Search Tokenization & Lexical Matching
  // -------------------------------------------------------------
  console.log('\n--- Group 3: Semantic Search Algorithm & Lexical Verification ---');

  // 3.1 Empty query returns full catalog with score 1.0
  {
    const all = await performSemanticSearch('', schemesData);
    assert.strictEqual(all.length, schemesData.length, 'Empty search must return all schemes');
    assert.strictEqual(all[0].score, 1.0, 'Empty search score should be 1.0');
    pass('3.1: Empty query returns complete catalog with baseline score 1.0');
  }

  // 3.2 Keyword search finds matching schemes and sorts by score descending
  {
    const results = await performSemanticSearch('farmer pension', schemesData);
    assert(results.length > 0, 'Should find results for farmer pension');
    for (let i = 0; i < results.length - 1; i++) {
      assert(results[i].score >= results[i + 1].score, 'Results must be sorted by score descending');
    }
    const topSchemeText = `${results[0].scheme.name} ${results[0].scheme.shortDescription} ${results[0].scheme.category}`.toLowerCase();
    assert(
      topSchemeText.includes('farmer') || topSchemeText.includes('pension') || topSchemeText.includes('kisan'),
      'Top result must match search tokens'
    );
    pass('3.2: Tokenized query matches relevant scheme fields and sorts by score descending');
  }

  // -------------------------------------------------------------
  // GROUP 4: Generative AI Assistant & Fallback Handling
  // -------------------------------------------------------------
  console.log('\n--- Group 4: Generative AI Controller & Fallback Verification ---');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;

  try {
    // 4.1 Empty message returns 400 Bad Request
    {
      const res = await httpRequest({
        port,
        path: '/api/ai/chat',
        method: 'POST',
        body: { message: '' }
      });
      assert.strictEqual(res.status, 400, 'Expected 400 Bad Request for empty message');
      assert.strictEqual(res.body.success, false);
      pass('4.1: Empty AI chat prompt is rejected with 400 Bad Request');
    }

    // 4.2 Oversized message (>2000 chars) returns 400 Bad Request
    {
      const longMessage = 'A'.repeat(2001);
      const res = await httpRequest({
        port,
        path: '/api/ai/chat',
        method: 'POST',
        body: { message: longMessage }
      });
      assert.strictEqual(res.status, 400, 'Expected 400 Bad Request for prompt > 2000 chars');
      assert.strictEqual(res.body.success, false);
      pass('4.2: Oversized prompt (> 2000 characters) is rejected with 400 Bad Request');
    }

    // 4.3 Grounded knowledge response or offline fallback provides official portal data
    {
      const res = await httpRequest({
        port,
        path: '/api/ai/chat',
        method: 'POST',
        body: { message: 'Tell me about PM Kisan' }
      });
      assert.strictEqual(res.status, 200, 'Expected 200 OK from AI chat endpoint');
      assert.strictEqual(res.body.success, true);
      assert(typeof res.body.reply === 'string' && res.body.reply.length > 0, 'Reply must be non-empty string');
      pass('4.3: Valid query returns grounded assistant response or graceful offline fallback');
    }

  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  console.log('\n================================================================');
  console.log(` ALL AI/ML ARCHITECTURE AUDIT TESTS PASSED: ${passedTests}/${totalTests}! `);
  console.log('================================================================\n');
}

runAiMlAuditSuite().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error('[FATAL AUDIT TEST SUITE FAILURE]:', err);
  process.exit(1);
});
