// server/services/schemeRecommendationEngine.js
// Modules 8 & 9: Deterministic Government Scheme Eligibility Matching & Recommendation Engine
// Accurately evaluates candidate schemes against confirmed user attributes without false exclusions.

export function normalizeProfile(rawProfile = {}) {
  if (!rawProfile || typeof rawProfile !== 'object') {
    return {
      age: null,
      gender: null,
      income: null,
      annualIncome: null,
      state: null,
      district: null,
      occupation: null,
      socialCategory: null,
      category: null,
      education: null,
      educationLevel: null,
      isStudent: null,
      isFarmer: null,
      isDifferentlyAbled: null,
      hasDisability: null,
      isFirstGraduate: null,
      landHoldingAcres: null
    };
  }

  const p = rawProfile;
  const rawAge = p.age !== undefined && p.age !== null && p.age !== '' ? Number(p.age) : null;
  const age = rawAge !== null && !isNaN(rawAge) ? rawAge : null;

  const rawIncome = p.income !== undefined && p.income !== null && p.income !== ''
    ? Number(p.income)
    : (p.annualIncome !== undefined && p.annualIncome !== null && p.annualIncome !== '' ? Number(p.annualIncome) : null);
  const income = rawIncome !== null && !isNaN(rawIncome) ? rawIncome : null;

  const rawLand = p.landHoldingAcres !== undefined && p.landHoldingAcres !== null && p.landHoldingAcres !== ''
    ? Number(p.landHoldingAcres)
    : null;
  const landHoldingAcres = rawLand !== null && !isNaN(rawLand) ? rawLand : null;

  const occupation = p.occupation ? String(p.occupation).trim() : null;
  const occLower = occupation ? occupation.toLowerCase() : '';

  const isStudent = p.isStudent !== undefined && p.isStudent !== null
    ? Boolean(p.isStudent)
    : (occLower ? occLower.includes('student') : null);

  const isFarmer = p.isFarmer !== undefined && p.isFarmer !== null
    ? Boolean(p.isFarmer)
    : (occLower ? (occLower.includes('farmer') || occLower.includes('agriculture') || occLower.includes('cultivator')) : null);

  const isDifferentlyAbled = p.isDifferentlyAbled !== undefined && p.isDifferentlyAbled !== null
    ? Boolean(p.isDifferentlyAbled)
    : (p.hasDisability !== undefined && p.hasDisability !== null ? Boolean(p.hasDisability) : null);

  const socialCategory = p.socialCategory ? String(p.socialCategory).trim() : (p.category ? String(p.category).trim() : null);
  const education = p.education ? String(p.education).trim() : (p.educationLevel ? String(p.educationLevel).trim() : null);

  return {
    ...p,
    age,
    gender: p.gender ? String(p.gender).trim() : null,
    income,
    annualIncome: income,
    state: p.state ? String(p.state).trim() : null,
    district: p.district ? String(p.district).trim() : null,
    occupation,
    socialCategory,
    category: socialCategory,
    education,
    educationLevel: education,
    isStudent,
    isFarmer,
    isDifferentlyAbled,
    hasDisability: isDifferentlyAbled,
    isFirstGraduate: p.isFirstGraduate !== undefined && p.isFirstGraduate !== null ? Boolean(p.isFirstGraduate) : null,
    landHoldingAcres
  };
}

export function evaluateSchemeEligibility(scheme, rawProfile) {
  const profile = normalizeProfile(rawProfile);
  const er = scheme.eligibilityRules || {};

  const satisfiedConditions = [];
  const failedConditions = [];
  const informationNeeded = [];

  // 1. Age Evaluation
  const minAge = scheme.minimumAge ?? er.minAge ?? er.ageMin ?? 0;
  const maxAge = scheme.maximumAge ?? er.maxAge ?? er.ageMax ?? 120;

  if (profile.age !== null && profile.age !== undefined && !isNaN(profile.age)) {
    if (profile.age >= minAge && profile.age <= maxAge) {
      satisfiedConditions.push(`Age ${profile.age} is within required range (${minAge}-${maxAge} years)`);
    } else {
      failedConditions.push(`Age ${profile.age} is outside eligible range (${minAge}-${maxAge} years)`);
    }
  } else {
    if (minAge > 0 || maxAge < 120) {
      informationNeeded.push(`Age verification required (Scheme applies to ${minAge}-${maxAge} years)`);
    }
  }

  // 2. Income Evaluation
  const rawLimit = scheme.incomeLimit ?? er.maxAnnualIncome ?? er.incomeLimit;
  const incomeLimit = typeof rawLimit === "number" && rawLimit > 0 ? rawLimit : null;

  if (incomeLimit !== null) {
    if (profile.income !== null && profile.income !== undefined && !isNaN(profile.income)) {
      if (profile.income <= incomeLimit) {
        satisfiedConditions.push(`Annual income ₹${profile.income.toLocaleString('en-IN')} is within maximum ceiling of ₹${incomeLimit.toLocaleString('en-IN')}`);
      } else {
        failedConditions.push(`Annual income ₹${profile.income.toLocaleString('en-IN')} exceeds the scheme ceiling of ₹${incomeLimit.toLocaleString('en-IN')}`);
      }
    } else {
      informationNeeded.push(`Annual family income confirmation required (Must be ≤ ₹${incomeLimit.toLocaleString('en-IN')})`);
    }
  }

  // 3. Gender Requirements
  const rawGender = scheme.genderRequirements ?? er.allowedGenders ?? er.gender ?? ['All'];
  const genderReqs = Array.isArray(rawGender) ? rawGender : [String(rawGender)];
  const isGenderRestricted = genderReqs.length > 0 && !genderReqs.some(g => ['all', 'any'].includes(g.toLowerCase()));

  if (isGenderRestricted) {
    if (profile.gender) {
      const match = genderReqs.some(g => {
        const gNorm = g.trim().toLowerCase();
        const pNorm = profile.gender.trim().toLowerCase();
        return gNorm === pNorm || 
          (gNorm === 'women' && pNorm === 'female') || 
          (gNorm === 'female' && pNorm === 'women') ||
          (gNorm === 'men' && pNorm === 'male') ||
          (gNorm === 'male' && pNorm === 'men');
      });
      if (match) {
        satisfiedConditions.push(`Gender requirement matched (${genderReqs.join(', ')})`);
      } else {
        failedConditions.push(`Restricted to ${genderReqs.join(', ')} (Profile indicates ${profile.gender})`);
      }
    } else {
      informationNeeded.push(`Gender confirmation required (${genderReqs.join(', ')})`);
    }
  }

  // 4. State / Nativity Requirements
  const stateReqs = scheme.state && scheme.state !== 'Central' && scheme.state !== 'All'
    ? [scheme.state]
    : (er.allowedStates && er.allowedStates.length > 0 && !er.allowedStates.includes('All') ? er.allowedStates : (scheme.residenceRequirements?.states || []));
  const isStateRestricted = (scheme.governmentLevel === 'State' || (scheme.state && scheme.state !== 'Central' && scheme.state !== 'All')) && stateReqs.length > 0 && !stateReqs.includes('All India');

  if (isStateRestricted) {
    if (profile.state) {
      const stateMatch = stateReqs.some(s => s.toLowerCase() === profile.state.toLowerCase() || profile.state.toLowerCase().includes('tamil nadu') && s.toLowerCase().includes('tamil nadu'));
      if (stateMatch) {
        satisfiedConditions.push(`Resident of eligible state (${profile.state})`);
      } else {
        failedConditions.push(`State-specific scheme for ${stateReqs.join(', ')} (Profile state: ${profile.state})`);
      }
    } else {
      informationNeeded.push(`State of residence required (${stateReqs.join(', ')})`);
    }
  }

  // 5. Social Category (SC/ST/OBC/MBC/BC/General)
  const rawCats = scheme.applicableSocialCategories ?? er.allowedCategories ?? ['All'];
  const catReqs = Array.isArray(rawCats) ? rawCats : [String(rawCats || 'All')];
  const isCatRestricted = catReqs.length > 0 && !catReqs.some(c => ['all', 'any'].includes(c.toLowerCase()));

  if (isCatRestricted) {
    if (profile.socialCategory) {
      const catMatch = catReqs.some(c => {
        const cLower = c.trim().toLowerCase();
        const pLower = profile.socialCategory.trim().toLowerCase();
        if (cLower === pLower) return true;
        // Known aliases
        if ((cLower === 'sc' && pLower === 'scheduled caste') || (cLower === 'scheduled caste' && pLower === 'sc')) return true;
        if ((cLower === 'st' && pLower === 'scheduled tribe') || (cLower === 'scheduled tribe' && pLower === 'st')) return true;
        if ((cLower === 'obc' && pLower === 'other backward class') || (cLower === 'other backward class' && pLower === 'obc')) return true;
        if ((cLower === 'mbc' && pLower === 'most backward class') || (cLower === 'most backward class' && pLower === 'mbc')) return true;
        if ((cLower === 'bc' && pLower === 'backward class') || (cLower === 'backward class' && pLower === 'bc')) return true;
        return false;
      });
      if (catMatch) {
        satisfiedConditions.push(`Social category requirement matched (${profile.socialCategory})`);
      } else {
        failedConditions.push(`Eligible social categories are ${catReqs.join(', ')} (Profile: ${profile.socialCategory})`);
      }
    } else {
      informationNeeded.push(`Community / social category check needed (${catReqs.join(', ')})`);
    }
  }

  // 6. Student Requirement
  const studentReq = scheme.studentRequirements;
  const isStudentScheme = studentReq === "Yes" || (typeof studentReq === "object" && studentReq?.required === true) || scheme.category === 'Education' || scheme.category === 'Education & Skill' || (er.allowedOccupations && er.allowedOccupations.some(o => /student/i.test(o)));
  const effectiveIsStudent = profile.isStudent !== undefined && profile.isStudent !== null
    ? Boolean(profile.isStudent)
    : (profile.occupation ? profile.occupation.toLowerCase().includes('student') : null);

  if (isStudentScheme) {
    if (effectiveIsStudent === true) {
      satisfiedConditions.push(`Confirmed active student status`);
    } else if (effectiveIsStudent === false) {
      failedConditions.push(`Scheme requires active student status`);
    } else {
      informationNeeded.push(`Student status needs to be confirmed`);
    }
  }

  // 7. Farmer Requirement
  const farmerReq = scheme.farmerRequirements;
  const isFarmerScheme = farmerReq === "Yes" || (typeof farmerReq === "object" && farmerReq?.required === true) || scheme.category === 'Agriculture' || scheme.category === 'Agriculture & Farmers' || (er.allowedOccupations && er.allowedOccupations.some(o => /farmer|cultivator/i.test(o)));
  const effectiveIsFarmer = profile.isFarmer !== undefined && profile.isFarmer !== null
    ? Boolean(profile.isFarmer)
    : (profile.occupation ? (profile.occupation.toLowerCase().includes('farmer') || profile.occupation.toLowerCase().includes('agriculture') || profile.occupation.toLowerCase().includes('cultivator')) : null);

  if (isFarmerScheme) {
    if (effectiveIsFarmer === true) {
      satisfiedConditions.push(`Confirmed farmer / agricultural status`);
    } else if (effectiveIsFarmer === false) {
      failedConditions.push(`Scheme requires farmer / cultivator status`);
    } else {
      informationNeeded.push(`Farmer / landholder status needs confirmation`);
    }
  }

  // 8. Occupation Requirements (Canonical allowedOccupations / eligibleOccupations)
  const rawOccupations = scheme.eligibleOccupations ?? er.allowedOccupations ?? ['All'];
  const occReqs = Array.isArray(rawOccupations) ? rawOccupations : [String(rawOccupations)];
  const isOccRestricted = occReqs.length > 0 && !occReqs.some(o => ['all', 'any'].includes(String(o).toLowerCase()));

  if (isOccRestricted) {
    const studentMatchesOcc = (profile.isStudent === true || profile.occupation?.toLowerCase().includes('student')) && occReqs.some(o => String(o).toLowerCase().includes('student'));
    const farmerMatchesOcc = (profile.isFarmer === true || profile.occupation?.toLowerCase().includes('farmer')) && occReqs.some(o => String(o).toLowerCase().includes('farmer') || String(o).toLowerCase().includes('cultivator'));

    if (studentMatchesOcc || farmerMatchesOcc) {
      satisfiedConditions.push(`Occupation requirement matched (${studentMatchesOcc ? 'Student' : 'Farmer'})`);
    } else if (profile.occupation) {
      const pOcc = profile.occupation.trim().toLowerCase();
      const occMatch = occReqs.some(o => {
        const oNorm = String(o).trim().toLowerCase();
        return oNorm === pOcc || oNorm.includes(pOcc) || pOcc.includes(oNorm);
      });
      if (occMatch) {
        satisfiedConditions.push(`Occupation requirement matched (${profile.occupation})`);
      } else {
        failedConditions.push(`Restricted to occupations: ${occReqs.join(', ')} (Profile indicates ${profile.occupation})`);
      }
    } else {
      informationNeeded.push(`Occupation verification required (${occReqs.join(', ')})`);
    }
  }

  // 9. Disability Requirement
  const disReq = scheme.disabilityRequirements;
  const isDisabilityScheme = disReq === "Yes" || (typeof disReq === "string" && disReq.toLowerCase().startsWith('yes')) || (typeof disReq === "object" && disReq?.required === true) || er.requiresDisability === true;

  if (isDisabilityScheme) {
    if (profile.isDifferentlyAbled === true) {
      satisfiedConditions.push(`Confirmed differently-abled status (UDID / Medical Certificate required)`);
    } else if (profile.isDifferentlyAbled === false) {
      failedConditions.push(`Scheme is exclusively for differently-abled beneficiaries`);
    } else {
      informationNeeded.push(`Disability / UDID status needs verification`);
    }
  }

  // 10. First Graduate Requirement
  const fgReq = scheme.firstGraduateRequirements;
  const isFgScheme = fgReq === "Yes" || (typeof fgReq === "object" && fgReq?.required === true);

  if (isFgScheme) {
    if (profile.isFirstGraduate === true) {
      satisfiedConditions.push(`First generation graduate status confirmed`);
    } else if (profile.isFirstGraduate === false) {
      failedConditions.push(`Scheme strictly for first generation graduate in family`);
    } else {
      informationNeeded.push(`First graduate certificate status needs confirmation`);
    }
  }

  // 11. Land Holding Ceiling
  const maxLand = scheme.landHoldingLimit ?? er.maxLandHoldingAcres;
  if (maxLand !== undefined && maxLand !== null && typeof maxLand === 'number' && maxLand > 0 && maxLand < 900) {
    const userLand = profile.landHoldingAcres ?? 0;
    if (userLand <= maxLand) {
      satisfiedConditions.push(`Land holding ${userLand} acres is within ceiling of ${maxLand} acres`);
    } else {
      failedConditions.push(`Land holding ${userLand} acres exceeds maximum allowed ${maxLand} acres`);
    }
  }

  // Determine Match Status
  // Statuses: 'ELIGIBLE_POTENTIAL_MATCH' | 'NEEDS_MORE_INFORMATION' | 'DOES_NOT_MATCH'
  let matchStatus = 'ELIGIBLE_POTENTIAL_MATCH';
  let matchScore = 80;

  if (failedConditions.length > 0) {
    matchStatus = 'DOES_NOT_MATCH';
    matchScore = 15;
  } else if (informationNeeded.length > 0) {
    matchStatus = 'NEEDS_MORE_INFORMATION';
    matchScore = Math.max(30, 85 - (informationNeeded.length * 15));
  } else {
    matchStatus = 'ELIGIBLE_POTENTIAL_MATCH';
    matchScore = Math.min(100, 85 + (satisfiedConditions.length * 3));
  }

  // Generate Deterministic Explanation (Module 9 Requirement)
  let explanation = "";
  if (matchStatus === 'ELIGIBLE_POTENTIAL_MATCH') {
    explanation = `This scheme is a strong potential match based on your confirmed profile attributes (${satisfiedConditions.slice(0, 3).join("; ")}). Official application requires verified supporting documents.`;
  } else if (matchStatus === 'NEEDS_MORE_INFORMATION') {
    explanation = `This scheme may match your profile, but requires additional details (${informationNeeded.slice(0, 2).join("; ")}) before eligibility can be conclusively determined.`;
  } else {
    explanation = `You do not currently meet the published mandatory eligibility criteria for this scheme (${failedConditions[0]}).`;
  }

  return {
    schemeId: scheme.schemeId || scheme.id,
    id: scheme.id || scheme.schemeId,
    schemeName: scheme.schemeName || scheme.name,
    name: scheme.name || scheme.schemeName,
    category: scheme.category,
    ministry: scheme.ministry || scheme.department,
    benefits: scheme.benefits,
    benefitAmount: scheme.benefitAmount,
    matchStatus,
    matchScore,
    isEligible: matchStatus === 'ELIGIBLE_POTENTIAL_MATCH',
    satisfiedConditions,
    failedConditions,
    informationNeeded,
    explanation,
    requiredDocuments: scheme.requiredDocuments || scheme.documentsRequired || [],
    applicationMode: scheme.applicationMode,
    officialWebsite: scheme.officialWebsite,
    officialApplicationUrl: scheme.officialApplicationUrl || scheme.applyURL,
    sourceUrl: scheme.sourceUrl,
    lastVerifiedAt: scheme.lastVerifiedAt,
    legalDisclaimer: "This automated recommendation is advisory and does not constitute official government approval or benefit sanction."
  };
}

export function recommendSchemesForProfile(schemes, rawProfile, filters = {}) {
  const profile = normalizeProfile(rawProfile);
  const evaluated = schemes.map(s => evaluateSchemeEligibility(s, profile));

  // Apply filters if provided
  let filtered = evaluated;

  if (filters.category && filters.category !== "All") {
    filtered = filtered.filter(r => r.category.toLowerCase() === filters.category.toLowerCase());
  }

  if (filters.matchStatus && filters.matchStatus !== "All") {
    filtered = filtered.filter(r => r.matchStatus === filters.matchStatus);
  }

  // Exclude hard failed schemes unless user explicitly requests all
  if (!filters.includeNonMatching) {
    filtered = filtered.filter(r => r.matchStatus !== 'DOES_NOT_MATCH');
  }

  // Sort: Potential Matches first by score descending, then Needs More Information
  filtered.sort((a, b) => b.matchScore - a.matchScore);

  return {
    totalEvaluated: evaluated.length,
    matchingCount: evaluated.filter(r => r.matchStatus === 'ELIGIBLE_POTENTIAL_MATCH').length,
    needsInfoCount: evaluated.filter(r => r.matchStatus === 'NEEDS_MORE_INFORMATION').length,
    ineligibleCount: evaluated.filter(r => r.matchStatus === 'DOES_NOT_MATCH').length,
    recommendations: filtered
  };
}
