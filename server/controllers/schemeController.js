import Scheme from '../models/Scheme.js';

// Safe In-Memory LRU/TTL Cache for Public Scheme Catalog
const schemeCache = new Map();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL

export const clearSchemeCache = () => {
  schemeCache.clear();
};

// @desc    Get all schemes (with advanced filtering & pagination)
// @route   GET /api/schemes
// @access  Public (Citizen) & Private (Admin)
export const getSchemes = async (req, res) => {
  try {
    const { state, category, q, status, department, verificationStatus, page = 1, limit = 20, sort = '-createdAt' } = req.query;

    let filter = {};

    const isAdmin = req.user && (
      req.user.role === 'Super Admin' ||
      req.user.role === 'NodalOfficer' ||
      req.user.role === 'Ministry Admin' ||
      req.user.role === 'State Admin' ||
      req.user.role === 'District Officer'
    );

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 20);
    const skip = (pageNum - 1) * limitNum;

    // Check in-memory cache for public queries
    const cacheKey = !isAdmin ? `schemes:${JSON.stringify({
      state: state || 'All',
      category: category || 'All',
      department: department || 'All',
      verificationStatus: verificationStatus || 'All',
      q: (q && typeof q === 'string') ? q.trim() : '',
      page: pageNum,
      limit: limitNum,
      sort: sort || '-createdAt'
    })}` : null;

    if (cacheKey) {
      const cached = schemeCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
        res.set('X-Cache', 'HIT');
        res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
        return res.json(cached.data);
      }
    }

    const conditions = [];

    if (isAdmin) {
      if (status && status !== 'All') filter.status = status;
    } else {
      filter.status = 'Published';
      filter.activeStatus = { $ne: false };
    }

    if (verificationStatus && verificationStatus !== 'All') {
      filter.verificationStatus = verificationStatus;
    }

    if (state && state !== 'All') {
      conditions.push({ $or: [{ state: state }, { state: 'Central' }] });
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (department && department !== 'All') {
      filter.department = department;
    }

    if (q && typeof q === 'string' && q.trim()) {
      const safeQ = q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      conditions.push({
        $or: [
          { name: { $regex: safeQ, $options: 'i' } },
          { schemeName: { $regex: safeQ, $options: 'i' } },
          { shortDescription: { $regex: safeQ, $options: 'i' } },
          { description: { $regex: safeQ, $options: 'i' } },
          { keywords: { $in: [new RegExp(safeQ, 'i')] } }
        ]
      });
    }

    if (conditions.length > 0) {
      filter.$and = conditions;
    }

    // Execute find query and count query concurrently with lean projection
    const [schemes, total] = await Promise.all([
      Scheme.find(filter).sort(sort).skip(skip).limit(limitNum).lean(),
      Scheme.countDocuments(filter)
    ]);

    const responsePayload = {
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      schemes
    };

    if (cacheKey) {
      schemeCache.set(cacheKey, { data: responsePayload, timestamp: Date.now() });
    }

    res.set('X-Cache', 'MISS');
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    res.json(responsePayload);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new scheme
// @route   POST /api/schemes
// @access  Private (Admin)
export const createScheme = async (req, res) => {
  try {
    const schemeData = {
      ...req.body,
      id: req.body.id || `SCHEME-${Date.now()}`,
      status: req.body.status || 'Draft',
      verificationStatus: req.body.verificationStatus || (req.body.officialWebsite ? 'PORTAL_CURATED' : 'PENDING')
    };

    if (schemeData.verificationStatus === 'OFFICIALLY_VERIFIED' && !schemeData.verificationEvidence) {
      return res.status(400).json({
        success: false,
        message: 'Cannot mark scheme as OFFICIALLY_VERIFIED without documented verificationEvidence from issuing authority.'
      });
    }

    const newScheme = new Scheme(schemeData);
    await newScheme.save();
    clearSchemeCache();

    if (updated) {
      clearSchemeCache();
    }

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
    const updateData = { ...req.body };
    if (updateData.benefitsSummary && !updateData.benefits) {
      updateData.benefits = updateData.benefitsSummary;
    } else if (updateData.benefits && !updateData.benefitsSummary) {
      updateData.benefitsSummary = typeof updateData.benefits === 'string' ? updateData.benefits : String(updateData.benefits);
    }
    if (updateData.financialBenefitAmount !== undefined && updateData.benefitAmount === undefined) {
      updateData.benefitAmount = updateData.financialBenefitAmount;
    }
    if (updateData.officialApplyUrl && !updateData.officialApplicationUrl) {
      updateData.officialApplicationUrl = updateData.officialApplyUrl;
    }

    // Role and evidence check for official verification
    if (updateData.verificationStatus === 'OFFICIALLY_VERIFIED' && !updateData.verificationEvidence) {
      // Check if existing record already has evidence
      const existing = await Scheme.findOne({ $or: [{ _id: req.params.id }, { id: req.params.id }] });
      if (!existing || !existing.verificationEvidence) {
        return res.status(400).json({
          success: false,
          message: 'Cannot mark scheme as OFFICIALLY_VERIFIED without documented verificationEvidence from issuing authority.'
        });
      }
    }

    if (updateData.verificationStatus === 'ADMIN_VERIFIED') {
      updateData.verifiedBy = req.user ? req.user._id : undefined;
      updateData.lastVerifiedAt = new Date();
    }

    let updated = await Scheme.findByIdAndUpdate(req.params.id, updateData, { new: true, returnDocument: 'after', runValidators: true }).catch(() => null);
    if (!updated) {
      updated = await Scheme.findOneAndUpdate({ $or: [{ id: req.params.id }, { schemeId: req.params.id }] }, updateData, { new: true, returnDocument: 'after', runValidators: true });
    }

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Scheme not found' });
    }

    if (updated) {
      clearSchemeCache();
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

    if (updated) {
      clearSchemeCache();
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

    if (updated) {
      clearSchemeCache();
    }

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

    if (updated) {
      clearSchemeCache();
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
      const scheme = { id: `SCHEME-${Date.now()}-${i}`, status: 'Published' };
      headers.forEach((header, index) => {
        if (header.toLowerCase() === 'name') scheme.name = values[index];
        if (header.toLowerCase() === 'department') scheme.department = values[index];
        if (header.toLowerCase() === 'state') scheme.state = values[index];
        if (header.toLowerCase() === 'category') scheme.category = values[index];
      });
      // Set defaults for required fields
      if (!scheme.name) scheme.name = `Imported Scheme ${i}`;
      if (!scheme.department) scheme.department = 'General';
      if (!scheme.state) scheme.state = 'All India';
      if (!scheme.category) scheme.category = 'General';

      scheme.shortDescription = 'Imported from CSV';
      scheme.detailedDescription = 'Imported';
      schemes.push(scheme);
    }

    const inserted = await Scheme.insertMany(schemes);
    fs.unlinkSync(req.file.path); // Cleanup

    if (updated) {
      clearSchemeCache();
    }

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
import { recommendSchemesForProfile, normalizeProfile } from '../services/schemeRecommendationEngine.js';
import { schemesData } from '../../src/data/schemes.ts';

// @desc    Get single scheme by ID or schemeId
// @route   GET /api/schemes/:id
// @access  Public / Authenticated
export const getSchemeById = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `scheme:id:${id}`;

    const isAdmin = req.user && (
      req.user.role === 'Super Admin' ||
      req.user.role === 'NodalOfficer' ||
      req.user.role === 'Ministry Admin' ||
      req.user.role === 'State Admin' ||
      req.user.role === 'District Officer'
    );

    if (!isAdmin) {
      const cached = schemeCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
        res.set('X-Cache', 'HIT');
        res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
        return res.json(cached.data);
      }
    }

    let scheme = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      scheme = await Scheme.findById(id).lean();
    }
    if (!scheme) {
      scheme = await Scheme.findOne({ $or: [{ schemeId: id }, { id: id }] }).lean();
    }

    if (!scheme) {
      return res.status(404).json({ success: false, message: 'Scheme not found' });
    }

    if (!isAdmin && (scheme.status !== 'Published' || scheme.activeStatus === false)) {
      return res.status(404).json({ success: false, message: 'Scheme not found or is currently not published' });
    }

    const payload = { success: true, scheme };
    if (!isAdmin) {
      schemeCache.set(cacheKey, { data: payload, timestamp: Date.now() });
    }

    res.set('X-Cache', 'MISS');
    res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=120');
    res.json(payload);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Recommend schemes based on citizen profile attributes
// @route   POST /api/schemes/recommend
// @access  Public or Authenticated Citizen
export const recommendSchemes = async (req, res) => {
  try {
    let rawProfile = req.body.profile;
    if (!rawProfile || Object.keys(rawProfile).length === 0) {
      if (req.body && (req.body.age !== undefined || req.body.annualIncome !== undefined || req.body.income !== undefined || req.body.occupation !== undefined || req.body.state !== undefined)) {
        rawProfile = req.body;
      } else if (req.user && req.user.profile) {
        rawProfile = req.user.profile;
      }
    }
    const profile = normalizeProfile(rawProfile || {});
    const filters = req.body.filters || {};

    // Pull active published schemes (strictly excludes Draft, Suspended, or Inactive schemes)
    let schemes = await Scheme.find({
      status: 'Published',
      activeStatus: { $ne: false }
    });

    if (!schemes || schemes.length === 0) {
      // Only fall back to canonical dataset in local development if the database collection is completely unseeded (0 documents)
      const totalInDb = await Scheme.estimatedDocumentCount().catch(() => 0);
      if (totalInDb === 0) {
        schemes = schemesData.filter(s =>
          (s.status === 'Published' || s.status === undefined) &&
          s.status !== 'Draft' &&
          s.status !== 'Suspended' &&
          s.activeStatus !== false
        );
      }
    }

    const results = recommendSchemesForProfile(schemes, profile, filters);

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Scheme recommendation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

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
