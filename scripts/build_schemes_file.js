import fs from 'fs';
import { allVerifiedSchemes } from '../server/data/verifiedSchemes60.js';
import { newSchemes as expandList } from './expandSchemes.cjs';

// Category standardizer
function standardizeCategory(cat, name = '') {
  const c = (cat || '').toLowerCase();
  const n = (name || '').toLowerCase();
  
  if (n.includes('disability') || n.includes('differently abled') || n.includes('udid') || n.includes('saksham')) return 'Disability Empowerment';
  if (c.includes('education') || n.includes('scholarship') || n.includes('education') || n.includes('fellowship') || n.includes('vidyalaxmi') || n.includes('pragati')) return 'Education & Skill';
  if (c.includes('agri') || c.includes('farmer') || n.includes('kisan') || n.includes('crop') || n.includes('cultivation') || n.includes('soil') || n.includes('matsya') || n.includes('beekeeping') || n.includes('krishi') || n.includes('sinchayee')) return 'Agriculture & Farmers';
  if (c.includes('health') || n.includes('health') || n.includes('medical') || n.includes('indradhanush') || n.includes('arogya') || n.includes('aushadh') || n.includes('dialysis') || n.includes('maternity') || n.includes('tb') || n.includes('tele manas') || n.includes('kaappom') || n.includes('innuyir')) return 'Health & Healthcare';
  if (c.includes('housing') || c.includes('shelter') || n.includes('awas') || n.includes('illam') || n.includes('slum') || n.includes('toilet') || n.includes('bijli') || n.includes('surya ghar') || n.includes('rental housing') || n.includes('svamitva') || n.includes('shelter')) return 'Housing & Shelter';
  if (c.includes('women') || c.includes('child') || n.includes('girl') || n.includes('magalir') || n.includes('kanya') || n.includes('ujjwala') || n.includes('sukanya') || n.includes('vatsalya') || n.includes('marriage') || n.includes('ammaiyar') || n.includes('beti')) return 'Women & Child Welfare';
  if (c.includes('employment') || n.includes('employment') || n.includes('rozgar') || n.includes('mgnrega') || n.includes('kaushal') || n.includes('mudhalvan') || n.includes('apprentice') || n.includes('vishwakarma') || n.includes('unemploy') || n.includes('job seekers')) return 'Employment & Micro Enterprises';
  if (c.includes('pension') || n.includes('pension') || n.includes('old age') || n.includes('maan-dhan') || n.includes('shram yogi')) return 'Pensions & Senior Care';
  if (c.includes('entrepreneur') || n.includes('startup') || n.includes('mudra') || n.includes('pmegp') || n.includes('stand-up') || n.includes('seed fund') || n.includes('food processing') || n.includes('needs')) return 'Financial Inclusion & Credit';
  if (c.includes('financial') || n.includes('bima') || n.includes('credit card') || n.includes('loan') || n.includes('dhan') || n.includes('jeevan jyoti') || n.includes('suraksha bima')) return 'Financial Inclusion & Credit';
  if (c.includes('food') || n.includes('ration') || n.includes('anna') || n.includes('poshan')) return 'Food & Nutrition';

  return 'Financial Inclusion & Credit';
}

const duplicateIdsFromVerified60 = new Set([
  'agri-pm-kisan',
  'house-pmay-gramin',
  'health-ayushman-bharat-pmjay',
  'wc-pm-ujjwala-2-lpg',
  'wc-sukanya-samriddhi-yojana',
  'GOV-FIN-004',
  'emp-pm-vishwakarma',
  'GOV-ENT-003',
  'emp-pm-svanidhi-street-vendor',
  'emp-mgnrega-100-days',
  'edu-post-matric-scholarship',
  'edu-tn-pudhumai-penn',
  'agri-pm-fby-crop-insurance',
  'GOV-FIN-003',
  'GOV-ENT-006'
]);

function convertVerifiedScheme(s) {
  let id = s.id || s.schemeId;
  if (id === 'house-swachh-bharat- ग्रामीण-toilet') {
    id = 'house-swachh-bharat-ihhl-toilet';
  }

  const name = s.name || s.schemeName;
  const category = standardizeCategory(s.category, name);
  
  const validGenders = new Set(['All', 'Female', 'Male', 'Transgender']);
  let allowedGenders = ['All'];
  if (s.genderRequirements) {
    const rawG = Array.isArray(s.genderRequirements) ? s.genderRequirements : [s.genderRequirements];
    const cleaned = [];
    rawG.forEach(g => {
      const lower = String(g).toLowerCase();
      if (lower.includes('all')) cleaned.push('All');
      if (lower.includes('female') || lower.includes('women')) cleaned.push('Female');
      if (lower.includes('male') || lower.includes('men')) cleaned.push('Male');
      if (lower.includes('transgender')) cleaned.push('Transgender');
    });
    allowedGenders = cleaned.length > 0 ? [...new Set(cleaned)] : ['All'];
  }

  const validCats = new Set(['All', 'General', 'OBC', 'SC', 'ST', 'EWS', 'Minority']);
  let allowedCategories = ['All'];
  if (s.applicableSocialCategories) {
    const rawC = Array.isArray(s.applicableSocialCategories) ? s.applicableSocialCategories : [s.applicableSocialCategories];
    const cleaned = [];
    rawC.forEach(c => {
      if (validCats.has(c)) {
        cleaned.push(c);
      } else {
        const lower = String(c).toLowerCase();
        if (lower.includes('all')) cleaned.push('All');
        if (lower.includes('sc')) cleaned.push('SC');
        if (lower.includes('st')) cleaned.push('ST');
        if (lower.includes('obc')) cleaned.push('OBC');
        if (lower.includes('ews')) cleaned.push('EWS');
        if (lower.includes('minority')) cleaned.push('Minority');
        if (lower.includes('general')) cleaned.push('General');
      }
    });
    allowedCategories = cleaned.length > 0 ? [...new Set(cleaned)] : ['All'];
  }

  let allowedStates = ['All'];
  if (s.residenceRequirements?.states) {
    allowedStates = s.residenceRequirements.states;
  } else if (s.state && s.state !== 'Central') {
    allowedStates = [s.state];
  }

  const minAge = typeof s.minimumAge === 'number' ? s.minimumAge : 0;
  const maxAge = typeof s.maximumAge === 'number' ? s.maximumAge : 120;
  const maxAnnualIncome = typeof s.incomeLimit === 'number' ? s.incomeLimit : undefined;
  const allowedOccupations = Array.isArray(s.eligibleOccupations) ? s.eligibleOccupations : [];
  const requiresDisability = !!s.disabilityRequirements?.required || (category === 'Disability Empowerment');
  const reqDocs = s.requiredDocuments || s.documentsRequired || ['Aadhaar Card', 'Bank Passbook'];

  const eligibilityRules = {
    minAge,
    maxAge,
    allowedGenders,
    allowedStates,
    ...(maxAnnualIncome ? { maxAnnualIncome } : {}),
    ...(allowedOccupations.length > 0 ? { allowedOccupations } : {}),
    ...(allowedCategories.length > 0 && !allowedCategories.includes('All') ? { allowedCategories } : {}),
    ...(requiresDisability ? { requiresDisability: true, minDisabilityPercentage: 40 } : {}),
    requiredDocuments: reqDocs
  };

  const shortDescription = s.shortDescription || s.description || '';
  const department = s.department || 'Government Department';
  const ministry = s.ministry || (s.state === 'Tamil Nadu' ? 'Government of Tamil Nadu' : 'Government of India');
  const state = s.state || 'Central';
  let benefitsSummary = s.benefitsSummary || s.benefits || shortDescription;
  if (Array.isArray(benefitsSummary)) {
    benefitsSummary = benefitsSummary.join('. ');
  }
  
  let financialBenefitAmount = 0;
  if (typeof s.benefitAmount === 'number') financialBenefitAmount = s.benefitAmount;
  else if (typeof s.financialBenefitAmount === 'number') financialBenefitAmount = s.financialBenefitAmount;

  const officialApplyUrl = s.officialApplicationUrl || s.applyURL || s.officialWebsite || 'https://india.gov.in';
  const officialWebsite = s.officialWebsite || 'https://india.gov.in';
  const helplineNumber = s.officialHelpline || s.helpline || '1800-115-555';
  const deadline = s.deadline || 'Open All Year';
  const tags = s.keywords || s.tags || [category];
  
  const faqs = s.faqs && s.faqs.length > 0 ? s.faqs : [
    {
      question: `Who can apply for ${name}?`,
      answer: `Eligible Indian citizens meeting criteria (${allowedGenders.join(', ')}, states: ${allowedStates.join(', ')}) can apply.`
    },
    {
      question: `Where can I apply?`,
      answer: `Applications are submitted online at ${officialWebsite} or nearest official Common Service Centre (CSC).`
    }
  ];

  return {
    id,
    name,
    shortDescription,
    department,
    ministry,
    category,
    state,
    benefitsSummary,
    financialBenefitAmount,
    eligibilityRules,
    requiredDocuments: reqDocs,
    applicationSteps: s.applicationSteps && s.applicationSteps.length > 0 ? s.applicationSteps : [
      `Visit official portal: ${officialWebsite}.`,
      "Fill online registration form with personal and Aadhaar details.",
      "Upload required supporting documents.",
      "Submit and track application using reference ID."
    ],
    officialApplyUrl,
    officialWebsite,
    helplineNumber,
    deadline,
    tags,
    faqs,
    lastUpdated: "2026-08-25",
    popularityScore: s.popularityScore || Math.floor(Math.random() * 15) + 84
  };
}

const duplicateIdsFromExpand = new Set([
  'pmmsy-fisheries',
  'pm-ksy-irrigation',
  'pm-kusum-solar-pump',
  'soil-health-card',
  'kisan-credit-card',
  'jan-aushadhi-yojana',
  'national-dialysis-program',
  'nikshay-poshan-yojana',
  'pmay-u-urban-housing',
  'tn-kalignar-kanavu-illam'
]);

function convertExpandScheme(s) {
  const category = standardizeCategory(s.category, s.name);
  return {
    id: s.id,
    name: s.name,
    shortDescription: s.shortDescription,
    department: s.department,
    ministry: s.ministry,
    category,
    state: s.state,
    benefitsSummary: s.benefitsSummary,
    financialBenefitAmount: s.financialBenefitAmount || 0,
    eligibilityRules: {
      minAge: s.eligibilityRules?.minAge ?? 18,
      maxAge: s.eligibilityRules?.maxAge ?? 70,
      allowedGenders: s.eligibilityRules?.allowedGenders || ['All'],
      allowedStates: s.eligibilityRules?.allowedStates || (s.state === 'Central' ? ['All'] : [s.state]),
      ...(s.eligibilityRules?.maxAnnualIncome ? { maxAnnualIncome: s.eligibilityRules.maxAnnualIncome } : {}),
      ...(s.eligibilityRules?.allowedOccupations ? { allowedOccupations: s.eligibilityRules.allowedOccupations } : {}),
      ...(s.eligibilityRules?.allowedCategories ? { allowedCategories: s.eligibilityRules.allowedCategories } : {}),
      requiredDocuments: s.eligibilityRules?.requiredDocuments || s.requiredDocuments
    },
    requiredDocuments: s.requiredDocuments,
    applicationSteps: s.applicationSteps,
    officialApplyUrl: s.officialApplyUrl,
    officialWebsite: s.officialWebsite,
    helplineNumber: s.helplineNumber,
    deadline: s.deadline || "Open All Year",
    tags: s.tags,
    faqs: s.faqs || [
      {
        question: `How to apply for ${s.name}?`,
        answer: `Apply online via ${s.officialWebsite} or through your local district administrative department.`
      }
    ],
    lastUpdated: s.lastUpdated || "2026-08-20",
    popularityScore: s.popularityScore || 85
  };
}

// 1. Read existing schemes from src/data/schemes.ts by reading its code up to the end of array
const existingCode = fs.readFileSync('src/data/schemes.ts', 'utf8');

// Parse the existing 22 schemes from the code
// We can use eval or function wrapper to safely read schemesData
const original22Ids = new Set([
  'pm-kisan', 'pmay-g', 'pmjay-ayushman', 'pm-ujjwala', 'sukanya-samriddhi',
  'nsap-old-age-pension', 'pm-vishwakarma', 'pm-mudra', 'pm-svanidhi', 'mgnrega',
  'post-matric-scholarship', 'tn-pudhumai-penn', 'up-kanya-sumangala', 'telangana-rythu-bandhu',
  'karnataka-gruha-lakshmi', 'igndps-disability-pension', 'pm-fasal-bima', 'atal-pension-yojana',
  'pm-jan-dhan', 'startup-india-seed-fund', 'pm-garib-kalyan-anna', 'udid-disability-scheme'
]);

let existing22 = [];
try {
  const jsCode = existingCode
    .replace("import type { Scheme } from '../types';", '')
    .replace('export const schemesData: Scheme[] =', 'const schemesData =')
    .replace('export const schemesData =', 'const schemesData =');
  const fn = new Function(jsCode + '; return schemesData;');
  existing22 = fn().filter(s => original22Ids.has(s.id));
} catch (e) {
  console.error('Error evaluating existing code:', e);
  process.exit(1);
}

console.log('Successfully extracted existing schemes:', existing22.length);

const list45 = allVerifiedSchemes.filter(s => !duplicateIdsFromVerified60.has(s.schemeId)).map(convertVerifiedScheme);
const list8 = expandList.filter(s => !duplicateIdsFromExpand.has(s.id)).map(convertExpandScheme);

const all75 = [...existing22, ...list45, ...list8];

console.log('Total merged schemes count:', all75.length);

// Verify all IDs are unique
const idSet = new Set();
const dups = [];
all75.forEach(s => {
  if (idSet.has(s.id)) dups.push(s.id);
  idSet.add(s.id);
});

if (dups.length > 0) {
  console.error('Duplicate IDs detected:', dups);
  process.exit(1);
}

console.log('All IDs are completely unique! (' + idSet.size + ' unique schemes)');

// Write src/data/schemes.ts
const fileHeader = `import type { Scheme } from '../types';\n\nexport const schemesData: Scheme[] = ${JSON.stringify(all75, null, 2)};\n`;

fs.writeFileSync('src/data/schemes.ts', fileHeader, 'utf8');
console.log('Successfully wrote src/data/schemes.ts!');

// Output catalog summary
const categoryCounts = {};
all75.forEach(s => {
  categoryCounts[s.category] = (categoryCounts[s.category] || 0) + 1;
});
console.log('\nCategory breakdown across all ' + all75.length + ' schemes:');
Object.entries(categoryCounts).forEach(([cat, count]) => {
  console.log(`  - ${cat.padEnd(35)}: ${count} schemes`);
});
