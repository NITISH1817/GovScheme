const fs = require('fs');
const path = require('path');
const https = require('https');

const localesDir = path.join(__dirname, '../public/locales');
const langs = fs.readdirSync(localesDir).filter(l => l !== 'en');

const categories = [
  "Agriculture & Farmers",
  "Housing & Shelter",
  "Health & Healthcare",
  "Women & Child",
  "Education & Students",
  "Social Security & Pension",
  "Business & Entrepreneurship",
  "Employment & Skilling",
  "Disability & Special Needs"
];

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
          resolve(text);
        }
      });
    }).on('error', (e) => resolve(text));
  });
}

async function run() {
  for (const lang of langs) {
    const jsonPath = path.join(localesDir, lang, 'translation.json');
    if (!fs.existsSync(jsonPath)) continue;
    
    console.log(`Processing categories for ${lang}...`);
    const json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    let updated = false;
    for (const cat of categories) {
      if (!json[cat]) {
        console.log(`Translating ${cat} to ${lang}`);
        json[cat] = await translateText(cat, lang);
        updated = true;
      }
    }

    if (updated) {
      fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2), 'utf8');
      console.log(`Updated ${lang} categories!`);
    }
    
    await new Promise(r => setTimeout(r, 1000));
  }
  console.log('All categories translated!');
}

run();
