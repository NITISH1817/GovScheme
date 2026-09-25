const fs = require('fs');
const path = require('path');
const https = require('https');

const localesDir = path.join(__dirname, '../public/locales');
const langs = fs.readdirSync(localesDir).filter(l => l !== 'en');

const engStrings = {
  "ruleEligible": "Full eligibility verified! All {{count}} criteria met and all required documents present in Document Vault.",
  "ruleConditional": "Eligible based on profile criteria, but missing {{count}} document(s) in Document Vault ({{docs}}). Upload before applying on official portal.",
  "ruleNotEligible": "Does not meet core requirements: {{criteria}}",
  "ministryOfAgri": "Ministry of Agriculture & Farmers Welfare",
  "deptOfAgri": "Department of Agriculture & Farmers Welfare"
};

async function translateText(text, targetLang) {
  return new Promise((resolve) => {
    // strip interpolation tags for translation
    let cleanText = text.replace(/\{\{[^}]+\}\}/g, 'X_VAR_X');
    
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(cleanText)}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          let translated = json[0].map(item => item[0]).join('');
          
          // restore variables (simple sequential replacement since there are max 2)
          const matches = text.match(/\{\{[^}]+\}\}/g) || [];
          for (const match of matches) {
            translated = translated.replace('X_VAR_X', match);
          }
          
          resolve(translated);
        } catch (e) {
          resolve(text);
        }
      });
    }).on('error', () => resolve(text));
  });
}

async function run() {
  for (const lang of langs) {
    const jsonPath = path.join(localesDir, lang, 'translation.json');
    if (!fs.existsSync(jsonPath)) continue;
    
    console.log(`Processing rule engine reasons for ${lang}...`);
    const json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    let updated = false;

    for (const [key, text] of Object.entries(engStrings)) {
      if (!json[key]) {
        console.log(`Translating ${key}...`);
        json[key] = await translateText(text, lang);
        updated = true;
      }
    }

    if (updated) {
      fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2), 'utf8');
      console.log(`Updated ${lang}!`);
    }
  }
  
  // Now modify ruleEngine.ts
  const enginePath = path.join(__dirname, '../src/engine/ruleEngine.ts');
  let engineCode = fs.readFileSync(enginePath, 'utf8');
  
  if (!engineCode.includes('import i18n from')) {
    engineCode = `import i18n from '../i18n';\n` + engineCode;
  }
  
  engineCode = engineCode.replace(
    /overallReason = `Full eligibility verified! All \$\{matchedCriteria\.length\} criteria met and all required documents present in Document Vault\.`;/,
    "overallReason = i18n.t('ruleEligible', { count: matchedCriteria.length, defaultValue: `Full eligibility verified! All ${matchedCriteria.length} criteria met and all required documents present in Document Vault.` });"
  );
  
  engineCode = engineCode.replace(
    /overallReason = `Eligible based on profile criteria, but missing \$\{missingDocuments\.length\} document\(s\) in Document Vault \(\$\{missingDocuments\.join\(\', \'\)\}\)\. Upload before applying on official portal\.`;/,
    "const docsStr = missingDocuments.map(d => i18n.t(d, d)).join(', ');\n    overallReason = i18n.t('ruleConditional', { count: missingDocuments.length, docs: docsStr, defaultValue: `Eligible based on profile criteria, but missing ${missingDocuments.length} document(s) in Document Vault (${docsStr}). Upload before applying on official portal.` });"
  );
  
  engineCode = engineCode.replace(
    /overallReason = `Does not meet core requirements: \$\{failedCriteria\.join\('; '\)\}`;/,
    "const critStr = failedCriteria.map(c => i18n.t(c, c)).join('; ');\n    overallReason = i18n.t('ruleNotEligible', { criteria: critStr, defaultValue: `Does not meet core requirements: ${critStr}` });"
  );

  fs.writeFileSync(enginePath, engineCode, 'utf8');
  console.log('Fixed ruleEngine.ts');
}

run();
