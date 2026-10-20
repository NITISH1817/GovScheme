// tests/multilingual_search.test.js
// GovScheme Phase 5 — Multilingual and Transliteration-Aware Search Regression Suite
// Covers 15 mandatory test categories:
// 1. English scheme-name searches
// 2. Queries in each regional script (hi, ta, te, ml, mr, gu)
// 3. Common Latin-script transliterations
// 4. Mixed English and regional-language terms
// 5. Unicode normalization and punctuation handling
// 6. Spelling variants and synonyms
// 7. Empty, whitespace-only, and malformed inputs
// 8. Deterministic output for repeated queries
// 9. Exact scheme-name ranking stability
// 10. Negative fake/nonexistent scheme intent across languages
// 11. Negative-document queries across English and regional phrasing
// 12. State/location exclusions across English and regional phrasing
// 13. Fraud-awareness guidance behavior across languages
// 14. Phase 4 eligibility explanation and document status preservation
// 15. Honest empty results for queries with no valid match

import assert from 'assert';
import { schemesData } from '../src/data/schemes.ts';
import { performSemanticSearch, normalizeText } from '../src/engine/semanticSearch.ts';
import { evaluateExplainableEligibility } from '../src/engine/explainableEligibility.ts';
import { evaluateSchemeEligibility } from '../src/engine/ruleEngine.ts';

function pass(name) {
  console.log(`  [PASS] ${name}`);
}

async function runMultilingualSearchTests() {
  console.log('================================================================');
  console.log('   GOVSCHEME PHASE 5: MULTILINGUAL & TRANSLITERATION TEST SUITE ');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // Test 1: English Scheme-Name Searches
  // -------------------------------------------------------------
  console.log('--- Test 1: English Scheme-Name Searches ---');
  {
    const resKisan = await performSemanticSearch('PM-KISAN', schemesData);
    assert(resKisan.length > 0, 'PM-KISAN search must return results');
    assert.strictEqual(resKisan[0].scheme.id, 'pm-kisan', 'Top result must be pm-kisan');
    assert.strictEqual(resKisan[0].score, 0.99, 'Score must be 0.99');

    const resAyushman = await performSemanticSearch('Ayushman Bharat', schemesData);
    assert(resAyushman.length > 0, 'Ayushman Bharat search must return results');
    assert.strictEqual(resAyushman[0].scheme.id, 'pmjay-ayushman', 'Top result must be pmjay-ayushman');
    assert(resAyushman[0].score >= 0.95, 'Score must be >= 0.95');

    const resScholarship = await performSemanticSearch('Post-Matric Scholarship for SC/ST/OBC Students', schemesData);
    assert(resScholarship.length > 0, 'Post-Matric Scholarship search must return results');
    assert.strictEqual(resScholarship[0].scheme.id, 'post-matric-scholarship', 'Top result must be post-matric-scholarship');

    pass('1.1: English scheme-name searches rank exact and phrase titles with high confidence');
  }

  // -------------------------------------------------------------
  // Test 2: Queries in Each Regional Script (hi, ta, te, ml, mr, gu)
  // -------------------------------------------------------------
  console.log('\n--- Test 2: Queries in Each Regional Script ---');
  {
    // A. Hindi
    const resHi = await performSemanticSearch('किसान सम्मान निधि', schemesData);
    assert(resHi.length > 0, 'Hindi Kisan search must return results');
    assert.strictEqual(resHi[0].scheme.id, 'pm-kisan', 'Top result for Hindi Kisan must be pm-kisan');
    assert.strictEqual(resHi[0].score, 0.99, 'Top score must be 0.99');

    const resHiSchol = await performSemanticSearch('छात्रवृत्ति', schemesData);
    assert(resHiSchol.length > 0, 'Hindi scholarship search must return results');
    assert.strictEqual(resHiSchol[0].scheme.id, 'post-matric-scholarship', 'Top result for छात्रवृत्ति must be post-matric-scholarship');

    // B. Tamil
    const resTa = await performSemanticSearch('விவசாயி', schemesData);
    assert(resTa.length > 0, 'Tamil farmer search must return results');
    assert.strictEqual(resTa[0].scheme.id, 'pm-kisan', 'Top result for விவசாயி must be pm-kisan');

    const resTaPenn = await performSemanticSearch('புதுமைப் பெண்', schemesData);
    assert(resTaPenn.length > 0, 'Tamil Pudhumai Penn search must return results');
    assert.strictEqual(resTaPenn[0].scheme.id, 'tn-pudhumai-penn', 'Top result for புதுமைப் பெண் must be tn-pudhumai-penn');
    assert.strictEqual(resTaPenn[0].score, 0.99, 'Top score must be 0.99');

    const resTaPension = await performSemanticSearch('முதியோர் ஓய்வூதியம்', schemesData);
    assert(resTaPension.length > 0, 'Tamil old age pension search must return results');
    assert.strictEqual(resTaPension[0].scheme.id, 'nsap-old-age-pension', 'Top result for முதியோர் ஓய்வூதியம் must be nsap-old-age-pension');

    // C. Telugu
    const resTe = await performSemanticSearch('రైతు బంధు', schemesData);
    assert(resTe.length > 0, 'Telugu Rythu Bandhu search must return results');
    assert.strictEqual(resTe[0].scheme.id, 'telangana-rythu-bandhu', 'Top result for రైతు బంధు must be telangana-rythu-bandhu');
    assert.strictEqual(resTe[0].score, 0.99, 'Top score must be 0.99');

    const resTeSchol = await performSemanticSearch('విద్యార్థి స్కాలర్‌షిప్', schemesData);
    assert(resTeSchol.length > 0, 'Telugu student scholarship search must return results');
    assert.strictEqual(resTeSchol[0].scheme.id, 'post-matric-scholarship', 'Top result must be post-matric-scholarship');

    // D. Malayalam
    const resMl = await performSemanticSearch('കർഷകൻ', schemesData);
    assert(resMl.length > 0, 'Malayalam farmer search must return results');
    assert.strictEqual(resMl[0].scheme.id, 'pm-kisan', 'Top result for കർഷകൻ must be pm-kisan');

    const resMlPension = await performSemanticSearch('പെൻഷൻ', schemesData);
    assert(resMlPension.length > 0, 'Malayalam pension search must return results');
    assert.strictEqual(resMlPension[0].scheme.id, 'nsap-old-age-pension', 'Top result for പെൻഷൻ must be nsap-old-age-pension');

    // E. Marathi
    const resMr = await performSemanticSearch('शेतकरी', schemesData);
    assert(resMr.length > 0, 'Marathi farmer search must return results');
    assert.strictEqual(resMr[0].scheme.id, 'pm-kisan', 'Top result for शेतकरी must be pm-kisan');

    const resMrGruha = await performSemanticSearch('गृह लक्ष्मी', schemesData);
    assert(resMrGruha.length > 0, 'Gruha Lakshmi search must return results');
    assert.strictEqual(resMrGruha[0].scheme.id, 'karnataka-gruha-lakshmi', 'Top result must be karnataka-gruha-lakshmi');

    // F. Gujarati
    const resGu = await performSemanticSearch('ખેડૂત', schemesData);
    assert(resGu.length > 0, 'Gujarati farmer search must return results');
    assert.strictEqual(resGu[0].scheme.id, 'pm-kisan', 'Top result for ખેડૂત must be pm-kisan');

    const resGuAwas = await performSemanticSearch('આવાસ', schemesData);
    assert(resGuAwas.length > 0, 'Gujarati housing search must return results');
    assert(resGuAwas[0].scheme.id === 'pmay-g' || resGuAwas[0].scheme.id === 'pmay-u', 'Top result for આવાસ must be PMAY');

    pass('2.1: Native-script queries across Hindi, Tamil, Telugu, Malayalam, Marathi, and Gujarati correctly retrieve verified schemes');
  }

  // -------------------------------------------------------------
  // Test 3: Common Latin-Script Transliterations
  // -------------------------------------------------------------
  console.log('\n--- Test 3: Common Latin-Script Transliterations ---');
  {
    // Tamil transliterations
    const resVivasaayi = await performSemanticSearch('vivasaayi', schemesData);
    assert(resVivasaayi.length > 0, 'vivasaayi must return results');
    assert.strictEqual(resVivasaayi[0].scheme.id, 'pm-kisan', 'vivasaayi top result must be pm-kisan');

    const resPudhumai = await performSemanticSearch('pudhumai penn', schemesData);
    assert(resPudhumai.length > 0, 'pudhumai penn must return results');
    assert.strictEqual(resPudhumai[0].scheme.id, 'tn-pudhumai-penn', 'pudhumai penn top result must be tn-pudhumai-penn');

    const resMuthiyor = await performSemanticSearch('muthiyor pension', schemesData);
    assert(resMuthiyor.length > 0, 'muthiyor pension must return results');
    assert(resMuthiyor.some(r => r.scheme.id === 'nsap-old-age-pension'), 'muthiyor pension must include IGNOAPS');

    // Telugu transliterations
    const resRythu = await performSemanticSearch('rythu bandhu', schemesData);
    assert(resRythu.length > 0, 'rythu bandhu must return results');
    assert.strictEqual(resRythu[0].scheme.id, 'telangana-rythu-bandhu', 'rythu bandhu top result must be telangana-rythu-bandhu');

    // Malayalam transliteration
    const resKarshakan = await performSemanticSearch('karshakan', schemesData);
    assert(resKarshakan.length > 0, 'karshakan must return results');
    assert.strictEqual(resKarshakan[0].scheme.id, 'pm-kisan', 'karshakan top result must be pm-kisan');

    // Marathi transliteration
    const resShethkari = await performSemanticSearch('shethkari', schemesData);
    assert(resShethkari.length > 0, 'shethkari must return results');
    assert.strictEqual(resShethkari[0].scheme.id, 'pm-kisan', 'shethkari top result must be pm-kisan');

    // Gujarati transliteration
    const resKhedut = await performSemanticSearch('khedut', schemesData);
    assert(resKhedut.length > 0, 'khedut must return results');
    assert.strictEqual(resKhedut[0].scheme.id, 'pm-kisan', 'khedut top result must be pm-kisan');

    // Hindi transliteration
    const resVridha = await performSemanticSearch('vridha pension', schemesData);
    assert(resVridha.length > 0, 'vridha pension must return results');
    assert.strictEqual(resVridha[0].scheme.category, 'Pensions & Senior Care', 'vridha pension top result must be a Pension scheme');
    assert(resVridha.some(r => r.scheme.id === 'nsap-old-age-pension'), 'vridha pension results must include IGNOAPS');

    const resArogya = await performSemanticSearch('arogya bima', schemesData);
    assert(resArogya.length > 0, 'arogya bima must return results');
    assert.strictEqual(resArogya[0].scheme.id, 'pmjay-ayushman', 'arogya bima top result must be pmjay-ayushman');

    pass('3.1: Documented Latin-script transliterations across Southern and Western Indian languages map accurately to catalogue schemes');
  }

  // -------------------------------------------------------------
  // Test 4: Mixed English and Regional-Language Terms
  // -------------------------------------------------------------
  console.log('\n--- Test 4: Mixed English and Regional-Language Terms ---');
  {
    const resMixed1 = await performSemanticSearch('PM Kisan விவசாயம்', schemesData);
    assert(resMixed1.length > 0, 'Mixed English+Tamil query must return results');
    assert.strictEqual(resMixed1[0].scheme.id, 'pm-kisan', 'Top result must be pm-kisan');
    assert.strictEqual(resMixed1[0].score, 0.99, 'Top score must be 0.99');

    const resMixed2 = await performSemanticSearch('scholarship छात्रवृत्ति', schemesData);
    assert(resMixed2.length > 0, 'Mixed English+Hindi query must return results');
    assert.strictEqual(resMixed2[0].scheme.id, 'post-matric-scholarship', 'Top result must be post-matric-scholarship');
    assert.strictEqual(resMixed2[0].score, 0.99, 'Top score must be 0.99');

    const resMixed3 = await performSemanticSearch('senior citizen ஓய்வூதியம்', schemesData);
    assert(resMixed3.length > 0, 'Mixed English+Tamil pension query must return results');
    assert.strictEqual(resMixed3[0].scheme.id, 'nsap-old-age-pension', 'Top result must be nsap-old-age-pension');

    const resMixed4 = await performSemanticSearch('Tamil Nadu கல்வி', schemesData);
    assert(resMixed4.length > 0, 'Mixed state+Tamil education query must return results');
    assert.strictEqual(resMixed4[0].scheme.id, 'edu-tn-bc-mbc-scholarship', 'Top result must be Tamil Nadu BC/MBC scholarship');

    pass('4.1: Mixed-language queries seamlessly fuse Latin and Indic tokens without token degradation');
  }

  // -------------------------------------------------------------
  // Test 5: Unicode Normalization and Punctuation Handling
  // -------------------------------------------------------------
  console.log('\n--- Test 5: Unicode Normalization & Punctuation ---');
  {
    const messyQuery = '   !!! किसान  ???  (PM-KISAN) --- தமிழ்நாடு ,,, 10th pass...   ';
    const cleanNorm = normalizeText(messyQuery);
    assert(cleanNorm.includes('किसान'), 'Must preserve Devanagari characters');
    assert(cleanNorm.includes('pm-kisan'), 'Must preserve canonicalized hyphenated Latin term');
    assert(cleanNorm.includes('தமிழ்நாடு'), 'Must preserve Tamil script characters with matras intact');
    assert(cleanNorm.includes('10th pass'), 'Must preserve alphanumeric numbers and letters');
    assert(!cleanNorm.includes('?'), 'Must strip question marks');
    assert(!cleanNorm.includes('!'), 'Must strip exclamation marks');
    assert(!cleanNorm.includes(','), 'Must strip commas');

    // NFD decomposed vs NFC precomposed equivalence under NFKC normalization
    const precomposed = 'किसान';
    const decomposed = precomposed.normalize('NFD');
    assert.strictEqual(normalizeText(precomposed), normalizeText(decomposed), 'NFKC normalization must equate decomposed and precomposed Indic strings');

    pass('5.1: Unicode normalization standardizes characters while preserving Indic vowels and composite forms');
  }

  // -------------------------------------------------------------
  // Test 6: Spelling Variants and Synonyms
  // -------------------------------------------------------------
  console.log('\n--- Test 6: Spelling Variants and Synonyms ---');
  {
    const resVar1 = await performSemanticSearch('vivasayi', schemesData);
    const resVar2 = await performSemanticSearch('vivasaayi', schemesData);
    assert.strictEqual(resVar1[0].scheme.id, resVar2[0].scheme.id, 'Variant spellings vivasayi and vivasaayi produce consistent top result');

    const resShet1 = await performSemanticSearch('shetkari', schemesData);
    const resShet2 = await performSemanticSearch('shethkari', schemesData);
    assert.strictEqual(resShet1[0].scheme.id, resShet2[0].scheme.id, 'Variant spellings shetkari and shethkari produce consistent top result');

    pass('6.1: Curated spelling variants and synonyms reliably map to the same welfare domain');
  }

  // -------------------------------------------------------------
  // Test 7: Empty, Whitespace-Only, and Malformed Inputs
  // -------------------------------------------------------------
  console.log('\n--- Test 7: Empty, Whitespace-Only, and Malformed Inputs ---');
  {
    const resEmpty = await performSemanticSearch('', schemesData);
    assert.strictEqual(resEmpty.length, schemesData.length, 'Empty query must return all schemes');
    assert.strictEqual(resEmpty[0].score, 1.0, 'Baseline score must be 1.0');

    const resWhitespace = await performSemanticSearch('     \n\t   ', schemesData);
    assert.strictEqual(resWhitespace.length, schemesData.length, 'Whitespace-only query must return all schemes');

    const resNull = await performSemanticSearch(null, schemesData);
    assert.strictEqual(resNull.length, schemesData.length, 'Null query must safely return full catalogue');

    const resUndefined = await performSemanticSearch(undefined, schemesData);
    assert.strictEqual(resUndefined.length, schemesData.length, 'Undefined query must safely return full catalogue');

    // Unsupported non-Latin scripts (Japanese, Cyrillic) safely return empty results
    const resJp = await performSemanticSearch('日本語のテキストテスト', schemesData);
    assert.strictEqual(resJp.length, 0, 'Unsupported script (Japanese) must return empty results');

    const resCyrillic = await performSemanticSearch('русский язык проверка', schemesData);
    assert.strictEqual(resCyrillic.length, 0, 'Unsupported script (Cyrillic) must return empty results');

    pass('7.1: Robust defensive handling verified across empty, whitespace, null, and unsupported non-Latin scripts');
  }

  // -------------------------------------------------------------
  // Test 8: Deterministic Output for Repeated Queries
  // -------------------------------------------------------------
  console.log('\n--- Test 8: Deterministic Output Across Repeated Runs ---');
  {
    const testQueries = ['விவசாயி', 'రైతు బంధు', 'छात्रवृत्ति', 'pudhumai penn', 'old age pension'];
    for (const q of testQueries) {
      const run1 = await performSemanticSearch(q, schemesData);
      const json1 = JSON.stringify(run1.map(r => ({ id: r.scheme.id, s: r.score })));

      for (let i = 0; i < 20; i++) {
        const runN = await performSemanticSearch(q, schemesData);
        const jsonN = JSON.stringify(runN.map(r => ({ id: r.scheme.id, s: r.score })));
        assert.strictEqual(json1, jsonN, `Query "${q}" must produce bit-for-bit identical ranking across repeated iterations`);
      }
    }

    pass('8.1: 100% Deterministic ordering verified across repeated evaluations');
  }

  // -------------------------------------------------------------
  // Test 9: Exact Scheme-Name Ranking Stability
  // -------------------------------------------------------------
  console.log('\n--- Test 9: Exact Scheme-Name Ranking Stability ---');
  {
    const flagshipTests = [
      { name: 'PM-KISAN', id: 'pm-kisan' },
      { name: 'Pradhan Mantri Awas Yojana - Urban 2.0 (PMAY-U 2.0)', id: 'house-pmay-urban-2' },
      { name: 'Indira Gandhi National Old Age Pension Scheme (IGNOAPS)', id: 'nsap-old-age-pension' },
      { name: 'Unique Disability ID (UDID) & Divyangjan Welfare Schemes', id: 'udid-disability-scheme' }
    ];

    for (const item of flagshipTests) {
      const res = await performSemanticSearch(item.name, schemesData);
      assert(res.length > 0, `Exact scheme name "${item.name}" must return results`);
      assert.strictEqual(res[0].scheme.id, item.id, `Top result for exact name "${item.name}" must match id ${item.id}`);
      assert.strictEqual(res[0].score, 0.99, 'Exact match must receive maximum confidence score of 0.99');
    }

    pass('9.1: Exact scheme name queries reliably receive top rank and 0.99 score ceiling');
  }

  // -------------------------------------------------------------
  // Test 10: Negative Fake/Nonexistent Scheme Intent Across Languages
  // -------------------------------------------------------------
  console.log('\n--- Test 10: Negative Fake/Nonexistent Scheme Intent ---');
  {
    const fakeQueries = [
      'Show me fake schemes that do not exist.',
      'fake scheme xyz',
      'bogus scheme abc',
      'farzi yojana',
      'nakli scheme',
      'போலி திட்டம்',
      'నకిలీ పథకాలు',
      'फर्जी योजना'
    ];

    for (const fq of fakeQueries) {
      const res = await performSemanticSearch(fq, schemesData);
      assert.strictEqual(res.length, 0, `Query "${fq}" must return 0 results`);
    }

    pass('10.1: Explicit fake or nonexistent scheme queries across English and regional scripts return 0 results');
  }

  // -------------------------------------------------------------
  // Test 11: Negative-Document Queries in English and Regional Phrasing
  // -------------------------------------------------------------
  console.log('\n--- Test 11: Negative-Document Queries ---');
  {
    // English
    const resEn = await performSemanticSearch('schemes that do not require an income certificate', schemesData);
    assert(resEn.length > 0, 'Must return schemes');
    const topEn = resEn[0].scheme;
    const ruleDocsEn = (topEn.eligibilityRules?.requiredDocuments || []).map(d => d.toLowerCase());
    assert(!ruleDocsEn.some(d => d.includes('income')), 'Top scheme must not require income certificate in English query');

    // Tamil: "வருமான சான்றிதழ் இல்லாத திட்டங்கள்"
    const resTa = await performSemanticSearch('வருமான சான்றிதழ் இல்லாத திட்டங்கள்', schemesData);
    assert(resTa.length > 0, 'Must return schemes for Tamil negative-doc query');
    const topTa = resTa[0].scheme;
    const ruleDocsTa = (topTa.eligibilityRules?.requiredDocuments || []).map(d => d.toLowerCase());
    assert(!ruleDocsTa.some(d => d.includes('income')), 'Top scheme must not require income certificate in Tamil negative-doc query');

    // Hindi: "बिना आय प्रमाण पत्र योजना"
    const resHi = await performSemanticSearch('बिना आय प्रमाण पत्र योजना', schemesData);
    assert(resHi.length > 0, 'Must return schemes for Hindi negative-doc query');
    const topHi = resHi[0].scheme;
    const ruleDocsHi = (topHi.eligibilityRules?.requiredDocuments || []).map(d => d.toLowerCase());
    assert(!ruleDocsHi.some(d => d.includes('income')), 'Top scheme must not require income certificate in Hindi negative-doc query');

    pass('11.1: Negative-document filtering verified across English, Tamil, and Hindi phrasing');
  }

  // -------------------------------------------------------------
  // Test 12: State/Location Exclusions in English and Regional Phrasing
  // -------------------------------------------------------------
  console.log('\n--- Test 12: State/Location Exclusions ---');
  {
    // English: "schemes not available in Tamil Nadu"
    const resEn = await performSemanticSearch('schemes not available in Tamil Nadu', schemesData);
    assert(resEn.length > 0, 'Must return schemes');
    assert.notStrictEqual(resEn[0].scheme.state, 'Tamil Nadu', 'Top scheme must NOT be a Tamil Nadu state scheme');

    // Tamil: "தமிழ்நாட்டில் இல்லாத திட்டங்கள்"
    const resTa = await performSemanticSearch('தமிழ்நாட்டில் இல்லாத திட்டங்கள்', schemesData);
    assert(resTa.length > 0, 'Must return schemes');
    assert.notStrictEqual(resTa[0].scheme.state, 'Tamil Nadu', 'Top scheme must NOT be a Tamil Nadu state scheme in Tamil query');

    // Hindi: "तमिलनाडु के बाहर योजनाएं"
    const resHi = await performSemanticSearch('तमिलनाडु के बाहर योजनाएं', schemesData);
    assert(resHi.length > 0, 'Must return schemes');
    assert.notStrictEqual(resHi[0].scheme.state, 'Tamil Nadu', 'Top scheme must NOT be a Tamil Nadu state scheme in Hindi query');

    pass('12.1: State exclusions verified across English, Tamil, and Hindi negative state phrasing');
  }

  // -------------------------------------------------------------
  // Test 13: Fraud-Awareness Guidance Behavior Across Languages
  // -------------------------------------------------------------
  console.log('\n--- Test 13: Fraud-Awareness Guidance Behavior ---');
  {
    // English
    const resEn = await performSemanticSearch('How can I identify a fake government scheme?', schemesData);
    assert(resEn.length > 0, 'English fraud query must return guidance reference schemes');
    assert(resEn[0].scheme.officialWebsite.includes('.gov.in'), 'Must cite verified government portal');
    assert(resEn[0].scheme.helplineNumber, 'Must provide verified helpline');

    // Romanized Indic
    const resRom = await performSemanticSearch('kya yeh scheme farzi hai helpline number', schemesData);
    assert(resRom.length > 0, 'Romanized fraud query must return verified guidance');
    assert(resRom[0].scheme.helplineNumber, 'Must provide official helpline number');

    // Hindi
    const resHi = await performSemanticSearch('नकली योजना की पहचान कैसे करें', schemesData);
    assert(resHi.length > 0, 'Hindi fraud query must return verified guidance');
    assert(resHi[0].scheme.officialWebsite.includes('.gov.in'), 'Must cite authentic portal in Hindi query');

    // Tamil
    const resTa = await performSemanticSearch('போலி திட்டத்தை எப்படி கண்டறிவது', schemesData);
    assert(resTa.length > 0, 'Tamil fraud query must return verified guidance');
    assert(resTa[0].scheme.officialWebsite.includes('.gov.in'), 'Must cite authentic portal in Tamil query');

    pass('13.1: Legitimate citizen fraud-awareness queries across languages provide grounded official portal URLs and helplines');
  }

  // -------------------------------------------------------------
  // Test 14: Phase 4 Eligibility Explanation and Document Status Preservation
  // -------------------------------------------------------------
  console.log('\n--- Test 14: Phase 4 Eligibility Explanation Preservation ---');
  {
    const citizen = {
      id: 'cit-phase5-check',
      age: 28,
      gender: 'Male',
      annualIncome: 120000,
      state: 'Tamil Nadu',
      category: 'OBC',
      occupation: 'Farmer',
      landHoldingAcres: 2.5,
      hasDisability: false,
      educationLevel: 'Graduate',
      documents: [
        { documentType: 'Aadhaar Card', uploadedAt: '2026-01-01' },
        { documentType: 'Land Ownership Documents / Khasra Khatoni', uploadedAt: '2026-01-01' },
        { documentType: 'Savings Bank Account Passbook', uploadedAt: '2026-01-01' },
        { documentType: 'Mobile Number Linked to Aadhaar', uploadedAt: '2026-01-01' }
      ]
    };

    const pmKisan = schemesData.find(s => s.id === 'pm-kisan');
    assert(pmKisan, 'pm-kisan must exist in catalogue');

    // Explainable engine evaluation
    const expResult = evaluateExplainableEligibility(citizen, pmKisan, { 'Aadhaar Card': 'AVAILABLE' });
    assert.strictEqual(expResult.overallStatus, 'Eligible', 'Fully qualifying farmer citizen must be Eligible');
    assert(expResult.satisfied.length >= 2, 'Must have at least 2 satisfied criteria');
    assert.strictEqual(expResult.notSatisfied.length, 0, 'Must have 0 unmet criteria');
    assert(expResult.disclaimer.includes('Preliminary Advisory'), 'Must include authentic preliminary advisory disclaimer');

    // Rule engine compatibility
    const ruleResult = evaluateSchemeEligibility(citizen, pmKisan);
    assert.strictEqual(ruleResult.status, 'Eligible', 'Rule engine must agree on Eligible');

    pass('14.1: Phase 4 explainable eligibility and document readiness evaluations remain 100% intact');
  }

  // -------------------------------------------------------------
  // Test 15: Honest Empty Results for Queries with No Valid Match
  // -------------------------------------------------------------
  console.log('\n--- Test 15: Honest Empty Results for Invalid Match ---');
  {
    const gibberishQueries = [
      'qwertyuiop asdfghjkl zxcvbnm',
      'xyzzy 123456789 987654321',
      'randomnonexistentschemestring'
    ];

    for (const gq of gibberishQueries) {
      const res = await performSemanticSearch(gq, schemesData);
      assert.strictEqual(res.length, 0, `Gibberish query "${gq}" must safely return 0 results`);
    }

    pass('15.1: Zero false-positive hallucination on completely irrelevant and random queries');
  }

  console.log('\n================================================================');
  console.log(' ALL PHASE 5 MULTILINGUAL SEARCH TESTS PASSED SUCCESSFULLY!     ');
  console.log('================================================================\n');
}

runMultilingualSearchTests().catch(err => {
  console.error('\n[FATAL TEST ERROR]:', err);
  process.exit(1);
});
