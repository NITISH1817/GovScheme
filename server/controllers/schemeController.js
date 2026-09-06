import Scheme from '../models/Scheme.js';

// @desc    Get all schemes (with advanced filtering & pagination)
// @route   GET /api/schemes
// @access  Public (Citizen) & Private (Admin)
export const getSchemes = async (req, res) => {
  try {
    const { state, category, q, status, department, page = 1, limit = 20, sort = '-createdAt' } = req.query;
    
    let filter = {};
    
    if (req.user && (req.user.role === 'SuperAdmin' || req.user.role === 'NodalOfficer')) {
      if (status && status !== 'All') filter.status = status;
    } else {
      filter.status = 'Published';
    }

    if (state && state !== 'All') {
      filter.$or = [{ state: state }, { state: 'Central' }];
    }
    
    if (category && category !== 'All') {
      filter.category = category;
    }

    if (department && department !== 'All') {
      filter.department = department;
    }

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { shortDescription: { $regex: q, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const schemes = await Scheme.find(filter).sort(sort).skip(skip).limit(limitNum);
    const total = await Scheme.countDocuments(filter);
    
    res.json({ success: true, total, page: pageNum, pages: Math.ceil(total / limitNum), schemes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new scheme
// @route   POST /api/schemes
// @access  Private (Admin)
export const createScheme = async (req, res) => {
  try {
    const schemeData = { ...req.body, id: req.body.id || `SCHEME-${Date.now()}` };
    const newScheme = new Scheme(schemeData);
    await newScheme.save();
    
    if (req.app.get('io')) {
      req.app.get('io').emit('SCHEME_CREATED', { scheme: newScheme });
    }
    
    res.status(201).json({ success: true, scheme: newScheme });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update a scheme (also handles publish, archive, duplicate via body)
// @route   PUT /api/schemes/:id
// @access  Private (Admin)
export const updateScheme = async (req, res) => {
  try {
    let updated = await Scheme.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).catch(() => null);
    if (!updated) {
      updated = await Scheme.findOneAndUpdate({ id: req.params.id }, req.body, { new: true, runValidators: true });
    }
    
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Scheme not found' });
    }
    
    if (req.app.get('io')) {
      req.app.get('io').emit('SCHEME_UPDATED', { scheme: updated });
      if (updated.status === 'Published') {
        req.app.get('io').emit('SCHEME_PUBLISHED', { scheme: updated });
      }
    }
    
    res.json({ success: true, scheme: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete a scheme
// @route   DELETE /api/schemes/:id
// @access  Private (Admin)
export const deleteScheme = async (req, res) => {
  try {
    let deleted = await Scheme.findByIdAndDelete(req.params.id).catch(() => null);
    if (!deleted) {
      deleted = await Scheme.findOneAndDelete({ id: req.params.id });
    }
    
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Scheme not found' });
    }
    
    if (req.app.get('io')) {
      req.app.get('io').emit('SCHEME_DELETED', { schemeId: req.params.id });
    }
    
    res.json({ success: true, message: 'Scheme deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Duplicate a scheme
// @route   POST /api/schemes/:id/duplicate
// @access  Private (Admin)
export const duplicateScheme = async (req, res) => {
  try {
    let original = await Scheme.findById(req.params.id).catch(() => null);
    if (!original) original = await Scheme.findOne({ id: req.params.id });
    if (!original) return res.status(404).json({ success: false, message: 'Scheme not found' });
    
    const copy = original.toObject();
    delete copy._id;
    copy.id = `SCHEME-${Date.now()}`;
    copy.name = `${copy.name} (Copy)`;
    copy.status = 'Draft';

    const newScheme = await Scheme.create(copy);
    
    if (req.app.get('io')) {
      req.app.get('io').emit('SCHEME_CREATED', { scheme: newScheme });
    }
    
    res.status(201).json({ success: true, scheme: newScheme });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Bulk operations on schemes
// @route   POST /api/schemes/bulk
// @access  Private (Admin)
export const bulkSchemeAction = async (req, res) => {
  const { ids, action } = req.body;
  if (!ids?.length || !action) {
    return res.status(400).json({ success: false, message: 'ids and action required' });
  }
  try {
    const filter = { $or: [{ _id: { $in: ids } }, { id: { $in: ids } }] };
    
    if (action === 'delete') {
      await Scheme.deleteMany(filter);
    } else if (action === 'publish') {
      await Scheme.updateMany(filter, { status: 'Published' });
    } else if (action === 'archive') {
      await Scheme.updateMany(filter, { status: 'Archived' });
    } else if (action === 'draft') {
      await Scheme.updateMany(filter, { status: 'Draft' });
    } else {
      return res.status(400).json({ success: false, message: 'Unknown action' });
    }
    
    if (req.app.get('io')) {
      req.app.get('io').emit('SCHEMES_BULK_UPDATED', { ids, action });
    }
    
    res.json({ success: true, message: `Bulk ${action} completed for ${ids.length} schemes` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
import fs from 'fs';

// @desc    Bulk Import schemes from CSV
// @route   POST /api/schemes/bulk-import
// @access  Private (Admin)
export const bulkImportSchemes = async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

  try {
    const csvData = fs.readFileSync(req.file.path, 'utf8');
    const lines = csvData.split('\n').map(l => l.trim()).filter(l => l);
    if (lines.length < 2) return res.status(400).json({ success: false, message: 'Invalid CSV' });

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const schemes = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const scheme = { id: `SCHEME-${Date.now()}-${i}`, status: 'Draft' };
      headers.forEach((header, index) => {
        if (header.toLowerCase() === 'name') scheme.name = values[index];
        if (header.toLowerCase() === 'department') scheme.department = values[index];
        if (header.toLowerCase() === 'state') scheme.state = values[index];
        if (header.toLowerCase() === 'category') scheme.category = values[index];
      });
      // Set defaults for required fields
      if (!scheme.name) scheme.name = `Imported Scheme ${i}`;
      scheme.shortDescription = 'Imported from CSV';
      scheme.details = { fullDescription: 'Imported' };
      schemes.push(scheme);
    }

    const inserted = await Scheme.insertMany(schemes);
    fs.unlinkSync(req.file.path); // Cleanup

    if (req.app.get('io')) {
      req.app.get('io').emit('SCHEMES_BULK_UPDATED', { ids: inserted.map(s => s._id), action: 'import' });
    }

    res.status(201).json({ success: true, count: inserted.length, message: 'Import successful' });
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: error.message });
  }
};
import { evaluateEligibility } from '../services/eligibilityEngine.js';

// @desc    Evaluate scheme eligibility for a user
// @route   POST /api/schemes/:id/evaluate
// @access  Private (Citizen)
export const evaluateUserEligibility = async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) {
      return res.status(404).json({ success: false, message: 'Scheme not found' });
    }
    
    // Use user profile from req.user
    const userProfile = req.user.profile || {};
    
    const result = evaluateEligibility({
      age: userProfile.age,
      annualIncome: userProfile.annualIncome,
      gender: userProfile.gender,
      category: userProfile.category,
      disability: userProfile.disability,
      landOwnership: userProfile.landOwnership
    }, scheme);

    res.json({ success: true, evaluation: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
