import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Scheme from '../server/models/Scheme.js';
import fs from 'fs';
import path from 'path';

dotenv.config();

export function loadCanonicalSchemes() {
  const rawCode = fs.readFileSync('src/data/schemes.ts', 'utf8');
  const jsCode = rawCode
    .replace("import type { Scheme } from '../types';", '')
    .replace('export const schemesData: Scheme[] =', 'const schemesData =');
  const fn = new Function(jsCode + '; return schemesData;');
  return fn();
}

export function buildSchemePayload(s) {
  const er = s.eligibilityRules || {};
  const minAge = er.minAge ?? 0;
  const maxAge = er.maxAge ?? 120;
  const maxIncome = er.maxAnnualIncome ?? null;

  return {
    schemeId: s.id,
    id: s.id,
    schemeName: s.name,
    name: s.name,
    description: s.shortDescription,
    shortDescription: s.shortDescription,
    detailedDescription: s.benefitsSummary,
    department: s.department,
    ministry: s.ministry || '',
    category: s.category,
    state: s.state,
    governmentLevel: s.state === 'All' ? 'Central' : 'State',
    benefits: s.benefitsSummary,
    benefitsSummary: s.benefitsSummary,
    benefitAmount: s.financialBenefitAmount || '',
    financialBenefitAmount: s.financialBenefitAmount || '',
    benefitFrequency: 'As needed',

    // Top-level structured eligibility fields
    minimumAge: minAge,
    maximumAge: maxAge,
    incomeLimit: maxIncome,
    eligibleOccupations: er.allowedOccupations || [],
    genderRequirements: er.allowedGenders || ['All'],
    applicableSocialCategories: er.allowedCategories || ['All'],
    disabilityRequirements: er.disabilityRequired ? 'Yes' : 'All',
    studentRequirements: s.category === 'Education' || (er.allowedOccupations && er.allowedOccupations.includes('Student')) ? 'Yes' : 'No',
    farmerRequirements: s.category === 'Agriculture' || (er.allowedOccupations && er.allowedOccupations.some(o => /farmer|cultivator/i.test(o))) ? 'Yes' : 'No',
    residenceRequirements: s.state === 'All' ? 'Citizen of India' : `Resident of ${s.state}`,

    // Complete canonical nested eligibilityRules block
    eligibilityRules: {
      ...er,
      minAge: minAge,
      maxAge: maxAge,
      ageMin: minAge,
      ageMax: maxAge,
      incomeLimit: maxIncome ?? 0,
      maxAnnualIncome: maxIncome,
      allowedOccupations: er.allowedOccupations || [],
      allowedGenders: er.allowedGenders || ['All'],
      allowedCategories: er.allowedCategories || ['All'],
      allowedStates: er.allowedStates || (s.state === 'All' ? ['All'] : [s.state]),
      disabilityRequired: Boolean(er.disabilityRequired),
      maxLandHoldingAcres: er.maxLandHoldingAcres ?? 999
    },

    requiredDocuments: s.requiredDocuments || [],
    documentsRequired: s.requiredDocuments || [],
    applicationSteps: s.applicationSteps || [],
    officialWebsite: s.officialWebsite || '',
    officialApplicationUrl: s.officialApplyUrl || s.officialWebsite || '',
    officialApplyUrl: s.officialApplyUrl || s.officialWebsite || '',
    applyURL: s.officialApplyUrl || s.officialWebsite || '',
    officialHelpline: s.helplineNumber || '',
    helpline: s.helplineNumber || '',
    sourceUrl: s.officialWebsite || 'https://www.india.gov.in',
    status: 'Published',
    activeStatus: true,
    verificationStatus: 'Verified',
    keywords: s.tags || [],
    tags: s.tags || [],
    faqs: s.faqs || []
  };
}

export async function syncMongo({ mongoUri, dryRun = false, quiet = false } = {}) {
  const uri = mongoUri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/govscheme';
  
  const shouldDisconnect = mongoose.connection.readyState === 0;
  if (shouldDisconnect) {
    if (!quiet) console.log('Connecting to MongoDB...');
    await mongoose.connect(uri);
    if (!quiet) console.log('Connected to MongoDB successfully.');
  }

  const schemes = loadCanonicalSchemes();
  const canonicalIds = schemes.map(s => s.id);

  if (!quiet) {
    console.log(`[Sync Engine] Loaded ${schemes.length} canonical schemes from src/data/schemes.ts.`);
    if (dryRun) {
      console.log('[DRY-RUN MODE ACTIVATED] No modifications will be written to the database.');
    }
  }

  let updatedCount = 0;
  let insertedCount = 0;
  const dryRunDetails = [];
  const updatedDocs = [];
  const insertedDocs = [];

  for (const s of schemes) {
    const existing = await Scheme.findOne({ $or: [{ schemeId: s.id }, { id: s.id }] });
    const payload = buildSchemePayload(s);

    if (existing) {
      updatedCount++;
      dryRunDetails.push({
        id: s.id,
        action: 'UPDATE',
        existingStatus: existing.status,
        newStatus: 'Published',
        existingMongoId: existing._id
      });
      if (!dryRun) {
        await Scheme.findOneAndUpdate(
          { _id: existing._id },
          { $set: payload },
          { returnDocument: 'after' }
        );
        updatedDocs.push({ _id: String(existing._id), id: s.id });
      }
    } else {
      insertedCount++;
      dryRunDetails.push({
        id: s.id,
        action: 'INSERT',
        existingStatus: null,
        newStatus: 'Published'
      });
      if (!dryRun) {
        const created = await Scheme.create(payload);
        insertedDocs.push({ _id: String(created._id), id: s.id });
      }
    }
  }

  // Check and report non-canonical schemes (which remain strictly untouched)
  const nonCanonicalSchemes = await Scheme.find({
    id: { $nin: canonicalIds },
    schemeId: { $nin: canonicalIds }
  });

  const totalInDb = await Scheme.countDocuments();
  const publishedInDb = await Scheme.countDocuments({ status: 'Published' });

  let manifestPath = null;
  if (!dryRun) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const targetDir = path.resolve('backups');
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    manifestPath = path.join(targetDir, `sync_manifest_${timestamp}.json`);
    const manifestData = {
      timestamp: new Date().toISOString(),
      canonicalCount: schemes.length,
      updatedCount: updatedDocs.length,
      insertedCount: insertedDocs.length,
      updatedDocs,
      insertedDocs
    };
    fs.writeFileSync(manifestPath, JSON.stringify(manifestData, null, 2), 'utf8');
  }

  if (!quiet) {
    console.log('\n--- Sync Execution Summary ---');
    console.log(`Canonical Schemes Processed: ${schemes.length}`);
    console.log(`Schemes to Update:          ${updatedCount}`);
    console.log(`Schemes to Insert:          ${insertedCount}`);
    console.log(`Non-Canonical Schemes Left Untouched: ${nonCanonicalSchemes.length}`);
    if (nonCanonicalSchemes.length > 0) {
      console.log('Untouched non-canonical IDs:', nonCanonicalSchemes.map(s => `${s.id || s.schemeId} (Status: ${s.status})`));
    }
    console.log(`Total Schemes in DB:        ${totalInDb}`);
    console.log(`Published Schemes in DB:    ${publishedInDb}`);
    if (manifestPath) {
      console.log(`Sync Manifest Generated:    ${manifestPath}`);
    }
  }

  if (shouldDisconnect) {
    await mongoose.disconnect();
  }

  return {
    success: true,
    dryRun,
    canonicalCount: schemes.length,
    updatedCount,
    insertedCount,
    untouchedCount: nonCanonicalSchemes.length,
    totalInDb,
    publishedInDb,
    manifestPath,
    details: dryRunDetails
  };
}

const isDirectCli = process.argv[1] && (
  process.argv[1].endsWith('sync_mongodb_75.js') || 
  process.argv[1].endsWith('sync_mongodb_75')
);

if (isDirectCli) {
  const isDryRun = process.argv.includes('--dry-run');
  syncMongo({ dryRun: isDryRun })
    .then(() => process.exit(0))
    .catch(err => {
      console.error('Mongo sync error:', err);
      process.exit(1);
    });
}
