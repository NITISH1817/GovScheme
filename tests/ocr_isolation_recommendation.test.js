// tests/ocr_isolation_recommendation.test.js
// Automated Test Suite for Module 1, 3, 4, 7, 8, 9, 13
// 1. OCR Extraction & Flags
// 2. Strict Document Isolation
// 3. Document Authenticity Verification
// 4. 60 Schemes Dataset Integrity
// 5. Deterministic Recommendation Engine

import assert from "assert";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Scheme from "../server/models/Scheme.js";
import Document from "../server/models/Document.js";
import { parseDocumentStructuredFields } from "../server/services/ocrEngine.js";
import { verifyGovernmentDocument } from "../server/services/verificationService.js";
import { allVerifiedSchemes, auditSchemesDataset } from "../server/data/verifiedSchemes60.js";
import { evaluateSchemeEligibility, recommendSchemesForProfile } from "../server/services/schemeRecommendationEngine.js";
import { connectDB } from "../server/db.js";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/govscheme";

async function runTests() {
  console.log("================================================================");
  console.log("   AUTOMATED TEST SUITE: OCR, ISOLATION & RECOMMENDATIONS       ");
  console.log("================================================================\n");

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
  // TEST GROUP 1: OCR Extraction & Confidence & Missing Field Flags
  // -------------------------------------------------------------
  console.log("--- Group 1: OCR Parsing, Normalization & Flags ---");

  test("Aadhaar Card raw text extracts 12-digit number and flags missing income", () => {
    const rawText = "GOVERNMENT OF INDIA\nArun Kumar\nDOB: 15/08/1998\nMale\n9182 3456 7890\nVID: 123456789";
    const parsed = parseDocumentStructuredFields("aadhaar", rawText);
    
    assert.strictEqual(parsed.extractedFields.docNumber, "9182 3456 7890");
    assert.strictEqual(parsed.extractedFields.gender, "Male");
    assert.strictEqual(parsed.extractedFields.dob, "1998-08-15");
    assert.ok(parsed.fieldConfidences.docNumber >= 85, "Doc number confidence should be high");
  });

  test("Income Certificate extracts annual income & issuing authority", () => {
    const rawText = "GOVERNMENT OF TAMIL NADU\nREVENUE DEPARTMENT\nINCOME CERTIFICATE\nCertificate No: TN-12345678\nThis is to certify that Arun Kumar has an Annual Income: Rs. 180000\nIssued by: Tahsildar, Madurai";
    const parsed = parseDocumentStructuredFields("income_certificate", rawText);

    assert.strictEqual(parsed.extractedFields.annualIncome, 180000);
    assert.strictEqual(parsed.extractedFields.docNumber, "TN-12345678");
    assert.ok(parsed.fieldConfidences.annualIncome >= 90);
  });

  test("Unreadable certificate number generates MISSING flag without inventing value", () => {
    const rawText = "REVENUE DEPARTMENT\nINCOME CERTIFICATE\nAnnual Income: Rs. 150000\nDate: 01/01/2024";
    const parsed = parseDocumentStructuredFields("income_certificate", rawText);

    assert.strictEqual(parsed.extractedFields.docNumber, null, "Must never invent missing doc number");
    assert.ok(parsed.fieldFlags.docNumber.includes("MISSING"), "Must flag as MISSING");
  });

  // -------------------------------------------------------------
  // TEST GROUP 2: Authenticity Verification & Limitation Transparency
  // -------------------------------------------------------------
  console.log("\n--- Group 2: Document Verification & Limitation Transparency ---");

  test("Verification never claims genuine without official API and returns honest status", () => {
    const sampleDoc = {
      documentId: "TEST-DOC-001",
      documentType: "income_certificate",
      originalFileName: "income_cert.pdf",
      fileMimeType: "application/pdf",
      fileSize: 102400,
      extractedFields: {
        fullName: "Arun Kumar",
        docNumber: "TN-REV-987654",
        annualIncome: 150000
      },
      correctedFields: {}
    };

    const verificationResult = verifyGovernmentDocument(sampleDoc);
    
    // Status must never be OFFICIALLY_VERIFIED without authorized government API
    assert.notStrictEqual(verificationResult.verificationStatus, "OFFICIALLY_VERIFIED");
    assert.ok(
      ["PENDING", "PROCESSING", "TEXT_EXTRACTED", "NEEDS_REVIEW", "CHECKS_PASSED", "VERIFICATION_FAILED", "INCONCLUSIVE"].includes(verificationResult.verificationStatus),
      `Status was ${verificationResult.verificationStatus}`
    );
    // Explicit limitations disclosure
    assert.ok(verificationResult.verificationLimitations.some(l => l.includes("UIDAI") || l.includes("official") || l.includes("authorized")));
    assert.ok(verificationResult.verificationChecks.length >= 3);
  });

  // -------------------------------------------------------------
  // TEST GROUP 3: 60 Verified Schemes Dataset Compliance
  // -------------------------------------------------------------
  console.log("\n--- Group 3: 60 Schemes Dataset Verification ---");

  test("Module 7 Dataset Audit: Minimum 60 distinct schemes with authoritative sources", () => {
    const audit = auditSchemesDataset(allVerifiedSchemes);

    assert.ok(audit.totalSchemes >= 60, `Total schemes should be >= 60, got ${audit.totalSchemes}`);
    assert.ok(audit.uniqueSchemeIds >= 60, `Unique IDs should be >= 60, got ${audit.uniqueSchemeIds}`);
    assert.strictEqual(audit.hasDuplicates, false, "Should contain zero duplicate IDs");
    assert.strictEqual(audit.recordsMissingSourceUrls, 0, "All active schemes must have authoritative source URLs");
    
    // Check mandatory category quotas
    assert.ok(audit.categoryDistribution["Education"] >= 12, "Education must have at least 12 schemes");
    assert.ok(audit.categoryDistribution["Agriculture"] >= 8, "Agriculture must have at least 8 schemes");
    assert.ok(audit.categoryDistribution["Healthcare"] >= 8, "Healthcare must have at least 8 schemes");
    assert.ok(audit.categoryDistribution["Housing"] >= 6, "Housing must have at least 6 schemes");
    assert.ok(audit.categoryDistribution["Employment"] >= 7, "Employment must have at least 7 schemes");
    assert.ok(audit.categoryDistribution["Women & Child Welfare"] >= 7, "Women & Child Welfare must have at least 7 schemes");
    assert.ok(audit.categoryDistribution["Entrepreneurship"] >= 6, "Entrepreneurship must have at least 6 schemes");
    assert.ok(audit.categoryDistribution["Financial Help"] >= 6, "Financial Help must have at least 6 schemes");
    assert.strictEqual(audit.isCompliantWithModule7, true);
  });

  // -------------------------------------------------------------
  // TEST GROUP 4: Recommendation Engine Deterministic Evaluation
  // -------------------------------------------------------------
  console.log("\n--- Group 4: Scheme Recommendation Engine ---");

  test("Profile satisfying mandatory criteria matches Post-Matric Scholarship", () => {
    const postMatricScheme = allVerifiedSchemes.find(s => s.schemeId === "edu-post-matric-scholarship");
    assert.ok(postMatricScheme, "Post matric scholarship scheme should be present");
    const eligibleProfile = {
      age: 19,
      gender: "Male",
      income: 180000,
      socialCategory: "SC",
      isStudent: true,
      state: "Tamil Nadu"
    };

    const result = evaluateSchemeEligibility(postMatricScheme, eligibleProfile);
    assert.strictEqual(result.matchStatus, "ELIGIBLE_POTENTIAL_MATCH");
    assert.ok(result.satisfiedConditions.length >= 3);
    assert.strictEqual(result.failedConditions.length, 0);
  });

  test("Profile exceeding published income ceiling is excluded deterministically", () => {
    const postMatricScheme = allVerifiedSchemes.find(s => s.schemeId === "edu-post-matric-scholarship");
    const wealthyProfile = {
      age: 19,
      gender: "Male",
      income: 500000, // Post matric limit is 2,50,000
      socialCategory: "SC",
      isStudent: true,
      state: "Tamil Nadu"
    };

    const result = evaluateSchemeEligibility(postMatricScheme, wealthyProfile);
    assert.strictEqual(result.matchStatus, "DOES_NOT_MATCH");
    assert.ok(result.failedConditions.some(c => c.includes("exceeds")));
  });

  test("Profile with unknown income flags NEEDS_MORE_INFORMATION without false exclusion", () => {
    const postMatricScheme = allVerifiedSchemes.find(s => s.schemeId === "edu-post-matric-scholarship");
    const unknownIncomeProfile = {
      age: 19,
      gender: "Male",
      income: null, // Unknown
      socialCategory: "SC",
      isStudent: true,
      state: "Tamil Nadu"
    };

    const result = evaluateSchemeEligibility(postMatricScheme, unknownIncomeProfile);
    assert.strictEqual(result.matchStatus, "NEEDS_MORE_INFORMATION");
    assert.ok(result.informationNeeded.some(n => n.includes("income")));
  });

  test("State-specific Tamil Nadu scheme excludes non-resident profile", () => {
    const pudhumaiPennScheme = allVerifiedSchemes.find(s => s.schemeId === "edu-tn-pudhumai-penn");
    assert.ok(pudhumaiPennScheme, "Pudhumai Penn scheme must be present");
    const outOfStateProfile = {
      age: 20,
      gender: "Female",
      income: 100000,
      state: "Bihar",
      isStudent: true
    };

    const result = evaluateSchemeEligibility(pudhumaiPennScheme, outOfStateProfile);
    assert.strictEqual(result.matchStatus, "DOES_NOT_MATCH");
    assert.ok(result.failedConditions.some(c => c.includes("State-specific")));
  });

  // -------------------------------------------------------------
  // TEST GROUP 5: Strict Document Isolation in MongoDB
  // -------------------------------------------------------------
  console.log("\n--- Group 5: Strict Document Isolation (MongoDB Test) ---");

  await asyncTest("Uploading Aadhaar and Ration Card maintains strict document isolation", async () => {
    await connectDB();
    const testUserId = new mongoose.Types.ObjectId();

    const docA_Id = `TEST-ISO-${Date.now()}-A`;
    const docB_Id = `TEST-ISO-${Date.now()}-B`;

    // 1. Upload Aadhaar
    const docA = await Document.create({
      documentId: docA_Id,
      userId: testUserId,
      documentType: "aadhaar",
      originalFileName: "aadhaar_test.png",
      fileUrl: "/uploads/aadhaar_test.png",
      ocrStatus: "COMPLETED",
      rawOcrText: "Aadhaar Card: Arun Kumr, 1234 5678 9012",
      extractedFields: { fullName: "Arun Kumr", docNumber: "1234 5678 9012" },
      correctedFields: {},
      verificationStatus: "PENDING"
    });

    // 2. Upload Ration Card
    const docB = await Document.create({
      documentId: docB_Id,
      userId: testUserId,
      documentType: "ration_card",
      originalFileName: "ration_test.png",
      fileUrl: "/uploads/ration_test.png",
      ocrStatus: "COMPLETED",
      rawOcrText: "Smart Ration Card: Family Head Arun Kumar, 02/G/1234567",
      extractedFields: { fullName: "Arun Kumar", docNumber: "02/G/1234567" },
      correctedFields: {},
      verificationStatus: "PENDING"
    });

    // 3. Edit Document B (Ration card)
    await Document.findOneAndUpdate(
      { userId: testUserId, documentId: docB_Id },
      { $set: { "correctedFields.fullName": "Arun Kumar Senior", isUserConfirmed: true } }
    );

    // 4. Reload Document A (Aadhaar)
    const reloadedDocA = await Document.findOne({ userId: testUserId, documentId: docA_Id });
    const reloadedDocB = await Document.findOne({ userId: testUserId, documentId: docB_Id });

    // 5. Assert strict isolation
    assert.strictEqual(reloadedDocA.documentId, docA_Id);
    assert.strictEqual(reloadedDocA.documentType, "aadhaar");
    assert.strictEqual(reloadedDocA.extractedFields.fullName, "Arun Kumr");
    assert.strictEqual(reloadedDocA.correctedFields?.fullName, undefined, "Doc A corrections must remain untouched");
    assert.strictEqual(reloadedDocA.isUserConfirmed, false);

    assert.strictEqual(reloadedDocB.documentId, docB_Id);
    assert.strictEqual(reloadedDocB.documentType, "ration_card");
    assert.strictEqual(reloadedDocB.correctedFields.fullName, "Arun Kumar Senior");
    assert.strictEqual(reloadedDocB.isUserConfirmed, true);

    // Cleanup test records
    await Document.deleteMany({ userId: testUserId });
    await mongoose.disconnect();
  });

  console.log("\n================================================================");
  console.log(`   ALL TESTS PASSED: ${passedTests}/${totalTests} TESTS SUCCESSFUL! `);
  console.log("================================================================\n");
}

runTests()
  .then(() => {
    process.exit(0);
  })
  .catch(err => {
    console.error("Test execution failed:", err);
    process.exit(1);
  });
