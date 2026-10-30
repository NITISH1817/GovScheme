import express from 'express';
import { getUsers, getCitizenDetails, updateUserStatus } from '../controllers/userController.js';
import { getDashboardAnalytics } from '../controllers/analyticsController.js';
import { protect, adminOnly, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes under /api/admin strictly require valid authentication and an approved administrative role
router.use(protect, adminOnly);

/**
 * GET /api/admin/verify-session
 * Validates the caller's JWT against the database user record and returns authoritative admin profile.
 */
router.get('/verify-session', (req, res) => {
  res.json({
    success: true,
    authenticated: true,
    user: {
      id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      role: req.user.role,
      isActive: req.user.isActive
    }
  });
});

/**
 * GET /api/admin/citizens
 * Paginated list of citizens with search and filters
 */
router.get('/citizens', getUsers);

/**
 * GET /api/admin/citizens/:id
 * Authorized citizen profile details with applications and documents
 */
router.get('/citizens/:id', getCitizenDetails);

/**
 * PUT /api/admin/citizens/:id/status
 * Activate or suspend a citizen account (Excludes Data Entry Operators & Nodal Officers)
 */
router.put(
  '/citizens/:id/status',
  authorizeRoles('Super Admin', 'State Admin', 'Ministry Admin', 'District Officer'),
  updateUserStatus
);

/**
 * GET /api/admin/analytics
 * Platform analytics and metrics derived from actual database records
 */
router.get('/analytics', getDashboardAnalytics);

export default router;
