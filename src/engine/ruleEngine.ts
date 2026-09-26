import { UserProfile, Scheme, RuleEvaluationResult } from '../types';
import i18n from '../i18n';

export function evaluateSchemeEligibility(user: UserProfile, scheme: Scheme): RuleEvaluationResult {
  // Safely extract rules (backend uses ageMin, frontend uses minAge)
  const rules = scheme.eligibilityRules || {};
  const matchedCriteria: string[] = [];
  const failedCriteria: string[] = [];
  const missingDocuments: string[] = [];

  const minAge = rules.minAge ?? rules.ageMin;
  const maxAge = rules.maxAge ?? rules.ageMax;
  if (minAge !== undefined || maxAge !== undefined) {
    const finalMin = minAge ?? 0;
    const finalMax = maxAge ?? 120;
    if (user.age >= finalMin && user.age <= finalMax) {
      matchedCriteria.push(`${i18n.t('Age Requirement Met', 'Age Requirement Met')} (${user.age} yrs within ${finalMin}-${finalMax} range)`);
    } else {
      failedCriteria.push(i18n.t('ruleAgeFailed', { userAge: user.age, minAge: finalMin, maxAge: finalMax, defaultValue: `Age ${user.age} yrs does not satisfy required range (${finalMin}-${finalMax} yrs)` }));
    }
  }

  if (rules.allowedGenders && rules.allowedGenders.length > 0 && !rules.allowedGenders.includes('All')) {
    if (rules.allowedGenders.includes(user.gender)) {
      matchedCriteria.push(`${i18n.t('Gender requirement met', 'Gender requirement met')} (${i18n.t(user.gender, user.gender)})`);
    } else {
      failedCriteria.push(`Targeted for ${rules.allowedGenders.map((g: string) => i18n.t(g, g)).join(', ')} (User is ${i18n.t(user.gender, user.gender)})`);
    }
  }

  if (scheme.state !== 'Central' && rules.allowedStates && rules.allowedStates.length > 0) {
    const stateMatched = rules.allowedStates.some((s: string) => s.toLowerCase() === user.state.toLowerCase());
    if (stateMatched) {
      matchedCriteria.push(`${i18n.t('Resident of', 'Resident of')} ${i18n.t(user.state, user.state)}`);
    } else {
      failedCriteria.push(`Scheme restricted to ${rules.allowedStates.map((s: string) => i18n.t(s, s)).join(', ')} (User in ${i18n.t(user.state, user.state)})`);
    }
  } else if (scheme.state === 'Central') {
    matchedCriteria.push(i18n.t('Central Scheme open across India', 'Central Scheme open across India'));
  }

  const maxIncome = rules.maxAnnualIncome ?? rules.incomeLimit;
  if (maxIncome !== undefined && maxIncome > 0) {
    if (user.annualIncome <= maxIncome) {
      matchedCriteria.push(`${i18n.t('Income', 'Income')} ₹${user.annualIncome.toLocaleString('en-IN')}/yr below limit of ₹${maxIncome.toLocaleString('en-IN')}/yr`);
    } else {
      failedCriteria.push(`${i18n.t('Income', 'Income')} ₹${user.annualIncome.toLocaleString('en-IN')}/yr exceeds upper threshold of ₹${maxIncome.toLocaleString('en-IN')}/yr`);
    }
  }

  if (rules.allowedOccupations && rules.allowedOccupations.length > 0) {
    const occupationMatched = rules.allowedOccupations.some((occ: string) => 
      occ.toLowerCase().includes(user.occupation.toLowerCase()) || 
      user.occupation.toLowerCase().includes(occ.toLowerCase())
    );
    if (occupationMatched) {
      matchedCriteria.push(`${i18n.t('Occupation matches', 'Occupation matches')} (${i18n.t(user.occupation, user.occupation)})`);
    } else {
      failedCriteria.push(`Requires occupation like ${rules.allowedOccupations.map((o: string) => i18n.t(o, o)).join(', ')} (User is ${i18n.t(user.occupation, user.occupation)})`);
    }
  }

  if (rules.maxLandHoldingAcres !== undefined) {
    if (user.landHoldingAcres <= rules.maxLandHoldingAcres) {
      matchedCriteria.push(i18n.t('ruleLandMet', { userLand: user.landHoldingAcres, maxLand: rules.maxLandHoldingAcres, defaultValue: `Land holding ${user.landHoldingAcres} acres within ceiling of ${rules.maxLandHoldingAcres} acres` }));
    } else {
      failedCriteria.push(i18n.t('ruleLandFailed', { userLand: user.landHoldingAcres, maxLand: rules.maxLandHoldingAcres, defaultValue: `Land holding ${user.landHoldingAcres} acres exceeds limit of ${rules.maxLandHoldingAcres} acres` }));
    }
  }

  if (rules.allowedCategories && rules.allowedCategories.length > 0 && !rules.allowedCategories.includes('All')) {
    if (rules.allowedCategories.includes(user.category)) {
      matchedCriteria.push(`${i18n.t('Social Category requirement met', 'Social Category requirement met')} (${i18n.t(user.category, user.category)})`);
    } else {
      failedCriteria.push(`Restricted to ${rules.allowedCategories.map((c: string) => i18n.t(c, c)).join(', ')} (User category: ${i18n.t(user.category, user.category)})`);
    }
  }

  if (rules.requiresDisability) {
    if (user.hasDisability) {
      const minPerc = rules.minDisabilityPercentage ?? 40;
      const userPerc = user.disabilityPercentage ?? 40;
      if (userPerc >= minPerc) {
        matchedCriteria.push(`Disability criteria met (${userPerc}% >= ${minPerc}%)`);
      } else {
        failedCriteria.push(`Requires at least ${minPerc}% disability (User certified at ${userPerc}%)`);
      }
    } else {
      failedCriteria.push(i18n.t('ruleDisabilityFailedCert', 'Requires disability certificate'));
    }
  }

  const uploadedDocTypes = user.documents.map(d => d.type);
  const docsList = scheme.requiredDocuments || (scheme as any).documentsRequired || [];
  
  docsList.forEach((reqDoc: string) => {
    const isDocPresent = uploadedDocTypes.some(docType => 
      reqDoc.toLowerCase().includes(docType.toLowerCase()) || docType.toLowerCase().includes(reqDoc.toLowerCase())
    );
    if (!isDocPresent) {
      missingDocuments.push(reqDoc);
    }
  });

  let status: 'Eligible' | 'Conditionally Eligible' | 'Not Eligible';
  let overallReason = '';

  if (failedCriteria.length === 0 && missingDocuments.length === 0) {
    status = 'Eligible';
    overallReason = i18n.t('ruleEligible', { count: matchedCriteria.length, defaultValue: `Full eligibility verified! All ${matchedCriteria.length} criteria met and all required documents present in Document Vault.` });
  } else if (failedCriteria.length === 0 && missingDocuments.length > 0) {
    status = 'Conditionally Eligible';
    const docsStr = missingDocuments.map(d => i18n.t(d, d)).join(', ');
    overallReason = i18n.t('ruleConditional', { count: missingDocuments.length, docs: docsStr, defaultValue: `Eligible based on profile criteria, but missing ${missingDocuments.length} document(s) in Document Vault (${docsStr}). Upload before applying on official portal.` });
  } else {
    status = 'Not Eligible';
    const critStr = failedCriteria.map(c => i18n.t(c, c)).join('; ');
    overallReason = i18n.t('ruleNotEligible', { criteria: critStr, defaultValue: `Does not meet core requirements: ${critStr}` });
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
