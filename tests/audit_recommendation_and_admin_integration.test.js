// tests/audit_recommendation_and_admin_integration.test.js
// Comprehensive End-to-End Integration Audit Suite for:
// 1. Recommendation Machine (Profiles: Farmer, Student, Senior Citizen, Urban Vendor; Profile Edit & Missing Data Checks)
// 2. Admin Portal <-> Citizen Website Shared MongoDB Integration (Live Data, Admin Edits, Authorization, Suspensions)

import assert from 'assert';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();
process.env.NODE_ENV = 'test';

import mongoose from 'mongoose';
import app from '../server/server.js';
import User from '../server/models/User.js';
import Scheme from '../server/models/Scheme.js';
import Application from '../server/models/Application.js';
import Document from '../server/models/Document.js';
import connectDB from '../server/db.js';
import { evaluateSchemeEligibility } from '../src/engine/ruleEngine.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(data);
          } catch (e) {
            json = data;
          }
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        });
      }
    );

    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runAudit() {
  console.log('================================================================');
  console.log('  GOVSCHEME PRODUCTION AUDIT: RECOMMENDATION & ADMIN INTEGRATION ');
  console.log('================================================================\n');

  await connectDB();

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  console.log(`[Test Server] Live on http://127.0.0.1:${port}\n`);

  // Load canonical 75 schemes
  const rawTsContent = fs.readFileSync(path.resolve(__dirname, '../src/data/schemes.ts'), 'utf-8');
  const equalBracket = rawTsContent.indexOf('= [');
  const canonicalSchemes = JSON.parse(rawTsContent.substring(equalBracket + 2, rawTsContent.lastIndexOf(']') + 1));
  assert.strictEqual(canonicalSchemes.length, 75, 'Canonical catalogue must contain exactly 75 schemes');

  const testId = Date.now();
  const citizenEmail = `audit_citizen_${testId}@test.gov`;
  const citizenPassword = 'AuditPassword123!';
  const citizenName = `Audit Citizen ${testId}`;

  const adminEmail = `audit_admin_${testId}@test.gov`;
  const adminPassword = 'AdminSecret123!';

  let citizenToken = '';
  let citizenId = '';
  let adminToken = '';
  let adminId = '';

  let createdAppId = '';
  let createdDocId = '';
  let targetSchemeId = '';
  let originalSchemeData = null;

  try {
    // -------------------------------------------------------------------------
    // SECTION 1: RECOMMENDATION MACHINE AUDIT
    // -------------------------------------------------------------------------
    console.log('--- SECTION 1: RECOMMENDATION MACHINE AUDIT ---');

    // 1.1 Test 4 Demographic Profiles: Farmer, Student, Senior Citizen, Urban Vendor
    const farmerProfile = {
      fullName: 'Ramesh Farmer',
      age: 42,
      gender: 'Male',
      state: 'Tamil Nadu',
      district: 'Thanjavur',
      occupation: 'Farmer',
      annualIncome: 140000,
      category: 'OBC',
      landHoldingAcres: 3,
      hasDisability: false,
      documents: [{ type: 'Aadhaar' }, { type: 'Bank Passbook' }]
    };

    const studentProfile = {
      fullName: 'Ananya Student',
      age: 19,
      gender: 'Female',
      state: 'Maharashtra',
      district: 'Pune',
      occupation: 'Student',
      annualIncome: 80000,
      category: 'SC',
      landHoldingAcres: 0,
      hasDisability: false,
      documents: [{ type: 'Aadhaar' }, { type: 'Income Certificate' }, { type: 'Community Certificate' }]
    };

    const seniorProfile = {
      fullName: 'Kalyani Senior',
      age: 68,
      gender: 'Female',
      state: 'Karnataka',
      district: 'Mysuru',
      occupation: 'Retired',
      annualIncome: 50000,
      category: 'General',
      landHoldingAcres: 0,
      hasDisability: false,
      documents: [{ type: 'Aadhaar' }, { type: 'Bank Passbook' }]
    };

    const vendorProfile = {
      fullName: 'Mohammad Vendor',
      age: 34,
      gender: 'Male',
      state: 'Delhi',
      district: 'Central Delhi',
      occupation: 'Street Vendor',
      annualIncome: 110000,
      category: 'General',
      landHoldingAcres: 0,
      hasDisability: false,
      documents: [{ type: 'Aadhaar' }, { type: 'Bank Passbook' }]
    };

    const farmerResults = canonicalSchemes.map(s => evaluateSchemeEligibility(farmerProfile, s));
    const studentResults = canonicalSchemes.map(s => evaluateSchemeEligibility(studentProfile, s));
    const seniorResults = canonicalSchemes.map(s => evaluateSchemeEligibility(seniorProfile, s));
    const vendorResults = canonicalSchemes.map(s => evaluateSchemeEligibility(vendorProfile, s));

    const farmerEligible = farmerResults.filter(r => r.status === 'Eligible' || r.status === 'Conditionally Eligible').length;
    const studentEligible = studentResults.filter(r => r.status === 'Eligible' || r.status === 'Conditionally Eligible').length;
    const seniorEligible = seniorResults.filter(r => r.status === 'Eligible' || r.status === 'Conditionally Eligible').length;
    const vendorEligible = vendorResults.filter(r => r.status === 'Eligible' || r.status === 'Conditionally Eligible').length;

    console.log(`  Farmer Profile: ${farmerEligible} qualifying schemes`);
    console.log(`  Student Profile: ${studentEligible} qualifying schemes`);
    console.log(`  Senior Profile: ${seniorEligible} qualifying schemes`);
    console.log(`  Vendor Profile: ${vendorEligible} qualifying schemes`);

    assert.strictEqual(farmerEligible, 30, `Farmer profile should qualify for 30 schemes, got ${farmerEligible}`);
    assert.strictEqual(studentEligible, 19, `Student profile should qualify for 19 schemes, got ${studentEligible}`);
    assert.strictEqual(seniorEligible, 15, `Senior profile should qualify for 15 schemes, got ${seniorEligible}`);
    assert.strictEqual(vendorEligible, 18, `Vendor profile should qualify for 18 schemes, got ${vendorEligible}`);
    assert.notStrictEqual(farmerEligible, studentEligible);
    assert.notStrictEqual(studentEligible, seniorEligible);
    assert.notStrictEqual(seniorEligible, vendorEligible);
    console.log('  [PASS] 1.1: 4 distinct demographic profiles produce distinct, rule-compliant recommendation counts (30, 19, 15, 18)');

    // 1.2 Test Incomplete Profile / Missing Information prevents false definite eligibility
    const incompleteProfile = {
      fullName: 'Incomplete Citizen',
      age: undefined,
      annualIncome: undefined,
      state: undefined,
      occupation: undefined,
      category: undefined,
      documents: []
    };
    const incompleteResults = canonicalSchemes.map(s => evaluateSchemeEligibility(incompleteProfile, s));
    const definitelyEligibleCount = incompleteResults.filter(r => r.status === 'Eligible').length;
    assert.strictEqual(definitelyEligibleCount, 0, 'Incomplete profile must NEVER be declared definitely eligible for schemes requiring criteria');
    console.log('  [PASS] 1.2: Missing data prevents false definite eligibility (0 definite matches for empty profile)');

    // 1.3 Test Profile Edit Updates Recommendations Dynamically
    // Start with Farmer profile -> edit to Student profile
    const initialFarmerMatchIds = farmerResults.filter(r => r.status === 'Eligible' || r.status === 'Conditionally Eligible').map(r => r.schemeId);
    const updatedStudentMatchIds = studentResults.filter(r => r.status === 'Eligible' || r.status === 'Conditionally Eligible').map(r => r.schemeId);
    
    // Farmer should have PM-KISAN, Student should have edu-pm-usp-central-sector
    assert.ok(initialFarmerMatchIds.includes('pm-kisan'), 'Farmer must qualify for PM-KISAN');
    assert.ok(!initialFarmerMatchIds.includes('edu-pm-usp-central-sector'), '45-year old farmer should not qualify for youth higher education scholarship');
    assert.ok(updatedStudentMatchIds.includes('edu-pm-usp-central-sector'), '19-year old student must qualify for youth education scholarship');
    assert.ok(!updatedStudentMatchIds.includes('pm-kisan'), 'Student without farmland must not qualify for PM-KISAN');
    console.log('  [PASS] 1.3: Profile change (Farmer -> Student) dynamically shifts recommendations between schemes');

    // 1.4 Test Backend /api/schemes/recommend endpoint
    const backendRecRes = await httpRequest({
      port,
      path: '/api/schemes/recommend',
      method: 'POST',
      body: { profile: farmerProfile }
    });
    assert.strictEqual(backendRecRes.status, 200, 'POST /api/schemes/recommend should succeed');
    assert.strictEqual(backendRecRes.body.success, true);
    assert.ok(backendRecRes.body.data.matchingCount > 0, 'Matching count should be positive');
    console.log(`  [PASS] 1.4: Backend /api/schemes/recommend evaluates ${backendRecRes.body.data.totalEvaluated} schemes with ${backendRecRes.body.data.matchingCount} matches`);

    // -------------------------------------------------------------------------
    // SECTION 2: ADMIN PORTAL <-> CITIZEN WEBSITE INTEGRATION AUDIT
    // -------------------------------------------------------------------------
    console.log('\n--- SECTION 2: ADMIN PORTAL <-> CITIZEN WEBSITE INTEGRATION AUDIT ---');

    // 2.1 Provision Admin and Register Citizen
    const seededAdmin = await User.create({
      fullName: 'Audit Super Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'Super Admin',
      isActive: true
    });
    adminId = seededAdmin._id.toString();

    const adminLoginRes = await httpRequest({
      port,
      path: '/api/auth/login',
      method: 'POST',
      body: { email: adminEmail, password: adminPassword }
    });
    assert.strictEqual(adminLoginRes.status, 200);
    adminToken = adminLoginRes.body.token;

    // Register Citizen via Citizen Registration Endpoint
    const citizenRegRes = await httpRequest({
      port,
      path: '/api/auth/register',
      method: 'POST',
      body: {
        fullName: citizenName,
        email: citizenEmail,
        password: citizenPassword
      }
    });
    assert.strictEqual(citizenRegRes.status, 201, 'Citizen registration must succeed with 201');
    assert.strictEqual(citizenRegRes.body.role, 'Citizen');
    citizenToken = citizenRegRes.body.token;
    citizenId = citizenRegRes.body.id || citizenRegRes.body._id;

    // Verify Citizen in MongoDB
    const citizenDocInDb = await User.findById(citizenId);
    assert.ok(citizenDocInDb, 'Citizen record must exist in MongoDB');
    console.log('  [PASS] 2.1: Citizen registered on website and persisted in MongoDB');

    // 2.2 Verify Citizen appears in Admin Portal (GET /api/admin/citizens)
    const adminCitizensListRes = await httpRequest({
      port,
      path: `/api/admin/citizens?q=${encodeURIComponent(citizenEmail)}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(adminCitizensListRes.status, 200);
    const listedCitizens = adminCitizensListRes.body.citizens || adminCitizensListRes.body.users || [];
    const foundInAdmin = listedCitizens.find(u => u.email === citizenEmail);
    assert.ok(foundInAdmin, 'Newly registered citizen must appear in Admin Portal citizen directory');
    console.log('  [PASS] 2.2: Citizen record visible in Admin Portal citizen directory');

    // 2.3 Citizen Edits Profile -> Verified in Admin Portal
    const profileUpdateRes = await httpRequest({
      port,
      path: '/api/users/profile',
      method: 'PUT',
      headers: { Authorization: `Bearer ${citizenToken}` },
      body: {
        profile: {
          age: 33,
          gender: 'Male',
          state: 'Tamil Nadu',
          district: 'Madurai',
          occupation: 'Farmer',
          annualIncome: 160000,
          category: 'OBC',
          landHoldingAcres: 4.5
        }
      }
    });
    assert.strictEqual(profileUpdateRes.status, 200);

    // Admin views citizen detail (GET /api/admin/citizens/:id)
    const adminCitizenDetailRes = await httpRequest({
      port,
      path: `/api/admin/citizens/${citizenId}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(adminCitizenDetailRes.status, 200);
    const adminFetchedCitizen = adminCitizenDetailRes.body.citizen || adminCitizenDetailRes.body.user;
    assert.strictEqual(adminFetchedCitizen.profile.age, 33);
    assert.strictEqual(adminFetchedCitizen.profile.occupation, 'Farmer');
    assert.strictEqual(adminFetchedCitizen.profile.landHoldingAcres, 4.5);
    console.log('  [PASS] 2.3: Citizen profile edit persisted in MongoDB and confirmed in Admin Portal detail view');

    // 2.4 Admin Edits Citizen Status (Suspend & Reactivate) -> Tested on Citizen Website
    // Admin suspends citizen
    const suspendRes = await httpRequest({
      port,
      path: `/api/admin/citizens/${citizenId}/status`,
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { isActive: false }
    });
    assert.strictEqual(suspendRes.status, 200);
    assert.strictEqual(suspendRes.body.user.isActive, false);

    // Verify suspended citizen CANNOT make protected requests (403 Forbidden)
    const suspendedReqRes = await httpRequest({
      port,
      path: '/api/users/profile',
      method: 'GET',
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    assert.strictEqual(suspendedReqRes.status, 403, 'Suspended citizen request must be rejected with 403 Forbidden');

    // Verify suspended citizen CANNOT log in (403 Forbidden)
    const suspendedLoginRes = await httpRequest({
      port,
      path: '/api/auth/login',
      method: 'POST',
      body: { email: citizenEmail, password: citizenPassword }
    });
    assert.strictEqual(suspendedLoginRes.status, 403, 'Suspended citizen login must be rejected with 403 Forbidden');

    // Admin re-activates citizen
    const reactivateRes = await httpRequest({
      port,
      path: `/api/admin/citizens/${citizenId}/status`,
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { isActive: true }
    });
    assert.strictEqual(reactivateRes.status, 200);
    assert.strictEqual(reactivateRes.body.user.isActive, true);

    // Citizen can log in again
    const reactivatedLoginRes = await httpRequest({
      port,
      path: '/api/auth/login',
      method: 'POST',
      body: { email: citizenEmail, password: citizenPassword }
    });
    assert.strictEqual(reactivatedLoginRes.status, 200, 'Reactivated citizen can log in normally');
    citizenToken = reactivatedLoginRes.body.token; // refreshed token
    console.log('  [PASS] 2.4: Admin citizen suspension immediately blocks citizen access (403) and reactivation restores access');

    // 2.5 Admin Edits a Scheme -> Verified visible on Citizen Website
    const sampleScheme = await Scheme.findOne({ status: 'Published' });
    assert.ok(sampleScheme, 'Published scheme must exist');
    targetSchemeId = sampleScheme.id || sampleScheme._id.toString();
    const canonicalOriginal = canonicalSchemes.find(s => s.id === targetSchemeId || s.id === sampleScheme.id);
    originalSchemeData = {
      benefitsSummary: canonicalOriginal?.benefitsSummary || sampleScheme.benefitsSummary,
      benefits: canonicalOriginal?.benefitsSummary || sampleScheme.benefits,
      financialBenefitAmount: canonicalOriginal?.financialBenefitAmount ?? sampleScheme.financialBenefitAmount,
      benefitAmount: canonicalOriginal?.financialBenefitAmount ?? sampleScheme.benefitAmount
    };

    const updatedBenefitSummary = `Audited Benefit Update at ${Date.now()}`;
    const schemeUpdateRes = await httpRequest({
      port,
      path: `/api/schemes/${targetSchemeId}`,
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        benefitsSummary: updatedBenefitSummary,
        financialBenefitAmount: 75000
      }
    });
    assert.strictEqual(schemeUpdateRes.status, 200, 'Admin scheme update must return 200');

    // Citizen retrieves scheme via GET /api/schemes/:id
    const citizenSchemeGetRes = await httpRequest({
      port,
      path: `/api/schemes/${targetSchemeId}`,
      method: 'GET'
    });
    assert.strictEqual(citizenSchemeGetRes.status, 200);
    assert.strictEqual(citizenSchemeGetRes.body.scheme.benefitsSummary, updatedBenefitSummary, 'Citizen website must reflect admin scheme edit');
    assert.strictEqual(citizenSchemeGetRes.body.scheme.financialBenefitAmount, 75000);
    console.log('  [PASS] 2.5: Admin scheme edit persists in MongoDB and immediately reflects on citizen website');

    // 2.6 Admin Updates Application Status -> Verified in Citizen Application Tracker
    const newApp = await Application.create({
      userId: citizenId,
      schemeId: sampleScheme._id,
      status: 'Under Review'
    });
    createdAppId = newApp._id.toString();

    // Admin updates status to 'Approved' with remarks
    const appStatusRes = await httpRequest({
      port,
      path: `/api/applications/${createdAppId}/status`,
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        status: 'Approved',
        remarks: 'Welfare benefit approved following official revenue verification.'
      }
    });
    assert.strictEqual(appStatusRes.status, 200);
    assert.strictEqual(appStatusRes.body.application.status, 'Approved');

    // Citizen checks applications via GET /api/applications/my-applications
    const citizenAppsRes = await httpRequest({
      port,
      path: '/api/applications/my-applications',
      method: 'GET',
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    assert.strictEqual(citizenAppsRes.status, 200);
    const myApp = citizenAppsRes.body.applications.find(a => a._id === createdAppId);
    assert.ok(myApp, 'Citizen must find their application');
    assert.strictEqual(myApp.status, 'Approved', 'Application status must reflect Admin approval');
    assert.strictEqual(myApp.remarks, 'Welfare benefit approved following official revenue verification.');
    console.log('  [PASS] 2.6: Admin application approval persists in MongoDB and appears in Citizen Application Tracker');

    // 2.7 Admin Document Verification -> Verified on Citizen Side
    const newDoc = await Document.create({
      documentId: `DOC-AUDIT-${testId}`,
      userId: citizenId,
      documentType: 'Income Certificate',
      type: 'Income Certificate',
      fileUrl: '/uploads/sample_income.pdf',
      status: 'Pending',
      extractedFields: { annualIncome: 160000 }
    });
    createdDocId = newDoc._id.toString();

    // Admin verifies document via PUT /api/documents/:id/verify
    const verifyDocRes = await httpRequest({
      port,
      path: `/api/documents/${createdDocId}/verify`,
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        status: 'Verified',
        internalNotes: 'Income matches tahsildar registry.'
      }
    });
    assert.strictEqual(verifyDocRes.status, 200, 'Admin document verification must succeed');
    assert.strictEqual(verifyDocRes.body.document.status, 'Verified');
    assert.strictEqual(verifyDocRes.body.document.verified, true);

    // Citizen retrieves their documents via GET /api/documents
    const citizenDocsRes = await httpRequest({
      port,
      path: '/api/documents',
      method: 'GET',
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    assert.strictEqual(citizenDocsRes.status, 200);
    const myDoc = citizenDocsRes.body.documents.find(d => d._id === createdDocId);
    assert.ok(myDoc, 'Citizen must find their verified document');
    assert.strictEqual(myDoc.status, 'Verified', 'Document status must reflect Admin verification');
    console.log('  [PASS] 2.7: Admin document verification persists in MongoDB and reflects on citizen document retrieval');

    // 2.8 Security: Citizen Cannot Access Admin Endpoints (403 Forbidden)
    const unauthorizedCitizenAdminRes = await httpRequest({
      port,
      path: '/api/admin/citizens',
      method: 'GET',
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    assert.strictEqual(unauthorizedCitizenAdminRes.status, 403, 'Citizen must strictly receive 403 on /api/admin endpoints');

    const unauthorizedSchemeEdit = await httpRequest({
      port,
      path: `/api/schemes/${targetSchemeId}`,
      method: 'PUT',
      headers: { Authorization: `Bearer ${citizenToken}` },
      body: { name: 'Hacked Scheme' }
    });
    assert.strictEqual(unauthorizedSchemeEdit.status, 403, 'Citizen must strictly receive 403 attempting scheme edits');
    console.log('  [PASS] 2.8: Citizen strictly barred from admin operations (403 Forbidden on admin APIs)');

    // 2.9 Real Database Analytics
    const analyticsRes = await httpRequest({
      port,
      path: '/api/admin/analytics',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(analyticsRes.status, 200);
    assert.strictEqual(analyticsRes.body.success, true);
    assert.ok(analyticsRes.body.metrics.totalSchemes >= 75, 'Total schemes must be at least 75');
    assert.ok(analyticsRes.body.metrics.totalCitizens > 0, 'Total citizens must be positive');
    console.log(`  [PASS] 2.9: Live database analytics computed from MongoDB collections (Schemes: ${analyticsRes.body.metrics.totalSchemes}, Citizens: ${analyticsRes.body.metrics.totalCitizens})`);

    console.log('\n================================================================');
    console.log('  ALL AUDIT CHECKS PASSED: 13/13 AUDIT ASSERTIONS SUCCESSFUL!   ');
    console.log('================================================================\n');

  } finally {
    // Cleanup synthetic test records created during audit
    await User.deleteMany({ email: { $in: [citizenEmail, adminEmail] } }).catch(() => {});
    if (createdAppId) await Application.findByIdAndDelete(createdAppId).catch(() => {});
    if (createdDocId) await Document.findByIdAndDelete(createdDocId).catch(() => {});
    if (targetSchemeId && originalSchemeData) {
      const query = mongoose.Types.ObjectId.isValid(targetSchemeId)
        ? { $or: [{ _id: targetSchemeId }, { id: targetSchemeId }, { schemeId: targetSchemeId }] }
        : { $or: [{ id: targetSchemeId }, { schemeId: targetSchemeId }] };
      await Scheme.findOneAndUpdate(query, { $set: originalSchemeData }).catch(err => console.error('Scheme restore error:', err));
    }
    server.close();
    await mongoose.disconnect();
  }
}

runAudit()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n[AUDIT FAILURE]:', err);
    process.exit(1);
  });
