import mongoose from 'mongoose';
import Application from '../models/Application.js';
import Scheme from '../models/Scheme.js';

export const createApplication = async (req, res) => {
  try {
    const { schemeId, uploadedDocuments, remarks, applicationNumber } = req.body;
    const userId = req.user._id;

    // Verify scheme exists by _id, schemeId, or id
    let scheme = null;
    if (mongoose.Types.ObjectId.isValid(schemeId)) {
      scheme = await Scheme.findById(schemeId);
    }
    if (!scheme) {
      scheme = await Scheme.findOne({ $or: [{ schemeId }, { id: schemeId }] });
    }
    if (!scheme) {
      return res.status(404).json({ success: false, message: 'Scheme not found' });
    }

    // Determine dedicated applicationNumber (if passed or if embedded in remarks)
    let cleanAppNumber = typeof applicationNumber === 'string' && applicationNumber.trim()
      ? applicationNumber.trim().slice(0, 100)
      : undefined;

    if (!cleanAppNumber && remarks && typeof remarks === 'string') {
      const match = remarks.match(/Ack Number:\s*([^\n\r]+)/i);
      if (match && match[1] && match[1].trim()) {
        cleanAppNumber = match[1].trim().slice(0, 100);
      }
    }

    const newApp = await Application.create({
      userId,
      schemeId: scheme._id,
      applicationNumber: cleanAppNumber,
      status: 'Submitted',
      remarks: remarks || 'Application submitted via GovScheme Portal',
      uploadedDocuments: uploadedDocuments || [],
      timeline: [{
        status: 'Submitted',
        remarks: remarks || 'Application submitted by citizen.',
        updatedBy: userId
      }]
    });

    const populated = await Application.findById(newApp._id)
      .populate('schemeId', 'name shortDescription department category officialApplyUrl officialWebsite id schemeId')
      .populate('uploadedDocuments.documentId', 'documentType type docNumber verificationStatus');

    res.status(201).json({ success: true, application: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserApplications = async (req, res) => {
  try {
    const userId = req.user._id;
    const applications = await Application.find({ userId })
      .populate('schemeId', 'name shortDescription department category officialApplyUrl officialWebsite id schemeId')
      .populate('uploadedDocuments.documentId', 'documentType type docNumber verificationStatus')
      .sort('-createdAt');

    res.json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getApplications = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, sort = '-createdAt' } = req.query;
    
    let filter = {};
    if (status && status !== 'All') {
      filter.status = status;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const applications = await Application.find(filter)
      .populate('userId', 'fullName email state category mobile profile')
      .populate('schemeId', 'name department category')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);
      
    const total = await Application.countDocuments(filter);
    
    res.json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      applications
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid application ID format' });
    }

    const { status, remarks, applicationNumber } = req.body;
    const application = await Application.findById(id);
    
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }
    
    application.status = status || application.status;
    application.remarks = remarks || application.remarks;
    if (typeof applicationNumber === 'string' && applicationNumber.trim()) {
      application.applicationNumber = applicationNumber.trim().slice(0, 100);
    }
    application.assignedOfficerId = req.user._id;
    
    application.timeline.push({
      status: application.status,
      remarks: remarks || `Status updated to ${application.status}`,
      updatedBy: req.user._id
    });
    
    await application.save();
    
    if (req.app.get('io')) {
      req.app.get('io').emit('APPLICATION_STATUS_UPDATED', {
        applicationId: application._id,
        status: application.status,
        remarks: application.remarks,
        userId: application.userId
      });
    }

    res.json({ success: true, application });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
