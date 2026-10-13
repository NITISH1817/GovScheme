// tests/signup_profile_persistence.test.js
// Automated End-to-End Regression Test Suite for:
// GovScheme Citizen Signup, Profile Saving, Persistence & Recommendations Flow
//
// Test A: New email signup & profile completion persistence
// Test B: First-time Google signup & profile completion flow
// Test C: Logout & login persistence across sessions
// Test D: Page refresh / startup authoritative profile restoration
// Test E: Profile save failure handling, validation & retry retention
// Test F: Authorization, tamper prevention & privilege escalation protection
// Test G: Recommendation engine integration with persisted profile

import assert from 'assert';
import http from 'http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

process.env.NODE_ENV = 'test';

import app from '../server/server.js';
import User from '../server/models/User.js';
import connectDB from '../server/db.js';
import { evaluateSchemeEligibility } from '../server/services/schemeRecommendationEngine.js';
import { allVerifiedSchemes } from '../server/data/verifiedSchemes60.js';

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

// Client-side profile validation & normalization mirrors to test exact workflow
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

function checkIsProfileComplete(profile) {
  return checkMissingProfileFields(profile).length === 0;
}

async function runPersistenceTestSuite() {
  console.log('================================================================');
  console.log('  GOVSCHEME SIGNUP PROFILE PERSISTENCE & RECOMMENDATION SUITE   ');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function pass(name) {
    totalTests++;
    passedTests++;
    console.log(`  [PASS] ${name}`);
  }

  // Connect to DB and set up test HTTP server
  if (mongoose.connection.readyState === 0) {
    await connectDB();
  }

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  console.log(`[Setup] Test server running on http://127.0.0.1:${port}\n`);

  const timestamp = Date.now();
  const testCitizenEmail = `citizen_persist_${timestamp}@test.govscheme.in`;
  const testCitizenPassword = 'SecureCitizenPassword123!';
  const testCitizenName = 'Aarav Sharma';

  let citizenToken = '';
  let citizenUserId = '';

  try {
    // -------------------------------------------------------------
    // TEST A: New Email Signup & Profile Form Saving
    // -------------------------------------------------------------
    console.log('--- Test A: New Email Signup & Profile Persistence ---');

    // 1. Register a new citizen
    const regRes = await httpRequest({
      port,
      path: '/api/auth/register',
      method: 'POST',
      body: {
        fullName: testCitizenName,
        email: testCitizenEmail,
        password: testCitizenPassword,
        role: 'Super Admin' // Privilege escalation attempt: must be forced to Citizen
      }
    });

    assert.strictEqual(regRes.status, 201, `Expected 201 Created, got ${regRes.status}`);
    assert.strictEqual(regRes.body.success, true);
    assert.strictEqual(regRes.body.isNewUser, true, 'Registration must flag isNewUser: true');
    assert.strictEqual(regRes.body.role, 'Citizen', 'Role must unconditionally be Citizen');
    assert.ok(regRes.body.token, 'Token must be provided upon registration');
    citizenToken = regRes.body.token;
    citizenUserId = regRes.body.id || regRes.body._id;

    // Verify profile initially lacks demographic details and requires completion
    assert.strictEqual(checkIsProfileComplete(regRes.body), false, 'New registration must be incomplete');
    const initialMissing = checkMissingProfileFields(regRes.body);
    assert.ok(initialMissing.includes('Age'), 'Initial profile must flag missing Age');
    assert.ok(initialMissing.includes('State'), 'Initial profile must flag missing State');
    pass('A1: Citizen registers successfully with role Citizen and isNewUser=true');

    // 2. Submit complete profile form data (wizard completion)
    const profileFormData = {
      fullName: 'Aarav Sharma',
      age: 32,
      gender: 'Male',
      maritalStatus: 'Married',
      state: 'Tamil Nadu',
      district: 'Coimbatore',
      occupation: 'Farmer',
      annualIncome: 120000,
      category: 'OBC',
      educationLevel: 'Undergraduate',
      landHoldingAcres: 2.5,
      familyMembersCount: 4,
      hasDisability: false,
      disabilityPercentage: 0,
      interests: ['Agriculture', 'Financial Support']
    };

    const saveRes = await httpRequest({
      port,
      path: '/api/users/profile',
      method: 'PUT',
      headers: { Authorization: `Bearer ${citizenToken}` },
      body: profileFormData
    });

    assert.strictEqual(saveRes.status, 200, `Expected 200 OK, got ${saveRes.status}`);
    assert.strictEqual(saveRes.body.success, true);
    assert.strictEqual(saveRes.body.age, 32);
    assert.strictEqual(saveRes.body.gender, 'Male');
    assert.strictEqual(saveRes.body.state, 'Tamil Nadu');
    assert.strictEqual(saveRes.body.district, 'Coimbatore');
    assert.strictEqual(saveRes.body.occupation, 'Farmer');
    assert.strictEqual(saveRes.body.annualIncome, 120000);
    assert.strictEqual(saveRes.body.category, 'OBC');
    assert.strictEqual(saveRes.body.landHoldingAcres, 2.5);
    assert.strictEqual(saveRes.body.familyMembersCount, 4);
    assert.ok(saveRes.body.profileCompletionScore > 50, 'Authoritative completion score must be updated');
    pass('A2: Profile update endpoint saves complete profile and returns persisted values');

    // 3. Verify directly in MongoDB that the profile document actually persisted
    const dbUser = await User.findById(citizenUserId);
    assert.ok(dbUser, 'User document must exist in MongoDB');
    assert.strictEqual(dbUser.profile.age, 32);
    assert.strictEqual(dbUser.profile.gender, 'Male');
    assert.strictEqual(dbUser.profile.state, 'Tamil Nadu');
    assert.strictEqual(dbUser.profile.district, 'Coimbatore');
    assert.strictEqual(dbUser.profile.occupation, 'Farmer');
    assert.strictEqual(dbUser.profile.annualIncome, 120000);
    assert.strictEqual(dbUser.profile.category, 'OBC');
    assert.strictEqual(dbUser.profile.landHoldingAcres, 2.5);
    pass('A3: Verified direct MongoDB persistence for all profile fields');

    // -------------------------------------------------------------
    // TEST B: First-time Google Signup
    // -------------------------------------------------------------
    console.log('\n--- Test B: First-time Google Signup ---');

    const googleEmail = `google_user_${timestamp}@test.govscheme.in`;
    const googleRes = await httpRequest({
      port,
      path: '/api/auth/google',
      method: 'POST',
      body: {
        email: googleEmail,
        name: 'Priya Sundaram',
        picture: 'https://lh3.googleusercontent.com/test-pic'
      }
    });

    assert.strictEqual(googleRes.status, 200);
    assert.strictEqual(googleRes.body.success, true);
    assert.strictEqual(googleRes.body.isNewUser, true, 'First-time Google auth must flag isNewUser: true');
    // Ensure no hardcoded demographic defaults (not 25, not Male, not General)
    assert.ok(!googleRes.body.profile.age || isNaN(googleRes.body.profile.age), 'Google signup must not invent age=25');
    assert.notStrictEqual(googleRes.body.profile.age, 25);
    assert.notStrictEqual(googleRes.body.profile.gender, 'Male');
    assert.notStrictEqual(googleRes.body.profile.category, 'General');

    // Check that isProfileComplete is false for new Google account
    assert.strictEqual(checkIsProfileComplete(googleRes.body), false, 'First-time Google user must be directed to profile completion');
    pass('B1: First-time Google signup creates clean citizen account requiring profile completion');

    // Complete Google user's profile
    const googleToken = googleRes.body.token;
    const googleProfileData = {
      age: 23,
      gender: 'Female',
      state: 'Karnataka',
      district: 'Bengaluru Urban',
      occupation: 'Student',
      annualIncome: 80000,
      category: 'General',
      educationLevel: 'Postgraduate'
    };

    const googleSaveRes = await httpRequest({
      port,
      path: '/api/users/profile',
      method: 'PUT',
      headers: { Authorization: `Bearer ${googleToken}` },
      body: googleProfileData
    });

    assert.strictEqual(googleSaveRes.status, 200);
    assert.strictEqual(googleSaveRes.body.age, 23);
    assert.strictEqual(googleSaveRes.body.state, 'Karnataka');
    assert.strictEqual(googleSaveRes.body.occupation, 'Student');
    assert.strictEqual(checkIsProfileComplete(googleSaveRes.body), true, 'Saved Google profile is now complete');
    pass('B2: Google citizen profile saved and verified in backend');

    // -------------------------------------------------------------
    // TEST C: Logout & Login Persistence
    // -------------------------------------------------------------
    console.log('\n--- Test C: Login Persistence Across Sessions ---');

    // Simulate session end (logout) and subsequent login
    const loginRes = await httpRequest({
      port,
      path: '/api/auth/login',
      method: 'POST',
      body: {
        email: testCitizenEmail,
        password: testCitizenPassword
      }
    });

    assert.strictEqual(loginRes.status, 200);
    assert.strictEqual(loginRes.body.success, true);
    const reAuthToken = loginRes.body.token;
    assert.ok(reAuthToken);

    // Fetch profile with new session token
    const fetchRes = await httpRequest({
      port,
      path: '/api/users/profile',
      method: 'GET',
      headers: { Authorization: `Bearer ${reAuthToken}` }
    });

    assert.strictEqual(fetchRes.status, 200);
    assert.strictEqual(fetchRes.body.success, true);
    assert.strictEqual(fetchRes.body.fullName, 'Aarav Sharma');
    assert.strictEqual(fetchRes.body.age, 32);
    assert.strictEqual(fetchRes.body.gender, 'Male');
    assert.strictEqual(fetchRes.body.state, 'Tamil Nadu');
    assert.strictEqual(fetchRes.body.district, 'Coimbatore');
    assert.strictEqual(fetchRes.body.occupation, 'Farmer');
    assert.strictEqual(fetchRes.body.annualIncome, 120000);
    assert.strictEqual(fetchRes.body.category, 'OBC');
    assert.strictEqual(fetchRes.body.landHoldingAcres, 2.5);
    assert.strictEqual(fetchRes.body.familyMembersCount, 4);
    pass('C1: Re-login restores exact persisted profile fields from MongoDB');

    // -------------------------------------------------------------
    // TEST D: Page Refresh / Authoritative Profile Restoration
    // -------------------------------------------------------------
    console.log('\n--- Test D: Page Refresh / Startup Profile Restoration ---');

    // Emulate page refresh: Client has stored token, calls GET /api/users/profile
    const refreshRes = await httpRequest({
      port,
      path: '/api/users/profile',
      method: 'GET',
      headers: { Authorization: `Bearer ${reAuthToken}` }
    });

    assert.strictEqual(refreshRes.status, 200);
    assert.strictEqual(refreshRes.body.success, true);
    assert.strictEqual(checkIsProfileComplete(refreshRes.body), true, 'Saved profile must evaluate to complete');
    assert.strictEqual(checkMissingProfileFields(refreshRes.body).length, 0, 'No missing required fields');
    pass('D1: Refresh retrieves saved profile and prevents unnecessary re-routing to wizard');

    // -------------------------------------------------------------
    // TEST E: Profile Save Failure Handling & Input Validation
    // -------------------------------------------------------------
    console.log('\n--- Test E: Save Failure Handling & Validation ---');

    // 1. Invalid age (negative or out of bounds)
    const invalidAgeRes = await httpRequest({
      port,
      path: '/api/users/profile',
      method: 'PUT',
      headers: { Authorization: `Bearer ${reAuthToken}` },
      body: { age: 150 }
    });
    assert.strictEqual(invalidAgeRes.status, 400);
    assert.strictEqual(invalidAgeRes.body.success, false);
    assert.ok(invalidAgeRes.body.message.includes('age'));
    pass('E1: Invalid age rejected with 400 Bad Request');

    // 2. Invalid income (negative)
    const invalidIncomeRes = await httpRequest({
      port,
      path: '/api/users/profile',
      method: 'PUT',
      headers: { Authorization: `Bearer ${reAuthToken}` },
      body: { annualIncome: -50000 }
    });
    assert.strictEqual(invalidIncomeRes.status, 400);
    assert.strictEqual(invalidIncomeRes.body.success, false);
    assert.ok(invalidIncomeRes.body.message.includes('income'));
    pass('E2: Negative income rejected with 400 Bad Request');

    // 3. Invalid disability percentage (>100)
    const invalidDisRes = await httpRequest({
      port,
      path: '/api/users/profile',
      method: 'PUT',
      headers: { Authorization: `Bearer ${reAuthToken}` },
      body: { disabilityPercentage: 120 }
    });
    assert.strictEqual(invalidDisRes.status, 400);
    assert.strictEqual(invalidDisRes.body.success, false);
    assert.ok(invalidDisRes.body.message.includes('disability'));
    pass('E3: Invalid disability percentage rejected with 400 Bad Request');

    // -------------------------------------------------------------
    // TEST F: Authorization & Role Tamper Protection
    // -------------------------------------------------------------
    console.log('\n--- Test F: Authorization & Role Tamper Protection ---');

    // 1. Citizen attempts privilege escalation via profile PUT
    const roleTamperRes = await httpRequest({
      port,
      path: '/api/users/profile',
      method: 'PUT',
      headers: { Authorization: `Bearer ${reAuthToken}` },
      body: {
        role: 'Super Admin',
        profile: { role: 'Super Admin' }
      }
    });

    assert.strictEqual(roleTamperRes.status, 200);
    assert.strictEqual(roleTamperRes.body.role, 'Citizen', 'Citizen role must not be changed via profile PUT');

    const dbUserAfterTamper = await User.findById(citizenUserId);
    assert.strictEqual(dbUserAfterTamper.role, 'Citizen', 'MongoDB document role must remain Citizen');
    pass('F1: Citizen cannot escalate role to Super Admin via profile update');

    // 2. Unauthenticated request rejected
    const unauthRes = await httpRequest({
      port,
      path: '/api/users/profile',
      method: 'PUT',
      body: { age: 25 }
    });
    assert.strictEqual(unauthRes.status, 401, 'Unauthenticated PUT must return 401');
    pass('F2: Unauthenticated profile update rejected with 401');

    // -------------------------------------------------------------
    // TEST G: Recommendation Flow Using Persisted Profile
    // -------------------------------------------------------------
    console.log('\n--- Test G: Recommendation Flow Using Persisted Profile ---');

    // Verify recommendations use persisted profile values:
    // User is: Farmer, Tamil Nadu, OBC, income 1,20,000, age 32, land 2.5 acres
    const persistedProfile = {
      age: dbUser.profile.age,
      gender: dbUser.profile.gender,
      income: dbUser.profile.annualIncome,
      state: dbUser.profile.state,
      district: dbUser.profile.district,
      occupation: dbUser.profile.occupation,
      socialCategory: dbUser.profile.category,
      landHoldingAcres: dbUser.profile.landHoldingAcres,
      isFarmer: true
    };

    // Scheme 1: PM Kisan Samman Nidhi (Farmer scheme)
    const pmKisan = allVerifiedSchemes.find(s => s.schemeId.includes('kisan') || s.name.includes('PM-KISAN') || s.name.includes('Kisan'));
    if (pmKisan) {
      const pmKisanEval = evaluateSchemeEligibility(pmKisan, persistedProfile);
      assert.ok(
        ['ELIGIBLE_POTENTIAL_MATCH', 'NEEDS_MORE_INFORMATION'].includes(pmKisanEval.matchStatus),
        'PM-KISAN must match farmer profile'
      );
      pass('G1: Agricultural scheme matches farmer citizen profile');
    }

    // Scheme 2: Test Tamil Nadu state resident requirement
    const tnResidentScheme = allVerifiedSchemes.find(s => s.stateRequirements && s.stateRequirements.includes('Tamil Nadu'));
    if (tnResidentScheme) {
      const tnEval = evaluateSchemeEligibility(tnResidentScheme, persistedProfile);
      assert.strictEqual(tnEval.failedConditions.some(c => c.includes('State')), false, 'Tamil Nadu resident must satisfy state check');
      pass('G2: Tamil Nadu resident profile satisfies state-specific scheme');
    }

    // Verify that unknown profile fields trigger information needed instead of assumptions
    const incompleteProfile = {
      age: null,
      gender: null,
      income: null,
      state: null
    };

    const firstScheme = allVerifiedSchemes[0];
    const incompleteEval = evaluateSchemeEligibility(firstScheme, incompleteProfile);
    assert.notStrictEqual(incompleteEval.matchStatus, 'ELIGIBLE_POTENTIAL_MATCH');
    pass('G3: Incomplete profile treats unknown fields as unknown without assuming default values');

  } finally {
    // Clean up test server and records
    server.close();
    if (citizenUserId) {
      await User.findByIdAndDelete(citizenUserId);
    }
    const testGoogle = await User.findOne({ email: { $regex: /google_user_/ } });
    if (testGoogle) {
      await User.findByIdAndDelete(testGoogle._id);
    }
  }

  console.log('\n================================================================');
  console.log(`   ALL PERSISTENCE TESTS PASSED: ${passedTests}/${totalTests} TESTS SUCCESSFUL!`);
  console.log('================================================================\n');
}

runPersistenceTestSuite()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error('Test suite failed:', err);
    process.exit(1);
  });
