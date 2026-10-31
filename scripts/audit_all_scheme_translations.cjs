const fs = require('fs');
let content = fs.readFileSync('src/data/schemes.ts', 'utf8');

// Strip TypeScript annotations
content = content.replace(/import type[^\n]+;/g, '');
content = content.replace(/export const schemesData: Scheme\[\]\s*=\s*/g, 'const schemesData = ');
content = content + '\nreturn schemesData;';

const schemes = new Function(content)();
console.log('Total parsed schemes:', schemes.length);

const langs = ['ta', 'hi', 'te', 'ml', 'mr', 'gu', 'en'];
const locales = {};
for (const lang of langs) {
  locales[lang] = JSON.parse(fs.readFileSync(`public/locales/${lang}/translation.json`, 'utf8'));
}

let grandMissing = 0;
for (const lang of langs) {
  let langMissing = 0;
  for (const s of schemes) {
    const nameKey = `${s.id}_name`;
    if (!locales[lang][nameKey]) {
      console.log(`[${lang}] Missing scheme name key: ${nameKey} (${s.name})`);
      langMissing++;
    }
    if (s.applicationSteps && s.applicationSteps.length > 0) {
      s.applicationSteps.forEach((step, idx) => {
        const stepKey = `${s.id}_step_${idx + 1}`;
        if (!locales[lang][stepKey]) {
          console.log(`[${lang}] Missing step key: ${stepKey}`);
          langMissing++;
        }
      });
    }
  }
  console.log(`[${lang}] Total missing keys: ${langMissing}`);
  grandMissing += langMissing;
}
console.log('GRAND TOTAL MISSING KEYS:', grandMissing);
