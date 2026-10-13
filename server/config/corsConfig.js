// server/config/corsConfig.js
/**
 * Production-Hardened CORS Configuration
 * 
 * Strict origin allowlist:
 * - Production: 'https://govhelp.vercel.app' and configured CLIENT_URL
 * - Development: localhost origins only allowed when NODE_ENV !== 'production'
 * - Arbitrary *.vercel.app wildcards and unapproved origins are blocked
 */

export const PRODUCTION_APPROVED_ORIGINS = [
  'https://govhelp.vercel.app',
];

export const DEVELOPMENT_APPROVED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

/**
 * Returns the active allowed origins set for the current environment.
 */
export const getAllowedOrigins = (env = process.env.NODE_ENV) => {
  const allowed = new Set(PRODUCTION_APPROVED_ORIGINS);

  if (process.env.CLIENT_URL) {
    process.env.CLIENT_URL.split(',').forEach((url) => {
      const trimmed = url.trim().replace(/\/+$/, '');
      if (trimmed) allowed.add(trimmed);
    });
  }

  // Permit localhost development origins only when NOT in production
  if (env !== 'production') {
    DEVELOPMENT_APPROVED_ORIGINS.forEach((url) => allowed.add(url));
  }

  return allowed;
};

/**
 * Validates if an incoming request Origin is allowed.
 * - Missing Origin (mobile apps, server-to-server, curl) is permitted.
 * - Explicit allowlist check is performed.
 */
export const isOriginAllowed = (origin, env = process.env.NODE_ENV) => {
  if (!origin) return true;

  const normalizedOrigin = origin.trim().replace(/\/+$/, '');
  const allowed = getAllowedOrigins(env);
  return allowed.has(normalizedOrigin);
};

export const corsOptionsDelegate = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS policy: Not allowed by Access-Control-Allow-Origin'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Disposition'],
};
