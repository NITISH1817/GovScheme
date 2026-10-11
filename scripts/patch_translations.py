import json
import os

mr_translations = {
    "appName": "GovScheme AI",
    "tagline": "तुमच्यासाठी पात्र असलेल्या सरकारी योजना शोधा",
    "heroSubtitle": "कृत्रिम बुद्धिमत्ता आणि नियम-आधारित इंजिन वापरून काही मिनिटांत कल्याणकारी योजना शोधण्यात भारतीय नागरिकांना मदत करणे.",
    "getStarted": "सुरुवात करा",
    "talkToAI": "AI शी बोला",
    "navHome": "मुख्यपृष्ठ",
    "navSchemes": "योजना",
    "navAssistant": "AI सहाय्यक",
    "navVault": "व्हॉल्ट",
    "navTracker": "अर्जाचा मागोवा",
    "navProfile": "माझी प्रोफाईल",
    "navAdmin": "अॅडमिन पोर्टल",
    "navKiosk": "CSC कियोस्क मोड",
    "aiPoweredTitle": "AI आधारित इंजिन",
    "aiPoweredDesc": "पारदर्शक शिफारसींसाठी कायदेशीर पात्रता नियम आणि ML रँकिंग एकत्र करते.",
    "multilingualTitle": "10 भारतीय भाषा",
    "multilingualDesc": "मराठी, हिंदी, तमिळ, तेलुगु, कन्नड आणि इतर भाषांमध्ये पूर्ण व्हॉइस आणि मजकूर समर्थन.",
    "govtVerifiedTitle": "100% सरकार द्वारे सत्यापित",
    "govtVerifiedDesc": "थेट अधिकृत पोर्टलवर पुनर्निर्देशन आणि वास्तविक वेळेतील डेटा.",
    "howItWorks": "हे कसे कार्य करते",
    "step1Title": "1. तपशील प्रविष्ट करा",
    "step1Desc": "तुमची प्रोफाईल मॅन्युअली किंवा आधार/पॅन OCR स्कॅन करून भरा.",
    "step2Title": "2. AI विश्लेषण",
    "step2Desc": "आमचे इंजिन पात्रता निकष आणि कागदपत्रे तपासेल.",
    "step3Title": "3. पात्र योजना",
    "step3Desc": "स्पष्ट स्पष्टीकरणांसह तुमच्यासाठी योग्य असलेल्या योजना शोधा.",
    "step4Title": "4. अधिकृत अर्ज",
    "step4Desc": "अर्ज करण्यासाठी अधिकृत सरकारी पोर्टलवर थेट जा.",
    "goodMorningCitizen": "सुप्रभात, नागरिक",
    "basedOnProfileIn": "तुमच्या प्रोफाईल आणि",
    "andYourInterests": "तुमच्या स्वारस्यावर आधारित:",
    "schemesMayBeRelevant": "योजना तुमच्यासाठी उपयुक्त असू शकतात",
    "completeYourProfile": "तुमची प्रोफाइल पूर्ण करा",
    "unlockMoreAccurateAI": "अधिक अचूक AI शिफारसी मिळवण्यासाठी तुमचे तपशील अद्यतनित करा.",
    "continueApplications": "अर्ज सुरू ठेवा",
    "youHavePendingApp": "तुमचा 1 प्रलंबित अर्ज आहे ज्यासाठी कागदपत्रांची पडताळणी आवश्यक आहे.",
    "aiDocAssistant": "AI कागदपत्र सहाय्यक (ऑटो-डिटेक्ट)",
    "needHelpIdentifyingDoc": "सरकारी कागदपत्र ओळखण्यात किंवा पडताळण्यात मदत हवी आहे? AI ला विचारा.",
    "recommendedForYou": "तुमच्यासाठी शिफारस केलेले",
    "upcomingDeadlines": "आगामी अंतिम मुदत"
}

gu_translations = {
    "appName": "GovScheme AI",
    "tagline": "તમે લાયક છો તેવી સરકારી યોજનાઓ શોધો",
    "heroSubtitle": "આર્ટિફિશિયલ ઇન્ટેલિજન્સ અને નિયમ-આધારિત એન્જિનનો ઉપયોગ કરીને ગણતરીની મિનિટોમાં કલ્યાણકારી યોજનાઓ શોધવામાં ભારતીય નાગરિકોને મદદ કરવી.",
    "getStarted": "શરૂ કરો",
    "talkToAI": "AI સાથે વાત કરો",
    "navHome": "હોમ",
    "navSchemes": "યોજનાઓ",
    "navAssistant": "AI સહાયક",
    "navVault": "વૉલ્ટ",
    "navTracker": "એપ્લિકેશન ટ્રેકર",
    "navProfile": "મારી પ્રોફાઇલ",
    "navAdmin": "એડમિન પોર્ટલ",
    "navKiosk": "CSC કિયોસ્ક મોડ",
    "aiPoweredTitle": "AI આધારિત એન્જિન",
    "aiPoweredDesc": "પારદર્શક ભલામણો માટે કાનૂની પાત્રતા નિયમો અને ML રેન્કિંગને જોડે છે.",
    "multilingualTitle": "10 ભારતીય ભાષાઓ",
    "multilingualDesc": "ગુજરાતી, હિન્દી, તમિલ, તેલુગુ અને અન્ય ભાષાઓમાં સંપૂર્ણ વૉઇસ અને ટેક્સ્ટ સપોર્ટ.",
    "govtVerifiedTitle": "100% સરકાર દ્વારા ચકાસાયેલ",
    "govtVerifiedDesc": "સીધા સત્તાવાર પોર્ટલ પર રીડાયરેક્ટ અને રિયલ-ટાઇમ ડેટા.",
    "howItWorks": "તે કેવી રીતે કાર્ય કરે છે",
    "step1Title": "1. વિગતો દાખલ કરો",
    "step1Desc": "તમારી પ્રોફાઇલ મેન્યુઅલી અથવા આધાર/પાન OCR સ્કેન કરીને ભરો.",
    "step2Title": "2. AI વિશ્લેષણ",
    "step2Desc": "અમારું એન્જિન પાત્રતા માપદંડ અને દસ્તાવેજો ચકાસશે.",
    "step3Title": "3. પાત્ર યોજનાઓ",
    "step3Desc": "સ્પષ્ટ સમજૂતીઓ સાથે તમારા માટે યોગ્ય યોજનાઓ શોધો.",
    "step4Title": "4. સત્તાવાર એપ્લિકેશન",
    "step4Desc": "અરજી કરવા માટે સીધા સત્તાવાર સરકારી પોર્ટલ પર જાઓ.",
    "goodMorningCitizen": "સુપ્રભાત, નાગરિક",
    "basedOnProfileIn": "તમારી પ્રોફાઇલ અને",
    "andYourInterests": "તમારા રસોના આધારે:",
    "schemesMayBeRelevant": "યોજનાઓ તમારા માટે સુસંગત હોઈ શકે છે",
    "completeYourProfile": "તમારી પ્રોફાઇલ પૂર્ણ કરો",
    "unlockMoreAccurateAI": "વધુ સચોટ AI ભલામણો મેળવવા માટે તમારી વિગતો અપડેટ કરો.",
    "continueApplications": "અરજીઓ ચાલુ રાખો",
    "youHavePendingApp": "તમારી પાસે 1 પડતર અરજી છે જેના માટે દસ્તાવેજ ચકાસણીની જરૂર છે.",
    "aiDocAssistant": "AI દસ્તાવેજ સહાયક (ઓટો-ડિટેક્ટ)",
    "needHelpIdentifyingDoc": "સરકારી દસ્તાવેજ ઓળખવા અથવા ચકાસવામાં મદદ જોઈએ છે? AI ને પૂછો.",
    "recommendedForYou": "તમારા માટે ભલામણ કરેલ",
    "upcomingDeadlines": "આગામી સમયમર્યાદા"
}

def update_locale(lang_code, translations_dict):
    path = f'public/locales/{lang_code}/translation.json'
    if not os.path.exists(path):
        print(f"File not found: {path}")
        return
        
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    for k, v in translations_dict.items():
        data[k] = v
        
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Updated {lang_code} with {len(translations_dict)} translations.")

update_locale('mr', mr_translations)
update_locale('gu', gu_translations)
