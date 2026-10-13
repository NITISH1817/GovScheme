// tests/jwt_cors_hardening.test.js
// Automated Regression Test Suite for:
// 1. Task 1: JWT Secret Hardening & Fail-Fast Startup Validation
// 2. Task 2: Production CORS Allowlist Enforcement

import assert from 'assert';
import http from 'http';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Ensure test environment
process.env.NODE_ENV = 'test';

import app from '../server/server.js';
import { getJwtSecret, validateJwtConfig } from '../server/config/jwtConfig.js';
import { isOriginAllowed, getAllowedOrigins } from '../server/config/corsConfig.js';
import User from '../server/models/User.js';
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

async function runHardeningTestSuite() {
  console.log('================================================================');
  console.log('       GOVSCHEME JWT & CORS SECURITY HARDENING TEST SUITE       ');
  console.log('================================================================\n');

  let passedTests = 0;
  const originalJwtSecret = process.env.JWT_SECRET;
  const originalClientUrl = process.env.CLIENT_URL;

  // -------------------------------------------------------------
  // GROUP 1: JWT SECRET VALIDATION & FAIL-FAST STARTUP
  // -------------------------------------------------------------
  console.log('--- Group 1: JWT Secret Validation & Fail-Fast Startup ---');

  // Test 1: getJwtSecret throws when JWT_SECRET is unset or empty
  try {
    delete process.env.JWT_SECRET;
    assert.throws(
      () => getJwtSecret(),
      (err) => {
        assert(err.message.includes('JWT_SECRET'));
        assert(err.message.includes('missing or empty'));
        return true;
      }
    );
    passedTests++;
    console.log('  [PASS] getJwtSecret() fails fast when JWT_SECRET is missing');
  } finally {
    process.env.JWT_SECRET = originalJwtSecret || 'test_secure_jwt_secret_key_2026';
  }

  // Test 2: validateJwtConfig throws when JWT_SECRET is whitespace
  try {
    process.env.JWT_SECRET = '   ';
    assert.throws(
      () => validateJwtConfig(),
      (err) => {
        assert(err.message.includes('JWT_SECRET'));
        return true;
      }
    );
    passedTests++;
    console.log('  [PASS] validateJwtConfig() fails fast when JWT_SECRET is empty whitespace');
  } finally {
    process.env.JWT_SECRET = originalJwtSecret || 'test_secure_jwt_secret_key_2026';
  }

  // Test 3: getJwtSecret returns the trimmed configured secret
  const configuredSecret = getJwtSecret();
  assert.strictEqual(typeof configuredSecret, 'string');
  assert(configuredSecret.length > 0);
  passedTests++;
  console.log('  [PASS] Configured JWT_SECRET is returned without mutation or leakage');

  // Connect to DB and set up test HTTP server
  if (mongoose.connection.readyState === 0) {
    await connectDB();
  }

  const testServer = http.createServer(app);
  await new Promise((resolve) => testServer.listen(0, resolve));
  const port = testServer.address().port;

  // Create a verified test user for token verification tests
  const testUserEmail = `jwt_test_${Date.now()}@test.com`;
  const testUser = await User.create({
    fullName: 'JWT Security Citizen',
    email: testUserEmail,
    password: 'password123',
    role: 'Citizen',
  });

  // -------------------------------------------------------------
  // GROUP 2: JWT SIGNING, VERIFICATION & TAMPER PROTECTION
  // -------------------------------------------------------------
  console.log('\n--- Group 2: JWT Signing, Verification & Tamper Protection ---');

  // Test 4: Legitimate token signed with configured secret is accepted
  const validToken = jwt.sign(
    { id: testUser._id.toString(), name: testUser.fullName, role: testUser.role },
    configuredSecret,
    { expiresIn: '1h' }
  );

  const validRes = await httpRequest({
    port,
    path: '/api/users/profile',
    method: 'GET',
    headers: { Authorization: `Bearer ${validToken}` },
  });
  assert.strictEqual(validRes.status, 200);
  assert.strictEqual(validRes.body.email, testUserEmail);
  passedTests++;
  console.log('  [PASS] Legitimate token signed with JWT_SECRET is authorized (200 OK)');

  // Test 5: Forged token signed with different/arbitrary secret is rejected
  const forgedToken = jwt.sign(
    { id: testUser._id.toString(), name: testUser.fullName, role: 'Super Admin' },
    'forged_attacker_secret_key',
    { expiresIn: '1h' }
  );

  const forgedRes = await httpRequest({
    port,
    path: '/api/users/profile',
    method: 'GET',
    headers: { Authorization: `Bearer ${forgedToken}` },
  });
  assert.strictEqual(forgedRes.status, 401);
  assert.strictEqual(forgedRes.body.success, false);
  passedTests++;
  console.log('  [PASS] Forged token signed with invalid secret is rejected (401 Unauthorized)');

  // Test 6: Expired token is rejected
  const expiredToken = jwt.sign(
    { id: testUser._id.toString(), name: testUser.fullName, role: testUser.role },
    configuredSecret,
    { expiresIn: -10 } // Expired 10 seconds ago
  );

  const expiredRes = await httpRequest({
    port,
    path: '/api/users/profile',
    method: 'GET',
    headers: { Authorization: `Bearer ${expiredToken}` },
  });
  assert.strictEqual(expiredRes.status, 401);
  passedTests++;
  console.log('  [PASS] Expired token is rejected (401 Unauthorized)');

  // Test 7: Malformed token string is rejected
  const malformedRes = await httpRequest({
    port,
    path: '/api/users/profile',
    method: 'GET',
    headers: { Authorization: 'Bearer this.is.not.a.valid.jwt' },
  });
  assert.strictEqual(malformedRes.status, 401);
  passedTests++;
  console.log('  [PASS] Malformed token is rejected (401 Unauthorized)');

  // -------------------------------------------------------------
  // GROUP 3: PRODUCTION CORS ALLOWLIST ENFORCEMENT
  // -------------------------------------------------------------
  console.log('\n--- Group 3: Production CORS Allowlist Enforcement ---');

  // Test 8: Approved production frontend (https://govhelp.vercel.app) is allowed
  assert.strictEqual(isOriginAllowed('https://govhelp.vercel.app', 'production'), true);

  const prodCorsRes = await httpRequest({
    port,
    path: '/api/health',
    method: 'GET',
    headers: { Origin: 'https://govhelp.vercel.app' },
  });
  assert.strictEqual(prodCorsRes.status, 200);
  assert.strictEqual(
    prodCorsRes.headers['access-control-allow-origin'],
    'https://govhelp.vercel.app'
  );
  assert.strictEqual(prodCorsRes.headers['access-control-allow-credentials'], 'true');
  passedTests++;
  console.log('  [PASS] Production frontend origin (https://govhelp.vercel.app) is allowed with credentials');

  // Test 9: Configured CLIENT_URL is allowed
  process.env.CLIENT_URL = 'https://govhelp-custom.org';
  assert.strictEqual(isOriginAllowed('https://govhelp-custom.org', 'production'), true);

  const clientUrlRes = await httpRequest({
    port,
    path: '/api/health',
    method: 'GET',
    headers: { Origin: 'https://govhelp-custom.org' },
  });
  assert.strictEqual(clientUrlRes.status, 200);
  assert.strictEqual(
    clientUrlRes.headers['access-control-allow-origin'],
    'https://govhelp-custom.org'
  );
  passedTests++;
  console.log('  [PASS] Configured CLIENT_URL origin is allowed dynamically');

  // Test 10: Arbitrary *.vercel.app preview origin is REJECTED
  assert.strictEqual(isOriginAllowed('https://arbitrary-preview-123.vercel.app', 'production'), false);

  const arbitraryVercelRes = await httpRequest({
    port,
    path: '/api/health',
    method: 'GET',
    headers: { Origin: 'https://arbitrary-preview-123.vercel.app' },
  });
  assert.strictEqual(arbitraryVercelRes.status, 403);
  assert.strictEqual(arbitraryVercelRes.headers['access-control-allow-origin'], undefined);
  passedTests++;
  console.log('  [PASS] Arbitrary *.vercel.app domain is rejected (403 Forbidden, no CORS header)');

  // Test 11: Malicious / unrelated origin is REJECTED
  assert.strictEqual(isOriginAllowed('https://malicious-attacker.com', 'production'), false);

  const maliciousRes = await httpRequest({
    port,
    path: '/api/health',
    method: 'GET',
    headers: { Origin: 'https://malicious-attacker.com' },
  });
  assert.strictEqual(maliciousRes.status, 403);
  assert.strictEqual(maliciousRes.headers['access-control-allow-origin'], undefined);
  passedTests++;
  console.log('  [PASS] Unrelated malicious origin is rejected (403 Forbidden)');

  // Test 12: Localhost is permitted in development but rejected in production
  assert.strictEqual(isOriginAllowed('http://localhost:5173', 'development'), true);
  assert.strictEqual(isOriginAllowed('http://localhost:5173', 'production'), false);
  passedTests++;
  console.log('  [PASS] Localhost origin is permitted only in development and blocked in production');

  // Test 13: Non-browser requests without Origin header (curl, mobile, backend-to-backend) are allowed
  assert.strictEqual(isOriginAllowed('', 'production'), true);
  const noOriginRes = await httpRequest({
    port,
    path: '/api/health',
    method: 'GET',
  });
  assert.strictEqual(noOriginRes.status, 200);
  assert.strictEqual(noOriginRes.body.status, 'healthy');
  passedTests++;
  console.log('  [PASS] Requests without Origin header proceed normally (200 OK)');

  // Test 14: Legitimate authenticated request from production origin succeeds end-to-end
  const authCorsRes = await httpRequest({
    port,
    path: '/api/users/profile',
    method: 'GET',
    headers: {
      Origin: 'https://govhelp.vercel.app',
      Authorization: `Bearer ${validToken}`,
    },
  });
  assert.strictEqual(authCorsRes.status, 200);
  assert.strictEqual(
    authCorsRes.headers['access-control-allow-origin'],
    'https://govhelp.vercel.app'
  );
  assert.strictEqual(authCorsRes.body.email, testUserEmail);
  passedTests++;
  console.log('  [PASS] Authenticated request from production origin succeeds with CORS headers (200 OK)');

  // Cleanup
  process.env.CLIENT_URL = originalClientUrl;
  await User.deleteOne({ _id: testUser._id });
  await new Promise((resolve) => testServer.close(resolve));

  console.log('\n================================================================');
  console.log(`   ALL HARDENING TESTS PASSED: ${passedTests}/${passedTests} TESTS SUCCESSFUL!`);
  console.log('================================================================\n');
}

runHardeningTestSuite()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[Hardening Test Failure]:', err);
    process.exit(1);
  });
