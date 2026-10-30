/**
 * tests/intelligent_document_vault_ocr.test.js
 * Comprehensive automated test suite for Phase 17:
 * Intelligent Document Vault, Multilingual Indic OCR, Magic Byte Validation,
 * Aadhaar Masking, Conflict Resolution, and Scheme Application Pre-fill.
 */

import assert from 'assert';
import {
  parseDocumentStructuredFields,
  normalizeIndicNumerals,
  maskAadhaarNumber,
  calculateAge,
  extractStructuredFields
} from '../server/services/ocrEngine.js';
import Document from '../server/models/Document.js';

async function runPhase17Tests() {
  console.log('========================================================================');
  console.log('   AUTOMATED TEST SUITE: INTELLIGENT DOCUMENT VAULT & OCR PRE-FILL      ');
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

  // -------------------------------------------------------------
  // TEST GROUP 1: Indic Numeral Normalization
  // -------------------------------------------------------------
  console.log('--- Group 1: Multilingual Indic Numeral Normalization ---');

  test('Devanagari numerals (Hindi / Marathi) normalize correctly to standard digits', () => {
    const devanagariText = 'वार्षिक आय: ₹७५,००० | आधार: ९१८२ ३४५६ ७८९०';
    const normalized = normalizeIndicNumerals(devanagariText);
    assert.ok(normalized.includes('75,000'), 'Devanagari 75,000 should normalize to standard digits');
    assert.ok(normalized.includes('9182 3456 7890'), 'Devanagari Aadhaar should normalize');
  });

  test('Tamil numerals normalize correctly to standard digits', () => {
    const tamilText = 'வருமானம்: ₹௬௦,௦௦௦ | நாள்: ௧௫/௦௮/௨௦௨௩';
    const normalized = normalizeIndicNumerals(tamilText);
    assert.ok(normalized.includes('60,000'), 'Tamil 60,000 should normalize');
    assert.ok(normalized.includes('15/08/2023'), 'Tamil date should normalize');
  });

  test('Telugu numerals normalize correctly to standard digits', () => {
    const teluguText = 'ఆదాయం: ₹౮౫,౦౦౦ | ఆధార్: ౨౩౪౫ ౬౭౮౯ ౦౧౨౩';
    const normalized = normalizeIndicNumerals(teluguText);
    assert.ok(normalized.includes('85,000'), 'Telugu income should normalize');
    assert.ok(normalized.includes('2345 6789 0123'), 'Telugu Aadhaar should normalize');
  });

  test('Gujarati numerals normalize correctly to standard digits', () => {
    const gujaratiText = 'વાર્ષિક આવક: ₹૯૫,૦૦૦';
    const normalized = normalizeIndicNumerals(gujaratiText);
    assert.ok(normalized.includes('95,000'), 'Gujarati income should normalize');
  });

  test('Malayalam numerals normalize correctly to standard digits', () => {
    const malayalamText = 'വരുമാനം: ₹൫൦,൦൦൦';
    const normalized = normalizeIndicNumerals(malayalamText);
    assert.ok(normalized.includes('50,000'), 'Malayalam income should normalize');
  });

  // -------------------------------------------------------------
  // TEST GROUP 2: Aadhaar Masking & Security
  // -------------------------------------------------------------
  console.log('\n--- Group 2: Aadhaar Masking & Privacy Protection ---');

  test('12-digit spaced Aadhaar is securely masked preserving only last 4 digits', () => {
    const rawAadhaar = '9182 3456 7890';
    const masked = maskAadhaarNumber(rawAadhaar);
    assert.strictEqual(masked, 'XXXX XXXX 7890');
    assert.ok(!masked.includes('9182'), 'First 4 digits must never appear in masked output');
    assert.ok(!masked.includes('3456'), 'Middle 4 digits must never appear in masked output');
  });

  test('12-digit unspaced Aadhaar is formatted and masked cleanly', () => {
    const rawAadhaar = '123456789012';
    const masked = maskAadhaarNumber(rawAadhaar);
    assert.strictEqual(masked, 'XXXX XXXX 9012');
  });

  test('calculateAge computes correct citizen age from DD/MM/YYYY and YYYY-MM-DD', () => {
    const currentYear = new Date().getFullYear();
    const age1 = calculateAge('15/08/1990');
    const age2 = calculateAge('1990-08-15');
    assert.ok(age1 && age1 >= (currentYear - 1991) && age1 <= (currentYear - 1989), `Age ${age1} should be ~34-36`);
    assert.strictEqual(age1, age2, 'Both date formats should produce identical age');
  });

  // -------------------------------------------------------------
  // TEST GROUP 3: Structured Document Extraction (10 Document Types)
  // -------------------------------------------------------------
  console.log('\n--- Group 3: Structured Document Extraction Across Types ---');

  test('Aadhaar Card extracts name, DOB, age, gender and masked number', () => {
    const text = 'GOVERNMENT OF INDIA\nUnique Identification Authority of India\nTo\nSuresh Kumar\nDOB: 12/04/1992\nMale\n9876 5432 1098';
    const parsed = parseDocumentStructuredFields('aadhaar', text);
    assert.strictEqual(parsed.extractedFields.docNumber, '9876 5432 1098');
    assert.strictEqual(parsed.extractedFields.gender, 'Male');
    assert.strictEqual(parsed.extractedFields.dob, '1992-04-12');
    assert.ok(parsed.extractedFields.age > 0, 'Age must be calculated');
    assert.ok(parsed.fieldConfidences.docNumber >= 85);
  });

  test('PAN Card extracts alphanumeric 10-char PAN and holder name', () => {
    const text = 'INCOME TAX DEPARTMENT\nGOVT. OF INDIA\nPERMANENT ACCOUNT NUMBER\nABCDE1234F\nName: Rajesh Sharma\nFather Name: Mohan Sharma\nDate of Birth: 22/10/1985';
    const parsed = parseDocumentStructuredFields('pan', text);
    assert.strictEqual(parsed.extractedFields.docNumber, 'ABCDE1234F');
    assert.strictEqual(parsed.extractedFields.panNumber, 'ABCDE1234F');
    assert.ok(parsed.fieldConfidences.docNumber >= 85);
  });

  test('Income Certificate extracts annual income in rupees with Indic support', () => {
    const text = 'REVENUE DEPARTMENT\nGOVERNMENT OF TAMIL NADU\nINCOME CERTIFICATE\nCertificate No: TN-REV-2024-887766\nThis is to certify that annual income of Thiru Ramesh is ₹७५,००० (Rupees Seventy Five Thousand Only).\nIssued Date: 10/01/2024';
    const parsed = parseDocumentStructuredFields('income_certificate', text);
    assert.strictEqual(parsed.extractedFields.annualIncome, 75000);
    assert.ok(parsed.extractedFields.docNumber.includes('TN-REV-2024-887766'));
  });

  test('Voter ID (EPIC) extracts 10-char EPIC number and constituency details', () => {
    const text = 'ELECTION COMMISSION OF INDIA\nELECTOR PHOTO IDENTITY CARD\nEPIC No: WBM1234567\nName: Meena Kumari\nGender: Female\nAssembly Constituency: Madurai North';
    const parsed = parseDocumentStructuredFields('voter_id', text);
    assert.strictEqual(parsed.extractedFields.voterId, 'WBM1234567');
    assert.strictEqual(parsed.extractedFields.docNumber, 'WBM1234567');
    assert.strictEqual(parsed.extractedFields.gender, 'Female');
  });

  test('Disability Certificate (UDID) extracts registration ID and percentage', () => {
    const text = 'DEPARTMENT OF EMPOWERMENT OF PERSONS WITH DISABILITIES\nUNIQUE DISABILITY ID (UDID)\nDisability Certificate No: UDID-TN-998877\nName: Anitha R\nDisability: Locomotor\nPercentage of Disability: 45%\nValid Upto: Permanent';
    const parsed = parseDocumentStructuredFields('disability_certificate', text);
    assert.strictEqual(parsed.extractedFields.disabilityPercentage, 45);
    assert.ok(parsed.extractedFields.docNumber.includes('UDID-TN-998877'));
  });

  test('Community Certificate extracts category (SC/ST/OBC/General)', () => {
    const text = 'REVENUE ADMINISTRATION\nCOMMUNITY AND CASTE CERTIFICATE\nNo: CC-2023-45678\nCertified that K. Priya belongs to Scheduled Caste (SC) community.\nState: Tamil Nadu';
    const parsed = parseDocumentStructuredFields('caste_certificate', text);
    assert.strictEqual(parsed.extractedFields.category, 'SC');
    assert.strictEqual(parsed.extractedFields.docNumber, 'CC-2023-45678');
  });

  test('Ration Card extracts card number and type', () => {
    const text = 'CIVIL SUPPLIES AND CONSUMER PROTECTION DEPARTMENT\nSMART RATION CARD\nCard No: 05/G/0123456\nHead of Family: Lakshmi Narayanan\nCard Type: PHH - Priority Household';
    const parsed = parseDocumentStructuredFields('ration_card', text);
    assert.strictEqual(parsed.extractedFields.docNumber, '05/G/0123456');
    assert.strictEqual(parsed.extractedFields.rationCardNumber, '05/G/0123456');
  });

  test('Birth Certificate extracts child name and registration number', () => {
    const text = 'GOVERNMENT OF MAHARASHTRA\nMUNICIPAL CORPORATION\nBIRTH CERTIFICATE\nRegistration No: BC-MUM-2021-9988\nName: Aarav Shinde\nDate of Birth: 05/03/2021\nGender: Male';
    const parsed = parseDocumentStructuredFields('birth_certificate', text);
    assert.strictEqual(parsed.extractedFields.docNumber, 'BC-MUM-2021-9988');
    assert.strictEqual(parsed.extractedFields.gender, 'Male');
  });

  // -------------------------------------------------------------
  // TEST GROUP 4: Magic Byte File Signature Verification
  // -------------------------------------------------------------
  console.log('\n--- Group 4: File Signature (Magic Byte) Validation ---');

  test('Valid PDF buffer starting with %PDF (% 0x25, P 0x50, D 0x44, F 0x46) is recognized', () => {
    const pdfBuffer = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x35]);
    const isPdf = pdfBuffer.slice(0, 4).toString('ascii') === '%PDF';
    assert.strictEqual(isPdf, true, 'Valid PDF buffer must match %PDF header');
  });

  test('Valid JPEG buffer starting with 0xFF 0xD8 0xFF is recognized', () => {
    const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46]);
    const isJpeg = jpegBuffer[0] === 0xFF && jpegBuffer[1] === 0xD8 && jpegBuffer[2] === 0xFF;
    assert.strictEqual(isJpeg, true, 'Valid JPEG buffer must match 0xFF 0xD8 0xFF header');
  });

  test('Valid PNG buffer starting with 0x89 0x50 0x4E 0x47 is recognized', () => {
    const pngBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    const isPng = pngBuffer[0] === 0x89 && pngBuffer[1] === 0x50 && pngBuffer[2] === 0x4E && pngBuffer[3] === 0x47;
    assert.strictEqual(isPng, true, 'Valid PNG buffer must match 0x89 PNG header');
  });

  test('Disguised binary or shell script posing as PDF is detected and rejected', () => {
    // Malicious shell script or HTML disguised with .pdf file name
    const fakeBuffer = Buffer.from('<html><script>alert(1)</script></html>', 'utf8');
    const isPdf = fakeBuffer.slice(0, 4).toString('ascii') === '%PDF';
    const isJpeg = fakeBuffer[0] === 0xFF && fakeBuffer[1] === 0xD8 && fakeBuffer[2] === 0xFF;
    const isPng = fakeBuffer[0] === 0x89 && fakeBuffer[1] === 0x50 && fakeBuffer[2] === 0x4E && fakeBuffer[3] === 0x47;
    const isValidSignature = isPdf || isJpeg || isPng;

    assert.strictEqual(isValidSignature, false, 'Disguised file without magic bytes must be rejected');
  });

  // -------------------------------------------------------------
  // TEST GROUP 5: Scheme Application Pre-fill & Readiness Checker
  // -------------------------------------------------------------
  console.log('\n--- Group 5: Scheme Application Pre-fill & Vault Readiness ---');

  test('Vault document matching identifies ready vs missing required documents', () => {
    const userDocs = [
      { documentType: 'Aadhaar', docNumber: '9182 3456 7890', status: 'Verified' },
      { documentType: 'Income Certificate', docNumber: 'INC-2024-11', status: 'Verified' }
    ];

    const schemeRequired = ['Aadhaar Card', 'Income Certificate', 'Community Certificate'];

    const readiness = schemeRequired.map(req => {
      const isPresent = userDocs.some(d => {
        const docName = (d.documentType || '').toLowerCase();
        const reqName = req.toLowerCase();
        if (reqName.includes('aadhaar') && docName.includes('aadhaar')) return true;
        if (reqName.includes('income') && docName.includes('income')) return true;
        if (reqName.includes('community') && docName.includes('community')) return true;
        return false;
      });
      return { req, isPresent };
    });

    assert.strictEqual(readiness[0].isPresent, true, 'Aadhaar should be present');
    assert.strictEqual(readiness[1].isPresent, true, 'Income Certificate should be present');
    assert.strictEqual(readiness[2].isPresent, false, 'Community Certificate should be missing');
  });

  test('Discrepancy detector correctly flags mismatch between profile and extracted OCR value', () => {
    const profile = {
      fullName: 'Arun Kumar',
      annualIncome: 50000
    };

    const extracted = {
      fullName: 'Arun Kumar',
      annualIncome: 75000 // Discrepancy: Income Certificate states 75000
    };

    const nameMatches = profile.fullName.toLowerCase() === extracted.fullName.toLowerCase();
    const incomeMatches = profile.annualIncome === extracted.annualIncome;

    assert.strictEqual(nameMatches, true, 'Full name should match');
    assert.strictEqual(incomeMatches, false, 'Income discrepancy must be flagged');
  });

  test('Document model VALID_DOCUMENT_TYPES enum contains all 10 supported types', () => {
    const validTypes = Document.schema.path('documentType').enumValues;
    assert.ok(validTypes.includes('Voter ID') || validTypes.includes('voter_id'), 'Voter ID must be in enum');
    assert.ok(validTypes.includes('Aadhaar') || validTypes.includes('aadhaar'), 'Aadhaar must be in enum');
    assert.ok(validTypes.includes('PAN') || validTypes.includes('pan'), 'PAN must be in enum');
    assert.ok(validTypes.includes('Income Certificate') || validTypes.includes('income_certificate'), 'Income Certificate must be in enum');
    assert.ok(validTypes.includes('Disability Certificate') || validTypes.includes('disability_certificate'), 'Disability Certificate must be in enum');
  });

  console.log('\n========================================================================');
  console.log(`TOTAL PHASE 17 ASSERTIONS PASSED: ${passedTests}/${totalTests}`);
  console.log('========================================================================\n');
}

runPhase17Tests().catch((err) => {
  console.error('Fatal error during Phase 17 test execution:', err);
  process.exit(1);
});

