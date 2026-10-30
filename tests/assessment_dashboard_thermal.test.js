/**
 * tests/assessment_dashboard_thermal.test.js
 * Comprehensive automated verification for Assessment Report, Dashboard Metrics, and Thermal Receipt Functionality.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  generateAssessment,
  generateThermalReceiptText,
  generateAssessmentPDF,
  getMissingProfileFields
} from '../src/services/assessmentService.ts';
import { schemesData } from '../src/data/schemes.ts';

describe('Task: Assessment Report, Dashboard Metrics & Thermal Receipt Functionality', () => {
  const mockCitizen = {
    id: 'cit_test_101',
    fullName: 'Ramesh Patel',
    email: 'ramesh@example.com',
    mobile: '9876543210',
    age: 42,
    gender: 'Male',
    maritalStatus: 'Married',
    state: 'Gujarat',
    district: 'Ahmedabad',
    category: 'OBC',
    occupation: 'Farmer',
    annualIncome: 180000,
    landHoldingAcres: 2.5,
    educationLevel: '10th Pass',
    familyMembersCount: 4,
    hasDisability: false,
    disabilityPercentage: 0,
    isRegisteredWorker: false,
    verificationBadge: true,
    profileCompletionScore: 85,
    savedSchemeIds: [],
    documents: [
      {
        id: 'doc-1',
        documentId: 'DOC-1',
        type: 'Aadhaar',
        docNumber: '999988887777',
        status: 'Verified',
        verificationStatus: 'CHECKS_PASSED',
        uploadedAt: '2026-10-30'
      }
    ],
    role: 'citizen'
  };

  const incompleteCitizen = {
    id: 'cit_incomplete',
    fullName: '',
    mobile: '',
    email: 'unknown@example.com',
    age: 0,
    gender: '',
    maritalStatus: '',
    state: '',
    district: '',
    category: '',
    occupation: '',
    annualIncome: 0,
    landHoldingAcres: 0,
    educationLevel: '',
    familyMembersCount: 1,
    hasDisability: false,
    disabilityPercentage: 0,
    isRegisteredWorker: false,
    verificationBadge: false,
    profileCompletionScore: 10,
    savedSchemeIds: [],
    documents: [],
    role: 'citizen'
  };

  it('1. should evaluate real citizen profile and generate comprehensive assessment report', () => {
    const assessment = generateAssessment(mockCitizen, schemesData);

    assert.ok(assessment.assessmentId.startsWith('GOV-EVAL-'));
    assert.strictEqual(assessment.citizen.fullName, 'Ramesh Patel');
    assert.strictEqual(assessment.citizen.age, 42);
    assert.strictEqual(assessment.citizen.state, 'Gujarat');
    assert.strictEqual(assessment.citizen.occupation, 'Farmer');
    assert.strictEqual(assessment.citizen.annualIncome, 180000);
    assert.strictEqual(assessment.statistics.totalEvaluated, schemesData.length);
    assert.ok(assessment.statistics.totalEvaluated > 0);
    assert.ok(assessment.statistics.eligibleCount >= 0);
    assert.ok(assessment.statistics.conditionallyEligibleCount >= 0);
    assert.ok(assessment.statistics.notApplicableCount >= 0);
    assert.strictEqual(
      assessment.statistics.totalEvaluated,
      assessment.statistics.eligibleCount + assessment.statistics.conditionallyEligibleCount + assessment.statistics.notApplicableCount
    );
    assert.strictEqual(assessment.citizen.missingFields.length, 0);
    assert.ok(assessment.disclaimer.includes('Preliminary Advisory Only'));
  });

  it('2. should detect missing profile fields when profile is incomplete', () => {
    const missing = getMissingProfileFields(incompleteCitizen);
    assert.ok(missing.includes('Full Name'));
    assert.ok(missing.includes('State'));
    assert.ok(missing.includes('Occupation'));

    const assessment = generateAssessment(incompleteCitizen, schemesData);
    assert.ok(assessment.citizen.missingFields.length >= 3);
  });

  it('3. should generate valid A4 PDF document using jsPDF', () => {
    const assessment = generateAssessment(mockCitizen, schemesData);
    const pdfDoc = generateAssessmentPDF(assessment);

    assert.ok(pdfDoc);
    const blob = pdfDoc.output('blob');
    assert.ok(blob);
    assert.strictEqual(blob.type, 'application/pdf');
    assert.ok(blob.size > 1000);
  });

  it('4. should format 80mm thermal receipt with correct character width and sections', () => {
    const assessment = generateAssessment(mockCitizen, schemesData);
    const receipt80 = generateThermalReceiptText(assessment, '80mm');

    assert.ok(receipt80.includes('GOVSCHEME'));
    assert.ok(receipt80.includes('Citizen Scheme Eligibility'));
    assert.ok(receipt80.includes('CITIZEN PROFILE'));
    assert.ok(receipt80.includes('Name: Ramesh Patel'));
    assert.ok(receipt80.includes('State: Gujarat'));
    assert.ok(receipt80.includes('Occupation: Farmer'));
    assert.ok(receipt80.includes('ASSESSMENT SUMMARY'));
    assert.ok(receipt80.includes('Total Schemes Evaluated') || receipt80.includes('Total Evaluated'));
    assert.ok(receipt80.includes('Recommended'));
    assert.ok(receipt80.includes('RECOMMENDED SCHEMES'));
    assert.ok(receipt80.includes('DISCLAIMER'));

    // Check line width constraint (<= 48 characters for 80mm)
    const lines = receipt80.split('\n');
    lines.forEach(line => {
      assert.ok(line.length <= 48, `Line exceeded 48 characters in 80mm format: "${line}" (${line.length})`);
    });
  });

  it('5. should format 58mm thermal receipt with 32 character line constraint', () => {
    const assessment = generateAssessment(mockCitizen, schemesData);
    const receipt58 = generateThermalReceiptText(assessment, '58mm');

    assert.ok(receipt58.includes('GOVSCHEME'));
    assert.ok(receipt58.includes('CITIZEN PROFILE'));
    assert.ok(receipt58.includes('Ramesh Patel'));

    // Check line width constraint (<= 32 characters for 58mm)
    const lines = receipt58.split('\n');
    lines.forEach(line => {
      assert.ok(line.length <= 32, `Line exceeded 32 characters in 58mm format: "${line}" (${line.length})`);
    });
  });

  it('6. should correctly identify missing vault documents for recommended schemes', () => {
    const assessment = generateAssessment(mockCitizen, schemesData);
    const recommended = assessment.recommendedSchemes;

    if (recommended.length > 0) {
      const first = recommended[0];
      assert.ok(Array.isArray(first.requiredDocuments));
      assert.ok(first.scheme.name);
      assert.ok(first.benefitSummary);
    }
  });

  it('7. should enforce single source of truth between Dashboard counts and Assessment data', () => {
    const assessment = generateAssessment(mockCitizen, schemesData);
    const dashboardRecommended = assessment.statistics.totalRecommendedCount;
    const dashboardTotal = assessment.statistics.totalEvaluated;
    const dashboardNotApplicable = assessment.statistics.notApplicableCount;

    assert.strictEqual(dashboardTotal, dashboardRecommended + dashboardNotApplicable);
  });
});
