import os
import sys
import json
import time
import urllib.request
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed

sys.stdout.reconfigure(encoding='utf-8')

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOCALES_DIR = os.path.join(ROOT_DIR, 'public', 'locales')
SCRATCH_DIR = os.path.join(ROOT_DIR, 'scratch')
CACHE_FILE = os.path.join(SCRATCH_DIR, 'translation_cache.json')

LANGS = ['hi', 'ta', 'te', 'ml', 'mr', 'gu']

cache = {}
if os.path.exists(CACHE_FILE):
    try:
        with open(CACHE_FILE, 'r', encoding='utf-8') as f:
            cache = json.load(f)
        print(f"Loaded existing cache with {len(cache)} entries.", flush=True)
    except Exception as e:
        print(f"Failed to load cache: {e}", flush=True)

def fetch_single_translation(task):
    target_lang, text_clean = task
    cache_key = f"{target_lang}:::{text_clean}"
    if cache_key in cache:
        return target_lang, text_clean, cache[cache_key]

    for attempt in range(3):
        try:
            url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl={target_lang}&dt=t&q={urllib.parse.quote(text_clean)}"
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=10) as resp:
                res = json.loads(resp.read().decode('utf-8'))
                translated = ''.join(chunk[0] for chunk in res[0] if chunk[0])
                if translated:
                    return target_lang, text_clean, translated
        except Exception:
            time.sleep(0.3 * (attempt + 1))

    return target_lang, text_clean, text_clean

def batch_translate(items_list):
    """
    items_list: list of strings to translate across all LANGS
    """
    tasks = []
    for text in items_list:
        if not text or not isinstance(text, str):
            continue
        clean = text.strip()
        if not clean:
            continue
        for l in LANGS:
            ck = f"{l}:::{clean}"
            if ck not in cache:
                tasks.append((l, clean))

    print(f"Dispatching {len(tasks)} translation requests across 20 threads...", flush=True)
    completed_count = 0
    with ThreadPoolExecutor(max_workers=20) as executor:
        future_map = {executor.submit(fetch_single_translation, task): task for task in tasks}
        for future in as_completed(future_map):
            l, clean, trans = future.result()
            cache[f"{l}:::{clean}"] = trans
            completed_count += 1
            if completed_count % 100 == 0 or completed_count == len(tasks):
                print(f"Translated {completed_count}/{len(tasks)} items...", flush=True)

    # Save cache
    with open(CACHE_FILE, 'w', encoding='utf-8') as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)
    print(f"Updated cache with {len(cache)} total entries.", flush=True)

# 1. Load all steps and metadata
steps_file = os.path.join(SCRATCH_DIR, 'all_scheme_steps.json')
with open(steps_file, 'r', encoding='utf-8') as f:
    all_steps = json.load(f)

meta_file = os.path.join(SCRATCH_DIR, 'scheme_metadata.json')
with open(meta_file, 'r', encoding='utf-8') as f:
    meta = json.load(f)

unique_step_texts = list({item['text'] for item in all_steps})
all_items_to_translate = unique_step_texts + meta['ministries'] + meta['departments']

print(f"Total unique texts to translate: {len(all_items_to_translate)} across 6 Indic languages.", flush=True)
batch_translate(all_items_to_translate)

# 2. Demographics dictionary
demographics_dict = {
  "General": { "en": "General", "hi": "सामान्य", "ta": "பொதுப்பிரிவு", "te": "జనరల్", "ml": "ജനറൽ", "mr": "सर्वसाधारण", "gu": "સામાન્ય" },
  "OBC": { "en": "OBC (Other Backward Class)", "hi": "ओबीसी (अन्य पिछड़ा वर्ग)", "ta": "இதர பிற்படுத்தப்பட்ட வகுப்பினர் (OBC)", "te": "ఓబీసీ (ఇతర వెనుకబడిన తరగతి)", "ml": "ഒബിസി (മറ്റ് പിന്നാക്ക വിഭാഗങ്ങൾ)", "mr": "ओबीसी (इतर मागासवर्गीय)", "gu": "ઓબીસી (અન્ય પછાત વર્ગ)" },
  "SC": { "en": "SC (Scheduled Caste)", "hi": "एससी (अनुसूचित जाति)", "ta": "பட்டியலினத்தவர் (SC)", "te": "ఎస్సీ (షెడ్యూల్డ్ కులం)", "ml": "പട്ടികജാതി (SC)", "mr": "अनुसूचित जाती (SC)", "gu": "અનુસૂચિત જાતિ (SC)" },
  "ST": { "en": "ST (Scheduled Tribe)", "hi": "एसटी (अनुसूचित जनजाति)", "ta": "பழங்குடியினர் (ST)", "te": "ఎస్టీ (షెడ్యూల్డ్ తెగ)", "ml": "പട്ടികവർഗ്ഗം (ST)", "mr": "अनुसूचित जमाती (ST)", "gu": "અનુસૂચિત જનજાતિ (ST)" },
  "EWS": { "en": "EWS (Economically Weaker Section)", "hi": "ईडब्ल्यूएस (आर्थिक रूप से कमजोर वर्ग)", "ta": "பொருளாதாரத்தில் நலிந்த பிரிவினர் (EWS)", "te": "ఈడబ్ల్యూఎస్ (ఆర్థికంగా బలహీన వర్గాలు)", "ml": "ഇഡബ്ല്യുഎസ് (സാമ്പത്തികമായി പിന്നാക്കം)", "mr": "ईडब्ल्यूएस (आर्थिक दुर्बल घटक)", "gu": "ઈડબ્લ્યુએસ (આર્થિક રીતે નબળા વર્ગ)" },
  "Rural": { "en": "Rural", "hi": "ग्रामीण", "ta": "கிராமப்புறம்", "te": "గ్రామీణ", "ml": "ഗ്രാമീണ", "mr": "ग्रामीण", "gu": "ગ્રામીણ" },
  "Urban": { "en": "Urban", "hi": "शहरी", "ta": "நகர்ப்புறம்", "te": "పట్టణ", "ml": "നഗര", "mr": "नागरी", "gu": "શહેરી" },
  "Semi-Urban": { "en": "Semi-Urban", "hi": "अर्ध-शहरी", "ta": "அரை நகர்ப்புறம்", "te": "సెమీ అర్బన్", "ml": "അർദ്ധ നഗര", "mr": "निमशहरी", "gu": "અર્ધ-શહેરી" },
  "Single": { "en": "Single", "hi": "अविवाहित", "ta": "திருமணமாகாதவர்", "te": "ఒంటరి", "ml": "അവിവാഹിതൻ/അവിവാഹിത", "mr": "अविवाहित", "gu": "અપરિણીત" },
  "Married": { "en": "Married", "hi": "विवाहित", "ta": "திருமணமானவர்", "te": "వివాహితుడు", "ml": "വിവാഹിതൻ/വിവാഹിത", "mr": "विवाहित", "gu": "પરિણીત" },
  "Widowed": { "en": "Widowed", "hi": "विधवा/विधुर", "ta": "விதவை / கணவனை இழந்தவர்", "te": "వితంతువు", "ml": "വിധവ/വിധുരൻ", "mr": "विधवा/विधुर", "gu": "વિધવા/વિધુર" },
  "Divorced": { "en": "Divorced", "hi": "तलाकशुदा", "ta": "விவாகரத்து பெற்றவர்", "te": "విడాకులు తీసుకున్నవారు", "ml": "വിവാഹമോചിതൻ/വിവാഹമോചിത", "mr": "घटस्फोटित", "gu": "છૂટાછેડા લીધેલ" },
  "Separated": { "en": "Separated", "hi": "अलग", "ta": "பிரிந்தவர்", "te": "వేరుపడినవారు", "ml": "വേർപിരിഞ്ഞത്", "mr": "विभक्त", "gu": "અલગ થયેલ" },
  "Below 10th": { "en": "Below 10th Standard", "hi": "10वीं से कम", "ta": "10 ஆம் வகுப்புக்கு கீழே", "te": "10వ తరగతి కంటే తక్కువ", "ml": "പത്താം ക്ലാസിന് താഴെ", "mr": "दहावीच्या खाली", "gu": "ધોરણ 10 થી નીચે" },
  "10th Pass": { "en": "10th Standard Pass (SSLC)", "hi": "10वीं पास (एसएसएलसी)", "ta": "10 ஆம் வகுப்பு தேர்ச்சி (SSLC)", "te": "10వ తరగతి ఉత్తీర్ణత (SSLC)", "ml": "എസ്എസ്എൽസി പാസ്സായി", "mr": "दहावी उत्तीर्ण (SSLC)", "gu": "ધોરણ 10 પાસ (SSLC)" },
  "12th Pass": { "en": "12th Standard Pass (HSC)", "hi": "12वीं पास (एचएससी)", "ta": "12 ஆம் வகுப்பு தேர்ச்சி (HSC)", "te": "12వ తరగతి ఉత్తీర్ణత (HSC)", "ml": "പ്ലസ് ടു പാസ്സായി", "mr": "बारावी उत्तीर्ण (HSC)", "gu": "ધોરણ 12 પાસ (HSC)" },
  "Diploma": { "en": "Diploma / Polytechnic", "hi": "डिप्लोमा / पॉलिटेक्निक", "ta": "பட்டயப்படிப்பு (டிப்ளமோ)", "te": "డిప్లొమా / పాలిటెక్నిక్", "ml": "ഡിപ്ലോമ / പോളിടെക്നിക്", "mr": "डिप्लोमा / पॉलिटेक्निक", "gu": "ડિપ્લોમા / પોલિટેકનિક" },
  "Graduate": { "en": "Graduate (Bachelor's Degree)", "hi": "स्नातक (बैचलर डिग्री)", "ta": "இளங்கலை பட்டதாரி", "te": "గ్రాడ్యుయేట్ (డిగ్రీ)", "ml": "ബിരുദം", "mr": "पदवीधर (पदवी)", "gu": "સ્નાતક (ડિગ્રી)" },
  "Post Graduate": { "en": "Post Graduate (Master's Degree)", "hi": "स्नातकोत्तर (मास्टर डिग्री)", "ta": "முதுகலை பட்டதாரி", "te": "పోస్ట్ గ్రాడ్యుయేట్ (మాస్టర్స్)", "ml": "ബിരുദാനന്തര ബിരുദം", "mr": "पदव्युत्तर (मास्टर पदवी)", "gu": "અનુસ્નાતક (માસ્ટર ડિગ્રી)" },
  "Doctorate": { "en": "Doctorate / PhD", "hi": "डॉक्टरेट / पीएचडी", "ta": "முனைவர் பட்டம் (PhD)", "te": "డాక్టరేట్ / పీహెచ్‌డీ", "ml": "ഡോക്ടറേറ്റ് / പിഎച്ച്ഡി", "mr": "डॉक्टरेट / पीएचडी", "gu": "ડોક્ટરેટ / પીએચડી" },
  "acresUnit": { "en": "Acres", "hi": "एकड़", "ta": "ஏக்கர்", "te": "ఎకరాలు", "ml": "ഏക്കർ", "mr": "एकर", "gu": "એકર" },
  "selectCategory": { "en": "Select Category", "hi": "श्रेणी चुनें", "ta": "வகையைத் தேர்ந்தெடுக்கவும்", "te": "వర్గాన్ని ఎంచుకోండి", "ml": "വിഭാഗം തിരഞ്ഞെടുക്കുക", "mr": "श्रेणी निवडा", "gu": "શ્રેણી પસંદ કરો" },
  "selectEducationLevel": { "en": "Select Education Level", "hi": "शिक्षा स्तर चुनें", "ta": "கல்வித் தகுதியைத் தேர்ந்தெடுக்கவும்", "te": "విద్యా స్థాయిని ఎంచుకోండి", "ml": "വിദ്യാഭ്യാസ യോഗ്യത തിരഞ്ഞെടുക്കുക", "mr": "शिक्षण स्तर निवडा", "gu": "શિક્ષણ સ્તર પસંદ કરો" },
  "enableIfCertifiedDisability": { "en": "Enable if certified with benchmark disability", "hi": "मान्यता प्राप्त दिव्यांगता प्रमाण पत्र होने पर सक्षम करें", "ta": "சான்றளிக்கப்பட்ட மாற்றுத்திறன் இருப்பின் இயக்கவும்", "te": "ధృవీకరించబడిన వైకల్యం ఉంటే ప్రారంభించండి", "ml": "സർട്ടിഫൈഡ് ഭിന്നശേഷിയുണ്ടെങ്കിൽ പ്രവർത്തനക്ഷമമാക്കുക", "mr": "प्रमाणित दिव्यांगत्व असल्यास सक्षम करा", "gu": "પ્રમાણિત દિવ્યાંગતા હોય તો સક્ષમ કરો" },
  "disabilityPercentageLabel": { "en": "Disability Percentage (%)", "hi": "दिव्यांगता प्रतिशत (%)", "ta": "மாற்றுத்திறன் சதவீதம் (%)", "te": "వైకల్య శాతం (%)", "ml": "ഭിന്നശേഷി ശതമാനം (%)", "mr": "दिव्यांगत्व टक्केवारी (%)", "gu": "દિવ્યાંગતા ટકાવારી (%)" },
  "eligibleForEShram": { "en": "Eligible for e-Shram / BOCW welfare boards", "hi": "ई-श्रम / बीओसीडब्ल्यू कल्याण बोर्ड के लिए पात्र", "ta": "இ-ஷ்ரம் / கட்டிடத் தொழிலாளர் நல வாரியத்திற்கு தகுதியுடையது", "te": "ఇ-శ్రమ్ / బీవోసీడబ్ల్యూ సంక్షేమ బోర్డుకు అర్హులు", "ml": "ഇ-ശ്രമം / ബിഒസിഡബ്ല്യു വെൽഫെയർ ബോർഡിന് അർഹതയുണ്ട്", "mr": "ई-श्रम / बीओसीडब्ल्यू कल्याण मंडळासाठी पात्र", "gu": "ઇ-શ્રમ / બીઓસીડબલ્યુ કલ્યાણ બોર્ડ માટે પાત્ર" },

  # Districts
  "Ariyalur": { "en": "Ariyalur", "hi": "अरियालूर", "ta": "அரியலூர்", "te": "అరియలూర్", "ml": "അരിയല്ലൂർ", "mr": "अरियालूर", "gu": "અરિયાલૂર" },
  "Chengalpattu": { "en": "Chengalpattu", "hi": "चेंगलपट्टू", "ta": "செங்கல்பட்டு", "te": "చెంగల్పట్టు", "ml": "ചെങ്കൽപട്ട്", "mr": "चेंगलपट्टू", "gu": "ચેંગલપટ્ટુ" },
  "Chennai": { "en": "Chennai", "hi": "चेन्नई", "ta": "சென்னை", "te": "చెన్నై", "ml": "ചെന്നൈ", "mr": "चेन्नई", "gu": "ચેન્નાઈ" },
  "Coimbatore": { "en": "Coimbatore", "hi": "कोयंबटूर", "ta": "கோயம்புத்தூர்", "te": "కోయంబత్తూరు", "ml": "കോയമ്പത്തൂർ", "mr": "कोइम्बतूर", "gu": "કોયમ્બતૂર" },
  "Cuddalore": { "en": "Cuddalore", "hi": "कुड्डालोर", "ta": "கடலூர்", "te": "కడలూరు", "ml": "കടലൂർ", "mr": "कड्डालोर", "gu": "કુડ્ડાલોર" },
  "Dharmapuri": { "en": "Dharmapuri", "hi": "धर्मपुरी", "ta": "தருமபுரி", "te": "ధర్మపురి", "ml": "ധർമ്മപുരി", "mr": "धर्मपुरी", "gu": "ધર્મપુરી" },
  "Dindigul": { "en": "Dindigul", "hi": "डिंडीगुल", "ta": "திண்டுக்கல்", "te": "దిండిగల్", "ml": "ദിണ്ടിഗൽ", "mr": "दिंडीगुल", "gu": "ડિન્ડીગુલ" },
  "Erode": { "en": "Erode", "hi": "इरोड", "ta": "ஈரோடு", "te": "ఈరోడ్", "ml": "ഈറോഡ്", "mr": "इरोड", "gu": "ઇરોડ" },
  "Kallakurichi": { "en": "Kallakurichi", "hi": "कल्लाकुरिची", "ta": "கள்ளக்குறிச்சி", "te": "కల్లకురిచి", "ml": "കള്ളക്കുറിച്ചി", "mr": "कल्लाकुरीची", "gu": "કલ્લાકુરીચી" },
  "Kanchipuram": { "en": "Kanchipuram", "hi": "कांचीपुरम", "ta": "காஞ்சிபுரம்", "te": "కాంచీపురం", "ml": "കാഞ്ചീപുരം", "mr": "कांचीपुरम", "gu": "કાંચીપુરમ" },
  "Kanyakumari": { "en": "Kanyakumari", "hi": "कन्याकुमारी", "ta": "கன்னியாகுமரி", "te": "కన్యాకుమారి", "ml": "കന്യാകുമാരി", "mr": "कन्याकुमारी", "gu": "કન્યાકુમારી" },
  "Karur": { "en": "Karur", "hi": "करूर", "ta": "கரூர்", "te": "కరూర్", "ml": "കരൂർ", "mr": "करूर", "gu": "કરૂર" },
  "Krishnagiri": { "en": "Krishnagiri", "hi": "कृष्णगिरि", "ta": "கிருஷ்ணகிரி", "te": "కృష్ణగిరి", "ml": "കൃഷ്ണഗിരി", "mr": "कृष्णगिरी", "gu": "કૃષ્ણગિરી" },
  "Madurai": { "en": "Madurai", "hi": "मदुरै", "ta": "மதுரை", "te": "మధురై", "ml": "മധുര", "mr": "मदुराई", "gu": "મદુરાઈ" },
  "Mayiladuthurai": { "en": "Mayiladuthurai", "hi": "मयिलादुथुरई", "ta": "மயிலாடுதுறை", "te": "మయిలాడుతురై", "ml": "മയിലാടുതുറൈ", "mr": "मयिलादुथुरई", "gu": "મયિલાદુથુરઈ" },
  "Nagapattinam": { "en": "Nagapattinam", "hi": "नागापट्टिनम", "ta": "நாகப்பட்டினம்", "te": "నాగపట్నం", "ml": "നാഗപട്ടണം", "mr": "नागपट्टिनम", "gu": "નાગાપટ્ટિનમ" },
  "Namakkal": { "en": "Namakkal", "hi": "नमक्कल", "ta": "நாமக்கல்", "te": "నమక్కల్", "ml": "നാമക്കൽ", "mr": "नमक्कल", "gu": "નમક્કલ" },
  "Nilgiris": { "en": "Nilgiris", "hi": "नीलगिरि", "ta": "நீலகிரி", "te": "నీలగిరి", "ml": "നീലഗിരി", "mr": "निलगिरी", "gu": "નીલગિરિ" },
  "Perambalur": { "en": "Perambalur", "hi": "पेरम्बलूर", "ta": "பெரம்பலூர்", "te": "పెరంబలూర్", "ml": "പെരമ്പലൂർ", "mr": "पेरांबलूर", "gu": "પેરમ્બલૂર" },
  "Pudukkottai": { "en": "Pudukkottai", "hi": "पुदुक्कोट्टई", "ta": "புதுக்கோட்டை", "te": "పుదుక్కోట్టై", "ml": "പുതുക്കോട്ട", "mr": "पुदुक्कोट्टई", "gu": "પુદુક્કોટ્ટાઈ" },
  "Ramanathapuram": { "en": "Ramanathapuram", "hi": "रामनाथपुरम", "ta": "ராமநாதபுரம்", "te": "రామనాథపురం", "ml": "രാമനാഥപുരം", "mr": "रामनाथपुरम", "gu": "રામનાથપુરમ" },
  "Ranipet": { "en": "Ranipet", "hi": "रानीपेट", "ta": "ராணிப்பேட்டை", "te": "రాణిపేట", "ml": "റാണിപ്പേട്ട", "mr": "राणीपेठ", "gu": "રાનીપેટ" },
  "Salem": { "en": "Salem", "hi": "सलेम", "ta": "சேலம்", "te": "సేలం", "ml": "സേலம்", "mr": "सेलम", "gu": "સેલેમ" },
  "Sivaganga": { "en": "Sivaganga", "hi": "शिवगंगा", "ta": "சிவகங்கை", "te": "శివగంగ", "ml": "ശിവഗംഗ", "mr": "शिवगंगा", "gu": "શિવગંગા" },
  "Tenkasi": { "en": "Tenkasi", "hi": "तेनकासी", "ta": "தென்காசி", "te": "తెన్కాశి", "ml": "തെങ്കാശി", "mr": "तेनकाशी", "gu": "તેનકાશી" },
  "Thanjavur": { "en": "Thanjavur", "hi": "तंजावुर", "ta": "தஞ்சாவூர்", "te": "తంజావూరు", "ml": "തഞ്ചാവൂർ", "mr": "तंजावर", "gu": "તંજાવુર" },
  "Theni": { "en": "Theni", "hi": "थेनी", "ta": "தேனி", "te": "తేని", "ml": "തേനി", "mr": "थेनी", "gu": "થેની" },
  "Thoothukudi": { "en": "Thoothukudi", "hi": "थूथुकुडी", "ta": "தூத்துக்குடி", "te": "తూత్తుకుడి", "ml": "തൂത്തുക്കുടി", "mr": "थुथुकुडी", "gu": "થૂથુકુડી" },
  "Tiruchirappalli": { "en": "Tiruchirappalli", "hi": "तिरुचिरापल्ली", "ta": "திருச்சிராப்பள்ளி", "te": "తిరుచిరాపల్లి", "ml": "തിരുച്ചിറപ്പള്ളി", "mr": "तिरुचिरापल्ली", "gu": "તિરુચિરાપલ્લી" },
  "Tirunelveli": { "en": "Tirunelveli", "hi": "तिरुनेलवेली", "ta": "திருநெல்வேலி", "te": "తిరునెల్వేలి", "ml": "തിരുനെൽവേലി", "mr": "तिरुनेलवेली", "gu": "તિરુનેલવેલી" },
  "Tirupathur": { "en": "Tirupathur", "hi": "तिरुपाथुर", "ta": "திருப்பத்தூர்", "te": "తిరుపత్తూరు", "ml": "തിരുപ്പത്തൂർ", "mr": "तिरुपाथूर", "gu": "તિરુપથૂર" },
  "Tiruppur": { "en": "Tiruppur", "hi": "तिरुपुर", "ta": "திருப்பூர்", "te": "తిరుప్పూర్", "ml": "തിരുപ്പൂർ", "mr": "तिरुप्पूर", "gu": "તિરુપ્પૂર" },
  "Tiruvallur": { "en": "Tiruvallur", "hi": "तिरुवल्लूर", "ta": "திருவள்ளூர்", "te": "తిరువళ్లూరు", "ml": "തിരുവള്ളൂർ", "mr": "तिरुवल्लूर", "gu": "તિરુવલ્લૂર" },
  "Tiruvannamalai": { "en": "Tiruvannamalai", "hi": "तिरुवन्नामलाई", "ta": "திருவண்ணாமலை", "te": "తిరువణ్ణామలై", "ml": "തിരുവണ്ണാമല", "mr": "तिरुवन्नमलाई", "gu": "તિરુવન્નામલાઈ" },
  "Tiruvarur": { "en": "Tiruvarur", "hi": "तिरुवारूर", "ta": "திருவாரூர்", "te": "తిరువారూరు", "ml": "തിരുവാരൂർ", "mr": "तिरुवारूर", "gu": "તિરુવારૂર" },
  "Vellore": { "en": "Vellore", "hi": "वेल्लोर", "ta": "வேலூர்", "te": "వెల్లూరు", "ml": "വെല്ലൂർ", "mr": "वेल्लोर", "gu": "વેલ્લોર" },
  "Viluppuram": { "en": "Viluppuram", "hi": "विलुप्पुरम", "ta": "விழுப்புரம்", "te": "విల్లుపురం", "ml": "വിഴുപ്പുറം", "mr": "विलुप्पुरम", "gu": "વિલુપ્પુરમ" },
  "Virudhunagar": { "en": "Virudhunagar", "hi": "विरुधुनगर", "ta": "விருதுநகர்", "te": "విరుదునగర్", "ml": "വിരുദുനഗർ", "mr": "विरुधुनगर", "gu": "વિરુધુનગર" }
}

# 3. Load translation files
locale_data = {}
for lang in ['en'] + LANGS:
    fpath = os.path.join(LOCALES_DIR, lang, 'translation.json')
    with open(fpath, 'r', encoding='utf-8') as f:
        locale_data[lang] = json.load(f)

# Apply demographics
for key, trans_map in demographics_dict.items():
    locale_data['en'][key] = trans_map['en']
    for lang in LANGS:
        locale_data[lang][key] = trans_map.get(lang, trans_map['en'])

# Apply ministries and departments
for m in meta['ministries']:
    locale_data['en'][m] = m
    for lang in LANGS:
        ck = f"{lang}:::{m}"
        if ck in cache:
            locale_data[lang][m] = cache[ck]

for d in meta['departments']:
    locale_data['en'][d] = d
    for lang in LANGS:
        ck = f"{lang}:::{d}"
        if ck in cache:
            locale_data[lang][d] = cache[ck]

# Apply steps
for item in all_steps:
    step_key = item['stepKey']
    step_text = item['text']
    locale_data['en'][step_key] = step_text
    locale_data['en'][step_text] = step_text
    for lang in LANGS:
        ck = f"{lang}:::{step_text}"
        trans_val = cache.get(ck, step_text)
        locale_data[lang][step_key] = trans_val
        locale_data[lang][step_text] = trans_val

# 4. Save locale files
print("Saving all 7 translation.json files...", flush=True)
for lang in ['en'] + LANGS:
    out_path = os.path.join(LOCALES_DIR, lang, 'translation.json')
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(locale_data[lang], f, ensure_ascii=False, indent=2)
    print(f"Saved {lang} translation.json ({len(locale_data[lang])} keys).", flush=True)

print("Done!", flush=True)
