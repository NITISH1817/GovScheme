const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../public/locales');
const langs = ['en', 'hi', 'ml', 'ta', 'te'];

const newKeys = {
  en: {
    "state_Kerala": "Kerala",
    "state_Karnataka": "Karnataka",
    "state_Maharashtra": "Maharashtra",
    "state_AndhraPradesh": "Andhra Pradesh",
    "state_Telangana": "Telangana",
    "state_UttarPradesh": "Uttar Pradesh",
    "state_Central": "Central"
  },
  ta: {
    "state_Kerala": "கேரளா",
    "state_Karnataka": "கர்நாடகா",
    "state_Maharashtra": "மகாராஷ்டிரா",
    "state_AndhraPradesh": "ஆந்திரப் பிரதேசம்",
    "state_Telangana": "தெலுங்கானா",
    "state_UttarPradesh": "உத்தரப் பிரதேசம்",
    "state_Central": "மத்திய"
  },
  hi: {
    "state_Kerala": "केरल",
    "state_Karnataka": "कर्नाटक",
    "state_Maharashtra": "महाराष्ट्र",
    "state_AndhraPradesh": "आंध्र प्रदेश",
    "state_Telangana": "तेलंगाना",
    "state_UttarPradesh": "उत्तर प्रदेश",
    "state_Central": "केंद्रीय"
  },
  ml: {
    "state_Kerala": "കേരളം",
    "state_Karnataka": "കർണാടക",
    "state_Maharashtra": "മഹാരാഷ്ട്ര",
    "state_AndhraPradesh": "ആന്ധ്രാപ്രദേശ്",
    "state_Telangana": "തെലങ്കാന",
    "state_UttarPradesh": "ഉത്തർപ്രദേശ്",
    "state_Central": "കേന്ദ്ര"
  },
  te: {
    "state_Kerala": "కేరళ",
    "state_Karnataka": "కర్ణాటక",
    "state_Maharashtra": "మహారాష్ట్ర",
    "state_AndhraPradesh": "ఆంధ్రప్రదేశ్",
    "state_Telangana": "తెలంగాణ",
    "state_UttarPradesh": "ఉత్తర ప్రదేశ్",
    "state_Central": "కేంద్ర"
  }
};

for (const lang of langs) {
  const filePath = path.join(localesDir, lang, 'translation.json');
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    Object.assign(data, newKeys[lang]);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated ${lang} translations with states.`);
  }
}
