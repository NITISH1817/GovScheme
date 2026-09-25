const fs = require('fs');
const path = require('path');
const https = require('https');

const localesDir = path.join(__dirname, '../public/locales');
const langs = fs.readdirSync(localesDir).filter(l => l !== 'en');

// Parse schemes.ts to extract all strings
// It's a TS file, we can't just require it easily. 
// A better way is to compile it or evaluate it. 
// Let's just read it and use regex or eval after removing typescript types.

const tsCode = fs.readFileSync(path.join(__dirname, '../src/data/schemes.ts'), 'utf8');

// We can extract JSON-like object by removing imports and exports
let jsCode = tsCode.replace(/import.*?;\n/g, '')
                   .replace(/export\s+const\s+schemes:\s*Scheme\[\]\s*=\s*/, 'module.exports = ')
                   .replace(/export\s+const\s+schemes\s*=\s*/, 'module.exports = ')
                   .replace(/;\s*$/, '');
                   
// Wait, schemes.ts has TS types. 
// Let's just regex all the string fields we need:
// benefitsSummary, ministry, department, deadline, state, requiredDocuments, applicationSteps, question, answer

const getMatches = (regex, text) => {
  const matches = [];
  let m;
  while ((m = regex.exec(text)) !== null) {
    matches.push(m[1].trim());
  }
  return [...new Set(matches)]; // unique
}

const extractArrayStrings = (key, text) => {
  const regex = new RegExp(`${key}:\\s*\\[([^\\]]+)\\]`, 'g');
  const strings = [];
  let m;
  while ((m = regex.exec(text)) !== null) {
    const arrStr = m[1];
    const strRegex = /"([^"]+)"/g;
    let sMatch;
    while ((sMatch = strRegex.exec(arrStr)) !== null) {
      strings.push(sMatch[1]);
    }
  }
  return [...new Set(strings)];
}

const stringsToTranslate = new Set();

const addMatches = (regex) => {
  getMatches(regex, jsCode).forEach(s => stringsToTranslate.add(s));
};

// benefitsSummary (we need id for the key)
// For benefitsSummary, we need specific keys `${scheme.id}_benefits`
const idRegex = /id:\s*"([^"]+)",[\s\S]*?benefitsSummary:\s*"([^"]+)"/g;
const benefitsMap = {};
let idMatch;
while ((idMatch = idRegex.exec(jsCode)) !== null) {
  benefitsMap[`${idMatch[1]}_benefits`] = idMatch[2];
}

addMatches(/ministry:\s*"([^"]+)"/g);
addMatches(/department:\s*"([^"]+)"/g);
addMatches(/deadline:\s*"([^"]+)"/g);
addMatches(/state:\s*"([^"]+)"/g);
addMatches(/question:\s*"([^"]+)"/g);
addMatches(/answer:\s*"([^"]+)"/g);

extractArrayStrings('requiredDocuments', jsCode).forEach(s => stringsToTranslate.add(s));
extractArrayStrings('applicationSteps', jsCode).forEach(s => stringsToTranslate.add(s));

async function translateText(text, targetLang) {
  return new Promise((resolve) => {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json[0].map(item => item[0]).join(''));
        } catch (e) {
          resolve(text);
        }
      });
    }).on('error', () => resolve(text));
  });
}

async function run() {
  const arrStrings = Array.from(stringsToTranslate);
  
  for (const lang of langs) {
    const jsonPath = path.join(localesDir, lang, 'translation.json');
    if (!fs.existsSync(jsonPath)) continue;
    
    console.log(`Processing deep translations for ${lang}...`);
    const json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    let updated = false;

    // benefits
    for (const [key, text] of Object.entries(benefitsMap)) {
      if (!json[key] || json[key] === text || json[key].includes('????')) {
        console.log(`Translating benefit ${key}...`);
        json[key] = await translateText(text, lang);
        updated = true;
      }
    }

    // other strings
    for (const str of arrStrings) {
      if (!json[str] || json[str] === str || json[str].includes('????')) {
        console.log(`Translating ${str.substring(0, 20)}...`);
        json[str] = await translateText(str, lang);
        updated = true;
      }
    }

    if (updated) {
      fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2), 'utf8');
      console.log(`Updated ${lang} deep translations!`);
    }
  }
  console.log('All deep translations completed!');
}

run();
