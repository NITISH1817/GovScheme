const fs = require('fs');
const path = require('path');

const stateAllDict = {
  hi: "राज्य: सभी",
  ml: "സംസ്ഥാനം: എല്ലാം",
  ta: "மாநிலம்: அனைத்தும்",
  te: "రాష్ట్రం: అన్నీ"
};

const keyMapping = {
  "pmKisanHelpline": "PM-KISAN Helpline",
  "ayushmanBharat": "Ayushman Bharat",
  "nationalPensionPortal": "National Pension Portal"
};

const localesDir = path.join(__dirname, '../public/locales');
const langs = ['hi', 'te', 'ta', 'ml'];

for (const lang of langs) {
  const jsonPath = path.join(localesDir, lang, 'translation.json');
  if (fs.existsSync(jsonPath)) {
    const json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    // Rename keys
    for (const [oldKey, newKey] of Object.entries(keyMapping)) {
      if (json[oldKey]) {
        json[newKey] = json[oldKey];
        delete json[oldKey];
      }
    }
    
    // Add stateAll
    json["stateAll"] = stateAllDict[lang];
    
    fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2), 'utf8');
    console.log(`Fixed keys for ${lang}`);
  }
}
