import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Scheme from '../server/models/Scheme.js';
import fs from 'fs';

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/govscheme';

async function syncMongo() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB successfully.');

  // Read schemesData from schemes.ts
  const rawCode = fs.readFileSync('src/data/schemes.ts', 'utf8');
  const jsCode = rawCode
    .replace("import type { Scheme } from '../types';", '')
    .replace('export const schemesData: Scheme[] =', 'const schemesData =');
  const fn = new Function(jsCode + '; return schemesData;');
  const schemes = fn();

  console.log(`Syncing ${schemes.length} schemes into MongoDB...`);

  let count = 0;
  for (const s of schemes) {
    const payload = {
      schemeId: s.id,
      id: s.id,
      schemeName: s.name,
      name: s.name,
      description: s.shortDescription,
      shortDescription: s.shortDescription,
      detailedDescription: s.benefitsSummary,
      department: s.department,
      ministry: s.ministry,
      category: s.category,
      state: s.state,
      benefits: s.benefitsSummary,
      benefitAmount: s.financialBenefitAmount,
      financialBenefitAmount: s.financialBenefitAmount,
      minimumAge: s.eligibilityRules?.minAge || 0,
      maximumAge: s.eligibilityRules?.maxAge || 120,
      incomeLimit: s.eligibilityRules?.maxAnnualIncome || null,
      eligibleOccupations: s.eligibilityRules?.allowedOccupations || [],
      genderRequirements: s.eligibilityRules?.allowedGenders || ['All'],
      applicableSocialCategories: s.eligibilityRules?.allowedCategories || ['All'],
      requiredDocuments: s.requiredDocuments,
      documentsRequired: s.requiredDocuments,
      applicationSteps: s.applicationSteps,
      officialWebsite: s.officialWebsite,
      officialApplicationUrl: s.officialApplyUrl,
      applyURL: s.officialApplyUrl,
      officialHelpline: s.helplineNumber,
      helpline: s.helplineNumber,
      sourceUrl: s.officialWebsite,
      status: 'Published',
      activeStatus: true,
      verificationStatus: 'Verified',
      keywords: s.tags,
      tags: s.tags,
      faqs: s.faqs
    };

    await Scheme.findOneAndUpdate(
      { $or: [{ schemeId: s.id }, { id: s.id }] },
      { $set: payload },
      { upsert: true, returnDocument: 'after' }
    );
    count++;
  }

  // Also publish any remaining schemes in db
  await Scheme.updateMany({}, { $set: { status: 'Published', activeStatus: true } });

  const total = await Scheme.countDocuments();
  const published = await Scheme.countDocuments({ status: 'Published' });
  console.log(`Synced ${count} schemes.`);
  console.log(`Total in MongoDB: ${total}, Published in MongoDB: ${published}`);

  process.exit(0);
}

syncMongo().catch(err => {
  console.error('Mongo sync error:', err);
  process.exit(1);
});
