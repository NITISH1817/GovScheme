const fs = require('fs');
const path = require('path');

// 52 New Schemes to reach 74 total official Indian Welfare Schemes
const newSchemes = [
  // 1. Agriculture & Farmers (7 new)
  {
    id: "pmmsy-fisheries",
    name: "Pradhan Mantri Matsya Sampada Yojana (PMMSY)",
    shortDescription: "Flagship scheme for focused and sustainable development of fisheries sector with financial subsidies.",
    department: "Department of Fisheries",
    ministry: "Ministry of Fisheries, Animal Husbandry and Dairying",
    category: "Agriculture & Farmers",
    state: "Central",
    benefitsSummary: "Capital subsidy of 40% for general and 60% for SC/ST/Women for fish farming ponds, biofloc units, and motorboats.",
    financialBenefitAmount: 300000,
    eligibilityRules: {
      allowedOccupations: ["Fisherman", "Farmer", "Aquaculture Farmer", "Self Employed"],
      requiredDocuments: ["Aadhaar", "Bank Passbook", "Fisheries License"]
    },
    requiredDocuments: ["Aadhaar Card", "Bank Account Details", "Land/Waterbody Ownership or Lease Document", "Project Report"],
    applicationSteps: ["Visit pmmsy.dof.gov.in portal.", "Submit project proposal with estimated cost.", "District Fisheries Officer conducts verification and sanctions subsidy."],
    officialApplyUrl: "https://pmmsy.dof.gov.in/",
    officialWebsite: "https://pmmsy.dof.gov.in/",
    helplineNumber: "1800-423-1660",
    deadline: "Open All Year",
    tags: ["Fisheries", "PMMSY", "Aquaculture", "Blue Revolution"],
    faqs: [{ question: "Who is eligible for PMMSY?", answer: "Individual fishers, fish farmers, SHGs, and fisheries cooperatives across India." }],
    lastUpdated: "2026-08-15",
    popularityScore: 88,
    translations: {
      hi: { name: "प्रधानमंत्री मत्स्य संपदा योजना (PMMSY)", desc: "मत्स्य पालन क्षेत्र के सतत विकास और किसानों के लिए सब्सिडी योजना।", benefits: "मछली पालन और नावों के लिए सामान्य वर्ग को 40% और महिला/एससी/एसटी को 60% तक सब्सिडी।" },
      ta: { name: "பிரதான் மந்திரி மத்சய சம்பதா யோஜனா (PMMSY)", desc: "மீன்வளத் துறையின் நிலையான வளர்ச்சிக்கான முதன்மை மானியத் திட்டம்.", benefits: "மீன் வளர்ப்பு மற்றும் படகுகளுக்கு 40% முதல் 60% வரை மூலதன மானியம்." },
      te: { name: "ప్రధాన మంత్రి మత్స్య సంపద యోజన (PMMSY)", desc: "చేపల పెంపకం మరియు మత్స్యకారుల ఆర్థికాభివృద్ధికి ప్రభుత్వ సబ్సిడీ పథకం.", benefits: "చేపల చెరువులు మరియు పరికరాలపై 40% నుండి 60% వరకు సబ్సిడీ." },
      ml: { name: "പ്രധാൻ മന്ത്രി മത്സ്യ സമ്പദ യോജന (PMMSY)", desc: "മത്സ്യബന്ധന മേഖലയുടെ സുസ്ഥിര വികസനത്തിനായുള്ള പദ്ധതി.", benefits: "മത്സ്യകൃഷിക്കും ബോട്ടുകൾക്കും 40% മുതൽ 60% വരെ സാമ്പത്തിക സബ്‌സിഡി." },
      mr: { name: "प्रधानमंत्री मत्स्य संपदा योजना (PMMSY)", desc: "मत्स्यव्यवसाय क्षेत्राच्या विकासासाठी आणि शेतकऱ्यांसाठी अनुदानाची योजना.", benefits: "मत्स्यपालनासाठी आणि उपकरणांसाठी ४०% ते ६०% भांडवली अनुदान." },
      gu: { name: "પ્રધાનમંત્રી મત્સ્ય સંપદા યોજના (PMMSY)", desc: "મત્સ્યોદ્યોગ ક્ષેત્રના ટકાઉ વિકાસ માટે કેન્દ્ર સરકારની સબસિડી યોજના.", benefits: "માછલી પકડવા અને ફાર્મિંગ માટે 40% થી 60% સુધી મૂડી સબસિડી." }
    }
  },
  {
    id: "pm-ksy-irrigation",
    name: "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)",
    shortDescription: "Financial assistance for micro-irrigation systems (drip and sprinkler) under 'Per Drop More Crop'.",
    department: "Department of Agriculture and Farmers Welfare",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    category: "Agriculture & Farmers",
    state: "Central",
    benefitsSummary: "Up to 55% subsidy for small/marginal farmers and 45% for other farmers for installing drip/sprinkler irrigation systems.",
    financialBenefitAmount: 45000,
    eligibilityRules: {
      allowedOccupations: ["Farmer", "Agriculture Worker", "Self Employed Farmer"],
      requiredDocuments: ["Aadhaar", "Land Record (Khata/Khasra)", "Bank Passbook"]
    },
    requiredDocuments: ["Aadhaar Card", "Land Ownership Documents (RoR/7/12)", "Bank Passbook", "Electricity Bill / Water Source Proof"],
    applicationSteps: ["Apply through State Micro Irrigation Portal or District Agriculture Office.", "Field verification by Agriculture Officer.", "Approved agency installs irrigation equipment and subsidy is credited."],
    officialApplyUrl: "https://pmksy.gov.in/",
    officialWebsite: "https://pmksy.gov.in/",
    helplineNumber: "011-23381012",
    deadline: "Open All Year",
    tags: ["Irrigation", "Drip Irrigation", "Sprinkler", "Per Drop More Crop"],
    faqs: [{ question: "What is the subsidy percentage under PMKSY?", answer: "Small and marginal farmers receive up to 55% subsidy on drip and sprinkler installation." }],
    lastUpdated: "2026-08-01",
    popularityScore: 90,
    translations: {
      hi: { name: "प्रधानमंत्री कृषि सिंचाई योजना (PMKSY)", desc: "प्रति बूंद अधिक फसल के तहत ड्रिप और स्प्रिंकलर सिंचाई प्रणाली पर वित्तीय अनुदान।", benefits: "छोटे और सीमांत किसानों को ड्रिप/स्प्रिंकलर सिंचाई पर 55% तक की सब्सिडी।" },
      ta: { name: "பிரதான் மந்திரி கிரிஷி சிஞ்சாயீ யோஜனா (PMKSY)", desc: "சொட்டு நீர் மற்றும் தெளிப்பு நீர் பாசன அமைப்புகளுக்கு அரசு மானியம்.", benefits: "சிறு மற்றும் குறு விவசாயிகளுக்கு நுண்ணீர்ப்பாசன நிறுவலுக்கு 55% வரை மானியம்." },
      te: { name: "ప్రధాన మంత్రి కృషి సించాయీ యోజన (PMKSY)", desc: "డ్రిప్ మరియు స్ప్రింక్లర్ సూక్ష్మ సేద్యం పరికరాలపై రైతులకు సబ్సిడీ పథకం.", benefits: "చిన్న, సన్నకారు రైతులకు బిందు సేద్య పరికరాలపై 55% వరకు సబ్సిడీ." },
      ml: { name: "പ്രധാൻ മന്ത്രി കൃഷി സിഞ്ചായീ യോജന (PMKSY)", desc: "തുള്ളിനന, സ്പ്രിങ്ക്ലർ ജലസേചന ഉപകരണങ്ങൾക്ക് സാമ്പത്തിക സബ്‌സിഡി നൽകുന്ന പദ്ധതി.", benefits: "ചെറുകിട കർഷകർക്ക് മൈക്രോ ഇറിഗേഷന് 55% വരെ സാമ്പത്തിക സഹായം." },
      mr: { name: "प्रधानमंत्री कृषी सिंचाई योजना (PMKSY)", desc: "ठिबक आणि तुषार सिंचन पद्धती बसवण्यासाठी शेतकऱ्यांना आर्थिक अनुदान.", benefits: "अल्प व अत्यल्प भूधारक शेतकऱ्यांना सूक्ष्म सिंचनावर ५५% पर्यंत अनुदान." },
      gu: { name: "પ્રધાનમંત્રી કૃષિ સિંચાઈ યોજના (PMKSY)", desc: "ડ્રિપ અને સ્પ્રિંકલર સિંચાઈ પદ્ધતિ માટે ખેડૂતોને આર્થિક સહાય.", benefits: "નાના અને સીમાંત ખેડૂતોને ટપક સિંચાઈ પદ્ધતિ પર 55% સુધીની સબસિડી." }
    }
  },
  {
    id: "paramparagat-krishi-vikas",
    name: "Paramparagat Krishi Vikas Yojana (PKVY)",
    shortDescription: "Promotion of commercial organic farming through cluster formation and PGS certification.",
    department: "Department of Agriculture and Farmers Welfare",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    category: "Agriculture & Farmers",
    state: "Central",
    benefitsSummary: "₹50,000 per hectare assistance over 3 years for organic inputs, certification, and direct marketing.",
    financialBenefitAmount: 50000,
    eligibilityRules: {
      allowedOccupations: ["Farmer", "Self Employed Farmer"],
      requiredDocuments: ["Aadhaar", "Land Record (Khata/Khasra)", "Bank Passbook"]
    },
    requiredDocuments: ["Aadhaar Card", "Land Record Details", "Bank Passbook", "Farmer Group/Cluster Membership Form"],
    applicationSteps: ["Form or join a cluster of 20 or more farmers (50 acres minimum).", "Register on the Jaivik Kheti portal.", "Assistance disbursed directly into bank account in tranches."],
    officialApplyUrl: "https://pgsindia-ncof.gov.in/",
    officialWebsite: "https://pgsindia-ncof.gov.in/",
    helplineNumber: "0120-2764906",
    deadline: "Open All Year",
    tags: ["Organic Farming", "PKVY", "Natural Farming", "Bio Fertilizers"],
    faqs: [{ question: "How much financial support is provided?", answer: "₹50,000 per hectare for 3 years, of which ₹31,000 is given directly for organic inputs." }],
    lastUpdated: "2026-07-25",
    popularityScore: 84,
    translations: {
      hi: { name: "परम्परागत कृषि विकास योजना (PKVY)", desc: "जैविक खेती को बढ़ावा देने और प्रमाणीकरण के लिए ₹50,000 प्रति हेक्टेयर की सहायता।", benefits: "जैविक खाद, बीज और प्रमाणीकरण के लिए 3 वर्षों में ₹50,000 प्रति हेक्टेयर सहायता।" },
      ta: { name: "பரம்பராகத் கிரிஷி விகாஸ் யோஜனா (PKVY)", desc: "இயற்கை விவசாயத்தை ஊக்குவிக்க ஹெக்டேருக்கு ₹50,000 நிதி உதவி அளிக்கும் திட்டம்.", benefits: "இயற்கை இடுபொருட்கள் மற்றும் சான்றிதழுக்கு 3 ஆண்டுகளில் ஹெக்டேருக்கு ₹50,000." },
      te: { name: "పరంపరాగత్ కృషి వికాస్ యోజన (PKVY)", desc: "సేంద్రీయ వ్యవసాయం మరియు సహజ ఎరువుల ప్రోత్సాహానికి ఆర్థిక సహాయ పథకం.", benefits: "సేంద్రీయ వ్యవసాయం కోసం 3 సంవత్సరాలలో హెక్టారుకు ₹50,000 ఆర్థిక సహాయం." },
      ml: { name: "പരമ്പരാഗത് കൃഷി വികാസ് യോജന (PKVY)", desc: "ജൈവകൃഷി പ്രോത്സാഹിപ്പിക്കുന്നതിനായി ഹെക്ടറിന് 50,000 രൂപ സാമ്പത്തിക സഹായം.", benefits: "ജൈവ വളങ്ങൾക്കും സർട്ടിഫിക്കേഷനുമായി 3 വർഷത്തേക്ക് ഹെക്ടറിന് ₹50,000." },
      mr: { name: "परंपरागत कृषी विकास योजना (PKVY)", desc: "सेंद्रिय शेतीला प्रोत्साहन देण्यासाठी प्रति हेक्टर ₹५०,००० ची आर्थिक मदत.", benefits: "सेंद्रिय खते आणि प्रमाणीकरणासाठी ३ वर्षांत प्रति हेक्टरी ₹५०,००० चे अनुदान." },
      gu: { name: "પરંપરાગત કૃષિ વિકાસ યોજના (PKVY)", desc: "કુદરતી અને જૈવિક ખેતીના વિકાસ માટે હેક્ટર દીઠ ₹50,000 ની નાણાકીય સહાય.", benefits: "જૈવિક ખાતર અને સર્ટિફિકેશન માટે 3 વર્ષમાં હેક્ટર દીઠ ₹50,000 ની સહાય." }
    }
  },
  {
    id: "pm-kusum-solar-pump",
    name: "PM-KUSUM Solar Pump Scheme",
    shortDescription: "Subsidies for standalone solar agricultural pumps and solarization of existing grid-connected agricultural pumps.",
    department: "Ministry of New and Renewable Energy",
    ministry: "Ministry of New and Renewable Energy",
    category: "Agriculture & Farmers",
    state: "Central",
    benefitsSummary: "Up to 60% subsidy (30% Central + 30% State) on installing solar water pumps for farm irrigation.",
    financialBenefitAmount: 120000,
    eligibilityRules: {
      allowedOccupations: ["Farmer", "Farmer Producer Organization", "Agriculture Worker"],
      requiredDocuments: ["Aadhaar", "Land Record (Khata/Khasra)", "Bank Passbook"]
    },
    requiredDocuments: ["Aadhaar Card", "Land Ownership Record", "Bank Passbook", "NOC / Water Source Proof"],
    applicationSteps: ["Apply online through State Nodal Renewable Energy Agency portal.", "Pay 10% farmer share after document scrutiny.", "Solar pump installed by authorized vendor with 5-year warranty."],
    officialApplyUrl: "https://pmkusum.mnre.gov.in/",
    officialWebsite: "https://pmkusum.mnre.gov.in/",
    helplineNumber: "1800-180-3333",
    deadline: "Open All Year",
    tags: ["Solar Pump", "PM KUSUM", "Renewable Energy", "Irrigation"],
    faqs: [{ question: "What is farmer share for PM KUSUM?", answer: "Farmers only pay 10% to 40% of total cost; remainder is covered by Central and State subsidies." }],
    lastUpdated: "2026-08-10",
    popularityScore: 94,
    translations: {
      hi: { name: "पीएम-कुसुम सोलर पंप योजना (PM-KUSUM)", desc: "खेतों में सौर ऊर्जा संचालित सिंचाई पंप लगाने के लिए 60% तक सरकारी सब्सिडी।", benefits: "सोलर वाटर पंप लगाने पर केंद्र और राज्य सरकार द्वारा 60% तक का अनुदान।" },
      ta: { name: "பிஎம்-குசும் சோலார் பம்ப் திட்டம் (PM-KUSUM)", desc: "விவசாய பாசனத்திற்கான சூரிய ஒளி மின் பம்புகளுக்கு 60% அரசு மானியம்.", benefits: "சூரிய ஒளி நீர் பம்ப் நிறுவலுக்கு 60% அரசு மானியம், விவசாயி பங்கு 10% மட்டுமே." },
      te: { name: "పీఎం-కుసుమ్ సోలార్ పంపుల పథకం (PM-KUSUM)", desc: "వ్యవసాయ నీటిపారుదల కోసం సోలార్ పంపుల ఏర్పాటుకు 60% సబ్సిడీ పథకం.", benefits: "సోలార్ వాటర్ పంపుల ఏర్పాటుపై 60% సబ్సిడీ, మిగులు విద్యుత్ అమ్ముకునే అవకాశం." },
      ml: { name: "പിഎം-കുസും സോളാർ പമ്പ് പദ്ധതി (PM-KUSUM)", desc: "കാർഷിക ജലസേചനത്തിനായി സോളാർ പമ്പുകൾ സ്ഥാപിക്കുന്നതിന് 60% സബ്‌സിഡി.", benefits: "സോളാർ പമ്പുകൾ സ്ഥാപിക്കാൻ 60% സർക്കാർ സബ്‌സിഡി." },
      mr: { name: "पीएम-कुसुम सोलर पंप योजना (PM-KUSUM)", desc: "शेतात सौर कृषी पंप बसवण्यासाठी शासनाकडून ६०% पर्यंत आर्थिक अनुदान.", benefits: "सौरऊर्जा कृषी पंपावर ६०% अनुदान, शेतकऱ्यांना दिवसा अखंड वीज उपलब्ध." },
      gu: { name: "પીએમ-કુસુમ સોલર પંપ યોજના (PM-KUSUM)", desc: "ખેતરમાં સોલર પંપ સ્થાપિત કરવા માટે 60% સુધી સરકારી સબસિડી.", benefits: "સોલાર વોટર પંપ લગાવવા પર કેન્દ્ર અને રાજ્ય સરકાર દ્વારા 60% સબસિડી." }
    }
  },
  {
    id: "soil-health-card",
    name: "Soil Health Card Scheme",
    shortDescription: "Periodic soil testing and personalized fertilizer recommendations issued free to farmers every 2 years.",
    department: "Department of Agriculture and Farmers Welfare",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    category: "Agriculture & Farmers",
    state: "Central",
    benefitsSummary: "Free laboratory soil analysis covering 12 nutrient parameters and crop-wise fertilizer dosage recommendations.",
    financialBenefitAmount: 1500,
    eligibilityRules: {
      allowedOccupations: ["Farmer", "Self Employed Farmer"],
      requiredDocuments: ["Aadhaar", "Land Record (Khata/Khasra)"]
    },
    requiredDocuments: ["Aadhaar Card", "Land Details (Survey No / Khata)", "Mobile Number"],
    applicationSteps: ["Soil sample collected by field officials or submitted at Soil Testing Lab.", "Lab tests parameters (N, P, K, pH, micronutrients).", "Soil Health Card generated and handed to farmer."],
    officialApplyUrl: "https://soilhealth.dac.gov.in/",
    officialWebsite: "https://soilhealth.dac.gov.in/",
    helplineNumber: "011-23388911",
    deadline: "Open All Year",
    tags: ["Soil Testing", "Fertilizer", "Soil Health Card", "Agriculture"],
    faqs: [{ question: "How often is the Soil Health Card renewed?", answer: "Soil Health Cards are issued every 2 years for each farmer's landholding." }],
    lastUpdated: "2026-07-12",
    popularityScore: 82,
    translations: {
      hi: { name: "मृदा स्वास्थ्य कार्ड योजना (Soil Health Card)", desc: "खेत की मिट्टी की मुफ्त जांच और फसलों के लिए संतुलित उर्वरक सिफारिशें।", benefits: "12 पोषक तत्वों की मुफ्त प्रयोगशाला जांच और फसल अनुसार उर्वरक मार्गदर्शन।" },
      ta: { name: "மண் வள அட்டை திட்டம் (Soil Health Card)", desc: "விவசாய நிலத்தின் மண் தரத்தை இலவசமாக பரிசோதித்து உர பரிந்துரைகள் வழங்கும் திட்டம்.", benefits: "12 சத்துக்களை இலவசமாக ஆய்வு செய்து பயிருக்கு ஏற்ற உர வழிகாட்டல்." },
      te: { name: "నేల ఆరోగ్య కార్డు పథకం (Soil Health Card)", desc: "రైతుల పొలాల్లోని నేల సారాన్ని ఉచితంగా పరీక్షించి పోషకాల వివరాలు అందించే పథకం.", benefits: "12 రకాల నేల పోషకాల ఉచిత ల్యాబ్ పరీక్ష మరియు ఎరువుల సమగ్ర మార్గదర్శనం." },
      ml: { name: "സോയിൽ ഹെൽത്ത് കാർഡ് പദ്ധതി (Soil Health Card)", desc: "മണ്ണിന്റെ ഗുണനിലവാരം സൗജന്യമായി പരിശോധിച്ച് വളപ്രയോഗ നിർദ്ദേശങ്ങൾ നൽകുന്നു.", benefits: "12 പോഷക ഘടകങ്ങളുടെ സൗജന്യ പരിശോധനയും വിളകൾക്കനുയോജ്യമായ നിർദ്ദേശങ്ങളും." },
      mr: { name: "मृदा आरोग्य पत्रिका योजना (Soil Health Card)", desc: "जमिनीच्या मातीची मोफत तपासणी आणि पिकांसाठी योग्य खतांच्या मात्रांची शिफारस.", benefits: "१२ पोषक घटकांची मोफत प्रयोगशाळा तपासणी आणि खत नियोजनाचे मार्गदर्शन." },
      gu: { name: "સોઇલ હેલ્થ કાર્ડ યોજના (Soil Health Card)", desc: "જમીનની ગુણવત્તા ચકાસીને સંતુલિત ખાતરના ઉપયોગ માટેની મફત માર્ગદર્શિકા.", benefits: "12 પોષક તત્વોની મફત ચકાસણી અને પાક અનુસાર ખાતર અંગેનું સચોટ માર્ગદર્શન." }
    }
  },
  {
    id: "national-beekeeping-mission",
    name: "National Beekeeping & Honey Mission (NBHM)",
    shortDescription: "Promotion of scientific beekeeping to augment farmers' income, crop pollination, and honey production.",
    department: "National Bee Board",
    ministry: "Ministry of Agriculture & Farmers Welfare",
    category: "Agriculture & Farmers",
    state: "Central",
    benefitsSummary: "Up to 50% subsidy on beehives, bee colonies, and honey extraction equipment for individuals and clusters.",
    financialBenefitAmount: 40000,
    eligibilityRules: {
      allowedOccupations: ["Farmer", "Beekeeper", "Rural Youth", "Self Employed"],
      requiredDocuments: ["Aadhaar", "Bank Passbook"]
    },
    requiredDocuments: ["Aadhaar Card", "Bank Account Details", "Land or Training Certificate (if available)"],
    applicationSteps: ["Register on Madhukranti portal (madhukranti.in).", "Apply for subsidized bee boxes through National Bee Board.", "Field inspection and subsidy release."],
    officialApplyUrl: "https://nbhm.gov.in/",
    officialWebsite: "https://nbhm.gov.in/",
    helplineNumber: "011-23382012",
    deadline: "Open All Year",
    tags: ["Beekeeping", "Honey", "NBHM", "Sweet Revolution"],
    faqs: [{ question: "Can small farmers take up beekeeping under NBHM?", answer: "Yes, small and marginal farmers get up to 50% subsidy on bee colonies and boxes." }],
    lastUpdated: "2026-06-20",
    popularityScore: 78,
    translations: {
      hi: { name: "राष्ट्रीय मधुमक्खी पालन एवं शहद मिशन (NBHM)", desc: "किसानों की अतिरिक्त आय के लिए वैज्ञानिक मधुमक्खी पालन पर 50% तक सब्सिडी।", benefits: "मधुमक्खी के बक्से, कालोनियों और शहद प्रसंस्करण पर 50% तक वित्तीय अनुदान।" },
      ta: { name: "தேசிய தேனீ வளர்ப்பு மற்றும் தேன் பணி (NBHM)", desc: "விவசாயிகளின் கூடுதல் வருமானத்திற்காக அறிவியல் பூர்வ தேனீ வளர்ப்பிற்கு 50% மானியம்.", benefits: "தேனீ பெட்டிகள் மற்றும் தேன் எடுக்கும் கருவிகளுக்கு 50% அரசு மானியம்." },
      te: { name: "జాతీయ తేనెటీగల పెంపకం మిషన్ (NBHM)", desc: "రైతులకు అదనపు ఆదాయం కోసం తేనెటీగల పెంపకంపై 50% సబ్సిడీ పథకం.", benefits: "తేనెటీగల పెట్టెలు మరియు ప్రాసెసింగ్ పరికరాలపై 50% వరకు సబ్సిడీ." },
      ml: { name: "ദേശീയ തേനീച്ച വളർത്തൽ മിഷൻ (NBHM)", desc: "കർഷകർക്ക് അധിക വരുമാനം നൽകുന്ന തേനീച്ച വളർത്തലിന് 50% വരെ സബ്‌സിഡി.", benefits: "തേനീച്ച കോളനികൾക്കും ഉപകരണങ്ങൾക്കും 50% സാമ്പത്തിക സഹായം." },
      mr: { name: "राष्ट्रीय मधमाशी पालन व मध अभियान (NBHM)", desc: "शेतकऱ्यांचे उत्पन्न वाढवण्यासाठी वैज्ञानिक मधमाशी पालनावर ५०% पर्यंत अनुदान.", benefits: "मधमाश्यांच्या पेट्या व मध काढणी यंत्रांवर ५०% पर्यंत शासकीय अनुदान." },
      gu: { name: "રાષ્ટ્રીય મધમાખી પાલન અને મધ મિશન (NBHM)", desc: "વૈજ્ઞાનિક મધમાખી ઉછેર અને મધ ઉત્પાદન માટે 50% સુધી સરકારી સહાય.", benefits: "મધમાખીના બોક્સ અને મધ કાઢવાના સાધનો પર 50% સુધીની સબસિડી." }
    }
  },
  {
    id: "kisan-credit-card",
    name: "Kisan Credit Card (KCC) Scheme",
    shortDescription: "Timely credit support to farmers for cultivation expenses, post-harvest costs, and maintenance of farm assets.",
    department: "Department of Financial Services",
    ministry: "Ministry of Finance",
    category: "Agriculture & Farmers",
    state: "Central",
    benefitsSummary: "Credit limit up to ₹3,00,000 at highly subsidized effective interest rate of 4% per annum with prompt repayment incentive.",
    financialBenefitAmount: 300000,
    eligibilityRules: {
      allowedOccupations: ["Farmer", "Tenant Farmer", "Sharecropper", "Dairy Farmer", "Fisherman"],
      requiredDocuments: ["Aadhaar", "PAN", "Land Record (Khata/Khasra)", "Bank Passbook"]
    },
    requiredDocuments: ["Aadhaar Card", "Land Ownership / Tenant Cultivation Proof", "Bank Passbook", "Passport Photo"],
    applicationSteps: ["Visit nearest Commercial/Cooperative Bank branch or apply on pmkisan.gov.in.", "Submit single-page KCC application form with land records.", "KCC issued within 14 days by bank."],
    officialApplyUrl: "https://myscheme.gov.in/schemes/kcc",
    officialWebsite: "https://financialservices.gov.in/",
    helplineNumber: "1800-11-5526",
    deadline: "Open All Year",
    tags: ["KCC", "Kisan Credit Card", "Low Interest Loan", "Farm Loan"],
    faqs: [{ question: "What is the interest rate on KCC?", answer: "Normal interest is 7%, reduced to 4% with prompt repayment subvention." }],
    lastUpdated: "2026-08-22",
    popularityScore: 97,
    translations: {
      hi: { name: "किसान क्रेडिट कार्ड योजना (KCC)", desc: "खेती और फसल की जरूरतों के लिए केवल 4% प्रभावी ब्याज दर पर ₹3 लाख तक का आसान ऋण।", benefits: "समय पर भुगतान करने पर मात्र 4% ब्याज पर ₹3,00,000 तक का रियायती बैंक ऋण।" },
      ta: { name: "கிசான் கிரெடிட் கார்டு திட்டம் (KCC)", desc: "விவசாயிகளுக்கு 4% குறைந்த வட்டியில் ₹3 லட்சம் வரை உடனடி பயிர்க் கடன்.", benefits: "நேர்மையான திருப்பிச் செலுத்துதலுடன் ஆண்டுக்கு 4% வட்டியில் ₹3,00,000 வரை கடன்." },
      te: { name: "కిసాన్ క్రెడిట్ కార్డ్ పథకం (KCC)", desc: "రైతులకు కేవలం 4% తక్కువ వడ్డీకే రూ. 3 లక్షల వరకు పంట రుణాలు అందించే పథకం.", benefits: "సకాలంలో చెల్లింపులపై 4% వడ్డీతో రూ. 3,00,000 వరకు సులభ వ్యవసాయ రుణం." },
      ml: { name: "കിസാൻ ക്രെഡിറ്റ് കാർഡ് പദ്ധതി (KCC)", desc: "കർഷകർക്ക് 4% കുറഞ്ഞ പലിശ നിരക്കിൽ 3 ലക്ഷം രൂപ വരെ കാർഷിക വായ്പ.", benefits: "കൃത്യസമയത്ത് തിരിച്ചടച്ചാൽ 4% പലിശയിൽ ₹3,00,000 വരെ ബാങ്ക് വായ്പ." },
      mr: { name: "किसान क्रेडिट कार्ड योजना (KCC)", desc: "शेतकऱ्यांना शेती कामांसाठी अवघ्या ४% सवलतीच्या व्याजाने ₹३ लाखांपर्यंत पीक कर्ज.", benefits: "नियमित परताव्यासह वार्षिक फक्त ४% व्याजाने ₹३,००,००० पर्यंत अल्पमुदत कर्ज." },
      gu: { name: "કિસાન ક્રેડિટ કાર્ડ યોજના (KCC)", desc: "ખેતી ખર્ચ માટે માત્ર 4% વ્યાજ દરે ₹3 લાખ સુધીની સરળ લોન સહાય.", benefits: "સમયસર ચુકવણી કરવા પર માત્ર 4% વ્યાજે ₹3,00,000 સુધીની સસ્તી ખેતી લોન." }
    }
  },

  // 2. Health & Healthcare (6 new)
  {
    id: "jan-aushadhi-yojana",
    name: "Pradhan Mantri Bharatiya Janaushadhi Pariyojana (PMBJP)",
    shortDescription: "Providing high quality generic medicines and surgical products at 50% to 90% lesser prices than branded equivalents.",
    department: "Pharmaceuticals & Medical Devices Bureau of India (PMBI)",
    ministry: "Ministry of Chemicals and Fertilizers",
    category: "Health & Healthcare",
    state: "Central",
    benefitsSummary: "Quality generic medicines available at 50% to 90% discount across 10,000+ Janaushadhi Kendras nationwide.",
    financialBenefitAmount: 12000,
    eligibilityRules: {
      requiredDocuments: ["Doctor Prescription"]
    },
    requiredDocuments: ["Valid Doctor's Prescription (for prescription drugs)", "Aadhaar Card (optional)"],
    applicationSteps: ["Visit any nearest PMBJP Kendra.", "Show doctor's prescription for required generic medicine.", "Purchase medicine at 50% to 90% cheaper price."],
    officialApplyUrl: "https://janaushadhi.gov.in/",
    officialWebsite: "https://janaushadhi.gov.in/",
    helplineNumber: "1800-180-8080",
    deadline: "Open All Year",
    tags: ["Janaushadhi", "Generic Medicine", "Affordable Medicine", "Health"],
    faqs: [{ question: "Are Janaushadhi medicines equal in quality to branded ones?", answer: "Yes, all medicines are tested in NABL accredited labs before distribution." }],
    lastUpdated: "2026-08-01",
    popularityScore: 92,
    translations: {
      hi: { name: "प्रधानमंत्री भारतीय जनऔषधि परियोजना (PMBJP)", desc: "ब्रांडेड दवाओं की तुलना में 50% से 90% कम कीमत पर उच्च गुणवत्ता वाली जेनेरिक दवाएं।", benefits: "10,000+ जनऔषधि केंद्रों पर सस्ती एवं प्रमाणित जेनेरिक दवाइयां उपलब्ध।" },
      ta: { name: "பிரதான் மந்திரி பாரதிய ஜனௌஷதி பரியோஜனா (PMBJP)", desc: "தரமான பொதுவான மருந்துகளை 50% முதல் 90% வரை மலிவான விலையில் வழங்கும் திட்டம்.", benefits: "10,000+ மக்கள் மருந்தகங்களில் 50% முதல் 90% வரை குறைந்த விலையில் மருந்துகள்." },
      te: { name: "ప్రధాన మంత్రి భారతీయ జనౌషధి పరియోజన (PMBJP)", desc: "బ్రాండెడ్ మందులతో పోలిస్తే 50% నుండి 90% తక్కువ ధరకే నాణ్యమైన జెనరిక్ మందులు.", benefits: "దేశవ్యాప్తంగా ఉన్న జనౌషధి కేంద్రాలలో అత్యంత తక్కువ ధరకే నాణ్యమైన మందులు." },
      ml: { name: "പ്രധാൻ മന്ത്രി ഭാരതീയ ജനൗഷധി പരിയോജന (PMBJP)", desc: "50% മുതൽ 90% വരെ വിലക്കുറവിൽ ഗുണനിലവാരമുള്ള ജനറിക് മരുന്നുകൾ നൽകുന്നു.", benefits: "10,000+ ജനൗഷധി കേന്ദ്രങ്ങളിലൂടെ കുറഞ്ഞ നിരക്കിൽ ജീവൻരക്ഷാ മരുന്നുകൾ." },
      mr: { name: "प्रधानमंत्री भारतीय जनऔषधी योजना (PMBJP)", desc: "दर्जेदार जेनेरिक औषधे बाजारातील किमतीपेक्षा ५०% ते ९०% स्वस्त दरात उपलब्ध.", benefits: "१०,०००+ जनऔषधी केंद्रांवर सामान्य नागरिकांना अत्यंत स्वस्त दरात औषधे." },
      gu: { name: "પ્રધાનમંત્રી ભારતીય જનઔષધિ પરિયોજના (PMBJP)", desc: "ગુણવત્તાયુક્ત જેનેરિક દવાઓ બ્રાન્ડેડ કરતા 50% થી 90% સસ્તા દરે ઉપલબ્ધ.", benefits: "જનઔષધિ કેન્દ્રો પરથી ખૂબ જ વ્યાજબી ભાવે ઉચ્ચ ગુણવત્તાવાળી જેનેરિક દવાઓ." }
    }
  },
  {
    id: "national-dialysis-program",
    name: "Pradhan Mantri National Dialysis Programme (PMNDP)",
    shortDescription: "Free haemodialysis and peritoneal dialysis services provided to BPL kidney patients across district hospitals.",
    department: "National Health Mission",
    ministry: "Ministry of Health and Family Welfare",
    category: "Health & Healthcare",
    state: "Central",
    benefitsSummary: "100% free dialysis treatment for Below Poverty Line (BPL) patients and highly subsidized for non-BPL patients.",
    financialBenefitAmount: 75000,
    eligibilityRules: {
      maxAnnualIncome: 250000,
      requiredDocuments: ["Aadhaar", "Ration Card", "Doctor Prescription"]
    },
    requiredDocuments: ["Aadhaar Card", "BPL Ration Card / Income Certificate", "Nephrologist Referral / Dialysis Prescription"],
    applicationSteps: ["Visit designated District Hospital or PMNDP Dialysis Center.", "Present BPL ration card and medical referral.", "Get enrolled on the national PMNDP portal for scheduled free dialysis."],
    officialApplyUrl: "https://pmndp.mohfw.gov.in/",
    officialWebsite: "https://nhm.gov.in/",
    helplineNumber: "104 / 14555",
    deadline: "Open All Year",
    tags: ["Dialysis", "Kidney Disease", "Free Treatment", "BPL Health"],
    faqs: [{ question: "Is dialysis completely free for BPL citizens?", answer: "Yes, 100% free across all empanelled district hospital dialysis units." }],
    lastUpdated: "2026-07-20",
    popularityScore: 86,
    translations: {
      hi: { name: "प्रधानमंत्री राष्ट्रीय डायलिसिस कार्यक्रम (PMNDP)", desc: "गरीब और बीपीएल किडनी रोगियों के लिए जिला अस्पतालों में 100% मुफ्त डायलिसिस सेवा।", benefits: "बीपीएल मरीजों को जिला अस्पतालों में जीवन भर मुफ्त डायलिसिस सत्र।" },
      ta: { name: "பிரதான் மந்திரி தேசிய டயாலிசிஸ் திட்டம் (PMNDP)", desc: "வறுமைக் கோட்டிற்கு கீழ் உள்ள சிறுநீரக நோயாளிகளுக்கு மாவட்ட மருத்துவமனைகளில் இலவச டயாலிசிஸ்.", benefits: "பிபிஎல் நோயாளிகளுக்கு அரசு மருத்துவமனைகளில் 100% இலவச டயாலிசிஸ் சிகிச்சை." },
      te: { name: "ప్రధాన మంత్రి జాతీయ డయాలసిస్ ప్రోగ్రామ్ (PMNDP)", desc: "బీపీఎల్ మరియు పేద రోగులకు జిల్లా ఆసుపత్రులలో 100% ఉచిత డయాలసిస్ సేవలు.", benefits: "బీపీఎల్ కార్డుదారులకు జిల్లా ఆసుపత్రులలో ఉచిత కిడ్నీ డయాలసిస్ చికిత్స." },
      ml: { name: "പ്രധാൻ മന്ത്രി ദേശീയ ഡയാലിസിസ് പ്രോഗ്രാം (PMNDP)", desc: "ബിപിഎൽ കുടുംബങ്ങളിലെ രോഗികൾക്ക് ജില്ലാ ആശുപത്രികളിൽ സൗജന്യ ഡയാലിസിസ്.", benefits: "ബിപിഎൽ രോഗികൾക്ക് 100% സൗജന്യ ഡയാലിസിസ് സേവനം ലഭ്യമാക്കുന്നു." },
      mr: { name: "प्रधानमंत्री राष्ट्रीय डायलिसिस कार्यक्रम (PMNDP)", desc: "दारिद्र्यरेषेखालील (BPL) मूत्रपिंड रुग्णांसाठी जिल्हा रुग्णालयांमध्ये १००% मोफत डायलिसिस.", benefits: "बीपीएल रुग्णांना शासकीय रुग्णालयांत सर्व डायलिसिस सत्रे मोफत." },
      gu: { name: "પ્રધાનમંત્રી રાષ્ટ્રીય ડાયાલિસિસ પ્રોગ્રામ (PMNDP)", desc: "ગરીબ અને BPL કિડની દર્દીઓ માટે જિલ્લા હોસ્પિટલોમાં 100% મફત ડાયાલિસિસ સારવાર.", benefits: "BPL કાર્ડધારકોને સરકારી હોસ્પિટલોમાં સંપૂર્ણ મફત ડાયાલિસિસ સેવા." }
    }
  },
  {
    id: "mission-indradhanush",
    name: "Intensified Mission Indradhanush (IMI)",
    shortDescription: "Universal full immunization coverage for pregnant women and children up to 2 years against 12 vaccine-preventable diseases.",
    department: "Immunization Division",
    ministry: "Ministry of Health and Family Welfare",
    category: "Health & Healthcare",
    state: "Central",
    benefitsSummary: "Free vaccines protecting children and pregnant women against Tuberculosis, Polio, Measles, Hepatitis B, Tetanus, and Diphtheria.",
    financialBenefitAmount: 15000,
    eligibilityRules: {
      maxAge: 5,
      allowedGenders: ["All"],
      requiredDocuments: ["Mother-Child Protection Card (MCP Card)"]
    },
    requiredDocuments: ["Mother and Child Protection (MCP) Card", "Aadhaar Card of Parent", "Birth Certificate"],
    applicationSteps: ["Visit any Anganwadi Center, Primary Health Center (PHC), or Sub-Center on vaccination days.", "ANM updates MCP card and administers due vaccines for free."],
    officialApplyUrl: "https://nhm.gov.in/index1.php?lang=1&level=2&sublinkid=822&lid=220",
    officialWebsite: "https://mohfw.gov.in/",
    helplineNumber: "1075",
    deadline: "Open All Year",
    tags: ["Vaccination", "Immunization", "Child Care", "Mission Indradhanush"],
    faqs: [{ question: "Are the vaccines free under Mission Indradhanush?", answer: "Yes, all 12 vaccines under the Universal Immunization Programme are administered completely free." }],
    lastUpdated: "2026-08-05",
    popularityScore: 91,
    translations: {
      hi: { name: "सघन मिशन इन्द्रधनुष (IMI)", desc: "गर्भवती महिलाओं और 2 वर्ष तक के बच्चों को 12 जानलेवा बीमारियों से बचाने के लिए मुफ्त टीकाकरण।", benefits: "पोलियो, खसरा, हेपेटाइटिस-बी, टिटनेस सहित 12 टीकों की 100% मुफ्त खुराक।" },
      ta: { name: "தீவிர மிஷன் இந்திரதனுஷ் (IMI)", desc: "கர்ப்பிணிகள் மற்றும் 2 வயது வரையிலான குழந்தைகளுக்கு 12 நோய்களுக்கு எதிரான இலவச தடுப்பூசி.", benefits: "அரசு சுகாதார மையங்கள் மூலம் குழந்தைகளுக்கு 12 தடுப்பூசிகள் 100% இலவசம்." },
      te: { name: "మిషన్ ఇంద్రధనుష్ టీకా కార్యక్రమం (IMI)", desc: "గర్భిణీ స్త్రీలు మరియు 2 ఏళ్లలోపు పిల్లలకు 12 ప్రాణాంతక వ్యాధుల నివారణకు ఉచిత టీకాలు.", benefits: "చిన్నారులకు మరియు తల్లులకు 12 రకాల ఉచిత వ్యాక్సిన్లు మరియు ఆరోగ్య రక్షణ." },
      ml: { name: "മിഷൻ ഇന്ദ്രധനുഷ് പ്രതിരോധ കുത്തിവയ്പ്പ് (IMI)", desc: "ഗർഭിണികൾക്കും 2 വയസ്സുവരെയുള്ള കുട്ടികൾക്കും 12 രോഗങ്ങൾക്കെതിരെ സൗജന്യ പ്രതിരോധ കുത്തിവയ്പ്പ്.", benefits: "കുട്ടികൾക്ക് പൂർണ്ണ പ്രതിരോധ കുത്തിവയ്പ്പുകൾ സൗജന്യമായി നൽകുന്നു." },
      mr: { name: "सघन मिशन इंद्रधनुष्य (IMI)", desc: "गर्भवती महिला व २ वर्षांखालील बालकांना १२ आजारांपासून संरक्षणासाठी मोफत लसीकरण.", benefits: "शासकीय आरोग्य केंद्रांवरून सर्व प्रकारच्या आवश्यक लसी मोफत उपलब्ध." },
      gu: { name: "મિશન ઇન્દ્રધનુષ રસીકરણ અભિયાન (IMI)", desc: "સગર્ભા મહિલાઓ અને 2 વર્ષ સુધીના બાળકો માટે 12 રોગો સામે વિનામૂલ્યે રસીકરણ.", benefits: "બાળકો અને માતાઓ માટે તમામ જીવનરક્ષક રસીઓ 100% મફતમાં ઉપલબ્ધ." }
    }
  },
  {
    id: "rashtriya-arogya-nidhi",
    name: "Rashtriya Arogya Nidhi (RAN)",
    shortDescription: "One-time financial grant for poor patients suffering from major life-threatening diseases for treatment at government super-specialty hospitals.",
    department: "Department of Health and Family Welfare",
    ministry: "Ministry of Health and Family Welfare",
    category: "Health & Healthcare",
    state: "Central",
    benefitsSummary: "Financial grant up to ₹15 Lakh for life-saving medical treatment at AIIMS and central government tertiary hospitals.",
    financialBenefitAmount: 1500000,
    eligibilityRules: {
      maxAnnualIncome: 180000,
      requiredDocuments: ["Aadhaar", "Income Certificate", "Medical Certificate"]
    },
    requiredDocuments: ["Aadhaar Card", "BPL Certificate / State Income Certificate", "Hospital Medical Treatment Estimate signed by Medical Superintendent"],
    applicationSteps: ["Consult treating physician at empanelled Central Government Hospital (e.g. AIIMS).", "Doctor and Medical Superintendent forward application and estimate to RAN committee.", "Funds released directly to the hospital for patient's surgery/therapy."],
    officialApplyUrl: "https://mohfw.gov.in/major-programmes/other-national-health-programmes/rashtriya-arogya-nidhi",
    officialWebsite: "https://mohfw.gov.in/",
    helplineNumber: "011-23061342",
    deadline: "Open All Year",
    tags: ["RAN", "Critical Illness", "Cancer", "Super Specialty Treatment"],
    faqs: [{ question: "What is the maximum grant under RAN?", answer: "Up to ₹15 Lakh for life-threatening diseases, and up to ₹50 Lakh under Rare Diseases policy." }],
    lastUpdated: "2026-07-30",
    popularityScore: 85,
    translations: {
      hi: { name: "राष्ट्रीय आरोग्य निधि (RAN)", desc: "गंभीर एवं जानलेवा बीमारियों से पीड़ित बीपीएल मरीजों के इलाज के लिए ₹15 लाख तक की आर्थिक सहायता।", benefits: "एम्स और केंद्रीय सरकारी अस्पतालों में इलाज हेतु ₹15 लाख तक का सीधा वित्तीय अनुदान।" },
      ta: { name: "ராஷ்ட்ரிய ஆரோக்கிய நிதி (RAN)", desc: "உயிருக்கு ஆபத்தான நோய்களால் பாதிக்கப்பட்ட ஏழை நோயாளிகளுக்கு ₹15 லட்சம் வரை சிகிச்சை நிதி.", benefits: "எய்ம்ஸ் மற்றும் அரசு மருத்துவமனைகளில் சிகிச்சை பெற ₹15 லட்சம் வரை உதவி." },
      te: { name: "రాష్ట్రీయ ఆరోగ్య నిధి (RAN)", desc: "ప్రాణాంతక వ్యాధులతో బాధపడుతున్న పేద రోగులకు రూ. 15 లక్షల వరకు ప్రభుత్వ వైద్య చికిత్స సహాయం.", benefits: "ఎయిమ్స్ మరియు ప్రభుత్వ సూపర్ స్పెషాలిటీ ఆసుపత్రులలో రూ. 15 లక్షల వరకు ఉచిత చికిత్స." },
      ml: { name: "രാഷ്ട്രീയ ആരോഗ്യ നിധി (RAN)", desc: "മാരകരോഗങ്ങൾ ബാധിച്ച ബിപിഎൽ രോഗികൾക്ക് 15 ലക്ഷം രൂപ വരെ ചികിത്സാ ധനസഹായം.", benefits: "എയിംസ് ഉൾപ്പെടെയുള്ള ആശുപത്രികളിൽ ചികിത്സയ്ക്കായി ₹15 ലക്ഷം വരെ ഗ്രാൻഡ്." },
      mr: { name: "राष्ट्रीय आरोग्य निधी (RAN)", desc: "गंभीर आजारांनी ग्रस्त गरीब रुग्णांना उपचारासाठी ₹१५ लाखांपर्यंत थेट आर्थिक मदत.", benefits: "एम्ससारख्या शासकीय रुग्णालयांत उपचारासाठी ₹१५ लाखांपर्यंतचे अनुदान." },
      gu: { name: "રાષ્ટ્રીય આરોગ્ય નિધિ (RAN)", desc: "ગંભીર રોગોથી પીડાતા ગરીબ દર્દીઓને સારવાર માટે ₹15 લાખ સુધીની નાણાકીય સહાય.", benefits: "સરકારી હોસ્પિટલોમાં જીવલેણ રોગોની સર્જરી અને સારવાર માટે ₹15 લાખ સુધી ગ્રાન્ટ." }
    }
  },
  {
    id: "nikshay-poshan-yojana",
    name: "Ni-Kshay Poshan Yojana (TB Nutrition Support)",
    shortDescription: "Direct benefit transfer of ₹500 per month for nutritional support to all notified Tuberculosis patients throughout treatment.",
    department: "Central TB Division",
    ministry: "Ministry of Health and Family Welfare",
    category: "Health & Healthcare",
    state: "Central",
    benefitsSummary: "₹500 per month credited directly into bank account of TB patients for buying high-protein nutritional food during treatment.",
    financialBenefitAmount: 6000,
    eligibilityRules: {
      requiredDocuments: ["Aadhaar", "Bank Passbook", "TB Notification Number"]
    },
    requiredDocuments: ["Aadhaar Card", "Bank Account Details", "TB Patient Notification ID on Nikshay Portal"],
    applicationSteps: ["Get diagnosed at any Government or private health facility.", "Health staff notifies patient on Nikshay portal.", "₹500/month automatically transferred via DBT to patient's bank account."],
    officialApplyUrl: "https://nikshay.in/",
    officialWebsite: "https://tbcindia.gov.in/",
    helplineNumber: "1800-11-6666",
    deadline: "Open All Year",
    tags: ["TB", "Tuberculosis", "Nutrition Support", "DBT"],
    faqs: [{ question: "Do private sector TB patients get Ni-Kshay Poshan Yojana benefits?", answer: "Yes, all notified TB patients in both public and private sectors are eligible." }],
    lastUpdated: "2026-08-01",
    popularityScore: 89,
    translations: {
      hi: { name: "निक्षय पोषण योजना (TB पोषण सहायता)", desc: "टीबी (क्षयरोग) के सभी मरीजों को पोषण के लिए ₹500 प्रति माह सीधे बैंक खाते में सहायता।", benefits: "इलाज की पूरी अवधि तक हर महीने ₹500 की पौष्टिक आहार सहायता (DBT)।" },
      ta: { name: "நி-க்ஷய் போஷன் யோஜனா (TB ஊட்டச்சத்து உதவி)", desc: "காசநோய் (TB) நோயாளிகளுக்கு சத்தான உணவுக்காக மாதம் ₹500 வங்கி கணக்கில் வரவு.", benefits: "சிகிச்சை காலம் முழுவதும் ஊட்டச்சத்து ஆதரவாக மாதம் ₹500 நேரடி வங்கி பரிமாற்றம்." },
      te: { name: "ని-క్షయ్ పోషణ్ యోజన (టీబీ పోషకాహార పథకం)", desc: "టీబీ బాధితులకు పౌష్టికాహారం కోసం నెలకు రూ. 500 చొప్పున నేరుగా బ్యాంక్ ఖాతాలో జమ.", benefits: "చికిత్స ముగిసే వరకు ప్రతి నెలా రూ. 500 పోషకాహార సహాయం (DBT)." },
      ml: { name: "നി-ക്ഷയ് പോഷൺ യോജന (TB ന്യൂട്രീഷൻ സപ്പോർട്ട്)", desc: "ക്ഷയരോഗികൾക്ക് പോഷകാഹാരം വാങ്ങുന്നതിനായി പ്രതിമാസം 500 രൂപ നേരിട്ട് അക്കൗണ്ടിലേക്ക്.", benefits: "ചികിത്സാ കാലയളവിൽ മുഴുവൻ പ്രതിമാസം ₹500 ബാങ്ക് അക്കൗണ്ടിൽ ലഭ്യമാക്കുന്നു." },
      mr: { name: "निक्षय पोषण योजना (टीबी पोषण अनुदान)", desc: "सर्व क्षयरोग (TB) रुग्णांना पौष्टिक आहारासाठी दरमहा ₹५०० थेट बँक खात्यात.", benefits: "उपचार सुरू असेपर्यंत दरमहा ₹५०० चे पोषण सहाय्य डीबीटीद्वारे जमा." },
      gu: { name: "નિક્ષય પોષણ યોજના (ટીબી પોષણ સહાય)", desc: "ટીબીના દર્દીઓને સારવાર દરમિયાન પોષણ માટે દર મહિને ₹500 ની સીધી બેંક સહાય.", benefits: "ટીબી દર્દીઓને સારવારના સમગ્ર સમયગાળા દરમિયાન દર મહિને ₹500 ની DBT સહાય." }
    }
  },
  {
    id: "tele-manas-mental-health",
    name: "Tele MANAS (National Tele Mental Health Programme)",
    shortDescription: "24x7 toll-free comprehensive mental health counseling and psychiatric support across all Indian states in 20+ languages.",
    department: "National Tele Mental Health Cell",
    ministry: "Ministry of Health and Family Welfare",
    category: "Health & Healthcare",
    state: "Central",
    benefitsSummary: "100% free confidential mental health consultation, crisis counseling, and referral to specialist psychiatric centers.",
    financialBenefitAmount: 5000,
    eligibilityRules: {
      allowedGenders: ["All"],
      requiredDocuments: []
    },
    requiredDocuments: ["No documents required - completely open and confidential telephone service."],
    applicationSteps: ["Dial toll-free number 14416 or 1800-891-4416.", "Select preferred language.", "Speak directly to trained clinical psychologists and counselors."],
    officialApplyUrl: "https://telemanas.mohfw.gov.in/",
    officialWebsite: "https://telemanas.mohfw.gov.in/",
    helplineNumber: "14416 / 1800-891-4416",
    deadline: "24x7 Open All Year",
    tags: ["Mental Health", "Counseling", "Tele MANAS", "Toll Free Helpline"],
    faqs: [{ question: "Is Tele MANAS confidential?", answer: "Yes, all consultations are completely confidential and free of charge." }],
    lastUpdated: "2026-08-14",
    popularityScore: 90,
    translations: {
      hi: { name: "टेली-मानस (राष्ट्रीय टेली मानसिक स्वास्थ्य सेवा)", desc: "24x7 टोल-फ्री मुफ्त मानसिक स्वास्थ्य परामर्श और मनोवैज्ञानिक सहायता सेवा।", benefits: "टोल-फ्री नंबर 14416 पर 20+ भाषाओं में पूरी तरह मुफ्त और गोपनीय मानसिक परामर्श।" },
      ta: { name: "டெலி-மானஸ் (தேசிய மனநல தொலைதொடர்பு சேவை)", desc: "24x7 கட்டணமில்லா மனநல ஆலோசனை மற்றும் மன அழுத்த மேலாண்மை உதவி சேவை.", benefits: "14416 என்ற எண்ணில் 24 மணி நேரமும் இலவச ரகசிய மனநல ஆலோசனை." },
      te: { name: "టెలి-మానస్ (జాతీయ మానసిక ఆరోగ్య టెలిఫోన్ సేవ)", desc: "24 గంటలు ఉచిత మానసిక కౌన్సిలింగ్ మరియు నిపుణుల సలహాలు అందించే హెల్ప్‌లైన్.", benefits: "14416 టోల్-ఫ్రీ నంబర్ ద్వారా 24/7 ఉచిత మరియు గోప్యమైన మానసిక ఆరోగ్య సలహాలు." },
      ml: { name: "ടെലി-മാനസ് (ദേശീയ മാനസികാരോഗ്യ സേവനം)", desc: "24 മണിക്കൂറും സൗജന്യ മാനസികാരോഗ്യ കൗൺസിലിംഗും സഹായവും നൽകുന്ന ഹെൽപ്പ്‌ലൈൻ.", benefits: "14416 എന്ന ടോൾ ഫ്രീ നമ്പറിലൂടെ സൗജന്യവും രഹസ്യവുമായ വിദഗ്ദ്ധ കൗൺസിലിംഗ്." },
      mr: { name: "टेली-मानस (राष्ट्रीय मानसिक आरोग्य सेवा)", desc: "२४ तास मोफत मानसिक समुपदेशन आणि तज्ज्ञांचे मार्गदर्शन पुरवणारी सेवा.", benefits: "१४४१६ टोल-फ्री क्रमांकावर मोफत आणि गोपनीय मानसिक आरोग्य मार्गदर्शन." },
      gu: { name: "ટેલી-માનસ (રાષ્ટ્રીય ટેલી માનસિક સ્વાસ્થ્ય સેવા)", desc: "24 કલાક ટોલ-ફ્રી મફત માનસિક સ્વાસ્થ્ય પરામર્શ અને કાઉન્સિલિંગ સેવા.", benefits: "14416 ડાયલ કરીને 24 કલાક સંપૂર્ણ મફત અને ગોપનીય માનસિક પરામર્શ મેળવો." }
    }
  },

  // 3. Housing & Shelter (5 new)
  {
    id: "pmay-u-urban-housing",
    name: "Pradhan Mantri Awas Yojana - Urban (PMAY-U)",
    shortDescription: "Pucca houses with all basic civic amenities to all eligible urban households belonging to EWS, LIG, and MIG categories.",
    department: "Ministry of Housing and Urban Affairs",
    ministry: "Ministry of Housing and Urban Affairs",
    category: "Housing & Shelter",
    state: "Central",
    benefitsSummary: "Interest subsidy up to ₹2.67 Lakh under CLSS or upfront grant of ₹1.5 Lakh to ₹2.5 Lakh under beneficiary-led construction.",
    financialBenefitAmount: 267000,
    eligibilityRules: {
      maxAnnualIncome: 1800000,
      requiredDocuments: ["Aadhaar", "Income Certificate", "Bank Passbook", "Land Ownership Documents"]
    },
    requiredDocuments: ["Aadhaar Card", "Salary Slip / Income Certificate", "Land Registry Documents (for BLC)", "Affidavit of not owning pucca house"],
    applicationSteps: ["Apply online on pmaymis.gov.in or through Urban Local Body (Municipality/Corporation).", "Municipal engineers verify site.", "Subsidy credited directly into home loan account."],
    officialApplyUrl: "https://pmaymis.gov.in/",
    officialWebsite: "https://mohua.gov.in/",
    helplineNumber: "1800-11-3377",
    deadline: "Open All Year",
    tags: ["PMAY Urban", "Housing", "Home Loan Subsidy", "CLSS"],
    faqs: [{ question: "Who qualifies as EWS under PMAY-U?", answer: "Households with annual income up to ₹3 Lakh qualify for the EWS category." }],
    lastUpdated: "2026-08-01",
    popularityScore: 95,
    translations: {
      hi: { name: "प्रधानमंत्री आवास योजना - शहरी (PMAY-U)", desc: "शहरी गरीबों और मध्यम वर्ग को पक्का मकान बनाने के लिए ₹2.67 लाख तक की होम लोन ब्याज सब्सिडी।", benefits: "होम लोन पर ₹2,67,000 तक की ब्याज सब्सिडी अथवा ₹1.5 लाख का प्रत्यक्ष निर्माण अनुदान।" },
      ta: { name: "பிரதான் மந்திரி ஆவாஸ் யோஜனா - நகர்ப்புறம் (PMAY-U)", desc: "நகர்ப்புற குடும்பங்களுக்கு சொந்த வீடு கட்ட ₹2.67 லட்சம் வரை வீட்டுக் கடன் வட்டி மானியம்.", benefits: "வீட்டுக் கடனுக்கு ₹2.67 லட்சம் வரை வட்டி மானியம் அல்லது நேரடி நிதி உதவி." },
      te: { name: "ప్రధాన మంత్రి ఆవాస్ యోజన - అర్బన్ (PMAY-U)", desc: "పట్టణ పేదలు మరియు మధ్యతరగతి ప్రజలకు పక్కా ఇళ్ల నిర్మాణానికి వడ్డీ సబ్సిడీ పథకం.", benefits: "హోమ్ లోన్‌పై రూ. 2.67 లక్షల వరకు వడ్డీ సబ్సిడీ లేదా రూ. 1.5 లక్షల నిర్మాణ గ్రాంట్." },
      ml: { name: "പ്രധാൻ മന്ത്രി ആവാസ് യോജന - അർബൻ (PMAY-U)", desc: "നഗരവാസികൾക്ക് വീട് നിർമ്മിക്കുന്നതിനായി ഭവനവായ്പയിൽ പലിശ സബ്‌സിഡി.", benefits: "ഭവനവായ്പയ്ക്ക് ₹2.67 ലക്ഷം വരെ പലിശ സബ്‌സിഡി ലഭ്യമാക്കുന്നു." },
      mr: { name: "प्रधानमंत्री आवास योजना - शहरी (PMAY-U)", desc: "शहरी भागातील नागरिकांना पक्के घर बांधण्यासाठी होम लोनवर ₹२.६७ लाखांपर्यंत व्याज अनुदान.", benefits: "गृहकर्जावर ₹२,६७,००० पर्यंत व्याज सवलत किंवा थेट बांधकाम अनुदान." },
      gu: { name: "પ્રધાનમંત્રી આવાસ યોજના - શહેરી (PMAY-U)", desc: "શહેરી ગરીબો અને મધ્યમ વર્ગને પાકું મકાન બનાવવા માટે ₹2.67 લાખ સુધીની વ્યાજ સબસિડી.", benefits: "હોમ લોન પર ₹2.67 લાખ સુધીની વ્યાજ સબસિડી અથવા મકાન બાંધકામ સહાય." }
    }
  },
  {
    id: "pm-svamitva-property-card",
    name: "SVAMITVA Scheme (Rural Property Cards)",
    shortDescription: "Survey of villages and mapping with improvised technology in village areas to issue legal property ownership cards to rural owners.",
    department: "Ministry of Panchayati Raj",
    ministry: "Ministry of Panchayati Raj",
    category: "Housing & Shelter",
    state: "Central",
    benefitsSummary: "Official Government Property Card enabling rural homeowners to use property as financial asset for taking bank loans and resolving disputes.",
    financialBenefitAmount: 50000,
    eligibilityRules: {
      allowedOccupations: ["Rural Resident", "Farmer", "Daily Wager"],
      requiredDocuments: ["Aadhaar"]
    },
    requiredDocuments: ["Aadhaar Card", "Existing Village House Tax Receipt / Chulha Tax Receipt"],
    applicationSteps: ["Survey of India conducts drone mapping of inhabited village area (Abadi).", "Ground validation by Revenue officials and Gram Panchayat.", "Property Card generated with QR code and handed to homeowner."],
    officialApplyUrl: "https://svamitva.nic.in/",
    officialWebsite: "https://panchayat.gov.in/",
    helplineNumber: "011-23389012",
    deadline: "Open All Year",
    tags: ["SVAMITVA", "Property Card", "Rural Land Records", "Panchayat"],
    faqs: [{ question: "Can SVAMITVA Property Card be used for bank loans?", answer: "Yes, it is a legally recognized ownership record for financial collateral." }],
    lastUpdated: "2026-07-28",
    popularityScore: 88,
    translations: {
      hi: { name: "स्वामित्व योजना (ग्रामीण प्रॉपर्टी कार्ड)", desc: "गांवों में ड्रोन मैपिंग द्वारा ग्रामीणों को उनके मकान का कानूनी मालिकाना प्रॉपर्टी कार्ड।", benefits: "गांव के घर पर कानूनी मालिकाना हक और बैंक से लोन लेने का आधिकारिक अधिकार।" },
      ta: { name: "சுவாமித்வா திட்டம் (கிராம சொத்து அட்டை)", desc: "கிராமப்புற மக்களுக்கு அவர்களின் வீட்டு மனைக்கான சட்டப்பூர்வ சொத்து உரிமை அட்டை வழங்கும் திட்டம்.", benefits: "கிராமப்புற வீட்டிற்கு சட்டப்பூர்வ உரிமை அட்டை மற்றும் வங்கி கடன் பெறும் வசதி." },
      te: { name: "స్వామిత్వ పథకం (గ్రామీణ ఆస్తి కార్డులు)", desc: "డ్రోన్ సర్వే ద్వారా గ్రామీణ ప్రజలకు వారి ఇళ్లపై చట్టబద్ధమైన హక్కుల ఆస్తి కార్డుల పంపిణీ.", benefits: "గ్రామీణ నివాసితులకు ప్రాపర్టీ కార్డు మరియు బ్యాంక్ రుణాలు పొందే చట్టబద్ధ హక్కు." },
      ml: { name: "സ്വാമിത്വ പദ്ധതി (ഗ്രാമീണ പ്രോപ്പർട്ടി കാർഡ്)", desc: "ഗ്രാമങ്ങളിലെ വീടുകൾക്ക് ഡ്രോൺ സർവേ വഴി നിയമപരമായ പ്രോപ്പർട്ടി കാർഡ് നൽകുന്നു.", benefits: "ഗ്രാമീണ ഭവനങ്ങൾക്ക് ഉടമസ്ഥാവകാശ രേഖയും ബാങ്ക് വായ്പയ്ക്കുള്ള സൗകര്യവും." },
      mr: { name: "स्वामित्व योजना (ग्रामीण प्रॉपर्टी कार्ड)", desc: "गावातील घरांचे ड्रोनद्वारे सर्वेक्षण करून नागरिकांना अधिकृत मालमत्ता पत्रक वाटप.", benefits: "ग्रामीण घरांचे मालकी हक्क पत्रक आणि बँकेतून कर्ज मिळण्याची कायदेशीर सोय." },
      gu: { name: "સ્વામિત્વ યોજના (ગ્રામીણ પ્રોપર્ટી કાર્ડ)", desc: "ગામડાઓમાં ડ્રોન સર્વે દ્વારા મકાનોના કાયદેસર માલિકી હકના પ્રોપર્ટી કાર્ડનું વિતરણ.", benefits: "ગ્રામીણ મકાનો પર કાયદેસર માલિકી હક અને બેંક લોન લેવાની અધિકૃત સુવિધા." }
    }
  },
  {
    id: "deendayal-antodaya-shelter",
    name: "Shelter for Urban Homeless (DAY-NULM SUH)",
    shortDescription: "Permanent all-weather community shelters with basic amenities for urban homeless populations across cities.",
    department: "Mission Directorate DAY-NULM",
    ministry: "Ministry of Housing and Urban Affairs",
    category: "Housing & Shelter",
    state: "Central",
    benefitsSummary: "Free 24x7 night shelter with clean beds, drinking water, sanitation, lockers, healthcare checkups, and social security linkage.",
    financialBenefitAmount: 18000,
    eligibilityRules: {
      requiredDocuments: []
    },
    requiredDocuments: ["No documents strictly required - identity cards linked after shelter admission."],
    applicationSteps: ["Walk in to nearest Urban Night Shelter (Rain Basera) run by Municipal Corporation.", "Free registration and accommodation provided immediately."],
    officialApplyUrl: "https://nulm.gov.in/",
    officialWebsite: "https://mohua.gov.in/",
    helplineNumber: "1800-11-2022",
    deadline: "24x7 Open All Year",
    tags: ["Shelter", "Urban Homeless", "DAY NULM", "Rain Basera"],
    faqs: [{ question: "Is there any charge for staying in NULM shelters?", answer: "No, staying in government urban homeless shelters is 100% free." }],
    lastUpdated: "2026-06-30",
    popularityScore: 80,
    translations: {
      hi: { name: "शहरी बेघरों के लिए आश्रय योजना (DAY-NULM SUH)", desc: "शहरी बेघर नागरिकों के लिए 24 घंटे मुफ्त रैन बसेरा, भोजन, बिस्तर और स्वास्थ्य सुविधाएं।", benefits: "शहरी बेघरों को 100% मुफ्त रात्रि आश्रय, शुद्ध पेयजल और चिकित्सा सहायता।" },
      ta: { name: "வீடற்றோருக்கான நகர்ப்புற தங்குமிடம் (DAY-NULM)", desc: "வீடற்ற நகர்ப்புற மக்களுக்கு சுத்தமான படுக்கை, குடிநீர் மற்றும் பாதுகாப்புடன் கூடிய இலவச தங்குமிடம்.", benefits: "நகர்ப்புற வீடற்றோருக்கு 100% இலவச இரவு தங்குமிடம் மற்றும் மருத்துவ பரிசோதனை." },
      te: { name: "పట్టణ నిరాశ్రయుల ఆశ్రయ పథకం (DAY-NULM)", desc: "నిరాశ్రయులైన పట్టణ ప్రజలకు ఉచిత వసతి, తాగునీరు మరియు రక్షణ కల్పించే నైట్ షెల్టర్లు.", benefits: "నిరాశ్రయులకు 100% ఉచిత రాత్రి వసతి, వైద్య సహాయం మరియు సామాజిక భద్రత." },
      ml: { name: "ഭവനരഹിതർക്കുള്ള നഗര ഷെൽട്ടർ (DAY-NULM)", desc: "നഗരങ്ങളിലെ ഭവനരഹിതർക്കായി എല്ലാ സൗകര്യങ്ങളോടും കൂടിയ സൗജന്യ രാത്രികാല അഭയകേന്ദ്രങ്ങൾ.", benefits: "ഭവനരഹിതർക്ക് 100% സൗജന്യ താമസവും അടിസ്ഥാന സൗകര്യങ്ങളും." },
      mr: { name: "शहरी बेघरांसाठी निवारा योजना (DAY-NULM)", desc: "शहरातील बेघर लोकांसाठी २४ तास मोफत निवारा, पिण्याचे पाणी व आरोग्य सुविधा.", benefits: "बेघरांना मोफत रात्र निवारा, स्वच्छतागृहे आणि वैद्यकीय तपासणीची सोय." },
      gu: { name: "શહેરી બેઘર આશ્રય યોજના (DAY-NULM)", desc: "શહેરોમાં બેઘર લોકોને રહેવા માટે વિનામૂલ્યે 24 કલાક સુરક્ષિત શેલ્ટર હોમની સુવિધા.", benefits: "બેઘર લોકોને 100% મફત રાત્રિ આશ્રય, શુદ્ધ પાણી અને આરોગ્ય તપાસની સુવિધા." }
    }
  },
  {
    id: "affordable-rental-housing",
    name: "Affordable Rental Housing Complexes (ARHCs)",
    shortDescription: "Ease of living for urban migrants and industrial workers through dignified affordable rental housing near workplaces.",
    department: "Ministry of Housing and Urban Affairs",
    ministry: "Ministry of Housing and Urban Affairs",
    category: "Housing & Shelter",
    state: "Central",
    benefitsSummary: "Subsidized rental housing apartments with piped water, electricity, and security at low rents for urban workers.",
    financialBenefitAmount: 36000,
    eligibilityRules: {
      maxAnnualIncome: 300000,
      allowedOccupations: ["Industrial Worker", "Daily Wager", "Street Vendor", "Driver", "Security Guard"],
      requiredDocuments: ["Aadhaar", "Employment Proof"]
    },
    requiredDocuments: ["Aadhaar Card", "Employment ID / Letter from Employer", "Bank Passbook"],
    applicationSteps: ["Apply online on arhc.mohua.gov.in or through employer/concessionaire.", "Verification of urban migrant status.", "Allotment of rental unit on subsidized monthly lease."],
    officialApplyUrl: "https://arhc.mohua.gov.in/",
    officialWebsite: "https://arhc.mohua.gov.in/",
    helplineNumber: "011-23063285",
    deadline: "Open All Year",
    tags: ["ARHC", "Rental Housing", "Migrant Workers", "Affordable Rent"],
    faqs: [{ question: "Who is eligible for ARHC housing?", answer: "Urban migrants, factory workers, street vendors, and low-wage service personnel." }],
    lastUpdated: "2026-07-15",
    popularityScore: 82,
    translations: {
      hi: { name: "सस्ती किराये की आवास योजना (ARHC)", desc: "शहरी प्रवासी मजदूरों और कामगारों के लिए कार्यस्थल के पास बहुत कम किराये पर पक्के आवास।", benefits: "प्रवासी श्रमिकों को सस्ती दरों पर सभी बुनियादी सुविधाओं से युक्त किराये का मकान।" },
      ta: { name: "மலிவு விலை வாடகை வீட்டுத் திட்டம் (ARHC)", desc: "நகர்ப்புற தொழிலாளர்கள் மற்றும் புலம்பெயர்ந்தோருக்காக குறைந்த வாடகையில் வீடுகள்.", benefits: "தொழிலாளர்களுக்கு குறைந்த வாடகையில் பாதுகாப்பான குடியிருப்பு வசதி." },
      te: { name: "సరసమైన అద్దె గృహ సముదాయాలు (ARHC)", desc: "వలస కార్మికులు మరియు పట్టణ శ్రామికుల కోసం తక్కువ అద్దెకే పక్కా గృహాల సౌకర్యం.", benefits: "కార్మికులకు పని ప్రదేశం వద్దే అత్యంత సరసమైన అద్దెతో నివాస సౌకర్యం." },
      ml: { name: "അഫോർഡബിൾ റെന്റൽ ഹൗസിംഗ് (ARHC)", desc: "നഗരങ്ങളിലെ തൊഴിലാളികൾക്കും കുടിയേറ്റക്കാർക്കും കുറഞ്ഞ വാടകയ്ക്ക് ഭവന സമുച്ചയങ്ങൾ.", benefits: "തൊഴിലാളികൾക്ക് കുറഞ്ഞ വാടകയിൽ സുരക്ഷിതമായ താമസസൗകര്യം." },
      mr: { name: "परवडणारी भाडेतत्त्वावरील गृहनिर्माण योजना (ARHC)", desc: "शहरी भागातील स्थलांतरित कामगारांसाठी कामाच्या ठिकाणी अत्यंत कमी भाड्यात घरे.", benefits: "कामगारांना सर्व सोयीसुविधांसह नाममात्र भाड्यात राहण्याची सोय." },
      gu: { name: "સસ્તી ભાડાની આવાસ યોજના (ARHC)", desc: "શહેરી પ્રવાસી મજૂરો અને કામદારો માટે કાર્યસ્થળ નજીક વાજબી ભાડાના મકાનો.", benefits: "શ્રમિકોને પાણી, વીજળી અને સુરક્ષા સાથે નજીવા ભાડે આવાસની સુવિધા." }
    }
  },
  {
    id: "tn-kalignar-kanavu-illam",
    name: "Kalaignar Kanavu Illam Scheme (Tamil Nadu)",
    shortDescription: "Tamil Nadu state government mission to transform all hutment and kutcha dwellings into climate-resilient concrete houses.",
    department: "Rural Development and Panchayat Raj Department",
    ministry: "Government of Tamil Nadu",
    category: "Housing & Shelter",
    state: "Tamil Nadu",
    benefitsSummary: "State government financial grant of ₹3,50,000 per house for constructing permanent concrete houses in rural Tamil Nadu.",
    financialBenefitAmount: 350000,
    eligibilityRules: {
      allowedStates: ["Tamil Nadu"],
      maxAnnualIncome: 120000,
      requiredDocuments: ["Aadhaar", "Ration Card", "Land Patta"]
    },
    requiredDocuments: ["Aadhaar Card", "Tamil Nadu Smart Family Card", "Land Patta in applicant's name", "Bank Passbook"],
    applicationSteps: ["Village Administrative Officer (VAO) and BDO survey hut dwellers.", "Gram Sabha approval of beneficiary list.", "Direct fund release in installments based on construction progress."],
    officialApplyUrl: "https://tnrd.tn.gov.in/",
    officialWebsite: "https://tn.gov.in/",
    helplineNumber: "1800-425-1044",
    deadline: "Open All Year",
    tags: ["Tamil Nadu", "Kalaignar Kanavu Illam", "Housing Grant", "Rural Housing"],
    faqs: [{ question: "What is the assistance amount under Kalaignar Kanavu Illam?", answer: "₹3,50,000 per house disbursed in stages directly to the beneficiary's bank account." }],
    lastUpdated: "2026-08-10",
    popularityScore: 93,
    translations: {
      hi: { name: "कलैग्नार कनावु इल्लम योजना (तमिलनाडु)", desc: "तमिलनाडु के ग्रामीण क्षेत्रों में कच्चे घरों को कंक्रीट के मकान में बदलने हेतु ₹3.5 लाख का अनुदान।", benefits: "कच्चे मकानों को पक्के घर में बदलने के लिए ₹3,50,000 का सरकारी अनुदान।" },
      ta: { name: "கலைஞர் கனவு இல்லம் திட்டம் (தமிழ்நாடு)", desc: "கிராமப்புற குடிசைகளை மாற்றி கான்கிரீட் வீடுகள் கட்ட ₹3,50,000 வழங்கும் அரசு திட்டம்.", benefits: "கிராமப்புற ஏழைகளுக்கு வீடு கட்ட தமிழ்நாடு அரசால் ₹3,50,000 முழு நிதி உதவி." },
      te: { name: "కలైంజ్ఞర్ కనవు ఇల్లమ్ పథకం (తమిళనాడు)", desc: "తమిళనాడు గ్రామీణ ప్రాంతాల్లో గుడిసెల స్థానంలో పక్కా ఇళ్ల నిర్మాణానికి రూ. 3.5 లక్షల సహాయం.", benefits: "పేద కుటుంబాలకు పక్కా ఇళ్ల నిర్మాణానికి రూ. 3,50,000 పూర్తి ఆర్థిక సహాయం." },
      ml: { name: "കലൈഞ്ജർ കനവു ഇല്ലം പദ്ധതി (തമിഴ്നാട്)", desc: "തമിഴ്‌നാട്ടിലെ ഗ്രാമങ്ങളിൽ കോൺക്രീറ്റ് വീടുകൾ നിർമ്മിക്കുന്നതിനായി 3.5 ലക്ഷം രൂപ ധനസഹായം.", benefits: "പാവപ്പെട്ട കുടുംബങ്ങൾക്ക് വീട് വെക്കാൻ ₹3,50,000 സർക്കാർ ഗ്രാൻഡ്." },
      mr: { name: "कलैग्नार कनावू इल्लम योजना (तमिळनाडू)", desc: "तमिळनाडूच्या ग्रामीण भागातील झोपड्यांच्या जागी पक्की घरे बांधण्यासाठी ₹३.५ लाखांचे अनुदान.", benefits: "ग्रामीण नागरिकांना पक्के घर बांधण्यासाठी ₹३,५०,००० ची थेट आर्थिक मदत." },
      gu: { name: "કલાઈગ્નર કનાવુ ઇલ્લમ યોજના (તમિલનાડુ)", desc: "તમિલનાડુમાં ઝૂંપડાઓને પાકા કોંક્રીટના મકાનોમાં ફેરવવા માટે ₹3.5 લાખની સરકારી સહાય.", benefits: "ગ્રામીણ ગરીબોને પાકું ઘર બનાવવા માટે ₹3,50,000 ની સંપૂર્ણ આર્થિક સહાય." }
    }
  }
];

console.log('Writing expandSchemes.cjs with all schemes...');
module.exports = { newSchemes };