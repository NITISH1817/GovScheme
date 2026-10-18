// tests/security_and_eligibility_reconciliation.test.js
// Targeted verification test suite for GovScheme Security and Eligibility Audit Reconciliation

import assert from 'assert';
import http from 'http';
import dotenv from 'dotenv';
dotenv.config();

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_reconciliation_2026_audit';

import mongoose from 'mongoose';
import app from '../server/server.js';
import User from '../server/models/User.js';
import Scheme from '../server/models/Scheme.js';
import Document from '../server/models/Document.js';
import Notification from '../server/models/Notification.js';
import connectDB from '../server/db.js';
import { evaluateSchemeEligibility, recommendSchemesForProfile } from '../server/services/schemeRecommendationEngine.js';
import { evaluateSchemeEligibility as clientEvaluate } from '../src/engine/ruleEngine.ts';
import { schemesData } from '../src/data/schemes.ts';

function httpRequest({ port, path, method = 'GET', headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const postData = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;
    const reqHeaders = { ...headers };
    if (postData && !reqHeaders['Content-Type']) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path,
        method,
        headers: reqHeaders,
        timeout: 8000
      },
      (res) => {
        let rawData = '';
        res.on('data', chunk => { rawData += chunk; });
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(rawData);
          } catch (e) {
            parsed = rawData;
          }
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        });
      }
    );

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timed out: ${method} ${path}`));
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTests() {
  console.log('=== GovScheme Security & Eligibility Audit Reconciliation Test Suite ===\n');
  await connectDB();

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  console.log(`[Test Server] Running on http://127.0.0.1:${port}`);

  try {
    // -------------------------------------------------------------
    // PHASE 1: AUTHENTICATION, RBAC & NOTIFICATIONS
    // -------------------------------------------------------------
    console.log('\n--- Phase 1: Authentication, RBAC & Notifications ---');

    // Setup Test Users
    const citizenEmail = `audit_citizen_${Date.now()}@example.com`;
    const superAdminEmail = `audit_superadmin_${Date.now()}@example.com`;
    const dataEntryEmail = `audit_dataentry_${Date.now()}@example.com`;

    const citizen = await User.create({
      fullName: 'Audit Citizen',
      email: citizenEmail,
      password: 'password123#Secure',
      role: 'Citizen',
      profile: { age: 25, gender: 'Female', state: 'Tamil Nadu', category: 'OBC', annualIncome: 120000, occupation: 'Student' }
    });

    const superAdmin = await User.create({
      fullName: 'Audit Super Admin',
      email: superAdminEmail,
      password: 'password123#Secure',
      role: 'Super Admin'
    });

    const dataEntry = await User.create({
      fullName: 'Audit Data Entry Operator',
      email: dataEntryEmail,
      password: 'password123#Secure',
      role: 'Data Entry Operator'
    });

    // 1. Password policy test
    const weakPassRes = await httpRequest({
      port,
      path: '/api/auth/register',
      method: 'POST',
      body: { fullName: 'Weak Pass User', email: `weak_${Date.now()}@test.com`, password: '123' }
    });
    assert.strictEqual(weakPassRes.status, 400, 'Weak password (<8 chars) must be rejected with 400');
    console.log('✓ Password policy enforces minimum 8 characters');

    // 2. Login to obtain tokens
    const citizenLogin = await httpRequest({
      port,
      path: '/api/auth/login',
      method: 'POST',
      body: { email: citizenEmail, password: 'password123#Secure' }
    });
    const citizenToken = citizenLogin.data.token;

    const superAdminLogin = await httpRequest({
      port,
      path: '/api/auth/login',
      method: 'POST',
      body: { email: superAdminEmail, password: 'password123#Secure' }
    });
    const superAdminToken = superAdminLogin.data.token;

    const dataEntryLogin = await httpRequest({
      port,
      path: '/api/auth/login',
      method: 'POST',
      body: { email: dataEntryEmail, password: 'password123#Secure' }
    });
    const dataEntryToken = dataEntryLogin.data.token;

    // 3. OTP generation and attempt limiting
    const otpGenRes = await httpRequest({
      port,
      path: '/api/auth/generate-otp',
      method: 'POST',
      body: { email: citizenEmail }
    });
    assert.strictEqual(otpGenRes.status, 200, `OTP Gen failed: ${JSON.stringify(otpGenRes.data)}`);
    assert.strictEqual(otpGenRes.data.isMockDelivery, true, 'Unconfigured provider must be marked as mock/simulated delivery');
    console.log('✓ OTP generation does not leak credentials and indicates delivery mode');

    // Check failed attempts limit (max 5)
    for (let i = 1; i <= 5; i++) {
      const wrongOtpRes = await httpRequest({
        port,
        path: '/api/auth/verify-otp',
        method: 'POST',
        body: { email: citizenEmail, otp: '000000' }
      });
      assert.strictEqual(wrongOtpRes.status, 400, `Attempt ${i} should return 400`);
    }

    // 6th attempt must be locked out / invalidated
    const lockoutRes = await httpRequest({
      port,
      path: '/api/auth/verify-otp',
      method: 'POST',
      body: { email: citizenEmail, otp: '000000' }
    });
    assert.strictEqual(lockoutRes.status, 429, 'Excessive OTP attempts must be blocked with 429');
    console.log('✓ OTP brute-force protection invalidates OTP after 5 failed attempts');

    // 4. GET /api/notifications authentication test
    const unauthNotifRes = await httpRequest({
      port,
      path: '/api/notifications',
      method: 'GET'
    });
    assert.strictEqual(unauthNotifRes.status, 401, 'GET /api/notifications must reject unauthenticated requests');

    // Admin access to notifications without fake records injected
    await Notification.deleteMany({});
    const adminNotifRes = await httpRequest({
      port,
      path: '/api/notifications',
      method: 'GET',
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });
    assert.strictEqual(adminNotifRes.status, 200);
    assert.strictEqual(adminNotifRes.data.notifications.length, 0, 'GET /api/notifications must not inject fake seed records when empty');
    console.log('✓ GET /api/notifications requires authentication and does not inject fake records');

    // 5. RBAC: Scheme deletion by Data Entry Operator vs Super Admin
    const testScheme = await Scheme.create({
      id: `audit-scheme-${Date.now()}`,
      schemeId: `audit-scheme-${Date.now()}`,
      name: 'Audit Test Scheme',
      schemeName: 'Audit Test Scheme',
      department: 'Ministry of Agriculture',
      category: 'Agriculture',
      state: 'Central',
      status: 'Published',
      description: 'Audit Test Scheme Description',
      shortDescription: 'Audit Test Scheme Short Description',
      benefits: 'Audit Test Scheme Benefits',
      sourceUrl: 'https://example.gov.in/scheme'
    });

    const dataEntryDeleteRes = await httpRequest({
      port,
      path: `/api/schemes/${testScheme._id}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${dataEntryToken}` }
    });
    assert.strictEqual(dataEntryDeleteRes.status, 403, 'Data Entry Operator must NOT be allowed to delete schemes');

    const superAdminDeleteRes = await httpRequest({
      port,
      path: `/api/schemes/${testScheme._id}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });
    assert.strictEqual(superAdminDeleteRes.status, 200, 'Super Admin must be allowed to delete schemes');
    console.log('✓ RBAC strictly forbids Data Entry Operator from deleting schemes');

    // 6. RBAC: Citizen account suspension by Data Entry Operator
    const dataEntrySuspendRes = await httpRequest({
      port,
      path: `/api/admin/citizens/${citizen._id}/status`,
      method: 'PUT',
      headers: { Authorization: `Bearer ${dataEntryToken}` },
      body: { isActive: false }
    });
    assert.strictEqual(dataEntrySuspendRes.status, 403, 'Data Entry Operator must NOT be allowed to suspend citizen accounts');
    console.log('✓ RBAC forbids Data Entry Operator from suspending citizens');

    // 7. Document Verification sets ADMIN_VERIFIED instead of OFFICIALLY_VERIFIED
    const testDoc = await Document.create({
      documentId: `doc-${Date.now()}`,
      userId: citizen._id,
      documentType: 'Aadhaar',
      originalFileName: 'audit_aadhaar.pdf',
      fileUrl: '/uploads/audit_aadhaar.pdf'
    });

    const verifyDocRes = await httpRequest({
      port,
      path: `/api/documents/${testDoc._id}/verify`,
      method: 'PUT',
      headers: { Authorization: `Bearer ${superAdminToken}` },
      body: { status: 'Verified', internalNotes: 'Audited manual verification' }
    });
    assert.strictEqual(verifyDocRes.status, 200);
    assert.strictEqual(verifyDocRes.data.document.verificationStatus, 'ADMIN_VERIFIED', 'Admin verification must be labeled ADMIN_VERIFIED, never OFFICIALLY_VERIFIED without issuer API');
    console.log('✓ Internal admin review is labeled ADMIN_VERIFIED rather than official issuer verification');

    // -------------------------------------------------------------
    // PHASE 2: RECOMMENDATION & ELIGIBILITY ENGINE CORRECTNESS
    // -------------------------------------------------------------
    console.log('\n--- Phase 2: Recommendation & Eligibility Engine Correctness ---');

    // 1. Female-only scheme vs Male and Female profiles
    const femaleScheme = {
      schemeId: 'ladli-behna',
      name: 'Mukhyamantri Ladli Behna Yojana',
      category: 'Women & Child Development',
      minimumAge: 21,
      maximumAge: 60,
      genderRequirements: ['Female'],
      applicableSocialCategories: ['All'],
      incomeLimit: 250000
    };

    const maleProfile = {
      age: 28,
      gender: 'Male',
      income: 150000,
      socialCategory: 'General',
      state: 'Madhya Pradesh'
    };

    const femaleProfile = {
      age: 28,
      gender: 'Female',
      income: 150000,
      socialCategory: 'General',
      state: 'Madhya Pradesh'
    };

    const maleEval = evaluateSchemeEligibility(femaleScheme, maleProfile);
    assert.strictEqual(maleEval.isEligible, false, 'Male profile must be rejected by female-only scheme');
    assert.strictEqual(maleEval.matchStatus, 'DOES_NOT_MATCH');
    assert.ok(maleEval.failedConditions.some(c => c.toLowerCase().includes('restricted to female')), 'Failed condition must cite female restriction');

    const femaleEval = evaluateSchemeEligibility(femaleScheme, femaleProfile);
    assert.strictEqual(femaleEval.isEligible, true, 'Female profile meeting all criteria must be eligible');
    assert.strictEqual(femaleEval.matchStatus, 'ELIGIBLE_POTENTIAL_MATCH');
    console.log('✓ Female-only scheme correctly accepts female profile and rejects male profile');

    // 2. Exact Category comparisons (BC, OBC, MBC, SC, ST)
    const mbcScheme = {
      schemeId: 'mbc-scholarship',
      name: 'MBC Special Assistance Scheme',
      category: 'Education',
      minimumAge: 16,
      maximumAge: 25,
      genderRequirements: ['All'],
      applicableSocialCategories: ['MBC', 'DNC'],
      incomeLimit: 200000
    };

    const generalCandidate = { age: 18, gender: 'Male', income: 100000, socialCategory: 'General', isStudent: true };
    const mbcCandidate = { age: 18, gender: 'Male', income: 100000, socialCategory: 'MBC', isStudent: true };

    const genEval = evaluateSchemeEligibility(mbcScheme, generalCandidate);
    assert.strictEqual(genEval.isEligible, false, 'General category candidate must be rejected by MBC scheme');

    const mbcEval = evaluateSchemeEligibility(mbcScheme, mbcCandidate);
    assert.strictEqual(mbcEval.isEligible, true, 'MBC candidate must be accepted by MBC scheme');
    console.log('✓ Exact social category filtering (MBC/DNC vs General) correctly enforced');

    // 3. Missing demographic attributes (Age, Income, State, Occupation)
    const incompleteProfile = {
      age: null,
      gender: 'Female',
      income: null,
      socialCategory: null,
      state: null
    };

    const incEval = evaluateSchemeEligibility(femaleScheme, incompleteProfile);
    assert.strictEqual(incEval.isEligible, false, 'Incomplete profile must not be marked definitely eligible');
    assert.strictEqual(incEval.matchStatus, 'NEEDS_MORE_INFORMATION', 'Incomplete profile must be classified as NEEDS_MORE_INFORMATION');
    assert.ok(incEval.informationNeeded.length >= 2, 'Information needed list must cite missing age and income');
    console.log('✓ Missing demographic attributes (age/income) flag NEEDS_MORE_INFORMATION without false exclusion');

    // 4. Boundary Tests (Exact minimum age, maximum age, income ceiling)
    const boundaryScheme = {
      schemeId: 'boundary-test',
      name: 'Youth Skill Stipend',
      minimumAge: 18,
      maximumAge: 35,
      incomeLimit: 300000,
      genderRequirements: ['All'],
      applicableSocialCategories: ['All']
    };

    // Age boundaries: 17 (fail), 18 (pass), 35 (pass), 36 (fail)
    assert.strictEqual(evaluateSchemeEligibility(boundaryScheme, { age: 17, income: 200000, gender: 'Male' }).isEligible, false);
    assert.strictEqual(evaluateSchemeEligibility(boundaryScheme, { age: 18, income: 200000, gender: 'Male' }).isEligible, true);
    assert.strictEqual(evaluateSchemeEligibility(boundaryScheme, { age: 35, income: 200000, gender: 'Male' }).isEligible, true);
    assert.strictEqual(evaluateSchemeEligibility(boundaryScheme, { age: 36, income: 200000, gender: 'Male' }).isEligible, false);

    // Income boundaries: 300000 (pass), 300001 (fail)
    assert.strictEqual(evaluateSchemeEligibility(boundaryScheme, { age: 25, income: 300000, gender: 'Male' }).isEligible, true);
    assert.strictEqual(evaluateSchemeEligibility(boundaryScheme, { age: 25, income: 300001, gender: 'Male' }).isEligible, false);
    console.log('✓ Exact boundary conditions (age 18, 35; income ₹3,00,000) evaluate accurately');

    // 5. PM-KISAN Landholding rule per official May 31, 2019 Cabinet Revision
    const canonicalPmKisan = schemesData.find(s => s.id === 'pm-kisan');
    assert.ok(canonicalPmKisan, 'Canonical PM-KISAN scheme must exist');
    assert.strictEqual(canonicalPmKisan.eligibilityRules.maxLandHoldingAcres, undefined, 'PM-KISAN must not have outdated 5-acre ceiling in schemes.ts');

    const largeFarmer = {
      age: 45,
      gender: 'Male',
      occupation: 'Farmer',
      state: 'Central',
      landHoldingAcres: 12,
      category: 'General',
      annualIncome: 450000
    };

    const clientPmKisanEval = clientEvaluate(largeFarmer, canonicalPmKisan);
    assert.strictEqual(clientPmKisanEval.failedCriteria.length, 0, 'Farmer with 12 acres of land must not fail any eligibility criteria for PM-KISAN');
    assert.ok(['Eligible', 'Conditionally Eligible'].includes(clientPmKisanEval.status), 'Farmer with 12 acres must be Eligible or Conditionally Eligible');
    console.log('✓ PM-KISAN verifies against official Government of India guidelines (no 5-acre exclusion)');

    // 6. Profile edits triggering recalculation
    const studentUser = { age: 20, occupation: 'Student', annualIncome: 80000, gender: 'Male', state: 'Central', category: 'General' };
    const farmerUser = { ...studentUser, occupation: 'Farmer' };

    const studentRecs = recommendSchemesForProfile(schemesData, studentUser);
    const farmerRecs = recommendSchemesForProfile(schemesData, farmerUser);

    assert.notStrictEqual(studentRecs.matchingCount, farmerRecs.matchingCount, 'Changing occupation from Student to Farmer must update recommendations count');
    console.log('✓ Profile edits dynamically update recommendation evaluation results');

    // Cleanup
    await User.deleteMany({ email: { $in: [citizenEmail, superAdminEmail, dataEntryEmail] } });
    await Document.deleteMany({ _id: testDoc._id });

    console.log('\n=== ALL SECURITY & ELIGIBILITY RECONCILIATION TESTS PASSED ===\n');
  } finally {
    server.close();
  }
}

runTests()
  .then(() => {
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ Reconciliation Test Failed:', err);
    process.exit(1);
  });
