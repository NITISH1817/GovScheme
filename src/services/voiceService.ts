/**
 * Voice Assistant Service (STT + TTS)
 * Utilizes Web Speech API for voice command listening and Text-to-Speech synthesis.
 */

// Declare browser SpeechRecognition types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== 'undefined' && (!!window.SpeechRecognition || !!window.webkitSpeechRecognition);
}

// Map lang codes to Speech API BCP 47 tags
export const LANG_BCP47_MAP: Record<string, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  kn: 'kn-IN',
  ml: 'ml-IN',
  mr: 'mr-IN',
  gu: 'gu-IN',
  pa: 'pa-IN',
  bn: 'bn-IN'
};

export function startVoiceListening(
  langCode: string,
  onResult: (transcript: string) => void,
  onError?: (err: any) => void
): () => void {
  if (!isSpeechRecognitionSupported()) {
    if (onError) onError("Speech Recognition is not supported in this browser.");
    return () => {};
  }

  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRec();

  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = LANG_BCP47_MAP[langCode] || 'en-IN';

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  recognition.onerror = (err: any) => {
    if (onError) onError(err);
  };

  try {
    recognition.start();
  } catch (e) {
    console.error("Voice recognition start error:", e);
  }

  return () => {
    try {
      recognition.stop();
    } catch (e) {
      // ignore
    }
  };
}

/**
 * Strips markdown symbols, code blocks, bullet points, brackets, and URLs
 * so SpeechSynthesis speaks smooth natural human speech instead of reading punctuation/code/URLs.
 */
export function cleanTextForSpeech(text: string): string {
  if (!text) return '';
  return text
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Remove URLs
    .replace(/https?:\/\/\S+/gi, '')
    // Remove [bracketed tags] such as [Grounded Knowledge Engine • ...]
    .replace(/\[.*?\]/g, '')
    // Remove markdown headers #, ##, ###
    .replace(/^#+\s+/gm, '')
    // Remove bold and italics **text**, *text*, __text__, _text_
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, '$1')
    // Remove list bullets -, *, +
    .replace(/^[\s*•+-]+\s+/gm, '')
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Normalize multiple spaces / line breaks
    .replace(/\n+/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Selects best matching native voice for the given language code from the browser's available voices.
 */
export function getBestMatchingVoice(langCode: string): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const targetBcp = LANG_BCP47_MAP[langCode] || `${langCode}-IN`;
  const langPrefix = langCode.toLowerCase().split('-')[0];

  // 1. Exact match e.g. ta-IN or hi-IN
  let matched = voices.find(v => v.lang.toLowerCase() === targetBcp.toLowerCase());
  if (matched) return matched;

  // 2. Prefix match e.g. ta or hi
  matched = voices.find(v => v.lang.toLowerCase().startsWith(langPrefix));
  if (matched) return matched;

  // 3. Match voice name containing language (e.g., 'Tamil', 'Hindi', 'Telugu')
  const langNames: Record<string, string> = {
    ta: 'tamil',
    hi: 'hindi',
    te: 'telugu',
    ml: 'malayalam',
    mr: 'marathi',
    gu: 'gujarati',
    kn: 'kannada',
    bn: 'bengali',
    pa: 'punjabi',
    en: 'english'
  };
  const targetName = langNames[langPrefix];
  if (targetName) {
    matched = voices.find(v => v.name.toLowerCase().includes(targetName));
    if (matched) return matched;
  }

  // 4. Default Indian English voice or first available
  return voices.find(v => v.lang.toLowerCase().includes('en-in')) || voices[0] || null;
}

export function speakText(text: string, langCode: string = 'en') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn("Speech Synthesis not supported");
    return;
  }

  const cleanText = cleanTextForSpeech(text);
  if (!cleanText) return;

  window.speechSynthesis.cancel(); // Stop any active speech

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = LANG_BCP47_MAP[langCode] || 'en-IN';
  utterance.rate = 0.95; // Deliberate & clear pacing for all Indian languages
  utterance.pitch = 1.0;

  const matchedVoice = getBestMatchingVoice(langCode);
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Checks voice navigation command across all supported languages (English, Tamil, Hindi, Telugu, Malayalam, Marathi, Gujarati)
 */
export function checkVoiceNavigationCommand(transcript: string): string | null {
  const t = transcript.toLowerCase().trim();

  // DASHBOARD
  if (
    /dashboard|home|முகப்பு|டாஷ்போர்டு|डैशबोर्ड|होम|ముఖ్య|డాష్‌బోర్డ్|ഡാഷ്‌ബോർഡ്|मुख्य पान|ડેશબોર્ડ/i.test(t) &&
    /go|open|show|செல்ல|திற|காட்டு|खोलो|दिखाओ|తెరువు|തുറക്കുക|उघडा|ખોલો/i.test(t)
  ) {
    return 'dashboard';
  }
  if (/^(dashboard|முகப்பு|डैशबोर्ड|முகப்புக்குச் செல்|होम पेज)$/i.test(t)) return 'dashboard';

  // SCHEMES / EXPLORE
  if (
    /scheme|explore|திட்டம்|திட்டங்கள்|योजना|योजनाएं|పథకం|పథకాలు|പദ്ധതി|പദ്ധതികൾ|योजनांची यादी|યોજનાઓ/i.test(t)
  ) {
    return 'explore';
  }

  // APPLICATIONS
  if (
    /application|விண்ணப்பம்|விண்ணப்பங்கள்|விண்ணப்பி|आवेदन|अर्ज|దరఖాస్తు|దరఖాస్తులు|അപേക്ഷ|അപേക്ഷകൾ|અરજી|અરજીઓ/i.test(t)
  ) {
    return 'applications';
  }

  // DOCUMENTS / VAULT
  if (
    /document|vault|doc|ஆவணம்|ஆவணங்கள்|பெட்டகம்|दस्तावेज़|दस्तावेज|कागदपत्रे|పత్రం|పత్రాలు|രേഖ|രേഖകൾ|દસ્તાવેજ|દસ્તાવેજો/i.test(t)
  ) {
    return 'documents';
  }

  // PROFILE
  if (
    /profile|சுயவிவரம்|சுயவிவர|சுய விவரம்|प्रोफाइल|प्रोफ़ाइल|ప్రొఫైల్|പ്രൊഫൈൽ|પ્રોફાઇલ/i.test(t)
  ) {
    return 'profile';
  }

  // ASSISTANT / AI
  if (
    /assistant|ai|bot|help|உதவியாளர்|செயற்கை நுண்ணறிவு|सहायक|मदद|సహాయకుడు|సహాయి|मदत|મદદ/i.test(t)
  ) {
    return 'assistant';
  }

  return null;
}
