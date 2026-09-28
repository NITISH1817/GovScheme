const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../public/locales');
const langs = ['en', 'hi', 'ml', 'ta', 'te'];

const missingKeys = {
  en: {
    "viewAll": "View all",
    "pmKisanSammanNidhi": "PM Kisan Samman Nidhi",
    "nationalFamilyBenefitScheme": "National Family Benefit Scheme",
    "agriculture": "Agriculture",
    "financial": "Financial",
    "amt6000PerYear": "₹6,000/year",
    "amt20000": "₹20,000"
  },
  hi: {
    "viewAll": "सभी देखें",
    "pmKisanSammanNidhi": "पीएम किसान सम्मान निधि",
    "nationalFamilyBenefitScheme": "राष्ट्रीय परिवार लाभ योजना",
    "agriculture": "कृषि",
    "financial": "वित्तीय",
    "amt6000PerYear": "₹6,000/वर्ष",
    "amt20000": "₹20,000"
  },
  ml: {
    "viewAll": "എല്ലാം കാണുക",
    "pmKisanSammanNidhi": "പിഎം കിസാൻ സമ്മാൻ നിധി",
    "nationalFamilyBenefitScheme": "ദേശീയ കുടുംബ ആനുകൂല്യ പദ്ധതി",
    "agriculture": "കൃഷി",
    "financial": "സാമ്പത്തികം",
    "amt6000PerYear": "₹6,000/വർഷം",
    "amt20000": "₹20,000"
  },
  ta: {
    "viewAll": "அனைத்தையும் காண்க",
    "pmKisanSammanNidhi": "பி.எம் கிசான் சம்மான் நிதி",
    "nationalFamilyBenefitScheme": "தேசிய குடும்ப நலத் திட்டம்",
    "agriculture": "விவசாயம்",
    "financial": "நிதி",
    "amt6000PerYear": "₹6,000/ஆண்டு",
    "amt20000": "₹20,000"
  },
  te: {
    "viewAll": "అన్నింటిని చూడండి",
    "pmKisanSammanNidhi": "పీఎం కిసాన్ సమ్మాన్ నిధి",
    "nationalFamilyBenefitScheme": "జాతీయ కుటుంబ ప్రయోజన పథకం",
    "agriculture": "వ్యవసాయం",
    "financial": "ఆర్థిక",
    "amt6000PerYear": "₹6,000/సంవత్సరం",
    "amt20000": "₹20,000"
  }
};

for (const lang of langs) {
  const filePath = path.join(localesDir, lang, 'translation.json');
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    Object.assign(data, missingKeys[lang]);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated ${lang} with missing ui translations.`);
  } else {
    console.log(`File not found: ${filePath}`);
  }
}
