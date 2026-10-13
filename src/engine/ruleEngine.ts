import { UserProfile, Scheme, RuleEvaluationResult } from '../types';
import i18n from '../i18n';

export function evaluateSchemeEligibility(user: UserProfile, scheme: Scheme): RuleEvaluationResult {
  // Safely extract rules (backend uses ageMin, frontend uses minAge)
  const rules = scheme.eligibilityRules || {};
  const matchedCriteria: string[] = [];
  const failedCriteria: string[] = [];
  const missingDocuments: string[] = [];

  const minAge = rules.minAge ?? (rules as any).ageMin;
  const maxAge = rules.maxAge ?? (rules as any).ageMax;
  if (minAge !== undefined || maxAge !== undefined) {
    const finalMin = minAge ?? 0;
    const finalMax = maxAge ?? 120;
    if (user.age === undefined || user.age === null || isNaN(Number(user.age)) || Number(user.age) <= 0) {
      failedCriteria.push(i18n.t('ruleAgeUnknown', {
        minAge: finalMin,
        maxAge: finalMax,
        defaultValue: `Age required (${finalMin}-${finalMax} yrs), but age is not specified in profile`
      }));
    } else if (user.age >= finalMin && user.age <= finalMax) {
      matchedCriteria.push(i18n.t('ruleAgeMetDetail', {
        userAge: user.age,
        minAge: finalMin,
        maxAge: finalMax,
        defaultValue: `Age Requirement Met (${user.age} yrs within ${finalMin}-${finalMax} range)`
      }));
    } else {
      failedCriteria.push(i18n.t('ruleAgeFailed', {
        userAge: user.age,
        minAge: finalMin,
        maxAge: finalMax,
        defaultValue: `Age ${user.age} yrs does not satisfy required range (${finalMin}-${finalMax} yrs)`
      }));
    }
  }

  if (rules.allowedGenders && rules.allowedGenders.length > 0 && !rules.allowedGenders.includes('All')) {
    if (!user.gender || !String(user.gender).trim()) {
      const targetGender = rules.allowedGenders.map((g: string) => i18n.t(g, g)).join(', ');
      failedCriteria.push(i18n.t('ruleGenderUnknown', {
        target: targetGender,
        defaultValue: `Targeted for ${targetGender} (Gender not specified in profile)`
      }));
    } else if (rules.allowedGenders.includes(user.gender)) {
      matchedCriteria.push(i18n.t('ruleGenderMet', {
        gender: i18n.t(user.gender, user.gender),
        defaultValue: `Gender requirement met (${i18n.t(user.gender, user.gender)})`
      }));
    } else {
      const targetGender = rules.allowedGenders.map((g: string) => i18n.t(g, g)).join(', ');
      const userGender = i18n.t(user.gender, user.gender);
      failedCriteria.push(i18n.t('ruleGenderFailed', {
        target: targetGender,
        userGender: userGender,
        defaultValue: `Targeted for ${targetGender} (User is ${userGender})`
      }));
    }
  }

  if (scheme.state !== 'Central' && rules.allowedStates && rules.allowedStates.length > 0) {
    if (!user.state || !String(user.state).trim()) {
      const allowedStates = rules.allowedStates.map((s: string) => i18n.t(s, s)).join(', ');
      failedCriteria.push(i18n.t('ruleStateUnknown', {
        allowedStates: allowedStates,
        defaultValue: `Scheme restricted to ${allowedStates} (State not specified in profile)`
      }));
    } else {
      const stateMatched = rules.allowedStates.some((s: string) => s.toLowerCase() === user.state?.toLowerCase());
      const userState = i18n.t(user.state || 'Unknown', user.state || 'Unknown');
      if (stateMatched) {
        matchedCriteria.push(i18n.t('ruleResidentOf', {
          state: userState,
          defaultValue: `Resident of ${userState}`
        }));
      } else {
        const allowedStates = rules.allowedStates.map((s: string) => i18n.t(s, s)).join(', ');
        failedCriteria.push(i18n.t('ruleStateFailed', {
          allowedStates: allowedStates,
          userState: userState,
          defaultValue: `Scheme restricted to ${allowedStates} (User in ${userState})`
        }));
      }
    }
  } else if (scheme.state === 'Central') {
    matchedCriteria.push(i18n.t('Central Scheme open across India', 'Central Scheme open across India'));
  }

  const maxIncome = rules.maxAnnualIncome ?? (rules as any).incomeLimit;
  if (maxIncome !== undefined && maxIncome > 0) {
    const userIncome = user.annualIncome !== undefined && user.annualIncome !== null ? user.annualIncome : null;
    if (userIncome === null || isNaN(Number(userIncome))) {
      failedCriteria.push(i18n.t('ruleIncomeUnknown', {
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

  if (rules.allowedOccupations && rules.allowedOccupations.length > 0) {
    if (!user.occupation || !String(user.occupation).trim()) {
      const requiredOccupations = rules.allowedOccupations.map((o: string) => i18n.t(o, o)).join(', ');
      failedCriteria.push(i18n.t('ruleOccupationUnknown', {
        defaultValue: `Requires occupation like ${requiredOccupations} (Occupation not specified in profile)`
      }));
    } else {
      const occupationMatched = rules.allowedOccupations.some((occ: string) => 
        occ.toLowerCase().includes(user.occupation?.toLowerCase() || '') || 
        (user.occupation?.toLowerCase() || '').includes(occ.toLowerCase())
      );
      const userOcc = i18n.t(user.occupation, user.occupation);
      if (occupationMatched) {
        matchedCriteria.push(i18n.t('ruleOccupationMet', {
          occupation: userOcc,
          defaultValue: `Occupation matches (${userOcc})`
        }));
      } else {
        const requiredOccupations = rules.allowedOccupations.map((o: string) => i18n.t(o, o)).join(', ');
        failedCriteria.push(i18n.t('ruleOccupationFailed', {
          requiredOccupation: requiredOccupations,
          userOccupation: userOcc,
          defaultValue: `Requires occupation like ${requiredOccupations} (User is ${userOcc})`
        }));
      }
    }
  }

  if (rules.maxLandHoldingAcres !== undefined) {
    const userLand = user.landHoldingAcres ?? 0;
    if (userLand <= rules.maxLandHoldingAcres) {
      matchedCriteria.push(i18n.t('ruleLandMet', {
        userLand: userLand,
        maxLand: rules.maxLandHoldingAcres,
        defaultValue: `Land holding ${userLand} acres within ceiling of ${rules.maxLandHoldingAcres} acres`
      }));
    } else {
      failedCriteria.push(i18n.t('ruleLandFailed', {
        userLand: userLand,
        maxLand: rules.maxLandHoldingAcres,
        defaultValue: `Land holding ${userLand} acres exceeds limit of ${rules.maxLandHoldingAcres} acres`
      }));
    }
  }

  if (rules.allowedCategories && rules.allowedCategories.length > 0 && !rules.allowedCategories.includes('All')) {
    if (!user.category || !String(user.category).trim()) {
      const allowedCategories = rules.allowedCategories.map((c: string) => i18n.t(c, c)).join(', ');
      failedCriteria.push(i18n.t('ruleCategoryUnknown', {
        allowedCategories: allowedCategories,
        defaultValue: `Restricted to ${allowedCategories} (Category not specified in profile)`
      }));
    } else {
      const userCategory = i18n.t(user.category, user.category);
      if (rules.allowedCategories.includes(user.category)) {
        matchedCriteria.push(i18n.t('ruleCategoryMet', {
          category: userCategory,
          defaultValue: `Social Category requirement met (${userCategory})`
        }));
      } else {
        const allowedCategories = rules.allowedCategories.map((c: string) => i18n.t(c, c)).join(', ');
        failedCriteria.push(i18n.t('ruleCategoryFailed', {
          allowedCategories: allowedCategories,
          userCategory: userCategory,
          defaultValue: `Restricted to ${allowedCategories} (User category: ${userCategory})`
        }));
      }
    }
  }

  if (rules.requiresDisability) {
    if (user.hasDisability) {
      const minPerc = rules.minDisabilityPercentage ?? 40;
      const userPerc = user.disabilityPercentage ?? 40;
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

  const uploadedDocTypes = (user.documents || []).map(d => d.documentType || d.type || '').filter(Boolean);
  const docsList = scheme.requiredDocuments || (scheme as any).documentsRequired || [];
  
  docsList.forEach((reqDoc: string) => {
    const isDocPresent = uploadedDocTypes.some(docType => 
      docType && (reqDoc.toLowerCase().includes(docType.toLowerCase()) || docType.toLowerCase().includes(reqDoc.toLowerCase()))
    );
    if (!isDocPresent) {
      missingDocuments.push(reqDoc);
    }
  });

  let status: 'Eligible' | 'Conditionally Eligible' | 'Almost Eligible' | 'Not Eligible';
  let overallReason = '';

  if (failedCriteria.length === 0 && missingDocuments.length === 0) {
    status = 'Eligible';
    overallReason = i18n.t('ruleEligible', {
      count: matchedCriteria.length,
      defaultValue: `Full eligibility verified! All ${matchedCriteria.length} criteria met and all required documents present in Document Vault.`
    });
  } else if (failedCriteria.length === 0 && missingDocuments.length > 0) {
    status = 'Conditionally Eligible';
    const docsStr = missingDocuments.map(d => i18n.t(d, d)).join(', ');
    overallReason = i18n.t('ruleConditional', {
      count: missingDocuments.length,
      docs: docsStr,
      defaultValue: `Eligible based on profile criteria, but missing ${missingDocuments.length} document(s) in Document Vault (${docsStr}). Upload before applying on official portal.`
    });
  } else if (failedCriteria.length === 1) {
    status = 'Almost Eligible';
    overallReason = i18n.t('ruleAlmostEligible', {
      criteria: failedCriteria[0],
      defaultValue: `Almost eligible! You are missing one requirement: ${failedCriteria[0]}`
    });
  } else {
    status = 'Not Eligible';
    const critStr = failedCriteria.join('; ');
    overallReason = i18n.t('ruleNotEligible', {
      criteria: critStr,
      defaultValue: `Does not meet core requirements: ${critStr}`
    });
  }

  return {
    schemeId: scheme.id,
    status,
    matchedCriteria,
    failedCriteria,
    missingDocuments,
    overallReason
  };
}
