const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../public/locales');
const langs = ['en', 'hi', 'ml', 'ta', 'te'];

const missingKeys = {
  en: {
    "viewMyRecommendations": "View My Recommendations",
    "demographic": "Demographic",
    "needAffinity": "Need/Affinity",
    "financial": "Financial",
    "documentsReady": "documents ready",
    "state_TamilNadu": "Tamil Nadu",
    "state_Maharashtra": "Maharashtra",
    "state_Kerala": "Kerala",
    "state_Karnataka": "Karnataka",
    "filterLevel_Central": "Central",
    "filterLevel_State": "State",
    "allStates": "All States",
    "govtLevel": "Government Level",
    "location": "Location",
    "category": "Category",
    "missingDoc": "Missing Document:",
    "pleaseUpload": "Please upload this document to your vault.",
    "officialVerified": "Verified Official Source",
    "matchDesc": "AI-driven confidence based on profile factors."
  },
  hi: {
    "viewMyRecommendations": "मेरी अनुशंसाएं देखें",
    "demographic": "जनसांख्यिकी",
    "needAffinity": "आवश्यकता/लगाव",
    "financial": "वित्तीय",
    "documentsReady": "दस्तावेज़ तैयार हैं",
    "state_TamilNadu": "तमिलनाडु",
    "state_Maharashtra": "महाराष्ट्र",
    "state_Kerala": "केरल",
    "state_Karnataka": "कर्नाटक",
    "filterLevel_Central": "केंद्रीय",
    "filterLevel_State": "राज्य",
    "allStates": "सभी राज्य",
    "govtLevel": "सरकारी स्तर",
    "location": "स्थान",
    "category": "श्रेणी",
    "missingDoc": "दस्तावेज़ गायब:",
    "pleaseUpload": "कृपया इस दस्तावेज़ को अपने वॉल्ट में अपलोड करें।",
    "officialVerified": "सत्यापित आधिकारिक स्रोत",
    "matchDesc": "प्रोफ़ाइल कारकों के आधार पर AI-संचालित विश्वास।"
  },
  ml: {
    "viewMyRecommendations": "എൻ്റെ ശുപാർശകൾ കാണുക",
    "demographic": "ജനസംഖ്യാശാസ്ത്രം",
    "needAffinity": "ആവശ്യം/താല്പര്യം",
    "financial": "സാമ്പത്തികം",
    "documentsReady": "രേഖകൾ തയ്യാറാണ്",
    "state_TamilNadu": "തമിഴ്നാട്",
    "state_Maharashtra": "മഹാരാഷ്ട്ര",
    "state_Kerala": "കേരളം",
    "state_Karnataka": "കർണ്ണാടക",
    "filterLevel_Central": "കേന്ദ്രം",
    "filterLevel_State": "സംസ്ഥാനം",
    "allStates": "എല്ലാ സംസ്ഥാനങ്ങളും",
    "govtLevel": "സർക്കാർ തലം",
    "location": "സ്ഥലം",
    "category": "വിഭാഗം",
    "missingDoc": "രേഖ കാണുന്നില്ല:",
    "pleaseUpload": "ദയവായി ഈ രേഖ നിങ്ങളുടെ വോൾട്ടിലേക്ക് അപ്‌ലോഡ് ചെയ്യുക.",
    "officialVerified": "സ്ഥിരീകരിച്ച ഔദ്യോഗിക ഉറവിടം",
    "matchDesc": "പ്രൊഫൈൽ ഘടകങ്ങളെ അടിസ്ഥാനമാക്കിയുള്ള AI-അധിഷ്ഠിത വിശ്വാസം."
  },
  ta: {
    "viewMyRecommendations": "எனது பரிந்துரைகளைக் காண்க",
    "demographic": "மக்கள் தொகை",
    "needAffinity": "தேவை/விருப்பம்",
    "financial": "நிதி",
    "documentsReady": "ஆவணங்கள் தயார்",
    "state_TamilNadu": "தமிழ்நாடு",
    "state_Maharashtra": "மகாராஷ்டிரா",
    "state_Kerala": "கேரளா",
    "state_Karnataka": "கர்நாடகா",
    "filterLevel_Central": "மத்திய",
    "filterLevel_State": "மாநில",
    "allStates": "அனைத்து மாநிலங்கள்",
    "govtLevel": "அரசு நிலை",
    "location": "இடம்",
    "category": "வகை",
    "missingDoc": "ஆவணம் விடுபட்டுள்ளது:",
    "pleaseUpload": "இந்த ஆவணத்தை உங்கள் பெட்டகத்தில் பதிவேற்றவும்.",
    "officialVerified": "சரிபார்க்கப்பட்ட அதிகாரப்பூர்வ மூலங்கள்",
    "matchDesc": "சுயவிவர காரணிகளின் அடிப்படையில் AI- உந்துதல் நம்பிக்கை."
  },
  te: {
    "viewMyRecommendations": "నా సిఫార్సులను చూడండి",
    "demographic": "జనాభా",
    "needAffinity": "అవసరం/అనుబంధం",
    "financial": "ఆర్థిక",
    "documentsReady": "పత్రాలు సిద్ధంగా ఉన్నాయి",
    "state_TamilNadu": "తమిళనాడు",
    "state_Maharashtra": "మహారాష్ట్ర",
    "state_Kerala": "కేరళ",
    "state_Karnataka": "కర్ణాటక",
    "filterLevel_Central": "కేంద్ర",
    "filterLevel_State": "రాష్ట్ర",
    "allStates": "అన్ని రాష్ట్రాలు",
    "govtLevel": "ప్రభుత్వ స్థాయి",
    "location": "స్థానం",
    "category": "వర్గం",
    "missingDoc": "పత్రం లేదు:",
    "pleaseUpload": "దయచేసి ఈ పత్రాన్ని మీ వాల్ట్‌కు అప్‌లోడ్ చేయండి.",
    "officialVerified": "ధృవీకరించబడిన అధికారిక మూలం",
    "matchDesc": "ప్రొఫైల్ కారకాల ఆధారంగా AI-ఆధారిత విశ్వాసం."
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
