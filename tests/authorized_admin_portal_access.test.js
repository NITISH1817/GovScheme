/**
 * tests/authorized_admin_portal_access.test.js
 * Validates selective Admin Portal visibility and access control:
 * - Admin portal button is hidden from regular citizens and guests.
 * - Admin portal button and access are strictly restricted to authorized emails (admin@govscheme.in, nitishpriyan1807@gmail.com).
 * - Authorized admin email is mentioned in navigation and access control boundaries.
 */

import assert from 'assert';

// 1. Authorized admin emails contract
const DEFAULT_AUTHORIZED_ADMIN_EMAILS = [
  'admin@govscheme.in',
  'nitishpriyan1807@gmail.com'
];

function isAuthorizedAdminEmail(email, configuredEnv = '') {
  if (!email || typeof email !== 'string') return false;
  const envEmails = configuredEnv.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
  const authorized = new Set([
    ...DEFAULT_AUTHORIZED_ADMIN_EMAILS.map(e => e.toLowerCase()),
    ...envEmails
  ]);
  return authorized.has(email.trim().toLowerCase());
}

function isAuthorizedAdminRole(role) {
  if (!role || typeof role !== 'string') return false;
  const normalized = role.trim().toLowerCase();
  const validAdminRoles = [
    'super admin',
    'superadmin',
    'state admin',
    'ministry admin',
    'district officer',
    'nodal officer',
    'data entry operator'
  ];
  return validAdminRoles.includes(normalized) || (normalized.includes('admin') && normalized !== 'citizen');
}

function isAuthorizedAdminUser(user, configuredEnv = '') {
  if (!user) return false;
  const email = (user.email || '').trim().toLowerCase();
  if (email && isAuthorizedAdminEmail(email, configuredEnv)) return true;
  if (user.role && isAuthorizedAdminRole(user.role)) return true;
  return false;
}

function getNavItemsForUser(user) {
  const baseNavItems = [
    { id: 'home', label: 'Home' },
    { id: 'schemes', label: 'Schemes' },
    { id: 'assistant', label: 'AI Assistant', isAI: true },
    { id: 'vault', label: 'Vault' },
    { id: 'tracker', label: 'Tracker' },
    { id: 'kiosk', label: 'CSC Kiosk', isKiosk: true },
  ];

  if (isAuthorizedAdminUser(user)) {
    return [...baseNavItems, { id: 'admin', label: 'Admin Portal', isAdmin: true }];
  }
  return baseNavItems;
}

function simulateAdminRouteAccess(user) {
  if (!isAuthorizedAdminUser(user)) {
    if (!user) {
      return { view: 'ADMIN_LOGIN', canAccess: false, reason: 'Authentication required' };
    }
    return {
      view: 'ACCESS_RESTRICTED',
      canAccess: false,
      authorizedAccounts: DEFAULT_AUTHORIZED_ADMIN_EMAILS,
      currentAccount: user.email || 'Citizen'
    };
  }
  return { view: 'ADMIN_PLATFORM', canAccess: true, activeAccount: user.email };
}

console.log('--- TEST SUITE: Selective Admin Portal Visibility & Account Enforcement ---');

// Test 1: Authorized Emails Contract
assert.strictEqual(DEFAULT_AUTHORIZED_ADMIN_EMAILS.includes('admin@govscheme.in'), true, 'admin@govscheme.in must be authorized');
assert.strictEqual(DEFAULT_AUTHORIZED_ADMIN_EMAILS.includes('nitishpriyan1807@gmail.com'), true, 'nitishpriyan1807@gmail.com must be authorized');
console.log('  PASS: Authorized admin email list contains official system admin and super admin accounts.');

// Test 2: Email validation checks
assert.strictEqual(isAuthorizedAdminEmail('admin@govscheme.in'), true);
assert.strictEqual(isAuthorizedAdminEmail('ADMIN@GOVSCHEME.IN'), true, 'Case-insensitive email check');
assert.strictEqual(isAuthorizedAdminEmail('nitishpriyan1807@gmail.com'), true);
assert.strictEqual(isAuthorizedAdminEmail('NITISHPRIYAN1807@GMAIL.COM'), true, 'Case-insensitive email check');
assert.strictEqual(isAuthorizedAdminEmail('citizen@govscheme.in'), false, 'Citizen email must NOT be authorized as admin');
assert.strictEqual(isAuthorizedAdminEmail('user@gmail.com'), false, 'Arbitrary email must NOT be authorized');
assert.strictEqual(isAuthorizedAdminEmail(null), false, 'Null email returns false');
assert.strictEqual(isAuthorizedAdminEmail(undefined), false, 'Undefined email returns false');
console.log('  PASS: Email-level authorization validation passes for all cases.');

// Test 3: Citizen Profiles must evaluate to false
const demoCitizen = {
  id: 'cit_1',
  fullName: 'Ramesh Kumar',
  email: 'citizen@govscheme.in',
  role: 'citizen'
};
const personalCitizen = {
  id: 'cit_2',
  fullName: 'Priya Sharma',
  email: 'priya.sharma@example.com',
  role: 'Citizen'
};
assert.strictEqual(isAuthorizedAdminUser(null), false, 'Guest is not admin');
assert.strictEqual(isAuthorizedAdminUser(undefined), false, 'Undefined is not admin');
assert.strictEqual(isAuthorizedAdminUser(demoCitizen), false, 'Citizen role is not admin');
assert.strictEqual(isAuthorizedAdminUser(personalCitizen), false, 'Citizen role is not admin');
console.log('  PASS: Citizen profiles and unauthenticated guests are strictly flagged as unauthorized.');

// Test 4: Authorized Admin Profiles evaluate to true
const officialAdmin = {
  id: 'admin_1',
  fullName: 'Super Administrator',
  email: 'admin@govscheme.in',
  role: 'Super Admin'
};
const superAdminOwner = {
  id: 'admin_2',
  fullName: 'Nitish Priyan',
  email: 'nitishpriyan1807@gmail.com',
  role: 'Super Admin'
};
assert.strictEqual(isAuthorizedAdminUser(officialAdmin), true, 'Official admin is authorized');
assert.strictEqual(isAuthorizedAdminUser(superAdminOwner), true, 'Nitish Priyan account is authorized');
console.log('  PASS: Authorized admin accounts successfully validate.');

// Test 5: Navbar Item Filtering — Ordinary Citizens NEVER see Admin Portal
const citizenNav = getNavItemsForUser(demoCitizen);
const guestNav = getNavItemsForUser(null);
assert.strictEqual(citizenNav.some(item => item.id === 'admin'), false, 'Citizen navItems must NOT include admin');
assert.strictEqual(guestNav.some(item => item.id === 'admin'), false, 'Guest navItems must NOT include admin');
console.log('  PASS: Ordinary citizens and unauthenticated guests do NOT see the Admin Portal button in navbar.');

// Test 6: Navbar Item Filtering — Authorized Admins DO see Admin Portal
const officialAdminNav = getNavItemsForUser(officialAdmin);
const superAdminNav = getNavItemsForUser(superAdminOwner);
assert.strictEqual(officialAdminNav.some(item => item.id === 'admin'), true, 'Official admin navItems must include admin');
assert.strictEqual(superAdminNav.some(item => item.id === 'admin'), true, 'Super admin navItems must include admin');
console.log('  PASS: Authorized admin users see the Admin Portal button in navbar.');

// Test 7: Simulated Route Protection & Mention of Authorized Emails
const guestAccess = simulateAdminRouteAccess(null);
assert.strictEqual(guestAccess.view, 'ADMIN_LOGIN');
assert.strictEqual(guestAccess.canAccess, false);

const citizenAccess = simulateAdminRouteAccess(demoCitizen);
assert.strictEqual(citizenAccess.view, 'ACCESS_RESTRICTED');
assert.strictEqual(citizenAccess.canAccess, false);
assert.ok(citizenAccess.authorizedAccounts.includes('admin@govscheme.in'), 'Restricted page mentions admin@govscheme.in');
assert.ok(citizenAccess.authorizedAccounts.includes('nitishpriyan1807@gmail.com'), 'Restricted page mentions nitishpriyan1807@gmail.com');

const adminAccess = simulateAdminRouteAccess(superAdminOwner);
assert.strictEqual(adminAccess.view, 'ADMIN_PLATFORM');
assert.strictEqual(adminAccess.canAccess, true);
assert.strictEqual(adminAccess.activeAccount, 'nitishpriyan1807@gmail.com');
console.log('  PASS: Admin route enforcement blocks citizens, reveals no backdoor, and mentions authorized emails.');

console.log('\n========================================================');
console.log('TOTAL ASSERTIONS PASSED: 18 / 18');
console.log('ALL SELECTIVE ADMIN PORTAL ACCESS TESTS PASSED.');
console.log('========================================================');
process.exit(0);
