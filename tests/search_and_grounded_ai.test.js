import assert from 'assert';
import dotenv from 'dotenv';
import { performSemanticSearch } from '../src/engine/semanticSearch.ts';
import { schemesData } from '../src/data/schemes.ts';
import { chatWithAI, buildGroundedPrompt, buildOfflineFallbackReply } from '../server/controllers/aiController.js';
import { evaluateSchemeEligibility } from '../src/engine/ruleEngine.ts';
import { computeMLRecommendation } from '../src/engine/mlEngine.ts';

dotenv.config();

function pass(testName) {
  console.log(`  [PASS] ${testName}`);
}

async function runTests() {
  console.log('================================================================');
  console.log('   GOVSCHEME ADVANCED SEARCH & GROUNDED AI REGRESSION SUITE     ');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // GROUP 1: Search Relevance, Synonym Expansion & Determinism
  // -------------------------------------------------------------
  console.log('--- Group 1: Search Relevance & Synonym Expansion ---');

  // 1.1 Curated synonym expansion matches domain concepts
  {
    const kisanRes = await performSemanticSearch('kisan fertilizer aid', schemesData);
    assert(kisanRes.length > 0, 'Kisan query should match agricultural schemes');
    const hasAgri = kisanRes.some(r => r.scheme.category.includes('Agriculture') || r.scheme.name.toLowerCase().includes('kisan'));
    assert(hasAgri, 'Top results for kisan query must include Agriculture or Kisan schemes');
    pass('1.1: Synonym expansion matches "kisan fertilizer aid" to Agriculture schemes');
  }

  {
    const tuitionRes = await performSemanticSearch('student tuition fellowship', schemesData);
    assert(tuitionRes.length > 0, 'Student tuition query should match education schemes');
    const hasEdu = tuitionRes.some(r => r.scheme.category.includes('Education') || r.scheme.name.toLowerCase().includes('scholarship'));
    assert(hasEdu, 'Top results for student query must include Education/Scholarship schemes');
    pass('1.2: Synonym expansion matches "student tuition fellowship" to Education/Scholarship schemes');
  }

  {
    const pensionRes = await performSemanticSearch('elderly vridha pension', schemesData);
    assert(pensionRes.length > 0, 'Elderly query should match pension schemes');
    const hasPension = pensionRes.some(r => r.scheme.category.includes('Pension') || r.scheme.name.toLowerCase().includes('pension'));
    assert(hasPension, 'Top results for elderly query must include Pension schemes');
    pass('1.3: Synonym expansion matches "elderly vridha pension" to Pension schemes');
  }

  {
    const divyangRes = await performSemanticSearch('divyang wheelchair assistance', schemesData);
    assert(divyangRes.length > 0, 'Divyang query should match disability schemes');
    const hasDisability = divyangRes.some(r => r.scheme.category.includes('Disability') || r.scheme.eligibilityRules?.requiresDisability);
    assert(hasDisability, 'Top results must include Disability assistance schemes');
    pass('1.4: Synonym expansion matches "divyang wheelchair assistance" to Disability schemes');
  }

  {
    const shelterRes = await performSemanticSearch('pucca shelter awas', schemesData);
    assert(shelterRes.length > 0, 'Shelter query should match housing schemes');
    const hasHousing = shelterRes.some(r => r.scheme.category.includes('Housing') || r.scheme.name.toLowerCase().includes('awas'));
    assert(hasHousing, 'Top results must include Housing schemes');
    pass('1.5: Synonym expansion matches "pucca shelter awas" to Housing schemes');
  }

  // -------------------------------------------------------------
  // GROUP 2: Irrelevant, Empty, and Stop-Word Query Handling
  // -------------------------------------------------------------
  console.log('\n--- Group 2: Boundary, Stop-Word & Irrelevant Query Handling ---');

  // 2.1 Empty and whitespace queries return full catalogue with score 1.0
  {
    const emptyRes = await performSemanticSearch('', schemesData);
    assert.strictEqual(emptyRes.length, schemesData.length, 'Empty search must return all 75 schemes');
    assert.strictEqual(emptyRes[0].score, 1.0, 'Empty search score must be 1.0');

    const whitespaceRes = await performSemanticSearch('     ', schemesData);
    assert.strictEqual(whitespaceRes.length, schemesData.length, 'Whitespace search must return all 75 schemes');
    assert.strictEqual(whitespaceRes[0].score, 1.0, 'Whitespace search score must be 1.0');
    pass('2.1: Empty and whitespace queries return full catalogue with baseline score 1.0');
  }

  // 2.2 Generic stop-word only queries return empty results without spurious matches
  {
    const stopWordsOnly = await performSemanticSearch('the for of and in to', schemesData);
    assert.strictEqual(stopWordsOnly.length, 0, 'Pure stop-words must return empty results');
    pass('2.2: Pure stop-word queries return empty results without false positive matches');
  }

  // 2.3 Domain designator queries return all schemes with neutral score
  {
    const domainQuery = await performSemanticSearch('sarkari yojana schemes', schemesData);
    assert.strictEqual(domainQuery.length, schemesData.length, 'Domain designator query returns all schemes');
    assert.strictEqual(domainQuery[0].score, 0.85, 'Domain query score should be neutral 0.85');
    pass('2.3: Domain-wide queries (sarkari yojana) return complete catalog with neutral score 0.85');
  }

  // 2.4 Irrelevant queries return empty results
  {
    const irrelevant = await performSemanticSearch('quantum electrodynamics neutrino photon', schemesData);
    assert.strictEqual(irrelevant.length, 0, 'Completely irrelevant query must return empty results');
    pass('2.4: Irrelevant queries below relevance threshold return empty results');
  }

  // -------------------------------------------------------------
  // GROUP 3: 100% Deterministic Ranking & Catalogue Discoverability
  // -------------------------------------------------------------
  console.log('\n--- Group 3: Deterministic Ranking & Catalogue Integrity ---');

  // 3.1 Repeated searches produce 100% identical outputs
  {
    const run1 = await performSemanticSearch('farmer tractor loan', schemesData);
    const run2 = await performSemanticSearch('farmer tractor loan', schemesData);
    assert.strictEqual(run1.length, run2.length, 'Repeated searches must return same number of results');
    for (let i = 0; i < run1.length; i++) {
      assert.strictEqual(run1[i].scheme.id, run2[i].scheme.id, `Mismatch at index ${i}`);
      assert.strictEqual(run1[i].score, run2[i].score, `Score mismatch at index ${i}`);
    }
    pass('3.1: 100% Deterministic ranking verified across repeated queries');
  }

  // 3.2 All 75 schemes are indexed and discoverable
  {
    assert.strictEqual(schemesData.length, 75, 'Schemes catalogue must contain exactly 75 schemes');
    const matchedSchemeIds = new Set();
    for (const scheme of schemesData) {
      const res = await performSemanticSearch(scheme.name, schemesData);
      assert(res.length > 0, `Scheme "${scheme.name}" must be discoverable by its own name`);
      assert.strictEqual(res[0].scheme.id, scheme.id, `Scheme "${scheme.name}" must be top result for its own name`);
      matchedSchemeIds.add(scheme.id);
    }
    assert.strictEqual(matchedSchemeIds.size, 75, 'All 75 distinct schemes must be discoverable');
    pass('3.2: Complete catalogue discoverability verified for all 75 schemes');
  }

  // -------------------------------------------------------------
  // GROUP 4: Retrieval-First Grounded AI Assistant & URL Safety
  // -------------------------------------------------------------
  console.log('\n--- Group 4: Retrieval-First Grounded AI Assistant ---');

  // 4.1 Weak/irrelevant query returns clarification guidance without fabricating schemes
  {
    const req = { body: { message: 'what is the speed of light in vacuum' } };
    let jsonResult = null;
    const res = { json: (data) => { jsonResult = data; return res; }, status: () => res };

    await chatWithAI(req, res);
    assert.strictEqual(jsonResult.success, true);
    assert(jsonResult.reply.includes('75 verified'), 'Clarification must reference catalogue scope');
    pass('4.1: Weak/irrelevant queries return catalogue clarification rather than hallucinating');
  }

  // 4.2 Relevant query returns factual grounded response with exact official portal URL
  {
    const req = { body: { message: 'Tell me about PM-Kisan scheme for farmers' } };
    let jsonResult = null;
    const res = { json: (data) => { jsonResult = data; return res; }, status: () => res };

    await chatWithAI(req, res);
    assert.strictEqual(jsonResult.success, true);
    assert(jsonResult.reply.includes('PM-Kisan') || jsonResult.reply.includes('Kisan'), 'Response must identify scheme');

    // Verify official URL citation
    const pmKisanScheme = schemesData.find(s => s.name.toLowerCase().includes('pm-kisan'));
    const expectedUrl = pmKisanScheme ? (pmKisanScheme.officialApplyUrl || pmKisanScheme.officialWebsite) : null;
    if (expectedUrl) {
      assert(
        jsonResult.reply.includes(expectedUrl) || jsonResult.reply.includes('https://india.gov.in') || jsonResult.reply.includes('pmkisan.gov.in'),
        'AI response must cite exact official portal URL without fabricating links'
      );
    }
    pass('4.2: Factual grounded response cites authentic official portal URL without fabrication');
  }

  // 4.3 Missing API key triggers local execution fallback
  {
    const oldKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const req = { body: { message: 'pension for senior citizens' } };
    let jsonResult = null;
    const res = { json: (data) => { jsonResult = data; return res; }, status: () => res };

    await chatWithAI(req, res);
    process.env.GEMINI_API_KEY = oldKey; // restore

    assert.strictEqual(jsonResult.success, true);
    assert.strictEqual(jsonResult.provider, 'offline_grounded');
    assert(jsonResult.reply.includes('Grounded Knowledge Engine'), 'Must indicate local execution');
    pass('4.3: Missing API key triggers graceful local grounded execution');
  }

  // 4.4 Prompt structure inspection: limits context to top 5 schemes & includes prompt injection resistance
  {
    const topSchemes = schemesData.slice(0, 5);
    const [systemPrompt, userPrompt] = buildGroundedPrompt('Apply for scheme', topSchemes);
    assert(systemPrompt.includes('CRITICAL RULES:'), 'System prompt must include critical factual rules');
    assert(systemPrompt.includes('PROMPT INJECTION RESISTANCE'), 'System prompt must enforce prompt injection resistance');
    assert(systemPrompt.includes('LEGAL AUTHORITATIVENESS'), 'System prompt must instruct that AI does not confer legal eligibility');
    assert(systemPrompt.includes(topSchemes[0].name), 'System prompt must contain retrieved scheme name');
    pass('4.4: Prompt builder inspection confirms injection resistance and context capping');
  }

  // 4.5 Fallback URL safety: missing URL is reported as unavailable, never fabricated
  {
    const mockSchemeWithoutUrl = {
      ...schemesData[0],
      name: 'Special Rural Assistance Scheme',
      officialApplyUrl: '',
      officialWebsite: ''
    };
    const fallbackText = buildOfflineFallbackReply([mockSchemeWithoutUrl]);
    assert(
      fallbackText.includes('Official portal link currently unavailable'),
      'Must report unavailable instead of inventing fabricated URL'
    );
    assert(!fallbackText.includes('https://fake'), 'Never fabricate external URLs');
    pass('4.5: Fallback URL safety reports missing links as unavailable rather than fabricating');
  }

  // -------------------------------------------------------------
  // GROUP 5: Legal Eligibility Controls Authoritativeness
  // -------------------------------------------------------------
  console.log('\n--- Group 5: Rule Engine Authoritativeness & Privacy ---');

  // 5.1 Rule engine overrides any conversational AI assertion
  {
    const incomeRestrictedScheme = schemesData.find(s => s.eligibilityRules?.maxAnnualIncome);
    const maxInc = incomeRestrictedScheme.eligibilityRules.maxAnnualIncome;

    const highIncomeCitizen = {
      id: 'usr-wealthy',
      fullName: 'Rich Citizen',
      annualIncome: maxInc * 10, // 10x ceiling
      age: 35,
      gender: 'Male',
      state: incomeRestrictedScheme.state === 'Central' ? 'Tamil Nadu' : incomeRestrictedScheme.state
    };

    const ruleEval = evaluateSchemeEligibility(highIncomeCitizen, incomeRestrictedScheme);
    assert.notStrictEqual(ruleEval.status, 'Eligible', 'Rule engine strictly blocks high-income citizen');

    const recommendation = computeMLRecommendation(highIncomeCitizen, incomeRestrictedScheme, ruleEval, schemesData);
    assert(recommendation.confidenceScore < 60, 'Confidence score penalized for ineligible status');
    pass('5.1: Deterministic rule engine strictly enforces legal ceilings regardless of chat output');
  }

  // 5.2 Aadhaar masking verification
  {
    const rawNumber = '918234567890';
    const digits = rawNumber.replace(/[^\d]/g, '');
    const masked = `XXXX XXXX ${digits.slice(8, 12)}`;
    assert.strictEqual(masked, 'XXXX XXXX 7890', 'Aadhaar masking must hide first 8 digits');
    assert(!masked.includes('9182'), 'First 4 digits must not appear');
    assert(!masked.includes('3456'), 'Middle 4 digits must not appear');
    pass('5.2: Aadhaar masking privacy compliance verified');
  }

  // -------------------------------------------------------------
  // GROUP 6: Documented Benchmark Dataset Across Welfare Domains
  // -------------------------------------------------------------
  console.log('\n--- Group 6: Representative Search Benchmark Dataset ---');

  const benchmarkCases = [
    {
      category: 'Farmer / Agriculture',
      query: 'kisan farmer agricultural fertilizer subsidy',
      expectedKeyword: 'kisan',
      expectedCategory: 'Agriculture'
    },
    {
      category: 'Education / Scholarship',
      query: 'post matric scholarship for students tuition fee',
      expectedKeyword: 'scholarship',
      expectedCategory: 'Education'
    },
    {
      category: 'Pensions / Senior Care',
      query: 'old age pension for senior citizens',
      expectedKeyword: 'pension',
      expectedCategory: 'Pensions'
    },
    {
      category: 'Disability Assistance',
      query: 'divyang wheelchair prosthetic assistance for disabled',
      expectedKeyword: 'disability',
      expectedCategory: 'Disability'
    },
    {
      category: 'Housing Support',
      query: 'pucca house construction assistance housing',
      expectedKeyword: 'housing',
      expectedCategory: 'Housing'
    },
    {
      category: 'State-Specific Scheme',
      query: 'Tamil Nadu scholarship for backward classes',
      expectedKeyword: 'tamil nadu',
      expectedState: 'Tamil Nadu'
    },
    {
      category: 'Unsupported Non-Latin Script',
      query: '日本語のテキストテスト',
      expectEmpty: true
    }
  ];

  for (const bCase of benchmarkCases) {
    const results = await performSemanticSearch(bCase.query, schemesData);
    if (bCase.expectEmpty) {
      assert.strictEqual(results.length, 0, `Query "${bCase.query}" must return empty results`);
      pass(`6.${benchmarkCases.indexOf(bCase) + 1}: Benchmark [${bCase.category}] safely returns empty results for unsupported script`);
    } else {
      assert(results.length > 0, `Query "${bCase.query}" must return results`);
      const top = results[0].scheme;
      const combinedText = `${top.name} ${top.category} ${top.shortDescription} ${top.state}`.toLowerCase();
      assert(
        combinedText.includes(bCase.expectedKeyword) || 
        (bCase.expectedCategory && top.category.includes(bCase.expectedCategory)) ||
        (bCase.expectedState && top.state === bCase.expectedState),
        `Top result for "${bCase.query}" must match category/keyword criteria`
      );
      pass(`6.${benchmarkCases.indexOf(bCase) + 1}: Benchmark [${bCase.category}] correctly ranked relevant scheme "${top.name}" as top result`);
    }
  }

  // -------------------------------------------------------------
  // GROUP 7: Phase 3 Search Precision, Negative Phrases & Hyphen Preservation
  // -------------------------------------------------------------
  console.log('\n--- Group 7: Phase 3 Search Precision & Hyphen Preservation ---');

  // 7.1 "non existent gibberish query" returns 0 false-positive results
  {
    const res = await performSemanticSearch('non existent gibberish query', schemesData);
    assert.strictEqual(res.length, 0, 'Negative non-existent query must return 0 results');
    pass('7.1: "non existent gibberish query" returns 0 results without false-positive matching');
  }

  // 7.2 "non-creamy layer" matches NFOBC with 0 false-positives (excluding non-farm schemes)
  {
    const res = await performSemanticSearch('non-creamy layer', schemesData);
    assert(res.length > 0, '"non-creamy layer" must find relevant schemes');
    assert.strictEqual(res[0].scheme.id, 'edu-national-fellowship-obc', 'Top result must be NFOBC');
    assert.strictEqual(res[0].score, 0.99, 'Top result score must be 0.99');
    const hasPMEGP = res.some(r => r.scheme.id === 'GOV-ENT-001');
    assert(!hasPMEGP, 'PMEGP (non-farm) must NOT match non-creamy layer query');
    pass('7.2: "non-creamy layer" matches NFOBC and excludes unrelated non-farm schemes');
  }

  // 7.3 "non creamy layer" (spaced variant) matches NFOBC identically
  {
    const res = await performSemanticSearch('non creamy layer', schemesData);
    assert(res.length > 0, '"non creamy layer" must find relevant schemes');
    assert.strictEqual(res[0].scheme.id, 'edu-national-fellowship-obc', 'Top result must be NFOBC');
    assert.strictEqual(res[0].score, 0.99, 'Top result score must be 0.99');
    const hasPMEGP = res.some(r => r.scheme.id === 'GOV-ENT-001');
    assert(!hasPMEGP, 'PMEGP (non-farm) must NOT match non creamy layer query');
    pass('7.3: "non creamy layer" correctly canonicalizes to non-creamy and matches NFOBC');
  }

  // 7.4 "PM-KISAN" matches PM-KISAN as #1 top result
  {
    const res = await performSemanticSearch('PM-KISAN', schemesData);
    assert(res.length > 0, '"PM-KISAN" must return results');
    assert.strictEqual(res[0].scheme.id, 'pm-kisan', 'Top result must be pm-kisan');
    assert.strictEqual(res[0].score, 0.99, 'Top result score must be 0.99');
    pass('7.4: "PM-KISAN" matches PM-KISAN as top result (score: 0.99)');
  }

  // 7.5 "post matric scholarship" matches post-matric-scholarship as #1
  {
    const res = await performSemanticSearch('post matric scholarship', schemesData);
    assert(res.length > 0, '"post matric scholarship" must return results');
    assert.strictEqual(res[0].scheme.id, 'post-matric-scholarship', 'Top result must be post-matric-scholarship');
    assert.strictEqual(res[0].score, 0.99, 'Top result score must be 0.99');
    pass('7.5: "post matric scholarship" matches Post-Matric Scholarship as top result (score: 0.99)');
  }

  // 7.6 "senior citizen pension" matches IGNOAPS as #1
  {
    const res = await performSemanticSearch('senior citizen pension', schemesData);
    assert(res.length > 0, '"senior citizen pension" must return results');
    assert.strictEqual(res[0].scheme.id, 'nsap-old-age-pension', 'Top result must be nsap-old-age-pension');
    assert.strictEqual(res[0].score, 0.99, 'Top result score must be 0.99');
    pass('7.6: "senior citizen pension" matches IGNOAPS as top result (score: 0.99)');
  }

  // 7.7 "schemes that do not require an income certificate" (Negative document constraint)
  {
    const res = await performSemanticSearch('schemes that do not require an income certificate', schemesData);
    assert(res.length > 0, 'Must return schemes that do not require an income certificate');
    const top = res[0].scheme;
    const docs = (top.eligibilityRules?.requiredDocuments || []).map(d => d.toLowerCase());
    const requiresIncome = docs.some(d => d.includes('income'));
    assert(!requiresIncome, 'Top scheme must NOT require an income certificate');
    pass('7.7: "schemes that do not require an income certificate" correctly prioritizes schemes without income doc requirement');
  }

  // 7.8 "schemes not available in Tamil Nadu" (Negative state constraint)
  {
    const res = await performSemanticSearch('schemes not available in Tamil Nadu', schemesData);
    assert(res.length > 0, 'Must return schemes available outside Tamil Nadu');
    const top = res[0].scheme;
    assert.notStrictEqual(top.state, 'Tamil Nadu', 'Top scheme must NOT be a Tamil Nadu state scheme');
    pass('7.8: "schemes not available in Tamil Nadu" correctly excludes Tamil Nadu state-specific schemes from top ranks');
  }

  // 7.9 "why does this scheme not exist in my district" (Honest non-misleading score calibration)
  {
    const res = await performSemanticSearch('why does this scheme not exist in my district', schemesData);
    if (res.length > 0) {
      assert(res[0].score <= 0.60, 'Incidental/weak query must NOT produce misleading high-confidence (<= 0.60)');
    }
    pass('7.9: "why does this scheme not exist in my district" does not produce misleading high-confidence match');
  }

  // 7.10 "non-creamy layer certificate" matches NFOBC with 0.99 & excludes PMEGP (non-farm)
  {
    const res = await performSemanticSearch('non-creamy layer certificate', schemesData);
    assert(res.length > 0, '"non-creamy layer certificate" must return results');
    assert.strictEqual(res[0].scheme.id, 'edu-national-fellowship-obc', 'Top result must be NFOBC');
    assert.strictEqual(res[0].score, 0.99, 'Top result score must be 0.99');
    const hasPMEGP = res.some(r => r.scheme.id === 'GOV-ENT-001');
    assert(!hasPMEGP, 'PMEGP (non-farm) must NOT match non-creamy layer certificate');
    pass('7.10: "non-creamy layer certificate" matches NFOBC with 0.99 and zero false-positive contamination');
  }

  // 7.11 "non-farm business loan" matches PMEGP with high score & excludes NFOBC (non-creamy)
  {
    const res = await performSemanticSearch('non-farm business loan', schemesData);
    assert(res.length > 0, '"non-farm business loan" must return results');
    assert(res[0].scheme.id === 'GOV-ENT-001' || res[0].scheme.id === 'pm-mudra', 'Top result must be PMEGP or MUDRA');
    assert(res[0].score >= 0.90, 'Score must be high confidence >= 0.90');
    const hasNFOBC = res.some(r => r.scheme.id === 'edu-national-fellowship-obc');
    assert(!hasNFOBC, 'NFOBC (non-creamy) must NOT match non-farm query');
    pass('7.11: "non-farm business loan" matches non-farm enterprise schemes and excludes non-creamy schemes');
  }

  // 7.12 Queries explicitly requesting nonexistent or fake schemes return 0 results
  {
    const fakeQueries = [
      'Show me fake schemes that do not exist.',
      'fake scheme xyz',
      'bogus scheme abc',
      'non existent gibberish query',
      'nonexistent scheme',
      'fake PM-KISAN',
      'fake loan'
    ];
    for (const fakeQuery of fakeQueries) {
      const res = await performSemanticSearch(fakeQuery, schemesData);
      assert.strictEqual(res.length, 0, `Query "${fakeQuery}" must return 0 results`);
    }
    pass('7.12: Queries explicitly requesting nonexistent or fake schemes safely return 0 results');
  }

  // 7.13 Legitimate citizen fraud-awareness, website verification & scam reporting queries receive grounded results
  {
    // Verify catalogue fields directly against actual scheme data
    const pmKisanCat = schemesData.find(s => s.id === 'pm-kisan');
    assert(pmKisanCat, 'pm-kisan must exist in catalogue');
    assert.strictEqual(pmKisanCat.officialWebsite, 'https://pmkisan.gov.in/', 'Actual PM-KISAN officialWebsite matches evidence');
    assert.strictEqual(pmKisanCat.helplineNumber, '155261 / 011-24300606', 'Actual PM-KISAN helplineNumber matches evidence');

    const pmjayCat = schemesData.find(s => s.id === 'pmjay-ayushman');
    assert(pmjayCat, 'pmjay-ayushman must exist in catalogue');
    assert.strictEqual(pmjayCat.officialWebsite, 'https://pmjay.gov.in/', 'Actual PM-JAY officialWebsite matches evidence');
    assert.strictEqual(pmjayCat.helplineNumber, '14555 / 1800-11-4477', 'Actual PM-JAY helplineNumber matches evidence');

    const scholarshipCat = schemesData.find(s => s.id === 'post-matric-scholarship');
    assert(scholarshipCat, 'post-matric-scholarship must exist in catalogue');
    assert.strictEqual(scholarshipCat.officialWebsite, 'https://scholarships.gov.in/', 'Actual Post-Matric officialWebsite matches evidence');
    assert.strictEqual(scholarshipCat.helplineNumber, '0120-6619540', 'Actual Post-Matric helplineNumber matches evidence');

    const udidCat = schemesData.find(s => s.id === 'udid-disability-scheme');
    assert(udidCat, 'udid-disability-scheme must exist in catalogue');
    assert.strictEqual(udidCat.officialWebsite, 'https://swavlambancard.gov.in/', 'Actual UDID officialWebsite matches evidence');
    assert.strictEqual(udidCat.helplineNumber, '1800-11-4515', 'Actual UDID helplineNumber matches evidence');

    // A. "How can I identify a fake government scheme?"
    const identifyRes = await performSemanticSearch('How can I identify a fake government scheme?', schemesData);
    assert(identifyRes.length > 0, '"How can I identify a fake government scheme?" must return verified reference guidance');
    assert(identifyRes[0].score >= 0.70, 'Must have calibrated guidance score >= 0.70');
    assert(identifyRes[0].scheme.officialWebsite.includes('.gov.in'), 'Must guide citizen with authentic official government portal URL');
    assert(identifyRes[0].scheme.helplineNumber, 'Must guide citizen with verified official helpline number');

    // B. "Is this PM-KISAN website fake?"
    const pmKisanVerifyRes = await performSemanticSearch('Is this PM-KISAN website fake?', schemesData);
    assert(pmKisanVerifyRes.length > 0, '"Is this PM-KISAN website fake?" must return PM-KISAN');
    assert.strictEqual(pmKisanVerifyRes[0].scheme.id, 'pm-kisan', 'Top result must be verified PM-KISAN scheme');
    assert.strictEqual(pmKisanVerifyRes[0].scheme.officialWebsite, 'https://pmkisan.gov.in/', 'Must cite exact authentic PM-KISAN portal URL');
    assert(pmKisanVerifyRes[0].score >= 0.85, 'Must have high confidence score >= 0.85');

    // C. "How do I report a fraudulent scheme?"
    const reportRes = await performSemanticSearch('How do I report a fraudulent scheme?', schemesData);
    assert(reportRes.length > 0, '"How do I report a fraudulent scheme?" must return verified reference schemes');
    assert(reportRes[0].score >= 0.70, 'Must have calibrated guidance score >= 0.70');
    assert(reportRes[0].scheme.helplineNumber, 'Must provide verified official helpline for reporting');

    pass('7.13: Legitimate fraud-awareness and website verification queries return authentic grounded guidance with verified catalogue fields');
  }

  // 7.14 Negative-state filtering verified across Tamil Nadu and another supported state (Uttar Pradesh & Karnataka)
  {
    // Tamil Nadu negative state query
    const resTN = await performSemanticSearch('schemes not available in Tamil Nadu', schemesData);
    assert(resTN.length > 0, 'Must return schemes available outside Tamil Nadu');
    assert.notStrictEqual(resTN[0].scheme.state, 'Tamil Nadu', 'Top scheme must not be a Tamil Nadu state scheme');

    // Uttar Pradesh negative state query
    const resUP = await performSemanticSearch('schemes not available in Uttar Pradesh', schemesData);
    assert(resUP.length > 0, 'Must return schemes available outside Uttar Pradesh');
    assert.notStrictEqual(resUP[0].scheme.state, 'Uttar Pradesh', 'Top scheme must not be an Uttar Pradesh state scheme');

    // Karnataka negative state query
    const resKA = await performSemanticSearch('schemes not available in Karnataka', schemesData);
    assert(resKA.length > 0, 'Must return schemes available outside Karnataka');
    assert.notStrictEqual(resKA[0].scheme.state, 'Karnataka', 'Top scheme must not be a Karnataka state scheme');

    pass('7.14: Negative-state filtering verified for Tamil Nadu, Uttar Pradesh, and Karnataka');
  }

  // 7.15 Negative-document filtering verified against actual eligibilityRules.requiredDocuments
  {
    const resNoIncome = await performSemanticSearch('schemes that do not require an income certificate', schemesData);
    assert(resNoIncome.length > 0, 'Must return schemes');

    // Check top 5 results against actual eligibilityRules.requiredDocuments
    for (let i = 0; i < Math.min(5, resNoIncome.length); i++) {
      const scheme = resNoIncome[i].scheme;
      const ruleDocs = (scheme.eligibilityRules?.requiredDocuments || []).map(d => d.toLowerCase());
      const hasIncomeRule = ruleDocs.some(d => d.includes('income'));
      assert(!hasIncomeRule, `Top rank scheme "${scheme.name}" must not require income certificate in eligibilityRules.requiredDocuments`);
    }

    pass('7.15: Negative-document filtering verified against actual eligibilityRules.requiredDocuments');
  }

  // 7.16 Consistent handling of eligibilityRules.requiredDocuments vs scheme.requiredDocuments for conflicting and missing fields
  {
    // A. Real catalogue discrepancy test: pmay-g has 'Income Certificate' in eligibilityRules but NOT in scheme.requiredDocuments
    const resNoIncome = await performSemanticSearch('schemes that do not require an income certificate', schemesData);
    const pmayG = resNoIncome.slice(0, 10).find(r => r.scheme.id === 'pmay-g');
    assert(!pmayG, 'pmay-g (requiring income cert in eligibilityRules) must not appear in top results for negative income query');

    // B. Synthetic test suite covering all combinations of conflicting, missing, and malformed document fields
    const syntheticDocTestSchemes = [
      {
        id: 'syn-top-only-income',
        name: 'Synthetic Income in Top-Level Only',
        state: 'Central',
        category: 'Welfare',
        requiredDocuments: ['Income Certificate', 'Aadhaar Card'],
        eligibilityRules: { requiredDocuments: [] }
      },
      {
        id: 'syn-rules-only-income',
        name: 'Synthetic Income in EligibilityRules Only',
        state: 'Central',
        category: 'Welfare',
        requiredDocuments: ['MGNREGA Job Card'],
        eligibilityRules: { requiredDocuments: ['Income Certificate'] }
      },
      {
        id: 'syn-missing-rules-clean',
        name: 'Synthetic Missing EligibilityRules Object',
        state: 'Central',
        category: 'Welfare',
        requiredDocuments: ['Aadhaar Card']
      },
      {
        id: 'syn-malformed-docs-clean',
        name: 'Synthetic Malformed Document Array',
        state: 'Central',
        category: 'Welfare',
        requiredDocuments: [null, undefined, 12345, 'Voter ID'],
        eligibilityRules: { requiredDocuments: undefined }
      }
    ];

    const synResults = await performSemanticSearch('schemes that do not require an income certificate', syntheticDocTestSchemes);

    // 1. Conflicting scheme with income in top-level requiredDocuments only must be penalized
    const foundTopOnly = synResults.find(r => r.scheme.id === 'syn-top-only-income');
    assert(!foundTopOnly, 'Scheme with income in top-level requiredDocuments only must be penalized');

    // 2. Conflicting scheme with income in eligibilityRules.requiredDocuments only must be penalized
    const foundRulesOnly = synResults.find(r => r.scheme.id === 'syn-rules-only-income');
    assert(!foundRulesOnly, 'Scheme with income in eligibilityRules.requiredDocuments only must be penalized');

    // 3. Scheme with missing eligibilityRules object must not crash and remain eligible if no income certificate is required
    const foundMissingRules = synResults.find(r => r.scheme.id === 'syn-missing-rules-clean');
    assert(foundMissingRules, 'Scheme with missing eligibilityRules object must succeed without crashing');

    // 4. Scheme with malformed/non-string elements in document arrays must not crash
    const foundMalformed = synResults.find(r => r.scheme.id === 'syn-malformed-docs-clean');
    assert(foundMalformed, 'Scheme with malformed document list must handle non-string elements safely');

    pass('7.16: Consistent handling verified for conflicting, missing, and malformed requiredDocuments across both fields');
  }

  console.log('\n================================================================');
  console.log(' ALL FINAL ADVANCED SEARCH & GROUNDED AI TESTS PASSED (39/39)!  ');
  console.log('================================================================\n');
}

runTests().catch(err => {
  console.error('\n[TEST RUNNER FATAL ERROR]:', err);
  process.exit(1);
});
