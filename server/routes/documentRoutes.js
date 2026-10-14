import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { 
  uploadAndProcessDocument,
  getUserDocuments,
  getDocumentById,
  downloadUserDocumentFile,
  createManualDocument,
  reprocessDocumentOCR,
  updateDocumentFields,
  verifyDocumentOnDemand,
  deleteUserDocument
} from '../controllers/userDocumentController.js';
import { getDocuments as getAdminDocuments, verifyDocument as updateAdminVerification } from '../controllers/documentController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { auditLog } from '../middleware/auditMiddleware.js';

// Ensure uploads directory exists
const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage with random server-generated filenames for security
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 9)}${ext}`;
    cb(null, safeName);
  }
});

// Strict file type and size validation (max 15MB, JPG/PNG/PDF only)
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Supported file formats: JPG, JPEG, PNG, and PDF.'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  fileFilter
});

const router = express.Router();

const handleMulterUpload = (req, res, next) => {
  upload.single('document')(req, res, (err) => {
    if (err) {
      if (err.name === 'MulterError') {
        return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
      }
      return res.status(400).json({ success: false, message: err.message || 'File upload error.' });
    }
    next();
  });
};

// MODULE 11: Document Endpoints for Citizens & Admins
router.post('/upload', protect, handleMulterUpload, uploadAndProcessDocument);
router.post('/manual', protect, createManualDocument);
router.get('/', protect, (req, res, next) => {
  const adminRoles = ['Super Admin', 'Ministry Admin', 'State Admin', 'District Officer', 'Nodal Officer', 'Data Entry Operator'];
  // If user has an administrative role and requests admin view or filter parameters, return admin verification queue
  if (req.user && adminRoles.includes(req.user.role) && (req.query.adminView === 'true' || req.query.status !== undefined || req.query.type !== undefined)) {
    return getAdminDocuments(req, res, next);
  }
  return getUserDocuments(req, res, next);
});

router.get('/:documentId', protect, getDocumentById);
router.get('/:documentId/file', protect, downloadUserDocumentFile);
router.post('/:documentId/reprocess', protect, reprocessDocumentOCR);
router.patch('/:documentId/fields', protect, updateDocumentFields);
router.post('/:documentId/verify', protect, verifyDocumentOnDemand);
router.delete('/:documentId', protect, deleteUserDocument);

// Admin document verification routes (supports both /:id/verify and legacy /:id/admin-verify)
router.put('/:id/verify', protect, adminOnly, auditLog('VERIFY_DOCUMENT'), updateAdminVerification);
router.put('/:id/admin-verify', protect, adminOnly, auditLog('VERIFY_DOCUMENT'), updateAdminVerification);

export default router;
