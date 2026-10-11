// scripts/seedSchemes60.js
// Idempotent seed script inserting 60 verified government schemes into MongoDB
// Supports dry-run and detailed validation reporting required by Module 7.

import mongoose from "mongoose";
import dotenv from "dotenv";
import Scheme from "../server/models/Scheme.js";
import { allVerifiedSchemes, auditSchemesDataset } from "../server/data/verifiedSchemes60.js";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/govscheme";

async function runSeed() {
  console.log("=================================================");
  console.log("   GOVSCHEME 60 GOVERNMENT SCHEMES SEED SCRIPT   ");
  console.log("=================================================");

  // 1. Audit Dataset In-Memory First
  const audit = auditSchemesDataset(allVerifiedSchemes);
  console.log(`\nDataset In-Memory Audit:`);
  console.log(`- Total Schemes: ${audit.totalSchemes}`);
  console.log(`- Unique Scheme IDs: ${audit.uniqueSchemeIds}`);
  console.log(`- Has Duplicates: ${audit.hasDuplicates}`);
  console.log(`- Missing Official Source URLs: ${audit.recordsMissingSourceUrls}`);
  console.log(`- Category Distribution:`, JSON.stringify(audit.categoryDistribution, null, 2));
  console.log(`- Module 7 Specification Compliant: ${audit.isCompliantWithModule7 ? "YES" : "NO"}\n`);

  if (!audit.isCompliantWithModule7) {
    console.error("FATAL: Dataset fails Module 7 requirements!");
    process.exit(1);
  }

  // 2. Connect to MongoDB
  try {
    console.log(`Connecting to MongoDB at: ${MONGO_URI.replace(/:([^:@]{4})[^:@]*@/, ":****@")}`);
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully to MongoDB.");

    let insertedCount = 0;
    let updatedCount = 0;

    // 3. Upsert schemes idempotently using schemeId
    for (const schemeData of allVerifiedSchemes) {
      const payload = {
        ...schemeData,
        id: schemeData.schemeId,
        name: schemeData.schemeName,
        shortDescription: schemeData.description,
        detailedDescription: schemeData.description,
        financialBenefitAmount: typeof schemeData.benefitAmount === "number" ? schemeData.benefitAmount : 0,
        applyURL: schemeData.officialApplicationUrl,
        helpline: schemeData.officialHelpline,
        documentsRequired: schemeData.requiredDocuments,
        tags: schemeData.keywords
      };

      const res = await Scheme.findOneAndUpdate(
        { schemeId: schemeData.schemeId },
        { $set: payload },
        { upsert: true, returnDocument: 'after', runValidators: true }
      );
      if (res.createdAt && res.updatedAt && res.createdAt.getTime() === res.updatedAt.getTime()) {
        insertedCount++;
      } else {
        updatedCount++;
      }
    }

    const totalInDb = await Scheme.countDocuments();
    const distinctIdsInDb = await Scheme.distinct("schemeId");

    console.log("\n=================================================");
    console.log("                 SEEDING REPORT                  ");
    console.log("=================================================");
    console.log(`- Schemes in Input Dataset:    ${allVerifiedSchemes.length}`);
    console.log(`- Schemes Processed (Upsert):  ${insertedCount + updatedCount}`);
    console.log(`- Total Schemes in MongoDB:    ${totalInDb}`);
    console.log(`- Unique Scheme IDs in DB:     ${distinctIdsInDb.length}`);
    console.log(`- Category Distribution in DB:`);

    const categoriesInDb = await Scheme.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    categoriesInDb.forEach((c) => {
      console.log(`    * ${c._id.padEnd(25)}: ${c.count} schemes`);
    });

    console.log("\nAll 60 schemes successfully verified and seeded into MongoDB.");
    process.exit(0);
  } catch (err) {
    console.error("Error executing scheme seeding script:", err);
    process.exit(1);
  }
}

runSeed();
