import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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
  assert.ok(Object.keys(parsed).length > 500, `${lng} has sufficient translations (${Object.keys(parsed).length} keys)`);
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

  // ProfileView & Wizard
  'validAgeRequired',
  'genderRequired',
  'locationRequired',
  'incomeRequired',
  'categoryRequired',
  'occupationRequired',
  'profileSavedSuccess',
  'selectGender',
  'selectOccupation',
  'landHoldingAcres',
  'hasDisability',
  'isRegisteredWorker',
  'useGuidedWizard',
  'demographics',
  'residenceType',
  'education',
  'incomeNotSpecified',
  'familySize',
  'members',
  'landlessOrNone',
  'workerStatus',
  'disabilityStatus',
  'none',
  'edit',
  'clickToEdit',
  'citizenAssessmentReport',
  'genReportDesc',
  'exploreWelfareSchemes',
  'schemesInCatalogue',
  'recommendedSchemesDesc',
  'totalSchemesDesc',
  'notApplicableDesc',
  'demographicProfileDetails',
  'editProfileSub',

  // SettingsView
  'language',
  'preferenceSaved',
  'dataManagement',
  'downloadData',
  'download',
  'clearInformation',
  'reset',
  'deleteAccount',
  'delete'
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
  'startTracking'
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

// 4. Verify Component Code Inspections
const compSchemeAppModal = fs.readFileSync(path.join(basePath, 'src/components/SchemeApplicationModal.tsx'), 'utf8');
assert.ok(compSchemeAppModal.includes("t('preFilledAppFormTitle'"), "SchemeApplicationModal must use t('preFilledAppFormTitle')");
assert.ok(compSchemeAppModal.includes("t('autoFormAssistantTitle'"), "SchemeApplicationModal must use t('autoFormAssistantTitle')");
assert.ok(compSchemeAppModal.includes("t('applicantPreFilledInfo'"), "SchemeApplicationModal must use t('applicantPreFilledInfo')");
assert.ok(compSchemeAppModal.includes("t('applyOnOfficialPortal'"), "SchemeApplicationModal must use t('applyOnOfficialPortal')");
assert.ok(!compSchemeAppModal.includes("<span>Apply on Official Portal</span>"), "SchemeApplicationModal must not hardcode 'Apply on Official Portal'");
console.log('[PASS] SchemeApplicationModal component verified.');

const compSchemeModal = fs.readFileSync(path.join(basePath, 'src/components/SchemeModal.tsx'), 'utf8');
assert.ok(compSchemeModal.includes("t('autoFillApplication'"), "SchemeModal must use t('autoFillApplication')");
assert.ok(compSchemeModal.includes("t('preliminaryAdvisoryText'"), "SchemeModal must use t('preliminaryAdvisoryText')");
assert.ok(compSchemeModal.includes("t('independentAdvisoryNotice'"), "SchemeModal must use t('independentAdvisoryNotice')");
assert.ok(!compSchemeModal.includes("GovScheme is an independent citizen advisory portal.\n"), "SchemeModal must not hardcode independent advisory text");
console.log('[PASS] SchemeModal component verified.');

const compDocVault = fs.readFileSync(path.join(basePath, 'src/components/DocumentVault.tsx'), 'utf8');
assert.ok(compDocVault.includes("t('schemeDocReadiness'"), "DocumentVault must use t('schemeDocReadiness')");
assert.ok(compDocVault.includes("t('readinessBannerDesc'"), "DocumentVault must use t('readinessBannerDesc')");
assert.ok(compDocVault.includes("t('totalDocuments'"), "DocumentVault must use t('totalDocuments')");
assert.ok(compDocVault.includes("t('rescan'"), "DocumentVault must use t('rescan')");
assert.ok(compDocVault.includes("t('scanWithAI'"), "DocumentVault must use t('scanWithAI')");
assert.ok(!compDocVault.includes("<span>Scan with AI OCR</span>"), "DocumentVault must not hardcode 'Scan with AI OCR'");
console.log('[PASS] DocumentVault component verified.');

const compAppTracker = fs.readFileSync(path.join(basePath, 'src/components/ApplicationTracker.tsx'), 'utf8');
assert.ok(compAppTracker.includes("t('noLiveApplications'"), "ApplicationTracker must use t('noLiveApplications')");
assert.ok(compAppTracker.includes("t('trackNewAppTitle'"), "ApplicationTracker must use t('trackNewAppTitle')");
assert.ok(compAppTracker.includes("t('startTracking'"), "ApplicationTracker must use t('startTracking')");
assert.ok(compAppTracker.includes("t('appRefPlaceholder'"), "ApplicationTracker must use t('appRefPlaceholder')");
console.log('[PASS] ApplicationTracker component verified.');

console.log('\n======================================================');
console.log(`ALL MULTILINGUAL PARITY AND COMPONENT AUDITS PASSED: ${totalChecks}/${totalChecks}`);
console.log('======================================================');
