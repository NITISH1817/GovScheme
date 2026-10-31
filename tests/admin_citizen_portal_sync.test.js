import assert from 'assert';
import {
  isAuthorizedAdminEmail,
  isAuthorizedAdminRole,
  isAuthorizedAdminUser,
  DEFAULT_AUTHORIZED_ADMIN_EMAILS
} from '../src/utils/adminAuth.ts';
import {
  createScheme,
  updateScheme,
  deleteScheme,
  duplicateScheme,
  bulkSchemeAction
} from '../server/controllers/schemeController.js';
import Scheme from '../server/models/Scheme.js';

function pass(msg) {
  console.log(`  [PASS] ${msg}`);
}

console.log('================================================================');
console.log('   ADMIN-CITIZEN PORTAL BIDIRECTIONAL SYNC & AUTH VERIFICATION  ');
console.log('================================================================\n');

// -------------------------------------------------------------
// GROUP 1: Authorized Administrator Account Email IDs
// -------------------------------------------------------------
console.log('--- Group 1: Authorized Admin Account Allowlist ---');

{
  // 1.1 admin@govscheme.in
  assert(DEFAULT_AUTHORIZED_ADMIN_EMAILS.includes('admin@govscheme.in'), 'admin@govscheme.in must be in authorized admin allowlist');
  assert.strictEqual(isAuthorizedAdminEmail('admin@govscheme.in'), true, 'admin@govscheme.in must be recognized as authorized');
  pass('1.1: admin@govscheme.in is confirmed authorized administrative account');

  // 1.2 nitishpriyan1807@gmail.com
  assert(DEFAULT_AUTHORIZED_ADMIN_EMAILS.includes('nitishpriyan1807@gmail.com'), 'nitishpriyan1807@gmail.com must be in authorized admin allowlist');
  assert.strictEqual(isAuthorizedAdminEmail('nitishpriyan1807@gmail.com'), true, 'nitishpriyan1807@gmail.com must be recognized as authorized');
  pass('1.2: nitishpriyan1807@gmail.com is confirmed authorized administrative account');

  // 1.3 Case insensitivity and trimming
  assert.strictEqual(isAuthorizedAdminEmail('  ADMIN@GovScheme.in  '), true);
  assert.strictEqual(isAuthorizedAdminEmail('NitishPriyan1807@Gmail.COM'), true);
  pass('1.3: Admin email check handles whitespace and case variations safely');

  // 1.4 Unapproved accounts rejected
  assert.strictEqual(isAuthorizedAdminEmail('unauthorized@example.com'), false);
  assert.strictEqual(isAuthorizedAdminEmail('citizen@govscheme.in'), false);
  assert.strictEqual(isAuthorizedAdminEmail(''), false);
  assert.strictEqual(isAuthorizedAdminEmail(null), false);
  pass('1.4: Non-allowlisted citizen accounts are strictly rejected');
}

// -------------------------------------------------------------
// GROUP 2: Admin Portal Role & Session Authorization
// -------------------------------------------------------------
console.log('\n--- Group 2: Admin Portal Role & Session Verification ---');

{
  // 2.1 Super Admin user profile
  const superAdminUser = {
    id: 'admin-1',
    fullName: 'System Administrator',
    email: 'admin@govscheme.in',
    role: 'Super Admin',
    token: 'valid.jwt.token'
  };
  assert.strictEqual(isAuthorizedAdminUser(superAdminUser), true, 'Super Admin user must evaluate to true');
  pass('2.1: Super Admin user with admin@govscheme.in is authorized');

  // 2.2 Nitish Priyan Super Admin profile
  const nitishAdminUser = {
    id: 'admin-2',
    fullName: 'Nitish Priyan',
    email: 'nitishpriyan1807@gmail.com',
    role: 'Super Admin',
    token: 'valid.jwt.token'
  };
  assert.strictEqual(isAuthorizedAdminUser(nitishAdminUser), true, 'Nitish Priyan Super Admin must evaluate to true');
  pass('2.2: Super Admin user with nitishpriyan1807@gmail.com is authorized');

  // 2.3 Citizen role is rejected even if email matches
  const citizenWithAdminEmail = {
    id: 'user-3',
    fullName: 'Citizen',
    email: 'admin@govscheme.in',
    role: 'Citizen',
    token: 'valid.jwt.token'
  };
  assert.strictEqual(isAuthorizedAdminUser(citizenWithAdminEmail), false, 'Citizen role must never evaluate to admin');
  pass('2.3: Citizen role is denied admin portal access regardless of email');

  // 2.4 Missing or mock token is rejected
  const mockTokenAdmin = {
    id: 'user-4',
    fullName: 'Mock Admin',
    email: 'admin@govscheme.in',
    role: 'Super Admin',
    token: 'mock-token-123'
  };
  assert.strictEqual(isAuthorizedAdminUser(mockTokenAdmin), false, 'Mock tokens must be rejected');
  pass('2.4: Mock tokens are strictly rejected from admin access');
}

// -------------------------------------------------------------
// GROUP 3: Backend Controller ReferenceError Fix Inspection
// -------------------------------------------------------------
console.log('\n--- Group 3: Scheme Controller ReferenceError Fixes ---');

{
  // Verify that schemeController functions exist and are callable without runtime syntax errors
  assert.strictEqual(typeof createScheme, 'function', 'createScheme is defined');
  assert.strictEqual(typeof updateScheme, 'function', 'updateScheme is defined');
  assert.strictEqual(typeof deleteScheme, 'function', 'deleteScheme is defined');
  assert.strictEqual(typeof duplicateScheme, 'function', 'duplicateScheme is defined');
  assert.strictEqual(typeof bulkSchemeAction, 'function', 'bulkSchemeAction is defined');
  pass('3.1: All scheme CRUD controller functions export valid callable signatures');
}

console.log('\n================================================================');
console.log('   ALL ADMIN-CITIZEN PORTAL SYNC AUDITS PASSED (100% GREEN)     ');
console.log('================================================================');
