// tests/pilot_application_guidance.test.js
// Focused regression test suite for Application Guidance Pilot (5 schemes):
// 1. edu-tn-tamil-puthalvan
// 2. edu-tn-first-graduate
// 3. edu-nsp-merit-means
// 4. agri-soil-health-card
// 5. emp-tn-naan-mudhalvan

import assert from 'assert';
import fs from 'fs';

function loadCanonicalSchemes() {
  const rawCode = fs.readFileSync('src/data/schemes.ts', 'utf8')
    .replace("import type { Scheme } from '../types';", '')
    .replace('export const schemesData: Scheme[] =', 'const schemesData =');
  const fn = new Function(rawCode + '; return schemesData;');
  return fn();
}

console.log('================================================================');
console.log('APPLICATION GUIDANCE PILOT REGRESSION TEST SUITE');
console.log('================================================================\n');

const canonicalSchemes = loadCanonicalSchemes();
assert.strictEqual(canonicalSchemes.length, 75, 'Must retain exactly 75 canonical schemes');
console.log(`[PASS] 75 canonical schemes loaded successfully.\n`);

const pilotSchemeIds = [
  'edu-tn-tamil-puthalvan',
  'edu-tn-first-graduate',
  'edu-nsp-merit-means',
  'agri-soil-health-card',
  'emp-tn-naan-mudhalvan'
];

pilotSchemeIds.forEach(id => {
  const scheme = canonicalSchemes.find(s => s.id === id);
  assert(scheme, `Pilot scheme '${id}' must exist in canonical dataset`);

  // 1. Verify scheme identity and core attributes
  assert.strictEqual(scheme.id, id, `Scheme ID must match '${id}'`);
  assert(scheme.name && scheme.name.trim().length > 0, `Scheme '${id}' must have a valid name`);
  assert(scheme.category && scheme.category.trim().length > 0, `Scheme '${id}' must have a valid category`);
  assert(scheme.eligibilityRules && typeof scheme.eligibilityRules === 'object', `Scheme '${id}' must have eligibilityRules`);
  assert(Array.isArray(scheme.requiredDocuments) && scheme.requiredDocuments.length > 0, `Scheme '${id}' must have requiredDocuments`);
  assert(scheme.officialWebsite && scheme.officialWebsite.startsWith('http'), `Scheme '${id}' must have officialWebsite`);
  assert(scheme.officialApplyUrl && scheme.officialApplyUrl.startsWith('http'), `Scheme '${id}' must have officialApplyUrl`);

  // 2. Verify improved applicationSteps
  assert(Array.isArray(scheme.applicationSteps), `Scheme '${id}' applicationSteps must be an array`);
  assert(
    scheme.applicationSteps.length >= 3,
    `Scheme '${id}' must have at least 3 application steps, but has ${scheme.applicationSteps.length}`
  );

  scheme.applicationSteps.forEach((step, idx) => {
    assert(typeof step === 'string', `Scheme '${id}' step ${idx + 1} must be a string`);
    assert(
      step.trim().length >= 25,
      `Scheme '${id}' step ${idx + 1} must be actionable and descriptive (>= 25 chars), got: '${step}'`
    );
    assert(
      !step.includes('TODO') && !step.includes('undefined') && !step.includes('null'),
      `Scheme '${id}' step ${idx + 1} must not contain placeholder text`
    );
  });

  console.log(`[PASS] '${id}': ${scheme.applicationSteps.length} actionable steps verified.`);
});

console.log('\n================================================================');
console.log('ALL PILOT APPLICATION GUIDANCE REGRESSION TESTS PASSED (100%)');
console.log('================================================================');
