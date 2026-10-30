/**
 * tests/homepage_category_repositioning.test.js
 * Automated Test Suite for GovScheme Homepage Category Section Repositioning:
 * - Section Order Verification:
 *     1. Welcome banner (Good morning, Citizen)
 *     2. Complete Your Profile card/box
 *     3. Browse Schemes by Category (8 cards)
 *     4. Recommended Schemes
 *     5. Upcoming Deadlines
 *     6. Remaining Homepage Content
 * - 8 Required Category Cards & Strict Hex Accent Colours:
 *     Education: #2563EB, Agriculture: #16A34A, Healthcare: #F87171, Housing: #9333EA
 *     Employment: #F59E0B, Women & Child: #DB2777, Entrepreneurship: #0D9488, Financial Help: #CA8A04
 * - Catalogue Category Filter Alignment (All 8 categories return matching schemes from 75-scheme catalogue)
 * - Multilingual Coverage Across All 7 Supported Languages (en, hi, ta, te, ml, mr, gu)
 * - Responsive Grid & Light Theme Architecture
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { schemesData } from '../src/data/schemes.ts';

const localesDir = path.resolve('public/locales');
const SUPPORTED_LANGUAGES = ['en', 'hi', 'ta', 'te', 'ml', 'mr', 'gu'];

async function runHomepageCategoryRepositioningTests() {
  console.log('========================================================================');
  console.log(' AUTOMATED TEST SUITE: HOMEPAGE CATEGORY REPOSITIONING & SECTION ORDER ');
  console.log('========================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function test(name, fn) {
    totalTests++;
    try {
      fn();
      console.log(`  [PASS] ${name}`);
      passedTests++;
    } catch (err) {
      console.error(`  [FAIL] ${name}:`, err.message);
      throw err;
    }
  }

  const landingPageSource = fs.readFileSync(path.resolve('src/components/LandingPage.tsx'), 'utf8');

  // -------------------------------------------------------------
  // GROUP 1: Homepage Section Sequence Verification
  // -------------------------------------------------------------
  console.log('--- Group 1: Homepage Section Sequence Verification ---');

  test('Homepage sections follow exact specified sequential order', () => {
    const welcomeIdx = landingPageSource.indexOf('1. GOOD MORNING, CITIZEN WELCOME & RECOMMENDATIONS BANNER');
    const profileIdx = landingPageSource.indexOf('2. COMPLETE YOUR PROFILE CARD/BOX');
    const categoryIdx = landingPageSource.indexOf('3. BROWSE SCHEMES BY CATEGORY');
    const recommendedIdx = landingPageSource.indexOf('4. EXISTING RECOMMENDED SCHEMES');
    const deadlinesIdx = landingPageSource.indexOf('5. EXISTING UPCOMING DEADLINES');
    const remainingIdx = landingPageSource.indexOf('6. ALL REMAINING EXISTING HOMEPAGE SECTIONS');

    assert.ok(welcomeIdx !== -1, 'Welcome banner must exist in LandingPage');
    assert.ok(profileIdx !== -1, 'Complete Your Profile section must exist');
    assert.ok(categoryIdx !== -1, 'Category section must exist');
    assert.ok(recommendedIdx !== -1, 'Recommended schemes must exist');
    assert.ok(deadlinesIdx !== -1, 'Upcoming deadlines must exist');
    assert.ok(remainingIdx !== -1, 'Remaining homepage sections must exist');

    assert.ok(welcomeIdx < profileIdx, '1. Welcome banner must appear before Complete Your Profile');
    assert.ok(profileIdx < categoryIdx, '2. Complete Your Profile must appear immediately before Category section');
    assert.ok(categoryIdx < recommendedIdx, '3. Category section must appear before Recommended Schemes');
    assert.ok(recommendedIdx < deadlinesIdx, '4. Recommended Schemes must appear before Upcoming Deadlines');
    assert.ok(deadlinesIdx < remainingIdx, '5. Upcoming Deadlines must appear before Remaining Sections');
  });

  // -------------------------------------------------------------
  // GROUP 2: 8 Category Cards & Strict Hex Accent Colours
  // -------------------------------------------------------------
  console.log('\n--- Group 2: 8 Category Cards & Strict Hex Accent Colours ---');

  const EXPECTED_CATEGORIES = [
    { key: 'Education', color: '#2563EB' },
    { key: 'Agriculture', color: '#16A34A' },
    { key: 'Healthcare', color: '#F87171' },
    { key: 'Housing', color: '#9333EA' },
    { key: 'Employment', color: '#F59E0B' },
    { key: 'Women & Child', color: '#DB2777' },
    { key: 'Entrepreneurship', color: '#0D9488' },
    { key: 'Financial Help', color: '#CA8A04' }
  ];

  test('All eight required category cards are configured with strict specified hex accent colours', () => {
    EXPECTED_CATEGORIES.forEach(cat => {
      assert.ok(
        landingPageSource.includes(`key: '${cat.key}'`) && landingPageSource.includes(`color: '${cat.color}'`),
        `Category '${cat.key}' must be configured with accent colour '${cat.color}'`
      );
    });
  });

  test('Category section contains required headings and responsive 4-column desktop grid', () => {
    assert.ok(landingPageSource.includes('exploreByCategoryTitle'), 'Must use exploreByCategoryTitle key');
    assert.ok(landingPageSource.includes('exploreByCategorySubtitle'), 'Must use exploreByCategorySubtitle key');
    assert.ok(
      landingPageSource.includes('lg:grid-cols-4') || landingPageSource.includes('md:grid-cols-4'),
      'Category grid must support 4 cards per row on desktop'
    );
    assert.ok(
      landingPageSource.includes('sm:grid-cols-2') || landingPageSource.includes('xs:grid-cols-2'),
      'Category grid must support 2 cards per row on tablet/mobile'
    );
  });

  // -------------------------------------------------------------
  // GROUP 3: Scheme Catalogue Filter Alignment (Zero Fabricated Data)
  // -------------------------------------------------------------
  console.log('\n--- Group 3: Scheme Catalogue Filter Alignment ---');

  test('Every category card matches genuine schemes from the 75-scheme catalogue', () => {
    assert.strictEqual(schemesData.length, 75, 'Schemes catalogue must contain 75 schemes');

    EXPECTED_CATEGORIES.forEach(cat => {
      const matchingSchemes = schemesData.filter(s => {
        const catLower = cat.key.toLowerCase();
        const schemeCatLower = (s.category || '').toLowerCase();
        const tags = (s.tags || []).map(t => t.toLowerCase());

        if (cat.key === 'Education') {
          return schemeCatLower.includes('education') || tags.includes('scholarship') || tags.includes('student');
        }
        if (cat.key === 'Agriculture') {
          return schemeCatLower.includes('agriculture') || schemeCatLower.includes('farmer') || tags.includes('farmer') || tags.includes('agriculture');
        }
        if (cat.key === 'Healthcare') {
          return schemeCatLower.includes('health') || tags.includes('health') || tags.includes('medical');
        }
        if (cat.key === 'Housing') {
          return schemeCatLower.includes('housing') || schemeCatLower.includes('shelter') || tags.includes('housing');
        }
        if (cat.key === 'Employment') {
          return schemeCatLower.includes('employment') || schemeCatLower.includes('enterprise') || tags.includes('employment') || tags.includes('job card');
        }
        if (cat.key === 'Women & Child') {
          return schemeCatLower.includes('women') || schemeCatLower.includes('child') || tags.includes('women') || tags.includes('girl child');
        }
        if (cat.key === 'Entrepreneurship') {
          return schemeCatLower.includes('enterprise') || schemeCatLower.includes('credit') || tags.includes('entrepreneurship') || tags.includes('startup') || tags.includes('msme') || tags.includes('mudra');
        }
        if (cat.key === 'Financial Help') {
          return schemeCatLower.includes('credit') || schemeCatLower.includes('financial') || schemeCatLower.includes('pension') || schemeCatLower.includes('food') || tags.includes('loan') || tags.includes('dbt');
        }
        return schemeCatLower.includes(catLower);
      });

      assert.ok(matchingSchemes.length > 0, `Category '${cat.key}' must have matching schemes; got 0`);
      console.log(`    Category '${cat.key}': ${matchingSchemes.length} matching schemes found in catalogue`);
    });
  });

  // -------------------------------------------------------------
  // GROUP 4: Multilingual Localization Across All 7 Languages
  // -------------------------------------------------------------
  console.log('\n--- Group 4: Multilingual Coverage Across All 7 Languages ---');

  test('All 7 supported regional languages contain localized category titles and section headings', () => {
    const requiredKeys = [
      'exploreByCategoryTitle',
      'exploreByCategorySubtitle',
      'Education',
      'Agriculture',
      'Healthcare',
      'Housing',
      'Employment',
      'Women & Child',
      'Entrepreneurship',
      'Financial Help',
      'completeYourProfile',
      'unlockMoreAccurateAI',
      'recommendedForYou',
      'upcomingDeadlines'
    ];

    SUPPORTED_LANGUAGES.forEach(lang => {
      const filePath = path.join(localesDir, `${lang}/translation.json`);
      assert.ok(fs.existsSync(filePath), `Translation file for ${lang} must exist`);
      const dict = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      requiredKeys.forEach(key => {
        assert.ok(dict[key], `Language '${lang}' missing key '${key}'`);
        assert.ok(typeof dict[key] === 'string' && dict[key].trim().length > 0, `Key '${key}' in '${lang}' must be non-empty`);
      });
    });
  });

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log('\n========================================================================');
  console.log(` HOMEPAGE CATEGORY TESTS: ${passedTests}/${totalTests} PASSED (100% GREEN)`);
  console.log('========================================================================\n');
}

runHomepageCategoryRepositioningTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Test run failed:', err);
    process.exit(1);
  });
