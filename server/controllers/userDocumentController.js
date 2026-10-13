import fs from 'fs';
import path from 'path';
import Document from '../models/Document.js';
import { extractRawTextFromFile, extractStructuredFields, preprocessDocumentFile } from '../services/ocrEngine.js';
import { verifyGovernmentDocument } from '../services/verificationService.js';

/**
 * POST /api/documents/upload
 * Multi-part upload handler. Creates isolated Document record and runs initial OCR.
 */
export const uploadAndProcessDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please attach a document file (JPG, PNG, or PDF).' });
    }

    const { documentType } = req.body;
    if (!documentType) {
      // Clean up uploaded file if validation fails
      if (req.file.path && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'documentType parameter is required.' });
    }

    // Generate strict unique documentId (DOC-timestamp-random)
    const documentId = `DOC-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const relativeUrl = `/uploads/${req.file.filename}`;

    // Create Document record strictly isolated for the authenticated user
    const document = await Document.create({
      documentId,
      userId: req.user._id,
      documentType,
      type: documentType,
      originalFileName: req.file.originalname,
      fileMimeType: req.file.mimetype,
      fileSize: req.file.size,
      fileUrl: relativeUrl,
      ocrStatus: 'PROCESSING',
      verificationStatus: 'PENDING'
    });

    // Run OCR Processing workflow asynchronously or synchronously
    try {
      await preprocessDocumentFile(req.file.path, req.file.mimetype);
      const ocrResult = await extractRawTextFromFile(req.file.path, req.file.mimetype);
      const structured = extractStructuredFields(ocrResult.rawText, documentType);

      document.rawOcrText = ocrResult.rawText;
      document.extractedFields = structured.fields;
      document.fieldConfidences = structured.confidences;
      document.fieldFlags = structured.flags;
      document.ocrStatus = structured.flags.length > 0 ? 'NEEDS_REVIEW' : 'COMPLETED';
      document.extractedAt = new Date();

      // Automatically run automated format and layout check
      const verificationResult = verifyGovernmentDocument(document, req.file.path);
      document.verificationStatus = verificationResult.verificationStatus;
      document.verificationChecks = verificationResult.verificationChecks;
      document.verificationLimitations = verificationResult.verificationLimitations;
      document.verificationOutcomeReason = verificationResult.verificationOutcomeReason;
      document.verifiedAt = verificationResult.verifiedAt;

      await document.save();

      return res.status(201).json({
        success: true,
        message: 'Document uploaded and processed successfully.',
        document
      });
    } catch (ocrErr) {
      console.error('[OCR Engine Processing Error]:', ocrErr);
      document.ocrStatus = 'FAILED';
      document.verificationStatus = 'INCONCLUSIVE';
      document.verificationOutcomeReason = `OCR engine error: ${ocrErr.message}`;
      await document.save();

      return res.status(201).json({
        success: true,
        message: 'Document uploaded but automated text extraction failed. You may manually enter fields.',
        document
      });
    }
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error('[Upload Document Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/documents
 * Returns all documents owned strictly by the authenticated user with optional pagination and filters.
 */
export const getUserDocuments = async (req, res) => {
  try {
    const { documentType, status, verificationStatus, page = 1, limit = 50 } = req.query;
    const filter = { userId: req.user._id };

    if (documentType && documentType !== 'All') {
      filter.$or = [{ documentType }, { type: documentType }];
    }
    if (status && status !== 'All') {
      filter.status = status;
    }
    if (verificationStatus && verificationStatus !== 'All') {
      filter.verificationStatus = verificationStatus;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [documents, total] = await Promise.all([
      Document.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      Document.countDocuments(filter)
    ]);

    res.json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      documents
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/documents/:documentId
 * Enforces authenticated document ownership. Never trusts user-supplied citizen ID in URL.
 */
export const getDocumentById = async (req, res) => {
  try {
    const docParam = req.params.documentId;
    const document = await Document.findOne({
      userId: req.user._id,
      $or: [{ documentId: docParam }, { _id: docParam.match(/^[0-9a-fA-F]{24}$/) ? docParam : null }]
    });

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found or access denied.' });
    }

    res.json({ success: true, document });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/documents/:documentId/reprocess
 * Reprocesses OCR for the targeted document without affecting any other document.
 */
export const reprocessDocumentOCR = async (req, res) => {
  try {
    const docParam = req.params.documentId;
    const document = await Document.findOne({
      userId: req.user._id,
      $or: [{ documentId: docParam }, { _id: docParam.match(/^[0-9a-fA-F]{24}$/) ? docParam : null }]
    });

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found or access denied.' });
    }

    const physicalPath = path.resolve('uploads', path.basename(document.fileUrl));
    if (!fs.existsSync(physicalPath)) {
      return res.status(400).json({ success: false, message: 'Original upload file no longer available on disk for reprocessing.' });
    }

    document.ocrStatus = 'PROCESSING';
    await document.save();

    const ocrResult = await extractRawTextFromFile(physicalPath, document.fileMimeType);
    const structured = extractStructuredFields(ocrResult.rawText, document.documentType);

    document.rawOcrText = ocrResult.rawText;
    document.extractedFields = structured.fields;
    document.fieldConfidences = structured.confidences;
    document.fieldFlags = structured.flags;
    document.ocrStatus = structured.flags.length > 0 ? 'NEEDS_REVIEW' : 'COMPLETED';
    document.extractedAt = new Date();

    const verificationResult = verifyGovernmentDocument(document, physicalPath);
    document.verificationStatus = verificationResult.verificationStatus;
    document.verificationChecks = verificationResult.verificationChecks;
    document.verificationLimitations = verificationResult.verificationLimitations;
    document.verificationOutcomeReason = verificationResult.verificationOutcomeReason;
    document.verifiedAt = verificationResult.verifiedAt;

    await document.save();

    res.json({
      success: true,
      message: 'Document reprocessed successfully.',
      document
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /api/documents/:documentId/fields
 * Saves user corrections separately from original OCR output.
 */
export const updateDocumentFields = async (req, res) => {
  try {
    const docParam = req.params.documentId;
    const document = await Document.findOne({
      userId: req.user._id,
      $or: [{ documentId: docParam }, { _id: docParam.match(/^[0-9a-fA-F]{24}$/) ? docParam : null }]
    });

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found or access denied.' });
    }

    const { correctedFields } = req.body;
    if (!correctedFields || typeof correctedFields !== 'object') {
      return res.status(400).json({ success: false, message: 'correctedFields payload is required.' });
    }

    // Preserve original OCR output while updating user-corrected fields separately
    document.correctedFields = {
      ...(document.correctedFields || {}),
      ...correctedFields
    };
    document.isUserConfirmed = true;
    document.correctionTimestamp = new Date();

    // Re-check cross consistency with corrected fields
    const physicalPath = path.resolve('uploads', path.basename(document.fileUrl));
    const verificationResult = verifyGovernmentDocument(document, fs.existsSync(physicalPath) ? physicalPath : null);
    document.verificationChecks = verificationResult.verificationChecks;
    document.verificationLimitations = verificationResult.verificationLimitations;
    document.verificationOutcomeReason = verificationResult.verificationOutcomeReason;
    if (verificationResult.verificationStatus !== 'VERIFICATION_FAILED') {
      document.verificationStatus = 'CHECKS_PASSED';
    }

    await document.save();

    res.json({
      success: true,
      message: 'Corrected fields saved successfully without altering raw OCR history.',
      document
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/documents/:documentId/verify
 * Performs on-demand verification checks and returns honest result.
 */
export const verifyDocumentOnDemand = async (req, res) => {
  try {
    const docParam = req.params.documentId;
    const document = await Document.findOne({
      userId: req.user._id,
      $or: [{ documentId: docParam }, { _id: docParam.match(/^[0-9a-fA-F]{24}$/) ? docParam : null }]
    });

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found or access denied.' });
    }

    const physicalPath = path.resolve('uploads', path.basename(document.fileUrl));
    const result = verifyGovernmentDocument(document, fs.existsSync(physicalPath) ? physicalPath : null);

    document.verificationStatus = result.verificationStatus;
    document.verificationChecks = result.verificationChecks;
    document.verificationLimitations = result.verificationLimitations;
    document.verificationOutcomeReason = result.verificationOutcomeReason;
    document.verifiedAt = result.verifiedAt;

    await document.save();

    res.json({
      success: true,
      message: 'Verification evaluation completed.',
      verification: result,
      document
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/documents/:documentId
 * Deletes targeted document and purges physical file.
 */
export const deleteUserDocument = async (req, res) => {
  try {
    const docParam = req.params.documentId;
    const document = await Document.findOne({
      userId: req.user._id,
      $or: [{ documentId: docParam }, { _id: docParam.match(/^[0-9a-fA-F]{24}$/) ? docParam : null }]
    });

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found or access denied.' });
    }

    // Remove physical file from disk
    if (document.fileUrl) {
      const physicalPath = path.resolve('uploads', path.basename(document.fileUrl));
      if (fs.existsSync(physicalPath)) {
        try { fs.unlinkSync(physicalPath); } catch (e) {}
      }
    }

    await Document.deleteOne({ _id: document._id });

    res.json({
      success: true,
      message: 'Document deleted permanently.',
      documentId: document.documentId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/documents/:documentId/file
 * Authenticated document file retrieval with strict ownership checks (SEC-02).
 * Verifies that the requester is either the document owner or an authorized administrator.
 * Anonymous users or unauthorized citizens cannot access or download the file.
 */
export const downloadUserDocumentFile = async (req, res) => {
  try {
    const docParam = req.params.documentId;
    const isAdmin = req.user && ['Super Admin', 'Ministry Admin', 'State Admin'].includes(req.user.role);

    const filter = isAdmin
      ? { $or: [{ documentId: docParam }, { _id: docParam.match(/^[0-9a-fA-F]{24}$/) ? docParam : null }] }
      : {
          userId: req.user._id,
          $or: [{ documentId: docParam }, { _id: docParam.match(/^[0-9a-fA-F]{24}$/) ? docParam : null }]
        };

    const document = await Document.findOne(filter);

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found or access denied.' });
    }

    if (!document.fileUrl) {
      return res.status(404).json({ success: false, message: 'No file associated with this document record.' });
    }

    // Securely extract the file's base name and resolve against the designated uploads directory
    const fileName = path.basename(document.fileUrl);
    const physicalPath = path.resolve('uploads', fileName);

    // Defense in depth: prevent directory traversal
    const uploadsDir = path.resolve('uploads');
    if (!physicalPath.startsWith(uploadsDir)) {
      return res.status(403).json({ success: false, message: 'Forbidden: invalid file path.' });
    }

    if (!fs.existsSync(physicalPath)) {
      return res.status(404).json({ success: false, message: 'Physical document file not found on server.' });
    }

    res.setHeader('Content-Type', document.fileMimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(document.originalFileName || fileName)}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');

    const readStream = fs.createReadStream(physicalPath);
    readStream.pipe(res);
  } catch (error) {
    console.error('[Download Document File Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve document file.' });
  }
};

/**
 * POST /api/documents/manual
 * Creates an authenticated document record for manual entry workflow (DATA-01).
 * Persists directly into MongoDB Document collection.
 */
export const createManualDocument = async (req, res) => {
  try {
    const { documentType, type, docNumber, extractedFields } = req.body;
    const docType = documentType || type;
    if (!docType) {
      return res.status(400).json({ success: false, message: 'documentType parameter is required.' });
    }

    const documentId = `DOC-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    // Create a physical record placeholder file on disk for consistency
    const safeFileName = `doc_manual_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.json`;
    const uploadsDir = path.resolve('uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const physicalPath = path.join(uploadsDir, safeFileName);
    fs.writeFileSync(physicalPath, JSON.stringify({
      documentId,
      userId: req.user._id,
      documentType: docType,
      docNumber: docNumber || '',
      extractedFields: extractedFields || {},
      createdAt: new Date()
    }, null, 2), 'utf8');

    const document = await Document.create({
      documentId,
      userId: req.user._id,
      documentType: docType,
      type: docType,
      originalFileName: `${docType}_manual_record.json`,
      fileMimeType: 'application/json',
      fileSize: fs.statSync(physicalPath).size,
      fileUrl: `/uploads/${safeFileName}`,
      ocrStatus: 'COMPLETED',
      extractedFields: {
        documentNumber: docNumber,
        ...(extractedFields || {})
      },
      verificationStatus: 'PENDING',
      isUserConfirmed: true,
      userConfirmedAt: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Manual document created and persisted successfully.',
      document
    });
  } catch (error) {
    console.error('[Create Manual Document Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
