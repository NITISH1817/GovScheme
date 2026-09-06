export const evaluateEligibility = (userProfile, scheme) => {
  const schemeRules = scheme?.eligibilityRules || {};
  const dynamicRules = scheme?.dynamicRules || [];
  
  if (!schemeRules && dynamicRules.length === 0) return { isEligible: true, score: 100, missingDocuments: [] };

  let isEligible = true;
  let score = 100;
  const missingDocuments = [];
  const reasons = [];

  // Age Check
  if (userProfile.age) {
    if (schemeRules.ageMin && userProfile.age < schemeRules.ageMin) {
      isEligible = false;
      reasons.push(`Minimum age required is ${schemeRules.ageMin}, but you are ${userProfile.age}.`);
      score -= 20;
    }
    if (schemeRules.ageMax && userProfile.age > schemeRules.ageMax) {
      isEligible = false;
      reasons.push(`Maximum age allowed is ${schemeRules.ageMax}, but you are ${userProfile.age}.`);
      score -= 20;
    }
  }

  // Income Check
  if (schemeRules.incomeLimit && userProfile.annualIncome > schemeRules.incomeLimit) {
    isEligible = false;
    reasons.push(`Annual income must be below ₹${schemeRules.incomeLimit}, but yours is ₹${userProfile.annualIncome}.`);
    score -= 30;
  }

  // Gender Check
  if (schemeRules.gender && schemeRules.gender.length > 0 && !schemeRules.gender.includes('All')) {
    if (!schemeRules.gender.includes(userProfile.gender)) {
      isEligible = false;
      reasons.push(`This scheme is targeted for ${schemeRules.gender.join(', ')}.`);
      score -= 20;
    }
  }

  // Category Check
  if (schemeRules.category && schemeRules.category.length > 0 && !schemeRules.category.includes('All')) {
    if (!schemeRules.category.includes(userProfile.category)) {
      isEligible = false;
      reasons.push(`This scheme is for ${schemeRules.category.join(', ')} categories.`);
      score -= 20;
    }
  }

  // Disability Check
  if (schemeRules.disabilityRequired && !userProfile.disability) {
    isEligible = false;
    reasons.push(`This scheme requires a registered disability.`);
    score -= 30;
  }

  // Land Ownership
  if (schemeRules.landOwnershipMax && userProfile.landOwnership > schemeRules.landOwnershipMax) {
    isEligible = false;
    reasons.push(`Maximum land ownership allowed is ${schemeRules.landOwnershipMax} acres.`);
    score -= 20;
  }

  // Evaluate Dynamic Rules
  dynamicRules.forEach(rule => {
    let userVal = userProfile[rule.field];
    if (userVal === undefined && rule.field === 'income') userVal = userProfile.annualIncome; // mapping
    
    let ruleVal = rule.value;
    // Attempt numeric conversion for comparisons
    if (!isNaN(Number(ruleVal))) ruleVal = Number(ruleVal);
    
    let rulePassed = true;
    switch (rule.operator) {
      case '=': rulePassed = (userVal == ruleVal); break;
      case '!=': rulePassed = (userVal != ruleVal); break;
      case '>': rulePassed = (userVal > ruleVal); break;
      case '<': rulePassed = (userVal < ruleVal); break;
      case '>=': rulePassed = (userVal >= ruleVal); break;
      case '<=': rulePassed = (userVal <= ruleVal); break;
      case 'IN': 
        if (typeof ruleVal === 'string') {
          const arr = ruleVal.split(',').map(s => s.trim());
          rulePassed = arr.includes(String(userVal));
        }
        break;
      case 'NOT_IN':
        if (typeof ruleVal === 'string') {
          const arr = ruleVal.split(',').map(s => s.trim());
          rulePassed = !arr.includes(String(userVal));
        }
        break;
    }

    if (!rulePassed) {
      // Logic handling could be more complex, but for now ANY failed AND rule drops eligibility
      // If logic is OR, we'd need a more complex expression evaluator. Sticking to AND logic failure for simplicity
      if (rule.logic === 'AND' || rule.logic === undefined) {
        isEligible = false;
        reasons.push(`Does not meet requirement: ${rule.field} ${rule.operator} ${rule.value}`);
        score -= 10;
      }
    }
  });

  return {
    isEligible,
    score: Math.max(0, score),
    reasons,
    missingDocuments
  };
};
