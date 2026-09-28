const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../public/locales');
const langs = ['en', 'hi', 'ml', 'ta', 'te'];

const missingKeys = {
  en: {
    "manageProfile": "Manage Profile",
    "settings": "Settings",
    "yourSchemeDiscovery": "Your Scheme Discovery",
    "recommended": "Recommended",
    "saved": "Saved",
    "applications": "Applications",
    "actionRequired": "Action Required",
    "activeApplications": "Active Applications",
    "trackAllApplications": "Track all applications",
    "profileCompleteDesc": "Your profile is {{score}}% complete. Add your banking details to instantly apply for DBT schemes.",
    "almostEligible": "Almost eligible",
    "ruleAlmostEligible": "Almost eligible! You are missing one requirement: {{criteria}}",
    "civicTechOverview": "Here is your civic-tech overview for today.",
    "postMatricScholarship": "Post Matric Scholarship",
    "underReviewNodal": "Under review by State Nodal Officer"
  },
  hi: {
    "manageProfile": "प्रोफ़ाइल प्रबंधित करें",
    "settings": "सेटिंग्स",
    "yourSchemeDiscovery": "आपकी योजना खोज",
    "recommended": "अनुशंसित",
    "saved": "सहेजा गया",
    "applications": "आवेदन",
    "actionRequired": "कार्रवाई की आवश्यकता",
    "activeApplications": "सक्रिय आवेदन",
    "trackAllApplications": "सभी आवेदनों को ट्रैक करें",
    "profileCompleteDesc": "आपकी प्रोफ़ाइल {{score}}% पूरी हो गई है। DBT योजनाओं के लिए तुरंत आवेदन करने के लिए अपना बैंकिंग विवरण जोड़ें।",
    "almostEligible": "लगभग पात्र",
    "ruleAlmostEligible": "लगभग पात्र! आपकी एक आवश्यकता गायब है: {{criteria}}",
    "civicTechOverview": "यहाँ आज के लिए आपका सिविक-टेक अवलोकन है।",
    "postMatricScholarship": "पोस्ट मैट्रिक छात्रवृत्ति",
    "underReviewNodal": "राज्य नोडल अधिकारी द्वारा समीक्षाधीन"
  },
  ml: {
    "manageProfile": "പ്രൊഫൈൽ നിയന്ത്രിക്കുക",
    "settings": "ക്രമീകരണങ്ങൾ",
    "yourSchemeDiscovery": "നിങ്ങളുടെ പദ്ധതി കണ്ടെത്തൽ",
    "recommended": "ശുപാർശ ചെയ്തത്",
    "saved": "സംരക്ഷിച്ചു",
    "applications": "അപേക്ഷകൾ",
    "actionRequired": "നടപടി ആവശ്യമാണ്",
    "activeApplications": "സജീവ അപേക്ഷകൾ",
    "trackAllApplications": "എല്ലാ അപേക്ഷകളും ട്രാക്ക് ചെയ്യുക",
    "profileCompleteDesc": "നിങ്ങളുടെ പ്രൊഫൈൽ {{score}}% പൂർത്തിയായി. DBT സ്കീമുകൾക്കായി തൽക്ഷണം അപേക്ഷിക്കാൻ നിങ്ങളുടെ ബാങ്കിംഗ് വിശദാംശങ്ങൾ ചേർക്കുക.",
    "almostEligible": "ഏകദേശം യോഗ്യത നേടി",
    "ruleAlmostEligible": "ഏകദേശം യോഗ്യത നേടി! നിങ്ങൾക്ക് ഒരു ആവശ്യകത നഷ്ടമായി: {{criteria}}",
    "civicTechOverview": "ഇന്നത്തെ നിങ്ങളുടെ സിവിക്-ടെക് അവലോകനം ഇതാ.",
    "postMatricScholarship": "പോസ്റ്റ് മെട്രിക് സ്കോളർഷിപ്പ്",
    "underReviewNodal": "സ്റ്റേറ്റ് നോഡൽ ഓഫീസറുടെ അവലോകനത്തിൽ"
  },
  ta: {
    "manageProfile": "சுயவிவரத்தை நிர்வகி",
    "settings": "அமைப்புகள்",
    "yourSchemeDiscovery": "உங்கள் திட்ட கண்டுபிடிப்பு",
    "recommended": "பரிந்துரைக்கப்படுகிறது",
    "saved": "சேமிக்கப்பட்டது",
    "applications": "விண்ணப்பங்கள்",
    "actionRequired": "நடவடிக்கை தேவை",
    "activeApplications": "செயலில் உள்ள விண்ணப்பங்கள்",
    "trackAllApplications": "அனைத்து விண்ணப்பங்களையும் கண்காணிக்கவும்",
    "profileCompleteDesc": "உங்கள் சுயவிவரம் {{score}}% முடிந்தது. DBT திட்டங்களுக்கு உடனடியாக விண்ணப்பிக்க உங்கள் வங்கி விவரங்களைச் சேர்க்கவும்.",
    "almostEligible": "கிட்டத்தட்ட தகுதியானவர்",
    "ruleAlmostEligible": "கிட்டத்தட்ட தகுதியானவர்! உங்களுக்கு ஒரு தேவை இல்லை: {{criteria}}",
    "civicTechOverview": "இன்றைய உங்கள் குடிமக்கள் தொழில்நுட்ப கண்ணோட்டம் இதோ.",
    "postMatricScholarship": "போஸ்ட் மெட்ரிக் உதவித்தொகை",
    "underReviewNodal": "மாநில நோடல் அதிகாரி பரிசீலனையில்"
  },
  te: {
    "manageProfile": "ప్రొఫైల్‌ను నిర్వహించండి",
    "settings": "సెట్టింగ్‌లు",
    "yourSchemeDiscovery": "మీ పథకం ఆవిష్కరణ",
    "recommended": "సిఫార్సు చేయబడింది",
    "saved": "సేవ్ చేయబడింది",
    "applications": "దరఖాస్తులు",
    "actionRequired": "చర్య అవసరం",
    "activeApplications": "క్రియాశీల దరఖాస్తులు",
    "trackAllApplications": "అన్ని దరఖాస్తులను ట్రాక్ చేయండి",
    "profileCompleteDesc": "మీ ప్రొఫైల్ {{score}}% పూర్తయింది. DBT పథకాలకు తక్షణమే దరఖాస్తు చేయడానికి మీ బ్యాంకింగ్ వివరాలను జోడించండి.",
    "almostEligible": "దాదాపు అర్హత ఉంది",
    "ruleAlmostEligible": "దాదాపు అర్హత ఉంది! మీరు ఒక అవసరాన్ని కోల్పోతున్నారు: {{criteria}}",
    "civicTechOverview": "ఈ రోజు మీ సివిక్-టెక్ అవలోకనం ఇక్కడ ఉంది.",
    "postMatricScholarship": "పోస్ట్ మెట్రిక్ స్కాలర్‌షిప్",
    "underReviewNodal": "రాష్ట్ర నోడల్ అధికారి సమీక్షలో"
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
