import type { UserProfile, Scheme, DocumentRecord, RuleEvaluationResult } from '../types/index.ts';
import i18n from '../i18n.ts';

export const SEMANTIC_EDUCATION_GROUPS: Record<string, string[]> = {
  below_10th: ['below 10th standard', 'below 10th', 'primary school', 'middle school', 'elementary', '5th pass', '8th pass'],
  class_6_to_12: ['class 6 to 12 in govt school', 'class 6 to 12', '6th to 12th', '6-12'],
  class_10: ['10th standard pass', '10th standard', 'class 10 pass', '10th pass', 'sslc', 'matriculation', 'class 10', '10th', 'matric'],
  class_12: ['12th standard pass', 'higher secondary', '12th standard', 'class 12 pass', 'high school', 'intermediate', '12th pass', 'class 12', '12th', 'hsc'],
  diploma: ['vocational diploma', 'polytechnic', 'diploma'],
  graduate: ['undergraduate', 'bachelor of technology', 'bachelor of science', 'bachelor of arts', 'bachelor of commerce', 'bachelor', 'bachelors', 'degree', 'graduate', 'b.tech', 'b.sc.', 'b.com', 'b.a.', 'b.e.'],
  post_graduate: ['post graduate', 'postgraduate', 'master of technology', 'master of science', 'master of arts', 'master of commerce', 'masters', 'master', 'm.tech', 'm.sc.', 'm.com', 'm.a.', 'm.e.'],
  doctorate: ['doctor of philosophy', 'doctorate', 'phd']
};

export const EDUCATION_TIER_ORDER: Record<string, number> = {
  below_10th: 1,
  class_6_to_12: 2,
  class_10: 3,
  class_12: 4,
  diploma: 5,
  graduate: 6,
  post_graduate: 7,
  doctorate: 8
};

export const KNOWN_RULE_KEYS = new Set([
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

// Flatten and sort aliases by length descending so specific multi-word phrases match before general substrings
const SORTED_EDUCATION_ALIASES: Array<{ group: string; alias: string }> = (() => {
  const list: Array<{ group: string; alias: string }> = [];
  for (const [group, aliases] of Object.entries(SEMANTIC_EDUCATION_GROUPS)) {
    for (const alias of aliases) {
      list.push({ group, alias: alias.toLowerCase() });
    }
  }
  return list.sort((a, b) => b.alias.length - a.alias.length);
})();

export function resolveEducationGroup(term?: string | null): string | null {
  if (!term || typeof term !== 'string') return null;
  const clean = term.trim().toLowerCase().replace(/[\(\)\/]/g, ' ').replace(/\s+/g, ' ').trim();
  for (const { group, alias } of SORTED_EDUCATION_ALIASES) {
    if (clean === alias || clean.startsWith(alias + ' ') || clean.endsWith(' ' + alias) || clean.includes(' ' + alias + ' ')) {
      return group;
    }
  }
  return null;
}

export function evaluateSchemeEligibility(user: UserProfile | null | undefined, scheme: Scheme | null | undefined): RuleEvaluationResult {
  const u = (user || {}) as Partial<UserProfile>;
  const s = (scheme || {}) as Scheme;
  // Safely extract rules (backend uses ageMin, frontend uses minAge)
  const rules = s.eligibilityRules || {};
  const matchedCriteria: string[] = [];
  const failedCriteria: string[] = [];
  const missingDocuments: string[] = [];
  const informationNeeded: string[] = [];

  if (!s.eligibilityRules || Object.keys(rules).length === 0) {
    informationNeeded.push(i18n.t('unsupportedRulesNotice', {
      defaultValue: 'Scheme does not define structured machine-evaluable rules in the catalogue. Manual verification with official scheme guidelines is required.'
    }));
  } else {
    for (const ruleKey of Object.keys(rules)) {
      if (!KNOWN_RULE_KEYS.has(ruleKey)) {
        const val = (rules as any)[ruleKey];
        if (val === false || val === null || val === undefined || val === '' || (Array.isArray(val) && val.length === 0)) {
          continue;
        }
        informationNeeded.push(i18n.t('unsupportedRuleFieldNotice', {
          ruleKey,
          value: String(val),
          defaultValue: `Special guideline '${ruleKey}' requires departmental review`
        }));
      }
    }
  }

  const minAge = rules.minAge ?? (rules as any).ageMin;
  const maxAge = rules.maxAge ?? (rules as any).ageMax;
  if (minAge !== undefined || maxAge !== undefined) {
    const finalMin = minAge ?? 0;
    const finalMax = maxAge ?? 120;
    if (u.age === undefined || u.age === null || isNaN(Number(u.age)) || Number(u.age) <= 0) {
      if (finalMin > 0 || finalMax < 120) {
        informationNeeded.push(i18n.t('ruleAgeUnknown', {
          minAge: finalMin,
          maxAge: finalMax,
          defaultValue: `Age required (${finalMin}-${finalMax} yrs), but age is not specified in profile`
        }));
      }
    } else if (u.age >= finalMin && u.age <= finalMax) {
      matchedCriteria.push(i18n.t('ruleAgeMetDetail', {
        userAge: u.age,
        minAge: finalMin,
        maxAge: finalMax,
        defaultValue: `Age Requirement Met (${u.age} yrs within ${finalMin}-${finalMax} range)`
      }));
    } else {
      failedCriteria.push(i18n.t('ruleAgeFailed', {
        userAge: u.age,
        minAge: finalMin,
        maxAge: finalMax,
        defaultValue: `Age ${u.age} yrs does not satisfy required range (${finalMin}-${finalMax} yrs)`
      }));
    }
  }

  const allowedGenders = rules.allowedGenders || (rules.gender ? (Array.isArray(rules.gender) ? rules.gender : [rules.gender]) : undefined);
  if (allowedGenders && allowedGenders.length > 0 && !allowedGenders.includes('All')) {
    if (!u.gender || !String(u.gender).trim()) {
      const targetGender = allowedGenders.map((g: string) => i18n.t(g, g)).join(', ');
      informationNeeded.push(i18n.t('ruleGenderUnknown', {
        target: targetGender,
        defaultValue: `Targeted for ${targetGender} (Gender not specified in profile)`
      }));
    } else if (allowedGenders.some((g: string) => g.toLowerCase() === u.gender?.toLowerCase())) {
      matchedCriteria.push(i18n.t('ruleGenderMet', {
        gender: i18n.t(u.gender, u.gender),
        defaultValue: `Gender requirement met (${i18n.t(u.gender, u.gender)})`
      }));
    } else {
      const targetGender = allowedGenders.map((g: string) => i18n.t(g, g)).join(', ');
      const userGender = i18n.t(u.gender, u.gender);
      failedCriteria.push(i18n.t('ruleGenderFailed', {
        target: targetGender,
        userGender: userGender,
        defaultValue: `Targeted for ${targetGender} (User is ${userGender})`
      }));
    }
  }

  if (s.state !== 'Central' && rules.allowedStates && rules.allowedStates.length > 0) {
    if (!u.state || !String(u.state).trim()) {
      const allowedStates = rules.allowedStates.map((st: string) => i18n.t(st, st)).join(', ');
      informationNeeded.push(i18n.t('ruleStateUnknown', {
        allowedStates: allowedStates,
        defaultValue: `Scheme restricted to ${allowedStates} (State not specified in profile)`
      }));
    } else {
      const stateMatched = rules.allowedStates.some((st: string) => st.toLowerCase() === u.state?.toLowerCase());
      const userState = i18n.t(u.state || 'Unknown', u.state || 'Unknown');
      if (stateMatched) {
        matchedCriteria.push(i18n.t('ruleResidentOf', {
          state: userState,
          defaultValue: `Resident of ${userState}`
        }));
      } else {
        const allowedStates = rules.allowedStates.map((st: string) => i18n.t(st, st)).join(', ');
        failedCriteria.push(i18n.t('ruleStateFailed', {
          allowedStates: allowedStates,
          userState: userState,
          defaultValue: `Scheme restricted to ${allowedStates} (User in ${userState})`
        }));
      }
    }
  } else if (s.state && s.state !== 'Central') {
    const targetState = i18n.t(s.state, s.state);
    if (!u.state || !String(u.state).trim()) {
      informationNeeded.push(i18n.t('ruleStateUnknown', {
        allowedStates: targetState,
        defaultValue: `Scheme restricted to ${targetState} (State not specified in profile)`
      }));
    } else if (u.state.toLowerCase() === s.state.toLowerCase()) {
      const userState = i18n.t(u.state, u.state);
      matchedCriteria.push(i18n.t('ruleResidentOf', {
        state: userState,
        defaultValue: `Resident of ${userState}`
      }));
    } else {
      const userState = i18n.t(u.state, u.state);
      failedCriteria.push(i18n.t('ruleStateFailed', {
        allowedStates: targetState,
        userState: userState,
        defaultValue: `Scheme restricted to ${targetState} (User in ${userState})`
      }));
    }
  } else if (s.state === 'Central') {
    matchedCriteria.push(i18n.t('Central Scheme open across India', 'Central Scheme open across India'));
  }

  const maxIncome = rules.maxAnnualIncome ?? (rules as any).incomeLimit;
  if (maxIncome !== undefined && maxIncome > 0) {
    const userIncome = u.annualIncome !== undefined && u.annualIncome !== null ? u.annualIncome : null;
    if (userIncome === null || isNaN(Number(userIncome))) {
      informationNeeded.push(i18n.t('ruleIncomeUnknown', {
        maxIncome: maxIncome.toLocaleString('en-IN'),
        defaultValue: `Income ceiling ₹${maxIncome.toLocaleString('en-IN')} (Annual income not specified in profile)`
      }));
    } else if (userIncome <= maxIncome) {
      matchedCriteria.push(i18n.t('ruleIncomeBelowLimit', {
        userIncome: userIncome.toLocaleString('en-IN'),
        maxIncome: maxIncome.toLocaleString('en-IN'),
        defaultValue: `Annual income ₹${userIncome.toLocaleString('en-IN')} within limit of ₹${maxIncome.toLocaleString('en-IN')}`
      }));
    } else {
      failedCriteria.push(i18n.t('ruleIncomeExceedsLimit', {
        userIncome: userIncome.toLocaleString('en-IN'),
        maxIncome: maxIncome.toLocaleString('en-IN'),
        defaultValue: `Annual income ₹${userIncome.toLocaleString('en-IN')} exceeds limit of ₹${maxIncome.toLocaleString('en-IN')}`
      }));
    }
  }

  const allowedOccupations = rules.allowedOccupations || (rules.occupation ? (Array.isArray(rules.occupation) ? rules.occupation : [rules.occupation]) : undefined);
  if (allowedOccupations && allowedOccupations.length > 0) {
    if (!u.occupation || !String(u.occupation).trim()) {
      const requiredOccupations = allowedOccupations.map((o: string) => i18n.t(o, o)).join(', ');
      informationNeeded.push(i18n.t('ruleOccupationUnknown', {
        requiredOccupations: requiredOccupations,
        defaultValue: `Requires occupation like ${requiredOccupations} (Occupation not specified in profile)`
      }));
    } else {
      const occupationMatched = allowedOccupations.some((occ: string) =>
        occ.toLowerCase().includes(u.occupation?.toLowerCase() || '') ||
        (u.occupation?.toLowerCase() || '').includes(occ.toLowerCase())
      );
      const userOcc = i18n.t(u.occupation, u.occupation);
      if (occupationMatched) {
        matchedCriteria.push(i18n.t('ruleOccupationMet', {
          occupation: userOcc,
          defaultValue: `Occupation matches (${userOcc})`
        }));
      } else {
        const requiredOccupations = allowedOccupations.map((o: string) => i18n.t(o, o)).join(', ');
        failedCriteria.push(i18n.t('ruleOccupationFailed', {
          requiredOccupation: requiredOccupations,
          userOccupation: userOcc,
          defaultValue: `Requires occupation like ${requiredOccupations} (User is ${userOcc})`
        }));
      }
    }
  }

  if (rules.maxLandHoldingAcres !== undefined) {
    if (u.landHoldingAcres === undefined || u.landHoldingAcres === null || isNaN(Number(u.landHoldingAcres))) {
      informationNeeded.push(i18n.t('ruleLandUnknown', {
        maxLand: rules.maxLandHoldingAcres,
        defaultValue: `Land holding ceiling ${rules.maxLandHoldingAcres} acres (Land holding not specified in profile)`
      }));
    } else if (Number(u.landHoldingAcres) <= rules.maxLandHoldingAcres) {
      matchedCriteria.push(i18n.t('ruleLandMet', {
        userLand: u.landHoldingAcres,
        maxLand: rules.maxLandHoldingAcres,
        defaultValue: `Land holding ${u.landHoldingAcres} acres within ceiling of ${rules.maxLandHoldingAcres} acres`
      }));
    } else {
      failedCriteria.push(i18n.t('ruleLandFailed', {
        userLand: u.landHoldingAcres,
        maxLand: rules.maxLandHoldingAcres,
        defaultValue: `Land holding ${u.landHoldingAcres} acres exceeds limit of ${rules.maxLandHoldingAcres} acres`
      }));
    }
  }

  const allowedCategories = rules.allowedCategories || (rules.category ? (Array.isArray(rules.category) ? rules.category : [rules.category]) : undefined);
  if (allowedCategories && allowedCategories.length > 0 && !allowedCategories.includes('All')) {
    if (!u.category || !String(u.category).trim()) {
      const targetCategories = allowedCategories.map((c: string) => i18n.t(c, c)).join(', ');
      informationNeeded.push(i18n.t('ruleCategoryUnknown', {
        allowedCategories: targetCategories,
        defaultValue: `Restricted to ${targetCategories} (Category not specified in profile)`
      }));
    } else {
      const userCategory = i18n.t(u.category, u.category);
      if (allowedCategories.some((c: string) => c.toLowerCase() === u.category?.toLowerCase())) {
        matchedCriteria.push(i18n.t('ruleCategoryMet', {
          category: userCategory,
          defaultValue: `Social Category requirement met (${userCategory})`
        }));
      } else {
        const targetCategories = allowedCategories.map((c: string) => i18n.t(c, c)).join(', ');
        failedCriteria.push(i18n.t('ruleCategoryFailed', {
          allowedCategories: targetCategories,
          userCategory: userCategory,
          defaultValue: `Restricted to ${targetCategories} (User category: ${userCategory})`
        }));
      }
    }
  }

  const requiresDisability = rules.requiresDisability ?? rules.disabilityRequired;
  if (requiresDisability) {
    if (u.hasDisability === undefined || u.hasDisability === null) {
      const minPerc = rules.minDisabilityPercentage ?? 40;
      informationNeeded.push(i18n.t('ruleDisabilityUnknown', {
        minPerc,
        defaultValue: `Requires disability certificate (min ${minPerc}%). Disability status is not specified in profile`
      }));
    } else if (u.hasDisability) {
      const minPerc = rules.minDisabilityPercentage ?? 40;
      const userPerc = u.disabilityPercentage ?? 40;
      if (userPerc >= minPerc) {
        matchedCriteria.push(i18n.t('ruleDisabilityPercMet', {
          userPerc,
          minPerc,
          defaultValue: `Disability criteria met (${userPerc}% >= ${minPerc}%)`
        }));
      } else {
        failedCriteria.push(i18n.t('ruleDisabilityPercFailed', {
          minPerc,
          userPerc,
          defaultValue: `Requires at least ${minPerc}% disability (User certified at ${userPerc}%)`
        }));
      }
    } else {
      failedCriteria.push(i18n.t('ruleDisabilityFailedCert', {
        defaultValue: 'Requires disability certificate'
      }));
    }
  }

  // Educational Qualification Evaluation
  const rawReqEdu = rules.requiredEducation || (rules as any).education;
  if (rawReqEdu && (Array.isArray(rawReqEdu) ? rawReqEdu.length > 0 : String(rawReqEdu).trim() !== '')) {
    const reqList = Array.isArray(rawReqEdu)
      ? rawReqEdu
      : String(rawReqEdu).split(',').map(s => s.trim()).filter(Boolean);

    if (reqList.length > 0 && !reqList.includes('All')) {
      const requiredDisplay = reqList.map(r => i18n.t(r, r)).join(', ');

      if (!u.educationLevel || !String(u.educationLevel).trim()) {
        informationNeeded.push(i18n.t('ruleEducationUnknown', {
          required: requiredDisplay,
          defaultValue: `Requires education qualification (${requiredDisplay}), but education level is not specified in profile`
        }));
      } else {
        const userEduDisplay = i18n.t(u.educationLevel, u.educationLevel);
        const userGroup = resolveEducationGroup(u.educationLevel);
        const userTier = userGroup ? EDUCATION_TIER_ORDER[userGroup] : 0;
        let isMatched = false;
        let matchedRequirementName = '';

        for (const req of reqList) {
          const reqClean = req.trim().toLowerCase();
          const reqGroup = resolveEducationGroup(reqClean);

          // 1. Direct semantic group match
          if (userGroup && reqGroup && userGroup === reqGroup) {
            isMatched = true;
            matchedRequirementName = req;
            break;
          }

          // 2. Class 6 to 12 range (Pudhumai Penn and secondary/higher education schemes)
          if (reqGroup === 'class_6_to_12' || reqClean.includes('class 6 to 12')) {
            if (userGroup === 'class_6_to_12') {
              isMatched = true;
              matchedRequirementName = req;
              break;
            }
            if (['class_12', 'diploma', 'graduate', 'post_graduate'].includes(userGroup || '')) {
              isMatched = true;
              matchedRequirementName = req;
              break;
            }
          }

          // 3. Minimum / At least threshold
          if (reqClean.startsWith('minimum') || reqClean.startsWith('at least') || reqClean.endsWith('and above') || reqClean.endsWith('+')) {
            const baseReq = reqClean.replace(/minimum|at least|and above|\+/g, '').trim();
            const baseGroup = resolveEducationGroup(baseReq);
            const baseTier = baseGroup ? EDUCATION_TIER_ORDER[baseGroup] : 0;
            if (userTier >= baseTier && baseTier > 0) {
              isMatched = true;
              matchedRequirementName = req;
              break;
            }
          }
        }

        if (isMatched) {
          matchedCriteria.push(i18n.t('ruleEducationMet', {
            education: userEduDisplay,
            matchedOn: matchedRequirementName,
            defaultValue: `Education qualification requirement met (${userEduDisplay})`
          }));
        } else {
          failedCriteria.push(i18n.t('ruleEducationFailed', {
            required: requiredDisplay,
            userEducation: userEduDisplay,
            defaultValue: `Requires education qualification (${requiredDisplay}) (User has ${userEduDisplay})`
          }));
        }
      }
    }
  }

  const rawDocs = Array.isArray(u.documents) ? u.documents : [];
  const uploadedDocTypes = rawDocs
    .filter((d): d is DocumentRecord => !!d && typeof d === 'object')
    .map(d => d.documentType || d.type || '')
    .filter(Boolean);
  const rawDocsList = s.requiredDocuments || (s as any).documentsRequired || [];
  const docsList = Array.isArray(rawDocsList) ? rawDocsList.filter((d): d is string => typeof d === 'string') : [];
  
  docsList.forEach((reqDoc: string) => {
    const isDocPresent = uploadedDocTypes.some(docType => 
      docType && (reqDoc.toLowerCase().includes(docType.toLowerCase()) || docType.toLowerCase().includes(reqDoc.toLowerCase()))
    );
    if (!isDocPresent) {
      missingDocuments.push(reqDoc);
    }
  });

  let status: 'Eligible' | 'Conditionally Eligible' | 'Almost Eligible' | 'Not Eligible' | 'Insufficient Information';
  let classification: 'LIKELY_ELIGIBLE' | 'POSSIBLY_ELIGIBLE' | 'LIKELY_INELIGIBLE' | 'INSUFFICIENT_INFORMATION' | 'RULES_NEED_VERIFICATION';
  let overallReason = '';

  if (failedCriteria.length === 0 && informationNeeded.length === 0 && missingDocuments.length === 0) {
    if (matchedCriteria.length === 0) {
      status = 'Insufficient Information';
      classification = 'RULES_NEED_VERIFICATION';
      overallReason = i18n.t('ruleNoCriteriaEvaluated', {
        defaultValue: 'No machine-evaluable criteria defined in catalogue. Official guidelines must be consulted.'
      });
    } else {
      status = 'Eligible';
      classification = 'LIKELY_ELIGIBLE';
      overallReason = i18n.t('ruleEligible', {
        count: matchedCriteria.length,
        defaultValue: `Full eligibility verified! All ${matchedCriteria.length} criteria met and all required documents present in Document Vault.`
      });
    }
  } else if (failedCriteria.length === 0 && informationNeeded.length === 0 && missingDocuments.length > 0) {
    status = 'Conditionally Eligible';
    classification = 'POSSIBLY_ELIGIBLE';
    const docsStr = missingDocuments.map(d => i18n.t(d, d)).join(', ');
    overallReason = i18n.t('ruleConditional', {
      count: missingDocuments.length,
      docs: docsStr,
      defaultValue: `Eligible based on profile criteria, but missing ${missingDocuments.length} document(s) in Document Vault (${docsStr}). Upload before applying on official portal.`
    });
  } else if (failedCriteria.length === 0 && informationNeeded.length > 0) {
    status = 'Insufficient Information';
    classification = 'INSUFFICIENT_INFORMATION';
    const infoStr = informationNeeded.slice(0, 2).join('; ');
    overallReason = i18n.t('ruleInsufficientInfo', {
      info: infoStr,
      defaultValue: `More profile details needed to confirm eligibility: ${infoStr}. Please update your profile.`
    });
  } else {
    // Failing 1 or more mandatory criteria classifies as LIKELY_INELIGIBLE
    status = 'Not Eligible';
    classification = 'LIKELY_INELIGIBLE';
    const critStr = failedCriteria.join('; ');
    overallReason = i18n.t('ruleNotEligible', {
      criteria: critStr,
      defaultValue: `Does not meet mandatory requirements: ${critStr}`
    });
  }

  const officialSourceUrl = s.officialApplyUrl || s.officialWebsite || s.sourceUrl || '';
  const lastVerifiedAt = s.lastVerifiedAt || s.lastUpdated || '2026-05-15';
  const disclaimer = 'GovScheme is an independent information platform. Automated eligibility evaluations are advisory and preliminary. Official determination and sanction belong solely to the relevant government authority.';

  return {
    schemeId: s.id || '',
    eligible: (status === 'Eligible' || status === 'Conditionally Eligible'),
    status,
    classification,
    matchedCriteria,
    failedCriteria,
    missingDocuments,
    informationNeeded,
    unknownCriteria: informationNeeded,
    officialSourceUrl,
    lastVerifiedAt,
    disclaimer,
    overallReason
  };
}
