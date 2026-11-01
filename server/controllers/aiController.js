import ChatHistory from '../models/ChatHistory.js';
import Scheme from '../models/Scheme.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { schemesData } from '../../src/data/schemes.ts';
import { performSemanticSearch } from '../../src/engine/semanticSearch.ts';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import dotenv from 'dotenv';

// Robust multi-path .env resolution
[
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '.env'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'GovScheme/.env'),
  path.resolve(process.cwd(), 'GovScheme/server/.env')
].forEach(envPath => {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
});

export function getGeminiApiKey() {
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim()) {
    return process.env.GEMINI_API_KEY.trim();
  }
  const candidateEnvPaths = [
    path.resolve(__dirname, '../../.env'),
    path.resolve(__dirname, '../.env'),
    path.resolve(__dirname, '.env'),
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), 'GovScheme/.env'),
    path.resolve(process.cwd(), 'GovScheme/server/.env'),
    path.resolve(process.cwd(), '../.env')
  ];
  for (const envPath of candidateEnvPaths) {
    try {
      if (fs.existsSync(envPath)) {
        const txt = fs.readFileSync(envPath, 'utf8');
        const match = txt.match(/^GEMINI_API_KEY\s*=\s*(.+)$/m);
        if (match && match[1]) {
          const key = match[1].trim().replace(/^['"]|['"]$/g, '');
          if (key) {
            process.env.GEMINI_API_KEY = key;
            return key;
          }
        }
      }
    } catch {}
  }
  return '';
}

const localeCache = new Map();

export function getLocaleDict(lang) {
  const norm = (lang || 'en').toLowerCase().split('-')[0];
  if (norm === 'en') return {};
  if (localeCache.has(norm)) return localeCache.get(norm);
  try {
    const candidates = [
      path.resolve(__dirname, '../../public/locales', norm, 'translation.json'),
      path.resolve(process.cwd(), 'public/locales', norm, 'translation.json'),
      path.resolve(process.cwd(), 'GovScheme/public/locales', norm, 'translation.json')
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) {
        const dict = JSON.parse(fs.readFileSync(p, 'utf8'));
        localeCache.set(norm, dict);
        return dict;
      }
    }
  } catch (e) {
    console.warn(`[AI Controller] Could not load locale for ${norm}:`, e.message);
  }
  return {};
}

export function getLocalizedSchemeInfo(scheme, lang) {
  if (!scheme) return { name: '', category: '', benefits: '', department: '', state: '' };
  const norm = (lang || 'en').toLowerCase().split('-')[0];
  const rawBenefits = scheme.benefitsSummary || scheme.shortDescription || '';
  const rawDept = scheme.department || scheme.ministry || '';
  const rawState = scheme.state || 'Central';

  if (norm === 'en') {
    return {
      name: scheme.name,
      category: scheme.category,
      benefits: rawBenefits,
      department: rawDept,
      state: rawState
    };
  }

  const dict = getLocaleDict(norm);
  const schemeId = scheme.id || scheme.schemeId || '';

  const localizedName = dict[`${schemeId}_name`] || scheme.name;
  const localizedBenefits = dict[`${schemeId}_benefits`] || dict[`${schemeId}_desc`] || rawBenefits;
  const localizedCat = dict[scheme.category] || scheme.category;
  const localizedDept = dict[scheme.department] || dict[scheme.ministry] || rawDept;
  const localizedState = (scheme.state === 'All' || scheme.state === 'Central')
    ? (dict['Central'] || 'Central')
    : (dict[scheme.state] || scheme.state);

  return {
    name: localizedName,
    category: localizedCat,
    benefits: localizedBenefits,
    department: localizedDept,
    state: localizedState
  };
}

const RELEVANCE_THRESHOLD = 0.15;
const MAX_CONTEXT_SCHEMES = 5;

const LANGUAGE_NAMES = {
  en: 'English',
  hi: 'Hindi (हिन्दी)',
  ta: 'Tamil (தமிழ்)',
  te: 'Telugu (తెలుగు)',
  ml: 'Malayalam (മലയാളം)',
  mr: 'Marathi (मराठी)',
  gu: 'Gujarati (ગુજરાતી)',
  kn: 'Kannada (ಕನ್ನಡ)',
  bn: 'Bengali (বাংলা)',
  pa: 'Punjabi (ਪੰਜਾਬੀ)'
};

const CLARIFICATIONS = {
  en: "I couldn't identify a specific government scheme matching your query in the GovScheme database. We catalogue 75 verified central and state schemes across Agriculture, Healthcare, Education, Housing, Pensions, Women & Child Welfare, and Social Empowerment. Please specify your state, occupation, or what assistance you need (e.g., 'scholarship for college students in Tamil Nadu' or 'farmer subsidy').",
  hi: "GovScheme डेटाबेस में आपके प्रश्न से मेल खाने वाली विशिष्ट सरकारी योजना की पहचान नहीं की जा सकी। हम कृषि, स्वास्थ्य, शिक्षा, आवास, पेंशन, महिला एवं बाल कल्याण तथा सामाजिक सशक्तिकरण में 75 सत्यापित केंद्रीय व राज्य योजनाओं को सूचीबद्ध करते हैं। कृपया अपना राज्य, व्यवसाय या आवश्यक सहायता निर्दिष्ट करें।",
  ta: "GovScheme தரவுத்தளத்தில் உங்கள் வினவலுடன் பொருந்தக்கூடிய குறிப்பிட்ட அரசுத் திட்டத்தை அடையாளம் காண முடியவில்லை. விவசாயம், சுகாதாரம், கல்வி, வீட்டுவசதி, ஓய்வூதியம், மகளிர் மற்றும் குழந்தைகள் நலன் உள்ளிட்ட 75 சரிபார்க்கப்பட்ட மத்திய மற்றும் மாநில திட்டங்களை நாங்கள் கொண்டுள்ளோம். உங்கள் மாநிலம், தொழில் அல்லது உங்களுக்குத் தேவையான உதவியைக் குறிப்பிடவும்.",
  te: "GovScheme డేటాబేస్‌లో మీ ప్రశ్నకు సరిపోలే నిర్దిష్ట ప్రభుత్వ పథకాన్ని గుర్తించలేకపోయాము. వ్యవసాయం, ఆరోగ్యం, విద్య, గృహనిర్మాణం, పెన్షన్లు, మహిళా శిశు సంక్షేమం వంటి రంగాలలో 75 ధృవీకరించబడిన కేంద్ర మరియు రాష్ట్ర పథకాలు ఉన్నాయి. దయచేసి మీ రాష్ట్రం, వృత్తి లేదా సహాయాన్ని పేర్కొనండి.",
  ml: "GovScheme ഡാറ്റാബേസിൽ നിങ്ങളുടെ അന്വേഷണവുമായി പൊരുത്തപ്പെടുന്ന നിർദ്ദിഷ്ട സർക്കാർ സ്കീം തിരിച്ചറിയാനായില്ല. കൃഷി, ആരോഗ്യം, വിദ്യാഭ്യാസം, പാർപ്പിടം, പെൻഷൻ, സ്ത്രീ ശിശുക്ഷേമം എന്നിവയിൽ 75 പരിശോധിച്ചുറപ്പിച്ച കേന്ദ്ര, സംസ്ഥാന പദ്ധതികൾ ഞങ്ങൾ പട്ടികപ്പെടുത്തിയിട്ടുണ്ട്. ദയവായി നിങ്ങളുടെ സംസ്ഥാനമോ തൊഴിലോ വ്യക്തമാക്കുക.",
  mr: "GovScheme डेटाबेसमध्ये तुमच्या प्रश्नाशी जुळणारी कोणतीही विशिष्ट सरकारी योजना आढळली नाही. आम्ही कृषी, आरोग्य, शिक्षण, गृहनिर्माण, पेन्शन, महिला व बाल कल्याण या क्षेत्रातील 75 प्रमाणित योजनांची नोंद केली आहे. कृपया आपले राज्य, व्यवसाय किंवा आपल्याला हवी असलेली मदत स्पष्ट करा.",
  gu: "GovScheme ડેટાબેઝમાં તમારી ક્વેરી સાથે મેળ ખાતી ચોક્કસ સરકારી યોજના ઓળખી શકાઈ નથી. અમે કૃષિ, આરોગ્ય, શિક્ષણ, આવાસ, પેન્શન, મહિલા અને બાળ કલ્યાણમાં 75 ચકાસાયેલ યોજનાઓની યાદી આપીએ છીએ. કૃપા કરીને તમારું રાજ્ય, વ્યવસાય અથવા જરૂરી સહાય સ્પષ્ટ કરો.",
  kn: "GovScheme ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ಹೊಂದಿಕೆಯಾಗುವ ನಿರ್ದಿಷ್ಟ ಸರ್ಕಾರಿ ಯೋಜನೆಯನ್ನು ಗುರುತಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ರಾಜ್ಯ, ಉದ್ಯೋಗ ಅಥವಾ ಅಗತ್ಯ ನೆರವನ್ನು ನಿರ್ದಿಷ್ಟಪಡಿಸಿ.",
  bn: "GovScheme ডাটাবেসে আপনার অনুসন্ধানের সাথে মিলে এমন কোনো সরকারি প্রকল্প চিহ্নিত করা যায়নি। অনুগ্রহ করে আপনার রাজ্য, পেশা বা প্রয়োজনীয় সহায়তা উল্লেখ করুন।",
  pa: "GovScheme ਡੇਟਾਬੇਸ ਵਿੱਚ ਤੁਹਾਡੀ ਪੁੱਛਗਿੱਛ ਨਾਲ ਮੇਲ ਖਾਂਦੀ ਖਾਸ ਸਰਕਾਰੀ ਯੋਜਨਾ ਦੀ ਪਛਾਣ ਨਹੀਂ ਹੋ ਸਕੀ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਰਾਜ, ਕਿੱਤਾ ਜਾਂ ਲੋੜੀਂਦੀ ਸਹਾਇਤਾ ਦਰਜ ਕਰੋ।"
};

/**
 * Builds factual grounded prompt using only retrieved schemes relevant to citizen query
 */
// Exported for transparent inspection & testing
export const buildGroundedPrompt = (message, topSchemes, language = 'en') => {
  const schemeContext = topSchemes.map((s, idx) => {
    const loc = getLocalizedSchemeInfo(s, language);
    const steps = (s.applicationSteps || []).map(st => `Step ${st.stepNumber || st.step || ''}: ${st.title || ''} - ${st.description || ''}`).join('; ');
    const faqs = (s.faqs || []).slice(0, 3).map(f => `Q: ${f.question} A: ${f.answer}`).join('; ');
    const docs = (s.eligibilityRules?.requiredDocuments || []).join(', ');
    return `
[Scheme ${idx + 1}: ${loc.name} (${s.name})]
- Category: ${loc.category} | State: ${loc.state} | Ministry/Dept: ${loc.department}
- Benefits: ${loc.benefits}
- Financial Support: ${s.financialBenefitAmount ? '₹' + s.financialBenefitAmount : 'As per scheme rules'}
- Key Eligibility Rules:
  * Age Range: ${s.eligibilityRules?.minAge ?? 0} to ${s.eligibilityRules?.maxAge ?? 120} years
  * Income Limit: ${s.eligibilityRules?.maxAnnualIncome ? '₹' + s.eligibilityRules.maxAnnualIncome + '/year' : 'No explicit ceiling'}
  * Target Occupations: ${(s.eligibilityRules?.allowedOccupations || ['All eligible']).join(', ')}
  * Target Categories: ${(s.eligibilityRules?.allowedCategories || ['All']).join(', ')}
  * Required Documents: ${docs || 'Aadhaar Card, Bank Passbook, Proof of Residence'}
- Application Procedure & Steps: ${steps || 'Apply online at official portal or nearest CSC / e-Sevai centre.'}
- FAQs: ${faqs || 'Refer to official scheme guidelines.'}
- Official Application Portal: ${s.officialApplyUrl || s.officialWebsite || 'Official portal link currently unavailable'}
`;
  }).join('\n');

  const langName = LANGUAGE_NAMES[language] || 'English';

  const context = `You are the official GovScheme AI Assistant, an authoritative, intelligent, helpful conversational guide for Indian government welfare schemes.
Ground your response strictly on the verified scheme records provided below:
${schemeContext}

CRITICAL RULES:
1. DIRECT INTENT-BASED ANSWERING: You must directly, intelligently, and specifically answer the citizen's EXACT question.
   - If they ask "HOW TO APPLY?" or about registration: Explain the step-by-step application procedure clearly, including the website and documents to submit.
   - If they ask "WHAT DOCUMENTS ARE NEEDED?": List the exact required documents clearly with bullet points.
   - If they ask "AM I ELIGIBLE?" or about eligibility rules: Clearly explain the age criteria, income limits, gender, landholding, and category requirements.
   - If they ask "HOW MUCH MONEY / BENEFIT WILL I GET?": State the exact financial subsidy, monthly allowance, or benefits amount.
   - If they ask ABOUT OFFICE / WHERE TO SUBMIT: State the implementing department, e-Sevai / CSC centre, or district nodal office.
   - If they ask a COMPARISON between schemes: Compare the schemes clearly and helpfully.
   - If they ask a GREETING ("hello", "who are you"): Greet them warmly and offer specific ways you can assist them with government schemes.
   NEVER reply with a repetitive static card or generic metadata dump. Give a thoughtful, complete, conversational answer tailored to the user's specific query.
2. NATURAL MULTILINGUAL RESPONSE: The citizen's active language is ${langName} (${language}). You MUST respond fluently, politely, and naturally in ${langName}. Do NOT respond in English unless the requested language is English.
3. PRESERVE FACTUAL DATA: Keep official scheme names, numerical amounts, and official portal URLs exact and verified as given in the context. Never guess, modify, or fabricate links.
4. LEGAL AUTHORITATIVENESS: Conclude with a brief, gentle one-line note that official eligibility is ultimately determined by the implementing government departments.`;

  return [context, `Citizen Query: ${message}`];
};

/**
 * Generates structured offline fallback grounded directly in retrieved catalogue facts, tailored to question intent
 */
export function buildOfflineFallbackReply(topSchemes, statusTag = 'Verified Catalogue Fact', language = 'en', userMessage = '') {
  const lowerMsg = (userMessage || '').toLowerCase().trim();
  const isGreeting = /^(hi|hello|hey|namaste|vanakkam|namaskaram|greetings|good\s*(morning|afternoon|evening)|who are you|నమస్కారం|హలో|హాయ్|ఎవరు|வணக்கம்|ஹலோ|नमस्ते|नमस्कार)/i.test(lowerMsg);

  if (isGreeting) {
    if (language === 'te') {
      return `[ధృవీకరించబడిన నాలెడ్జ్ ఇంజిన్ • ${statusTag}]\n\nనమస్కారం! నేను మీ **GovScheme AI సహాయకుడిని**.\n\nనేను భారతదేశంలోని 75+ కేంద్ర మరియు రాష్ట్ర సంక్షేమ పథకాల గురించి (విద్యార్థుల స్కాలర్‌షిప్‌లు, రైతుల ఆర్థిక సహాయం, మహిళా సబలీకరణ, ఆరోగ్య బీమా, వృద్ధాప్య పెన్షన్లు) మీకు పూర్తి సమాచారం మరియు దరఖాస్తు మార్గదర్శకత్వం అందించగలను.\n\nమీకు ఏ పథకం గురించి లేదా ఏ అంశంపై సమాచారం కావాలో దయచేసి అడగండి!`;
    }
    if (language === 'ta') {
      return `[உறுதிப்படுத்தப்பட்ட அறிவு இயந்திரம் • ${statusTag}]\n\nவணக்கம்! நான் உங்கள் **GovScheme AI வழிகாட்டி**.\n\nமத்திய மற்றும் மாநில அரசுகளின் 75+ மக்கள் நலத்திட்டங்கள் (மாணவர் கல்வி உதவித்தொகை, விவசாய மானியங்கள், மகளிர் உதவித்தொகை, மருத்துவக் காப்பீடு, முதியோர் ஓய்வூதியம்) பற்றிய துல்லியமான தகவல்களையும் விண்ணப்பிக்கும் வழிகாட்டுதலையும் நான் வழங்குகிறேன்.\n\nஉங்களுக்கு எந்த திட்டம் அல்லது உதவி தேவை என்பதை தயங்காமல் கேளுங்கள்!`;
    }
    if (language === 'hi') {
      return `[सत्यापित ज्ञान इंजन • ${statusTag}]\n\nनमस्ते! मैं आपका **GovScheme AI सहायक** हूँ।\n\nमैं भारत सरकार और राज्य सरकारों की 75+ प्रमुख कल्याणकारी योजनाओं (छात्रवृत्ति, किसान सम्मान निधि, महिला सशक्तिकरण, स्वास्थ्य बीमा, पेंशन) की प्रामाणिक जानकारी और आवेदन प्रक्रिया में आपकी सहायता करता हूँ।\n\nआप किस योजना या सहायता के बारे में जानना चाहते हैं? कृपया अपना प्रश्न पूछें!`;
    }
    if (language === 'mr') {
      return `[प्रमाणित ज्ञान इंजिन • ${statusTag}]\n\nनमस्कार! मी आपला **GovScheme AI सहाय्यक** आहे.\n\nमी 75+ केंद्र व राज्य शासकीय योजनांविषयी (विद्यार्थी शिष्यवृत्ती, शेतकरी अनुदान, महिला कल्याण, आरोग्य विमा, पेन्शन) खात्रीशीर माहिती व अर्ज मार्गदर्शन करतो.\n\nआपल्याला कोणत्या योजनेबद्दल माहिती हवी आहे? कृपया विचारा!`;
    }
    return `[Grounded Knowledge Engine • ${statusTag}]\n\nHello! I am your **GovScheme AI Assistant**.\n\nI provide authoritative information and step-by-step application guidance across 75+ verified central and state welfare schemes in Education, Agriculture, Healthcare, Women Empowerment, Pensions, and Housing.\n\nHow can I help you today? Please feel free to ask about eligibility, required documents, or how to apply for any scheme!`;
  }

  if (!topSchemes || topSchemes.length === 0) {
    return CLARIFICATIONS[language] || CLARIFICATIONS.en;
  }

  const primary = topSchemes[0];
  const portalUrl = primary.officialApplyUrl || primary.officialWebsite || 'https://www.india.gov.in';
  const info = getLocalizedSchemeInfo(primary, language);

  const isApply = /apply|how to|register|procedure|form|steps|portal|link|website|where to apply|విధానం|దరఖాస్తు|ఎలా|ఎక్కడ|పోర్టల్|లింక్|விண்ணப்ப|எப்படி|எங்கு|आवेदन|प्रक्रिया|कहाँ|अर्ज|कसा|अर्जाची|कुठे|അപേക്ഷ|എങ്ങനെ|અરજી|કેવી રીતે/i.test(lowerMsg);
  const isDocs = /document|proof|certificate|aadhaar|id|papers|card|పత్రాలు|సర్టిఫికేట్|ఆధార్|కాగితాలు|ఆவணங்கள்|சான்றிதழ்|ஆதார்|दस्तावेज|प्रमाणपत्र|आधार|कागदपत्रे|दाखला|രേഖകൾ|സർട്ടിഫിക്കറ്റ്|દસ્તાવેજ|પુરાવા/i.test(lowerMsg);
  const isEligible = /eligible|eligibility|age|income|salary|who can|qualification|caste|category|limit|అర్హత|వయస్సు|ఆదాయం|కులం|పరిమితి|తகுதி|வயது|வருமானம்|சாதி|வரம்பு|पात्रता|आयु|उम्र|आय|जात|मर्यादा|वय|उत्पन्न|जाती|യോജ്യത|പ്രായം|വരുമാനം|પાત્રતા|ઉંમર|આવક/i.test(lowerMsg);
  const isBenefit = /benefit|amount|money|cash|fund|subsidy|pension|rupees|₹|rs|how much|payment|dbt|installment|scholarship amount|ఎంత|డబ్బు|సహాయం|నగదు|స్కాలర్‌షిప్|பணம்|தொகை|உதவி|மானியம்|பங்களிப்பு|पैसे|राशि|सहायता|सब्सिडी|रक्कम|अनुदान|पेन्शन|പണം|തുക|സഹായം|લાભ|રૂપિયા|સહાય/i.test(lowerMsg);

  const reqDocs = (primary.eligibilityRules?.requiredDocuments && primary.eligibilityRules.requiredDocuments.length > 0)
    ? primary.eligibilityRules.requiredDocuments.join(', ')
    : 'Aadhaar Card, Bank Passbook, Proof of Residence';

  const stepsList = (primary.applicationSteps && primary.applicationSteps.length > 0)
    ? primary.applicationSteps.map(s => `${s.stepNumber || ''}. ${s.title}: ${s.description}`).join('\n')
    : `1. Visit official portal (${portalUrl})\n2. Fill online application form with Aadhaar and bank details\n3. Upload required documents and submit for verification`;

  if (language === 'te') {
    if (isApply) {
      return `[ధృవీకరించబడిన నాలెడ్జ్ ఇంజిన్ • ${statusTag}]\n\n**${info.name} - దరఖాస్తు విధానం (How to Apply):**\n\nఈ పథకానికి దరఖాస్తు చేసుకోవడానికి క్రింది దశలను అనుసరించండి:\n${stepsList}\n\n🔗 **అధికారిక దరఖాస్తు పోర్టల్:** ${portalUrl}\n📍 మీరు మీ సమీపంలోని CSC లేదా ఇ-సేవాయి కేంద్రం ద్వారా కూడా దరఖాస్తు చేసుకోవచ్చు.\n\n*చట్టపరమైన నోటీసు: అధికారిక అర్హత నిబంధనల ప్రకారం మరియు ప్రభుత్వ శాఖలచే మాత్రమే నిర్ణయించబడుతుంది.*`;
    }
    if (isDocs) {
      return `[ధృవీకరించబడిన నాలెడ్జ్ ఇంజిన్ • ${statusTag}]\n\n**${info.name} కొరకు అవసరమైన పత్రాలు (Required Documents):**\n\nదరఖాస్తు చేయడానికి క్రింది ధృవీకరణ పత్రాలు అవసరం:\n• ${reqDocs.split(', ').join('\n• ')}\n\n🔗 **అధికారిక దరఖాస్తు పోర్టల్:** ${portalUrl}\n\n*చట్టపరమైన నోటీసు: అధికారిక అర్హత నిబంధనల ప్రకారం మరియు ప్రభుత్వ శాఖలచే మాత్రమే నిర్ణయించబడుతుంది.*`;
    }
    if (isBenefit) {
      return `[ధృవీకరించబడిన నాలెడ్జ్ ఇంజిన్ • ${statusTag}]\n\n**${info.name} ప్రయోజనాలు & ఆర్థిక సహాయం (Benefits):**\n\n• **ఆర్థిక సహాయం:** ${primary.financialBenefitAmount ? '₹' + primary.financialBenefitAmount : 'నిబంధనల ప్రకారం'}\n• **ప్రయోజనాల వివరాలు:** ${info.benefits}\n\n🔗 **అధికారిక దరఖాస్తు పోర్టల్:** ${portalUrl}\n\n*చట్టపరమైన నోటీసు: అధికారిక అర్హత నిబంధనల ప్రకారం మరియు ప్రభుత్వ శాఖలచే మాత్రమే నిర్ణయించబడుతుంది.*`;
    }
    if (isEligible) {
      return `[ధృవీకరించబడిన నాలెడ్జ్ ఇంజిన్ • ${statusTag}]\n\n**${info.name} అర్హత నిబంధనలు (Eligibility Criteria):**\n\n• **వయస్సు పరిమితి:** ${primary.eligibilityRules?.minAge ?? 0} నుండి ${primary.eligibilityRules?.maxAge ?? 120} సంవత్సరాలు\n• **ఆదాయ పరిమితి:** ${primary.eligibilityRules?.maxAnnualIncome ? '₹' + primary.eligibilityRules.maxAnnualIncome + '/సంవత్సరానికి' : 'ఆదాయ పరిమితి లేదు'}\n• **అర్హులైన వర్గాలు:** ${(primary.eligibilityRules?.allowedCategories || ['అన్ని వర్గాలు']).join(', ')}\n• **వృత్తులు:** ${(primary.eligibilityRules?.allowedOccupations || ['అన్ని వృత్తులు']).join(', ')}\n\n🔗 **అధికారిక దరఖాస్తు పోర్టల్:** ${portalUrl}\n\n*చట్టపరమైన నోటీసు: అధికారిక అర్హత నిబంధనల ప్రకారం మరియు ప్రభుత్వ శాఖలచే మాత్రమే నిర్ణయించబడుతుంది.*`;
    }
    return `[ధృవీకరించబడిన నాలెడ్జ్ ఇంజిన్ • ${statusTag}]\n\n**${info.name} - సమగ్ర మార్గదర్శి:**\n\nఈ పథకం **${info.category}** విభాగం కింద **${info.state}** ప్రభుత్వం / కేంద్ర ప్రభుత్వం ద్వారా అందించబడుతుంది.\n\n• **ముఖ్య ప్రయోజనాలు:** ${info.benefits}${primary.financialBenefitAmount ? ` (ఆర్థిక సహాయం: ₹${primary.financialBenefitAmount})` : ''}\n• **అర్హత నిబంధనలు:** వయస్సు ${primary.eligibilityRules?.minAge ?? 0}–${primary.eligibilityRules?.maxAge ?? 120} సం.${primary.eligibilityRules?.maxAnnualIncome ? `, వార్షిక ఆదాయ పరిమితి ₹${primary.eligibilityRules.maxAnnualIncome}` : ''}\n• **అవసరమైన పత్రాలు:** ${reqDocs}\n• **దరఖాస్తు పద్ధతి:** అధికారిక పోర్టల్ ద్వారా ఆన్‌లైన్‌లో లేదా సమీప గ్రామ/వార్డు సచివాలయం / CSC కేంద్రం ద్వారా దరఖాస్తు చేసుకోవచ్చు.\n\n🔗 **అధికారిక దరఖాస్తు పోర్టల్:** ${portalUrl}\n\n*చట్టపరమైన నోటీసు: అధికారిక అర్హత నిబంధనల ప్రకారం మరియు ప్రభుత్వ శాఖలచే మాత్రమే నిర్ణయించబడుతుంది.*`;
  }

  if (language === 'ta') {
    if (isApply) {
      return `[உறுதிப்படுத்தப்பட்ட அறிவு இயந்திரம் • ${statusTag}]\n\n**${info.name} - விண்ணப்பிக்கும் முறை (How to Apply):**\n\nஇத்திட்டத்திற்கு விண்ணப்பிக்க பின்வரும் வழிமுறைகளைப் பின்பற்றவும்:\n${stepsList}\n\n🔗 **அதிகாரப்பூர்வ போர்ட்டல்:** ${portalUrl}\n📍 உங்கள் அருகிலுள்ள இ-சேவை மையம் மூலமாகவும் விண்ணப்பிக்கலாம்.\n\n*சட்ட அறிவிப்பு: அதிகாரப்பூர்வ தகுதி GovScheme-ன் திட்ட விதிமுறைகள் மற்றும் அரசுத் துறைகளால் மட்டுமே தீர்மானிக்கப்படுகிறது.*`;
    }
    if (isDocs) {
      return `[உறுதிப்படுத்தப்பட்ட அறிவு இயந்திரம் • ${statusTag}]\n\n**${info.name} திட்டத்திற்கு தேவையான ஆவணங்கள்:**\n\nவிண்ணப்பிக்க பின்வரும் ஆவணங்கள் தேவைப்படுகின்றன:\n• ${reqDocs.split(', ').join('\n• ')}\n\n🔗 **அதிகாரப்பூர்வ போர்ட்டல்:** ${portalUrl}\n\n*சட்ட அறிவிப்பு: அதிகாரப்பூர்வ தகுதி GovScheme-ன் திட்ட விதிமுறைகள் மற்றும் அரசுத் துறைகளால் மட்டுமே தீர்மானிக்கப்படுகிறது.*`;
    }
    if (isBenefit) {
      return `[உறுதிப்படுத்தப்பட்ட அறிவு இயந்திரம் • ${statusTag}]\n\n**${info.name} திட்டத்தின் நன்மைகள் மற்றும் நிதியுதவி:**\n\n• **நிதியுதவி தொகை:** ${primary.financialBenefitAmount ? '₹' + primary.financialBenefitAmount : 'திட்ட விதிகளின்படி'}\n• **நன்மைகள்:** ${info.benefits}\n\n🔗 **அதிகாரப்பூர்வ போர்ட்டல்:** ${portalUrl}\n\n*சட்ட அறிவிப்பு: அதிகாரப்பூர்வ தகுதி GovScheme-ன் திட்ட விதிமுறைகள் மற்றும் அரசுத் துறைகளால் மட்டுமே தீர்மானிக்கப்படுகிறது.*`;
    }
    if (isEligible) {
      return `[உறுதிப்படுத்தப்பட்ட அறிவு இயந்திரம் • ${statusTag}]\n\n**${info.name} திட்டத்திற்கான தகுதி வரம்புகள்:**\n\n• **வயது வரம்பு:** ${primary.eligibilityRules?.minAge ?? 0} முதல் ${primary.eligibilityRules?.maxAge ?? 120} ஆண்டுகள் வரை\n• **வருமான உச்சவரம்பு:** ${primary.eligibilityRules?.maxAnnualIncome ? 'ஆண்டுக்கு ₹' + primary.eligibilityRules.maxAnnualIncome : 'வருமான வரம்பு இல்லை'}\n• **தகுதியான பிரிவினர்:** ${(primary.eligibilityRules?.allowedCategories || ['அனைத்து பிரிவினர்']).join(', ')}\n• **தொழில்:** ${(primary.eligibilityRules?.allowedOccupations || ['அனைத்து தொழில்கள்']).join(', ')}\n\n🔗 **அதிகாரப்பூர்வ போர்ட்டல்:** ${portalUrl}\n\n*சட்ட அறிவிப்பு: இறுதி தகுதி அரசுத் துறைகளால் மட்டுமே தீர்மானிக்கப்படுகிறது.*`;
    }
    return `[உறுதிப்படுத்தப்பட்ட அறிவு இயந்திரம் • ${statusTag}]\n\n**${info.name} - முழு விவரங்கள்:**\n\nஇத்திட்டம் **${info.category}** பிரிவின் கீழ் **${info.state}** அரசு / மத்திய அரசால் தகுதியுள்ள மக்களுக்கு வழங்கப்படுகிறது.\n\n• **முக்கிய நன்மைகள்:** ${info.benefits}${primary.financialBenefitAmount ? ` (நிதியுதவி: ₹${primary.financialBenefitAmount})` : ''}\n• **தகுதி:** வயது ${primary.eligibilityRules?.minAge ?? 0}–${primary.eligibilityRules?.maxAge ?? 120} ஆண்டுகள்${primary.eligibilityRules?.maxAnnualIncome ? `, வருமானம் ஆண்டுக்கு ₹${primary.eligibilityRules.maxAnnualIncome}` : ''}\n• **தேவையான ஆவணங்கள்:** ${reqDocs}\n• **விண்ணப்பிக்கும் முறை:** இணையதளம் மூலமாகவோ அல்லது அருகிலுள்ள இ-சேவை மையம் வாயிலாகவோ விண்ணப்பிக்கலாம்.\n\n🔗 **அதிகாரப்பூர்வ போர்ட்டல்:** ${portalUrl}\n\n*சட்ட அறிவிப்பு: அதிகாரப்பூர்வ தகுதி GovScheme-ன் திட்ட விதிமுறைகள் மற்றும் அரசுத் துறைகளால் மட்டுமே தீர்மானிக்கப்படுகிறது.*`;
  }

  if (language === 'hi') {
    if (isApply) {
      return `[सत्यापित ज्ञान इंजन • ${statusTag}]\n\n**${info.name} - आवेदन प्रक्रिया (How to Apply):**\n\nइस योजना के लिए आवेदन करने के चरण:\n${stepsList}\n\n🔗 **आधिकारिक आवेदन पोर्टल:** ${portalUrl}\n📍 आप अपने निकटतम सीएससी (CSC) या ई-मित्र केंद्र से भी आवेदन कर सकते हैं।\n\n*कानूनी सूचना: आधिकारिक पात्रता संबंधित सरकारी विभाग द्वारा तय की जाती है.*`;
    }
    if (isDocs) {
      return `[सत्यापित ज्ञान इंजन • ${statusTag}]\n\n**${info.name} के लिए आवश्यक दस्तावेज (Required Documents):**\n\nआवेदन हेतु निम्नलिखित प्रमाणपत्र आवश्यक हैं:\n• ${reqDocs.split(', ').join('\n• ')}\n\n🔗 **आधिकारिक आवेदन पोर्टल:** ${portalUrl}\n\n*कानूनी सूचना: आधिकारिक पात्रता संबंधित सरकारी विभाग द्वारा तय की जाती है.*`;
    }
    if (isBenefit) {
      return `[सत्यापित ज्ञान इंजन • ${statusTag}]\n\n**${info.name} के लाभ और वित्तीय सहायता:**\n\n• **आर्थिक सहायता:** ${primary.financialBenefitAmount ? '₹' + primary.financialBenefitAmount : 'योजना नियमानुसार'}\n• **लाभ विवरण:** ${info.benefits}\n\n🔗 **आधिकारिक आवेदन पोर्टल:** ${portalUrl}\n\n*कानूनी सूचना: वित्तीय सहायता संबंधित विभाग द्वारा सीधे बैंक खाते (DBT) में भेजी जाती है.*`;
    }
    if (isEligible) {
      return `[सत्यापित ज्ञान इंजन • ${statusTag}]\n\n**${info.name} के लिए पात्रता मानदंड (Eligibility Criteria):**\n\n• **आयु सीमा:** ${primary.eligibilityRules?.minAge ?? 0} से ${primary.eligibilityRules?.maxAge ?? 120} वर्ष\n• **आय सीमा:** ${primary.eligibilityRules?.maxAnnualIncome ? '₹' + primary.eligibilityRules.maxAnnualIncome + '/वर्ष' : 'कोई आय सीमा नहीं'}\n• **पात्र श्रेणियां:** ${(primary.eligibilityRules?.allowedCategories || ['सभी श्रेणियां']).join(', ')}\n• **व्यवसाय:** ${(primary.eligibilityRules?.allowedOccupations || ['सभी व्यवसाय']).join(', ')}\n\n🔗 **आधिकारिक आवेदन पोर्टल:** ${portalUrl}\n\n*कानूनी सूचना: अंतिम पात्रता सरकारी नियमों और संबंधित विभागों द्वारा निर्धारित की जाती है.*`;
    }
    return `[सत्यापित ज्ञान इंजन • ${statusTag}]\n\n**${info.name} - संपूर्ण विवरण:**\n\nयह योजना **${info.category}** श्रेणी के तहत **${info.state}** सरकार / केंद्र सरकार द्वारा संचालित की जा रही है।\n\n• **प्रमुख लाभ:** ${info.benefits}${primary.financialBenefitAmount ? ` (वित्तीय सहायता: ₹${primary.financialBenefitAmount})` : ''}\n• **पात्रता:** आयु ${primary.eligibilityRules?.minAge ?? 0}–${primary.eligibilityRules?.maxAge ?? 120} वर्ष${primary.eligibilityRules?.maxAnnualIncome ? `, आय सीमा ₹${primary.eligibilityRules.maxAnnualIncome}/वर्ष` : ''}\n• **आवश्यक दस्तावेज:** ${reqDocs}\n• **आवेदन कैसे करें:** आधिकारिक पोर्टल पर ऑनलाइन अथवा नजदीकी सीएससी (CSC) केंद्र पर जाकर आवेदन करें।\n\n🔗 **आधिकारिक आवेदन पोर्टल:** ${portalUrl}\n\n*कानूनी सूचना: आधिकारिक पात्रता संबंधित सरकारी विभाग द्वारा तय की जाती है.*`;
  }

  if (language === 'mr') {
    if (isApply) {
      return `[प्रमाणित ज्ञान इंजिन • ${statusTag}]\n\n**${info.name} - अर्ज प्रक्रिया (How to Apply):**\n\nया योजनेसाठी अर्ज करण्याची पद्धत:\n${stepsList}\n\n🔗 **अधिकृत अर्ज पोर्टल:** ${portalUrl}\n📍 आपण आपल्या जवळच्या सेतू केंद्र (CSC) किंवा ई-सेवा केंद्राद्वारे अर्ज करू शकता.\n\n*कायदेशीर सूचना: अधिकृत पात्रता अधिकृत सरकारी विभागांद्वारेच ठरवली जाते.*`;
    }
    if (isDocs) {
      return `[प्रमाणित ज्ञान इंजिन • ${statusTag}]\n\n**${info.name} साठी आवश्यक कागदपत्रे:**\n\n• ${reqDocs.split(', ').join('\n• ')}\n\n🔗 **अधिकृत अर्ज पोर्टल:** ${portalUrl}\n\n*कायदेशीर सूचना: अधिकृत पात्रता अधिकृत सरकारी विभागांद्वारेच ठरवली जाते.*`;
    }
    if (isBenefit) {
      return `[प्रमाणित ज्ञान इंजिन • ${statusTag}]\n\n**${info.name} चे फायदे व आर्थिक सहाय्य:**\n\n• **आर्थिक सहाय्य:** ${primary.financialBenefitAmount ? '₹' + primary.financialBenefitAmount : 'नियमानुसार'}\n• **फायदे:** ${info.benefits}\n\n🔗 **अधिकृत अर्ज पोर्टल:** ${portalUrl}\n\n*कायदेशीर सूचना: अधिकृत पात्रता अधिकृत सरकारी विभागांद्वारेच ठरवली जाते.*`;
    }
    if (isEligible) {
      return `[प्रमाणित ज्ञान इंजिन • ${statusTag}]\n\n**${info.name} पात्रता निकष:**\n\n• **वय मर्यादा:** ${primary.eligibilityRules?.minAge ?? 0} ते ${primary.eligibilityRules?.maxAge ?? 120} वर्षे\n• **उत्पन्न मर्यादा:** ${primary.eligibilityRules?.maxAnnualIncome ? '₹' + primary.eligibilityRules.maxAnnualIncome + '/वर्ष' : 'मर्यादा नाही'}\n• **पात्र प्रवर्ग:** ${(primary.eligibilityRules?.allowedCategories || ['सर्व']).join(', ')}\n\n🔗 **अधिकृत अर्ज पोर्टल:** ${portalUrl}\n\n*कायदेशीर सूचना: अधिकृत पात्रता अधिकृत सरकारी विभागांद्वारेच ठरवली जाते.*`;
    }
    return `[प्रमाणित ज्ञान इंजिन • ${statusTag}]\n\n**${info.name} - संपूर्ण माहिती:**\n\nही योजना **${info.category}** अंतर्गत **${info.state}** सरकार / केंद्र सरकारद्वारे राबवली जाते.\n\n• **मुख्य फायदे:** ${info.benefits}${primary.financialBenefitAmount ? ` (आर्थिक सहाय्य: ₹${primary.financialBenefitAmount})` : ''}\n• **पात्रता:** वय ${primary.eligibilityRules?.minAge ?? 0}–${primary.eligibilityRules?.maxAge ?? 120} वर्षे${primary.eligibilityRules?.maxAnnualIncome ? `, उत्पन्न मर्यादा ₹${primary.eligibilityRules.maxAnnualIncome}` : ''}\n• **आवश्यक कागदपत्रे:** ${reqDocs}\n• **अर्ज कसा करावा:** अधिकृत पोर्टलद्वारे ऑनलाइन किंवा जवळच्या सेतू / सीएससी केंद्रावर अर्ज करता येईल.\n\n🔗 **अधिकृत अर्ज पोर्टल:** ${portalUrl}\n\n*कायदेशीर सूचना: अधिकृत पात्रता अधिकृत सरकारी विभागांद्वारेच ठरवली जाते.*`;
  }

  // Default: English
  if (isApply) {
    return `[Grounded Knowledge Engine • ${statusTag}]\n\n**How to Apply for ${info.name}:**\n\nFollow these verified application steps:\n${stepsList}\n\n🔗 **Official Application Portal:** ${portalUrl}\n📍 You can also visit your nearest Common Service Centre (CSC) or local administrative office to submit offline.\n\n*Legal Notice: Official eligibility is strictly determined by authorized government departments.*`;
  }
  if (isDocs) {
    return `[Grounded Knowledge Engine • ${statusTag}]\n\n**Required Documents for ${info.name}:**\n\nTo apply, please ensure you have the following verified documents ready:\n• ${reqDocs.split(', ').join('\n• ')}\n\n🔗 **Official Application Portal:** ${portalUrl}\n\n*Legal Notice: Official eligibility is strictly determined by authorized government departments.*`;
  }
  if (isBenefit) {
    return `[Grounded Knowledge Engine • ${statusTag}]\n\n**Benefits & Financial Support for ${info.name}:**\n\n• **Financial Assistance:** ${primary.financialBenefitAmount ? '₹' + primary.financialBenefitAmount : 'As per scheme guidelines'}\n• **Coverage & Benefits:** ${info.benefits}\n\n🔗 **Official Application Portal:** ${portalUrl}\n\n*Legal Notice: Benefits are disbursed via Direct Benefit Transfer (DBT) upon department verification.*`;
  }
  if (isEligible) {
    return `[Grounded Knowledge Engine • ${statusTag}]\n\n**Eligibility Criteria for ${info.name}:**\n\n• **Age Range:** ${primary.eligibilityRules?.minAge ?? 0} to ${primary.eligibilityRules?.maxAge ?? 120} years\n• **Income Ceiling:** ${primary.eligibilityRules?.maxAnnualIncome ? '₹' + primary.eligibilityRules.maxAnnualIncome + '/year' : 'No income ceiling'}\n• **Target Categories:** ${(primary.eligibilityRules?.allowedCategories || ['All']).join(', ')}\n• **Target Occupations:** ${(primary.eligibilityRules?.allowedOccupations || ['All eligible occupations']).join(', ')}\n\n🔗 **Official Application Portal:** ${portalUrl}\n\n*Legal Notice: Final eligibility is subject to verification by implementing government authorities.*`;
  }

  const ageStr = (primary.eligibilityRules?.minAge !== undefined || primary.eligibilityRules?.maxAge !== undefined)
    ? `Age ${primary.eligibilityRules.minAge ?? 0}–${primary.eligibilityRules.maxAge ?? 120} yrs`
    : 'All ages eligible';
  const incStr = primary.eligibilityRules?.maxAnnualIncome
    ? `Income limit: ₹${primary.eligibilityRules.maxAnnualIncome}/year`
    : 'No income ceiling specified';

  return `[Grounded Knowledge Engine • ${statusTag}]\n\n**${info.name} - Overview & Guidance:**\n\nThis welfare scheme is administered under **${info.category}** by the **${info.state}** / Central Government.\n\n• **Key Benefits:** ${info.benefits}${primary.financialBenefitAmount ? ` (Financial Support: ₹${primary.financialBenefitAmount})` : ''}\n• **Eligibility:** ${ageStr}; ${incStr}\n• **Required Documents:** ${reqDocs}\n• **How to Apply:** Apply directly via the official portal or visit your nearest Common Service Centre (CSC) / e-Sevai centre.\n\n🔗 **Official Application Portal:** ${portalUrl}\n\n*Legal Notice: Official eligibility is strictly evaluated by GovScheme's deterministic rule engine and authorized government departments.*`;
}

export const chatWithAI = async (req, res) => {
  try {
    const { message, language = 'en' } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required.' });
    }
    if (message.length > 2000) {
      return res.status(400).json({ success: false, message: 'Message exceeds maximum length of 2000 characters.' });
    }

    // Step 1: Retrieval-First Flow — Retrieve top relevant schemes from 75-scheme catalogue
    let searchResults = await performSemanticSearch(message, schemesData);
    let relevantResults = searchResults.filter(r => r.score >= RELEVANCE_THRESHOLD);

    // If semantic search score didn't cross threshold, also do a fuzzy/keyword pass
    if (relevantResults.length === 0) {
      const lowerWords = message.toLowerCase().split(/\s+/).filter(w => w.length > 2);
      const keywordMatches = schemesData.filter(s => {
        const text = `${s.name} ${s.category} ${s.state} ${s.shortDescription}`.toLowerCase();
        return lowerWords.some(w => text.includes(w));
      });
      if (keywordMatches.length > 0) {
        relevantResults = keywordMatches.slice(0, 3).map(scheme => ({ scheme, score: 0.5 }));
      }
    }

    const isGreetingOrGeneral = /^(hi|hello|hey|namaste|vanakkam|namaskaram|greetings|good\s*(morning|afternoon|evening)|who are you|how can you help|help me|what can you do|about|నమస్కారం|హలో|హాయ్|ఎవరు|வணக்கம்|ஹலோ|नमस्ते|नमस्कार|హెల్ప్|సహాయం)/i.test(message.trim()) || message.trim().length < 15;

    let topSchemes = [];
    if (relevantResults.length > 0) {
      topSchemes = relevantResults.slice(0, MAX_CONTEXT_SCHEMES).map(r => r.scheme);
    } else if (isGreetingOrGeneral || getGeminiApiKey()) {
      topSchemes = [
        schemesData.find(s => s.id === 'aicte-saksham') || schemesData[0],
        schemesData.find(s => s.id === 'pm-kisan') || schemesData[1],
        schemesData.find(s => s.id === 'ayushman-bharat') || schemesData[2]
      ].filter(Boolean);
    } else {
      const clarification = CLARIFICATIONS[language] || CLARIFICATIONS.en;
      return res.json({ success: true, reply: clarification, provider: 'catalogue_guidance' });
    }

    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      const reply = buildOfflineFallbackReply(topSchemes, 'Provider Notice: Local Execution', language, message);
      return res.json({ success: true, reply, provider: 'offline_grounded' });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const candidateModels = [
      process.env.GEMINI_MODEL,
      'gemini-flash-lite-latest',
      'gemini-3.8-flash',
      'gemini-flash-latest',
      'gemma-4-26b-a4b-it'
    ].filter(Boolean);
    
    const withTimeout = (promise, ms = 12000) => {
      return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error(`AI request timed out after ${ms}ms`)), ms))
      ]);
    };

    let reply = '';
    let usedModel = '';
    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await withTimeout(model.generateContent(buildGroundedPrompt(message, topSchemes, language)), 12000);
        reply = result.response.text();
        usedModel = modelName;
        break;
      } catch (err) {
        console.warn(`[AI Controller] Model ${modelName} failed:`, err.message);
      }
    }

    if (!reply) {
      reply = buildOfflineFallbackReply(topSchemes, 'AI Cloud Busy Fallback', language, message);
      return res.json({ success: true, reply, provider: 'offline_grounded_fallback' });
    }

    // Save history if user authenticated
    if (req.user) {
      ChatHistory.findOne({ userId: req.user._id }).then(chatRecord => {
        if (!chatRecord) chatRecord = new ChatHistory({ userId: req.user._id, messages: [] });
        chatRecord.messages.push({ role: 'user', content: message });
        chatRecord.messages.push({ role: 'assistant', content: reply });
        chatRecord.save().catch(() => {});
      }).catch(() => {});
    }

    res.json({ success: true, reply, model: usedModel });
  } catch (error) {
    console.error('[AI Chat Error]:', error.message || error);
    res.status(500).json({ success: false, message: 'AI chat service encountered an error. Please try again.' });
  }
};

export const streamChatWithAI = async (req, res) => {
  try {
    const { message, language = 'en' } = req.body;
    const userId = req.user ? req.user._id : 'guest';

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message text is required.' });
    }
    if (message.length > 2000) {
      return res.status(400).json({ success: false, message: 'Message exceeds maximum length of 2000 characters.' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    if (res.flushHeaders) res.flushHeaders(); 

    // Step 1: Retrieval-First Flow
    let searchResults = await performSemanticSearch(message, schemesData);
    let relevantResults = searchResults.filter(r => r.score >= RELEVANCE_THRESHOLD);

    if (relevantResults.length === 0) {
      const lowerWords = message.toLowerCase().split(/\s+/).filter(w => w.length > 2);
      const keywordMatches = schemesData.filter(s => {
        const text = `${s.name} ${s.category} ${s.state} ${s.shortDescription}`.toLowerCase();
        return lowerWords.some(w => text.includes(w));
      });
      if (keywordMatches.length > 0) {
        relevantResults = keywordMatches.slice(0, 3).map(scheme => ({ scheme, score: 0.5 }));
      }
    }

    const isGreetingOrGeneral = /^(hi|hello|hey|namaste|vanakkam|namaskaram|greetings|good\s*(morning|afternoon|evening)|who are you|how can you help|help me|what can you do|about|నమస్కారం|హలో|హాయ్|ఎవరు|வணக்கம்|ஹலோ|नमस्ते|नमस्कार|హెల్ప్|సహాయం)/i.test(message.trim()) || message.trim().length < 15;

    let topSchemes = [];
    if (relevantResults.length > 0) {
      topSchemes = relevantResults.slice(0, MAX_CONTEXT_SCHEMES).map(r => r.scheme);
    } else if (isGreetingOrGeneral || getGeminiApiKey()) {
      topSchemes = [
        schemesData.find(s => s.id === 'aicte-saksham') || schemesData[0],
        schemesData.find(s => s.id === 'pm-kisan') || schemesData[1],
        schemesData.find(s => s.id === 'ayushman-bharat') || schemesData[2]
      ].filter(Boolean);
    } else {
      const clarification = CLARIFICATIONS[language] || CLARIFICATIONS.en;
      res.write(`data: ${JSON.stringify({ text: clarification })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      return res.end();
    }

    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      const fallbackReply = buildOfflineFallbackReply(topSchemes, 'Provider Notice: Local Execution', language, message);
      res.write(`data: ${JSON.stringify({ text: fallbackReply })}\n\n`);
      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      return res.end();
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const candidateModels = [
      process.env.GEMINI_MODEL,
      'gemini-flash-lite-latest',
      'gemini-3.8-flash',
      'gemini-flash-latest',
      'gemma-4-26b-a4b-it'
    ].filter(Boolean);
    
    let streamSuccess = false;
    let fullResponse = "";

    const withTimeout = (promise, ms = 12000) => {
      return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error(`AI stream request timed out after ${ms}ms`)), ms))
      ]);
    };

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await withTimeout(model.generateContentStream(buildGroundedPrompt(message, topSchemes, language)), 12000);

        for await (const chunk of result.stream) {
          const chunkText = chunk.text();
          fullResponse += chunkText;
          res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
        }
        streamSuccess = true;
        break;
      } catch (err) {
        console.warn(`[AI Stream] Model ${modelName} stream error:`, err.message);
      }
    }

    if (!streamSuccess) {
      const fallbackReply = buildOfflineFallbackReply(topSchemes, 'AI Cloud Stream Busy Fallback', language, message);
      res.write(`data: ${JSON.stringify({ text: fallbackReply })}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
    
    // Save history in background
    if (userId !== 'guest' && fullResponse) {
      ChatHistory.findOne({ userId }).then(chatRecord => {
        if (!chatRecord) chatRecord = new ChatHistory({ userId, messages: [] });
        chatRecord.messages.push({ role: 'user', content: message });
        chatRecord.messages.push({ role: 'assistant', content: fullResponse });
        chatRecord.save().catch(() => {});
      }).catch(() => {});
    }

  } catch (error) {
    console.error('[AI Stream Error]:', error.message || error);
    res.write(`data: ${JSON.stringify({ error: "Failed to communicate with AI model. Please try again." })}\n\n`);
    res.end();
  }
};

export const streamTTSAudio = async (req, res) => {
  try {
    const { text, lang = 'en' } = req.query;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Text query parameter is required.' });
    }

    const cleanText = text.slice(0, 300).trim();
    const targetLang = (lang || 'en').toLowerCase().split('-')[0];
    const googleTTSUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(targetLang)}&client=tw-ob&q=${encodeURIComponent(cleanText)}`;

    const response = await fetch(googleTTSUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com/'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ success: false, message: 'Upstream TTS service error' });
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.end(buffer);
  } catch (error) {
    console.error('[TTS Audio Error]:', error.message || error);
    res.status(500).json({ success: false, message: 'Failed to stream TTS audio.' });
  }
};
