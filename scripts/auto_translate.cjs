const fs = require('fs');
const path = require('path');
const https = require('https');

const localesDir = path.join(__dirname, '../public/locales');
const schemesDataPath = path.join(__dirname, '../src/data/schemes.ts');

// We need to parse schemes.ts to get english names and desc. 
// A quick regex approach:
const schemesContent = fs.readFileSync(schemesDataPath, 'utf8');
const schemeRegex = /id:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*shortDescription:\s*"([^"]+)"/g;
const schemes = [];
let match;
while ((match = schemeRegex.exec(schemesContent)) !== null) {
  schemes.push({
    id: match[1],
    name: match[2],
    desc: match[3]
  });
}

const langs = fs.readdirSync(localesDir).filter(l => l !== 'en' && l !== 'ta'); // We already did Tamil manually, and English is base

async function translateText(text, targetLang) {
  return new Promise((resolve, reject) => {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json[0].map(item => item[0]).join(''));
        } catch (e) {
          resolve(text); // Fallback to english on error
        }
      });
    }).on('error', (e) => resolve(text));
  });
}

async function run() {
  for (const lang of langs) {
    const jsonPath = path.join(localesDir, lang, 'translation.json');
    if (!fs.existsSync(jsonPath)) continue;
    
    console.log(`Processing language: ${lang}`);
    const json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    let updated = false;
    for (const scheme of schemes) {
      const nameKey = `${scheme.id}_name`;
      const descKey = `${scheme.id}_desc`;
      
      if (!json[nameKey] || json[nameKey] === scheme.name || json[nameKey].includes('????')) {
        console.log(`Translating ${nameKey} for ${lang}...`);
        json[nameKey] = await translateText(scheme.name, lang);
        updated = true;
      }
      if (!json[descKey] || json[descKey] === scheme.desc || json[descKey].includes('????')) {
        json[descKey] = await translateText(scheme.desc, lang);
        updated = true;
      }
    }
    
    // Also translate missing ML reasons
    const mlKeys = {
      "reasonEligible": "Highly recommended ({{score}}% match score). You satisfy all legal criteria as a {{occupation}} residing in {{state}}. Financial benefit of ₹{{benefit}} available upon application.",
      "reasonConditional": "Strong recommendation ({{score}}% match score). Your profile meets criteria, but you need to upload {{docs}} to complete verification before submitting on the official portal.",
      "reasonNotEligible": "Low match score ({{score}}%). Does not satisfy core requirements: {{criteria}}.",
      "Farmer": "Farmer",
      "searchPlaceholder": "Search for schemes, e.g. \"Agriculture\", \"Housing\"",
      "portalTagline": "NATIONAL WELFARE SCHEME DISCOVERY PORTAL",
      "discoverSchemes": "Discover Schemes",
      "discoverSchemesDesc": "AI-powered scheme recommendations based on your verified profile data."
    };

    for (const [key, text] of Object.entries(mlKeys)) {
      if (!json[key]) {
        console.log(`Translating ${key} for ${lang}...`);
        json[key] = await translateText(text, lang);
        updated = true;
      }
    }

    if (updated) {
      fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2), 'utf8');
      console.log(`Updated ${lang} translations!`);
    }
    
    // wait a bit to avoid rate limits
    await new Promise(r => setTimeout(r, 1500));
  }
  console.log('All done!');
}

run();
