const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../public/locales');
const langs = ['en', 'hi', 'ml', 'ta', 'te'];

const newKeys = {
  en: {
    "Education": "Education",
    "Agriculture": "Agriculture",
    "Healthcare": "Healthcare",
    "Housing": "Housing",
    "Employment": "Employment",
    "Women & Child": "Women & Child",
    "Entrepreneurship": "Entrepreneurship",
    "Financial Help": "Financial Help",
    "Schemes Available": "Schemes Available",
    "Central & State Schemes": "Central & State Schemes",
    "Personalized Eligibility": "Personalized Eligibility",
    "Official Scheme Sources": "Official Scheme Sources",
    "Verified": "Verified",
    "AI Match": "AI Match",
    "100% Authentic": "100% Authentic",
    "Track on Official Portal": "Track on Official Portal",
    "Document Verification Checklist": "Document Verification Checklist",
    "Verified via DigiLocker": "Verified via DigiLocker",
    "NPCI Mapping Complete": "NPCI Mapping Complete",
    "Awaiting Officer Verification": "Awaiting Officer Verification",
    "Upload New": "Upload New",
    "Manually Verified": "Manually Verified"
  },
  ta: {
    "Education": "கல்வி",
    "Agriculture": "விவசாயம்",
    "Healthcare": "சுகாதாரம்",
    "Housing": "வீட்டுவசதி",
    "Employment": "வேலைவாய்ப்பு",
    "Women & Child": "பெண்கள் & குழந்தைகள்",
    "Entrepreneurship": "தொழில்முனைவு",
    "Financial Help": "நிதி உதவி",
    "Schemes Available": "திட்டங்கள் உள்ளன",
    "Central & State Schemes": "மத்திய & மாநில திட்டங்கள்",
    "Personalized Eligibility": "தனிப்பயனாக்கப்பட்ட தகுதி",
    "Official Scheme Sources": "அதிகாரப்பூர்வ ஆதாரங்கள்",
    "Verified": "சரிபார்க்கப்பட்டது",
    "AI Match": "AI பொருத்தம்",
    "100% Authentic": "100% உண்மையானது",
    "Track on Official Portal": "அதிகாரப்பூர்வ போர்ட்டலில் கண்காணிக்கவும்",
    "Document Verification Checklist": "ஆவண சரிபார்ப்பு பட்டியல்",
    "Verified via DigiLocker": "டிஜிலாக்கர் மூலம் சரிபார்க்கப்பட்டது",
    "NPCI Mapping Complete": "NPCI மேப்பிங் முடிந்தது",
    "Awaiting Officer Verification": "அதிகாரி சரிபார்ப்புக்கு காத்திருக்கிறது",
    "Upload New": "புதியதை பதிவேற்றவும்",
    "Manually Verified": "கைமுறையாக சரிபார்க்கப்பட்டது"
  },
  hi: {
    "Education": "शिक्षा",
    "Agriculture": "कृषि",
    "Healthcare": "स्वास्थ्य सेवा",
    "Housing": "आवास",
    "Employment": "रोजगार",
    "Women & Child": "महिला और बाल",
    "Entrepreneurship": "उद्यमिता",
    "Financial Help": "वित्तीय सहायता",
    "Schemes Available": "योजनाएं उपलब्ध",
    "Central & State Schemes": "केंद्रीय और राज्य योजनाएं",
    "Personalized Eligibility": "व्यक्तिगत पात्रता",
    "Official Scheme Sources": "आधिकारिक योजना स्रोत",
    "Verified": "सत्यापित",
    "AI Match": "एआई मैच",
    "100% Authentic": "100% प्रामाणिक",
    "Track on Official Portal": "आधिकारिक पोर्टल पर ट्रैक करें",
    "Document Verification Checklist": "दस्तावेज़ सत्यापन चेकलिस्ट",
    "Verified via DigiLocker": "डिजिलॉकर के माध्यम से सत्यापित",
    "NPCI Mapping Complete": "एनपीसीआई मैपिंग पूर्ण",
    "Awaiting Officer Verification": "अधिकारी सत्यापन की प्रतीक्षा है",
    "Upload New": "नया अपलोड करें",
    "Manually Verified": "मैन्युअल रूप से सत्यापित"
  },
  ml: {
    "Education": "വിദ്യാഭ്യാസം",
    "Agriculture": "കൃഷി",
    "Healthcare": "ആരോഗ്യ സംരക്ഷണം",
    "Housing": "ഭവനം",
    "Employment": "തൊഴിൽ",
    "Women & Child": "സ്ത്രീകളും കുട്ടികളും",
    "Entrepreneurship": "സംരംഭകത്വം",
    "Financial Help": "സാമ്പത്തിക സഹായം",
    "Schemes Available": "ലഭ്യമായ പദ്ധതികൾ",
    "Central & State Schemes": "കേന്ദ്ര-സംസ്ഥാന പദ്ധതികൾ",
    "Personalized Eligibility": "വ്യക്തിഗത യോഗ്യത",
    "Official Scheme Sources": "ഔദ്യോഗിക പദ്ധതി ഉറവിടങ്ങൾ",
    "Verified": "സ്ഥിരീകരിച്ചു",
    "AI Match": "എഐ മാച്ച്",
    "100% Authentic": "100% ആധികാരികം",
    "Track on Official Portal": "ഔദ്യോഗിക പോർട്ടലിൽ ട്രാക്ക് ചെയ്യുക",
    "Document Verification Checklist": "രേഖകൾ പരിശോധിക്കുന്നതിനുള്ള ചെക്ക്‌ലിസ്റ്റ്",
    "Verified via DigiLocker": "ഡിജിലോക്കർ വഴി സ്ഥിരീകരിച്ചു",
    "NPCI Mapping Complete": "എൻപിസിഐ മാപ്പിംഗ് പൂർത്തിയായി",
    "Awaiting Officer Verification": "ഉദ്യോഗസ്ഥന്റെ പരിശോധനയ്ക്കായി കാത്തിരിക്കുന്നു",
    "Upload New": "പുതിയത് അപ്‌ലോഡ് ചെയ്യുക",
    "Manually Verified": "മാനുവലായി സ്ഥിരീകരിച്ചു"
  },
  te: {
    "Education": "విద్య",
    "Agriculture": "వ్యవసాయం",
    "Healthcare": "ఆరోగ్య సంరక్షణ",
    "Housing": "గృహనిర్మాణం",
    "Employment": "ఉపాధి",
    "Women & Child": "మహిళలు & పిల్లలు",
    "Entrepreneurship": "వ్యవస్థాపకత",
    "Financial Help": "ఆర్థిక సహాయం",
    "Schemes Available": "అందుబాటులో ఉన్న పథకాలు",
    "Central & State Schemes": "కేంద్ర & రాష్ట్ర పథకాలు",
    "Personalized Eligibility": "వ్యక్తిగతీకరించిన అర్హత",
    "Official Scheme Sources": "అధికారిక పథక మూలాలు",
    "Verified": "ధృవీకరించబడింది",
    "AI Match": "AI మ్యాచ్",
    "100% Authentic": "100% ప్రామాణికమైనది",
    "Track on Official Portal": "అధికారిక పోర్టల్‌లో ట్రాక్ చేయండి",
    "Document Verification Checklist": "పత్ర ధృవీకరణ చెక్‌లిస్ట్",
    "Verified via DigiLocker": "డిజిలాకర్ ద్వారా ధృవీకరించబడింది",
    "NPCI Mapping Complete": "NPCI మ్యాపింగ్ పూర్తయింది",
    "Awaiting Officer Verification": "అధికారి ధృవీకరణ కోసం వేచి ఉంది",
    "Upload New": "క్రొత్తది అప్‌లోడ్ చేయండి",
    "Manually Verified": "మానవీయంగా ధృవీకరించబడింది"
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
