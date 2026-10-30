/**
 * server/config/adminPolicy.js
 * Authoritative Server-Side Administrator Policy & Role-Based Access Control (RBAC)
 *
 * Enforces:
 * - Server-side administrator email allowlisting via process.env.ADMIN_EMAILS.
 * - Normalized, format-validated email checks with zero credential leakage.
 * - Authoritative MongoDB role verification against approved administrative roles.
 * - Least-privilege permission matrix across system operations.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const DEFAULT_AUTHORIZED_ADMIN_EMAILS = [
  'admin@govscheme.in',
  'nitishpriyan1807@gmail.com'
];

export const VALID_ADMIN_ROLES = [
  'Super Admin',
  'State Admin',
  'Ministry Admin',
  'District Officer',
  'Nodal Officer',
  'Data Entry Operator'
];

/**
 * Returns the normalized, validated list of authorized administrative emails.
 * Merges defaults with process.env.ADMIN_EMAILS while discarding invalid formats.
 */
export const getAuthorizedAdminEmails = () => {
  const envRaw = process.env.ADMIN_EMAILS;
  const configuredList = envRaw
    ? envRaw.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
    : [];

  const validEmails = new Set(DEFAULT_AUTHORIZED_ADMIN_EMAILS.map((e) => e.toLowerCase()));

  for (const rawEmail of configuredList) {
    if (EMAIL_REGEX.test(rawEmail)) {
      validEmails.add(rawEmail);
    } else {
      console.warn('[Security Warning] Discarded malformed email entry in ADMIN_EMAILS configuration.');
    }
  }

  return Array.from(validEmails);
};

/**
 * Validates whether an email belongs to the authorized admin allowlist.
 */
export const isAuthorizedAdminEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const normalized = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(normalized)) return false;
  return getAuthorizedAdminEmails().includes(normalized);
};

/**
 * Checks whether a given role string matches a recognized administrative role.
 */
export const isValidAdminRole = (role) => {
  if (!role || typeof role !== 'string') return false;
  const normalized = role.trim();
  return VALID_ADMIN_ROLES.some((r) => r.toLowerCase() === normalized.toLowerCase());
};

/**
 * Least-Privilege Role & Permission Matrix
 */
export const ROLE_PERMISSIONS = {
  // Citizen data viewing
  VIEW_CITIZENS: [
    'Super Admin',
    'State Admin',
    'Ministry Admin',
    'District Officer',
    'Nodal Officer',
    'Data Entry Operator'
  ],

  // Citizen account status modification (activate / suspend)
  UPDATE_CITIZEN_STATUS: [
    'Super Admin',
    'State Admin',
    'Ministry Admin',
    'District Officer'
  ],

  // Analytics & reporting
  VIEW_ANALYTICS: [
    'Super Admin',
    'State Admin',
    'Ministry Admin',
    'District Officer',
    'Nodal Officer'
  ],

  // System audit logs
  VIEW_AUDIT_LOGS: [
    'Super Admin',
    'State Admin',
    'Ministry Admin'
  ],

  // Welfare Scheme authoring
  CREATE_SCHEME: [
    'Super Admin',
    'State Admin',
    'Ministry Admin',
    'Data Entry Operator'
  ],
  UPDATE_SCHEME: [
    'Super Admin',
    'State Admin',
    'Ministry Admin',
    'Data Entry Operator'
  ],
  DELETE_SCHEME: [
    'Super Admin',
    'Ministry Admin'
  ],
  BULK_SCHEME_ACTION: [
    'Super Admin',
    'State Admin',
    'Ministry Admin'
  ],

  // Citizen welfare applications
  VIEW_APPLICATIONS: [
    'Super Admin',
    'State Admin',
    'Ministry Admin',
    'District Officer',
    'Nodal Officer',
    'Data Entry Operator'
  ],
  UPDATE_APPLICATION_STATUS: [
    'Super Admin',
    'State Admin',
    'Ministry Admin',
    'District Officer',
    'Nodal Officer'
  ],

  // Document verification
  VERIFY_DOCUMENTS: [
    'Super Admin',
    'State Admin',
    'Ministry Admin',
    'District Officer',
    'Nodal Officer',
    'Data Entry Operator'
  ]
};

/**
 * Checks if a specific role possesses the requested permission.
 */
export const hasPermission = (role, permission) => {
  if (!role || !permission) return false;
  const allowedRoles = ROLE_PERMISSIONS[permission];
  if (!allowedRoles || !Array.isArray(allowedRoles)) return false;
  return allowedRoles.some((r) => r.toLowerCase() === String(role).trim().toLowerCase());
};

/**
 * Authoritative check: evaluates whether an authenticated MongoDB user record
 * qualifies as an administrator under the project security policy.
 */
export const isAuthorizedAdmin = (user) => {
  if (!user || typeof user !== 'object') return false;
  if (user.isActive === false) return false;

  const role = user.role;
  if (!isValidAdminRole(role)) return false;

  // Super Admin role must strictly match the authorized admin email allowlist
  if (role === 'Super Admin' || String(role).toLowerCase() === 'superadmin') {
    return isAuthorizedAdminEmail(user.email);
  }

  // Other administrative roles must be valid active admin roles
  return true;
};

/**
 * Express middleware to enforce least-privilege permission checks.
 */
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized, authentication required' });
    }

    if (req.user.isActive === false) {
      return res.status(403).json({ success: false, message: 'Your account has been suspended by an administrator.' });
    }

    const userRole = req.user.role;
    if (!hasPermission(userRole, permission)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role "${userRole}" is not authorized for permission: ${permission}`
      });
    }

    next();
  };
};
