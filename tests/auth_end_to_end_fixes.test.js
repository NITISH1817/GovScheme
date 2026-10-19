// tests/auth_end_to_end_fixes.test.js
// Automated End-to-End Test Suite for Registration, Login, and Session Persistence

import assert from 'assert';
import http from 'http';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

process.env.NODE_ENV = 'test';

import app from '../server/server.js';
import User from '../server/models/User.js';
import connectDB from '../server/db.js';
import { getJwtSecret } from '../server/config/jwtConfig.js';
import { isOriginAllowed } from '../server/config/corsConfig.js';

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

async function runAuthEndToEndTests() {
  console.log('================================================================');
  console.log('  GOVSCHEME AUTHENTICATION & REGISTRATION END-TO-END TEST SUITE ');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function pass(name) {
    totalTests++;
    passedTests++;
    console.log(`  [PASS] ${name}`);
  }

  function fail(name, err) {
    totalTests++;
    console.error(`  [FAIL] ${name}:`, err.message || err);
    throw err;
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
  const validEmail = `citizen_auth_${timestamp}@example.com`;
  const validPassword = 'SecurePassword2026!';
  const validName = 'Priya Raman';

  let registeredToken = '';
  let registeredUserId = '';

  try {
    // -------------------------------------------------------------------------
    // 1. SIGN-UP / REGISTRATION TESTS
    // -------------------------------------------------------------------------
    console.log('--- 1. Registration / Sign-Up Validation & Security ---');

    // 1.1 Rejection of missing required fields
    {
      const res = await httpRequest({
        port,
        path: '/api/auth/register',
        method: 'POST',
        body: { fullName: '', email: validEmail, password: validPassword }
      });
      assert.strictEqual(res.status, 400, 'Expected 400 for empty fullName');
      assert.strictEqual(res.body.success, false);
      pass('1.1: Missing fullName is rejected with 400 Bad Request');
    }

    // 1.2 Rejection of invalid email format
    {
      const res = await httpRequest({
        port,
        path: '/api/auth/register',
        method: 'POST',
        body: { fullName: validName, email: 'invalid-email-format', password: validPassword }
      });
      assert.strictEqual(res.status, 400, 'Expected 400 for invalid email format');
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes('valid email'), 'Expected valid email error message');
      pass('1.2: Invalid email address format is rejected with 400 Bad Request');
    }

    // 1.3 Rejection of weak password (< 8 chars)
    {
      const res = await httpRequest({
        port,
        path: '/api/auth/register',
        method: 'POST',
        body: { fullName: validName, email: validEmail, password: 'short' }
      });
      assert.strictEqual(res.status, 400, 'Expected 400 for password < 8 chars');
      assert.strictEqual(res.body.success, false);
      assert.ok(res.body.message.includes('8 characters'), 'Expected 8 character length error message');
      pass('1.3: Password under 8 characters is rejected with 400 Bad Request');
    }

    // 1.4 Role Escalation Protection: Public registration must unconditionally assign Citizen role
    {
      const res = await httpRequest({
        port,
        path: '/api/auth/register',
        method: 'POST',
        body: {
          fullName: validName,
          email: validEmail,
          password: validPassword,
          role: 'Super Admin' // Attempt to elevate role
        }
      });
      assert.strictEqual(res.status, 201, 'Expected 201 Created');
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.role, 'Citizen', 'Role must unconditionally be Citizen');
      assert.strictEqual(res.body.user.role, 'Citizen', 'User payload role must be Citizen');
      assert.ok(res.body.token, 'Expected JWT token in registration response');
      assert.strictEqual(res.body.isNewUser, true);

      registeredToken = res.body.token;
      registeredUserId = res.body._id || res.body.id;

      // Verify in MongoDB directly
      const dbUser = await User.findById(registeredUserId);
      assert.ok(dbUser, 'User must exist in MongoDB');
      assert.strictEqual(dbUser.role, 'Citizen', 'Database document role must be Citizen');
      // Verify password is never plaintext in MongoDB
      assert.notStrictEqual(dbUser.password, validPassword, 'Password must be hashed in MongoDB');
      assert.ok(dbUser.password.startsWith('$2'), 'Password hash must be valid bcrypt hash');
      pass('1.4: Public registration forces Citizen role, hashes password securely, and issues JWT');
    }

    // 1.5 Duplicate email registration handling (409 Conflict)
    {
      const res = await httpRequest({
        port,
        path: '/api/auth/register',
        method: 'POST',
        body: {
          fullName: 'Duplicate User',
          email: validEmail.toUpperCase(), // Test case-insensitive duplicate check
          password: 'AnotherPassword123!'
        }
      });
      assert.strictEqual(res.status, 409, 'Expected 409 Conflict for duplicate email');
      assert.strictEqual(res.body.success, false);
      assert.ok(
        res.body.message.toLowerCase().includes('already exists'),
        'Expected duplicate account message'
      );
      pass('1.5: Duplicate email returns 409 Conflict with friendly message without crashing API');
    }

    // -------------------------------------------------------------------------
    // 2. LOGIN TESTS
    // -------------------------------------------------------------------------
    console.log('\n--- 2. Login Validation & Authentication ---');

    // 2.1 Rejection of missing fields / malformed body
    {
      const res = await httpRequest({
        port,
        path: '/api/auth/login',
        method: 'POST',
        body: { email: validEmail } // missing password
      });
      assert.strictEqual(res.status, 400, 'Expected 400 Bad Request for missing password');
      assert.strictEqual(res.body.success, false);
      pass('2.1: Missing password in login returns 400 Bad Request safely');
    }

    // 2.2 Rejection of invalid email format in login
    {
      const res = await httpRequest({
        port,
        path: '/api/auth/login',
        method: 'POST',
        body: { email: 'notanemail', password: validPassword }
      });
      assert.strictEqual(res.status, 400, 'Expected 400 Bad Request for invalid email in login');
      assert.strictEqual(res.body.success, false);
      pass('2.2: Invalid email syntax in login returns 400 Bad Request');
    }

    // 2.3 Unknown email returns generic 401
    {
      const res = await httpRequest({
        port,
        path: '/api/auth/login',
        method: 'POST',
        body: { email: 'nonexistent_citizen@example.com', password: 'SomePassword123!' }
      });
      assert.strictEqual(res.status, 401, 'Expected 401 Unauthorized for unknown email');
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, 'Invalid email or password');
      pass('2.3: Non-existent account returns generic 401 "Invalid email or password"');
    }

    // 2.4 Incorrect password returns generic 401
    {
      const res = await httpRequest({
        port,
        path: '/api/auth/login',
        method: 'POST',
        body: { email: validEmail, password: 'WrongPassword999!' }
      });
      assert.strictEqual(res.status, 401, 'Expected 401 Unauthorized for incorrect password');
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, 'Invalid email or password');
      pass('2.4: Incorrect password returns generic 401 "Invalid email or password"');
    }

    // 2.5 Valid login with case-insensitive and trimmed email
    {
      const res = await httpRequest({
        port,
        path: '/api/auth/login',
        method: 'POST',
        body: {
          email: `  ${validEmail.toUpperCase()}  `,
          password: validPassword
        }
      });
      assert.strictEqual(res.status, 200, 'Expected 200 OK for valid credentials');
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.token, 'Expected JWT token in login response');
      assert.strictEqual(res.body.email, validEmail.toLowerCase());
      assert.strictEqual(res.body.fullName, validName);
      assert.strictEqual(res.body.role, 'Citizen');

      // Verify JWT token signature and payload
      const decoded = jwt.verify(res.body.token, getJwtSecret());
      assert.strictEqual(decoded.id, registeredUserId);
      assert.strictEqual(decoded.role, 'Citizen');
      pass('2.5: Valid login succeeds with email normalization, returns 200 and verified JWT');
    }

    // -------------------------------------------------------------------------
    // 3. SESSION RESTORATION & TOKEN VERIFICATION
    // -------------------------------------------------------------------------
    console.log('\n--- 3. Session Persistence & Token Verification ---');

    // 3.1 Session profile retrieval with valid token
    {
      const res = await httpRequest({
        port,
        path: '/api/users/profile',
        method: 'GET',
        headers: { Authorization: `Bearer ${registeredToken}` }
      });
      assert.strictEqual(res.status, 200, 'Expected 200 OK for valid token');
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.email, validEmail.toLowerCase());
      assert.strictEqual(res.body.role, 'Citizen');
      pass('3.1: Session restore (GET /api/users/profile) returns persisted citizen profile');
    }

    // 3.2 Token failure handling: Reject invalid / tampered token
    {
      const res = await httpRequest({
        port,
        path: '/api/users/profile',
        method: 'GET',
        headers: { Authorization: 'Bearer invalid.tampered.token' }
      });
      assert.strictEqual(res.status, 401, 'Expected 401 Unauthorized for tampered token');
      assert.strictEqual(res.body.success, false);
      pass('3.2: Tampered / invalid token is rejected with 401 Unauthorized');
    }

    // 3.3 Token failure handling: Reject missing Authorization header
    {
      const res = await httpRequest({
        port,
        path: '/api/users/profile',
        method: 'GET'
      });
      assert.strictEqual(res.status, 401, 'Expected 401 Unauthorized for missing token');
      assert.strictEqual(res.body.success, false);
      pass('3.3: Missing Authorization header is rejected with 401 Unauthorized');
    }

    // -------------------------------------------------------------------------
    // 4. CORS INTEGRATION CHECKS
    // -------------------------------------------------------------------------
    console.log('\n--- 4. CORS Configuration Checks ---');

    // 4.1 Production frontend origin is allowed
    {
      const allowed = isOriginAllowed('https://govhelp.vercel.app');
      assert.strictEqual(allowed, true, 'https://govhelp.vercel.app must be allowed');
      pass('4.1: Production frontend origin (https://govhelp.vercel.app) is authorized by CORS');
    }

    // 4.2 Trailing slash on frontend origin is sanitized
    {
      const allowed = isOriginAllowed('https://govhelp.vercel.app/');
      assert.strictEqual(allowed, true, 'https://govhelp.vercel.app/ must be allowed after normalization');
      pass('4.2: Origin with trailing slash is properly normalized');
    }

    // 4.3 Unapproved origin is rejected
    {
      const allowed = isOriginAllowed('https://malicious-site.example.com');
      assert.strictEqual(allowed, false, 'Malicious origin must be rejected');
      pass('4.3: Unapproved external origin is rejected');
    }

    // -------------------------------------------------------------------------
    // 5. SECURITY & RATE LIMITING HARDENING
    // -------------------------------------------------------------------------
    console.log('\n--- 5. Security & Rate Limiting Hardening ---');

    // 5.1 Auth endpoints include rate-limiting headers
    {
      const res = await httpRequest({
        port,
        path: '/api/auth/login',
        method: 'POST',
        body: { email: 'invalid_format' }
      });
      assert.ok(
        res.headers['ratelimit-limit'] || res.headers['x-ratelimit-limit'],
        'Expected rate-limit limit header on auth endpoint'
      );
      assert.ok(
        res.headers['ratelimit-remaining'] || res.headers['x-ratelimit-remaining'],
        'Expected rate-limit remaining header on auth endpoint'
      );
      pass('5.1: Authentication endpoints enforce dedicated rate limiting with standard headers');
    }

    // 5.2 Role escalation via profile update is strictly ignored
    {
      const res = await httpRequest({
        port,
        path: '/api/users/profile',
        method: 'PUT',
        headers: { Authorization: `Bearer ${registeredToken}` },
        body: { role: 'Super Admin', profile: { role: 'Super Admin' } }
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.role, 'Citizen', 'Role must remain Citizen');
      const dbCitizen = await User.findById(registeredUserId);
      assert.strictEqual(dbCitizen.role, 'Citizen', 'Database role must remain Citizen');
      pass('5.2: Citizen profile update rejects privilege escalation and preserves Citizen role');
    }

    // 5.3 Password and internal secrets are excluded from profile responses
    {
      const res = await httpRequest({
        port,
        path: '/api/users/profile',
        method: 'GET',
        headers: { Authorization: `Bearer ${registeredToken}` }
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.password, undefined, 'Password must not be present in profile response');
      assert.strictEqual(res.body.twoFactorSecret, undefined, '2FA secret must not be present in response');
      assert.strictEqual(res.body.otpTokens, undefined, 'OTP tokens must not be present in response');
      pass('5.3: Sensitive secrets (passwords, OTP tokens, 2FA) are strictly excluded from profile payloads');
    }

    console.log('\n================================================================');
    console.log(` ALL AUTHENTICATION END-TO-END TESTS PASSED: ${passedTests}/${totalTests}! `);
    console.log('================================================================\n');

  } finally {
    await new Promise((resolve) => server.close(resolve));
    await mongoose.disconnect();
  }
}

runAuthEndToEndTests().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error('[FATAL TEST SUITE FAILURE]:', err);
  process.exit(1);
});
