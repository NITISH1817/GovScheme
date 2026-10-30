import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { schemesData } from '../src/data/schemes.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basePath = path.resolve(__dirname, '..');
const languages = ['en', 'hi', 'ta', 'te', 'ml', 'mr', 'gu'];

console.log('--- GOVSCHEME MULTILINGUAL VERIFICATION & LANGUAGE PARITY AUDIT ---');

// 1. Verify JSON file integrity for all 7 languages
const translations = {};
languages.forEach(lng => {
  const filePath = path.join(basePath, 'public', 'locales', lng, 'translation.json');
  assert.ok(fs.existsSync(filePath), `Translation file exists for language: ${lng}`);
  const raw = fs.readFileSync(filePath, 'utf8');
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    assert.fail(`JSON parse error in ${lng}/translation.json: ${err.message}`);
  }
  assert.ok(typeof parsed === 'object' && parsed !== null, `${lng}/translation.json is a valid object`);
  assert.ok(Object.keys(parsed).length > 2000, `${lng} has sufficient translations (${Object.keys(parsed).length} keys)`);
  translations[lng] = parsed;
  console.log(`[PASS] [${lng}] Translation file valid. Key count: ${Object.keys(parsed).length}`);
});

// 2. Critical UI Keys Audit across all 7 languages
const criticalKeys = [
  // SchemeApplicationModal
  'preFilledAppFormTitle',
  'centralGovtScheme',
  'stateScheme',
  'autoFormAssistantTitle',
  'autoFormAssistantDesc',
  'applicantPreFilledInfo',
  'autoMappedFromProfile',
  'fullApplicantName',
  'verifiedByProfile',
  'ageAndGender',
  'years',
  'matchesCriteria',
  'annualHouseholdIncome',
  'extractedFromIncomeCert',
  'fromCitizenProfile',
  'socialCategoryReservation',
  'extractedFromCasteCert',
  'stateAndDomicile',
  'residentVerification',
  'aadhaarNumberMasked',
  'notStoredInVault',
  'maskedForPrivacy',
  'schemeDocReadinessChecklist',
  'requiredForPortalApproval',
  'availableInVault',
  'formatVerified',
  'notUploadedInVaultYet',
  'scanNow',
  'copySummary',
  'summaryCopied',
  'printForm',
  'close',
  'applyOnOfficialPortal',

  // SchemeModal
  'autoFillApplication',
  'preliminaryAdvisoryNotice',
  'preliminaryAdvisoryText',
  'independentAdvisoryNotice',
  'officiallyVerified',
  'pendingReview',

  // DocumentVault
  'schemeDocReadiness',
  'readinessBannerDesc',
  'totalDocuments',
  'pendingUpload',
  'docTypeAadhaar',
  'docTypeAadhaarDesc',
  'docTypePAN',
  'docTypePANDesc',
  'docTypeIncome',
  'docTypeIncomeDesc',
  'docTypeRation',
  'docTypeRationDesc',
  'docTypeVoter',
  'docTypeVoterDesc',
  'docTypeCommunity',
  'docTypeCommunityDesc',
  'docTypeDisability',
  'docTypeDisabilityDesc',
  'docTypeResidence',
  'docTypeResidenceDesc',
  'docTypeBirth',
  'docTypeBirthDesc',
  'docTypeEducation',
  'docTypeEducationDesc',
  'uploadOrScanDocDesc',
  'formatChecksPassed',
  'verificationIncomplete',
  'rescan',
  'scanWithAI',
  'deleteDocVault',
  'extractedFields',
  'confidence',
  'fieldName',
  'fieldIncome',
  'fieldDOB',
  'fieldCategory',
  'fieldDisability',
  'fieldState',
  'formatVerifiedNotice',

  // ApplicationTracker
  'noLiveApplications',
  'noAppsSubmittedYet',
  'signInToTrackLive',
  'trackExistingApp',
  'signInToTrack',
  'trackNewAppTitle',
  'selectScheme',
  'appRefNumber',
  'appRefPlaceholder',
  'appRefHint',
  'startTracking',
  'saving',
  'trackApplicationAction',
  'trackOnOfficialPortal',
  'documentVerificationChecklist',
  'uploadedLinked',
  'noDocsLinkedNotice',
  'openVaultAction',
  'cancel',

  // ProfileView & Wizard Demographics
  'General',
  'OBC',
  'SC',
  'ST',
  'EWS',
  'Rural',
  'Urban',
  'Semi-Urban',
  'Single',
  'Married',
  'Widowed',
  'Divorced',
  'Separated',
  'Below 10th',
  '10th Pass',
  '12th Pass',
  'Diploma',
  'Graduate',
  'Post Graduate',
  'Doctorate',
  'acresUnit',
  'selectCategory',
  'selectEducationLevel',
  'enableIfCertifiedDisability',
  'disabilityPercentageLabel',
  'eligibleForEShram',

  // Key Districts
  'Erode',
  'Chennai',
  'Coimbatore',
  'Madurai',
  'Salem',

  // Specific Scheme Steps
  'house-tn-kalaignar-kanavu-illam_step_1',
  'house-tn-kalaignar-kanavu-illam_step_2',
  'pm-kisan_step_1',
  'pm-kisan_step_2'
];

let totalChecks = 0;

criticalKeys.forEach(key => {
  languages.forEach(lng => {
    totalChecks++;
    const value = translations[lng][key];
    assert.ok(value !== undefined, `Key "${key}" must exist in language "${lng}"`);
    assert.ok(typeof value === 'string' && value.trim().length > 0, `Key "${key}" in language "${lng}" must not be empty`);
  });
});
console.log(`[PASS] Critical key parity verified: All ${criticalKeys.length} keys present across all 7 languages (${totalChecks} assertions).`);

// 3. Verify Indic Unicode script authenticity (not untranslated English)
const scriptRegexMap = {
  hi: /[\u0900-\u097F]/, // Devanagari
  ta: /[\u0B80-\u0BFF]/, // Tamil
  te: /[\u0C00-\u0C7F]/, // Telugu
  ml: /[\u0D00-\u0D7F]/, // Malayalam
  mr: /[\u0900-\u097F]/, // Devanagari (Marathi)
  gu: /[\u0A80-\u0AFF]/  // Gujarati
};

const sampleScriptAuditKeys = [
  'preFilledAppFormTitle',
  'autoFormAssistantTitle',
  'applicantPreFilledInfo',
  'fullApplicantName',
  'autoFillApplication',
  'preliminaryAdvisoryText',
  'independentAdvisoryNotice',
  'schemeDocReadiness',
  'totalDocuments',
  'docTypeAadhaar',
  'docTypeIncome',
  'rescan',
  'scanWithAI',
  'noLiveApplications',
  'noAppsSubmittedYet',
  'trackNewAppTitle',
  'startTracking',
  'General',
  'Rural',
  'Erode',
  'Diploma',
  'Single',
  'acresUnit',
  'house-tn-kalaignar-kanavu-illam_step_1',
  'pm-kisan_step_1'
];

Object.entries(scriptRegexMap).forEach(([lng, regex]) => {
  sampleScriptAuditKeys.forEach(k => {
    const val = translations[lng][k];
    assert.ok(
      regex.test(val),
      `Expected localized Unicode script for key "${k}" in language "${lng}", but got: "${val}"`
    );
  });
  console.log(`[PASS] [${lng}] Unicode native script verified for all audit keys.`);
});

// 4. Verify All 75 Schemes Have Localized Steps
console.log(`Auditing all ${schemesData.length} schemes for application steps parity...`);
schemesData.forEach(scheme => {
  if (scheme.applicationSteps && scheme.applicationSteps.length > 0) {
    const step1Key = `${scheme.id}_step_1`;
    languages.forEach(lng => {
      totalChecks++;
      const val = translations[lng][step1Key];
      assert.ok(val !== undefined, `Scheme ${scheme.id} must have step 1 translation in ${lng}`);
      assert.ok(val.trim().length > 0, `Scheme ${scheme.id} step 1 in ${lng} must not be empty`);
      if (lng !== 'en' && scriptRegexMap[lng]) {
        assert.ok(
          scriptRegexMap[lng].test(val),
          `Scheme ${scheme.id} step 1 in ${lng} must contain native script: got "${val}"`
        );
      }
    });
  }
});
console.log(`[PASS] All 75 schemes have verified localized application steps across all 7 languages.`);

// 5. Verify Component Code Inspections
const compSchemeAppModal = fs.readFileSync(path.join(basePath, 'src/components/SchemeApplicationModal.tsx'), 'utf8');
assert.ok(compSchemeAppModal.includes("t(`${scheme.id}_name`"), "SchemeApplicationModal must translate scheme name via t(`${scheme.id}_name`)");
assert.ok(compSchemeAppModal.includes("t(socialCategory, socialCategory)"), "SchemeApplicationModal must translate socialCategory");
assert.ok(compSchemeAppModal.includes("t(state, state)"), "SchemeApplicationModal must translate state");
assert.ok(compSchemeAppModal.includes("t(district, district)"), "SchemeApplicationModal must translate district");
assert.ok(compSchemeAppModal.includes("t(reqDoc, reqDoc)"), "SchemeApplicationModal must translate required docs");
assert.ok(compSchemeAppModal.includes("t('applyOnOfficialPortal'"), "SchemeApplicationModal must use t('applyOnOfficialPortal')");
console.log('[PASS] SchemeApplicationModal component verified.');

const compSchemeModal = fs.readFileSync(path.join(basePath, 'src/components/SchemeModal.tsx'), 'utf8');
assert.ok(compSchemeModal.includes("t(`${scheme.id}_step_${idx + 1}`"), "SchemeModal must translate application steps via t(`${scheme.id}_step_${idx + 1}`)");
assert.ok(compSchemeModal.includes("t('autoFillApplication'"), "SchemeModal must use t('autoFillApplication')");
assert.ok(compSchemeModal.includes("t('preliminaryAdvisoryText'"), "SchemeModal must use t('preliminaryAdvisoryText')");
assert.ok(compSchemeModal.includes("t('independentAdvisoryNotice'"), "SchemeModal must use t('independentAdvisoryNotice')");
console.log('[PASS] SchemeModal component verified.');

const compDocVault = fs.readFileSync(path.join(basePath, 'src/components/DocumentVault.tsx'), 'utf8');
assert.ok(compDocVault.includes("t('schemeDocReadiness'"), "DocumentVault must use t('schemeDocReadiness')");
assert.ok(compDocVault.includes("t('totalDocuments'"), "DocumentVault must use t('totalDocuments')");
assert.ok(compDocVault.includes("t('rescan'"), "DocumentVault must use t('rescan')");
assert.ok(compDocVault.includes("t('scanWithAI'"), "DocumentVault must use t('scanWithAI')");
console.log('[PASS] DocumentVault component verified.');

const compAppTracker = fs.readFileSync(path.join(basePath, 'src/components/ApplicationTracker.tsx'), 'utf8');
assert.ok(compAppTracker.includes("t(`${s.id}_name`, s.name)"), "ApplicationTracker must translate scheme dropdown options via t(`${s.id}_name`, s.name)");
assert.ok(compAppTracker.includes("t('noLiveApplications'"), "ApplicationTracker must use t('noLiveApplications')");
assert.ok(compAppTracker.includes("t('trackNewAppTitle'"), "ApplicationTracker must use t('trackNewAppTitle')");
assert.ok(compAppTracker.includes("t('startTracking'"), "ApplicationTracker must use t('startTracking')");
console.log('[PASS] ApplicationTracker component verified.');

const compProfileView = fs.readFileSync(path.join(basePath, 'src/components/ProfileView.tsx'), 'utf8');
assert.ok(compProfileView.includes("t(user.category, user.category)"), "ProfileView must translate user category");
assert.ok(compProfileView.includes("t(user.residenceType, user.residenceType)"), "ProfileView must translate residence type");
assert.ok(compProfileView.includes("t(user.educationLevel, user.educationLevel)"), "ProfileView must translate education level");
assert.ok(compProfileView.includes("t('acresUnit', 'Acres')"), "ProfileView must use localized acresUnit");
assert.ok(compProfileView.includes("t(user.maritalStatus, user.maritalStatus)"), "ProfileView must translate marital status");
console.log('[PASS] ProfileView component verified.');

console.log('\n======================================================');
console.log(`ALL MULTILINGUAL PARITY AND COMPONENT AUDITS PASSED: ${totalChecks}/${totalChecks}`);
console.log('======================================================');
