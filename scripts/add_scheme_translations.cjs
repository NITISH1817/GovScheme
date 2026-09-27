const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../public/locales');
const langs = ['en', 'hi', 'ml', 'ta', 'te'];

const newKeys = {
  en: {
    "pm-kisan_name": "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
    "pm-kisan_desc": "Income support of ₹6,000 per year in three equal installments to all landholding farmer families across India.",
    "pmay-g_name": "Pradhan Mantri Awas Yojana - Gramin (PMAY-G)",
    "pmay-g_desc": "Financial assistance to construct pucca houses with basic amenities for homeless and those living in dilapidated houses.",
    "pm-jay_name": "Ayushman Bharat - PM Jan Arogya Yojana (PM-JAY)",
    "pm-jay_desc": "World's largest health insurance scheme providing ₹5 Lakh per family per year for secondary and tertiary care hospitalization."
  },
  hi: {
    "pm-kisan_name": "प्रधानमंत्री किसान सम्मान निधि (पीएम-किसान)",
    "pm-kisan_desc": "भारत भर में सभी भूमिधारक किसान परिवारों को तीन समान किश्तों में प्रति वर्ष ₹6,000 की आय सहायता।",
    "pmay-g_name": "प्रधानमंत्री आवास योजना - ग्रामीण (PMAY-G)",
    "pmay-g_desc": "बेघर और जीर्ण-शीर्ण घरों में रहने वालों के लिए बुनियादी सुविधाओं के साथ पक्के घर बनाने के लिए वित्तीय सहायता।",
    "pm-jay_name": "आयुष्मान भारत - पीएम जन आरोग्य योजना (PM-JAY)",
    "pm-jay_desc": "दुनिया की सबसे बड़ी स्वास्थ्य बीमा योजना जो माध्यमिक और तृतीयक देखभाल अस्पताल में भर्ती के लिए प्रति परिवार प्रति वर्ष ₹5 लाख प्रदान करती है।"
  },
  ta: {
    "pm-kisan_name": "பிரதான் மந்திரி கிசான் சம்மான் நிதி (PM-KISAN)",
    "pm-kisan_desc": "இந்தியா முழுவதும் உள்ள அனைத்து விவசாய குடும்பங்களுக்கும் மூன்று சம தவணைகளில் ஆண்டுக்கு ₹ 6,000 வருமான ஆதரவு.",
    "pmay-g_name": "பிரதான் மந்திரி ஆவாஸ் யோஜனா - கிராமின் (PMAY-G)",
    "pmay-g_desc": "வீடற்றவர்கள் மற்றும் பாழடைந்த வீடுகளில் வசிப்பவர்களுக்கு அடிப்படை வசதிகளுடன் கூடிய கான்கிரீட் வீடுகள் கட்ட நிதி உதவி.",
    "pm-jay_name": "ஆயுஷ்மான் பாரத் - பிரதம மந்திரி ஜன் ஆரோக்கிய யோஜனா (PM-JAY)",
    "pm-jay_desc": "உலகின் மிகப்பெரிய சுகாதார காப்பீட்டுத் திட்டம், ஒரு குடும்பத்திற்கு ஆண்டுக்கு ₹ 5 லட்சம் வழங்குகிறது."
  },
  te: {
    "pm-kisan_name": "ప్రధాన మంత్రి కిసాన్ సమ్మాన్ నిధి (PM-KISAN)",
    "pm-kisan_desc": "భారతదేశ వ్యాప్తంగా ఉన్న రైతుల కుటుంబాలందరికీ మూడు సమాన వాయిదాలలో సంవత్సరానికి ₹6,000 ఆదాయ మద్దతు.",
    "pmay-g_name": "ప్రధాన మంత్రి ఆవాస్ యోజన - గ్రామీణ్ (PMAY-G)",
    "pmay-g_desc": "నిరాశ్రయులకు మరియు శిథిలావస్థలో ఉన్న ఇళ్లలో నివసించే వారికి ప్రాథమిక సౌకర్యాలతో పక్కా ఇళ్లు నిర్మించుకోవడానికి ఆర్థిక సహాయం.",
    "pm-jay_name": "ఆయుష్మాన్ భారత్ - పిఎం జన్ ఆరోగ్య యోజన (PM-JAY)",
    "pm-jay_desc": "ప్రపంచంలోనే అతిపెద్ద ఆరోగ్య బీమా పథకం, ఒక కుటుంబానికి సంవత్సరానికి ₹5 లక్షల సహాయం అందిస్తుంది."
  },
  ml: {
    "pm-kisan_name": "പ്രധാൻ മന്ത്രി കിസാൻ സമ്മാൻ നിധി (PM-KISAN)",
    "pm-kisan_desc": "ഇന്ത്യയിലുടനീളമുള്ള എല്ലാ കർഷക കുടുംബങ്ങൾക്കും മൂന്ന് തുല്യ ഗഡുക്കളായി പ്രതിവർഷം 6,000 രൂപ വരുമാന പിന്തുണ.",
    "pmay-g_name": "പ്രധാൻ മന്ത്രി ആവാസ് യോജന - ഗ്രാമീൺ (PMAY-G)",
    "pmay-g_desc": "ഭവനരഹിതർക്കും തകർന്ന വീടുകളിൽ താമസിക്കുന്നവർക്കും അടിസ്ഥാന സൗകര്യങ്ങളോടെ വീടുകൾ നിർമ്മിക്കുന്നതിനുള്ള സാമ്പത്തിക സഹായം.",
    "pm-jay_name": "ആയുഷ്മാൻ ഭാരത് - പിഎം ജൻ ആരോഗ്യ യോജന (PM-JAY)",
    "pm-jay_desc": "ലോകത്തിലെ ഏറ്റവും വലിയ ആരോഗ്യ ഇൻഷുറൻസ് പദ്ധതി, ഒരു കുടുംബത്തിന് പ്രതിവർഷം 5 ലക്ഷം രൂപ വാഗ്ദാനം ചെയ്യുന്നു."
  }
};

for (const lang of langs) {
  const filePath = path.join(localesDir, lang, 'translation.json');
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    Object.assign(data, newKeys[lang]);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Updated ${lang} scheme translations.`);
  } else {
    console.log(`File not found: ${filePath}`);
  }
}
