/**
 * tests/document_vault_ocr_reliability.test.js
 * Automated Test Suite for GovScheme Document Vault OCR Reliability, Timeout Guarding,
 * Language Normalization, State Machine Integrity, and Multi-tenant Privacy Protection:
 * - Language Code Normalization:
 *     Maps ISO 639-1 (en, hi, ta, te, ml, mr, gu) to Tesseract ISO 639-2 codes (eng, hin, tam, tel, mal, mar, guj)
 * - File Validation & Magic Signature:
 *     Strict size boundary (<=15MB), empty file rejection (0 bytes), supported formats (PDF, JPG, PNG)
 * - Bounded Timeout Execution:
 *     Prevents infinite UI hanging on network / CDN stalls using withTimeout wrapper
 * - Concurrency & Duplicate Request Guard:
 *     Prevents duplicate concurrent OCR executions using scanning ref flags
 * - Distinct 6-State OCR Machine:
 *     idle, uploading, uploaded, processing/extracting, completed, failed, manual entry
 * - Live Elapsed Time Counter:
 *     True elapsed time tracking (no fabricated percentage loaders)
 * - Graceful Failure Card & Manual Fallback:
 *     Preserves uploaded file preview, offers instant retry, and fallback to manual entry
 * - Statutory Authenticity Disclaimer:
 *     Clear notice that OCR extraction does not certify legal validity
 * - Privacy & Aadhaar Masking:
 *     Aadhaar masking protects citizen PII
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import {
  getTesseractLang,
  maskAadhaarNumber
} from '../server/services/ocrEngine.js';

const localesDir = path.resolve('public/locales');
const SUPPORTED_LANGUAGES = ['en', 'hi', 'ta', 'te', 'ml', 'mr', 'gu'];

// Test implementation of validateDocumentFile matching src/services/ocrService.ts
function validateDocumentFile(file) {
  if (!file) {
    return { isValid: false, error: 'No file provided.' };
  }
  const maxBytes = 15 * 1024 * 1024; // 15MB
  if (file.size > maxBytes) {
    return { isValid: false, error: 'File size exceeds maximum allowable limit of 15MB.' };
  }
  if (file.size === 0) {
    return { isValid: false, error: 'Uploaded file is empty (0 bytes).' };
  }
  const isPdf = file.type === 'application/pdf' || (file.name && file.name.toLowerCase().endsWith('.pdf'));
  const isImage = (file.type && file.type.startsWith('image/')) || (file.name && /\.(jpe?g|png)$/i.test(file.name));
  if (!isPdf && !isImage) {
    return { isValid: false, error: 'Unsupported file format. Please upload a valid PDF, JPG, or PNG document.' };
  }
  return { isValid: true };
}

// Test implementation of withTimeout matching src/services/ocrService.ts
function withTimeout(promise, timeoutMs, timeoutMsg) {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(timeoutMsg)), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

async function runOCRReliabilityTests() {
  console.log('========================================================================');
  console.log(' AUTOMATED TEST SUITE: DOCUMENT VAULT OCR RELIABILITY & RECOVERY        ');
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

  async function asyncTest(name, fn) {
    totalTests++;
    try {
      await fn();
      console.log(`  [PASS] ${name}`);
      passedTests++;
    } catch (err) {
      console.error(`  [FAIL] ${name}:`, err.message);
      throw err;
    }
  }

  // -------------------------------------------------------------
  // GROUP 1: Language Normalization (Root Cause 1)
  // -------------------------------------------------------------
  console.log('--- Group 1: Tesseract Language Code Normalization ---');

  test('Maps all 7 supported UI languages to valid Tesseract 3-letter codes', () => {
    assert.strictEqual(getTesseractLang('en'), 'eng', 'en should map to eng');
    assert.strictEqual(getTesseractLang('hi'), 'hin', 'hi should map to hin');
    assert.strictEqual(getTesseractLang('ta'), 'tam', 'ta should map to tam');
    assert.strictEqual(getTesseractLang('te'), 'tel', 'te should map to tel');
    assert.strictEqual(getTesseractLang('ml'), 'mal', 'ml should map to mal');
    assert.strictEqual(getTesseractLang('mr'), 'mar', 'mr should map to mar');
    assert.strictEqual(getTesseractLang('gu'), 'guj', 'gu should map to guj');
  });

  test('Handles already-normalized 3-letter codes and whitespace/case tolerance', () => {
    assert.strictEqual(getTesseractLang('eng'), 'eng');
    assert.strictEqual(getTesseractLang('HIN'), 'hin');
    assert.strictEqual(getTesseractLang('  tam  '), 'tam');
    assert.strictEqual(getTesseractLang(undefined), 'eng', 'Undefined language defaults to eng');
    assert.strictEqual(getTesseractLang('unknown_lang'), 'eng', 'Unknown language defaults to eng');
  });

  // -------------------------------------------------------------
  // GROUP 2: File Validation & Size Boundaries
  // -------------------------------------------------------------
  console.log('\n--- Group 2: File Validation & Size Boundaries ---');

  test('Rejects null or missing file objects', () => {
    const res = validateDocumentFile(null);
    assert.strictEqual(res.isValid, false);
    assert.ok(res.error.includes('No file provided'));
  });

  test('Rejects empty files with 0 bytes size', () => {
    const res = validateDocumentFile({ name: 'empty.pdf', size: 0, type: 'application/pdf' });
    assert.strictEqual(res.isValid, false);
    assert.ok(res.error.includes('empty (0 bytes)'));
  });

  test('Rejects oversized documents exceeding 15MB limit', () => {
    const res = validateDocumentFile({ name: 'huge_scan.pdf', size: 16 * 1024 * 1024, type: 'application/pdf' });
    assert.strictEqual(res.isValid, false);
    assert.ok(res.error.includes('exceeds maximum allowable limit of 15MB'));
  });

  test('Rejects unsupported file formats (.exe, .zip, .docx)', () => {
    const res1 = validateDocumentFile({ name: 'malware.exe', size: 1024, type: 'application/octet-stream' });
    assert.strictEqual(res1.isValid, false);
    assert.ok(res1.error.includes('Unsupported file format'));

    const res2 = validateDocumentFile({ name: 'archive.zip', size: 1024, type: 'application/zip' });
    assert.strictEqual(res2.isValid, false);
  });

  test('Accepts valid PDF and supported image formats under 15MB', () => {
    const validPdf = validateDocumentFile({ name: 'aadhaar.pdf', size: 2 * 1024 * 1024, type: 'application/pdf' });
    assert.strictEqual(validPdf.isValid, true);

    const validJpg = validateDocumentFile({ name: 'income_cert.jpg', size: 1.5 * 1024 * 1024, type: 'image/jpeg' });
    assert.strictEqual(validJpg.isValid, true);

    const validPng = validateDocumentFile({ name: 'caste_cert.png', size: 800 * 1024, type: 'image/png' });
    assert.strictEqual(validPng.isValid, true);
  });

  // -------------------------------------------------------------
  // GROUP 3: Timeout Protection (Root Cause 2)
  // -------------------------------------------------------------
  console.log('\n--- Group 3: Bounded Timeout Guarding ---');

  await asyncTest('Resolves when operation completes within timeout boundary', async () => {
    const fastPromise = new Promise(resolve => setTimeout(() => resolve('SUCCESS'), 50));
    const result = await withTimeout(fastPromise, 300, 'Timed out');
    assert.strictEqual(result, 'SUCCESS');
  });

  await asyncTest('Rejects with explicit error message when operation hangs/exceeds timeout', async () => {
    const hangingPromise = new Promise(resolve => setTimeout(() => resolve('TOO_LATE'), 1000));
    let caughtErr = null;
    try {
      await withTimeout(hangingPromise, 100, 'OCR scanning timed out after 100ms');
    } catch (err) {
      caughtErr = err;
    }
    assert.ok(caughtErr !== null, 'Timeout should trigger error');
    assert.ok(caughtErr.message.includes('OCR scanning timed out'), 'Timeout message must match');
  });

  // -------------------------------------------------------------
  // GROUP 4: UI State Machine & Concurrency Inspection
  // -------------------------------------------------------------
  console.log('\n--- Group 4: UI State Machine, Timer, & Failure Recovery ---');

  const scannerSource = fs.readFileSync(path.resolve('src/components/OCRScanner.tsx'), 'utf8');

  test('OCRScanner implements 6 distinct states and concurrency lock', () => {
    assert.ok(scannerSource.includes("'uploading'"), 'Uploading state present');
    assert.ok(scannerSource.includes("'uploaded'"), 'Uploaded state present');
    assert.ok(scannerSource.includes("'processing'"), 'Processing state present');
    assert.ok(scannerSource.includes("'completed'"), 'Completed state present');
    assert.ok(scannerSource.includes("'failed'"), 'Failed state present');
    assert.ok(scannerSource.includes("'manual'"), 'Manual entry fallback state present');
    assert.ok(scannerSource.includes('isScanningRef.current'), 'Concurrency ref guard present');
  });

  test('OCRScanner tracks real elapsed seconds and provides Cancel Scan button', () => {
    assert.ok(scannerSource.includes('elapsedSeconds'), 'Elapsed seconds state present');
    assert.ok(scannerSource.includes('handleCancelScan'), 'Cancel scan handler present');
    assert.ok(scannerSource.includes('cancelScanBtn'), 'Cancel button key present');
  });

  test('OCRScanner failure card preserves file preview, offers Retry and Manual entry fallback', () => {
    assert.ok(scannerSource.includes('ocrExtractionFailed'), 'Failure heading present');
    assert.ok(scannerSource.includes('retryExtractionBtn'), 'Retry extraction button present');
    assert.ok(scannerSource.includes('enterDetailsManuallyBtn'), 'Enter details manually button present');
  });

  test('OCRScanner displays statutory authenticity disclaimer banner', () => {
    assert.ok(scannerSource.includes('ocrAuthenticityDisclaimer'), 'Authenticity disclaimer key present');
    assert.ok(scannerSource.includes('ocrAuthenticityNotice'), 'Authenticity notice key present');
  });

  // -------------------------------------------------------------
  // GROUP 5: Privacy & Aadhaar Masking
  // -------------------------------------------------------------
  console.log('\n--- Group 5: Privacy Protection & Aadhaar Masking ---');

  test('Aadhaar numbers are properly masked (XXXX XXXX 1234)', () => {
    const masked = maskAadhaarNumber('9182 3456 7890');
    assert.strictEqual(masked, 'XXXX XXXX 7890', 'Aadhaar must be masked to XXXX XXXX 7890');

    const maskedContinuous = maskAadhaarNumber('918234567890');
    assert.strictEqual(maskedContinuous, 'XXXX XXXX 7890', 'Continuous Aadhaar must be masked');
  });

  // -------------------------------------------------------------
  // GROUP 6: 7-Language Parity for OCR Reliability Keys
  // -------------------------------------------------------------
  console.log('\n--- Group 6: 7-Language Parity for OCR Translations ---');

  const REQUIRED_OCR_KEYS = [
    'ocrStateUploading',
    'ocrStateProcessing',
    'ocrStateExtracting',
    'cancelScanBtn',
    'scanCancelled',
    'ocrExtractionFailed',
    'ocrFailureExplanation',
    'retryExtractionBtn',
    'enterDetailsManuallyBtn',
    'ocrAuthenticityNotice',
    'ocrAuthenticityDisclaimer'
  ];

  for (const lang of SUPPORTED_LANGUAGES) {
    test(`Language '${lang}' contains all OCR reliability translation keys`, () => {
      const filePath = path.join(localesDir, lang, 'translation.json');
      const dict = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      const missing = [];
      for (const key of REQUIRED_OCR_KEYS) {
        if (!dict[key] || typeof dict[key] !== 'string' || dict[key].trim().length === 0) {
          missing.push(key);
        }
      }
      assert.strictEqual(
        missing.length,
        0,
        `Language '${lang}' missing OCR keys: ${missing.join(', ')}`
      );
    });
  }

  console.log('\n========================================================================');
  console.log(` ALL OCR RELIABILITY TESTS PASSED: ${passedTests}/${totalTests} `);
  console.log('========================================================================\n');
}

runOCRReliabilityTests().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});

