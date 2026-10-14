// tests/admin_citizen_lifecycle.test.js
// Automated End-to-End Regression Test Suite for:
// GovScheme Permanent Citizen Profiles + Admin Portal Integration
//
// Lifecycle:
// 1. Citizen Registration & Mandatory Profile Completion Flow
// 2. Profile MongoDB Persistence & Duplicate Account Prevention
// 3. Repeat Login & Page Refresh State Restoration
// 4. Admin Portal Real Data Integration (GET /api/admin/citizens)
// 5. Admin Citizen Details with Linked Applications & Documents (GET /api/admin/citizens/:id)
// 6. Server-Side Role Enforcement & 403 Forbidden for Ordinary Citizens
// 7. Sensitive Credential Exclusion (Passwords, Secrets, Tokens)
// 8. MongoDB ID Validation & Error Handling
// 9. Real Analytics Aggregation Without Fabricated Numbers

import assert from 'assert';
import http from 'http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();
process.env.NODE_ENV = 'test';

import app from '../server/server.js';
import User from '../server/models/User.js';
import Application from '../server/models/Application.js';
import Document from '../server/models/Document.js';
import Scheme from '../server/models/Scheme.js';
import connectDB from '../server/db.js';

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

function checkMissingProfileFields(profile) {
  if (!profile) return ['Full Name', 'Age', 'Gender', 'State', 'District', 'Occupation', 'Annual Income', 'Category'];
  const u = (profile.profile && typeof profile.profile === 'object') ? { ...profile, ...profile.profile } : profile;
  const missing = [];
  if (!u.fullName || !String(u.fullName).trim()) missing.push('Full Name');
  if (u.age === undefined || u.age === null || isNaN(Number(u.age)) || Number(u.age) <= 0) missing.push('Age');
  if (!u.gender || !String(u.gender).trim()) missing.push('Gender');
  if (!u.state || !String(u.state).trim()) missing.push('State');
  if (!u.district || !String(u.district).trim()) missing.push('District');
  if (u.annualIncome === undefined || u.annualIncome === null || String(u.annualIncome).trim() === '' || isNaN(Number(u.annualIncome))) missing.push('Annual Income');
  if (!u.category || !String(u.category).trim()) missing.push('Category');
  if (!u.occupation || !String(u.occupation).trim()) missing.push('Occupation');
  return missing;
}

async function runLifecycleTests() {
  console.log('================================================================');
  console.log(' GOVSCHEME CITIZEN LIFECYCLE & ADMIN PORTAL INTEGRATION SUITE   ');
  console.log('================================================================\n');

  await connectDB();

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  console.log(`[Test Server] Live on http://127.0.0.1:${port}\n`);

  const testStamp = Date.now();
  const citizenEmail = `citizen_lifecycle_${testStamp}@test.gov`;
  const citizenPassword = 'ValidPassword123!';
  const citizenName = `Priya Lifecycle ${testStamp}`;

  const adminEmail = `admin_lifecycle_${testStamp}@test.gov`;
  const adminPassword = 'AdminPassword123!';

  let citizenToken = '';
  let citizenId = '';
  let adminToken = '';
  let adminId = '';

  let createdAppId = '';
  let createdDocId = '';

  try {
    // -------------------------------------------------------------
    // SETUP: Provision an Admin account for testing
    // -------------------------------------------------------------
    const seededAdmin = await User.create({
      fullName: 'Lifecycle Super Admin',
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
    assert.strictEqual(adminLoginRes.status, 200, 'Admin login should succeed');
    adminToken = adminLoginRes.body.token;
    assert.ok(adminToken, 'Admin token must be returned');

    // -------------------------------------------------------------
    // PART A: Citizen Registration and Mandatory Profile Completion
    // -------------------------------------------------------------
    console.log('--- Part A: Citizen Registration & Profile Completion Flow ---');

    // 1. Register citizen
    const regRes = await httpRequest({
      port,
      path: '/api/auth/register',
      method: 'POST',
      body: {
        fullName: citizenName,
        email: citizenEmail,
        password: citizenPassword,
        role: 'Super Admin' // Attempt escalation - must be forced to Citizen
      }
    });

    assert.strictEqual(regRes.status, 201, 'Registration should return 201 Created');
    assert.strictEqual(regRes.body.success, true);
    assert.strictEqual(regRes.body.role, 'Citizen', 'Server must unconditionally assign Citizen role');
    assert.strictEqual(regRes.body.isNewUser, true, 'New user flag must be true');
    citizenToken = regRes.body.token;
    citizenId = regRes.body.id || regRes.body._id;
    assert.ok(citizenToken, 'Secure JWT token must be generated upon registration');

    // 2. Verify profile is incomplete using actual required fields
    const missingFields = checkMissingProfileFields(regRes.body);
    assert.ok(missingFields.includes('Age'), 'Age must be recognized as missing');
    assert.ok(missingFields.includes('State'), 'State must be recognized as missing');
    assert.ok(missingFields.includes('Occupation'), 'Occupation must be recognized as missing');
    assert.ok(missingFields.includes('Annual Income'), 'Annual income must be recognized as missing');
    assert.strictEqual(regRes.body.annualIncome, undefined, 'Unknown income must remain undefined, not defaulted to 0');
    console.log('  [PASS] A1: New registration assigns Citizen role and correctly flags incomplete profile');

    // 3. Validation errors on invalid profile save attempt
    const invalidSaveRes = await httpRequest({
      port,
      path: '/api/users/profile',
      method: 'PUT',
      headers: { Authorization: `Bearer ${citizenToken}` },
      body: { age: -5, annualIncome: -50000 }
    });
    assert.strictEqual(invalidSaveRes.status, 400, 'Negative values must be rejected with 400 Bad Request');
    console.log('  [PASS] A2: Server validates required ranges and rejects invalid profile inputs');

    // -------------------------------------------------------------
    // PART B: Persist Profiles in MongoDB Atlas
    // -------------------------------------------------------------
    console.log('\n--- Part B: MongoDB Profile Persistence & Account Integrity ---');

    // Save complete citizen profile
    const profilePayload = {
      fullName: citizenName,
      mobile: '9876543210',
      profile: {
        age: 28,
        gender: 'Female',
        maritalStatus: 'Unmarried',
        state: 'Tamil Nadu',
        district: 'Coimbatore',
        annualIncome: 180000,
        category: 'OBC',
        occupation: 'Farmer',
        educationLevel: 'Graduate',
        familyMembersCount: 4,
        landHoldingAcres: 2.5,
        hasDisability: false,
        interests: ['Agriculture', 'Financial']
      }
    };

    const saveRes = await httpRequest({
      port,
      path: '/api/users/profile',
      method: 'PUT',
      headers: { Authorization: `Bearer ${citizenToken}` },
      body: profilePayload
    });

    assert.strictEqual(saveRes.status, 200, 'Profile save must return 200 OK');
    assert.strictEqual(saveRes.body.success, true);
    assert.strictEqual(saveRes.body.age, 28);
    assert.strictEqual(saveRes.body.gender, 'Female');
    assert.strictEqual(saveRes.body.state, 'Tamil Nadu');
    assert.strictEqual(saveRes.body.district, 'Coimbatore');
    assert.strictEqual(saveRes.body.annualIncome, 180000);
    assert.strictEqual(saveRes.body.category, 'OBC');
    assert.strictEqual(saveRes.body.occupation, 'Farmer');
    assert.strictEqual(saveRes.body.landHoldingAcres, 2.5);

    // Verify direct MongoDB state
    const directUser = await User.findById(citizenId);
    assert.ok(directUser, 'User document must exist in MongoDB');
    assert.strictEqual(directUser.profile.age, 28);
    assert.strictEqual(directUser.profile.annualIncome, 180000);
    assert.strictEqual(directUser.profile.state, 'Tamil Nadu');
    console.log('  [PASS] B1: Profile saved permanently in MongoDB with all supported fields');

    // Verify editing profile does NOT duplicate account
    const initialUserCount = await User.countDocuments({ email: citizenEmail });
    assert.strictEqual(initialUserCount, 1, 'Should have exactly 1 account before edit');

    const updateRes = await httpRequest({
      port,
      path: '/api/users/profile',
      method: 'PUT',
      headers: { Authorization: `Bearer ${citizenToken}` },
      body: { occupation: 'Artisan', annualIncome: 210000 }
    });
    assert.strictEqual(updateRes.status, 200);

    const postEditCount = await User.countDocuments({ email: citizenEmail });
    assert.strictEqual(postEditCount, 1, 'Profile edit must NOT create duplicate account records');
    console.log('  [PASS] B2: Profile edit updates existing MongoDB document without duplicate accounts');

    // -------------------------------------------------------------
    // PART C & D: Admin Portal Real Data Integration & Data Linkage
    // -------------------------------------------------------------
    console.log('\n--- Part C & D: Admin Portal Endpoints & Real Data Linkage ---');

    // Seed an application and a document for this citizen
    const sampleScheme = await Scheme.findOne() || await Scheme.create({
      id: `TEST-SCHEME-${testStamp}`,
      name: 'National Agricultural Support Grant',
      department: 'Ministry of Agriculture',
      category: 'Agriculture',
      state: 'Central',
      status: 'Active'
    });

    const appRecord = await Application.create({
      userId: directUser._id,
      schemeId: sampleScheme._id,
      status: 'Submitted'
    });
    createdAppId = appRecord._id.toString();

    const docRecord = await Document.create({
      documentId: `DOC-${testStamp}`,
      userId: directUser._id,
      documentType: 'Aadhaar',
      fileUrl: '/uploads/sample_test.pdf',
      ocrStatus: 'COMPLETED',
      verificationStatus: 'CHECKS_PASSED',
      status: 'Verified',
      extractedFields: { aadhaarNumber: 'XXXX-XXXX-1234' }
    });
    createdDocId = docRecord._id.toString();

    // 1. GET /api/admin/citizens - Paginated real list
    const adminCitizensRes = await httpRequest({
      port,
      path: '/api/admin/citizens?page=1&limit=20',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    assert.strictEqual(adminCitizensRes.status, 200, 'Admin citizens endpoint must return 200 OK');
    assert.strictEqual(adminCitizensRes.body.success, true);
    assert.ok(Array.isArray(adminCitizensRes.body.citizens || adminCitizensRes.body.users), 'Must return citizens array');
    const citizenFound = (adminCitizensRes.body.citizens || adminCitizensRes.body.users).find(
      u => u.email === citizenEmail
    );
    assert.ok(citizenFound, 'Registered citizen must appear in real admin citizen listing');
    assert.strictEqual(citizenFound.password, undefined, 'Password must never be returned in admin listing');
    console.log('  [PASS] C1: GET /api/admin/citizens retrieves real database citizens without password hashes');

    // 2. Search citizens by query
    const searchRes = await httpRequest({
      port,
      path: `/api/admin/citizens?q=${encodeURIComponent(citizenEmail)}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(searchRes.status, 200);
    const searchMatches = searchRes.body.citizens || searchRes.body.users || [];
    assert.ok(searchMatches.some(u => u.email === citizenEmail), 'Search must return matching citizen');
    console.log('  [PASS] C2: Admin citizen listing supports searching by non-sensitive query');

    // 3. GET /api/admin/citizens/:id - Detailed profile with applications & documents
    const detailRes = await httpRequest({
      port,
      path: `/api/admin/citizens/${citizenId}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    assert.strictEqual(detailRes.status, 200, 'Admin citizen detail must return 200 OK');
    assert.strictEqual(detailRes.body.success, true);
    const citizenData = detailRes.body.citizen || detailRes.body.user;
    assert.strictEqual(citizenData.email, citizenEmail);
    assert.strictEqual(citizenData.password, undefined, 'Citizen password hash must not be exposed');
    assert.ok(Array.isArray(detailRes.body.applications), 'Applications must be returned');
    assert.ok(Array.isArray(detailRes.body.documents), 'Documents metadata must be returned');
    assert.ok(detailRes.body.applications.some(a => a._id === createdAppId), 'Linked application must be populated');
    assert.ok(detailRes.body.documents.some(d => d.documentId === `DOC-${testStamp}`), 'Linked document must be populated');
    console.log('  [PASS] C3: GET /api/admin/citizens/:id links citizen profile with real applications & documents');

    // 4. Invalid MongoDB ID validation
    const invalidIdRes = await httpRequest({
      port,
      path: '/api/admin/citizens/invalid-object-id-123',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.strictEqual(invalidIdRes.status, 400, 'Invalid MongoDB ID must return 400 Bad Request');
    console.log('  [PASS] C4: Invalid MongoDB ID returns 400 Bad Request on admin detail endpoint');

    // 5. GET /api/admin/analytics - Derived from real database records
    const analyticsRes = await httpRequest({
      port,
      path: '/api/admin/analytics',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    assert.strictEqual(analyticsRes.status, 200, 'Admin analytics must return 200 OK');
    assert.strictEqual(analyticsRes.body.success, true);
    const metrics = analyticsRes.body.metrics;
    assert.ok(typeof metrics.totalCitizens === 'number', 'totalCitizens must be a valid number');
    assert.ok(metrics.totalCitizens >= 1, 'totalCitizens must reflect real registered citizens');
    assert.ok(typeof metrics.totalApplications === 'number', 'totalApplications must be a valid number');
    assert.ok(Array.isArray(analyticsRes.body.charts.userGrowth), 'userGrowth chart data must be an array');
    console.log('  [PASS] C5: GET /api/admin/analytics returns live database counts derived from real queries');

    // -------------------------------------------------------------
    // PART E: Security, Role Enforcement & Access Isolation
    // -------------------------------------------------------------
    console.log('\n--- Part E: Security Hardening & Role Protection ---');

    // 1. Ordinary citizen receives 403 Forbidden on admin citizens list
    const citizenForbiddenList = await httpRequest({
      port,
      path: '/api/admin/citizens',
      method: 'GET',
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    assert.strictEqual(citizenForbiddenList.status, 403, 'Citizen token must receive 403 Forbidden on /api/admin/citizens');

    // 2. Ordinary citizen receives 403 Forbidden on admin citizen details
    const citizenForbiddenDetail = await httpRequest({
      port,
      path: `/api/admin/citizens/${citizenId}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    assert.strictEqual(citizenForbiddenDetail.status, 403, 'Citizen token must receive 403 Forbidden on /api/admin/citizens/:id');

    // 3. Ordinary citizen receives 403 Forbidden on admin analytics
    const citizenForbiddenAnalytics = await httpRequest({
      port,
      path: '/api/admin/analytics',
      method: 'GET',
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    assert.strictEqual(citizenForbiddenAnalytics.status, 403, 'Citizen token must receive 403 Forbidden on /api/admin/analytics');
    console.log('  [PASS] E1: Ordinary citizens strictly receive 403 Forbidden on all admin endpoints');

    // 4. Citizen cannot alter another citizen's profile or read direct private documents
    const otherCitizen = await User.create({
      fullName: 'Other Citizen',
      email: `other_${testStamp}@test.gov`,
      password: 'password123',
      role: 'Citizen'
    });

    // Try downloading other citizen's document using primary citizen's token
    const otherDoc = await Document.create({
      documentId: `DOC-OTHER-${testStamp}`,
      userId: otherCitizen._id,
      documentType: 'Income Certificate',
      fileUrl: '/uploads/other_doc.pdf'
    });

    const crossAccessRes = await httpRequest({
      port,
      path: `/api/documents/${otherDoc.documentId}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    assert.ok(
      crossAccessRes.status === 404 || crossAccessRes.status === 403,
      'Citizen cannot access another citizen private document'
    );
    console.log('  [PASS] E2: Citizen ownership isolation verified against cross-account access');

    // -------------------------------------------------------------
    // PART F: Repeat Login and Page Refresh Restoration
    // -------------------------------------------------------------
    console.log('\n--- Part F: Repeat Login & Page Refresh Profile Restoration ---');

    // 1. Repeat login restores identical profile details
    const reloginRes = await httpRequest({
      port,
      path: '/api/auth/login',
      method: 'POST',
      body: { email: citizenEmail, password: citizenPassword }
    });

    assert.strictEqual(reloginRes.status, 200, 'Repeat login must return 200 OK');
    assert.strictEqual(reloginRes.body.success, true);
    assert.strictEqual(reloginRes.body.email, citizenEmail);
    assert.strictEqual(reloginRes.body.state, 'Tamil Nadu', 'State must be restored on login');
    assert.strictEqual(reloginRes.body.district, 'Coimbatore', 'District must be restored on login');
    assert.strictEqual(reloginRes.body.annualIncome, 210000, 'Annual income must be restored on login');
    assert.strictEqual(reloginRes.body.occupation, 'Artisan', 'Occupation must be restored on login');
    console.log('  [PASS] F1: Repeat login automatically restores saved citizen profile from MongoDB');

    // 2. Page refresh simulation: GET /api/users/profile
    const refreshRes = await httpRequest({
      port,
      path: '/api/users/profile',
      method: 'GET',
      headers: { Authorization: `Bearer ${reloginRes.body.token}` }
    });

    assert.strictEqual(refreshRes.status, 200, 'Profile refresh endpoint must return 200 OK');
    assert.strictEqual(refreshRes.body.email, citizenEmail);
    assert.strictEqual(refreshRes.body.state, 'Tamil Nadu');
    assert.strictEqual(refreshRes.body.district, 'Coimbatore');
    assert.strictEqual(refreshRes.body.occupation, 'Artisan');
    assert.strictEqual(refreshRes.body.annualIncome, 210000);
    assert.strictEqual(checkMissingProfileFields(refreshRes.body).length, 0, 'Restored profile is fully complete');
    console.log('  [PASS] F2: Page refresh synchronization restores canonical profile from MongoDB without defaulting');

    console.log('\n================================================================');
    console.log(' ALL CITIZEN LIFECYCLE & ADMIN INTEGRATION TESTS PASSED: 12/12! ');
    console.log('================================================================\n');

  } finally {
    // Clean up test records
    await Promise.all([
      User.deleteMany({ email: { $in: [citizenEmail, adminEmail, `other_${testStamp}@test.gov`] } }),
      Application.deleteMany({ _id: createdAppId }),
      Document.deleteMany({ documentId: { $in: [`DOC-${testStamp}`, `DOC-OTHER-${testStamp}`] } })
    ]);
    server.close();
    try {
      await mongoose.connection.close();
    } catch {}
  }
}

runLifecycleTests()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n[LIFECYCLE TEST FAILURE]:', err);
    process.exit(1);
  });
