import type {
  UserProfile,
  Scheme,
  DocumentRecord,
  CriterionStatus,
  DocumentPossessionStatus,
  CriterionEvaluation,
  DocumentReadinessItem,
  ExplainableEligibilityResult,
  RuleEvaluationResult
} from '../types/index.ts';
import { evaluateSchemeEligibility, resolveEducationGroup, EDUCATION_TIER_ORDER } from './ruleEngine.ts';
import i18n from '../i18n.ts';

export const PRELIMINARY_DISCLAIMER =
  'Preliminary Advisory Only: GovScheme provides automated preliminary decision support based on citizen-provided information and available catalogue data. This does not constitute an official government eligibility determination, application approval, or statutory entitlement. Final eligibility and benefit disbursement are determined solely by the competent government authority upon verification of original documents.';

/**
 * Known structured rule keys supported by the rule engine.
 */
const KNOWN_RULE_KEYS = new Set([
  'minAge',
  'maxAge',
  'ageMin',
  'ageMax',
  'allowedGenders',
  'gender',
  'allowedStates',
  'state',
  'maxAnnualIncome',
  'incomeLimit',
  'allowedOccupations',
  'occupation',
  'allowedCategories',
  'category',
  'maxLandHoldingAcres',
  'landOwnershipMax',
  'requiresDisability',
  'disabilityRequired',
  'minDisabilityPercentage',
  'requiredEducation',
  'education',
  'familySizeMax',
  'requiredDocuments',
  'documentsRequired',
  '_id',
  'id'
]);

/**
 * Canonicalizes document names to a stable identifier to reconcile variations across
 * eligibilityRules.requiredDocuments and scheme.requiredDocuments.
 */
export function canonicalizeDocKey(name: string): string {
  if (!name || typeof name !== 'string') return '';
  const clean = name.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();

  if (clean.includes('aadhaar') || clean.includes('aadhar')) return 'aadhaar';
  if (clean.includes('bank passbook') || clean.includes('bank account') || clean.includes('savings bank')) return 'bank_passbook';
  if (clean.includes('income certificate') || clean.includes('income proof')) return 'income_certificate';
  if (clean.includes('caste certificate') || clean.includes('community certificate') || clean.includes('caste')) return 'caste_certificate';
  if (clean.includes('mgnrega') || clean.includes('job card')) return 'mgnrega_job_card';
  if (clean.includes('land record') || clean.includes('land ownership') || clean.includes('khasra') || clean.includes('khata') || clean.includes('patta')) return 'land_record';
  if (clean.includes('disability') || clean.includes('udid')) return 'disability_certificate';
  if (clean.includes('ration') || clean.includes('bpl')) return 'ration_card';
  if (clean.includes('domicile') || clean.includes('nativity') || clean.includes('residence certificate')) return 'domicile_certificate';
  if (clean.includes('pan card') || clean === 'pan') return 'pan_card';
  if (clean.includes('mobile')) return 'mobile_aadhaar';

  return clean.replace(/\s+/g, '_');
}

/**
 * Reconciles document requirements across scheme.eligibilityRules.requiredDocuments
 * and scheme.requiredDocuments, reporting discrepancies transparently.
 */
export function reconcileSchemeDocuments(scheme: Scheme | null | undefined): {
  canonicalDocuments: string[];
  documentItems: Array<{
    id: string;
    displayName: string;
    source: 'catalogue_required' | 'catalogue_rules' | 'both';
  }>;
  conflictDetected: boolean;
  conflictDetails?: string;
} {
  const s = scheme || ({} as Scheme);
  const rules = s.eligibilityRules || {};

  const rawRulesDocs = Array.isArray(rules.requiredDocuments) ? rules.requiredDocuments : [];
  const rawSchemeDocs = Array.isArray(s.requiredDocuments) ? s.requiredDocuments : [];

  const map = new Map<string, { id: string; displayName: string; source: 'catalogue_required' | 'catalogue_rules' | 'both' }>();
  const rulesKeys = new Set<string>();
  const schemeKeys = new Set<string>();

  for (const doc of rawSchemeDocs) {
    if (typeof doc !== 'string' || !doc.trim()) continue;
    const key = canonicalizeDocKey(doc);
    if (!key) continue;
    schemeKeys.add(key);
    map.set(key, {
      id: key,
      displayName: doc.trim(),
      source: 'catalogue_required'
    });
  }

  const omittedFromScheme: string[] = [];
  for (const doc of rawRulesDocs) {
    if (typeof doc !== 'string' || !doc.trim()) continue;
    const key = canonicalizeDocKey(doc);
    if (!key) continue;
    rulesKeys.add(key);

    const existing = map.get(key);
    if (existing) {
      existing.source = 'both';
      // Prefer the more descriptive display name
      if (doc.trim().length > existing.displayName.length) {
        existing.displayName = doc.trim();
      }
    } else {
      omittedFromScheme.push(doc.trim());
      map.set(key, {
        id: key,
        displayName: doc.trim(),
        source: 'catalogue_rules'
      });
    }
  }

  // Conflict detection: documents listed in rules but omitted from general required documents (e.g. pmay-g)
  let conflictDetected = false;
  let conflictDetails: string | undefined;

  if (omittedFromScheme.length > 0 && rawSchemeDocs.length > 0) {
    conflictDetected = true;
    conflictDetails = `Catalogue discrepancy: ${omittedFromScheme.join(', ')} is specified in eligibility criteria but omitted from general required documents. It has been retained for citizen readiness.`;
  }

  // Deterministically sort document entries alphabetically by display name
  const documentItems = Array.from(map.values()).sort((a, b) => a.displayName.localeCompare(b.displayName));
  const canonicalDocuments = documentItems.map(d => d.displayName);

  return {
    canonicalDocuments,
    documentItems,
    conflictDetected,
    conflictDetails
  };
}

/**
 * Evaluates document readiness, distinguishing AVAILABLE (reported or in vault),
 * MISSING (explicitly reported not possessed), and UNCONFIRMED (not yet answered).
 */
export function evaluateDocumentReadiness(
  scheme: Scheme | null | undefined,
  user: UserProfile | null | undefined,
  reportedPossession?: Record<string, DocumentPossessionStatus | boolean | string | null | undefined>
): {
  requiredDocuments: string[];
  availableDocuments: string[];
  missingDocuments: string[];
  unconfirmedDocuments: string[];
  documentItems: DocumentReadinessItem[];
  documentConflictDetected: boolean;
  documentConflictDetails?: string;
} {
  const { canonicalDocuments, documentItems: reconciled, conflictDetected, conflictDetails } = reconcileSchemeDocuments(scheme);

  const u = user || null;
  const vaultDocs = Array.isArray(u?.documents) ? u.documents : [];
  const vaultDocTypes = vaultDocs
    .filter((d): d is DocumentRecord => !!d && typeof d === 'object')
    .map(d => d.documentType || d.type || '')
    .filter(Boolean)
    .map(t => canonicalizeDocKey(t));

  const availableDocuments: string[] = [];
  const missingDocuments: string[] = [];
  const unconfirmedDocuments: string[] = [];
  const documentItems: DocumentReadinessItem[] = [];

  for (const item of reconciled) {
    const rawReported = reportedPossession
      ? reportedPossession[item.id] ?? reportedPossession[item.displayName] ?? reportedPossession[item.displayName.toLowerCase()]
      : undefined;

    let status: DocumentPossessionStatus = 'UNCONFIRMED';
    let possessionReportedByCitizen = false;
    let explanation = '';

    if (rawReported !== undefined && rawReported !== null) {
      possessionReportedByCitizen = true;
      if (rawReported === 'AVAILABLE' || rawReported === true || rawReported === 'yes') {
        status = 'AVAILABLE';
        explanation = i18n.t('docPossessedReported', 'Possession explicitly reported by citizen.');
      } else if (rawReported === 'MISSING' || rawReported === false || rawReported === 'no') {
        status = 'MISSING';
        explanation = i18n.t('docMissingReported', 'Citizen explicitly reported not possessing this document.');
      } else {
        status = 'UNCONFIRMED';
        explanation = i18n.t('docUnconfirmedReported', 'Possession marked as unconfirmed.');
      }
    } else {
      // Check document vault
      const inVault = vaultDocTypes.some(vt => vt === item.id || item.id.includes(vt) || vt.includes(item.id));
      if (inVault) {
        status = 'AVAILABLE';
        possessionReportedByCitizen = false;
        explanation = i18n.t('docInVault', 'Available in citizen Document Vault.');
      } else {
        status = 'UNCONFIRMED';
        possessionReportedByCitizen = false;
        explanation = i18n.t('docNotConfirmed', 'Possession not yet confirmed by citizen.');
      }
    }

    if (status === 'AVAILABLE') availableDocuments.push(item.displayName);
    else if (status === 'MISSING') missingDocuments.push(item.displayName);
    else unconfirmedDocuments.push(item.displayName);

    documentItems.push({
      id: item.id,
      documentName: item.displayName,
      status,
      source: item.source,
      possessionReportedByCitizen,
      explanation
    });
  }

  // Stable sorting by document display name
  documentItems.sort((a, b) => a.documentName.localeCompare(b.documentName));
  availableDocuments.sort((a, b) => a.localeCompare(b));
  missingDocuments.sort((a, b) => a.localeCompare(b));
  unconfirmedDocuments.sort((a, b) => a.localeCompare(b));

  return {
    requiredDocuments: canonicalDocuments,
    availableDocuments,
    missingDocuments,
    unconfirmedDocuments,
    documentItems,
    documentConflictDetected: conflictDetected,
    documentConflictDetails: conflictDetails
  };
}

/**
 * Pure, deterministic explainable eligibility evaluator.
 * Evaluates demographic, geographic, financial, and occupational criteria into
 * strictly distinguished SATISFIED, NOT_SATISFIED, and UNKNOWN states.
 */
export function evaluateExplainableEligibility(
  user: UserProfile | null | undefined,
  scheme: Scheme | null | undefined,
  reportedPossession?: Record<string, DocumentPossessionStatus | boolean | string | null | undefined>
): ExplainableEligibilityResult {
  const u = user || null;
  const s = scheme || ({} as Scheme);
  const rules = s.eligibilityRules || {};

  const satisfied: CriterionEvaluation[] = [];
  const notSatisfied: CriterionEvaluation[] = [];
  const unknown: CriterionEvaluation[] = [];

  // Helper to add in deterministic order
  function recordCriterion(evaluation: CriterionEvaluation) {
    if (evaluation.status === 'SATISFIED') satisfied.push(evaluation);
    else if (evaluation.status === 'NOT_SATISFIED') notSatisfied.push(evaluation);
    else unknown.push(evaluation);
  }

  // 1. Age Evaluation
  const minAge = rules.minAge ?? (rules as any).ageMin;
  const maxAge = rules.maxAge ?? (rules as any).ageMax;
  if (minAge !== undefined || maxAge !== undefined) {
    const finalMin = minAge ?? 0;
    const finalMax = maxAge ?? 120;
    const requiredDesc = `${finalMin} - ${finalMax} years`;

    if (!u || u.age === undefined || u.age === null || isNaN(Number(u.age)) || Number(u.age) <= 0) {
      if (finalMin > 0 || finalMax < 120) {
        recordCriterion({
          id: 'age',
          title: i18n.t('criterionAgeTitle', 'Age Requirement'),
          status: 'UNKNOWN',
          userValueDescription: i18n.t('notSpecifiedInProfile', 'Not specified in profile'),
          requiredValueDescription: requiredDesc,
          reason: i18n.t('ruleAgeUnknown', {
            minAge: finalMin,
            maxAge: finalMax,
            defaultValue: `Age required (${finalMin}-${finalMax} yrs), but age is not specified in profile`
          })
        });
      }
    } else if (Number(u.age) >= finalMin && Number(u.age) <= finalMax) {
      recordCriterion({
        id: 'age',
        title: i18n.t('criterionAgeTitle', 'Age Requirement'),
        status: 'SATISFIED',
        userValueDescription: `${u.age} years`,
        requiredValueDescription: requiredDesc,
        reason: i18n.t('ruleAgeMetDetail', {
          userAge: u.age,
          minAge: finalMin,
          maxAge: finalMax,
          defaultValue: `Age Requirement Met (${u.age} yrs within ${finalMin}-${finalMax} range)`
        })
      });
    } else {
      recordCriterion({
        id: 'age',
        title: i18n.t('criterionAgeTitle', 'Age Requirement'),
        status: 'NOT_SATISFIED',
        userValueDescription: `${u.age} years`,
        requiredValueDescription: requiredDesc,
        reason: i18n.t('ruleAgeFailed', {
          userAge: u.age,
          minAge: finalMin,
          maxAge: finalMax,
          defaultValue: `Age ${u.age} yrs does not satisfy required range (${finalMin}-${finalMax} yrs)`
        })
      });
    }
  }

  // 2. Gender Evaluation
  const allowedGenders = rules.allowedGenders || (rules.gender ? (Array.isArray(rules.gender) ? rules.gender : [rules.gender]) : undefined);
  if (allowedGenders && Array.isArray(allowedGenders) && allowedGenders.length > 0 && !allowedGenders.includes('All')) {
    const targetGenders = allowedGenders.map((g: string) => i18n.t(g, g)).join(', ');

    if (!u || !u.gender || !String(u.gender).trim()) {
      recordCriterion({
        id: 'gender',
        title: i18n.t('criterionGenderTitle', 'Gender Requirement'),
        status: 'UNKNOWN',
        userValueDescription: i18n.t('notSpecifiedInProfile', 'Not specified in profile'),
        requiredValueDescription: targetGenders,
        reason: i18n.t('ruleGenderUnknown', {
          target: targetGenders,
          defaultValue: `Targeted for ${targetGenders} (Gender not specified in profile)`
        })
      });
    } else if (allowedGenders.some((g: string) => g.toLowerCase() === String(u.gender).toLowerCase())) {
      const userGender = i18n.t(u.gender, u.gender);
      recordCriterion({
        id: 'gender',
        title: i18n.t('criterionGenderTitle', 'Gender Requirement'),
        status: 'SATISFIED',
        userValueDescription: userGender,
        requiredValueDescription: targetGenders,
        reason: i18n.t('ruleGenderMet', {
          gender: userGender,
          defaultValue: `Gender requirement met (${userGender})`
        })
      });
    } else {
      const userGender = i18n.t(u.gender, u.gender);
      recordCriterion({
        id: 'gender',
        title: i18n.t('criterionGenderTitle', 'Gender Requirement'),
        status: 'NOT_SATISFIED',
        userValueDescription: userGender,
        requiredValueDescription: targetGenders,
        reason: i18n.t('ruleGenderFailed', {
          target: targetGenders,
          userGender: userGender,
          defaultValue: `Targeted for ${targetGenders} (User is ${userGender})`
        })
      });
    }
  }

  // 3. State / Geographic Domicile Evaluation
  if (s.state === 'Central') {
    recordCriterion({
      id: 'state',
      title: i18n.t('criterionStateTitle', 'State / Domicile Requirement'),
      status: 'SATISFIED',
      userValueDescription: u?.state ? i18n.t(u.state, u.state) : i18n.t('allIndia', 'All India'),
      requiredValueDescription: i18n.t('centralGovtAllIndia', 'Central Scheme (All States & UTs)'),
      reason: i18n.t('centralSchemeAcrossIndia', 'Central Scheme open across India')
    });
  } else if (rules.allowedStates && Array.isArray(rules.allowedStates) && rules.allowedStates.length > 0) {
    const allowed = rules.allowedStates.map((st: string) => i18n.t(st, st)).join(', ');

    if (!u || !u.state || !String(u.state).trim()) {
      recordCriterion({
        id: 'state',
        title: i18n.t('criterionStateTitle', 'State / Domicile Requirement'),
        status: 'UNKNOWN',
        userValueDescription: i18n.t('notSpecifiedInProfile', 'Not specified in profile'),
        requiredValueDescription: allowed,
        reason: i18n.t('ruleStateUnknown', {
          allowedStates: allowed,
          defaultValue: `Scheme restricted to ${allowed} (State not specified in profile)`
        })
      });
    } else {
      const stateMatched = rules.allowedStates.some((st: string) => st.toLowerCase() === String(u.state).toLowerCase());
      const userState = i18n.t(u.state, u.state);
      if (stateMatched) {
        recordCriterion({
          id: 'state',
          title: i18n.t('criterionStateTitle', 'State / Domicile Requirement'),
          status: 'SATISFIED',
          userValueDescription: userState,
          requiredValueDescription: allowed,
          reason: i18n.t('ruleResidentOf', {
            state: userState,
            defaultValue: `Resident of ${userState}`
          })
        });
      } else {
        recordCriterion({
          id: 'state',
          title: i18n.t('criterionStateTitle', 'State / Domicile Requirement'),
          status: 'NOT_SATISFIED',
          userValueDescription: userState,
          requiredValueDescription: allowed,
          reason: i18n.t('ruleStateFailed', {
            allowedStates: allowed,
            userState: userState,
            defaultValue: `Scheme restricted to ${allowed} (User in ${userState})`
          })
        });
      }
    }
  } else if (s.state && s.state !== 'Central') {
    const targetState = i18n.t(s.state, s.state);
    if (!u || !u.state || !String(u.state).trim()) {
      recordCriterion({
        id: 'state',
        title: i18n.t('criterionStateTitle', 'State / Domicile Requirement'),
        status: 'UNKNOWN',
        userValueDescription: i18n.t('notSpecifiedInProfile', 'Not specified in profile'),
        requiredValueDescription: targetState,
        reason: i18n.t('ruleStateUnknown', {
          allowedStates: targetState,
          defaultValue: `Scheme restricted to ${targetState} (State not specified in profile)`
        })
      });
    } else if (String(u.state).toLowerCase() === s.state.toLowerCase()) {
      const userState = i18n.t(u.state, u.state);
      recordCriterion({
        id: 'state',
        title: i18n.t('criterionStateTitle', 'State / Domicile Requirement'),
        status: 'SATISFIED',
        userValueDescription: userState,
        requiredValueDescription: targetState,
        reason: i18n.t('ruleResidentOf', {
          state: userState,
          defaultValue: `Resident of ${userState}`
        })
      });
    } else {
      const userState = i18n.t(u.state, u.state);
      recordCriterion({
        id: 'state',
        title: i18n.t('criterionStateTitle', 'State / Domicile Requirement'),
        status: 'NOT_SATISFIED',
        userValueDescription: userState,
        requiredValueDescription: targetState,
        reason: i18n.t('ruleStateFailed', {
          allowedStates: targetState,
          userState: userState,
          defaultValue: `Scheme restricted to ${targetState} (User in ${userState})`
        })
      });
    }
  }

  // 4. Annual Income Evaluation
  const maxIncome = rules.maxAnnualIncome ?? (rules as any).incomeLimit;
  if (maxIncome !== undefined && maxIncome !== null && !isNaN(Number(maxIncome)) && Number(maxIncome) > 0) {
    const numMax = Number(maxIncome);
    const requiredDesc = `Up to ₹${numMax.toLocaleString('en-IN')}`;

    if (!u || u.annualIncome === undefined || u.annualIncome === null || isNaN(Number(u.annualIncome))) {
      recordCriterion({
        id: 'income',
        title: i18n.t('criterionIncomeTitle', 'Annual Family Income Ceiling'),
        status: 'UNKNOWN',
        userValueDescription: i18n.t('notSpecifiedInProfile', 'Not specified in profile'),
        requiredValueDescription: requiredDesc,
        reason: i18n.t('ruleIncomeUnknown', {
          maxIncome: numMax.toLocaleString('en-IN'),
          defaultValue: `Income ceiling ₹${numMax.toLocaleString('en-IN')} (Annual income not specified in profile)`
        })
      });
    } else if (Number(u.annualIncome) <= numMax) {
      recordCriterion({
        id: 'income',
        title: i18n.t('criterionIncomeTitle', 'Annual Family Income Ceiling'),
        status: 'SATISFIED',
        userValueDescription: `₹${Number(u.annualIncome).toLocaleString('en-IN')}`,
        requiredValueDescription: requiredDesc,
        reason: i18n.t('ruleIncomeBelowLimit', {
          userIncome: Number(u.annualIncome).toLocaleString('en-IN'),
          maxIncome: numMax.toLocaleString('en-IN'),
          defaultValue: `Annual income ₹${Number(u.annualIncome).toLocaleString('en-IN')} within limit of ₹${numMax.toLocaleString('en-IN')}`
        })
      });
    } else {
      recordCriterion({
        id: 'income',
        title: i18n.t('criterionIncomeTitle', 'Annual Family Income Ceiling'),
        status: 'NOT_SATISFIED',
        userValueDescription: `₹${Number(u.annualIncome).toLocaleString('en-IN')}`,
        requiredValueDescription: requiredDesc,
        reason: i18n.t('ruleIncomeExceedsLimit', {
          userIncome: Number(u.annualIncome).toLocaleString('en-IN'),
          maxIncome: numMax.toLocaleString('en-IN'),
          defaultValue: `Annual income ₹${Number(u.annualIncome).toLocaleString('en-IN')} exceeds limit of ₹${numMax.toLocaleString('en-IN')}`
        })
      });
    }
  }

  // 5. Occupation Evaluation
  const allowedOccupations = rules.allowedOccupations || (rules.occupation ? (Array.isArray(rules.occupation) ? rules.occupation : [rules.occupation]) : undefined);
  if (allowedOccupations && Array.isArray(allowedOccupations) && allowedOccupations.length > 0) {
    const reqOccs = allowedOccupations.map((o: string) => i18n.t(o, o)).join(', ');

    if (!u || !u.occupation || !String(u.occupation).trim()) {
      recordCriterion({
        id: 'occupation',
        title: i18n.t('criterionOccupationTitle', 'Occupation Requirement'),
        status: 'UNKNOWN',
        userValueDescription: i18n.t('notSpecifiedInProfile', 'Not specified in profile'),
        requiredValueDescription: reqOccs,
        reason: i18n.t('ruleOccupationUnknown', {
          requiredOccupations: reqOccs,
          defaultValue: `Requires occupation like ${reqOccs} (Occupation not specified in profile)`
        })
      });
    } else {
      const matched = allowedOccupations.some((occ: string) =>
        occ.toLowerCase().includes(String(u.occupation).toLowerCase()) ||
        String(u.occupation).toLowerCase().includes(occ.toLowerCase())
      );
      const userOcc = i18n.t(u.occupation, u.occupation);

      if (matched) {
        recordCriterion({
          id: 'occupation',
          title: i18n.t('criterionOccupationTitle', 'Occupation Requirement'),
          status: 'SATISFIED',
          userValueDescription: userOcc,
          requiredValueDescription: reqOccs,
          reason: i18n.t('ruleOccupationMet', {
            occupation: userOcc,
            defaultValue: `Occupation matches (${userOcc})`
          })
        });
      } else {
        recordCriterion({
          id: 'occupation',
          title: i18n.t('criterionOccupationTitle', 'Occupation Requirement'),
          status: 'NOT_SATISFIED',
          userValueDescription: userOcc,
          requiredValueDescription: reqOccs,
          reason: i18n.t('ruleOccupationFailed', {
            requiredOccupation: reqOccs,
            userOccupation: userOcc,
            defaultValue: `Requires occupation like ${reqOccs} (User is ${userOcc})`
          })
        });
      }
    }
  }

  // 6. Landholding Evaluation
  if (rules.maxLandHoldingAcres !== undefined && rules.maxLandHoldingAcres !== null && !isNaN(Number(rules.maxLandHoldingAcres))) {
    const maxLand = Number(rules.maxLandHoldingAcres);
    const requiredDesc = `Up to ${maxLand} acres`;

    if (!u || u.landHoldingAcres === undefined || u.landHoldingAcres === null || isNaN(Number(u.landHoldingAcres))) {
      recordCriterion({
        id: 'landHolding',
        title: i18n.t('criterionLandTitle', 'Cultivable Land Holding Ceiling'),
        status: 'UNKNOWN',
        userValueDescription: i18n.t('notSpecifiedInProfile', 'Not specified in profile'),
        requiredValueDescription: requiredDesc,
        reason: i18n.t('ruleLandUnknown', {
          maxLand,
          defaultValue: `Land holding ceiling ${maxLand} acres (Land holding not specified in profile)`
        })
      });
    } else if (Number(u.landHoldingAcres) <= maxLand) {
      recordCriterion({
        id: 'landHolding',
        title: i18n.t('criterionLandTitle', 'Cultivable Land Holding Ceiling'),
        status: 'SATISFIED',
        userValueDescription: `${u.landHoldingAcres} acres`,
        requiredValueDescription: requiredDesc,
        reason: i18n.t('ruleLandMet', {
          userLand: u.landHoldingAcres,
          maxLand,
          defaultValue: `Land holding ${u.landHoldingAcres} acres within ceiling of ${maxLand} acres`
        })
      });
    } else {
      recordCriterion({
        id: 'landHolding',
        title: i18n.t('criterionLandTitle', 'Cultivable Land Holding Ceiling'),
        status: 'NOT_SATISFIED',
        userValueDescription: `${u.landHoldingAcres} acres`,
        requiredValueDescription: requiredDesc,
        reason: i18n.t('ruleLandFailed', {
          userLand: u.landHoldingAcres,
          maxLand,
          defaultValue: `Land holding ${u.landHoldingAcres} acres exceeds limit of ${maxLand} acres`
        })
      });
    }
  }

  // 7. Social Category Evaluation
  const allowedCategories = rules.allowedCategories || (rules.category ? (Array.isArray(rules.category) ? rules.category : [rules.category]) : undefined);
  if (allowedCategories && Array.isArray(allowedCategories) && allowedCategories.length > 0 && !allowedCategories.includes('All')) {
    const allowedCats = allowedCategories.map((c: string) => i18n.t(c, c)).join(', ');

    if (!u || !u.category || !String(u.category).trim()) {
      recordCriterion({
        id: 'socialCategory',
        title: i18n.t('criterionCategoryTitle', 'Social Category Requirement'),
        status: 'UNKNOWN',
        userValueDescription: i18n.t('notSpecifiedInProfile', 'Not specified in profile'),
        requiredValueDescription: allowedCats,
        reason: i18n.t('ruleCategoryUnknown', {
          allowedCategories: allowedCats,
          defaultValue: `Restricted to ${allowedCats} (Category not specified in profile)`
        })
      });
    } else if (allowedCategories.some((c: string) => c.toLowerCase() === String(u.category).toLowerCase())) {
      const userCat = i18n.t(u.category, u.category);
      recordCriterion({
        id: 'socialCategory',
        title: i18n.t('criterionCategoryTitle', 'Social Category Requirement'),
        status: 'SATISFIED',
        userValueDescription: userCat,
        requiredValueDescription: allowedCats,
        reason: i18n.t('ruleCategoryMet', {
          category: userCat,
          defaultValue: `Social Category requirement met (${userCat})`
        })
      });
    } else {
      const userCat = i18n.t(u.category, u.category);
      recordCriterion({
        id: 'socialCategory',
        title: i18n.t('criterionCategoryTitle', 'Social Category Requirement'),
        status: 'NOT_SATISFIED',
        userValueDescription: userCat,
        requiredValueDescription: allowedCats,
        reason: i18n.t('ruleCategoryFailed', {
          allowedCategories: allowedCats,
          userCategory: userCat,
          defaultValue: `Restricted to ${allowedCats} (User category: ${userCat})`
        })
      });
    }
  }

  // 8. Disability Evaluation
  const requiresDisability = rules.requiresDisability ?? rules.disabilityRequired;
  if (requiresDisability) {
    const minPerc = rules.minDisabilityPercentage ?? 40;
    const requiredDesc = `Certified disability (min ${minPerc}%)`;

    if (!u || u.hasDisability === undefined || u.hasDisability === null) {
      recordCriterion({
        id: 'disability',
        title: i18n.t('criterionDisabilityTitle', 'Disability Certification (Divyangjan)'),
        status: 'UNKNOWN',
        userValueDescription: i18n.t('notSpecifiedInProfile', 'Not specified in profile'),
        requiredValueDescription: requiredDesc,
        reason: i18n.t('ruleDisabilityUnknown', {
          minPerc,
          defaultValue: `Requires disability certificate (min ${minPerc}%). Disability status is not specified in profile`
        })
      });
    } else if (!u.hasDisability) {
      recordCriterion({
        id: 'disability',
        title: i18n.t('criterionDisabilityTitle', 'Disability Certification (Divyangjan)'),
        status: 'NOT_SATISFIED',
        userValueDescription: i18n.t('noDisabilityReported', 'No certified disability reported'),
        requiredValueDescription: requiredDesc,
        reason: i18n.t('ruleDisabilityFailedCert', {
          defaultValue: 'Requires disability certificate'
        })
      });
    } else {
      const userPerc = u.disabilityPercentage ?? 40;
      if (userPerc >= minPerc) {
        recordCriterion({
          id: 'disability',
          title: i18n.t('criterionDisabilityTitle', 'Disability Certification (Divyangjan)'),
          status: 'SATISFIED',
          userValueDescription: `${userPerc}% disability`,
          requiredValueDescription: requiredDesc,
          reason: i18n.t('ruleDisabilityPercMet', {
            userPerc,
            minPerc,
            defaultValue: `Disability criteria met (${userPerc}% >= ${minPerc}%)`
          })
        });
      } else {
        recordCriterion({
          id: 'disability',
          title: i18n.t('criterionDisabilityTitle', 'Disability Certification (Divyangjan)'),
          status: 'NOT_SATISFIED',
          userValueDescription: `${userPerc}% disability`,
          requiredValueDescription: requiredDesc,
          reason: i18n.t('ruleDisabilityPercFailed', {
            minPerc,
            userPerc,
            defaultValue: `Requires at least ${minPerc}% disability (User certified at ${userPerc}%)`
          })
        });
      }
    }
  }

  // 9. Educational Qualification Evaluation
  const rawReqEdu = rules.requiredEducation || (rules as any).education;
  if (rawReqEdu && (Array.isArray(rawReqEdu) ? rawReqEdu.length > 0 : String(rawReqEdu).trim() !== '')) {
    const reqList = Array.isArray(rawReqEdu)
      ? rawReqEdu
      : String(rawReqEdu).split(',').map(item => item.trim()).filter(Boolean);

    if (reqList.length > 0 && !reqList.includes('All')) {
      const requiredDisplay = reqList.map((r: string) => i18n.t(r, r)).join(', ');

      if (!u || !u.educationLevel || !String(u.educationLevel).trim()) {
        recordCriterion({
          id: 'education',
          title: i18n.t('criterionEducationTitle', 'Educational Qualification'),
          status: 'UNKNOWN',
          userValueDescription: i18n.t('notSpecifiedInProfile', 'Not specified in profile'),
          requiredValueDescription: requiredDisplay,
          reason: i18n.t('ruleEducationUnknown', {
            required: requiredDisplay,
            defaultValue: `Requires education qualification (${requiredDisplay}), but education level is not specified in profile`
          })
        });
      } else {
        const userEduDisplay = i18n.t(u.educationLevel, u.educationLevel);
        const userGroup = resolveEducationGroup(u.educationLevel);
        const userTier = userGroup ? EDUCATION_TIER_ORDER[userGroup] : 0;
        let isMatched = false;

        for (const req of reqList) {
          const reqClean = req.trim().toLowerCase();
          const reqGroup = resolveEducationGroup(reqClean);

          if (userGroup && reqGroup && userGroup === reqGroup) {
            isMatched = true;
            break;
          }

          if (reqGroup === 'class_6_to_12' || reqClean.includes('class 6 to 12')) {
            if (userGroup === 'class_6_to_12') {
              isMatched = true;
              break;
            }
            if (['class_12', 'diploma', 'graduate', 'post_graduate'].includes(userGroup || '')) {
              isMatched = true;
              break;
            }
          }

          if (reqClean.startsWith('minimum') || reqClean.startsWith('at least') || reqClean.endsWith('and above') || reqClean.endsWith('+')) {
            const baseReq = reqClean.replace(/minimum|at least|and above|\+/g, '').trim();
            const baseGroup = resolveEducationGroup(baseReq);
            const baseTier = baseGroup ? EDUCATION_TIER_ORDER[baseGroup] : 0;
            if (userTier >= baseTier && baseTier > 0) {
              isMatched = true;
              break;
            }
          }
        }

        if (isMatched) {
          recordCriterion({
            id: 'education',
            title: i18n.t('criterionEducationTitle', 'Educational Qualification'),
            status: 'SATISFIED',
            userValueDescription: userEduDisplay,
            requiredValueDescription: requiredDisplay,
            reason: i18n.t('ruleEducationMet', {
              education: userEduDisplay,
              defaultValue: `Education qualification requirement met (${userEduDisplay})`
            })
          });
        } else {
          recordCriterion({
            id: 'education',
            title: i18n.t('criterionEducationTitle', 'Educational Qualification'),
            status: 'NOT_SATISFIED',
            userValueDescription: userEduDisplay,
            requiredValueDescription: requiredDisplay,
            reason: i18n.t('ruleEducationFailed', {
              required: requiredDisplay,
              userEducation: userEduDisplay,
              defaultValue: `Requires education qualification (${requiredDisplay}) (User has ${userEduDisplay})`
            })
          });
        }
      }
    }
  }

  // 10. Missing / Unsupported Catalogue Rules Inspection
  if (!s.eligibilityRules || Object.keys(rules).length === 0) {
    recordCriterion({
      id: 'unsupported_catalogue_rules',
      title: i18n.t('criterionRulesTitle', 'Structured Rules Coverage'),
      status: 'UNKNOWN',
      userValueDescription: i18n.t('catalogueDataUnspecified', 'Catalogue rule definitions not structured'),
      requiredValueDescription: i18n.t('officialVerificationRequired', 'Official Department Verification Required'),
      reason: i18n.t('unsupportedRulesNotice', 'Scheme does not define structured machine-evaluable rules in the catalogue. Manual verification with official scheme guidelines is required.')
    });
  } else {
    // Check for any unsupported custom fields in eligibilityRules
    for (const ruleKey of Object.keys(rules)) {
      if (!KNOWN_RULE_KEYS.has(ruleKey)) {
        const val = (rules as any)[ruleKey];
        if (val === false || val === null || val === undefined || val === '' || (Array.isArray(val) && val.length === 0)) {
          continue;
        }
        recordCriterion({
          id: `unsupported_rule_${ruleKey}`,
          title: i18n.t('criterionUnsupportedTitle', `Special Condition (${ruleKey})`),
          status: 'UNKNOWN',
          userValueDescription: i18n.t('unsupportedRuleEval', 'Cannot evaluate automatically'),
          requiredValueDescription: String(val),
          reason: i18n.t('unsupportedRuleFieldNotice', {
            ruleKey,
            value: String(val),
            defaultValue: `Special guideline '${ruleKey}' requires departmental review`
          })
        });
      }
    }
  }

  // Stable ordering for all criteria lists by id
  satisfied.sort((a, b) => a.id.localeCompare(b.id));
  notSatisfied.sort((a, b) => a.id.localeCompare(b.id));
  unknown.sort((a, b) => a.id.localeCompare(b.id));

  // Evaluate document readiness
  const docReadiness = evaluateDocumentReadiness(s, u, reportedPossession);

  // Delegate overall status to the canonical rule engine
  const ruleResult: RuleEvaluationResult = evaluateSchemeEligibility(u, s);

  // Next steps generation grounded in catalogue and rule outcomes
  const nextSteps: string[] = [];

  if (unknown.length > 0) {
    const unknownNames = unknown.map(item => item.title).join(', ');
    nextSteps.push(i18n.t('nextStepUpdateProfile', {
      unknownNames,
      defaultValue: `Update profile with missing information (${unknownNames}) to verify eligibility.`
    }));
  }

  if (docReadiness.missingDocuments.length > 0) {
    const missingDocs = docReadiness.missingDocuments.join(', ');
    nextSteps.push(i18n.t('nextStepProcureDocs', {
      missingDocs,
      defaultValue: `Procure or renew required document(s) you reported missing: ${missingDocs}.`
    }));
  }

  if (docReadiness.unconfirmedDocuments.length > 0) {
    const unconfirmed = docReadiness.unconfirmedDocuments.slice(0, 3).join(', ');
    nextSteps.push(i18n.t('nextStepConfirmDocs', {
      unconfirmed,
      defaultValue: `Confirm possession of required documents: ${unconfirmed}.`
    }));
  }

  if (docReadiness.documentConflictDetected && docReadiness.documentConflictDetails) {
    nextSteps.push(docReadiness.documentConflictDetails);
  }

  if (notSatisfied.length > 0) {
    const unmetNames = notSatisfied.map(item => item.title).join(', ');
    nextSteps.push(i18n.t('nextStepReviewUnmet', {
      unmetNames,
      defaultValue: `Review unmet criteria (${unmetNames}). Explore related welfare schemes tailored to your profile.`
    }));
  }

  // Application link guidance
  if (s.officialApplyUrl && s.officialApplyUrl.startsWith('http')) {
    try {
      const hostname = new URL(s.officialApplyUrl).hostname;
      nextSteps.push(i18n.t('nextStepApplyPortal', {
        hostname,
        url: s.officialApplyUrl,
        defaultValue: `Apply on the official government portal at ${hostname} (${s.officialApplyUrl}).`
      }));
    } catch {
      nextSteps.push(i18n.t('nextStepApplyPortalSimple', {
        url: s.officialApplyUrl,
        defaultValue: `Apply on the official government portal: ${s.officialApplyUrl}.`
      }));
    }
  } else if (s.officialWebsite && s.officialWebsite.startsWith('http')) {
    nextSteps.push(i18n.t('nextStepVisitWebsite', {
      website: s.officialWebsite,
      defaultValue: `Visit the official department website: ${s.officialWebsite}.`
    }));
  } else {
    nextSteps.push(i18n.t('nextStepOfflineApply', {
      defaultValue: 'Online application URL is unavailable in catalogue. Visit your nearest Common Service Centre (CSC) or Block Office.'
    }));
  }

  if (s.helplineNumber && String(s.helplineNumber).trim()) {
    nextSteps.push(i18n.t('nextStepHelpline', {
      helplineNumber: s.helplineNumber,
      defaultValue: `For assistance, contact the official scheme helpline at ${s.helplineNumber}.`
    }));
  }

  // Explanations summary
  const explanations: string[] = [];
  if (satisfied.length > 0) {
    explanations.push(i18n.t('summarySatisfied', {
      count: satisfied.length,
      defaultValue: `${satisfied.length} eligibility criteria satisfied by your profile.`
    }));
  }
  if (notSatisfied.length > 0) {
    explanations.push(i18n.t('summaryNotSatisfied', {
      count: notSatisfied.length,
      defaultValue: `${notSatisfied.length} criteria appear unmet based on stated profile information.`
    }));
  }
  if (unknown.length > 0) {
    explanations.push(i18n.t('summaryUnknown', {
      count: unknown.length,
      defaultValue: `${unknown.length} criteria require additional verification or missing profile data.`
    }));
  }
  if (ruleResult.overallReason) {
    explanations.push(ruleResult.overallReason);
  }

  let overallStatus = ruleResult.status;
  if ((overallStatus === 'Eligible' || overallStatus === 'Conditionally Eligible') && unknown.length > 0) {
    overallStatus = 'Insufficient Information';
  }
  if (overallStatus === 'Eligible' && satisfied.length === 0) {
    overallStatus = 'Insufficient Information';
  }

  return {
    schemeId: s.id || '',
    schemeName: s.name || 'Unknown Scheme',
    overallStatus,
    satisfied,
    notSatisfied,
    unknown,
    criteriaCount: {
      total: satisfied.length + notSatisfied.length + unknown.length,
      satisfied: satisfied.length,
      notSatisfied: notSatisfied.length,
      unknown: unknown.length
    },
    requiredDocuments: docReadiness.requiredDocuments,
    availableDocuments: docReadiness.availableDocuments,
    missingDocuments: docReadiness.missingDocuments,
    unconfirmedDocuments: docReadiness.unconfirmedDocuments,
    documentItems: docReadiness.documentItems,
    documentConflictDetected: docReadiness.documentConflictDetected,
    documentConflictDetails: docReadiness.documentConflictDetails,
    explanations,
    nextSteps,
    officialApplyUrl: s.officialApplyUrl || undefined,
    helplineNumber: s.helplineNumber || undefined,
    disclaimer: PRELIMINARY_DISCLAIMER
  };
}
