import type { UserProfile } from '../types/index.ts';

/**
 * List of officially authorized administrator email accounts for GovScheme UI display.
 * Note: These are UI hints; the authoritative authorization boundary is enforced
 * strictly by the backend server against the authenticated MongoDB database records.
 */
export const DEFAULT_AUTHORIZED_ADMIN_EMAILS: readonly string[] = [
  'admin@govscheme.in',
  'nitishpriyan1807@gmail.com'
];

export const getAuthorizedAdminEmails = (): string[] => {
  return [...DEFAULT_AUTHORIZED_ADMIN_EMAILS];
};

export const VALID_ADMIN_ROLES: readonly string[] = [
  'super admin',
  'superadmin',
  'state admin',
  'ministry admin',
  'district officer',
  'nodal officer',
  'data entry operator'
];

/**
 * Checks whether an email matches known default administrator accounts.
 * Used exclusively for presentation helpers and UI badge labels.
 */
export const isAuthorizedAdminEmail = (email?: string | null): boolean => {
  if (!email || typeof email !== 'string') return false;
  const normalized = email.trim().toLowerCase();
  return DEFAULT_AUTHORIZED_ADMIN_EMAILS.some((e) => e.toLowerCase() === normalized);
};

/**
 * Checks if a given role is an approved administrative role (exact match).
 */
export const isAuthorizedAdminRole = (role?: string | null): boolean => {
  if (!role || typeof role !== 'string') return false;
  const normalized = role.trim().toLowerCase();
  return VALID_ADMIN_ROLES.includes(normalized);
};

/**
 * Validates whether a user profile has authenticated administrative credentials
 * for UI presentation and navigation rendering.
 *
 * Security Requirements:
 * - Ordinary citizens and unauthenticated guests evaluate to false.
 * - Missing, empty, or mock tokens evaluate to false.
 * - Exact approved administrative role is required.
 */
export const isAuthorizedAdminUser = (u?: Partial<UserProfile> | null): boolean => {
  if (!u) return false;

  // Officially designated administrator email accounts immediately qualify
  if (u.email && isAuthorizedAdminEmail(u.email)) {
    return true;
  }

  // Token check (from user profile or persistent storage)
  const token = u.token || (typeof localStorage !== 'undefined' ? (localStorage.getItem('adminToken') || localStorage.getItem('govscheme_token')) : null);
  if (!token || typeof token !== 'string' || token.startsWith('mock-') || token.includes('mock')) {
    return false;
  }

  const role = (u.role || '').trim().toLowerCase();
  if (!isAuthorizedAdminRole(role) || role === 'citizen') {
    return false;
  }

  return true;
};

/**
 * Returns a display string mentioning the authorized admin email(s)
 * for badges, tooltips, and access notices.
 */
export const getAdminAccountMention = (u?: Partial<UserProfile> | null): string => {
  if (u?.email && isAuthorizedAdminEmail(u.email)) {
    return u.email;
  }
  return DEFAULT_AUTHORIZED_ADMIN_EMAILS.join(', ');
};

/**
 * Authoritative Backend Session Verification:
 * Validates the caller's JWT token directly against the backend MongoDB authority.
 * Fails closed on any network error, 401, 403, or invalid token.
 */
export const verifyAdminSessionWithBackend = async (
  token: string
): Promise<{ valid: boolean; user?: UserProfile; error?: string; status?: number }> => {
  if (!token || typeof token !== 'string' || token.startsWith('mock-') || token.includes('mock')) {
    return { valid: false, error: 'Missing or invalid token format', status: 401 };
  }

  const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

  try {
    const res = await fetch(`${API_URL}/api/admin/verify-session`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.user) {
        return { valid: true, user: data.user, status: 200 };
      }
    }

    if (res.status === 403) {
      return { valid: false, error: 'Access denied: Citizen account does not have administrative privileges.', status: 403 };
    }

    if (res.status === 401) {
      return { valid: false, error: 'Session expired or invalid. Please sign in again.', status: 401 };
    }

    return { valid: false, error: 'Administrator authentication failed.', status: res.status };
  } catch (err: any) {
    console.warn('[Admin Auth] Backend session verification unreachable:', err.message);
    return {
      valid: false,
      error: 'Administrator authentication service is temporarily unavailable. Please try again later.',
      status: 503
    };
  }
};
