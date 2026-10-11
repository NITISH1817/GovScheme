const fs = require('fs');
const path = require('path');
const https = require('https');

const localesDir = path.join(__dirname, '../public/locales');
const en = JSON.parse(fs.readFileSync(path.join(localesDir, 'en', 'translation.json'), 'utf8'));

// Target languages to fully translate
const targetLangs = ['mr', 'gu', 'hi', 'ta', 'te', 'ml'];

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
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Special dictionary for common words/names that must not be lost
const protectedNames = {
  appName: 'GovScheme AI',
  PAN: 'PAN'
};

async function processLanguage(lng) {
  const jsonPath = path.join(localesDir, lng, 'translation.json');
  if (!fs.existsSync(jsonPath)) return;

  const currentJson = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  let updatedCount = 0;

  console.log(`\n================ Processing language: ${lng} ================`);

  // Find all keys that are in English (or missing from en)
  const keysToTranslate = [];
  for (const [k, val] of Object.entries(currentJson)) {
    if (protectedNames[k]) continue;
    if (typeof val !== 'string') continue;

    // Check if it's identical to English or has Latin letters without local script
    const isEnglish = (val === en[k] && /[a-zA-Z]{3,}/.test(val)) ||
                      (!/[\u0900-\u0D7F]/.test(val) && /[a-zA-Z]{3,}/.test(val));

    if (isEnglish) {
      keysToTranslate.push({ key: k, text: en[k] || val });
    }
  }

  // Also check keys present in `en` but missing in `lng`
  for (const [k, enVal] of Object.entries(en)) {
    if (protectedNames[k]) continue;
    if (typeof enVal === 'string' && !currentJson[k]) {
      keysToTranslate.push({ key: k, text: enVal });
    }
  }

  console.log(`Found ${keysToTranslate.length} keys to translate for ${lng}`);

  // Process in small batches
  for (let i = 0; i < keysToTranslate.length; i++) {
    const { key, text } = keysToTranslate[i];
    try {
      const translated = await translateText(text, lng);
      if (translated && translated !== text) {
        currentJson[key] = translated;
        updatedCount++;
      } else {
        currentJson[key] = translated;
      }
      if (i % 20 === 0) {
        process.stdout.write(`.`);
      }
      await sleep(40); // small delay to respect rate limits
    } catch (err) {
      console.error(`Error on key "${key}":`, err.message);
    }
  }

  fs.writeFileSync(jsonPath, JSON.stringify(currentJson, null, 2), 'utf8');
  console.log(`\nCompleted ${lng}: successfully updated ${updatedCount} keys!`);
}

async function run() {
  for (const lng of targetLangs) {
    await processLanguage(lng);
  }
  console.log('\nAll language translation passes completed!');
}

run();
