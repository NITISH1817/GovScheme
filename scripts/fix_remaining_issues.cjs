const fs = require('fs');

function replaceInFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  for (const [target, replacement] of replacements) {
    content = content.replace(target, replacement);
  }
  fs.writeFileSync(filePath, content, 'utf8');
}

// 1. Fix ApplicationTracker
replaceInFile('src/components/ApplicationTracker.tsx', [
  ['{app.schemeName}', '{t(`${app.schemeId}_name`, app.schemeName)}']
]);

// 2. Fix SchemeDiscovery search placeholder
replaceInFile('src/components/SchemeDiscovery.tsx', [
  [`placeholder={t('searchSchemes', 'Search for schemes, e.g. "Agriculture", "Housing"')}`, `placeholder={t('searchPlaceholder', 'Search for schemes, e.g. "Agriculture", "Housing"')}`]
]);

// 3. Fix Footer
replaceInFile('src/components/Footer.tsx', [
  ['<span>{link.name}</span>', '<span>{t(link.name, link.name)}</span>'],
  ['<span>PM-KISAN Helpline: <strong>155261 / 011-24300606</strong></span>', '<span>{t("PM-KISAN Helpline", "PM-KISAN Helpline")}: <strong>155261 / 011-24300606</strong></span>'],
  ['<span>Ayushman Bharat: <strong>14555</strong></span>', '<span>{t("Ayushman Bharat", "Ayushman Bharat")}: <strong>14555</strong></span>'],
  ['<span>National Pension Portal: <strong>1800-11-0001</strong></span>', '<span>{t("National Pension Portal", "National Pension Portal")}: <strong>1800-11-0001</strong></span>']
]);

// 4. Inject Tamil translations for Footer
const taPath = 'public/locales/ta/translation.json';
const taJSON = JSON.parse(fs.readFileSync(taPath, 'utf8'));

Object.assign(taJSON, {
  "PM-KISAN Portal": "பிஎம்-கிசான் போர்டல்",
  "PMAY-G Rural Housing": "பிஎம்ஏஒய்-ஜி ஊரக வீடுகள்",
  "Ayushman Bharat PMJAY": "ஆயுஷ்மான் பாரத் பிஎம்ஜேஏஒய்",
  "National Scholarship Portal": "தேசிய உதவித்தொகை போர்டல்",
  "DigiLocker Govt Vault": "டிஜிலாக்கர் அரசு ஆவண பெட்டகம்",
  "UMANG Citizen Services": "உமாங் குடிமக்கள் சேவைகள்",
  "PM-KISAN Helpline": "பிஎம்-கிசான் உதவி எண்",
  "Ayushman Bharat": "ஆயுஷ்மான் பாரத்",
  "National Pension Portal": "தேசிய ஓய்வூதிய போர்டல்"
});

fs.writeFileSync(taPath, JSON.stringify(taJSON, null, 2), 'utf8');
console.log('Fixed ApplicationTracker, SchemeDiscovery, Footer, and translations!');
