import fs from 'fs';
import path from 'path';
import { translations, languages } from '../src/data/translations.ts';

const localesDir = path.join(process.cwd(), 'public/locales');

if (!fs.existsSync(localesDir)) {
  fs.mkdirSync(localesDir, { recursive: true });
}

for (const lang of languages) {
  const code = lang.code;
  const data = translations[code];
  if (data) {
    const langDir = path.join(localesDir, code);
    if (!fs.existsSync(langDir)) {
      fs.mkdirSync(langDir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(langDir, 'translation.json'),
      JSON.stringify(data, null, 2)
    );
    console.log(`Generated locales/${code}/translation.json`);
  }
}
