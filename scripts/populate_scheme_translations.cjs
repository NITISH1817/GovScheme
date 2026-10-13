const fs = require('fs');
const path = require('path');
const https = require('https');

const localesDir = path.join(__dirname, '../public/locales');
const schemesFile = fs.readFileSync(path.join(__dirname, '../src/data/schemes.ts'), 'utf8');

// Parse schemesData
const jsCode = schemesFile
  .replace("import type { Scheme } from '../types';", '')
  .replace('export const schemesData: Scheme[] =', 'const schemesData =');
const fn = new Function(jsCode + '; return schemesData;');
const schemes = fn();

console.log(`Found ${schemes.length} schemes to sync translations for.`);

// 1. Read en translation
const enPath = path.join(localesDir, 'en', 'translation.json');
const enJson = JSON.parse(fs.readFileSync(enPath, 'utf8'));

let enAdded = 0;
schemes.forEach(s => {
  const nameKey = `${s.id}_name`;
  const descKey = `${s.id}_desc`;
  const benefitsKey = `${s.id}_benefits`;

  if (!enJson[nameKey]) {
    enJson[nameKey] = s.name;
    enAdded++;
  }
  if (!enJson[descKey]) {
    enJson[descKey] = s.shortDescription;
    enAdded++;
  }
  if (!enJson[benefitsKey]) {
    enJson[benefitsKey] = s.benefitsSummary;
    enAdded++;
  }
});

fs.writeFileSync(enPath, JSON.stringify(enJson, null, 2), 'utf8');
console.log(`Updated en/translation.json (+${enAdded} keys).`);

// Helper for quick translation via Google GTX
async function translateText(text, targetLang) {
  if (!text || typeof text !== 'string') return text;
  return new Promise((resolve) => {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const translated = json[0].map(item => item[0]).join('');
          resolve(translated || text);
        } catch (e) {
          resolve(text);
        }
      });
    }).on('error', () => resolve(text));
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// 2. Check expandSchemes for pre-existing native translations
let expandTranslations = {};
try {
  const { newSchemes } = require('./expandSchemes.cjs');
  newSchemes.forEach(s => {
    if (s.translations) {
      expandTranslations[s.id] = s.translations;
    }
  });
} catch (e) {}

// Process each language
const languages = ['hi', 'ta', 'te', 'ml', 'mr', 'gu'];

async function processAllLangs() {
  for (const lng of languages) {
    const langPath = path.join(localesDir, lng, 'translation.json');
    if (!fs.existsSync(langPath)) continue;

    const langJson = JSON.parse(fs.readFileSync(langPath, 'utf8'));
    let added = 0;

    console.log(`\nProcessing language: ${lng}...`);

    for (const s of schemes) {
      const nameKey = `${s.id}_name`;
      const descKey = `${s.id}_desc`;
      const benefitsKey = `${s.id}_benefits`;

      // If expand has native translation:
      if (expandTranslations[s.id] && expandTranslations[s.id][lng]) {
        const tr = expandTranslations[s.id][lng];
        if (!langJson[nameKey] || langJson[nameKey] === s.name) {
          langJson[nameKey] = tr.name || s.name;
          added++;
        }
        if (!langJson[descKey] || langJson[descKey] === s.shortDescription) {
          langJson[descKey] = tr.desc || s.shortDescription;
          added++;
        }
        if (!langJson[benefitsKey] || langJson[benefitsKey] === s.benefitsSummary) {
          langJson[benefitsKey] = tr.benefits || s.benefitsSummary;
          added++;
        }
      } else {
        // If missing or untranslated, set default or translated
        if (!langJson[nameKey]) {
          langJson[nameKey] = s.name;
          added++;
        }
        if (!langJson[descKey]) {
          langJson[descKey] = s.shortDescription;
          added++;
        }
        if (!langJson[benefitsKey]) {
          langJson[benefitsKey] = s.benefitsSummary;
          added++;
        }
      }
    }

    fs.writeFileSync(langPath, JSON.stringify(langJson, null, 2), 'utf8');
    console.log(`Updated ${lng}/translation.json (+${added} keys).`);
  }
  console.log('\nAll locale translations populated successfully!');
}

processAllLangs();
