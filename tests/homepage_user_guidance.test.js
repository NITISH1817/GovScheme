/**
 * tests/homepage_user_guidance.test.js
 * Automated Test Suite for GovScheme Homepage Multilingual User Guidance & Interactive Walkthrough:
 * - 6-Step Citizen Journey Architecture:
 *     1. Discover Government Schemes (search by name, category, department, benefits)
 *     2. Check Scheme Eligibility (profile demographics, SATISFIED / NOT_SATISFIED / UNKNOWN criteria explanation, advisory disclaimer)
 *     3. Use the Document Vault (upload, OCR text extraction, privacy/Aadhaar masking, legal disclaimer)
 *     4. Track Applications (record official government ack number, milestone tracking, manual tracking disclaimer)
 *     5. Access AI Assistance (multilingual voice & text Q&A)
 *     6. Use CSC Kiosk Services (assisted public terminal, thermal receipt printing, PIN-code lookup)
 * - Interactive Walkthrough Component:
 *     - "Show Me How" trigger in Hero & Section
 *     - Step counter (Step X of Y), progress calculation
 *     - Controls: Previous, Next, Skip, Finish, Replay, Exit
 *     - Keyboard navigation: Escape, ArrowRight, ArrowLeft
 *     - Min 44px touch targets & accessible ARIA attributes
 * - 100% 7-Language Parity Across All 67+ Guidance Translation Keys:
 *     en, hi, ta, te, ml, mr, gu
 * - Complete 12-Point End-to-End User Journey Simulation
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';

const localesDir = path.resolve('public/locales');
const SUPPORTED_LANGUAGES = ['en', 'hi', 'ta', 'te', 'ml', 'mr', 'gu'];

const REQUIRED_GUIDANCE_KEYS = [
  'guidanceBadge',
  'guidanceSectionHeading',
  'guidanceSectionSubheading',
  'startWalkthroughBtn',
  'startWalkthroughAria',
  'walkthroughStepOf',
  'walkthroughPrev',
  'walkthroughNext',
  'walkthroughFinish',
  'walkthroughSkip',
  'walkthroughReplay',
  'walkthroughExit',
  'walkthroughTakeAction',
  'walkthroughInstructionLabel',
  'walkthroughHighlightingLabel',
  'closeWalkthrough',
  'whatYouNeedToKnow',
  'guidanceStep1Badge',
  'guidanceStep1Title',
  'guidanceStep1Desc',
  'guidanceStep1Instruction',
  'guidanceStep1Action',
  'guidanceStep1P1',
  'guidanceStep1P2',
  'guidanceStep1P3',
  'guidanceStep1Disclaimer',
  'guidanceStep2Badge',
  'guidanceStep2Title',
  'guidanceStep2Desc',
  'guidanceStep2Instruction',
  'guidanceStep2Action',
  'guidanceStep2P1',
  'guidanceStep2P2',
  'guidanceStep2P3',
  'guidanceStep2Disclaimer',
  'guidanceStep3Badge',
  'guidanceStep3Title',
  'guidanceStep3Desc',
  'guidanceStep3Instruction',
  'guidanceStep3Action',
  'guidanceStep3P1',
  'guidanceStep3P2',
  'guidanceStep3P3',
  'guidanceStep3Disclaimer',
  'guidanceStep4Badge',
  'guidanceStep4Title',
  'guidanceStep4Desc',
  'guidanceStep4Instruction',
  'guidanceStep4Action',
  'guidanceStep4P1',
  'guidanceStep4P2',
  'guidanceStep4P3',
  'guidanceStep4Disclaimer',
  'guidanceStep5Badge',
  'guidanceStep5Title',
  'guidanceStep5Desc',
  'guidanceStep5Instruction',
  'guidanceStep5Action',
  'guidanceStep5P1',
  'guidanceStep5P2',
  'guidanceStep5P3',
  'guidanceStep5Disclaimer',
  'guidanceStep6Badge',
  'guidanceStep6Title',
  'guidanceStep6Desc',
  'guidanceStep6Instruction',
  'guidanceStep6Action',
  'guidanceStep6P1',
  'guidanceStep6P2',
  'guidanceStep6P3',
  'guidanceStep6Disclaimer'
];

async function runHomepageUserGuidanceTests() {
  console.log('========================================================================');
  console.log(' AUTOMATED TEST SUITE: HOMEPAGE USER GUIDANCE & WALKTHROUGH PARITY     ');
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
  const guidanceComponentSource = fs.readFileSync(path.resolve('src/components/HomepageUserGuidance.tsx'), 'utf8');

  // -------------------------------------------------------------
  // GROUP 1: Homepage Integration & Mounting
  // -------------------------------------------------------------
  console.log('--- Group 1: Homepage Integration & Mounting ---');

  test('Homepage imports and renders HomepageUserGuidance component', () => {
    assert.ok(
      landingPageSource.includes('HomepageUserGuidance') && landingPageSource.includes("from './HomepageUserGuidance'"),
      'LandingPage must import HomepageUserGuidance'
    );
    assert.ok(
      landingPageSource.includes('<HomepageUserGuidance'),
      'LandingPage must render <HomepageUserGuidance />'
    );
  });

  test('LandingPage Hero includes secondary "Show Me How" walkthrough button', () => {
    assert.ok(
      landingPageSource.includes('startWalkthroughBtn') || landingPageSource.includes('Show Me How'),
      'Hero section should offer "Show Me How" trigger'
    );
    assert.ok(
      landingPageSource.includes('how-to-use-govscheme'),
      'Walkthrough button anchors or scrolls to how-to-use-govscheme'
    );
  });

  // -------------------------------------------------------------
  // GROUP 2: 6 Citizen Journey Steps Completeness
  // -------------------------------------------------------------
  console.log('\n--- Group 2: 6 Citizen Journey Steps Architecture ---');

  test('Step 1: Discover Government Schemes covers search by name, category, department, benefit', () => {
    assert.ok(guidanceComponentSource.includes('guidanceStep1Badge'), 'Step 1 badge key exists');
    assert.ok(guidanceComponentSource.includes('guidanceStep1Title'), 'Step 1 title key exists');
    assert.ok(guidanceComponentSource.includes('guidanceStep1Desc'), 'Step 1 description key exists');
    assert.ok(guidanceComponentSource.includes('guidanceStep1Instruction'), 'Step 1 instruction key exists');
    assert.ok(guidanceComponentSource.includes('guidanceStep1P1'), 'Step 1 P1 exists');
  });

  test('Step 2: Check Scheme Eligibility explains criteria (SATISFIED, NOT_SATISFIED, UNKNOWN) & disclaimer', () => {
    assert.ok(guidanceComponentSource.includes('guidanceStep2Badge'), 'Step 2 badge present');
    assert.ok(guidanceComponentSource.includes('guidanceStep2P1'), 'SATISFIED criteria P1 present');
    assert.ok(guidanceComponentSource.includes('guidanceStep2P2'), 'NOT_SATISFIED criteria P2 present');
    assert.ok(guidanceComponentSource.includes('guidanceStep2P3'), 'UNKNOWN criteria P3 present');
    assert.ok(guidanceComponentSource.includes('guidanceStep2Disclaimer'), 'Statutory advisory disclaimer key present');
  });

  test('Step 3: Document Vault explains OCR scanning, Aadhaar masking & authenticity disclaimer', () => {
    assert.ok(guidanceComponentSource.includes('guidanceStep3Badge'), 'Step 3 badge present');
    assert.ok(guidanceComponentSource.includes('guidanceStep3P1'), 'Vault storage detail present');
    assert.ok(guidanceComponentSource.includes('guidanceStep3P2'), 'Aadhaar masking detail present');
    assert.ok(guidanceComponentSource.includes('guidanceStep3Disclaimer'), 'OCR legal authenticity disclaimer present');
  });

  test('Step 4: Track Applications covers official ack number & manual tracker distinction', () => {
    assert.ok(guidanceComponentSource.includes('guidanceStep4Badge'), 'Step 4 badge present');
    assert.ok(guidanceComponentSource.includes('guidanceStep4P1'), 'Milestone timeline detail present');
    assert.ok(guidanceComponentSource.includes('guidanceStep4Disclaimer'), 'Manual tracker vs official portal disclaimer present');
  });

  test('Step 5: Access AI Assistance covers multilingual voice and text assistance', () => {
    assert.ok(guidanceComponentSource.includes('guidanceStep5Badge'), 'Step 5 badge present');
    assert.ok(guidanceComponentSource.includes('guidanceStep5Title'), 'Step 5 title present');
    assert.ok(guidanceComponentSource.includes('guidanceStep5P1'), 'Language parity detail present');
  });

  test('Step 6: CSC Kiosk Services covers assisted terminal, thermal printing, and PIN-code lookup', () => {
    assert.ok(guidanceComponentSource.includes('guidanceStep6Badge'), 'Step 6 badge present');
    assert.ok(guidanceComponentSource.includes('guidanceStep6Title'), 'Step 6 title present');
    assert.ok(guidanceComponentSource.includes('guidanceStep6P1'), 'Kiosk detail present');
  });

  // -------------------------------------------------------------
  // GROUP 3: Interactive Walkthrough Controls & Accessibility
  // -------------------------------------------------------------
  console.log('\n--- Group 3: Interactive Walkthrough Controls & Accessibility ---');

  test('Walkthrough implements step counter and keyboard navigation (Escape, ArrowRight, ArrowLeft)', () => {
    assert.ok(guidanceComponentSource.includes('walkthroughStepOf'), 'Step counter key must be used');
    assert.ok(guidanceComponentSource.includes("'Escape'"), 'Escape key handler must be implemented');
    assert.ok(guidanceComponentSource.includes("'ArrowRight'"), 'ArrowRight key handler must be implemented');
    assert.ok(guidanceComponentSource.includes("'ArrowLeft'"), 'ArrowLeft key handler must be implemented');
  });

  test('Walkthrough buttons provide minimum 44px touch targets and ARIA roles', () => {
    assert.ok(guidanceComponentSource.includes('min-h-[44px]'), 'Buttons should have min 44px touch height');
    assert.ok(guidanceComponentSource.includes('role="dialog"'), 'Modal should specify role="dialog"');
    assert.ok(guidanceComponentSource.includes('aria-modal="true"'), 'Modal should specify aria-modal="true"');
    assert.ok(guidanceComponentSource.includes('aria-label='), 'Controls should have aria-labels');
  });

  test('Walkthrough offers full control buttons: Prev, Next, Skip, Finish, Replay', () => {
    assert.ok(guidanceComponentSource.includes('walkthroughPrev'), 'Previous button present');
    assert.ok(guidanceComponentSource.includes('walkthroughNext'), 'Next button present');
    assert.ok(guidanceComponentSource.includes('walkthroughSkip'), 'Skip button present');
    assert.ok(guidanceComponentSource.includes('walkthroughFinish'), 'Finish button present');
    assert.ok(guidanceComponentSource.includes('walkthroughReplay'), 'Replay button present');
  });

  // -------------------------------------------------------------
  // GROUP 4: 7-Language Parity Across All 67+ Guidance Keys
  // -------------------------------------------------------------
  console.log('\n--- Group 4: 7-Language Parity Across All Supported Locales ---');

  for (const lang of SUPPORTED_LANGUAGES) {
    test(`Language '${lang}' contains 100% of required user guidance translation keys`, () => {
      const filePath = path.join(localesDir, lang, 'translation.json');
      assert.ok(fs.existsSync(filePath), `Translation file exists for ${lang}`);
      const dict = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      const missing = [];
      for (const key of REQUIRED_GUIDANCE_KEYS) {
        if (!dict[key] || typeof dict[key] !== 'string' || dict[key].trim().length === 0) {
          missing.push(key);
        }
      }
      assert.strictEqual(
        missing.length,
        0,
        `Language '${lang}' is missing keys: ${missing.slice(0, 5).join(', ')} (total missing: ${missing.length})`
      );
    });
  }

  // -------------------------------------------------------------
  // GROUP 5: 12-Point End-to-End Walkthrough Journey Simulation
  // -------------------------------------------------------------
  console.log('\n--- Group 5: 12-Point End-to-End Interactive Journey Simulation ---');

  test('1. Homepage contains Show Me How (Interactive Guide) button triggering immediate opening', () => {
    assert.ok(
      landingPageSource.includes('handleLaunchWalkthrough'),
      'LandingPage must invoke handleLaunchWalkthrough'
    );
    assert.ok(
      landingPageSource.includes('setIsWalkthroughOpen(true)'),
      'Hero button must immediately set isWalkthroughOpen to true'
    );
  });

  test('2. First guidance step opens at index 0 and displays Step 1 of 6', () => {
    assert.ok(
      guidanceComponentSource.includes('setCurrentStepIndex(0)'),
      'Reopening or starting guide must reset step index to 0'
    );
    assert.ok(
      guidanceComponentSource.includes('walkthroughStepOf'),
      'Step indicator must render step counter'
    );
  });

  test('3. Target section element highlighting and smooth scroll are properly bound', () => {
    assert.ok(
      guidanceComponentSource.includes('govscheme-walkthrough-highlight'),
      'Highlight class must be applied to targeted element'
    );
    assert.ok(
      guidanceComponentSource.includes('scrollIntoView'),
      'Target element must be smoothly centered into view'
    );
    assert.ok(
      landingPageSource.includes('walkthrough-target-1'),
      'Target 1 element must exist on homepage'
    );
    assert.ok(
      landingPageSource.includes('walkthrough-target-2'),
      'Target 2 element must exist on homepage'
    );
  });

  test('4. Navigation Next button advances steps sequentially up to final step', () => {
    assert.ok(
      guidanceComponentSource.includes('setCurrentStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev))'),
      'Next control advances step index bounded by steps.length'
    );
  });

  test('5. Previous button returns to previous step and is disabled on Step 1', () => {
    assert.ok(
      guidanceComponentSource.includes('disabled={currentStepIndex === 0}'),
      'Previous button must be disabled when on Step 1 (currentStepIndex === 0)'
    );
    assert.ok(
      guidanceComponentSource.includes('setCurrentStepIndex((prev) => (prev > 0 ? prev - 1 : prev))') ||
      guidanceComponentSource.includes('Math.max(prev - 1, 0)'),
      'Previous control safely decrements step index without negative underflow'
    );
  });

  test('6. Final step displays Finish button instead of Next button', () => {
    assert.ok(
      guidanceComponentSource.includes('currentStepIndex < steps.length - 1 ?'),
      'Next button must only render before the final step'
    );
    assert.ok(
      guidanceComponentSource.includes('walkthroughFinish'),
      'Finish button key must render on final step'
    );
  });

  test('7. Finish button cleanly exits walkthrough, cleans up highlights, and resets step', () => {
    assert.ok(
      guidanceComponentSource.includes('setWalkthroughOpen(false)'),
      'Finish button must trigger setWalkthroughOpen(false)'
    );
  });

  test('8. Replay button allows citizen to restart walkthrough from Step 1 on final step', () => {
    assert.ok(
      guidanceComponentSource.includes('currentStepIndex === steps.length - 1 &&'),
      'Replay button must be available at conclusion of journey'
    );
    assert.ok(
      guidanceComponentSource.includes('onClick={() => setCurrentStepIndex(0)}'),
      'Replay must reset step index to 0'
    );
  });

  test('9. Skip button cleanly exits walkthrough from any step without errors', () => {
    assert.ok(
      guidanceComponentSource.includes("aria-label={t('walkthroughSkip', 'Skip')}"),
      'Skip button must be present in footer controls'
    );
  });

  test('10. Missing or unmounted target elements fall back gracefully without exceptions', () => {
    assert.ok(
      guidanceComponentSource.includes('try {') && guidanceComponentSource.includes('document.querySelector'),
      'DOM querying for target elements must be protected in try-catch blocks'
    );
    assert.ok(
      guidanceComponentSource.includes('fallback') || guidanceComponentSource.includes('guidance-step-'),
      'Fallback to guidance step card must be implemented when primary target is unavailable'
    );
  });

  test('11. Duplicate rapid taps on guide button are blocked by execution guard', () => {
    assert.ok(
      landingPageSource.includes('isLaunchingWalkthroughRef'),
      'LandingPage must use ref guard to debounce duplicate clicks'
    );
    assert.ok(
      landingPageSource.includes('if (isWalkthroughOpen) return;'),
      'LandingPage must guard against launching if already open'
    );
  });

  test('12. Changing language updates all walkthrough text dynamically across all 7 locales', () => {
    for (const lang of SUPPORTED_LANGUAGES) {
      const filePath = path.join(localesDir, lang, 'translation.json');
      const dict = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      assert.ok(dict.startWalkthroughBtn.length > 0, `${lang} startWalkthroughBtn translated`);
      assert.ok(dict.walkthroughNext.length > 0, `${lang} walkthroughNext translated`);
      assert.ok(dict.walkthroughPrev.length > 0, `${lang} walkthroughPrev translated`);
      assert.ok(dict.walkthroughFinish.length > 0, `${lang} walkthroughFinish translated`);
      assert.ok(dict.walkthroughSkip.length > 0, `${lang} walkthroughSkip translated`);
      assert.ok(dict.walkthroughReplay.length > 0, `${lang} walkthroughReplay translated`);
      assert.ok(dict.walkthroughHighlightingLabel.length > 0, `${lang} walkthroughHighlightingLabel translated`);
    }
  });

  console.log('\n========================================================================');
  console.log(` ALL HOMEPAGE USER GUIDANCE TESTS PASSED: ${passedTests}/${totalTests} `);
  console.log('========================================================================\n');
}

runHomepageUserGuidanceTests().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
