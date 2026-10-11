import json
import os

mr_translations = {
    "Education": "शिक्षण",
    "Agriculture": "कृषी",
    "Healthcare": "आरोग्यसेवा",
    "Housing": "गृहनिर्माण",
    "Employment": "रोजगार",
    "Women & Child": "महिला आणि बाल विकास",
    "Entrepreneurship": "उद्योजकता",
    "Financial Help": "आर्थिक मदत",
    "yourRecSchemes": "तुमच्यासाठी शिफारस केलेल्या योजना",
    "basedOnInfo": "तुम्ही दिलेल्या माहितीच्या आधारे, आम्हाला",
    "matchingSchemes": "जुळणाऱ्या योजना आढळल्या.",
    "filters": "फिल्टर्स",
    "govtLevel": "सरकारी स्तर",
    "Central": "केंद्र",
    "State": "राज्य",
    "location": "स्थान",
    "category": "श्रेणी",
    "eligibility": "पात्रता",
    "eligible": "पात्र",
    "potentiallyEligible": "संभाव्य पात्र",
    "details": "तपशील",
    "compare": "तुलना करा",
    "apply": "अर्ज करा",
    "Schemes Available": "उपलब्ध योजना",
    "Central & State Schemes": "केंद्र आणि राज्य योजना",
    "Personalized Eligibility": "वैयक्तिकृत पात्रता",
    "Official Scheme Sources": "अधिकृत योजनेचे स्रोत",
    "Verified": "सत्यापित",
    "AI Match": "AI मॅच",
    "100% Authentic": "१००% अस्सल",
    "coreFeatures": "मुख्य प्लॅटफॉर्म वैशिष्ट्ये",
    "nationalRedirects": "राष्ट्रीय पोर्टल्स पुनर्निर्देशने",
    "nationalHelplines": "राष्ट्रीय हेल्पलाइन्स",
    "transparencyTitle": "पारदर्शकता अस्वीकरण",
    "ruleEngine": "नियम-आधारित पात्रता इंजिन",
    "multiAiAssistance": "बहुभाषिक AI सहाय्यक",
    "docVaultOcr": "कागदपत्र व्हॉल्ट आणि OCR स्कॅनर",
    "appTracker": "अर्जाची स्थिती ट्रॅकर",
    "cscKioskMode": "CSC ग्राम पंचायत कियोस्क मोड",
    "pm-kisan_name": "प्रधानमंत्री किसान सन्मान निधी (PM-KISAN)",
    "pm-kisan_desc": "भारतातील सर्व जमीनधारक शेतकरी कुटुंबांना तीन समान हप्त्यांमध्ये दरवर्षी ₹६,००० चे उत्पन्न समर्थन.",
    "pmay-g_name": "प्रधानमंत्री आवास योजना - ग्रामीण (PMAY-G)",
    "pmay-g_desc": "बेघर आणि कच्च्या घरात राहणाऱ्यांसाठी मूलभूत सुविधांसह पक्के घर बांधण्यासाठी आर्थिक मदत.",
    "pmjay-ayushman_name": "आयुष्मान भारत - PM जन आरोग्य योजना (PM-JAY)",
    "pmjay-ayushman_desc": "दुय्यम आणि तृतीयक उपचारांसाठी प्रति कुटुंब प्रति वर्ष ₹५ लाख प्रदान करणारी जगातील सर्वात मोठी आरोग्य विमा योजना."
}

gu_translations = {
    "Education": "શિક્ષણ",
    "Agriculture": "કૃષિ",
    "Healthcare": "આરોગ્ય સંભાળ",
    "Housing": "આવાસ",
    "Employment": "રોજગાર",
    "Women & Child": "મહિલા અને બાળ વિકાસ",
    "Entrepreneurship": "ઉદ્યોગસાહસિકતા",
    "Financial Help": "આર્થિક મદદ",
    "yourRecSchemes": "તમારા માટે ભલામણ કરેલ યોજનાઓ",
    "basedOnInfo": "તમે આપેલી માહિતીના આધારે, અમને",
    "matchingSchemes": "મેળ ખાતી યોજનાઓ મળી.",
    "filters": "ફિલ્ટર્સ",
    "govtLevel": "સરકારી સ્તર",
    "Central": "કેન્દ્ર",
    "State": "રાજ્ય",
    "location": "સ્થાન",
    "category": "શ્રેણી",
    "eligibility": "પાત્રતા",
    "eligible": "લાયક",
    "potentiallyEligible": "સંભવિત લાયક",
    "details": "વિગતો",
    "compare": "સરખામણી કરો",
    "apply": "અરજી કરો",
    "Schemes Available": "ઉપલબ્ધ યોજનાઓ",
    "Central & State Schemes": "કેન્દ્ર અને રાજ્ય યોજનાઓ",
    "Personalized Eligibility": "વ્યક્તિગત પાત્રતા",
    "Official Scheme Sources": "સત્તાવાર યોજનાના સ્ત્રોતો",
    "Verified": "ચકાસાયેલ",
    "AI Match": "AI મેચ",
    "100% Authentic": "૧૦૦% અધિકૃત",
    "coreFeatures": "મુખ્ય પ્લેટફોર્મ સુવિધાઓ",
    "nationalRedirects": "રાષ્ટ્રીય પોર્ટલ્સ રીડાયરેક્ટ્સ",
    "nationalHelplines": "રાષ્ટ્રીય હેલ્પલાઇન્સ",
    "transparencyTitle": "પારદર્શિતા ડિસ્ક્લેમર",
    "ruleEngine": "નિયમ-આધારિત પાત્રતા એન્જિન",
    "multiAiAssistance": "બહુભાષી AI સહાયક",
    "docVaultOcr": "દસ્તાવેજ વૉલ્ટ અને OCR સ્કેનર",
    "appTracker": "એપ્લિકેશન સ્ટેટસ ટ્રેકર",
    "cscKioskMode": "CSC ગ્રામ પંચાયત કિયોસ્ક મોડ",
    "pm-kisan_name": "પ્રધાનમંત્રી કિસાન સન્માન નિધિ (PM-KISAN)",
    "pm-kisan_desc": "સમગ્ર ભારતમાં તમામ જમીનધારક ખેડૂત પરિવારોને ત્રણ સમાન હપ્તામાં દર વર્ષે ₹૬,૦૦૦ ની આવક સહાય.",
    "pmay-g_name": "પ્રધાનમંત્રી આવાસ યોજના - ગ્રામીણ (PMAY-G)",
    "pmay-g_desc": "બેઘર અને કાચા ઘરોમાં રહેતા લોકો માટે મૂળભૂત સુવિધાઓ સાથે પાકા મકાનો બનાવવા માટે આર્થિક સહાય.",
    "pmjay-ayushman_name": "આયુષ્માન ભારત - PM જન આરોગ્ય યોજના (PM-JAY)",
    "pmjay-ayushman_desc": "ગૌણ અને તૃતીય સંભાળ હોસ્પિટલમાં દાખલ થવા માટે પ્રતિ પરિવાર દર વર્ષે ₹૫ લાખ પ્રદાન કરતી વિશ્વની સૌથી મોટી આરોગ્ય વીમા યોજના."
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
    print(f"Updated {lang_code} with {len(translations_dict)} more translations.")

update_locale('mr', mr_translations)
update_locale('gu', gu_translations)
