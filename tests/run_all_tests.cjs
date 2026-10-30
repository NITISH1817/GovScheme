/**
 * tests/run_all_tests.cjs
 * Tracked, reproducible test harness executing all 17 GovScheme test suites sequentially.
 * Provides unified summary table with assertion counts, exit codes, and execution durations.
 */

const { execSync } = require('child_process');

const suites = [
  'tests/auth_end_to_end_fixes.test.js',
  'tests/jwt_cors_hardening.test.js',
  'tests/security_vulnerabilities.test.js',
  'tests/ocr_isolation_recommendation.test.js',
  'tests/signup_profile_persistence.test.js',
  'tests/admin_citizen_lifecycle.test.js',
  'tests/scheme_recommendation_and_system.test.js',
  'tests/ai_ml_architecture_audit.test.js',
  'tests/search_and_grounded_ai.test.js',
  'tests/explainable_eligibility.test.js',
  'tests/multilingual_search.test.js',
  'tests/production_build_guard.test.js',
  'tests/kiosk_auth_profile_flow.test.js',
  'tests/profile_schemes_navigation.test.js',
  'tests/central_state_scheme_classification.test.js',
  'tests/application_number_integrity.test.js',
  'tests/intelligent_document_vault_ocr.test.js',
  'tests/authorized_admin_portal_access.test.js',
  'tests/admin_auth_security_hardening.test.js'
];

console.log('========================================================================');
console.log('       GOVSCHEME AUTOMATED TEST HARNESS: REPRODUCIBLE 19-SUITE RUN      ');
console.log('========================================================================\n');

const results = [];
let totalPassed = 0;
let totalFailed = 0;
let anySuiteFailed = false;

const overallStart = Date.now();

for (let i = 0; i < suites.length; i++) {
  const file = suites[i];
  const start = Date.now();
  let exitCode = 0;
  let output = '';

  try {
    output = execSync(`node ${file}`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 90000
    });
  } catch (err) {
    exitCode = err.status || 1;
    output = (err.stdout || '') + '\n' + (err.stderr || '');
    anySuiteFailed = true;
  }

  const duration = ((Date.now() - start) / 1000).toFixed(2);

  // Assertion counting across output formats
  let passedCount = 0;
  let failedCount = 0;

  const nodeTestMatch = output.match(/ℹ pass (\d+)/);
  const nodeFailMatch = output.match(/ℹ fail (\d+)/);
  const explicitSummary = output.match(/ALL.*?PASSED.*?:?\s*(\d+)\/(\d+)/i);
  const passMatches = output.match(/\[PASS\]/gi);
  const plainPassMatches = output.match(/^\s*PASS:/gm);
  const checkMatches = output.match(/✔/g);

  if (nodeTestMatch) {
    passedCount = parseInt(nodeTestMatch[1], 10);
    if (nodeFailMatch) failedCount = parseInt(nodeFailMatch[1], 10);
  } else if (explicitSummary) {
    passedCount = parseInt(explicitSummary[1], 10);
  } else if (passMatches) {
    passedCount = passMatches.length;
  } else if (plainPassMatches) {
    passedCount = plainPassMatches.length;
  } else if (checkMatches) {
    passedCount = checkMatches.length;
  }

  totalPassed += passedCount;
  totalFailed += failedCount;

  results.push({
    '#': i + 1,
    suite: file,
    exitCode,
    passedCount,
    failedCount,
    duration: `${duration}s`
  });
}

const totalDuration = ((Date.now() - overallStart) / 1000).toFixed(2);

console.table(results);
console.log('\n========================================================================');
console.log(`TOTAL SUITES EXECUTED:     ${suites.length}`);
console.log(`TOTAL ASSERTIONS PASSED:   ${totalPassed}`);
console.log(`TOTAL ASSERTIONS FAILED:   ${totalFailed}`);
console.log(`TOTAL EXECUTION TIME:      ${totalDuration}s`);
console.log(`HARNESS RESULT:            ${anySuiteFailed ? 'FAIL' : 'PASS (100% GREEN)'}`);
console.log('========================================================================\n');

if (anySuiteFailed) {
  process.exit(1);
} else {
  process.exit(0);
}
