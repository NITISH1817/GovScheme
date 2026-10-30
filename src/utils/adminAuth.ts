import { UserProfile } from '../types';

/**
 * List of officially authorized administrator email accounts for GovScheme.
 * Includes the official system administrator and project owner/super administrator.
 */
export const DEFAULT_AUTHORIZED_ADMIN_EMAILS: readonly string[] = [
  'admin@govscheme.in',
  'nitishpriyan1807@gmail.com'
];

/**
 * Retrieves all authorized admin emails, merging default admin emails with
 * any configured via the VITE_ADMIN_EMAILS environment variable.
 */
export const getAuthorizedAdminEmails = (): string[] => {
  const envEmails = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_EMAILS
    ? String(import.meta.env.VITE_ADMIN_EMAILS)
    : ''
  )
    .split(',')
    .map((e: string) => e.trim().toLowerCase())
    .filter(Boolean);

  const uniqueEmails = new Set<string>([
    ...DEFAULT_AUTHORIZED_ADMIN_EMAILS.map((e) => e.toLowerCase()),
    ...envEmails
  ]);

  return Array.from(uniqueEmails);
};

/**
 * Checks if a given email is in the authorized admin list.
 */
export const isAuthorizedAdminEmail = (email?: string | null): boolean => {
  if (!email || typeof email !== 'string') return false;
  const normalized = email.trim().toLowerCase();
  return getAuthorizedAdminEmails().includes(normalized);
};

/**
 * Checks if a given role is an official administrative role.
 */
export const isAuthorizedAdminRole = (role?: string | null): boolean => {
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
};

/**
 * Validates whether a given user profile is strictly authorized to view
 * and access the Admin Portal.
 *
 * Ordinary citizens and unauthenticated guests evaluate to false.
 */
export const isAuthorizedAdminUser = (u?: Partial<UserProfile> | null): boolean => {
  if (!u) return false;

  const email = (u.email || '').trim().toLowerCase();
  if (email && isAuthorizedAdminEmail(email)) {
    return true;
  }

  // If role is an authorized administrative role
  if (u.role && isAuthorizedAdminRole(u.role)) {
    return true;
  }

  return false;
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

