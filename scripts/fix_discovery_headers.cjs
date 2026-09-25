const fs = require('fs');

function replaceInFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  for (const [target, replacement] of replacements) {
    content = content.replace(target, replacement);
  }
  fs.writeFileSync(filePath, content, 'utf8');
}

// 1. Fix SchemeDiscovery untranslated text
replaceInFile('src/components/SchemeDiscovery.tsx', [
  ['<span>NATIONAL WELFARE SCHEME DISCOVERY PORTAL</span>', '<span>{t("portalTagline", "NATIONAL WELFARE SCHEME DISCOVERY PORTAL")}</span>']
]);

// 2. Inject Tamil translations for the header
const taPath = 'public/locales/ta/translation.json';
const taJSON = JSON.parse(fs.readFileSync(taPath, 'utf8'));

Object.assign(taJSON, {
  "portalTagline": "தேசிய நலத்திட்ட கண்டறியும் தளம்",
  "discoverSchemes": "திட்டங்களைக் கண்டறியவும்",
  "discoverSchemesDesc": "உங்கள் சரிபார்க்கப்பட்ட சுயவிவரத் தரவின் அடிப்படையில் AI பரிந்துரைக்கப்பட்ட திட்டங்கள்."
});

fs.writeFileSync(taPath, JSON.stringify(taJSON, null, 2), 'utf8');
console.log('Fixed Discovery headers!');
