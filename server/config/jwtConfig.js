// server/config/jwtConfig.js
/**
 * JWT Security Configuration Module
 * 
 * Enforces production-grade secret management:
 * - Rejects any hardcoded fallback secret across all environments.
 * - Fails fast at server initialization if process.env.JWT_SECRET is missing or empty.
 * - Ensures uniform secret usage between signing and verification without leaking secrets.
 */

export const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || typeof secret !== 'string' || secret.trim().length === 0) {
    throw new Error(
      '[Security Error] JWT_SECRET environment variable is missing or empty. ' +
      'A secure JWT secret key is required for token signing and verification.'
    );
  }
  return secret.trim();
};

export const validateJwtConfig = () => {
  // Validates presence of non-empty secret; throws descriptive error if invalid
  getJwtSecret();
};
