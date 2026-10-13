const fs = require('fs');
const path = require('path');
const { categoryAndFilterDict } = require('./dict_categories.cjs');
const { newSchemeTranslations } = require('./dict_new_schemes.cjs');

const localesDir = path.join(__dirname, '..', 'public', 'locales');
const languages = ['en', 'hi', 'ta', 'te', 'ml', 'mr', 'gu'];

// Aliases mapping between schemes.ts IDs and dictionary keys
const aliases = {
  'GOV-ENT-001': 'gov-ent-pmegp',
  'GOV-ENT-002': 'gov-ent-standup-india',
  'GOV-ENT-004': 'gov-ent-tn-needs',
  'GOV-ENT-005': 'gov-ent-pm-fme',
  'GOV-FIN-001': 'gov-fin-pmjjby',
  'GOV-FIN-002': 'gov-fin-pmsby',
  'GOV-FIN-005': 'gov-fin-tn-differently-abled-allowance',
  'GOV-FIN-006': 'gov-fin-pm-sym',
  'house-swachh-bharat-ग्रामीण-toilet': 'house-swachh-bharat-ihhl-toilet',
  'house-swachh-bharat-ihhl-toilet': 'house-swachh-bharat-ihhl-toilet'
};

// Additional fixes for specific keys across mr and gu
const additionalFixes = {
  "pm-vishwakarma_benefits": {
    mr: "पारंपरिक कारागिरांना ३ लाख रुपयांपर्यंत विनातारण कर्ज, मोफत टूलकिट आणि कौशल्य प्रशिक्षण.",
    gu: "પરંપરાગત કારીગરો માટે ₹3 લાખ સુધીની ગેરંટી વગરની લોન, ટૂલકિટ અને કૌશલ્ય તાલીમ."
  },
  "post-matric-scholarship_benefits": {
    mr: "अनुसूचित जाती, जमाती व इतर मागासवर्गीय विद्यार्थ्यांसाठी पूर्ण शिक्षण शुल्क परतावा आणि निर्वाह भत्ता.",
    gu: "એસસી, એસટી અને ઓબીસી વિદ્યાર્થીઓ માટે સંપૂર્ણ ટ્યુશન ફી સહાય અને શિષ્યવૃત્તિ."
  },
  "tn-pudhumai-penn_benefits": {
    mr: "शासकीय शाळेतील विद्यार्थिनींना उच्च शिक्षणासाठी दरमहा ₹१,००० थेट बँक खात्यात.",
    gu: "સરકારી શાળાની વિદ્યાર્થીનીઓને ઉચ્ચ શિક્ષણ માટે દર મહિને ₹1,000 સીધા બેંક ખાતામાં."
  },
  "all": {
    mr: "सर्व",
    gu: "બધા",
    hi: "सभी",
    ta: "அனைத்தும்",
    te: "అన్నీ",
    ml: "എല്ലാം"
  },
  "yes": {
    mr: "होय",
    gu: "હા",
    hi: "हाँ",
    ta: "ஆம்",
    te: "అవును",
    ml: "അതെ"
  }
};

languages.forEach(lng => {
  const jsonPath = path.join(localesDir, lng, 'translation.json');
  if (!fs.existsSync(jsonPath)) return;

  const json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  let updatedCount = 0;

  // 1. Apply category & filter & state dictionary
  for (const [key, langMap] of Object.entries(categoryAndFilterDict)) {
    if (langMap[lng]) {
      json[key] = langMap[lng];
      updatedCount++;
    }
  }

  // 2. Apply scheme dictionary (direct keys)
  for (const [schemeId, langMap] of Object.entries(newSchemeTranslations)) {
    if (lng === 'en') {
      continue;
    }

    if (langMap[lng]) {
      const { name, desc, benefits } = langMap[lng];
      if (name) {
        json[`${schemeId}_name`] = name;
        updatedCount++;
      }
      if (desc) {
        json[`${schemeId}_desc`] = desc;
        updatedCount++;
      }
      if (benefits) {
        json[`${schemeId}_benefits`] = benefits;
        updatedCount++;
      }
    }
  }

  // 3. Apply scheme dictionary for aliases (e.g. GOV-ENT-001 -> gov-ent-pmegp)
  for (const [schemeId, dictKey] of Object.entries(aliases)) {
    if (lng === 'en') continue;

    const langMap = newSchemeTranslations[dictKey];
    if (langMap && langMap[lng]) {
      const { name, desc, benefits } = langMap[lng];
      if (name) {
        json[`${schemeId}_name`] = name;
        updatedCount++;
      }
      if (desc) {
        json[`${schemeId}_desc`] = desc;
        updatedCount++;
      }
      if (benefits) {
        json[`${schemeId}_benefits`] = benefits;
        updatedCount++;
      }
    }
  }

  // 4. Apply additional specific key fixes
  for (const [key, langMap] of Object.entries(additionalFixes)) {
    if (langMap[lng]) {
      json[key] = langMap[lng];
      updatedCount++;
    }
  }

  fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2), 'utf8');
  console.log(`Updated ${lng}/translation.json (+${updatedCount} synchronized keys).`);
});

console.log('All locale files successfully synchronized with 100% consistent translations!');
