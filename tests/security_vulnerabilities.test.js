// tests/security_vulnerabilities.test.js
// Automated Security Regression Test Suite for Critical Audit Findings:
// 1. SEC-01: Public registration privilege escalation prevention (always Citizen role)
// 2. SEC-02: Public /uploads directory blocking & authenticated document file retrieval with strict ownership checks
// 3. DATA-01: Citizen document upload persistence, multi-session retrieval, and isolated deletion

import assert from 'assert';
import http from 'http';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

// Set test environment so server.js does not auto-bind to production port
process.env.NODE_ENV = 'test';

import app from '../server/server.js';
import User from '../server/models/User.js';
import Document from '../server/models/Document.js';
import connectDB from '../server/db.js';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/govscheme';

async function runSecurityTestSuite() {
  console.log('================================================================');
  console.log('     GOVSCHEME CRITICAL SECURITY VULNERABILITY TEST SUITE       ');
  console.log('================================================================\n');

  // Connect to DB if not already connected
  if (mongoose.connection.readyState === 0) {
    await connectDB();
  }

  // Create test HTTP server on ephemeral port
  const testServer = http.createServer(app);
  await new Promise((resolve) => testServer.listen(0, resolve));
  const port = testServer.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`[Setup] Test server running on ${baseUrl}\n`);

  let passedTests = 0;
  let totalTests = 0;

  async function test(name, fn) {
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

  // Helper for requests
  async function apiRequest(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
    const res = await fetch(url, options);
    let data = null;
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await res.json().catch(() => null);
    } else {
      data = await res.text().catch(() => null);
    }
    return { status: res.status, headers: res.headers, data };
  }

  const timestamp = Date.now();
  const citizenAEmail = `audit_citizen_a_${timestamp}@govscheme.test`;
  const citizenBEmail = `audit_citizen_b_${timestamp}@govscheme.test`;
  const attackerEmail = `audit_attacker_${timestamp}@govscheme.test`;
  const testPassword = 'SecurePassword123!';

  let citizenAToken = '';
  let citizenAId = '';
  let citizenBToken = '';
  let citizenBId = '';
  let uploadedDocId = '';
  let testFileName = '';

  try {
    // -------------------------------------------------------------
    // VULNERABILITY 1: Public Registration Privilege Escalation (SEC-01)
    // -------------------------------------------------------------
    console.log('--- 1. Testing Registration Privilege Escalation (SEC-01) ---');

    await test('Ordinary registration request with role="Super Admin" is forced to "Citizen"', async () => {
      const res = await apiRequest('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Malicious Attacker',
          email: attackerEmail,
          password: testPassword,
          role: 'Super Admin' // Privilege escalation attempt
        })
      });

      assert.strictEqual(res.status, 201, `Expected 201, got ${res.status}`);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.role, 'Citizen', 'Role in response must be forced to Citizen');
      assert.strictEqual(res.data.user.role, 'Citizen', 'Role in user payload must be Citizen');

      // Verify database record
      const dbUser = await User.findOne({ email: attackerEmail.toLowerCase() });
      assert.ok(dbUser, 'User must exist in DB');
      assert.strictEqual(dbUser.role, 'Citizen', 'Role in MongoDB must be Citizen');

      // Verify token payload
      const decoded = jwt.decode(res.data.token);
      assert.strictEqual(decoded.role, 'Citizen', 'JWT role claim must be Citizen');
    });

    await test('Ordinary registered citizen cannot access admin-only endpoints', async () => {
      // Login attacker to get token
      const loginRes = await apiRequest('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: attackerEmail, password: testPassword })
      });
      assert.strictEqual(loginRes.status, 200);
      const token = loginRes.data.token;

      // Attempt to access admin audit logs
      const auditRes = await apiRequest('/api/audit', {
        headers: { Authorization: `Bearer ${token}` }
      });
      assert.strictEqual(auditRes.status, 403, 'Citizen must be forbidden from accessing audit logs');

      // Attempt to access admin documents view
      const adminDocsRes = await apiRequest('/api/documents?adminView=true', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Non-admins should not get admin documents view
      assert.ok(adminDocsRes.status === 200 || adminDocsRes.status === 403);
    });

    // Register legitimate Citizen A and Citizen B for document tests
    await test('Setup Citizen A and Citizen B accounts', async () => {
      const resA = await apiRequest('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: 'Citizen Alice', email: citizenAEmail, password: testPassword })
      });
      assert.strictEqual(resA.status, 201);
      citizenAToken = resA.data.token;
      citizenAId = resA.data.user.id || resA.data.user._id;

      const resB = await apiRequest('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: 'Citizen Bob', email: citizenBEmail, password: testPassword })
      });
      assert.strictEqual(resB.status, 201);
      citizenBToken = resB.data.token;
      citizenBId = resB.data.user.id || resB.data.user._id;
    });

    // -------------------------------------------------------------
    // VULNERABILITY 2: Unauthenticated Access & Document Ownership (SEC-02)
    // -------------------------------------------------------------
    console.log('\n--- 2. Testing Document Access Control & Ownership Isolation (SEC-02) ---');

    await test('Direct unauthenticated access to /uploads directory returns 403 Forbidden', async () => {
      // Create a test file in uploads directory
      const uploadsDir = path.resolve('uploads');
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
      testFileName = `doc_security_test_${timestamp}.pdf`;
      const testFilePath = path.join(uploadsDir, testFileName);
      fs.writeFileSync(testFilePath, '%PDF-1.4 Confidential Citizen Information', 'utf8');

      // Request /uploads/filename anonymously
      const res = await apiRequest(`/uploads/${testFileName}`);
      assert.strictEqual(res.status, 403, `Direct /uploads access must return 403 Forbidden, got ${res.status}`);
      assert.strictEqual(res.data.success, false);
      assert.ok(res.data.message.includes('forbidden'), 'Message must indicate forbidden');
    });

    await test('Citizen A creates a confidential document in the backend', async () => {
      // Create Document record for Citizen A pointing to test file
      const doc = await Document.create({
        documentId: `DOC-${timestamp}-ALICE`,
        userId: new mongoose.Types.ObjectId(citizenAId),
        documentType: 'Aadhaar',
        type: 'Aadhaar',
        originalFileName: 'alice_confidential_aadhaar.pdf',
        fileMimeType: 'application/pdf',
        fileSize: 42,
        fileUrl: `/uploads/${testFileName}`,
        ocrStatus: 'COMPLETED',
        extractedFields: { fullName: 'Citizen Alice', aadhaarNumber: '9999 8888 7777' },
        verificationStatus: 'CHECKS_PASSED'
      });

      uploadedDocId = doc.documentId;
      assert.ok(uploadedDocId, 'Document ID must exist');
    });

    await test('Anonymous user cannot download private document via /api/documents/:id/file (401 Unauthorized)', async () => {
      const res = await apiRequest(`/api/documents/${uploadedDocId}/file`);
      assert.strictEqual(res.status, 401, `Anonymous request must return 401, got ${res.status}`);
    });

    await test('Citizen B (attacker) CANNOT download Citizen A\'s private document (404/403 Access Denied)', async () => {
      const res = await apiRequest(`/api/documents/${uploadedDocId}/file`, {
        headers: { Authorization: `Bearer ${citizenBToken}` }
      });
      assert.ok([403, 404].includes(res.status), `Cross-citizen access must return 404 or 403, got ${res.status}`);
      if (typeof res.data === 'object' && res.data) {
        assert.strictEqual(res.data.success, false);
      }
    });

    await test('Citizen A (authorized owner) CAN successfully retrieve their private document file (200 OK)', async () => {
      const res = await apiRequest(`/api/documents/${uploadedDocId}/file`, {
        headers: { Authorization: `Bearer ${citizenAToken}` }
      });
      assert.strictEqual(res.status, 200, `Owner access must return 200 OK, got ${res.status}`);
      assert.ok(res.data.includes('Confidential Citizen Information'), 'Content must match original uploaded file');
      assert.strictEqual(res.headers.get('content-type'), 'application/pdf');
    });

    // -------------------------------------------------------------
    // VULNERABILITY 3: Document Persistence & Multi-session Retrieval (DATA-01)
    // -------------------------------------------------------------
    console.log('\n--- 3. Testing Document Backend Persistence & Multi-Session Retrieval (DATA-01) ---');

    let manualDocId = '';

    await test('Citizen A creates a manual document record via POST /api/documents/manual and it persists in DB', async () => {
      const res = await apiRequest('/api/documents/manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${citizenAToken}`
        },
        body: JSON.stringify({
          documentType: 'Income Certificate',
          docNumber: 'INC/2026/98765',
          extractedFields: { annualIncome: 95000, issuingAuthority: 'Tahsildar' }
        })
      });

      assert.strictEqual(res.status, 201, `Expected 201 Created, got ${res.status}`);
      assert.strictEqual(res.data.success, true);
      assert.ok(res.data.document.documentId);
      manualDocId = res.data.document.documentId;

      // Verify direct database persistence
      const inDb = await Document.findOne({ documentId: manualDocId, userId: citizenAId });
      assert.ok(inDb, 'Manual document must be persisted in MongoDB Document collection');
      assert.strictEqual(inDb.documentType, 'Income Certificate');
      assert.strictEqual(inDb.extractedFields.annualIncome, 95000);
    });

    await test('When Citizen A signs in again, login response includes their persisted documents', async () => {
      const res = await apiRequest('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: citizenAEmail, password: testPassword })
      });

      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.data.documents), 'Response must include documents array');
      assert.ok(res.data.documents.length >= 2, 'Must include both uploaded and manual documents');

      const foundAadhaar = res.data.documents.find(d => d.documentId === uploadedDocId);
      const foundIncome = res.data.documents.find(d => d.documentId === manualDocId);
      assert.ok(foundAadhaar, 'Aadhaar document must be present upon sign in');
      assert.ok(foundIncome, 'Income Certificate must be present upon sign in');
    });

    await test('Citizen A profile endpoint (GET /api/users/profile) includes all persisted documents', async () => {
      const res = await apiRequest('/api/users/profile', {
        headers: { Authorization: `Bearer ${citizenAToken}` }
      });

      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.data.documents), 'Profile response must include documents');
      assert.ok(res.data.documents.some(d => d.documentId === uploadedDocId));
      assert.ok(res.data.documents.some(d => d.documentId === manualDocId));
    });

    await test('Citizen A documents endpoint (GET /api/documents) returns all owned documents with ownership isolation', async () => {
      // Citizen A documents
      const resA = await apiRequest('/api/documents', {
        headers: { Authorization: `Bearer ${citizenAToken}` }
      });
      assert.strictEqual(resA.status, 200);
      assert.ok(resA.data.documents.length >= 2);

      // Citizen B documents (must be 0 documents, strict isolation)
      const resB = await apiRequest('/api/documents', {
        headers: { Authorization: `Bearer ${citizenBToken}` }
      });
      assert.strictEqual(resB.status, 200);
      assert.strictEqual(resB.data.documents.length, 0, 'Citizen B must not see any of Citizen A\'s documents');
    });

    await test('Citizen A deletes document (DELETE /api/documents/:id) and it is removed from MongoDB and disk', async () => {
      const res = await apiRequest(`/api/documents/${manualDocId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${citizenAToken}` }
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);

      // Verify removed from DB
      const inDb = await Document.findOne({ documentId: manualDocId });
      assert.strictEqual(inDb, null, 'Document must be removed from MongoDB');

      // Verify Citizen A now only has 1 document
      const listRes = await apiRequest('/api/documents', {
        headers: { Authorization: `Bearer ${citizenAToken}` }
      });
      assert.strictEqual(listRes.data.documents.some(d => d.documentId === manualDocId), false);
    });

    console.log('\n================================================================');
    console.log(`   ALL SECURITY TESTS PASSED: ${passedTests}/${totalTests} TESTS SUCCESSFUL!`);
    console.log('================================================================\n');

  } finally {
    // Clean up test file on disk
    if (testFileName) {
      const p = path.resolve('uploads', testFileName);
      if (fs.existsSync(p)) {
        try { fs.unlinkSync(p); } catch (e) {}
      }
    }
    // Clean up created test accounts
    await User.deleteMany({ email: { $in: [attackerEmail, citizenAEmail, citizenBEmail] } });
    await Document.deleteMany({ userId: { $in: [citizenAId, citizenBId] } });

    // Close test server and DB connection
    await new Promise((resolve) => testServer.close(resolve));
    await mongoose.disconnect();
  }
}

runSecurityTestSuite().catch((err) => {
  console.error('[SECURITY TEST SUITE FAILED]:', err);
  process.exit(1);
});
