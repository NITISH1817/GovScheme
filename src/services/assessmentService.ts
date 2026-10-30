/**
 * src/services/assessmentService.ts
 * Unified Citizen Assessment & Thermal Receipt Service.
 * Connects Citizen Profile -> Rule Engine -> Assessment Results -> (PDF & Thermal Receipt).
 * Ensures 100% data consistency between Assessment Reports and Thermal Receipts.
 */

import { jsPDF } from 'jspdf';
import type { UserProfile, Scheme, RuleEvaluationResult } from '../types/index.ts';
import { evaluateSchemeEligibility } from '../engine/ruleEngine.ts';
import { evaluateExplainableEligibility, PRELIMINARY_DISCLAIMER } from '../engine/explainableEligibility.ts';
import { getMissingProfileFields, calculateProfileCompletion } from '../utils/profileUtils.ts';

export { getMissingProfileFields, calculateProfileCompletion };

export interface EvaluatedSchemeItem {
  scheme: Scheme;
  status: 'Eligible' | 'Conditionally Eligible' | 'Not Eligible';
  matchedCriteria: string[];
  failedCriteria: string[];
  missingRequirements: string[];
  requiredDocuments: string[];
  officialUrl: string;
  benefitSummary: string;
  department: string;
  financialBenefitAmount?: number;
}

export interface CitizenAssessmentResult {
  assessmentId: string;
  assessmentDate: string;
  citizen: {
    fullName: string;
    age?: number;
    gender?: string;
    state: string;
    district?: string;
    occupation: string;
    annualIncome?: number;
    category?: string;
    hasDisability: boolean;
    disabilityPercentage?: number;
    landHoldingAcres?: number;
    profileCompleteness: number;
    missingFields: string[];
    isProfileComplete: boolean;
  };
  statistics: {
    totalEvaluated: number;
    eligibleCount: number;
    conditionallyEligibleCount: number;
    notApplicableCount: number;
    totalRecommendedCount: number; // eligible + conditionally eligible
  };
  recommendedSchemes: EvaluatedSchemeItem[];
  notApplicableSchemes: EvaluatedSchemeItem[];
  allEvaluatedSchemes: EvaluatedSchemeItem[];
  missingDocumentsChecklist: string[];
  disclaimer: string;
}

/**
 * Evaluates citizen eligibility across the entire scheme catalogue.
 * Serves as the single source of truth for Assessment Reports and Thermal Receipts.
 */
export function generateAssessment(user: UserProfile, schemes: Scheme[]): CitizenAssessmentResult {
  const missingFields = getMissingProfileFields(user);
  const completeness = calculateProfileCompletion(user);

  const evaluatedItems: EvaluatedSchemeItem[] = (schemes || []).map((scheme) => {
    const ruleRes = evaluateSchemeEligibility(user, scheme);
    const explainableRes = evaluateExplainableEligibility(user, scheme);

    const isEligible = ruleRes.status === 'Eligible';
    const isCondEligible = ruleRes.status === 'Conditionally Eligible' || ruleRes.status === 'Almost Eligible';

    const normalizedStatus: 'Eligible' | 'Conditionally Eligible' | 'Not Eligible' =
      isEligible ? 'Eligible' : isCondEligible ? 'Conditionally Eligible' : 'Not Eligible';

    const matched = (explainableRes.satisfied || []).map((c: any) => c.reason);
    const failed = (explainableRes.notSatisfied || []).map((c: any) => c.reason);
    const missing = ruleRes.missingDocuments || [];
    const reqDocs = scheme.requiredDocuments || scheme.eligibilityRules?.requiredDocuments || [];

    return {
      scheme,
      status: normalizedStatus,
      matchedCriteria: matched.length > 0 ? matched : ruleRes.matchedCriteria || [],
      failedCriteria: failed.length > 0 ? failed : ruleRes.failedCriteria || [],
      missingRequirements: missing,
      requiredDocuments: reqDocs,
      officialUrl: scheme.officialApplyUrl || scheme.officialWebsite || 'https://www.india.gov.in',
      benefitSummary: scheme.benefitsSummary || scheme.shortDescription || 'Welfare grant assistance',
      department: scheme.department || scheme.ministry || 'Government of India',
      financialBenefitAmount: scheme.financialBenefitAmount
    };
  });

  const recommended = evaluatedItems.filter((item) => item.status === 'Eligible' || item.status === 'Conditionally Eligible');
  const notApplicable = evaluatedItems.filter((item) => item.status === 'Not Eligible');
  const eligibleOnly = evaluatedItems.filter((item) => item.status === 'Eligible');
  const condEligibleOnly = evaluatedItems.filter((item) => item.status === 'Conditionally Eligible');

  // Aggregate missing required documents across recommended schemes
  const userDocs = new Set((user.documents || []).map((d) => (d.documentType || d.type || '').toLowerCase()));
  const allReqDocs = new Set<string>();
  recommended.forEach((item) => {
    item.requiredDocuments.forEach((doc) => {
      const lower = doc.toLowerCase();
      const inVault = userDocs.has(lower) || (lower.includes('aadhaar') && userDocs.has('aadhaar'));
      if (!inVault) allReqDocs.add(doc);
    });
  });

  const now = new Date();
  const dateFormatted = now.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }) + ', ' + now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const assessmentId = `GOV-EVAL-${now.getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  return {
    assessmentId,
    assessmentDate: dateFormatted,
    citizen: {
      fullName: user.fullName || 'Citizen Beneficiary',
      age: user.age,
      gender: user.gender || undefined,
      state: user.state || 'All India',
      district: user.district || undefined,
      occupation: user.occupation || 'Citizen',
      annualIncome: user.annualIncome,
      category: user.category || undefined,
      hasDisability: Boolean(user.hasDisability),
      disabilityPercentage: user.disabilityPercentage,
      landHoldingAcres: user.landHoldingAcres,
      profileCompleteness: completeness,
      missingFields,
      isProfileComplete: missingFields.length === 0
    },
    statistics: {
      totalEvaluated: schemes.length,
      eligibleCount: eligibleOnly.length,
      conditionallyEligibleCount: condEligibleOnly.length,
      notApplicableCount: notApplicable.length,
      totalRecommendedCount: recommended.length
    },
    recommendedSchemes: recommended,
    notApplicableSchemes: notApplicable,
    allEvaluatedSchemes: evaluatedItems,
    missingDocumentsChecklist: Array.from(allReqDocs).slice(0, 8),
    disclaimer: PRELIMINARY_DISCLAIMER
  };
}

/**
 * Formats a clean, compact thermal receipt string supporting 58mm (~32 chars) and 80mm (~48 chars).
 */
export function generateThermalReceiptText(assessment: CitizenAssessmentResult, width: '58mm' | '80mm' = '80mm'): string {
  const lineLength = width === '58mm' ? 32 : 44;
  const sep = '='.repeat(lineLength);
  const subSep = '-'.repeat(lineLength);

  const center = (text: string) => {
    if (text.length >= lineLength) return text.slice(0, lineLength);
    const pad = Math.floor((lineLength - text.length) / 2);
    return ' '.repeat(pad) + text;
  };

  const wrap = (text: string, indent = 0): string[] => {
    const max = lineLength - indent;
    const words = text.split(' ');
    const lines: string[] = [];
    let cur = '';
    words.forEach((w) => {
      if ((cur + ' ' + w).trim().length <= max) {
        cur = (cur + ' ' + w).trim();
      } else {
        if (cur) lines.push(' '.repeat(indent) + cur);
        cur = w;
      }
    });
    if (cur) lines.push(' '.repeat(indent) + cur);
    return lines;
  };

  const lines: string[] = [];

  // Header
  lines.push(sep);
  lines.push(center('GOVSCHEME'));
  lines.push(center('Citizen Scheme Eligibility'));
  lines.push(center('Assessment Receipt'));
  lines.push(subSep);
  lines.push(`Ref: ${assessment.assessmentId}`);
  lines.push(`Date: ${assessment.assessmentDate}`);
  lines.push(subSep);

  // Citizen Information
  lines.push(center('[ CITIZEN PROFILE ]'));
  lines.push(`Name: ${assessment.citizen.fullName}`);
  if (assessment.citizen.age) lines.push(`Age: ${assessment.citizen.age} yrs | Gender: ${assessment.citizen.gender || 'N/A'}`);
  lines.push(`State: ${assessment.citizen.state}${assessment.citizen.district ? ' (' + assessment.citizen.district + ')' : ''}`);
  lines.push(`Occupation: ${assessment.citizen.occupation}`);
  if (assessment.citizen.annualIncome !== undefined) {
    lines.push(`Income: Rs. ${Number(assessment.citizen.annualIncome).toLocaleString('en-IN')}/yr`);
  }
  if (assessment.citizen.category) lines.push(`Category: ${assessment.citizen.category}`);
  if (assessment.citizen.hasDisability) {
    lines.push(`Disability: Yes (${assessment.citizen.disabilityPercentage || 40}%)`);
  }
  lines.push(`Profile Completeness: ${assessment.citizen.profileCompleteness}%`);
  if (!assessment.citizen.isProfileComplete && assessment.citizen.missingFields.length > 0) {
    lines.push(`* Notice: Profile incomplete (${assessment.citizen.missingFields.join(', ')})`);
  }
  lines.push(subSep);

  // Assessment Summary
  lines.push(center('[ ASSESSMENT SUMMARY ]'));
  lines.push(`Total Schemes Evaluated : ${assessment.statistics.totalEvaluated}`);
  lines.push(`Eligible / Recommended  : ${assessment.statistics.totalRecommendedCount}`);
  lines.push(`Not Applicable          : ${assessment.statistics.notApplicableCount}`);
  lines.push(subSep);

  // Recommended Schemes List (Top 5 on compact thermal)
  lines.push(center('[ RECOMMENDED SCHEMES ]'));
  const topSchemes = assessment.recommendedSchemes.slice(0, 6);
  if (topSchemes.length === 0) {
    lines.push('No matching schemes found for current');
    lines.push('profile. Complete all profile attributes');
    lines.push('to discover eligible programmes.');
  } else {
    topSchemes.forEach((item, idx) => {
      wrap(`${idx + 1}. ${item.scheme.name}`, 0).forEach(l => lines.push(l));
      wrap(`Dept: ${item.department}`, 3).forEach(l => lines.push(l));
      if (item.financialBenefitAmount) {
        wrap(`Benefit: Rs. ${item.financialBenefitAmount.toLocaleString('en-IN')}/yr`, 3).forEach(l => lines.push(l));
      } else {
        wrap(`Benefit: ${item.benefitSummary}`, 3).forEach(l => lines.push(l));
      }
      if (item.requiredDocuments.length > 0) {
        wrap(`Docs: ${item.requiredDocuments.slice(0, 3).join(', ')}`, 3).forEach(l => lines.push(l));
      }
      lines.push('');
    });
    if (assessment.recommendedSchemes.length > 6) {
      wrap(`+ ${assessment.recommendedSchemes.length - 6} more schemes online at GovScheme.`, 0).forEach(l => lines.push(l));
    }
  }

  // Documents Required Checklist
  if (assessment.missingDocumentsChecklist.length > 0) {
    lines.push(subSep);
    lines.push(center('[ REQUIRED DOCUMENTS ]'));
    assessment.missingDocumentsChecklist.slice(0, 5).forEach((doc) => {
      wrap(`[ ] ${doc}`, 4).forEach(l => lines.push(l));
    });
  }

  // Footer & Disclaimer
  lines.push(sep);
  lines.push(center('HOW TO APPLY'));
  wrap('Apply via verified portal links on GovScheme or visit your nearest CSC Center with original documents.').forEach(l => lines.push(l));
  lines.push('');
  lines.push(center('Portal: https://govhelp.vercel.app'));
  lines.push(center('Helpline: 1800-11-0001 (Toll-Free)'));
  lines.push(subSep);
  wrap('DISCLAIMER: This receipt is an informational eligibility assessment generated by GovScheme. Final eligibility and approval are determined by the respective government department.').forEach(l => lines.push(l));
  lines.push(sep);
  lines.push('');
  lines.push(''); // Feed margin for tear-off

  return lines.join('\n');
}

/**
 * Generates an authentic A4 PDF assessment report using jsPDF.
 */
export function generateAssessmentPDF(assessment: CitizenAssessmentResult): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // Header Banner
  doc.setFillColor(18, 60, 105); // #123C69 GovScheme Navy
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('GOVSCHEME', 14, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('National Citizen Welfare Discovery & Eligibility Assessment Platform', 14, 18);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(`REPORT REF: ${assessment.assessmentId}`, pageWidth - 14, 12, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${assessment.assessmentDate}`, pageWidth - 14, 18, { align: 'right' });

  y = 36;

  // Title Box
  doc.setTextColor(18, 60, 105);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('CITIZEN SCHEME ELIGIBILITY ASSESSMENT REPORT', 14, y);
  y += 7;

  // Profile Incomplete Notice (if applicable)
  if (!assessment.citizen.isProfileComplete && assessment.citizen.missingFields.length > 0) {
    doc.setFillColor(254, 243, 199); // Amber-100
    doc.setDrawColor(245, 158, 11);
    doc.roundedRect(14, y, pageWidth - 28, 12, 2, 2, 'FD');

    doc.setTextColor(146, 64, 14); // Amber-800
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('NOTICE: LIMITED ASSESSMENT DUE TO INCOMPLETE PROFILE ATTRIBUTES', 18, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Missing fields: ${assessment.citizen.missingFields.join(', ')}. Complete your full profile for 100% scheme discovery.`,
      18,
      y + 9
    );
    y += 16;
  }

  // Citizen Demographics Box
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 30, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Citizen Demographic & Socio-Economic Profile', 18, y + 6);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  const col1X = 18;
  const col2X = 80;
  const col3X = 145;

  doc.text(`Full Name: ${assessment.citizen.fullName}`, col1X, y + 13);
  doc.text(`Age: ${assessment.citizen.age ? `${assessment.citizen.age} Years` : 'Not Specified'}`, col1X, y + 19);
  doc.text(`Gender: ${assessment.citizen.gender || 'Not Specified'}`, col1X, y + 25);

  doc.text(`State: ${assessment.citizen.state}`, col2X, y + 13);
  doc.text(`District: ${assessment.citizen.district || 'Not Specified'}`, col2X, y + 19);
  doc.text(`Social Category: ${assessment.citizen.category || 'General'}`, col2X, y + 25);

  doc.text(`Occupation: ${assessment.citizen.occupation}`, col3X, y + 13);
  doc.text(
    `Annual Income: ${assessment.citizen.annualIncome !== undefined ? `Rs. ${assessment.citizen.annualIncome.toLocaleString('en-IN')}` : 'Not Specified'}`,
    col3X,
    y + 19
  );
  doc.text(`Profile Completeness: ${assessment.citizen.profileCompleteness}%`, col3X, y + 25);

  y += 36;

  // Summary Metrics Badges
  const cardWidth = (pageWidth - 28 - 8) / 3;

  // Eligible Card
  doc.setFillColor(236, 253, 245); // Emerald-50
  doc.setDrawColor(167, 243, 208);
  doc.roundedRect(14, y, cardWidth, 18, 2, 2, 'FD');
  doc.setTextColor(6, 95, 70);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(String(assessment.statistics.totalRecommendedCount), 14 + cardWidth / 2, y + 8, { align: 'center' });
  doc.setFontSize(7.5);
  doc.text('Recommended Schemes', 14 + cardWidth / 2, y + 14, { align: 'center' });

  // Total Evaluated Card
  doc.setFillColor(239, 246, 255); // Blue-50
  doc.setDrawColor(191, 219, 254);
  doc.roundedRect(14 + cardWidth + 4, y, cardWidth, 18, 2, 2, 'FD');
  doc.setTextColor(30, 64, 175);
  doc.setFontSize(14);
  doc.text(String(assessment.statistics.totalEvaluated), 14 + cardWidth + 4 + cardWidth / 2, y + 8, { align: 'center' });
  doc.setFontSize(7.5);
  doc.text('Total Schemes Evaluated', 14 + cardWidth + 4 + cardWidth / 2, y + 14, { align: 'center' });

  // Ineligible Card
  doc.setFillColor(254, 242, 242); // Red-50
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(14 + (cardWidth + 4) * 2, y, cardWidth, 18, 2, 2, 'FD');
  doc.setTextColor(153, 27, 27);
  doc.setFontSize(14);
  doc.text(String(assessment.statistics.notApplicableCount), 14 + (cardWidth + 4) * 2 + cardWidth / 2, y + 8, { align: 'center' });
  doc.setFontSize(7.5);
  doc.text('Not Applicable Schemes', 14 + (cardWidth + 4) * 2 + cardWidth / 2, y + 14, { align: 'center' });

  y += 24;

  // Recommended Schemes Table Section
  doc.setTextColor(18, 60, 105);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Recommended Government Welfare Schemes', 14, y);
  y += 4;

  const schemesToPrint = assessment.recommendedSchemes.slice(0, 7);

  schemesToPrint.forEach((item, index) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, y, pageWidth - 28, 22, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(`${index + 1}. ${item.scheme.name}`, 18, y + 5);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Department: ${item.department} | Category: ${item.scheme.category}`, 18, y + 9.5);

    doc.setTextColor(21, 128, 61); // Green
    doc.setFont('helvetica', 'bold');
    const benefitStr = item.financialBenefitAmount
      ? `Benefit: Rs. ${item.financialBenefitAmount.toLocaleString('en-IN')}/year`
      : `Benefit: ${item.benefitSummary}`;
    doc.text(benefitStr.slice(0, 85), 18, y + 14);

    doc.setTextColor(71, 85, 105);
    doc.setFont('helvetica', 'normal');
    doc.text(`Portal: ${item.officialUrl}`, 18, y + 18.5);

    y += 24;
  });

  // Required Documents Section
  if (assessment.missingDocumentsChecklist.length > 0 && y <= 250) {
    y += 2;
    doc.setTextColor(18, 60, 105);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Document Readiness Checklist (Prepare before applying)', 14, y);
    y += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    const docsStr = assessment.missingDocumentsChecklist.map((d) => `[ ] ${d}`).join('    ');
    doc.text(docsStr, 14, y + 3);
    y += 8;
  }

  // Footer Disclaimer
  const footerY = 278;
  doc.setDrawColor(226, 232, 240);
  doc.line(14, footerY - 2, pageWidth - 14, footerY - 2);

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  const disclaimerLines = doc.splitTextToSize(assessment.disclaimer, pageWidth - 28);
  doc.text(disclaimerLines, 14, footerY + 2);

  return doc;
}
