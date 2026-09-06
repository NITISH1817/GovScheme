import express from 'express';
import multer from 'multer';
import { getSchemes, createScheme, updateScheme, deleteScheme, duplicateScheme, bulkSchemeAction, bulkImportSchemes, evaluateUserEligibility } from '../controllers/schemeController.js';
import { protect, adminOnly, optionalAuth, authorizeRoles } from '../middleware/authMiddleware.js';
import { auditLog } from '../middleware/auditMiddleware.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Bulk operations
router.post('/bulk', protect, adminOnly, auditLog('BULK_SCHEME_ACTION'), bulkSchemeAction);
router.post('/bulk-import', protect, adminOnly, upload.single('file'), auditLog('BULK_IMPORT_SCHEMES'), bulkImportSchemes);

// Main CRUD
router.route('/')
  .get(optionalAuth, getSchemes)
  .post(protect, adminOnly, auditLog('CREATE_SCHEME'), createScheme);

router.route('/:id')
  .put(protect, adminOnly, auditLog('UPDATE_SCHEME'), updateScheme)
  .delete(protect, adminOnly, auditLog('DELETE_SCHEME'), deleteScheme);

// Duplicate
router.post('/:id/duplicate', protect, adminOnly, auditLog('DUPLICATE_SCHEME'), duplicateScheme);

// Evaluate eligibility
router.post('/:id/evaluate', protect, authorizeRoles('Citizen'), evaluateUserEligibility);

export default router;
