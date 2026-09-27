const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../public/locales');
const langs = ['en', 'hi', 'ml', 'ta', 'te'];

const newKeys = {
  en: {
    "goodMorningCitizen": "Good morning, Citizen",
    "basedOnProfileIn": "Based on your profile in",
    "andYourInterests": "and your interests:",
    "schemesMayBeRelevant": "schemes may be relevant to you",
    "completeYourProfile": "Complete Your Profile",
    "unlockMoreAccurateAI": "Unlock more accurate AI recommendations by updating your details.",
    "continueApplications": "Continue Applications",
    "youHavePendingApp": "You have 1 pending application requiring document verification.",
    "aiDocAssistant": "AI Document Assistant (Auto-Detect)",
    "needHelpIdentifyingDoc": "Need help identifying or verifying a government document? Ask AI.",
    "recommendedForYou": "Recommended for You",
    "upcomingDeadlines": "Upcoming Deadlines",
    "ekycDeadline": "e-KYC Deadline in 5 days",
    "completeNow": "Complete Now",
    "browseByCategory": "Browse by Category",
    "lifeEventMode": "Life Event Mode",
    "whatCanIGet": "\"What Can I Get?\"",
    "aiGreeting": "Hello Citizen. I am your Official AI Scheme Assistant. Based on your profile, I can help you discover welfare schemes, analyze eligibility, compare programs, and guide your official application. How can I help you today?",
    "qRelevantToStudents": "Which schemes are relevant to students?",
    "qSchemesForFarmers": "What schemes can farmers apply for?",
    "qWhyRecommended": "Why was a scheme recommended?",
    "qWhatDocs": "What documents do I need?",
    "askAboutSchemes": "Ask about schemes, eligibility, or required documents...",
    "send": "Send"
  },
  ta: {
    "goodMorningCitizen": "காலை வணக்கம், குடிமகனே",
    "basedOnProfileIn": "உங்கள் சுயவிவரத்தின் அடிப்படையில்",
    "andYourInterests": "மற்றும் உங்கள் ஆர்வங்கள்:",
    "schemesMayBeRelevant": "திட்டங்கள் உங்களுக்கு பொருத்தமானதாக இருக்கலாம்",
    "completeYourProfile": "உங்கள் சுயவிவரத்தை முடிக்கவும்",
    "unlockMoreAccurateAI": "உங்கள் விவரங்களைப் புதுப்பிப்பதன் மூலம் இன்னும் துல்லியமான AI பரிந்துரைகளைத் திறக்கவும்.",
    "continueApplications": "விண்ணப்பங்களை தொடரவும்",
    "youHavePendingApp": "ஆவண சரிபார்ப்பு தேவைப்படும் 1 நிலுவையில் உள்ள விண்ணப்பம் உங்களிடம் உள்ளது.",
    "aiDocAssistant": "AI ஆவண உதவியாளர் (தானாக கண்டறிதல்)",
    "needHelpIdentifyingDoc": "அரசு ஆவணத்தை அடையாளம் காண அல்லது சரிபார்க்க உதவி தேவையா? AI இடம் கேளுங்கள்.",
    "recommendedForYou": "உங்களுக்காக பரிந்துரைக்கப்பட்டது",
    "upcomingDeadlines": "வரவிருக்கும் காலக்கெடு",
    "ekycDeadline": "இ-கேஒய்சி காலக்கெடு 5 நாட்களில்",
    "completeNow": "இப்போது முடிக்கவும்",
    "browseByCategory": "வகை வாரியாக உலாவுக",
    "lifeEventMode": "வாழ்க்கை நிகழ்வு முறை",
    "whatCanIGet": "\"எனக்கு என்ன கிடைக்கும்?\"",
    "aiGreeting": "வணக்கம் குடிமகனே. நான் உங்களின் அதிகாரப்பூர்வ AI திட்ட உதவியாளர். உங்கள் சுயவிவரத்தின் அடிப்படையில், நலத் திட்டங்களைக் கண்டறியவும், தகுதியை பகுப்பாய்வு செய்யவும், திட்டங்களை ஒப்பிடவும் மற்றும் உங்கள் அதிகாரப்பூர்வ விண்ணப்பத்திற்கு வழிகாட்டவும் என்னால் உதவ முடியும். நான் உங்களுக்கு இன்று எப்படி உதவ முடியும்?",
    "qRelevantToStudents": "மாணவர்களுக்கு எந்த திட்டங்கள் பொருத்தமானவை?",
    "qSchemesForFarmers": "விவசாயிகள் எந்த திட்டங்களுக்கு விண்ணப்பிக்கலாம்?",
    "qWhyRecommended": "ஒரு திட்டம் ஏன் பரிந்துரைக்கப்பட்டது?",
    "qWhatDocs": "எனக்கு என்ன ஆவணங்கள் தேவை?",
    "askAboutSchemes": "திட்டங்கள், தகுதி அல்லது தேவையான ஆவணங்கள் பற்றி கேளுங்கள்...",
    "send": "அனுப்பு"
  },
  hi: {
    "goodMorningCitizen": "सुप्रभात, नागरिक",
    "basedOnProfileIn": "आपकी प्रोफ़ाइल के आधार पर",
    "andYourInterests": "और आपकी रुचियां:",
    "schemesMayBeRelevant": "योजनाएं आपके लिए प्रासंगिक हो सकती हैं",
    "completeYourProfile": "अपनी प्रोफ़ाइल पूरी करें",
    "unlockMoreAccurateAI": "अपने विवरण अपडेट करके अधिक सटीक एआई अनुशंसाएं अनलॉक करें।",
    "continueApplications": "आवेदन जारी रखें",
    "youHavePendingApp": "आपके पास दस्तावेज़ सत्यापन की आवश्यकता वाला 1 लंबित आवेदन है।",
    "aiDocAssistant": "एआई दस्तावेज़ सहायक (स्वत: पहचान)",
    "needHelpIdentifyingDoc": "सरकारी दस्तावेज़ को पहचानने या सत्यापित करने में सहायता चाहिए? एआई से पूछें।",
    "recommendedForYou": "आपके लिए अनुशंसित",
    "upcomingDeadlines": "आगामी समय सीमा",
    "ekycDeadline": "ई-केवाईसी समय सीमा 5 दिनों में",
    "completeNow": "अभी पूरा करें",
    "browseByCategory": "श्रेणी के अनुसार ब्राउज़ करें",
    "lifeEventMode": "जीवन घटना मोड",
    "whatCanIGet": "\"मुझे क्या मिल सकता है?\"",
    "aiGreeting": "नमस्ते नागरिक। मैं आपका आधिकारिक एआई योजना सहायक हूं। आपकी प्रोफ़ाइल के आधार पर, मैं आपको कल्याणकारी योजनाओं को खोजने, पात्रता का विश्लेषण करने, कार्यक्रमों की तुलना करने और आपके आधिकारिक आवेदन का मार्गदर्शन करने में मदद कर सकता हूं। मैं आज आपकी कैसे मदद कर सकता हूं?",
    "qRelevantToStudents": "छात्रों के लिए कौन सी योजनाएं प्रासंगिक हैं?",
    "qSchemesForFarmers": "किसान किन योजनाओं के लिए आवेदन कर सकते हैं?",
    "qWhyRecommended": "योजना की सिफारिश क्यों की गई?",
    "qWhatDocs": "मुझे किन दस्तावेजों की आवश्यकता है?",
    "askAboutSchemes": "योजनाओं, पात्रता या आवश्यक दस्तावेजों के बारे में पूछें...",
    "send": "भेजें"
  },
  ml: {
    "goodMorningCitizen": "സുപ്രഭാതം, പൗരൻ",
    "basedOnProfileIn": "നിങ്ങളുടെ പ്രൊഫൈൽ അടിസ്ഥാനമാക്കി",
    "andYourInterests": "നിങ്ങളുടെ താൽപ്പര്യങ്ങളും:",
    "schemesMayBeRelevant": "പദ്ധതികൾ നിങ്ങൾക്ക് അനുയോജ്യമായേക്കാം",
    "completeYourProfile": "നിങ്ങളുടെ പ്രൊഫൈൽ പൂർത്തിയാക്കുക",
    "unlockMoreAccurateAI": "നിങ്ങളുടെ വിശദാംശങ്ങൾ അപ്‌ഡേറ്റ് ചെയ്യുന്നതിലൂടെ കൂടുതൽ കൃത്യമായ AI ശുപാർശകൾ അൺലോക്ക് ചെയ്യുക.",
    "continueApplications": "അപേക്ഷകൾ തുടരുക",
    "youHavePendingApp": "രേഖകളുടെ പരിശോധന ആവശ്യമുള്ള 1 അപേക്ഷ തീർപ്പുകൽപ്പിക്കാത്തതുണ്ട്.",
    "aiDocAssistant": "എഐ ഡോക്യുമെന്റ് അസിസ്റ്റന്റ് (സ്വയം കണ്ടെത്തൽ)",
    "needHelpIdentifyingDoc": "ഒരു സർക്കാർ രേഖ തിരിച്ചറിയാനോ സ്ഥിരീകരിക്കാനോ സഹായം ആവശ്യമുണ്ടോ? എഐയോട് ചോദിക്കുക.",
    "recommendedForYou": "നിങ്ങൾക്കായി ശുപാർശ ചെയ്തത്",
    "upcomingDeadlines": "വരാനിരിക്കുന്ന സമയപരിധി",
    "ekycDeadline": "5 ദിവസത്തിനുള്ളിൽ ഇ-കെവൈസി സമയപരിധി",
    "completeNow": "ഇപ്പോൾ പൂർത്തിയാക്കുക",
    "browseByCategory": "വിഭാഗം അനുസരിച്ച് ബ്രൗസ് ചെയ്യുക",
    "lifeEventMode": "ജീവിത സംഭവം മോഡ്",
    "whatCanIGet": "\"എനിക്ക് എന്ത് ലഭിക്കും?\"",
    "aiGreeting": "നമസ്കാരം പൗരൻ. ഞാൻ നിങ്ങളുടെ ഔദ്യോഗിക എഐ പദ്ധതി സഹായിയാണ്. നിങ്ങളുടെ പ്രൊഫൈൽ അടിസ്ഥാനമാക്കി, ക്ഷേമ പദ്ധതികൾ കണ്ടെത്താനും യോഗ്യത വിശകലനം ചെയ്യാനും പ്രോഗ്രാമുകൾ താരതമ്യം ചെയ്യാനും നിങ്ങളുടെ ഔദ്യോഗിക അപേക്ഷയ്ക്ക് വഴികാട്ടാനും എനിക്ക് നിങ്ങളെ സഹായിക്കാനാകും. ഇന്ന് ഞാൻ നിങ്ങളെ എങ്ങനെ സഹായിക്കണം?",
    "qRelevantToStudents": "വിദ്യാർത്ഥികൾക്ക് ഏത് പദ്ധതികളാണ് പ്രസക്തമായത്?",
    "qSchemesForFarmers": "കർഷകർക്ക് ഏത് പദ്ധതികൾക്ക് അപേക്ഷിക്കാം?",
    "qWhyRecommended": "എന്തുകൊണ്ടാണ് ഒരു പദ്ധതി ശുപാർശ ചെയ്തത്?",
    "qWhatDocs": "എനിക്ക് എന്ത് രേഖകൾ ആവശ്യമാണ്?",
    "askAboutSchemes": "പദ്ധതികളെക്കുറിച്ചോ യോഗ്യതയെക്കുറിച്ചോ ആവശ്യമായ രേഖകളെക്കുറിച്ചോ ചോദിക്കുക...",
    "send": "അയയ്ക്കുക"
  },
  te: {
    "goodMorningCitizen": "శుభోదయం, పౌరుడా",
    "basedOnProfileIn": "మీ ప్రొఫైల్ ఆధారంగా",
    "andYourInterests": "మరియు మీ ఆసక్తులు:",
    "schemesMayBeRelevant": "పథకాలు మీకు సంబంధితంగా ఉండవచ్చు",
    "completeYourProfile": "మీ ప్రొఫైల్‌ను పూర్తి చేయండి",
    "unlockMoreAccurateAI": "మీ వివరాలను అప్‌డేట్ చేయడం ద్వారా మరింత ఖచ్చితమైన AI సిఫార్సులను అన్‌లాక్ చేయండి.",
    "continueApplications": "దరఖాస్తులను కొనసాగించండి",
    "youHavePendingApp": "పత్ర ధృవీకరణ అవసరమయ్యే 1 పెండింగ్ దరఖాస్తు మీ వద్ద ఉంది.",
    "aiDocAssistant": "AI డాక్యుమెంట్ అసిస్టెంట్ (స్వీయ-గుర్తింపు)",
    "needHelpIdentifyingDoc": "ప్రభుత్వ పత్రాన్ని గుర్తించడం లేదా ధృవీకరించడంలో సహాయం కావాలా? AI ని అడగండి.",
    "recommendedForYou": "మీ కోసం సిఫార్సు చేయబడింది",
    "upcomingDeadlines": "రాబోయే గడువులు",
    "ekycDeadline": "5 రోజుల్లో ఇ-కెవైసి గడువు",
    "completeNow": "ఇప్పుడే పూర్తి చేయండి",
    "browseByCategory": "వర్గం ద్వారా బ్రౌజ్ చేయండి",
    "lifeEventMode": "జీవిత సంఘటన మోడ్",
    "whatCanIGet": "\"నాకు ఏమి లభిస్తుంది?\"",
    "aiGreeting": "నమస్కారం పౌరుడా. నేను మీ అధికారిక AI పథక సహాయకుడిని. మీ ప్రొఫైల్ ఆధారంగా, సంక్షేమ పథకాలను కనుగొనడంలో, అర్హతను విశ్లేషించడంలో, ప్రోగ్రామ్‌లను పోల్చడంలో మరియు మీ అధికారిక దరఖాస్తుకు మార్గనిర్దేశం చేయడంలో నేను మీకు సహాయపడగలను. ఈ రోజు నేను మీకు ఎలా సహాయపడగలను?",
    "qRelevantToStudents": "విద్యార్థులకు ఏ పథకాలు సంబంధితంగా ఉంటాయి?",
    "qSchemesForFarmers": "రైతులు ఏ పథకాలకు దరఖాస్తు చేసుకోవచ్చు?",
    "qWhyRecommended": "ఒక పథకం ఎందుకు సిఫార్సు చేయబడింది?",
    "qWhatDocs": "నాకు ఏ పత్రాలు కావాలి?",
    "askAboutSchemes": "పథకాలు, అర్హత లేదా అవసరమైన పత్రాల గురించి అడగండి...",
    "send": "పంపండి"
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
