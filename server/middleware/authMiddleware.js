import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getJwtSecret } from '../config/jwtConfig.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
      }

      const decoded = jwt.verify(token, getJwtSecret());
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user account not found' });
      }

      if (req.user.isActive === false) {
        return res.status(403).json({ success: false, message: 'Your account has been suspended by an administrator. Please contact support.' });
      }

      return next();
    } catch (error) {
      console.warn('[Auth] Token verification rejected:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  return res.status(401).json({ success: false, message: 'Not authorized, no token' });
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: `Role (${req.user.role}) is not authorized to access this resource` });
    }
    next();
  };
};

export const adminOnly = authorizeRoles(
  'Super Admin', 
  'State Admin', 
  'Ministry Admin', 
  'District Officer', 
  'Data Entry Operator', 
  'Nodal Officer'
);

export const optionalAuth = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      if (token) {
        const decoded = jwt.verify(token, getJwtSecret());
        req.user = await User.findById(decoded.id).select('-password');
      }
    } catch (error) {
      // Ignore token errors for optional auth without throwing
    }
  }
  next();
};
