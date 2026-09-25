const fs = require('fs');
const path = require('path');
const https = require('https');

const localesDir = path.join(__dirname, '../public/locales');
const langs = fs.readdirSync(localesDir).filter(l => l !== 'en');

// A safer way to extract the scheme data
const tsCode = fs.readFileSync(path.join(__dirname, '../src/data/schemes.ts'), 'utf8');
const objMatch = tsCode.match(/export const schemes[^=]*=\s*(\[[\s\S]*?\]);\s*$/);
if (!objMatch) {
  console.error("Could not extract schemes array");
  process.exit(1);
}

// eval the array directly
let schemes;
try {
  // Mock the types if any are used, but schemes.ts probably just uses plain objects
  schemes = eval(objMatch[1]);
} catch (e) {
  console.error("Eval failed:", e);
  process.exit(1);
}

const stringsToTranslate = new Set();
const benefitsMap = {};

for (const s of schemes) {
  if (s.benefitsSummary) benefitsMap[`${s.id}_benefits`] = s.benefitsSummary;
  if (s.ministry) stringsToTranslate.add(s.ministry);
  if (s.department) stringsToTranslate.add(s.department);
  if (s.deadline) stringsToTranslate.add(s.deadline);
  if (s.state) stringsToTranslate.add(s.state);
  
  if (s.requiredDocuments) s.requiredDocuments.forEach(x => stringsToTranslate.add(x));
  if (s.applicationSteps) s.applicationSteps.forEach(x => stringsToTranslate.add(x));
  
  if (s.faqs) {
    s.faqs.forEach(f => {
      stringsToTranslate.add(f.question);
      stringsToTranslate.add(f.answer);
    });
  }
}

// Add ruleEngine strings that were dynamic
const ruleStrings = [
  "Age Requirement Met",
  "Gender requirement met",
  "Resident of",
  "Central Scheme open across India",
  "Occupation matches",
  "Land holding",
  "Social Category requirement met",
  "Disability criteria met",
  "Requires at least",
  "Requires disability certificate",
  "Restricted to",
  "Requires occupation like",
  "Income",
  "Age",
  "Targeted for",
  "Scheme restricted to",
  "Conditionally Eligible",
  "Eligible",
  "Not Eligible"
];
ruleStrings.forEach(s => stringsToTranslate.add(s));


async function translateText(text, targetLang) {
  return new Promise((resolve) => {
    const cleanText = text.replace(/\{\{[^}]+\}\}/g, 'X_VAR_X');
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

async function run() {
  const arrStrings = Array.from(stringsToTranslate);
  console.log(`Extracted ${arrStrings.length} strings to translate.`);
  
  for (const lang of langs) {
    const jsonPath = path.join(localesDir, lang, 'translation.json');
    if (!fs.existsSync(jsonPath)) continue;
    
    console.log(`Translating for ${lang}...`);
    const json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    let updated = false;

    for (const [key, text] of Object.entries(benefitsMap)) {
      if (!json[key] || json[key] === text || json[key].includes('????')) {
        json[key] = await translateText(text, lang);
        updated = true;
      }
    }

    for (const str of arrStrings) {
      if (!json[str] || json[str] === str || json[str].includes('????')) {
        json[str] = await translateText(str, lang);
        updated = true;
      }
    }

    if (updated) {
      fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2), 'utf8');
      console.log(`Saved ${lang}`);
    }
  }
}

run();
