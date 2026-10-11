// server/data/verifiedSchemes60.js
// Aggregates all 60 distinct, authoritative Indian government schemes across 8 required categories
// Module 7: Government Scheme Database

import { educationSchemes } from "./schemes_education.js";
import { agricultureSchemes, healthcareSchemes } from "./schemes_agri_health.js";
import { housingSchemes, employmentSchemes, womenChildSchemes } from "./schemes_house_emp_women.js";
import { entrepreneurshipSchemes, financialHelpSchemes } from "./schemes_entrepreneur_finance.js";

export const allVerifiedSchemes = [
  ...educationSchemes,         // 12 schemes
  ...agricultureSchemes,       // 8 schemes
  ...healthcareSchemes,        // 8 schemes
  ...housingSchemes,           // 6 schemes
  ...employmentSchemes,        // 7 schemes
  ...womenChildSchemes,        // 7 schemes
  ...entrepreneurshipSchemes,  // 6 schemes
  ...financialHelpSchemes      // 6 schemes
];

// Integrity Audit and Validation Helper
export function auditSchemesDataset(schemes = allVerifiedSchemes) {
  const totalCount = schemes.length;
  const idSet = new Set();
  const duplicateIds = [];
  const missingSources = [];
  const categoryCounts = {};

  schemes.forEach((s) => {
    // Unique ID check
    if (idSet.has(s.schemeId)) {
      duplicateIds.push(s.schemeId);
    } else {
      idSet.add(s.schemeId);
    }

    // Category count
    categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;

    // Source verification check
    if (!s.sourceUrl || !s.officialWebsite) {
      missingSources.push(s.schemeId);
    }
  });

  return {
    totalSchemes: totalCount,
    uniqueSchemeIds: idSet.size,
    hasDuplicates: duplicateIds.length > 0,
    duplicateIds,
    categoryDistribution: categoryCounts,
    recordsMissingSourceUrls: missingSources.length,
    missingSources,
    isCompliantWithModule7:
      totalCount >= 60 &&
      idSet.size >= 60 &&
      duplicateIds.length === 0 &&
      missingSources.length === 0 &&
      categoryCounts["Education"] >= 12 &&
      categoryCounts["Agriculture"] >= 8 &&
      categoryCounts["Healthcare"] >= 8 &&
      categoryCounts["Housing"] >= 6 &&
      categoryCounts["Employment"] >= 7 &&
      categoryCounts["Women & Child Welfare"] >= 7 &&
      categoryCounts["Entrepreneurship"] >= 6 &&
      categoryCounts["Financial Help"] >= 6
  };
}
