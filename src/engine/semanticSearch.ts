import type { Scheme } from '../types/index.ts';
import { SCHEME_LOCALIZED_NAMES } from '../data/schemeTranslations.ts';

/**
 * Regex matching characters belonging to supported scripts:
 * - Latin (English)
 * - Devanagari (Hindi, Marathi)
 * - Tamil
 * - Telugu
 * - Malayalam
 * - Gujarati
 * - Digits 0-9
 */
export const SUPPORTED_SCRIPTS_REGEX = /[a-z0-9\u0900-\u097F\u0B80-\u0BFF\u0C00-\u0C7F\u0D00-\u0D7F\u0A80-\u0AFF]/i;

// Common English, Indic, and domain-agnostic stop words & relational particles
const STOP_WORDS = new Set([
  // English stop words
  'a', 'an', 'the', 'for', 'to', 'in', 'of', 'and', 'or', 'is', 'are', 'on', 'at', 'by',
  'with', 'from', 'as', 'about', 'into', 'through', 'after', 'before', 'my', 'me', 'i',
  'we', 'our', 'you', 'your', 'he', 'she', 'it', 'they', 'them', 'who', 'which', 'what',
  'where', 'when', 'how', 'why', 'can', 'could', 'should', 'would', 'will', 'do', 'does',
  'did', 'have', 'has', 'had', 'get', 'give', 'want', 'need', 'apply', 'please', 'tell',
  'show', 'find', 'search', 'any', 'all', 'some',
  // Demonstratives and relational particles
  'this', 'that', 'these', 'those',
  // Standalone negative particles and meta-words (never meaningful standalone scheme keywords)
  'non', 'not', 'no', 'none', 'neither', 'nor', 'query', 'queries', 'existent', 'existing', 'exist', 'exists',
  'fake', 'bogus', 'hoax', 'fraud', 'fraudulent', 'scam', 'scams',

  // Hindi & Marathi particles
  'का', 'की', 'के', 'में', 'से', 'को', 'पर', 'और', 'या', 'के लिए', 'व', 'आणि', 'किंवा', 'मध्ये', 'साठी', 'आहे', 'हे', 'ती',

  // Tamil particles
  'மற்றும்', 'அல்லது', 'இல்', 'உள்ள', 'க்கான', 'ஆகிய', 'ஒரு', 'எனக்கு', 'என்', 'வேண்டும்',

  // Telugu particles
  'మరియు', 'లేదా', 'లో', 'కోసం', 'యొక్క', 'నాకు', 'ఉన్న',

  // Malayalam particles
  'ആണ്', 'ഉള്ള', 'ആയി', 'ൽ', 'വേണ്ടി', 'കൂടി', 'എനിക്ക്',

  // Gujarati particles
  'અને', 'અથવા', 'માં', 'માટે', 'નો', 'ની', 'નું', 'ના', 'છે'
]);

// Generic domain designators that citizens use across English and regional languages
const DOMAIN_DESIGNATORS = new Set([
  'scheme', 'schemes', 'yojana', 'yojna', 'sarkari', 'government', 'govt',
  'thittam', 'thittangal', 'திட்டம்', 'திட்டங்கள்', 'அரசு', 'அரசாங்கம்',
  'pathakam', 'pathakalu', 'పథకం', 'పథకాలు', 'ప్రభుత్వ',
  'paddhathi', 'paddhathikal', 'പദ്ധതി', 'പദ്ധതികൾ', 'സർക്കാർ',
  'योजना', 'योजनाएं', 'योजनाएँ', 'सरकारी', 'सरकार', 'शासन',
  'યોજના', 'યોજનાઓ', 'સરકારી', 'સરકાર'
]);

// Generic document designators that citizens use across English and regional languages
const DOCUMENT_DESIGNATORS = new Set([
  'certificate', 'certificates', 'proof', 'document', 'documents',
  'saandrithazh', 'சான்றிதழ்', 'சான்று', 'ஆவணம்',
  'patram', 'ధృవీకరణ', 'పత్రం', 'రుజువు',
  'pramanpatra', 'प्रमाणपत्र', 'प्रमाण पत्र', 'दस्तावेज', 'कागजात', 'सबूत',
  'સર્ટિફિકેટ', 'પુરાવો', 'પ્રમાણપત્ર', 'દસ્તાવેજ',
  'സർട്ടിഫിക്കറ്റ്', 'രേഖ'
]);

// Flagship authentic central schemes with verified portals & helplines used for fraud-awareness guidance
const AUTHENTIC_REFERENCE_IDS = ['pm-kisan', 'pmjay-ayushman', 'post-matric-scholarship', 'udid-disability-scheme'];

/**
 * Detects whether a query is a legitimate citizen fraud-awareness, website verification,
 * or scam-reporting query across English, Romanized Indic, and regional scripts.
 */
function isFraudAwarenessQuery(normalized: string): boolean {
  return (
    // English
    /\b(?:how\s+(?:can\s+i|do\s+i|to)|identify|spot|recognize|distinguish|detect|tell\s+if|know\s+if)\b.*\b(?:fake|fraud|fraudulent|scam|bogus|genuine|authentic)\b/i.test(normalized) ||
    /\b(?:how\s+(?:can\s+i|do\s+i|to)|where\s+(?:can\s+i|do\s+i|to)|report|complain|complaint|grievance|helpline)\b.*\b(?:fake|fraud|fraudulent|scam|bogus)\b/i.test(normalized) ||
    /\b(?:is\s+(?:this|it)|are\s+these|check|verify|genuine|authentic|official)\b.*\b(?:website|portal|link|url|site|call|sms|message)\b/i.test(normalized) ||
    /\b(?:is\s+(?:this|it)|are\s+these)\b.*\b(?:fake|scam|fraudulent|bogus)\b/i.test(normalized) ||
    /\b(?:fake|fraudulent|scam)\b.*\b(?:website|portal|link|url)\b/i.test(normalized) ||
    // Romanized Indic (farzi / nakli / complaint)
    /\b(?:kya\s+yeh|kaise\s+pehchane|report\s+kare)\b.*\b(?:farzi|nakli|scam)\b/i.test(normalized) ||
    /\b(?:farzi|nakli)\s+(?:yojana|portal|website)\b/i.test(normalized) ||
    // Devanagari (Hindi / Marathi)
    /(?:नकली|फर्जी|धोखाधड़ी|बोगस).*(?:पहचान|शिकायत|हेल्पलाइन|वेबसाइट|पोर्टल|जांच)/u.test(normalized) ||
    /(?:पहचान|शिकायत|हेल्पलाइन|वेबसाइट|पोर्टल|जांच).*(?:नकली|फर्जी|धोखाधड़ी)/u.test(normalized) ||
    // Tamil
    /(?:போலி|மோசடி).*(?:கண்டறிவது|புகார்|உதவி|இணையதளம்|சரிபார்ப்பது)/u.test(normalized) ||
    // Telugu
    /(?:నకిలీ|మోసం).*(?:గుర్తించడం|ఫిర్యాదు|వెబ్‌సైట్|పోర్టల్)/u.test(normalized)
  );
}

/**
 * Detects whether a query is an explicit request to find or list fake or nonexistent schemes.
 */
function isExplicitNonexistentQuery(normalized: string): boolean {
  // Explicit commands asking to show, list, find, or search fake/nonexistent schemes
  if (/\b(?:show|find|list|search|give|get|display)\b.*\b(?:fake|bogus|non[-\s]?existent|farzi|nakli|poli|nakili)\b.*\b(?:scheme|schemes|yojana|yojanas|thittam|pathakam)\b/i.test(normalized)) {
    return true;
  }
  // "fake schemes that do not exist", "schemes that do not exist"
  if (/\b(?:fake|bogus|non[-\s]?existent|farzi|nakli|poli)?\s*(?:schemes?|yojanas?|thittam|pathakam)\s+(?:that|which)?\s*(?:do\s+not\s+exist|dont\s+exist|does\s+not\s+exist|illatha|leni)\b/i.test(normalized)) {
    return true;
  }
  // Generic standalone nonexistent markers
  if (/\bnon[-\s]?existent\b/i.test(normalized) || /\bnon[-\s]?existing\b/i.test(normalized)) {
    return true;
  }
  // Fake scheme with fictitious name (e.g. "fake scheme xyz", "bogus scheme abc", "farzi yojana xyz")
  if (/\b(?:fake|bogus|farzi|nakli|poli)\s+(?:scheme|yojana|thittam|pathakam)\s+[a-z0-9_-]+/i.test(normalized)) {
    return true;
  }
  // Pure "fake scheme", "fake schemes", "fake yojana", "farzi yojana", "போலி திட்டம்", "फर्जी योजना"
  if (/^(?:fake|bogus|farzi|nakli|poli)\s+(?:scheme|schemes|yojana|yojanas|thittam|pathakam)$/i.test(normalized) ||
      /^(?:फर्जी|नकली)\s*(?:योजना|स्कीम)$/u.test(normalized) ||
      /^(?:போலி)\s*(?:திட்டம்)$/u.test(normalized) ||
      /^(?:నకిలీ)\s*(?:పథకం|పథకాలు)$/u.test(normalized) ||
      /^(?:વ્યાજ)\s*(?:പദ്ധതി)$/u.test(normalized)) {
    return true;
  }
  // "fake PM-KISAN" or "fake loan" or "farzi kisan"
  if (/^(?:fake|farzi|nakli)\s+[a-z0-9_-]+$/i.test(normalized)) {
    return true;
  }
  return false;
}

// Action words used in fraud inquiry/reporting that should not be matched as scheme eligibility keywords
const FRAUD_AWARENESS_ACTION_WORDS = new Set([
  'report', 'reporting', 'identify', 'identifying', 'spot', 'spotting', 'check', 'checking',
  'verify', 'verifying', 'tell', 'know', 'detect', 'detecting', 'recognize', 'recognizing'
]);

// Meaningful multi-word compounds to canonicalize before token extraction
const COMPOUND_CANONICALIZATIONS: [RegExp, string][] = [
  [/\bnon\s+creamy\b/gi, 'non-creamy'],
  [/\bnon\s+farm\b/gi, 'non-farm'],
  [/\bpost\s+matric\b/gi, 'post-matric'],
  [/\bpre\s+matric\b/gi, 'pre-matric'],
  [/\bpm\s+kisan\b/gi, 'pm-kisan'],
  [/\bpm\s+jay\b/gi, 'pm-jay'],
  [/\bpm\s+mudra\b/gi, 'pm-mudra'],
  [/\bpm\s+svanidhi\b/gi, 'pm-svanidhi'],
  [/\bpm\s+ujjwala\b/gi, 'pm-ujjwala'],
  [/\bpm\s+vishwakarma\b/gi, 'pm-vishwakarma'],
  [/\bpm\s+fasal\b/gi, 'pm-fasal'],
  [/\bold\s+age\b/gi, 'old-age'],
  [/\bself\s+employed\b/gi, 'self-employed'],
  [/\bstand\s+up\b/gi, 'stand-up'],
  // Regional script compound canonicalizations
  [/(?:पीएम|पी\s*एम)\s*किसान/gu, 'पीएम-किसान'],
  [/(?:பிரதான்\s*மந்திரி|பி\s*எம்)\s*கிசான்/gu, 'பிஎம்-கிசான்'],
  [/(?:ప్రధాన\s*మంత్రి|పి\s*ఎం)\s*కిసాన్/gu, 'పిఎం-కిసాన్'],
  [/(?:പ്രധാൻ\s*മന്ത്രി|പി\s*എം)\s*കിസാൻ/gu, 'പിഎം-കിസാൻ'],
  [/(?:પ્રધાનમંત્રી|પી\s*એમ)\s*કિસાન/gu, 'પીએમ-કિસાન'],
  [/புதுமை\s*பெண்/gu, 'புதுமைப்-பெண்'],
  [/புதுமைப்\s*பெண்/gu, 'புதுமைப்-பெண்'],
  [/ஆயுஷ்மான்\s*பாரத்/gu, 'ஆயுஷ்மான்-பாரத்'],
  [/आयुष्मान\s*भारत/gu, 'आयुष्मान-भारत'],
  [/రైతు\s*బంధు/gu, 'రైతు-బంధు']
];

// Carefully curated domain synonym and cross-lingual expansion for Indian government welfare schemes
const SYNONYM_MAP: Record<string, string[]> = {
  // Farmer / Agriculture
  farmer: ['agriculture', 'kisan', 'farming', 'crop', 'crops', 'cultivator', 'krishi', 'subsidy', 'fertilizer', 'rythu'],
  farmers: ['agriculture', 'kisan', 'farming', 'crop', 'crops', 'cultivator', 'krishi', 'subsidy'],
  agriculture: ['farmer', 'kisan', 'farming', 'crop', 'crops', 'cultivator', 'krishi'],
  kisan: ['farmer', 'agriculture', 'farming', 'crop', 'cultivator', 'krishi', 'pm-kisan'],
  krishi: ['farmer', 'agriculture', 'kisan', 'farming'],
  crop: ['farmer', 'agriculture', 'kisan', 'harvest', 'fasal', 'bima'],
  crops: ['farmer', 'agriculture', 'kisan', 'harvest', 'fasal', 'bima'],
  subsidy: ['assistance', 'grant', 'aid', 'financial', 'subsidy', 'discount'],

  // Farmer Transliterations & Regional scripts
  vivasaayi: ['farmer', 'agriculture', 'kisan', 'farming', 'crop', 'pm-kisan'],
  vivasayi: ['farmer', 'agriculture', 'kisan', 'farming', 'crop', 'pm-kisan'],
  vivasayam: ['agriculture', 'farmer', 'kisan', 'farming', 'crop', 'pm-kisan'],
  velanmai: ['agriculture', 'farmer', 'farming', 'crop'],
  rythu: ['farmer', 'agriculture', 'kisan', 'farming', 'crop', 'pm-kisan'],
  karshakan: ['farmer', 'agriculture', 'kisan', 'farming', 'crop', 'pm-kisan'],
  shethkari: ['farmer', 'agriculture', 'kisan', 'farming', 'crop', 'pm-kisan'],
  shetkari: ['farmer', 'agriculture', 'kisan', 'farming', 'crop', 'pm-kisan'],
  khedut: ['farmer', 'agriculture', 'kisan', 'farming', 'crop', 'pm-kisan'],
  kheti: ['agriculture', 'farmer', 'farming', 'crop'],

  // Native script terms for Agriculture
  'किसान': ['farmer', 'agriculture', 'kisan', 'farming', 'crop', 'krishi', 'pm-kisan'],
  'कृषि': ['farmer', 'agriculture', 'kisan', 'farming', 'crop', 'krishi'],
  'खेती': ['agriculture', 'farmer', 'kisan', 'farming'],
  'फसल': ['crop', 'farmer', 'agriculture', 'kisan', 'fasal', 'bima'],
  'शेतकरी': ['farmer', 'agriculture', 'kisan', 'farming', 'crop', 'pm-kisan'],
  'விவசாயி': ['farmer', 'agriculture', 'kisan', 'farming', 'crop', 'pm-kisan'],
  'விவசாயம்': ['agriculture', 'farmer', 'kisan', 'farming', 'crop', 'pm-kisan'],
  'வேளாண்மை': ['agriculture', 'farmer', 'farming', 'crop'],
  'பயிர்': ['crop', 'farmer', 'agriculture'],
  'రైతు': ['farmer', 'agriculture', 'kisan', 'farming', 'crop', 'pm-kisan'],
  'వ్యవసాయం': ['agriculture', 'farmer', 'kisan', 'farming', 'crop', 'pm-kisan'],
  'పంట': ['crop', 'farmer', 'agriculture'],
  'കർഷകൻ': ['farmer', 'agriculture', 'kisan', 'farming', 'crop', 'pm-kisan'],
  'കൃഷി': ['farmer', 'agriculture', 'kisan', 'farming', 'crop', 'pm-kisan'],
  'വിള': ['crop', 'farmer', 'agriculture'],
  'ખેડૂત': ['farmer', 'agriculture', 'kisan', 'farming', 'crop', 'pm-kisan'],
  'ખેતી': ['agriculture', 'farmer', 'farming', 'crop'],
  'પાક': ['crop', 'farmer', 'agriculture'],

  // Student / Scholarship / Education
  student: ['scholarship', 'education', 'school', 'college', 'tuition', 'matric', 'post-matric', 'study', 'fellowship', 'stipend', 'vidya', 'shiksha'],
  students: ['scholarship', 'education', 'school', 'college', 'tuition', 'matric', 'study', 'fellowship'],
  scholarship: ['student', 'education', 'fellowship', 'stipend', 'tuition', 'matric', 'vidya', 'shiksha'],
  education: ['student', 'scholarship', 'school', 'college', 'university', 'tuition', 'vidya', 'shiksha'],
  school: ['education', 'student', 'scholarship', 'shiksha'],
  college: ['higher education', 'student', 'scholarship', 'degree', 'post-matric'],

  // Education Transliterations
  kalvi: ['education', 'student', 'scholarship', 'post-matric', 'school', 'college'],
  udavithogai: ['scholarship', 'student', 'education', 'grant', 'stipend'],
  manavar: ['student', 'students', 'scholarship', 'education'],
  padippu: ['education', 'student', 'study'],
  chaduvu: ['education', 'student', 'scholarship', 'study'],
  vidyarthi: ['student', 'scholarship', 'education', 'matric', 'post-matric'],
  shiksha: ['education', 'student', 'scholarship', 'school'],
  vidya: ['education', 'student', 'scholarship'],
  shikshan: ['education', 'student', 'scholarship'],
  chhatravritti: ['scholarship', 'student', 'education', 'post-matric'],
  shishyavrutti: ['scholarship', 'student', 'education', 'post-matric'],
  bhanatar: ['education', 'student', 'scholarship'],

  // Native script terms for Education
  'छात्र': ['student', 'scholarship', 'education', 'matric', 'post-matric'],
  'छात्रवृत्ति': ['scholarship', 'student', 'education', 'post-matric', 'fellowship'],
  'शिक्षा': ['education', 'student', 'scholarship', 'school', 'college'],
  'विद्या': ['education', 'student', 'scholarship'],
  'विद्यार्थी': ['student', 'scholarship', 'education', 'post-matric'],
  'மாணவர்': ['student', 'scholarship', 'education', 'post-matric'],
  'கல்வி': ['education', 'student', 'scholarship', 'school', 'college'],
  'உதவித்தொகை': ['scholarship', 'student', 'education', 'stipend', 'grant'],
  'படிப்பு': ['education', 'student', 'scholarship'],
  'విద్యార్థి': ['student', 'scholarship', 'education', 'post-matric'],
  'స్కాలర్‌షిప్': ['scholarship', 'student', 'education', 'post-matric'],
  'చదువు': ['education', 'student', 'scholarship', 'study'],
  'വിദ്യാർത്ഥി': ['student', 'scholarship', 'education', 'post-matric'],
  'സ്കോളർഷിപ്പ്': ['scholarship', 'student', 'education', 'post-matric'],
  'വിദ്യാഭ്യാസം': ['education', 'student', 'scholarship'],
  'शिष्यवृत्ती': ['scholarship', 'student', 'education', 'post-matric'],
  'शिक्षण': ['education', 'student', 'scholarship'],
  'વિદ્યાર્થી': ['student', 'scholarship', 'education', 'post-matric'],
  'શિષ્યવૃત્તિ': ['scholarship', 'student', 'education', 'post-matric'],

  // Pension / Senior / Elderly
  pension: ['senior', 'elderly', 'old age', 'vridha', 'retirement', 'atal pension', 'apy', 'oap', 'ignoaps'],
  senior: ['pension', 'elderly', 'old age', 'vridha', 'aging'],
  elderly: ['pension', 'senior', 'old age', 'vridha'],
  retirement: ['pension', 'senior', 'provident', 'superannuation'],

  // Pension Transliterations
  vridha: ['pension', 'senior', 'elderly', 'old-age', 'ignoaps'],
  bujurg: ['senior', 'elderly', 'pension', 'old-age'],
  mudiyore: ['pension', 'senior', 'elderly', 'old-age', 'ignoaps'],
  muthiyor: ['pension', 'senior', 'elderly', 'old-age', 'ignoaps'],
  oyvudhiyam: ['pension', 'senior', 'elderly', 'old-age', 'ignoaps'],
  vriddhapya: ['pension', 'senior', 'elderly', 'old-age', 'ignoaps'],
  vruddh: ['pension', 'senior', 'elderly', 'old-age'],
  vadil: ['senior', 'elderly', 'pension'],

  // Native script terms for Pension
  'पेंशन': ['pension', 'senior', 'elderly', 'old-age', 'ignoaps', 'retirement'],
  'वृद्ध': ['pension', 'senior', 'elderly', 'old-age', 'ignoaps'],
  'बुजुर्ग': ['pension', 'senior', 'elderly', 'old-age'],
  'ஓய்வூதியம்': ['pension', 'senior', 'elderly', 'old-age', 'ignoaps', 'retirement'],
  'முதியோர்': ['pension', 'senior', 'elderly', 'old-age', 'ignoaps'],
  'முதியவர்': ['pension', 'senior', 'elderly', 'old-age'],
  'பென்ஷன்': ['pension', 'senior', 'elderly', 'old-age', 'ignoaps'],
  'పెన్షన్': ['pension', 'senior', 'elderly', 'old-age', 'ignoaps'],
  'వృద్ధాప్య': ['pension', 'senior', 'elderly', 'old-age', 'ignoaps'],
  'వృద్ధులు': ['pension', 'senior', 'elderly', 'old-age'],
  'പെൻഷൻ': ['pension', 'senior', 'elderly', 'old-age', 'ignoaps'],
  'വാർദ്ധക്യ': ['pension', 'senior', 'elderly', 'old-age'],
  'पेन्शन': ['pension', 'senior', 'elderly', 'old-age', 'ignoaps'],
  'પેન્શન': ['pension', 'senior', 'elderly', 'old-age', 'ignoaps'],
  'વૃદ્ધ': ['pension', 'senior', 'elderly', 'old-age'],
  'વડીલ': ['pension', 'senior', 'elderly'],

  // Disability / Divyang
  disability: ['disabled', 'divyang', 'handicapped', 'pwd', 'special need', 'impairment', 'prosthetic', 'wheelchair', 'assistive', 'udid'],
  disabled: ['disability', 'divyang', 'handicapped', 'pwd'],
  divyang: ['disability', 'disabled', 'pwd', 'handicapped', 'udid'],
  pwd: ['disability', 'disabled', 'divyang'],

  // Disability Transliterations
  viklang: ['disability', 'disabled', 'divyang', 'handicapped', 'pwd', 'udid'],
  apang: ['disability', 'disabled', 'divyang', 'pwd'],
  matruthirnaali: ['disability', 'disabled', 'divyang', 'pwd', 'udid'],
  matruthanali: ['disability', 'disabled', 'divyang', 'pwd', 'udid'],
  oonam: ['disability', 'disabled', 'pwd'],
  vaikalyam: ['disability', 'disabled', 'pwd'],
  binnaseshi: ['disability', 'disabled', 'divyang', 'pwd', 'udid'],

  // Native script terms for Disability
  'दिव्यांग': ['disability', 'disabled', 'divyang', 'handicapped', 'pwd', 'udid'],
  'विकलांग': ['disability', 'disabled', 'divyang', 'handicapped', 'pwd'],
  'अपंग': ['disability', 'disabled', 'divyang', 'pwd'],
  'மாற்றுத்திறனாளி': ['disability', 'disabled', 'divyang', 'pwd', 'udid'],
  'ஊனம்': ['disability', 'disabled', 'pwd'],
  'దివ్యాంగులు': ['disability', 'disabled', 'divyang', 'pwd', 'udid'],
  'వైకల్యం': ['disability', 'disabled', 'pwd'],
  'ഭിന്നശേഷി': ['disability', 'disabled', 'divyang', 'pwd', 'udid'],
  'വികലാംഗ': ['disability', 'disabled', 'pwd'],
  'દિવ્યાંગ': ['disability', 'disabled', 'divyang', 'pwd', 'udid'],
  'વિકલાંગ': ['disability', 'disabled', 'pwd'],

  // Housing / Shelter
  housing: ['house', 'home', 'shelter', 'awas', 'pmay', 'pucca', 'residential', 'slum', 'flat', 'allotment'],
  house: ['housing', 'home', 'shelter', 'awas', 'pmay'],
  home: ['housing', 'house', 'shelter', 'awas'],
  awas: ['housing', 'house', 'shelter', 'pmay'],
  shelter: ['housing', 'house', 'home', 'residence'],

  // Housing Transliterations
  veedu: ['housing', 'house', 'shelter', 'pmay', 'awas'],
  kudisai: ['housing', 'house', 'shelter'],
  illu: ['housing', 'house', 'shelter', 'pmay', 'awas'],
  ghar: ['housing', 'house', 'shelter', 'pmay', 'awas'],
  makan: ['housing', 'house', 'shelter', 'awas'],
  gruha: ['housing', 'house', 'shelter', 'awas'],

  // Native script terms for Housing
  'आवास': ['housing', 'house', 'shelter', 'pmay', 'pucca'],
  'घर': ['housing', 'house', 'shelter', 'awas', 'pmay'],
  'मकान': ['housing', 'house', 'shelter', 'awas'],
  'வீடு': ['housing', 'house', 'shelter', 'awas', 'pmay'],
  'குடியிருப்பு': ['housing', 'house', 'shelter', 'residential'],
  'ఇల్లు': ['housing', 'house', 'shelter', 'awas', 'pmay'],
  'గృహ': ['housing', 'house', 'shelter', 'awas'],
  'ഭവനം': ['housing', 'house', 'shelter', 'awas'],
  'આવાસ': ['housing', 'house', 'shelter', 'pmay'],

  // Health / Medical
  health: ['healthcare', 'medical', 'hospital', 'treatment', 'ayushman', 'pmjay', 'insurance', 'medicine', 'arogya', 'swasthya'],
  healthcare: ['health', 'medical', 'hospital', 'insurance', 'ayushman', 'pmjay', 'treatment'],
  medical: ['health', 'healthcare', 'hospital', 'treatment', 'doctor', 'clinic', 'ayushman'],
  hospital: ['health', 'medical', 'treatment', 'ayushman', 'pmjay'],
  insurance: ['health', 'bima', 'suraksha', 'ayushman', 'coverage'],

  // Health Transliterations
  arogya: ['health', 'healthcare', 'medical', 'hospital', 'ayushman', 'pmjay'],
  swasthya: ['health', 'healthcare', 'medical', 'ayushman'],
  maruthuvam: ['health', 'healthcare', 'medical', 'hospital', 'cmchis', 'ayushman'],
  vaidya: ['health', 'medical', 'treatment'],
  bima: ['insurance', 'health', 'suraksha', 'ayushman'],
  beema: ['insurance', 'health', 'suraksha', 'ayushman'],

  // Native script terms for Health
  'स्वास्थ्य': ['health', 'healthcare', 'medical', 'hospital', 'ayushman', 'pmjay', 'treatment'],
  'आरोग्य': ['health', 'healthcare', 'medical', 'hospital', 'ayushman', 'arogya'],
  'आयुष्मान': ['ayushman', 'health', 'healthcare', 'medical', 'pmjay', 'insurance'],
  'चिकित्सा': ['health', 'healthcare', 'medical', 'treatment'],
  'अस्पताल': ['health', 'hospital', 'medical', 'treatment'],
  'बीमा': ['insurance', 'bima', 'suraksha', 'ayushman'],
  'மருத்துவம்': ['health', 'healthcare', 'medical', 'hospital', 'treatment', 'ayushman'],
  'சுகாதாரம்': ['health', 'healthcare', 'hygiene', 'medical'],
  'மருத்துவமனை': ['health', 'hospital', 'medical'],
  'காப்பீடு': ['insurance', 'bima', 'ayushman', 'coverage'],
  'ஆயுஷ்மான்': ['ayushman', 'health', 'healthcare', 'medical', 'pmjay'],
  'వైద్య': ['health', 'medical', 'healthcare', 'hospital'],
  'చికిత్స': ['health', 'treatment', 'medical'],
  'భీమా': ['insurance', 'bima', 'ayushman'],
  'ஆரோக்கியம்': ['health', 'healthcare', 'arogya'],
  'ആശുപത്രി': ['health', 'hospital', 'medical'],
  'હોસ્પિટલ': ['health', 'hospital', 'medical'],
  'વીમો': ['insurance', 'bima', 'coverage'],

  // Women / Child / Maternity
  women: ['woman', 'female', 'girl', 'mother', 'maternity', 'mahila', 'beti', 'widow', 'sukanya', 'ladli'],
  woman: ['women', 'female', 'girl', 'mother', 'mahila'],
  female: ['women', 'woman', 'girl', 'mahila'],
  girl: ['women', 'female', 'beti', 'child', 'sukanya'],
  maternity: ['mother', 'pregnancy', 'women', 'childbirth', 'matru'],
  widow: ['women', 'destitute', 'pension'],

  // Women Transliterations
  mahila: ['women', 'woman', 'female', 'girl', 'mother'],
  pengal: ['women', 'woman', 'female', 'girl', 'magalir'],
  magalir: ['women', 'woman', 'female', 'girl', 'pengal'],
  beti: ['girl', 'female', 'women', 'child', 'sukanya'],
  stree: ['women', 'woman', 'female'],
  sthree: ['women', 'woman', 'female'],

  // Native script terms for Women
  'महिला': ['women', 'woman', 'female', 'girl', 'mother', 'mahila', 'beti'],
  'बेटी': ['women', 'female', 'girl', 'child', 'sukanya', 'beti'],
  'नारी': ['women', 'woman', 'female', 'mahila'],
  'विधवा': ['widow', 'women', 'destitute', 'pension'],
  'பெண்கள்': ['women', 'woman', 'female', 'girl', 'magalir', 'pengal'],
  'மகளிர்': ['women', 'woman', 'female', 'magalir', 'pengal'],
  'மகள்': ['girl', 'daughter', 'female', 'child', 'sukanya'],
  'விதவை': ['widow', 'women', 'pension'],
  'தாய்மை': ['maternity', 'mother', 'pregnancy', 'women'],
  'மహిళ': ['women', 'woman', 'female', 'mahila'],
  'స్త్రీ': ['women', 'woman', 'female', 'stree'],
  'తల్లి': ['mother', 'maternity', 'women'],
  'వితంతువు': ['widow', 'women', 'pension'],
  'സ്ത്രീകൾ': ['women', 'woman', 'female', 'vanitha'],
  'വനിത': ['women', 'woman', 'female', 'vanitha'],
  'દીકરી': ['girl', 'daughter', 'female', 'child', 'sukanya'],

  // Employment / Jobs / Micro Enterprise
  job: ['employment', 'work', 'unemployed', 'rozhgar', 'mgnrega', 'nrega', 'livelihood', 'skill', 'training'],
  jobs: ['employment', 'work', 'unemployed', 'rozhgar', 'mgnrega', 'nrega'],
  employment: ['job', 'work', 'unemployed', 'rozhgar', 'livelihood', 'skill', 'mgnrega'],
  work: ['employment', 'job', 'labor', 'shramik', 'mgnrega'],
  loan: ['credit', 'business', 'mudra', 'startup', 'finance', 'subsidy', 'microfinance', 'svanidhi'],
  business: ['loan', 'credit', 'enterprise', 'msme', 'mudra', 'startup', 'entrepreneur'],
  vendor: ['street vendor', 'svanidhi', 'loan', 'hawker', 'micro credit'],

  // Employment Transliterations
  rozhgar: ['job', 'jobs', 'employment', 'work', 'mgnrega', 'nrega'],
  rojgar: ['job', 'jobs', 'employment', 'work', 'mgnrega', 'nrega'],
  velai: ['job', 'jobs', 'employment', 'work', 'mgnrega'],
  thozhil: ['business', 'employment', 'work', 'enterprise', 'mudra', 'loan'],
  kadan: ['loan', 'credit', 'finance', 'mudra', 'svanidhi'],
  udhyogam: ['job', 'jobs', 'employment', 'work'],
  vyapar: ['business', 'enterprise', 'trade', 'mudra', 'loan'],

  // Native script terms for Employment
  'रोजगार': ['job', 'jobs', 'employment', 'work', 'unemployed', 'rozhgar', 'mgnrega', 'nrega'],
  'व्यापार': ['business', 'enterprise', 'msme', 'mudra', 'loan', 'credit'],
  'ऋण': ['loan', 'credit', 'finance', 'subsidy', 'mudra'],
  'लोन': ['loan', 'credit', 'business', 'mudra', 'finance'],
  'श्रमिक': ['work', 'labor', 'employment', 'mgnrega', 'shramik'],
  'उद्योग': ['business', 'enterprise', 'industry', 'msme', 'mudra'],
  'வேலை': ['job', 'jobs', 'employment', 'work', 'velai', 'mgnrega'],
  'தொழில்': ['business', 'employment', 'work', 'thozhil', 'enterprise', 'mudra'],
  'கடன்': ['loan', 'credit', 'finance', 'kadan', 'mudra'],
  'உద్యోగం': ['job', 'jobs', 'employment', 'work', 'udhyogam'],
  'వ్యాపారం': ['business', 'enterprise', 'trade', 'vyaparam', 'mudra'],
  'రుణం': ['loan', 'credit', 'finance', 'runam', 'mudra'],
  'തൊഴിൽ': ['job', 'employment', 'work', 'business', 'thozhil'],
  'വായ്പ': ['loan', 'credit', 'finance', 'vaaypa', 'mudra'],
  'રોજગાર': ['job', 'employment', 'work', 'rojgar'],
  'વેપાર': ['business', 'enterprise', 'trade', 'mudra'],
  'ધિરાણ': ['loan', 'credit', 'finance'],

  // State Names & Regional Variants
  'tamil nadu': ['tamil nadu', 'tamilnadu', 'tn', 'தமிழ்நாடு', 'तमिलनाडु', 'తమిళనాడు', 'തമിഴ്‌നാട്', 'તમિલનાડુ', 'तमिळनाडू'],
  'tamilnadu': ['tamil nadu', 'tamilnadu', 'tn'],
  'தமிழ்நாடு': ['tamil nadu', 'tamilnadu', 'tn'],
  'तमिलनाडु': ['tamil nadu', 'tamilnadu', 'tn'],
  'తమిళనాడు': ['tamil nadu', 'tamilnadu', 'tn'],
  'തമിഴ്‌നാട്': ['tamil nadu', 'tamilnadu', 'tn'],
  'તમિલનાડુ': ['tamil nadu', 'tamilnadu', 'tn'],
  'तमिळनाडू': ['tamil nadu', 'tamilnadu', 'tn'],

  'uttar pradesh': ['uttar pradesh', 'up', 'उत्तर प्रदेश', 'உத்தரப் பிரதேசம்', 'ఉత్తర ప్రదేశ్', 'ഉത്തർ പ്രദേശ്', 'ઉત્તર પ્રદેશ'],
  'उत्तर प्रदेश': ['uttar pradesh', 'up'],
  'உத்தரப் பிரதேசம்': ['uttar pradesh', 'up'],

  'karnataka': ['karnataka', 'ಕರ್ನಾಟಕ', 'கர்நாடகா', 'కర్ణాటక', 'കർണാടക', 'કર્ણાટક', 'कर्नाटक'],
  'கர்நாடகா': ['karnataka'],
  'కర్ణాటక': ['karnataka'],
  'ಕರ್ನಾಟಕ': ['karnataka'],
  'കർണാടക': ['karnataka'],
  'કર્ણાટક': ['karnataka'],
  'कर्नाटक': ['karnataka'],

  'telangana': ['telangana', 'తెలంగాణ', 'தெலுங்கானா', 'തെലങ്കാന', 'તેલંગાણા', 'तेलंगाना'],
  'తెలంగాణ': ['telangana'],
  'தெலுங்கானா': ['telangana'],
  'तेलंगाना': ['telangana'],
  'തെലങ്കാന': ['telangana'],
  'તેલંગાણા': ['telangana']
};

/**
 * Normalizes text by applying Unicode NFKC normalization, lowercasing,
 * preserving letters (\p{L}), combining marks (\p{M}), numbers (\p{N}), whitespace (\s),
 * and hyphens (-), and canonicalizing compound terms.
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  let norm = text
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\s-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  for (const [pattern, replacement] of COMPOUND_CANONICALIZATIONS) {
    norm = norm.replace(pattern, replacement);
  }

  return norm;
}

/**
 * Detects negative state/location modifiers across English, Romanized Indic,
 * and regional scripts (e.g. "not available in Tamil Nadu", "தமிழ்நாட்டில் இல்லாத", "तमिलनाडु के बाहर").
 */
function extractNegativeState(normalized: string): string | null {
  // English & Romanized patterns
  const match = normalized.match(/\b(?:not\s+available\s+in|not\s+in|outside|other\s+than)\s+([a-z\s]+?)(?:\s+state|\s+district|\s+region|$)/i);
  if (match) {
    const candidate = match[1].trim();
    if (candidate.includes('tamil nadu') || candidate.includes('tamilnadu') || candidate === 'tn') return 'tamil nadu';
    if (candidate.includes('uttar pradesh') || candidate === 'up') return 'uttar pradesh';
    if (candidate.includes('telangana')) return 'telangana';
    if (candidate.includes('karnataka')) return 'karnataka';
  }

  // Tamil: "தமிழ்நாட்டில் இல்லாத", "தமிழ்நாடு தவிர"
  if (/தமிழ்நா(?:ட்டில்\s*இல்லாத|டு\s*தவிர)/u.test(normalized) || /tamil\s*nadu\s*il\s*illatha/i.test(normalized)) {
    return 'tamil nadu';
  }
  // Hindi: "तमिलनाडु के बाहर", "तमिलनाडु में उपलब्ध नहीं"
  if (/तमिलनाडु\s*(?:के\s*बाहर|में\s*नहीं|में\s*उपलब्ध\s*नहीं)/u.test(normalized)) {
    return 'tamil nadu';
  }
  if (/उत्तर\s*प्रदेश\s*(?:के\s*बाहर|में\s*नहीं)/u.test(normalized) || /up\s*(?:ke\s*bahar|me\s*nahi)/i.test(normalized)) {
    return 'uttar pradesh';
  }
  if (/कर्नाटक\s*(?:के\s*बाहर|में\s*नहीं)/u.test(normalized)) {
    return 'karnataka';
  }
  if (/తెలంగాణ\s*(?:లో\s*లేని|బయట)/u.test(normalized)) {
    return 'telangana';
  }

  return null;
}

/**
 * Detects negative document requirement modifiers across English, Romanized Indic,
 * and regional scripts (e.g. "do not require an income certificate", "வருமான சான்றிதழ் இல்லாத", "बिना आय प्रमाण पत्र").
 */
function extractNegativeDocRequirement(normalized: string): string | null {
  // English pattern
  const match = normalized.match(/\b(?:do\s+not\s+require|does\s+not\s+require|not\s+requiring|without|no)\s+(?:an?\s+)?([\w\s-]+?)(?:\s+certificate|\s+proof|\s+card|\s+doc|\s+document)?(?:\s+required)?(?:\s+scheme|\s+schemes|$)/i);
  if (match) {
    const term = match[1].trim();
    if (term.includes('income')) return 'income';
    if (term.includes('caste')) return 'caste';
    if (term.includes('aadhaar')) return 'aadhaar';
    if (term.includes('ration')) return 'ration';
    if (term.includes('land')) return 'land';
    if (term.includes('disability')) return 'disability';
    if (term.includes('domicile')) return 'domicile';
  }

  // Romanized Indic: "bina income certificate", "income certificate illatha"
  if (/\b(?:bina|illatha|avashyak\s*nahi|avashyakathe\s*illa)\b.*\bincome\b/i.test(normalized) ||
      /\bincome\b.*\b(?:bina|illatha|illai|vendaam|avashyak\s*nahi)\b/i.test(normalized)) {
    return 'income';
  }

  // Tamil: "வருமான சான்றிதழ் இல்லாத", "வருமான சான்று இல்லாமல்"
  if (/வருமான\s*(?:சான்றிதழ்|சான்று)?\s*(?:இல்லாத|இல்லாமல்)/u.test(normalized)) {
    return 'income';
  }

  // Hindi: "बिना आय प्रमाण पत्र", "आय प्रमाण पत्र की आवश्यकता नहीं"
  if (/(?:बिना\s*आय|आय\s*प्रमाण\s*पत्र\s*(?:के\s*बिना|की\s*आवश्यकता\s*नहीं|नहीं\s*चाहिए))/u.test(normalized)) {
    return 'income';
  }

  // Telugu: "ఆదాయ ధృవీకరణ పత్రం లేని", "ఆదాయ పత్రం లేకుండా"
  if (/ఆదాయ\s*(?:ధృవీకరణ\s*పత్రం|పత్రం)?\s*(?:లేని|లేకుండా)/u.test(normalized)) {
    return 'income';
  }

  // Marathi: "उत्पन्नाचा दाखला आवश्यक नाही"
  if (/उत्पन्ना(?:चा\s*दाखला)?\s*(?:आवश्यक\s*नाही|विना)/u.test(normalized)) {
    return 'income';
  }

  // Gujarati: "આવક પ્રમાણપત્ર વગર"
  if (/આવક\s*(?:પ્રમાણપત્ર)?\s*(?:વગર|જરૂરી\s*નથી)/u.test(normalized)) {
    return 'income';
  }

  return null;
}

/**
 * Safely extracts and normalizes document names from an arbitrary document list,
 * handling missing fields, null/undefined entries, and non-string types.
 */
function extractDocList(docs: unknown): string[] {
  if (!Array.isArray(docs)) return [];
  return docs
    .filter((d): d is string => typeof d === 'string')
    .map(d => d.toLowerCase().trim());
}

/**
 * Extracts substantive search tokens from normalized text, applying stop-word and designator elimination.
 * Splits on whitespace to preserve hyphenated terms (e.g. "non-creamy", "pm-kisan", "post-matric").
 */
function extractTokens(normalized: string): { substantive: string[]; domain: string[]; docDesignators: string[]; allRaw: string[] } {
  const parts = normalized.split(/\s+/).filter(t => t.length > 0);
  const substantive: string[] = [];
  const domain: string[] = [];
  const docDesignators: string[] = [];

  for (const p of parts) {
    if (DOMAIN_DESIGNATORS.has(p)) {
      domain.push(p);
    } else if (DOCUMENT_DESIGNATORS.has(p)) {
      docDesignators.push(p);
    } else if (!STOP_WORDS.has(p)) {
      // Discard single-character Latin noise, but preserve single-character Indic words if meaningful
      if (p.length > 1 || /[\u0900-\u0D7F]/.test(p)) {
        substantive.push(p);
      }
    }
  }

  return { substantive, domain, docDesignators, allRaw: parts };
}

/**
 * Checks whether a normalized field contains a token, preventing standalone
 * negative particles (such as "non") from matching inside compound terms.
 */
function fieldMatches(fieldNorm: string, token: string): boolean {
  if (!fieldNorm || !token) return false;
  if (token === 'non') return false;
  return fieldNorm.includes(token);
}

/**
 * Expands search tokens with domain and cross-lingual synonyms.
 */
function expandWithSynonyms(tokens: string[]): { primary: string[]; synonyms: string[] } {
  const primarySet = new Set(tokens);
  const synonymSet = new Set<string>();

  for (const token of tokens) {
    const list = SYNONYM_MAP[token];
    if (list) {
      for (const syn of list) {
        if (!primarySet.has(syn)) {
          synonymSet.add(syn);
        }
      }
    }
  }

  return {
    primary: Array.from(primarySet),
    synonyms: Array.from(synonymSet)
  };
}

/**
 * Deterministic, multilingual and transliteration-aware lexical search engine
 * for the 75-scheme GovScheme catalogue.
 *
 * Features:
 * - Unicode NFKC normalization and character preservation for supported scripts
 * - Safe empty handling for unsupported non-Latin scripts (e.g. Japanese, Cyrillic)
 * - Curated domain and cross-lingual transliteration dictionary
 * - Comprehensive matching across English catalogue fields AND authentic localized scheme names
 * - Negative modifier processing (location and document requirements in English & regional phrases)
 * - Negative fake/nonexistent scheme intent protection
 * - Grounded fraud-awareness guidance behavior
 * - 100% deterministic, stable tie-breaking
 */
export const performSemanticSearch = async (
  query: string,
  schemes: Scheme[]
): Promise<{ scheme: Scheme; score: number }[]> => {
  const rawTrimmed = (query || '').trim();

  // 1. Empty query returns full catalog with score 1.0 (deterministic baseline)
  if (!rawTrimmed) {
    return schemes.map(s => ({ scheme: s, score: 1.0 }));
  }

  // 2. Unsupported scripts (e.g. Japanese, Cyrillic, Arabic) safely return empty results
  if (!SUPPORTED_SCRIPTS_REGEX.test(rawTrimmed)) {
    return [];
  }

  const normalizedQuery = normalizeText(rawTrimmed);

  // 3. Explicit requests to find nonexistent or fake schemes safely return empty results
  if (isExplicitNonexistentQuery(normalizedQuery)) {
    return [];
  }

  const fraudAwareness = isFraudAwarenessQuery(normalizedQuery);

  // 4. Extract negative modifiers that alter the intent of the query
  const negativeState = extractNegativeState(normalizedQuery);
  const negativeDoc = extractNegativeDocRequirement(normalizedQuery);

  const { substantive, domain, docDesignators } = extractTokens(normalizedQuery);

  // Substantive tokens take priority over generic document designators
  const targetTokens = substantive.length > 0 ? substantive : docDesignators;

  // Filter out negative terms and fraud action words from positive token matching so they don't reward the negated attribute or match irrelevant document names
  const activeTokens = targetTokens.filter(t => {
    if (negativeState && negativeState.includes(t)) return false;
    if (negativeDoc && t.includes(negativeDoc)) return false;
    if (fraudAwareness && FRAUD_AWARENESS_ACTION_WORDS.has(t)) return false;
    return true;
  });

  // 5. Query consisting ONLY of generic stop words with no negative constraints or fraud awareness -> empty results
  if (activeTokens.length === 0 && domain.length === 0 && !negativeState && !negativeDoc && !fraudAwareness) {
    return [];
  }

  // 6. Query consisting of fraud-awareness inquiry with no specific target scheme -> return authentic reference schemes
  if (activeTokens.length === 0 && fraudAwareness) {
    const refSchemes = schemes.filter(s => AUTHENTIC_REFERENCE_IDS.includes(s.id));
    return refSchemes.map(s => ({ scheme: s, score: 0.75 }));
  }

  // 7. Query containing ONLY domain terms -> return all schemes with neutral score 0.85
  if (activeTokens.length === 0 && domain.length > 0 && !negativeState && !negativeDoc) {
    return schemes.map(s => ({ scheme: s, score: 0.85 }));
  }

  // 8. Expand substantive search terms with curated synonyms & cross-lingual equivalents
  const { primary, synonyms } = expandWithSynonyms(activeTokens);

  // 9. Score every scheme deterministically against multi-field weights (English + Localized)
  const results = schemes.map(scheme => {
    const nameNorm = normalizeText(scheme.name || '');
    const catNorm = normalizeText(scheme.category || '');
    const tagsNorm = normalizeText((scheme.tags || []).join(' '));
    const descNorm = normalizeText(`${scheme.shortDescription || ''} ${scheme.detailedDescription || ''} ${scheme.benefitsSummary || ''}`);
    const deptNorm = normalizeText(`${scheme.department || ''} ${scheme.ministry || ''}`);
    
    // Localized translated names for this scheme from the authoritative translations index
    const localizedNames = SCHEME_LOCALIZED_NAMES[scheme.id] || [];
    const localizedNormList = localizedNames.map(n => normalizeText(n));

    // Eligibility criteria fields
    const rules = scheme.eligibilityRules || {};
    const eligNorm = normalizeText([
      ...(rules.allowedOccupations || []),
      ...(rules.allowedCategories || []),
      ...(rules.allowedStates || []),
      ...(rules.requiredDocuments || []),
      rules.requiresDisability ? 'disability divyang pwd' : ''
    ].join(' '));

    let rawScore = 0;
    let hasCoreMatch = false;

    // Exact whole query match boosts across English & Localized titles
    const isExactName = (nameNorm === normalizedQuery) || localizedNormList.some(ln => ln === normalizedQuery);
    const isContainedInName = (!isExactName) && (
      nameNorm.includes(normalizedQuery) || localizedNormList.some(ln => ln.includes(normalizedQuery))
    );
    const isNameContainedInQuery = (!isExactName && !isContainedInName) && (
      normalizedQuery.includes(nameNorm) ||
      localizedNormList.some(ln => ln.length >= 4 && normalizedQuery.includes(ln))
    );

    if (isExactName) {
      rawScore += 5.0; // Perfect exact name match
      hasCoreMatch = true;
    } else if (isContainedInName) {
      rawScore += 2.5; // Complete phrase contained in name
      hasCoreMatch = true;
    } else if (isNameContainedInQuery) {
      rawScore += 2.0; // Name contained in query
      hasCoreMatch = true;
    } else if (descNorm.includes(normalizedQuery) || catNorm.includes(normalizedQuery) || eligNorm.includes(normalizedQuery)) {
      rawScore += 1.0; // Complete phrase in description/category/eligibility
      if (catNorm.includes(normalizedQuery) || eligNorm.includes(normalizedQuery)) hasCoreMatch = true;
    }

    // Direct substantive token matching across weighted fields (English + Localized)
    let directMatches = 0;
    for (const token of primary) {
      let matchedToken = false;
      if (fieldMatches(nameNorm, token) || localizedNormList.some(ln => fieldMatches(ln, token))) {
        rawScore += 0.60;
        matchedToken = true;
        hasCoreMatch = true;
      }
      if (fieldMatches(catNorm, token)) {
        rawScore += 0.35;
        matchedToken = true;
        hasCoreMatch = true;
      }
      if (fieldMatches(tagsNorm, token)) {
        rawScore += 0.30;
        matchedToken = true;
        hasCoreMatch = true;
      }
      if (fieldMatches(eligNorm, token)) {
        rawScore += 0.20;
        matchedToken = true;
        hasCoreMatch = true;
      }
      if (fieldMatches(descNorm, token)) {
        rawScore += 0.15;
        matchedToken = true;
      }
      if (fieldMatches(deptNorm, token)) {
        rawScore += 0.10;
        matchedToken = true;
      }
      if (matchedToken) directMatches++;
    }

    // Bonus for high query token coverage (all user search words matched)
    if (primary.length > 0) {
      const coverage = directMatches / primary.length;
      rawScore += coverage * 0.50;
    }

    // Synonym matching (applied with discount to prioritize exact lexical matches)
    for (const syn of synonyms) {
      if (fieldMatches(nameNorm, syn) || localizedNormList.some(ln => fieldMatches(ln, syn))) {
        rawScore += 0.25;
        hasCoreMatch = true;
      } else if (fieldMatches(catNorm, syn) || fieldMatches(tagsNorm, syn)) {
        rawScore += 0.18;
        hasCoreMatch = true;
      } else if (fieldMatches(eligNorm, syn) || fieldMatches(descNorm, syn)) {
        rawScore += 0.10;
      }
    }

    // State matching (Handling negative state vs positive state match across English & regional names)
    if (negativeState) {
      if (scheme.state && scheme.state.toLowerCase() === negativeState) {
        // Explicitly penalize schemes from the negated state
        rawScore -= 2.0;
      } else if (scheme.state === 'Central' || (scheme.state && scheme.state.toLowerCase() !== negativeState)) {
        // Boost schemes available outside the negated state
        rawScore += 0.60;
      }
    } else if (scheme.state && scheme.state !== 'Central') {
      const stateNorm = normalizeText(scheme.state);
      const stateAliases = SYNONYM_MAP[stateNorm] || [];
      const matchesState = normalizedQuery.includes(stateNorm) ||
        stateAliases.some(al => normalizedQuery.includes(al) || activeTokens.includes(al));
      if (matchesState) {
        rawScore += 0.30;
      }
    }

    // Document requirement matching (Handling negative doc requirement vs positive doc requirement)
    if (negativeDoc) {
      const ruleDocs = extractDocList(rules.requiredDocuments);
      const topDocs = extractDocList(scheme.requiredDocuments);
      const allDocs = [...ruleDocs, ...topDocs];
      const requiresDoc = allDocs.some(d => d.includes(negativeDoc));
      if (requiresDoc) {
        // Scheme requires the negated document -> penalize
        rawScore -= 1.50;
      } else {
        // Scheme does NOT require the negated document -> reward
        rawScore += 0.70;
      }
    }

    return { scheme, rawScore, hasCoreMatch };
  });

  // Filter out schemes below relevance threshold
  const filtered = results.filter(r => r.rawScore >= 0.20);
  if (filtered.length === 0) {
    if (fraudAwareness) {
      const refSchemes = schemes.filter(s => AUTHENTIC_REFERENCE_IDS.includes(s.id));
      return refSchemes.map(s => ({ scheme: s, score: 0.75 }));
    }
    return [];
  }

  // If query is fraud awareness but matched only incidental description noise, supply authoritative guidance
  if (fraudAwareness && !filtered[0].hasCoreMatch && filtered[0].rawScore < 0.60) {
    const refSchemes = schemes.filter(s => AUTHENTIC_REFERENCE_IDS.includes(s.id));
    return refSchemes.map(s => ({ scheme: s, score: 0.75 }));
  }

  // Sort deterministically by rawScore descending, tie-breaking alphabetically
  filtered.sort((a, b) => {
    if (Math.abs(b.rawScore - a.rawScore) > 0.0001) {
      return b.rawScore - a.rawScore;
    }
    const nameComp = a.scheme.name.localeCompare(b.scheme.name);
    if (nameComp !== 0) return nameComp;
    return a.scheme.id.localeCompare(b.scheme.id);
  });

  // Normalize scores to [0.10, 0.99] range while preserving rank order and confidence calibration
  const maxScore = filtered[0].rawScore;
  const topHasCoreMatch = filtered[0].hasCoreMatch;

  // Calibrate top result confidence based on true match quality (prevents misleading high confidence on weak/incidental matches)
  let confidenceCeiling = 0.99;
  if (!topHasCoreMatch && !negativeDoc && !negativeState) {
    confidenceCeiling = 0.50; // Incidental matches in secondary fields only (no name/cat/tag/eligibility hit)
  } else if (maxScore < 0.60) {
    confidenceCeiling = 0.50; // Low confidence for weak matches
  } else if (maxScore < 1.0) {
    confidenceCeiling = 0.75; // Moderate confidence
  } else if (maxScore < 1.40) {
    confidenceCeiling = 0.88; // Good confidence
  }

  const ranked = filtered.map(item => {
    const ratio = maxScore > 0 ? item.rawScore / maxScore : 0;
    const baseScore = 0.35 + ratio * (confidenceCeiling - 0.35);
    const score = Math.min(confidenceCeiling, Math.max(0.10, Math.round(baseScore * 100) / 100));
    return { scheme: item.scheme, score };
  });

  return ranked;
};
