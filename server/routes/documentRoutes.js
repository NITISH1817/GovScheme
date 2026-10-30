import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import rateLimit from 'express-rate-limit';
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

// Dedicated Upload Rate Limiter (Protects against storage exhaustion & DoS)
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 1000 : 40,
  message: {
    success: false,
    message: 'Upload rate limit exceeded. Please wait a few minutes before uploading more documents.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

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

/**
 * File Signature (Magic Bytes) Verification Middleware
 * Never trusts extension or client-reported MIME type alone.
 */
export const validateFileSignature = (req, res, next) => {
  if (!req.file || !req.file.path) {
    return next();
  }

  try {
    const fd = fs.openSync(req.file.path, 'r');
    const buffer = Buffer.alloc(16);
    fs.readSync(fd, buffer, 0, 16, 0);
    fs.closeSync(fd);

    const isPdf = buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46; // %PDF
    const isJpg = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF; // JPEG
    const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47; // PNG

    if (!isPdf && !isJpg && !isPng) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'Security validation failed: File binary signature does not match a valid PDF or image format.'
      });
    }

    next();
  } catch (err) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    return res.status(400).json({
      success: false,
      message: 'Failed to verify file integrity.'
    });
  }
};

// MODULE 11: Document Endpoints for Citizens & Admins
router.post('/upload', protect, uploadLimiter, handleMulterUpload, validateFileSignature, uploadAndProcessDocument);
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
