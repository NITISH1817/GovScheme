const fs = require('fs');
const path = require('path');

const manualTranslations = {
  hi: {
    "PM-KISAN Portal": "पीएम-किसान पोर्टल",
    "PMAY-G Rural Housing": "पीएमएवाई-जी ग्रामीण आवास",
    "Ayushman Bharat PMJAY": "आयुष्मान भारत पीएमजेएवाई",
    "National Scholarship Portal": "राष्ट्रीय छात्रवृत्ति पोर्टल",
    "DigiLocker Govt Vault": "डिजिलॉकर सरकारी तिजोरी",
    "UMANG Citizen Services": "उमंग नागरिक सेवाएँ",
    "pmKisanHelpline": "पीएम-किसान हेल्पलाइन",
    "ayushmanBharat": "आयुष्मान भारत",
    "nationalPensionPortal": "राष्ट्रीय पेंशन पोर्टल",
    "Central": "मध्य"
  },
  te: {
    "PM-KISAN Portal": "పీఎం-కిసాన్ పోర్టల్",
    "PMAY-G Rural Housing": "పీఎంఏవై-జి గ్రామీణ గృహనిర్మాణం",
    "Ayushman Bharat PMJAY": "ఆయుష్మాన్ భారత్ పిఎంజెఏవై",
    "National Scholarship Portal": "జాతీయ స్కాలర్షిప్ పోర్టల్",
    "DigiLocker Govt Vault": "డిజిలాకర్ ప్రభుత్వ ఖజానా",
    "UMANG Citizen Services": "ఉమంగ్ పౌర సేవలు",
    "pmKisanHelpline": "పీఎం-కిసాన్ హెల్ప్‌లైన్",
    "ayushmanBharat": "ఆయుష్మాన్ భారత్",
    "nationalPensionPortal": "జాతీయ పెన్షన్ పోర్టల్",
    "Central": "సెంట్రల్"
  }
};

const localesDir = path.join(__dirname, '../public/locales');

for (const [lang, translations] of Object.entries(manualTranslations)) {
  const jsonPath = path.join(localesDir, lang, 'translation.json');
  if (fs.existsSync(jsonPath)) {
    const json = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    for (const [key, val] of Object.entries(translations)) {
      json[key] = val;
    }
    fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2), 'utf8');
    console.log(`Injected manual translations for ${lang}`);
  }
}

// Also fix SchemeDiscovery.tsx hardcoded Central
let discoveryPath = path.join(__dirname, '../src/components/SchemeDiscovery.tsx');
let discoveryCode = fs.readFileSync(discoveryPath, 'utf8');
discoveryCode = discoveryCode.replace(
  /{scheme\.state === 'Central' \? 'Central' : scheme\.state}/g,
  "{scheme.state === 'Central' ? t('Central', 'Central') : t(scheme.state, scheme.state)}"
);
fs.writeFileSync(discoveryPath, discoveryCode, 'utf8');
console.log('Fixed SchemeDiscovery.tsx Central tag');
