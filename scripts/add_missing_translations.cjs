const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../public/locales');
const langs = ['en', 'hi', 'ml', 'ta', 'te'];

const newKeys = {
  en: {
    "maxAnnualIncome": "Max Annual Income",
    "state_TamilNadu": "Tamil Nadu",
    "PAN": "PAN",
    "Aadhaar": "Aadhaar",
    "Ration Card": "Ration Card",
    "Upload": "Upload",
    "documentsReady": "documents ready",
    "scan": "Scan"
  },
  ta: {
    "maxAnnualIncome": "அதிகபட்ச ஆண்டு வருமானம்",
    "state_TamilNadu": "தமிழ்நாடு",
    "PAN": "பான்",
    "Aadhaar": "ஆதார்",
    "Ration Card": "ரேஷன் கார்டு",
    "Upload": "பதிவேற்றவும்",
    "documentsReady": "ஆவணங்கள் தயார்",
    "scan": "ஸ்கேன்"
  },
  hi: {
    "maxAnnualIncome": "अधिकतम वार्षिक आय",
    "state_TamilNadu": "तमिलनाडु",
    "PAN": "पैन",
    "Aadhaar": "आधार",
    "Ration Card": "राशन कार्ड",
    "Upload": "अपलोड करें",
    "documentsReady": "दस्तावेज़ तैयार हैं",
    "scan": "स्कैन"
  },
  ml: {
    "maxAnnualIncome": "പരമാവധി വാർഷിക വരുമാനം",
    "state_TamilNadu": "തമിഴ്നാട്",
    "PAN": "പാൻ",
    "Aadhaar": "ആധാർ",
    "Ration Card": "റേഷൻ കാർഡ്",
    "Upload": "അപ്‌ലോഡ് ചെയ്യുക",
    "documentsReady": "രേഖകൾ തയ്യാറാണ്",
    "scan": "സ്കാൻ ചെയ്യുക"
  },
  te: {
    "maxAnnualIncome": "గరిష్ట వార్షిక ఆదాయం",
    "state_TamilNadu": "తమిళనాడు",
    "PAN": "పాన్",
    "Aadhaar": "ఆధార్",
    "Ration Card": "రేషన్ కార్డు",
    "Upload": "అప్‌లోడ్ చేయండి",
    "documentsReady": "పత్రాలు సిద్ధంగా ఉన్నాయి",
    "scan": "స్కాన్ చేయండి"
  }
};

for (const lang of langs) {
  const filePath = path.join(localesDir, lang, 'translation.json');
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    Object.assign(data, newKeys[lang]);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated ${lang} translations.`);
  } else {
    console.log(`File not found: ${filePath}`);
  }
}
