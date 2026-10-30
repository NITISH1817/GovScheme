import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getJwtSecret } from '../config/jwtConfig.js';
import { isValidAdminRole, requirePermission, ROLE_PERMISSIONS } from '../config/adminPolicy.js';

export { requirePermission, ROLE_PERMISSIONS };

/**
 * Verifies the incoming Bearer JWT against the centralized secret.
 * Rejects mock, expired, forged, or missing tokens, and retrieves the
 * authoritative user record from MongoDB.
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      if (!token || typeof token !== 'string') {
        return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
      }

      // Explicitly reject any mock token attempts
      if (token.startsWith('mock-') || token.includes('mock')) {
        return res.status(401).json({ success: false, message: 'Not authorized, mock tokens are forbidden' });
      }

      const decoded = jwt.verify(token, getJwtSecret());
      if (!decoded || !decoded.id) {
        return res.status(401).json({ success: false, message: 'Not authorized, invalid token payload' });
      }

      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user account not found' });
      }

      if (req.user.isActive === false) {
        return res.status(403).json({ success: false, message: 'Your account has been suspended by an administrator. Please contact support.' });
      }

      return next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Session expired, please sign in again' });
      }
      return res.status(401).json({ success: false, message: 'Not authorized, token verification failed' });
    }
  }

  return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
};

/**
 * Enforces role-based authorization using the authoritative database record.
 */
export const authorizeRoles = (...roles) => {
  const normalizedAllowed = roles.map((r) => r.toLowerCase().trim());
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized, authentication required' });
    }
    const currentRole = String(req.user.role || '').toLowerCase().trim();
    if (!normalizedAllowed.includes(currentRole)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Role (${req.user.role}) is not authorized to access this resource`
      });
    }
    next();
  };
};

/**
 * Restricts access to users holding an approved administrative role.
 * Ordinary citizens receive HTTP 403 Forbidden.
 */
export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authorized, authentication required' });
  }

  if (req.user.isActive === false) {
    return res.status(403).json({ success: false, message: 'Your account has been suspended by an administrator.' });
  }

  const role = req.user.role;
  if (!isValidAdminRole(role) || String(role).toLowerCase() === 'citizen') {
    return res.status(403).json({
      success: false,
      message: `Access denied. Role (${role}) is not authorized to access administrative resources`
    });
  }

  next();
};

export const optionalAuth = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      if (token && !token.startsWith('mock-')) {
        const decoded = jwt.verify(token, getJwtSecret());
        req.user = await User.findById(decoded.id).select('-password');
      }
    } catch {
      // Ignore token errors for optional auth without throwing
    }
  }
  next();
};
