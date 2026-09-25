const fs = require('fs');
const path = require('path');
const https = require('https');

const localesDir = path.join(__dirname, '../public/locales');
const langs = fs.readdirSync(localesDir).filter(l => l !== 'en');

const forceStrings = {
  "ruleEligible": "Full eligibility verified! All {{count}} criteria met and all required documents present in Document Vault.",
  "ruleConditional": "Eligible based on profile criteria, but missing {{count}} document(s) in Document Vault ({{docs}}). Upload before applying on official portal.",
  "ruleNotEligible": "Does not meet core requirements: {{criteria}}",
  "ministryOfAgri": "Ministry of Agriculture & Farmers Welfare",
  "deptOfAgri": "Department of Agriculture & Farmers Welfare",
  "PM-KISAN Portal": "PM-KISAN Portal",
  "PMAY-G Rural Housing": "PMAY-G Rural Housing",
  "Ayushman Bharat PMJAY": "Ayushman Bharat PMJAY",
  "National Scholarship Portal": "National Scholarship Portal",
  "DigiLocker Govt Vault": "DigiLocker Govt Vault",
  "UMANG Citizen Services": "UMANG Citizen Services",
  "pmKisanHelpline": "PM-KISAN Helpline",
  "ayushmanBharat": "Ayushman Bharat",
  "nationalPensionPortal": "National Pension Portal",
  "nationalRedirects": "National Portals Redirects",
  "nationalHelplines": "National Helplines",
  "guaranteedDisclaimer": "You may be eligible based on the information provided."
};

async function translateText(text, targetLang) {
  return new Promise((resolve) => {
    let cleanText = text.replace(/\{\{[^}]+\}\}/g, 'X_VAR_X');
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(cleanText)}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          let translated = json[0].map(item => item[0]).join('');
          
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

// Helper to check if text is predominantly English
function isMostlyEnglish(text) {
  if (text.includes("X_VAR_X")) return false; // Ignore our tags
  const engMatch = text.match(/[a-zA-Z]/g);
  if (!engMatch) return false;
  return engMatch.length > 10; 
}

async function run() {
  for (const lang of langs) {
    const jsonPath = path.join(localesDir, lang, 'translation.json');
    if (!fs.existsSync(jsonPath)) continue;
    
    console.log(`Forcing translations for ${lang}...`);
    const json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    let updated = false;

    for (const [key, text] of Object.entries(forceStrings)) {
      // Force translate if it's identical to english, or missing, or looks too English
      if (!json[key] || json[key] === text || isMostlyEnglish(json[key])) {
        console.log(`Force Translating ${key} to ${lang}...`);
        const result = await translateText(text, lang);
        // Only update if it actually translated something differently
        if (result !== text || lang === 'en') {
          json[key] = result;
          updated = true;
        } else {
           console.log(`Warning: Translation returned English for ${key} in ${lang}`);
        }
      }
    }

    if (updated) {
      fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2), 'utf8');
      console.log(`Updated ${lang}!`);
    }
  }
}

run();
