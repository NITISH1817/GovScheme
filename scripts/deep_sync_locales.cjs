const fs = require('fs');
const path = require('path');

// 1. Read existing translation files
const en = JSON.parse(fs.readFileSync('./public/locales/en/translation.json', 'utf8'));
const hi = JSON.parse(fs.readFileSync('./public/locales/hi/translation.json', 'utf8'));
const mr = JSON.parse(fs.readFileSync('./public/locales/mr/translation.json', 'utf8'));
const gu = JSON.parse(fs.readFileSync('./public/locales/gu/translation.json', 'utf8'));

// 2. Parse src/data/translations.ts for the built-in dictionary
const srcTranslationsText = fs.readFileSync('./src/data/translations.ts', 'utf8');

function extractDict(langCode) {
  const regex = new RegExp(`${langCode}:\\s*\\{[\\s\\S]*?\\n\\s*\\},`);
  const match = srcTranslationsText.match(regex);
  if (!match) return {};
  const block = match[0].replace(new RegExp(`^${langCode}:\\s*`), '').replace(/,$/, '');
  try {
    const fn = new Function(`return ${block};`);
    return fn();
  } catch (err) {
    console.error('Error parsing block for', langCode, err.message);
    return {};
  }
}

const mrDict = extractDict('mr');
const guDict = extractDict('gu');
console.log('Extracted keys from translations.ts - mr:', Object.keys(mrDict).length, 'gu:', Object.keys(guDict).length);

// Merge built-in translations
Object.assign(mr, mrDict);
Object.assign(gu, guDict);

// Read any other python/cjs patch files for additional translations
['patch_translations.py', 'patch_translations_2.py', 'patch_translations_3.py', 'patch_translations_4.py'].forEach(p => {
  const fullPath = path.join('./scripts', p);
  if (fs.existsSync(fullPath)) {
    const txt = fs.readFileSync(fullPath, 'utf8');
    const mrP = txt.match(/mr_translations\s*=\s*\{([\s\S]*?)\n\}/);
    if (mrP) {
      try {
        const obj = new Function(`return {${mrP[1]}};`)();
        Object.assign(mr, obj);
      } catch (e) {}
    }
    const guP = txt.match(/gu_translations\s*=\s*\{([\s\S]*?)\n\}/);
    if (guP) {
      try {
        const obj = new Function(`return {${guP[1]}};`)();
        Object.assign(gu, obj);
      } catch (e) {}
    }
  }
});

// Comprehensive UI key translation mapping for ALL remaining untranslated keys
const additionalDict = {
  // Common UI & Statuses
  eligibleStatus: { mr: "पात्र", gu: "પાત્ર", hi: "पात्र" },
  conditionalStatus: { mr: "सशर्त पात्र", gu: "શરતી પાત્ર", hi: "सशर्त पात्र" },
  notEligibleStatus: { mr: "अपात्र", gu: "અપાત્ર", hi: "अपात्र" },
  whyEligible: { mr: "तुम्ही का पात्र आहात", gu: "તમે શા માટે પાત્ર છો", hi: "आप क्यों पात्र हैं" },
  missingRequirements: { mr: "आवश्यक कागदपत्रे / अटी", gu: "જરૂરી દસ્તાવેજો / અધૂરી વિગતો", hi: "आवश्यक दस्तावेज" },
  recommendedSchemes: { mr: "शिफारस केलेल्या योजना", gu: "ભલામણ કરેલ યોજનાઓ", hi: "अनुशंसित योजनाएं" },
  allSchemes: { mr: "सर्व सरकारी योजना", gu: "તમામ સરકારી યોજનાઓ", hi: "सभी सरकारी योजनाएं" },
  centralSchemes: { mr: "केंद्रीय योजना", gu: "કેન્દ્રીય યોજનાઓ", hi: "केंद्रीय योजनाएं" },
  stateSchemes: { mr: "राज्य योजना", gu: "રાજ્ય યોજનાઓ", hi: "राज्य योजनाएं" },
  trending: { mr: "लोकप्रिय योजना", gu: "લોકપ્રિય યોજનાઓ", hi: "लोकप्रिय योजनाएं" },
  applyOfficial: { mr: "अधिकृत पोर्टलवर अर्ज करा", gu: "સત્તાવાર પોર્ટલ પર અરજી કરો", hi: "आधिकारिक पोर्टल पर आवेदन करें" },
  officialSourceDisclaimer: { mr: "अधिकृत शासकीय स्रोत", gu: "સત્તાવાર સરકારી સ્ત્રોત", hi: "आधिकारिक सरकारी स्रोत" },
  filterByState: { mr: "राज्यानुसार फिल्टर करा", gu: "રાજ્ય દ્વારા ફિલ્ટર કરો", hi: "राज्य द्वारा फ़िल्टर करें" },
  filterByCategory: { mr: "वर्गानुसार फिल्टर करा", gu: "શ્રેણી દ્વારા ફિલ્ટર કરો", hi: "श्रेणी द्वारा फ़िल्टर करें" },
  filterByOccupation: { mr: "व्यवसायानुसार फिल्टर करा", gu: "વ્યવસાય દ્વારા ફિલ્ટર કરો", hi: "व्यवसाय द्वारा फ़िल्टर करें" },
  documentVault: { mr: "कागदपत्र व्हॉल्ट", gu: "દસ્તાવેજ વોલ્ટ", hi: "दस्तावेज़ वॉल्ट" },
  uploadDocument: { mr: "कागदपत्र अपलोड करा", gu: "દસ્તાવેજ અપલોડ કરો", hi: "दस्तावेज़ अपलोड करें" },
  scanOCR: { mr: "OCR स्कॅनर", gu: "OCR સ્કેનર", hi: "ओसीआर स्कैनर" },
  voiceAssistant: { mr: "व्हॉइस असिस्टंट", gu: "વોઇસ સહાયક", hi: "वॉयस असिस्टेंट" },
  listenVoice: { mr: "शोधण्यासाठी बोला...", gu: "શોધવા માટે બોલો...", hi: "खोजने के लिए बोलें..." },
  logout: { mr: "लॉगआउट", gu: "લૉગઆઉટ", hi: "लॉगआउट" },
  register: { mr: "नोंदणी", gu: "નોંધણી", hi: "पंजीकरण" },
  guestMode: { mr: "अतिथी म्हणून सुरू ठेवा", gu: "અતિથિ તરીકે ચાલુ રાખો", hi: "अतिथि के रूप में जारी रखें" },
  loginOrGuest: { mr: "लॉगिन / अतिथी", gu: "લૉગઇન / અતિથિ", hi: "लॉगिन / अतिथि" },
  yourName: { mr: "तुमचे पूर्ण नाव", gu: "તમારું પૂરું નામ", hi: "आपका पूरा नाम" },
  mobileNumber: { mr: "मोबाइल नंबर", gu: "મોબાઇલ નંબર", hi: "मोबाइल नंबर" },
  yourState: { mr: "तुमचे राज्य", gu: "તમારું રાજ્ય", hi: "आपका राज्य" },
  yourOccupation: { mr: "तुमचा व्यवसाय", gu: "તમારો વ્યવસાય", hi: "आपका व्यवसाय" },
  annualIncomeLabel: { mr: "वार्षिक उत्पन्न (₹)", gu: "વાર્ષિક આવક (₹)", hi: "वार्षिक आय (₹)" },
  yourAge: { mr: "तुमचे वय", gu: "તમારી ઉંમર", hi: "आपकी आयु" },
  scanDocument: { mr: "कागदपत्र स्कॅन करा", gu: "દસ્તાવેજ સ્કેન કરો", hi: "दस्तावेज़ स्कैन करें" },
  extractingOCR: { mr: "AI मजकूर काढत आहे...", gu: "AI ટેક્સ્ટ કાઢી રહ્યું છે...", hi: "एआई टेक्स्ट निकाल रहा है..." },
  saveToVault: { mr: "जतन करा आणि प्रोफाइल भरा", gu: "સાચવો અને પ્રોફાઇલ ભરો", hi: "सहेजें और प्रोफ़ाइल भरें" },
  reviewExtracted: { mr: "काढलेल्या माहितीचे पुनरावलोकन करा", gu: "તારવેલી માહિતી ચકાસો", hi: "निकाली गई जानकारी की समीक्षा करें" },
  beneficiariesStat: { mr: "लाभार्थी पोहोचले", gu: "લાભાર્થીઓ પહોંચ્યા", hi: "पहुंचे लाभार्थी" },
  disbursedStat: { mr: "लाभ वाटप", gu: "લાભ વિતરણ", hi: "वितरित लाभ" },
  activeSchemesStat: { mr: "सक्रिय योजना", gu: "સક્રિય યોજનાઓ", hi: "सक्रिय योजनाएं" },
  statesCoveredStat: { mr: "राज्ये समाविष्ट", gu: "રાજ્યો આવરી લેવાયા", hi: "कवर किए गए राज्य" },
  nationalImpact: { mr: "संख्यांमध्ये राष्ट्रीय प्रभाव", gu: "સંખ્યાઓમાં રાષ્ટ્રીય પ્રભાવ", hi: "संख्या में राष्ट्रीय प्रभाव" },
  incomeFilterAny: { mr: "उत्पन्न: कोणतेही", gu: "આવક: કોઈપણ", hi: "आय: कोई भी" },
  incomeFilterBPL: { mr: "दारिद्र्यरेषेखालील (₹1.2L खाली)", gu: "BPL (₹1.2 લાખથી નીચે)", hi: "बीपीएल (₹1.2L से नीचे)" },
  incomeFilter2L: { mr: "₹2.5 लाखांपेक्षा कमी", gu: "₹2.5 લાખથી ઓછી", hi: "₹2.5 लाख से कम" },
  incomeFilter5L: { mr: "₹5 लाखांपेक्षा कमी", gu: "₹5 લાખથી ઓછી", hi: "₹5 लाख से कम" },

  // Application tracker statuses
  "Submitted to Gram Sabha": { mr: "ग्रामसभेला सादर केले", gu: "ગ્રામસભામાં સબમિટ કર્યું", hi: "ग्राम सभा को प्रस्तुत" },
  "Under Review (AwasSoft Geo-tagging)": { mr: "पुनरावलोकनाधीन (आवाससॉफ्ट जिओ-टॅगिंग)", gu: "સમીક્ષા હેઠળ (આવાસસોફ્ટ જીઓ-ટેગિંગ)", hi: "समीक्षाधीन (आवाससॉफ्ट जियो-टैगिंग)" },
  "Site inspection scheduled by BDO officer": { mr: "बीडीओ अधिकाऱ्याद्वारे स्थळ पाहणी नियोजित", gu: "BDO અધિકારી દ્વારા સ્થળ નિરીક્ષણ નિર્ધારિત", hi: "बीडीओ अधिकारी द्वारा स्थल निरीक्षण निर्धारित" },
  Pending: { mr: "प्रलंबित", gu: "બાકી / પેન્ડિંગ", hi: "लंबित" },
  "Under Review": { mr: "पुनरावलोकनाधीन", gu: "સમીક્ષા હેઠળ", hi: "समीक्षाधीन" },
  Approved: { mr: "मंजूर", gu: "મંજૂર", hi: "स्वीकृत" },
  "Benefit Released": { mr: "लाभ वितरित केला", gu: "લાભ જાહેર કર્યો", hi: "लाभ जारी" },

  aiMatchConfidence: { mr: "AI जुळणी विश्वासार्हता", gu: "AI મેચ વિશ્વસનીયતા", hi: "एआई मैच विश्वास" },
  benefitUpTo: { mr: "पर्यंत लाभ", gu: "સુધીનો લાભ", hi: "तक लाभ" },
  year: { mr: "वर्ष", gu: "વર્ષ", hi: "वर्ष" },
  viewSchemeDetails: { mr: "योजनेचे तपशील पहा", gu: "યોજનાની વિગતો જુઓ", hi: "योजना विवरण देखें" },
  centralGovtScheme: { mr: "केंद्र सरकारी योजना", gu: "કેન્દ્ર સરકારની યોજના", hi: "केंद्र सरकार की योजना" },
  eligibilityEvalStatus: { mr: "पात्रता मूल्यमापन स्थिती", gu: "પાત્રતા મૂલ્યાંકન સ્થિતિ", hi: "पात्रता मूल्यांकन स्थिति" },
  missingInVault: { mr: "व्हॉल्टमध्ये गहाळ", gu: "વોલ્ટમાં ગુમ છે", hi: "वॉल्ट में अनुपलब्ध" },
  tipUploadMissing: { mr: "टीप: अधिकृत अर्ज करण्यापूर्वी गहाळ कागदपत्रे अपलोड करा.", gu: "સૂચના: સત્તાવાર અરજી કરતા પહેલા ખૂટતા દસ્તાવેજો અપલોડ કરો.", hi: "सुझाव: आधिकारिक आवेदन से पहले अनुपलब्ध दस्तावेज अपलोड करें।" },
  schemeOverviewBenefits: { mr: "योजना आढावा आणि फायदे", gu: "યોજના પરિચય અને લાભો", hi: "योजना अवलोकन और लाभ" },
  financialBenefitSummary: { mr: "आर्थिक लाभ सारांश", gu: "આર્થિક લાભનો સારાંશ", hi: "वित्तीय लाभ सारांश" },
  importantDetails: { mr: "महत्त्वाचे तपशील", gu: "મહત્વપૂર્ણ વિગતો", hi: "महत्वपूर्ण विवरण" },
  deadline: { mr: "अंतिम मुदत", gu: "અંતિમ તારીખ / સમયમર્યાદા", hi: "समय सीमा" },
  state: { mr: "राज्य", gu: "રાજ્ય", hi: "राज्य" },
  mandatoryDocs: { mr: "अनिवार्य कागदपत्रे", gu: "ફરજિયાત દસ્તાવેજો", hi: "अनिवार्य दस्तावेज" },
  officialAppSteps: { mr: "अधिकृत अर्ज पायऱ्या", gu: "સત્તાવાર અરજીના પગલાં", hi: "आधिकारिक आवेदन चरण" },
  faqs: { mr: "वारंवार विचारले जाणारे प्रश्न (FAQs)", gu: "વારંવાર પૂછાતા પ્રશ્નો (FAQs)", hi: "अक्सर पूछे जाने वाले प्रश्न" },
  officialSourceInfo: { mr: "अधिकृत स्रोत माहिती", gu: "સત્તાવાર સ્ત્રોત માહિતી", hi: "आधिकारिक स्रोत जानकारी" },
  dataUpdatedOn: { mr: "डेटा अद्यतनित तारीख:", gu: "ડેટા અપડેટ તારીખ:", hi: "डेटा अपडेट तिथि:" },
  source: { mr: "स्रोत", gu: "સ્ત્રોત", hi: "स्रोत" },
  verifiedCitizen: { mr: "सत्यापित नागरिक", gu: "ચકાસાયેલ નાગરિક", hi: "सत्यापित नागरिक" },
  profileCompletion: { mr: "प्रोफाइल पूर्णता", gu: "પ્રોફાઇલ પૂર્ણતા", hi: "प्रोफ़ाइल पूर्णता" },
  editProfile: { mr: "प्रोफाइल संपादित करा", gu: "પ્રોફાઇલ સંપાદિત કરો", hi: "प्रोफ़ाइल संपादित करें" },
  eligibleSchemes: { mr: "पात्र योजना", gu: "પાત્ર યોજનાઓ", hi: "पात्र योजनाएं" },
  appliedSchemes: { mr: "अर्ज केलेल्या योजना", gu: "અરજી કરેલ યોજનાઓ", hi: "आवेदित योजनाएं" },
  underReview: { mr: "पुनरावलोकनाधीन", gu: "સમીક્ષા હેઠળ", hi: "समीक्षाधीन" },
  savedSchemes: { mr: "जतन केलेल्या योजना", gu: "સાચવેલી યોજનાઓ", hi: "सहेजी गई योजनाएं" },
  vaultDocuments: { mr: "व्हॉल्ट कागदपत्रे", gu: "વોલ્ટ દસ્તાવેજો", hi: "वॉल्ट दस्तावेज़" },
  citizenProfileDetails: { mr: "नागरिक प्रोफाइल तपशील", gu: "નાગરિક પ્રોફાઇલ વિગતો", hi: "नागरिक प्रोफ़ाइल विवरण" },
  citizenProfileDesc: { mr: "अचूक AI शिफारसी मिळवण्यासाठी तुमचे सामाजिक-आर्थिक तपशील अद्यतनित ठेवा.", gu: "ચોક્કસ AI ભલામણો મેળવવા માટે તમારી સામાજિક-આર્થિક વિગતો અપડેટ રાખો.", hi: "सटीक एआई सिफारिशों के लिए अपना विवरण अपडेट रखें।" },
  gender: { mr: "लिंग", gu: "લિંગ", hi: "लिंग" },
  male: { mr: "पुरुष", gu: "પુરુષ", hi: "पुरुष" },
  female: { mr: "महिला", gu: "મહિલા", hi: "महिला" },
  transgender: { mr: "तृतीयपंथी", gu: "ટ્રાન્સજેન્ડર", hi: "ट्रांसजेंडर" },
  aiAssistantTitle: { mr: "AI योजना सहाय्यक", gu: "AI યોજના સહાયક", hi: "एआई योजना सहायक" },
  aiAssistantDesc: { mr: "योजना, पात्रता किंवा आवश्यक कागदपत्रांबद्दल कोणत्याही भाषेत विचारा.", gu: "યોજનાઓ, પાત્રતા અથવા જરૂરી દસ્તાવેજો વિશે કોઈપણ ભાષામાં પૂછો.", hi: "किसी भी भाषा में योजनाओं, पात्रता या दस्तावेजों के बारे में पूछें।" },
  voiceOn: { mr: "व्हॉइस चालू", gu: "વોઇસ ચાલુ", hi: "वॉयस चालू" },
  voiceOff: { mr: "व्हॉइस बंद", gu: "વોઇસ બંધ", hi: "वॉयस बंद" },
  online: { mr: "ऑनलाइन", gu: "ઓનલાઇન", hi: "ऑनलाइन" },
  askAboutSchemes: { mr: "योजना, पात्रता किंवा आवश्यक कागदपत्रांबद्दल विचारा...", gu: "યોજનાઓ, પાત્રતા અથવા જરૂરી દસ્તાવેજો વિશે પૂછો...", hi: "योजनाओं, पात्रता या आवश्यक दस्तावेजों के बारे में पूछें..." },
  send: { mr: "पाठवा", gu: "મોકલો", hi: "भेजें" },
  liveTracking: { mr: "थेट अर्ज मागोवा", gu: "લાઈવ અરજી ટ્રેકિંગ", hi: "लाइव ट्रैकिंग" },
  citizenAppTracker: { mr: "नागरिक अर्ज ट्रॅकर", gu: "નાગરિક અરજી ટ્રેકર", hi: "नागरिक आवेदन ट्रैकर" },
  trackerDesc: { mr: "विविध सरकारी मंत्रालयांमध्ये तुमच्या सर्व कल्याणकारी अर्जांची वास्तविक वेळेतील स्थिती तपासा.", gu: "વિવિધ સરકારી મંત્રાલયોમાં તમારી તમામ કલ્યાણકારી અરજીઓની સ્થિતિ રીઅલ-ટાઇમમાં ટ્રૅક કરો.", hi: "सरकारी मंत्रालयों में अपने सभी आवेदनों की स्थिति ट्रैक करें।" },
  applyNewScheme: { mr: "नवीन योजनेसाठी अर्ज करा", gu: "નવી યોજના માટે અરજી કરો", hi: "नई योजना के लिए आवेदन करें" },
  status: { mr: "स्थिती", gu: "સ્થિતિ", hi: "स्थिति" },
  appId: { mr: "अर्ज क्रमांक", gu: "અરજી આઈડી", hi: "आवेदन आईडी" },
  appliedDate: { mr: "अर्ज तारीख", gu: "અરજી કર્યાની તારીખ", hi: "आवेदन तिथि" },
  trackOfficial: { mr: "अधिकृत पोर्टलवर मागोवा घ्या", gu: "સત્તાવાર પોર્ટલ પર ટ્રૅક કરો", hi: "आधिकारिक पोर्टल पर ट्रैक करें" },
  timelineProgress: { mr: "प्रगती टाइमलाइन", gu: "પ્રગતિ ટાઈમલાઈન", hi: "प्रगति समयरेखा" },
  stage: { mr: "टप्पा", gu: "તબક્કો", hi: "चरण" },
  digilockerVault: { mr: "डिजिलॉकर कागदपत्र तिजोरी", gu: "ડિજીલોકર દસ્તાવેજ વોલ્ટ", hi: "डिजिलॉकर दस्तावेज़ वॉल्ट" },
  verifiedCitizenVault: { mr: "सत्यापित नागरिक दस्तऐवज वॉल्ट", gu: "ચકાસાયેલ નાગરિક દસ્તાવેજ વોલ્ટ", hi: "सत्यापित नागरिक दस्तावेज़ वॉल्ट" },
  vaultDesc: { mr: "तुमची कागदपत्रे सुरक्षित ठेवा आणि AI द्वारे त्वरित पात्रता तपासा.", gu: "તમારા દસ્તાવેજો સુરક્ષિત રીતે સંગ્રહિત કરો અને AI દ્વારા ત્વરિત પાત્રતા ચકાસો.", hi: "अपने दस्तावेज़ सुरक्षित रखें और एआई द्वारा तुरंत पात्रता जांचें।" },
  launchOCR: { mr: "OCR स्कॅन सुरू करा", gu: "OCR સ્કેન શરૂ કરો", hi: "ओसीआर स्कैन शुरू करें" },
  notUploaded: { mr: "अपलोड केलेले नाही", gu: "અપલોડ કરેલ નથી", hi: "अपलोड नहीं किया गया" },
  docNumber: { mr: "कागदपत्र क्रमांक", gu: "દસ્તાવેજ નંબર", hi: "दस्तावेज़ संख्या" },
  ocrMetadata: { mr: "OCR द्वारे काढलेली माहिती", gu: "OCR મેટાડેટા / વિગતો", hi: "ओसीआर मेटाडेटा" },
  name: { mr: "नाव", gu: "નામ", hi: "नाम" },
  confidence: { mr: "विश्वासार्हता", gu: "વિશ્વાસ સ્કોર", hi: "विश्वास स्तर" },
  uploadOrScan: { mr: "अपलोड किंवा स्कॅन करा", gu: "અપલોડ અથવા સ્કેન કરો", hi: "अपलोड या स्कैन करें" },
  replaceRescan: { mr: "पुन्हा स्कॅन करा", gu: "ફરીથી સ્કેન કરો", hi: "फिर से स्कैन करें" },
  scanWithOCR: { mr: "OCR सह स्कॅन करा", gu: "OCR સાથે સ્કેન કરો", hi: "ओसीआर से स्कैन करें" },

  // Compare & Explore
  compareSchemes: { mr: "योजनांची तुलना करा", gu: "યોજનાઓની સરખામણી કરો", hi: "योजनाओं की तुलना करें" },
  compareDesc: { mr: "योग्य निर्णय घेण्यासाठी फायदे, पात्रता आणि प्रक्रियेची तुलना करा.", gu: "યોગ્ય નિર્ણય લેવા લાભો, પાત્રતા અને પ્રક્રિયાની સરખામણી કરો.", hi: "लाभ, पात्रता और प्रक्रिया की तुलना करें।" },
  applyNow: { mr: "आता अर्ज करा", gu: "હમણાં અરજી કરો", hi: "अभी आवेदन करें" },
  financialBenefit: { mr: "आर्थिक लाभ", gu: "આર્થિક લાભ", hi: "वित्तीय लाभ" },
  keyReqs: { mr: "मुख्य आवश्यकता", gu: "મુખ્ય જરૂરિયાતો", hi: "मुख्य आवश्यकताएं" },
  appProcess: { mr: "अर्ज प्रक्रिया", gu: "અરજી પ્રક્રિયા", hi: "आवेदन प्रक्रिया" },
  notificationCenter: { mr: "सूचना केंद्र", gu: "સૂચના કેન્દ્ર", hi: "अधिसूचना केंद्र" },
  allAlerts: { mr: "सर्व सूचना", gu: "તમામ ચેતવણીઓ", hi: "सभी अलर्ट" },
  markAllRead: { mr: "सर्व वाचले म्हणून चिन्हांकित करा", gu: "બધા વંચાયેલ તરીકે ચિહ્નિત કરો", hi: "सभी को पढ़ा हुआ चिह्नित करें" },
  uploadMissingDoc: { mr: "गहाळ कागदपत्र अपलोड करा", gu: "ખૂટતો દસ્તાવેજ અપલોડ કરો", hi: "अनुपलब्ध दस्तावेज़ अपलोड करें" },
  viewDetails: { mr: "तपशील पहा", gu: "વિગતો જુઓ", hi: "विवरण देखें" },
  noNewAlerts: { mr: "कोणत्याही नवीन सूचना नाहीत", gu: "કોઈ નવી સૂચનાઓ નથી", hi: "कोई नई सूचनाएं नहीं" },
  cscAssistedMode: { mr: "CSC सहाय्यक ग्रामीण किऑस्क", gu: "CSC સહાયિત ગ્રામીણ કિયોસ્ક", hi: "सीएससी ग्रामीण कियोस्क" },
  exitKiosk: { mr: "कियोस्कमधून बाहेर पडा", gu: "કિયોસ્કમાંથી બહાર નીકળો", hi: "कियोस्क से बाहर निकलें" },
  broadenSearchTerms: { mr: "शोध शब्द विस्तृत करा", gu: "શોધ શબ્દો વિસ્તૃત કરો", hi: "खोज शब्द विस्तृत करें" },
  removeAllFilters: { mr: "सर्व फिल्टर काढा", gu: "તમામ ફિલ્ટર્સ દૂર કરો", hi: "सभी फ़िल्टर हटाएं" },
  clear: { mr: "साफ करा", gu: "સાફ કરો", hi: "साफ़ करें" },
  compareNow: { mr: "आता तुलना करा", gu: "હમણાં સરખામણી કરો", hi: "अब तुलना करें" },
  displaySettings: { mr: "प्रदर्शन सेटिंग्ज", gu: "ડિસ્પ્લે સેટિંગ્સ", hi: "प्रदर्शन सेटिंग्स" },
  theme: { mr: "थीम", gu: "થીમ", hi: "थीम" },
  light: { mr: "लाइट", gu: "લાઇટ", hi: "लाइट" },
  dark: { mr: "डार्क", gu: "ડાર્ક", hi: "डार्क" },
  textSize: { mr: "अक्षर आकार", gu: "ટેક્સ્ટ સાઇઝ", hi: "अक्षर आकार" },
  highContrast: { mr: "उच्च कॉन्ट्रास्ट", gu: "હાઇ કોન્ટ્રાસ્ટ", hi: "उच्च कंट्रास्ट" },
  reducedMotion: { mr: "कमी हालचाल", gu: "ઓછી હિલચાલ", hi: "कम गति" },
  resetSettings: { mr: "रीसेट करा", gu: "રીસેટ કરો", hi: "रीसेट करें" }
};

for (const [key, map] of Object.entries(additionalDict)) {
  if (map.mr) mr[key] = map.mr;
  if (map.gu) gu[key] = map.gu;
}

// Write back updated files
fs.writeFileSync('./public/locales/mr/translation.json', JSON.stringify(mr, null, 2), 'utf8');
fs.writeFileSync('./public/locales/gu/translation.json', JSON.stringify(gu, null, 2), 'utf8');

console.log('Finished updating mr and gu locales!');
