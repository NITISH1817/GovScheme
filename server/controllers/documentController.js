import Document from '../models/Document.js';
import User from '../models/User.js';

// @desc    Get all documents for verification queue
// @route   GET /api/documents
// @access  Private (Admin)
export const getDocuments = async (req, res) => {
  try {
    const { status, type, page = 1, limit = 20, q } = req.query;
    let filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }
    if (type && type !== 'All') {
      filter.type = type;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const documents = await Document.find(filter)
      .populate('userId', 'fullName email mobile profile state')
      .populate('verifiedBy', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Document.countDocuments(filter);

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

// @desc    Update document verification status
// @route   PUT /api/documents/:id/verify
// @access  Private (Admin)
export const verifyDocument = async (req, res) => {
  try {
    const { status, rejectionReason, internalNotes } = req.body;
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    document.status = status || document.status;
    if (status === 'Verified') {
      document.verified = true;
      document.verificationStatus = 'ADMIN_VERIFIED';
    } else if (status === 'Rejected') {
      document.verified = false;
      document.verificationStatus = 'VERIFICATION_FAILED';
    } else if (status === 'Resubmission Requested') {
      document.verified = false;
      document.verificationStatus = 'NEEDS_REVIEW';
    }
    if (rejectionReason !== undefined) document.rejectionReason = rejectionReason;
    if (internalNotes !== undefined) document.internalNotes = internalNotes;
    document.verifiedBy = req.user._id;
    document.verifiedAt = new Date();

    await document.save();

    if (req.app.get('io')) {
      req.app.get('io').emit('DOCUMENT_STATUS_UPDATED', { documentId: document._id, status: document.status });
    }

    res.json({ success: true, document });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
