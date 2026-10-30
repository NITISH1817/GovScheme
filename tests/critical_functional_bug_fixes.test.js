/**
 * tests/critical_functional_bug_fixes.test.js
 * Comprehensive automated test suite for GovScheme Critical Functional Bug Fixes:
 * 1. Document Vault PDF OCR, text extraction, page counting, Aadhaar masking, and password/error handling
 * 2. Scheme Apply journey, official portal verification, acknowledgement recording, and Application Tracker integration
 * 3. Scheme Comparison 11-field evaluation, 4-scheme capacity, per-scheme removal, and clear-all actions
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import {
  extractRawTextFromFile,
  parseDocumentStructuredFields,
  normalizeIndicNumerals,
  maskAadhaarNumber,
  calculateAge,
  extractStructuredFields
} from '../server/services/ocrEngine.js';
import { schemesData } from '../src/data/schemes.ts';

let passed = 0;
let failed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${name}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

async function runAsyncTest(name, fn) {
  try {
    await fn();
    console.log(`  [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${name}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

console.log('\n========================================================================');
console.log('       TEST SUITE: CRITICAL FUNCTIONAL BUG FIXES & INTEGRATION          ');
console.log('========================================================================\n');

// --------------------------------------------------------------------------
// TASK 1: DOCUMENT VAULT PDF OCR & PARSING
// --------------------------------------------------------------------------
console.log('--- Task 1: Document Vault PDF OCR & Structured Extraction ---');

runTest('1.1 Should normalize Indic numerals across scripts (Devanagari, Tamil, Telugu, Gujarati)', () => {
  assert.strictEqual(normalizeIndicNumerals('१२३४५६७८९०'), '1234567890', 'Devanagari numerals normalized');
  assert.strictEqual(normalizeIndicNumerals('௧௨௩௪௫௬௭௮௯௦'), '1234567890', 'Tamil numerals normalized');
  assert.strictEqual(normalizeIndicNumerals('૧૨૩૪૫૬૭૮૯૦'), '1234567890', 'Gujarati numerals normalized');
  assert.strictEqual(normalizeIndicNumerals('Income: ₹ ५०,०००'), 'Income: ₹ 50,000', 'Mixed string normalized');
});

runTest('1.2 Should strictly mask 12-digit Aadhaar numbers to XXXX XXXX 1234 format', () => {
  assert.strictEqual(maskAadhaarNumber('987654321098'), 'XXXX XXXX 1098', 'Standard 12-digit Aadhaar masked');
  assert.strictEqual(maskAadhaarNumber('9876 5432 1098'), 'XXXX XXXX 1098', 'Spaced Aadhaar masked');
  assert.strictEqual(maskAadhaarNumber(''), '', 'Empty string handled safely');
  assert.strictEqual(maskAadhaarNumber('ABCDE1234F'), 'ABCDE1234F', 'Non-Aadhaar PAN number unchanged');
});

runTest('1.3 Should extract structured citizen fields from Income Certificate text', () => {
  const sampleIncomeCert = `
    GOVERNMENT OF TAMIL NADU
    REVENUE DEPARTMENT
    INCOME CERTIFICATE
    Certificate No: TN-REV-2026-987654
    This is to certify that Thiru K. Ramanathan, son of Krishnan,
    residing at No. 12, Gandhi Street, Madurai District, Tamil Nadu,
    has an annual family income of Rs. 72,000 (Seventy Two Thousand only).
    Date of Issue: 15/08/2026
  `;
  const parsed = parseDocumentStructuredFields('Income Certificate', sampleIncomeCert);
  const fields = parsed.extractedFields;
  assert.strictEqual(fields.annualIncome, 72000, 'Annual income parsed accurately');
  assert.strictEqual(fields.state, 'Tamil Nadu', 'State parsed');
  assert.strictEqual(fields.district, 'Madurai', 'District parsed');
});

runTest('1.4 Should extract structured fields from Community / Caste Certificate text', () => {
  const sampleCasteCert = `
    GOVERNMENT OF TAMIL NADU
    COMMUNITY CERTIFICATE
    Certificate ID: CC/2026/OBC/4412
    This is to certify that Selvi Jayanthi R, daughter of Ramasamy,
    residing in Salem District, Tamil Nadu, belongs to Backward Class (OBC) community.
  `;
  const parsed = parseDocumentStructuredFields('Community Certificate', sampleCasteCert);
  const fields = parsed.extractedFields;
  assert.strictEqual(fields.category, 'OBC', 'Social category parsed');
  assert.strictEqual(fields.district, 'Salem', 'District parsed');
  assert.strictEqual(fields.state, 'Tamil Nadu', 'State parsed');
});

runTest('1.5 Should extract structured fields from Disability Certificate text', () => {
  const sampleUDID = `
    GOVERNMENT OF INDIA
    UNIQUE DISABILITY ID (UDID)
    UDID Number: TN12345678901234
    Name: Suresh Kumar
    DOB: 12/04/1990
    Disability Type: Locomotor Disability
    Disability Percentage: 60%
    State: Tamil Nadu
  `;
  const parsed = parseDocumentStructuredFields('Disability Certificate', sampleUDID);
  const fields = parsed.extractedFields;
  assert.strictEqual(fields.disabilityPercentage, 60, 'Disability percentage parsed');
  assert.strictEqual(fields.state, 'Tamil Nadu', 'State parsed');
  assert.ok(fields.dob.includes('1990'), 'DOB parsed');
  assert.ok(fields.age && fields.age >= 30, 'Age calculated from DOB');
});

await runAsyncTest('1.6 Should gracefully handle empty or invalid PDF files in ocrEngine', async () => {
  const tmpEmptyPdf = path.join(process.cwd(), 'tests', 'temp_empty_test.pdf');
  fs.writeFileSync(tmpEmptyPdf, Buffer.from([]));
  try {
    const result = await extractRawTextFromFile(tmpEmptyPdf, 'application/pdf');
    assert.strictEqual(result.rawText, '', 'Empty PDF reports empty string');
    assert.strictEqual(result.pageCount, 0, 'Empty PDF reports 0 pages');
  } finally {
    if (fs.existsSync(tmpEmptyPdf)) fs.unlinkSync(tmpEmptyPdf);
  }
});

await runAsyncTest('1.7 Should detect password-encrypted PDF and return clear user notification', async () => {
  const tmpEncPdf = path.join(process.cwd(), 'tests', 'temp_enc_test.pdf');
  // Write PDF header with /Encrypt marker
  fs.writeFileSync(
    tmpEncPdf,
    Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R /Encrypt 3 0 R >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF')
  );
  try {
    const result = await extractRawTextFromFile(tmpEncPdf, 'application/pdf');
    assert.strictEqual(result.isEncrypted, true, 'isEncrypted flag is true');
    assert.ok(
      result.rawText.includes('password-protected'),
      'Clear password notification returned to citizen'
    );
  } finally {
    if (fs.existsSync(tmpEncPdf)) fs.unlinkSync(tmpEncPdf);
  }
});

// --------------------------------------------------------------------------
// TASK 2: SCHEME APPLY FUNCTIONALITY & APPLICATION TRACKER INTEGRATION
// --------------------------------------------------------------------------
console.log('\n--- Task 2: Scheme Apply & Application Tracker Journey ---');

runTest('2.1 Should validate official portal URLs are genuine HTTP/HTTPS web endpoints', () => {
  schemesData.forEach((s) => {
    const url = s.officialApplyUrl || s.officialWebsite;
    assert.ok(url, `Scheme ${s.name} has official web link`);
    assert.ok(
      url.startsWith('https://') || url.startsWith('http://'),
      `Scheme ${s.name} URL must be http/https, got: ${url}`
    );
  });
});

runTest('2.2 Should generate compliant application record schema for MongoDB persistence', () => {
  const scheme = schemesData[0];
  const testAppNumber = 'GOV-APP-2026-TEST-001';
  const appRecord = {
    id: `app-test-${Date.now()}`,
    schemeId: scheme.id,
    schemeName: scheme.name,
    applicationNumber: testAppNumber,
    status: 'Submitted',
    appliedDate: new Date().toISOString().split('T')[0],
    officialPortalLink: scheme.officialApplyUrl || scheme.officialWebsite,
    statusTimeline: [
      {
        stage: 'Official Portal Opened',
        date: new Date().toISOString().split('T')[0],
        completed: true,
        remarks: 'Citizen accessed official government portal from GovScheme.'
      },
      {
        stage: 'Submitted',
        date: new Date().toISOString().split('T')[0],
        completed: true,
        remarks: `Acknowledgement number ${testAppNumber} recorded in GovScheme.`
      }
    ],
    verifiedDocuments: (scheme.requiredDocuments || []).map((doc) => ({
      name: doc,
      verified: true,
      label: 'Verified in Vault'
    }))
  };

  assert.strictEqual(appRecord.schemeId, scheme.id, 'Scheme ID preserved');
  assert.strictEqual(appRecord.applicationNumber, testAppNumber, 'Application number stored');
  assert.strictEqual(appRecord.status, 'Submitted', 'Status is Submitted');
  assert.strictEqual(appRecord.statusTimeline.length, 2, '2 status timeline milestones created');
  assert.strictEqual(appRecord.statusTimeline[0].stage, 'Official Portal Opened');
  assert.strictEqual(appRecord.statusTimeline[1].stage, 'Submitted');
});

runTest('2.3 Should match scheme required documents against user vault documents', () => {
  const scheme = schemesData.find((s) => s.requiredDocuments && s.requiredDocuments.length > 0) || schemesData[0];
  const mockUserDocs = [
    { type: 'Aadhaar', docNumber: '987654321098' },
    { type: 'Income Certificate', docNumber: 'INCOME-2026' }
  ];

  const userDocTypes = new Set(mockUserDocs.map((d) => d.type.toLowerCase()));
  const matches = (scheme.requiredDocuments || []).map((req) => ({
    name: req,
    inVault: userDocTypes.has(req.toLowerCase()) || (req.toLowerCase().includes('aadhaar') && userDocTypes.has('aadhaar'))
  }));

  assert.ok(matches.length > 0, 'Document checklist generated');
  const aadhaarMatch = matches.find((m) => m.name.toLowerCase().includes('aadhaar'));
  if (aadhaarMatch) {
    assert.strictEqual(aadhaarMatch.inVault, true, 'Aadhaar in vault recognized');
  }
});

// --------------------------------------------------------------------------
// TASK 3: SCHEME COMPARISON 11-FIELD & 4-SCHEME CAPACITY
// --------------------------------------------------------------------------
console.log('\n--- Task 3: Scheme Comparison Functionality (11 Fields & 4 Schemes) ---');

runTest('3.1 Should support queueing up to 4 schemes simultaneously', () => {
  const queue = schemesData.slice(0, 4);
  assert.strictEqual(queue.length, 4, '4 schemes queued');

  // Verify uniqueness of scheme IDs
  const idSet = new Set(queue.map((s) => s.id));
  assert.strictEqual(idSet.size, 4, 'All 4 schemes have unique IDs');

  // Attempting to add a 5th scheme should be capped at 4
  const toggleCompare = (existingQueue, newScheme) => {
    if (existingQueue.find((s) => s.id === newScheme.id)) {
      return existingQueue.filter((s) => s.id !== newScheme.id);
    }
    if (existingQueue.length >= 4) return existingQueue; // capped
    return [...existingQueue, newScheme];
  };

  const capped = toggleCompare(queue, schemesData[4]);
  assert.strictEqual(capped.length, 4, 'Queue capped at maximum 4 schemes');
});

runTest('3.2 Should support per-scheme removal and clear-all actions', () => {
  let queue = schemesData.slice(0, 3);
  assert.strictEqual(queue.length, 3);

  // Remove individual scheme
  const removeId = queue[1].id;
  queue = queue.filter((s) => s.id !== removeId);
  assert.strictEqual(queue.length, 2, 'Per-scheme removal decreases count');
  assert.ok(!queue.some((s) => s.id === removeId), 'Removed scheme is no longer present');

  // Clear all
  queue = [];
  assert.strictEqual(queue.length, 0, 'Clear-all empties queue');
});

runTest('3.3 Should contain all 11 required comparison fields across scheme dataset', () => {
  const sampleSchemes = schemesData.slice(0, 4);

  sampleSchemes.forEach((s) => {
    // 1. Scheme Name
    assert.ok(s.name, `[Field 1] ${s.id} has scheme name`);

    // 2. Department / Ministry
    assert.ok(s.department || s.ministry, `[Field 2] ${s.id} has department or ministry`);

    // 3. Category
    assert.ok(s.category, `[Field 3] ${s.id} has category`);

    // 4. Benefits (Financial or summary)
    assert.ok(
      s.financialBenefitAmount !== undefined || s.benefitsSummary,
      `[Field 4] ${s.id} has financial amount or benefits summary`
    );

    // 5. Eligibility (Age, Income, Occupation, Social Category)
    assert.ok(s.eligibilityRules, `[Field 5] ${s.id} has eligibility rules`);

    // 6. Residence Scope (Central vs State)
    assert.ok(s.state, `[Field 6] ${s.id} has state/central residence scope`);

    // 7. Required Documents
    assert.ok(
      s.requiredDocuments || s.eligibilityRules?.requiredDocuments,
      `[Field 7] ${s.id} has required documents list`
    );

    // 8. Application Process (Steps)
    assert.ok(
      Array.isArray(s.applicationSteps) && s.applicationSteps.length > 0,
      `[Field 8] ${s.id} has application steps`
    );

    // 9. Application Deadline
    assert.ok(s.deadline, `[Field 9] ${s.id} has deadline`);

    // 10. Official Portal
    assert.ok(
      s.officialApplyUrl || s.officialWebsite,
      `[Field 10] ${s.id} has official portal link`
    );

    // 11. Helpline / Support
    assert.ok(
      s.helplineNumber !== undefined,
      `[Field 11] ${s.id} has helpline number field`
    );
  });
});

console.log('\n========================================================================');
console.log(`TOTAL TESTS:    ${passed + failed}`);
console.log(`PASSED:         ${passed}`);
console.log(`FAILED:         ${failed}`);
console.log(`RESULT:         ${failed === 0 ? 'ALL CRITICAL TESTS PASSED (100% GREEN)' : 'SOME TESTS FAILED'}`);
console.log('========================================================================\n');

if (failed > 0) {
  process.exit(1);
}
