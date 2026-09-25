const fs = require('fs');
const path = require('path');

const manualDict = {
  hi: {
    "PM-KISAN Portal": "पीएम-किसान पोर्टल",
    "PMAY-G Rural Housing": "पीएमएवाई-जी ग्रामीण आवास",
    "Ayushman Bharat PMJAY": "आयुष्मान भारत पीएमजेएवाई",
    "National Scholarship Portal": "राष्ट्रीय छात्रवृत्ति पोर्टल",
    "DigiLocker Govt Vault": "डिजिलॉकर सरकारी तिजोरी",
    "UMANG Citizen Services": "उमंग नागरिक सेवाएँ",
    "pmKisanHelpline": "पीएम-किसान हेल्पलाइन",
    "ayushmanBharat": "आयुष्मान भारत",
    "nationalPensionPortal": "राष्ट्रीय पेंशन पोर्टल",
    "Central": "मध्य",
    "ruleEligible": "पूर्ण पात्रता सत्यापित! सभी {{count}} मानदंड पूरे हुए और दस्तावेज़ वॉल्ट में सभी आवश्यक दस्तावेज़ मौजूद हैं।",
    "ruleConditional": "प्रोफ़ाइल मानदंड के आधार पर योग्य, लेकिन दस्तावेज़ वॉल्ट ({{count}}) में {{docs}} दस्तावेज़ मौजूद नहीं हैं। आधिकारिक पोर्टल पर आवेदन करने से पहले अपलोड करें।",
    "ruleNotEligible": "मूल आवश्यकताओं को पूरा नहीं करता है: {{criteria}}",
    "ruleLandMet": "भूमि जोत {{userLand}} एकड़, अधिकतम सीमा {{maxLand}} एकड़ के भीतर है",
    "ruleLandFailed": "भूमि जोत {{userLand}} एकड़, अधिकतम सीमा {{maxLand}} एकड़ से अधिक है",
    "ruleAgeFailed": "आयु {{userAge}} वर्ष आवश्यक सीमा ({{minAge}}-{{maxAge}} वर्ष) को पूरा नहीं करती है",
    "ruleDisabilityFailedCert": "विकलांगता प्रमाण पत्र की आवश्यकता है",
    "General": "सामान्य",
    "OBC": "ओबीसी",
    "SC": "अनुसूचित जाति",
    "ST": "अनुसूचित जनजाति",
    "Male": "पुरुष",
    "Female": "महिला",
    "Other": "अन्य"
  },
  te: {
    "PM-KISAN Portal": "పీఎం-కిసాన్ పోర్టల్",
    "PMAY-G Rural Housing": "పీఎంఏవై-జి గ్రామీణ గృహనిర్మాణం",
    "Ayushman Bharat PMJAY": "ఆయుష్మాన్ భారత్ పిఎంజెఏవై",
    "National Scholarship Portal": "జాతీయ స్కాలర్షిప్ పోర్టల్",
    "DigiLocker Govt Vault": "డిజిలాకర్ ప్రభుత్వ ఖజానా",
    "UMANG Citizen Services": "ఉమంగ్ పౌర సేవలు",
    "pmKisanHelpline": "పీఎం-కిసాన్ హెల్ప్‌లైన్",
    "ayushmanBharat": "ఆయుష్మాన్ భారత్",
    "nationalPensionPortal": "జాతీయ పెన్షన్ పోర్టల్",
    "Central": "సెంట్రల్",
    "ruleEligible": "పూర్తి అర్హత ధృవీకరించబడింది! అన్ని {{count}} ప్రమాణాలు నెరవేరాయి మరియు డాక్యుమెంట్ వాల్ట్‌లో అవసరమైన పత్రాలన్నీ ఉన్నాయి.",
    "ruleConditional": "ప్రొఫైల్ ప్రమాణాల ఆధారంగా అర్హత ఉంది, కానీ డాక్యుమెంట్ వాల్ట్ ({{count}})లో {{docs}} పత్రం(లు) లేదు. అధికారిక పోర్టల్‌లో దరఖాస్తు చేయడానికి ముందు అప్‌లోడ్ చేయండి.",
    "ruleNotEligible": "ప్రధాన అవసరాలను తీర్చలేదు: {{criteria}}",
    "ruleLandMet": "భూమి కమతం {{userLand}} ఎకరాలు, గరిష్ట పరిమితి {{maxLand}} ఎకరాల లోపు ఉంది",
    "ruleLandFailed": "భూమి కమతం {{userLand}} ఎకరాలు, గరిష్ట పరిమితి {{maxLand}} ఎకరాలను మించిపోయింది",
    "ruleAgeFailed": "వయస్సు {{userAge}} సంవత్సరాలు అవసరమైన పరిధి ({{minAge}}-{{maxAge}} సంవత్సరాలు)కి సరిపోలలేదు",
    "ruleDisabilityFailedCert": "వైకల్య ధృవీకరణ పత్రం అవసరం",
    "General": "జనరల్",
    "OBC": "ఓబీసీ",
    "SC": "ఎస్సీ",
    "ST": "ఎస్టీ",
    "Male": "పురుషుడు",
    "Female": "స్త్రీ",
    "Other": "ఇతరులు"
  },
  ta: {
    "PM-KISAN Portal": "பிஎம்-கிசான் போர்டல்",
    "PMAY-G Rural Housing": "பிஎம்ஏஒய்-ஜி ஊரக வீட்டுவசதி",
    "Ayushman Bharat PMJAY": "ஆயுஷ்மான் பாரத் பிஎம்ஜெஏஒய்",
    "National Scholarship Portal": "தேசிய உதவித்தொகை போர்டல்",
    "DigiLocker Govt Vault": "டிஜிலாக்கர் அரசு பெட்டகம்",
    "UMANG Citizen Services": "உமாங் குடிமக்கள் சேவைகள்",
    "pmKisanHelpline": "பிஎம்-கிசான் ஹெல்ப்லைன்",
    "ayushmanBharat": "ஆயுஷ்மான் பாரத்",
    "nationalPensionPortal": "தேசிய ஓய்வூதிய போர்டல்",
    "Central": "மத்திய",
    "ruleEligible": "முழுமையான தகுதி சரிபார்க்கப்பட்டது! அனைத்து {{count}} நிபந்தனைகளும் பூர்த்தி செய்யப்பட்டன மற்றும் ஆவண பெட்டகத்தில் தேவையான அனைத்து ஆவணங்களும் உள்ளன.",
    "ruleConditional": "சுயவிவர அளவுகோல்களின் அடிப்படையில் தகுதியுடையவர், ஆனால் ஆவண பெட்டகத்தில் {{count}} ஆவணம்(கள்) இல்லை ({{docs}}). அதிகாரப்பூர்வ போர்ட்டலில் விண்ணப்பிக்கும் முன் பதிவேற்றவும்.",
    "ruleNotEligible": "முக்கிய தேவைகளை பூர்த்தி செய்யவில்லை: {{criteria}}",
    "ruleLandMet": "நிலம் {{userLand}} ஏக்கர், அதிகபட்ச வரம்பான {{maxLand}} ஏக்கருக்குள் உள்ளது",
    "ruleLandFailed": "நிலம் {{userLand}} ஏக்கர், அதிகபட்ச வரம்பான {{maxLand}} ஏக்கரைத் தாண்டியுள்ளது",
    "ruleAgeFailed": "வயது {{userAge}} ஆண்டுகள் தேவையான வரம்பை ({{minAge}}-{{maxAge}} ஆண்டுகள்) பூர்த்தி செய்யவில்லை",
    "ruleDisabilityFailedCert": "ஊனமுற்றோர் சான்றிதழ் தேவை",
    "General": "பொது",
    "OBC": "ஓபிசி",
    "SC": "பட்டியல் சாதியினர் (SC)",
    "ST": "பழங்குடியினர் (ST)",
    "Male": "ஆண்",
    "Female": "பெண்",
    "Other": "மற்றவர்கள்"
  },
  ml: {
    "PM-KISAN Portal": "പിഎം-കിസാൻ പോർട്ടൽ",
    "PMAY-G Rural Housing": "പിഎംഎവൈ-ജി ഗ്രാമീണ ഭവനപദ്ധതി",
    "Ayushman Bharat PMJAY": "ആയുഷ്മാൻ ഭാരത് പിഎംജെഎവൈ",
    "National Scholarship Portal": "ദേശീയ സ്കോളർഷിപ്പ് പോർട്ടൽ",
    "DigiLocker Govt Vault": "ഡിജിലോക്കർ സർക്കാർ നിലവറ",
    "UMANG Citizen Services": "ഉമംഗ് പൗര സേവനങ്ങൾ",
    "pmKisanHelpline": "പിഎം-കിസാൻ ഹെൽപ്പ് ലൈൻ",
    "ayushmanBharat": "ആയുഷ്മാൻ ഭാരത്",
    "nationalPensionPortal": "ദേശീയ പെൻഷൻ പോർട്ടൽ",
    "Central": "സെൻട്രൽ",
    "ruleEligible": "പൂർണ്ണ യോഗ്യത ഉറപ്പാക്കി! എല്ലാ {{count}} മാനദണ്ഡങ്ങളും പാലിച്ചു, ഡോക്യുമെൻ്റ് വോൾട്ടിൽ ആവശ്യമായ എല്ലാ രേഖകളുമുണ്ട്.",
    "ruleConditional": "പ്രൊഫൈൽ മാനദണ്ഡത്തെ അടിസ്ഥാനമാക്കി യോഗ്യമാണ്, എന്നാൽ ഡോക്യുമെൻ്റ് വോൾട്ടിൽ {{count}} രേഖ(കൾ) കാണുന്നില്ല ({{docs}}). ഔദ്യോഗിക പോർട്ടലിൽ അപേക്ഷിക്കുന്നതിന് മുമ്പ് അപ്‌ലോഡ് ചെയ്യുക.",
    "ruleNotEligible": "പ്രധാന ആവശ്യകതകൾ പാലിക്കുന്നില്ല: {{criteria}}",
    "ruleLandMet": "ഭൂമി {{userLand}} ഏക്കർ, പരമാവധി പരിധിയായ {{maxLand}} ഏക്കറിനുള്ളിലാണ്",
    "ruleLandFailed": "ഭൂമി {{userLand}} ഏക്കർ, പരമാവധി പരിധിയായ {{maxLand}} ഏക്കർ കവിയുന്നു",
    "ruleAgeFailed": "പ്രായം {{userAge}} വർഷം ആവശ്യമായ പരിധി ({{minAge}}-{{maxAge}} വർഷം) പാലിക്കുന്നില്ല",
    "ruleDisabilityFailedCert": "വൈകല്യ സർട്ടിഫിക്കറ്റ് ആവശ്യമാണ്",
    "General": "ജനറൽ",
    "OBC": "ഒബിസി",
    "SC": "പട്ടികജാതി (SC)",
    "ST": "പട്ടികവർഗ്ഗം (ST)",
    "Male": "പുരുഷൻ",
    "Female": "സ്ത്രീ",
    "Other": "മറ്റുള്ളവ"
  }
};

const localesDir = path.join(__dirname, '../public/locales');

for (const [lang, translations] of Object.entries(manualDict)) {
  const jsonPath = path.join(localesDir, lang, 'translation.json');
  if (fs.existsSync(jsonPath)) {
    const json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    for (const [key, val] of Object.entries(translations)) {
      json[key] = val; // Force overwrite
    }
    fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2), 'utf8');
    console.log(`Injected ultimate translations for ${lang}`);
  }
}

// 2. Overwrite ruleEngine.ts completely with the final perfect version
const enginePath = path.join(__dirname, '../src/engine/ruleEngine.ts');
const newEngineCode = `import { UserProfile, Scheme, RuleEvaluationResult } from '../types';
import i18n from '../i18n';

export function evaluateSchemeEligibility(user: UserProfile, scheme: Scheme): RuleEvaluationResult {
  const rules = scheme.eligibilityRules;
  const matchedCriteria: string[] = [];
  const failedCriteria: string[] = [];
  const missingDocuments: string[] = [];

  if (rules.minAge !== undefined || rules.maxAge !== undefined) {
    const minAge = rules.minAge ?? 0;
    const maxAge = rules.maxAge ?? 120;
    if (user.age >= minAge && user.age <= maxAge) {
      matchedCriteria.push(\`\${i18n.t('Age Requirement Met', 'Age Requirement Met')} (\${user.age} yrs within \${minAge}-\${maxAge} range)\`);
    } else {
      failedCriteria.push(i18n.t('ruleAgeFailed', { userAge: user.age, minAge, maxAge, defaultValue: \`Age \${user.age} yrs does not satisfy required range (\${minAge}-\${maxAge} yrs)\` }));
    }
  }

  if (rules.allowedGenders && rules.allowedGenders.length > 0 && !rules.allowedGenders.includes('All')) {
    if (rules.allowedGenders.includes(user.gender)) {
      matchedCriteria.push(\`\${i18n.t('Gender requirement met', 'Gender requirement met')} (\${i18n.t(user.gender, user.gender)})\`);
    } else {
      failedCriteria.push(\`Targeted for \${rules.allowedGenders.map(g => i18n.t(g, g)).join(', ')} (User is \${i18n.t(user.gender, user.gender)})\`);
    }
  }

  if (scheme.state !== 'Central' && rules.allowedStates && rules.allowedStates.length > 0) {
    const stateMatched = rules.allowedStates.some(s => s.toLowerCase() === user.state.toLowerCase());
    if (stateMatched) {
      matchedCriteria.push(\`\${i18n.t('Resident of', 'Resident of')} \${i18n.t(user.state, user.state)}\`);
    } else {
      failedCriteria.push(\`Scheme restricted to \${rules.allowedStates.map(s => i18n.t(s, s)).join(', ')} (User in \${i18n.t(user.state, user.state)})\`);
    }
  } else if (scheme.state === 'Central') {
    matchedCriteria.push(i18n.t('Central Scheme open across India', 'Central Scheme open across India'));
  }

  if (rules.maxAnnualIncome !== undefined) {
    if (user.annualIncome <= rules.maxAnnualIncome) {
      matchedCriteria.push(\`\${i18n.t('Income', 'Income')} ₹\${user.annualIncome.toLocaleString('en-IN')}/yr below limit of ₹\${rules.maxAnnualIncome.toLocaleString('en-IN')}/yr\`);
    } else {
      failedCriteria.push(\`\${i18n.t('Income', 'Income')} ₹\${user.annualIncome.toLocaleString('en-IN')}/yr exceeds upper threshold of ₹\${rules.maxAnnualIncome.toLocaleString('en-IN')}/yr\`);
    }
  }

  if (rules.allowedOccupations && rules.allowedOccupations.length > 0) {
    const occupationMatched = rules.allowedOccupations.some(occ => 
      occ.toLowerCase().includes(user.occupation.toLowerCase()) || 
      user.occupation.toLowerCase().includes(occ.toLowerCase())
    );
    if (occupationMatched) {
      matchedCriteria.push(\`\${i18n.t('Occupation matches', 'Occupation matches')} (\${i18n.t(user.occupation, user.occupation)})\`);
    } else {
      failedCriteria.push(\`Requires occupation like \${rules.allowedOccupations.map(o => i18n.t(o, o)).join(', ')} (User is \${i18n.t(user.occupation, user.occupation)})\`);
    }
  }

  if (rules.maxLandHoldingAcres !== undefined) {
    if (user.landHoldingAcres <= rules.maxLandHoldingAcres) {
      matchedCriteria.push(i18n.t('ruleLandMet', { userLand: user.landHoldingAcres, maxLand: rules.maxLandHoldingAcres, defaultValue: \`Land holding \${user.landHoldingAcres} acres within ceiling of \${rules.maxLandHoldingAcres} acres\` }));
    } else {
      failedCriteria.push(i18n.t('ruleLandFailed', { userLand: user.landHoldingAcres, maxLand: rules.maxLandHoldingAcres, defaultValue: \`Land holding \${user.landHoldingAcres} acres exceeds limit of \${rules.maxLandHoldingAcres} acres\` }));
    }
  }

  if (rules.allowedCategories && rules.allowedCategories.length > 0 && !rules.allowedCategories.includes('All')) {
    if (rules.allowedCategories.includes(user.category)) {
      matchedCriteria.push(\`\${i18n.t('Social Category requirement met', 'Social Category requirement met')} (\${i18n.t(user.category, user.category)})\`);
    } else {
      failedCriteria.push(\`Restricted to \${rules.allowedCategories.map(c => i18n.t(c, c)).join(', ')} (User category: \${i18n.t(user.category, user.category)})\`);
    }
  }

  if (rules.requiresDisability) {
    if (user.hasDisability) {
      const minPerc = rules.minDisabilityPercentage ?? 40;
      const userPerc = user.disabilityPercentage ?? 40;
      if (userPerc >= minPerc) {
        matchedCriteria.push(\`Disability criteria met (\${userPerc}% >= \${minPerc}%)\`);
      } else {
        failedCriteria.push(\`Requires at least \${minPerc}% disability (User certified at \${userPerc}%)\`);
      }
    } else {
      failedCriteria.push(i18n.t('ruleDisabilityFailedCert', 'Requires disability certificate'));
    }
  }

  const uploadedDocTypes = user.documents.map(d => d.type);
  scheme.requiredDocuments.forEach(reqDoc => {
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
    overallReason = i18n.t('ruleEligible', { count: matchedCriteria.length, defaultValue: \`Full eligibility verified! All \${matchedCriteria.length} criteria met and all required documents present in Document Vault.\` });
  } else if (failedCriteria.length === 0 && missingDocuments.length > 0) {
    status = 'Conditionally Eligible';
    const docsStr = missingDocuments.map(d => i18n.t(d, d)).join(', ');
    overallReason = i18n.t('ruleConditional', { count: missingDocuments.length, docs: docsStr, defaultValue: \`Eligible based on profile criteria, but missing \${missingDocuments.length} document(s) in Document Vault (\${docsStr}). Upload before applying on official portal.\` });
  } else {
    status = 'Not Eligible';
    const critStr = failedCriteria.map(c => i18n.t(c, c)).join('; ');
    overallReason = i18n.t('ruleNotEligible', { criteria: critStr, defaultValue: \`Does not meet core requirements: \${critStr}\` });
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
`;

fs.writeFileSync(enginePath, newEngineCode, 'utf8');
console.log('Fixed ruleEngine.ts definitively');
