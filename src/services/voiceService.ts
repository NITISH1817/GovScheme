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

// Cached voices management
let cachedVoices: SpeechSynthesisVoice[] = [];

export function getLoadedVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  const v = window.speechSynthesis.getVoices();
  if (v && v.length > 0) {
    cachedVoices = v;
    return v;
  }
  return cachedVoices;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  getLoadedVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    getLoadedVoices();
  };
}

export function startVoiceListening(
  langCode: string,
  onResult: (transcript: string) => void,
  onError?: (err: any) => void,
  onEnd?: () => void
): () => void {
  if (!isSpeechRecognitionSupported()) {
    if (onError) onError("Speech Recognition is not supported in this browser.");
    if (onEnd) onEnd();
    return () => {};
  }

  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRec();

  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = LANG_BCP47_MAP[langCode] || `${langCode}-IN`;

  let hasEnded = false;
  const safeEnd = () => {
    if (!hasEnded) {
      hasEnded = true;
      if (onEnd) onEnd();
    }
  };

  recognition.onresult = (event: any) => {
    try {
      const results = event.results;
      if (results && results.length > 0 && results[0][0]) {
        const transcript = results[0][0].transcript;
        onResult(transcript);
      }
    } catch (e) {
      console.warn("Error reading transcript:", e);
    }
    safeEnd();
  };

  recognition.onerror = (err: any) => {
    console.warn("Voice recognition error event:", err);
    if (onError) onError(err);
    safeEnd();
  };

  recognition.onend = () => {
    safeEnd();
  };

  try {
    recognition.start();
  } catch (e) {
    console.error("Voice recognition start error:", e);
    if (onError) onError(e);
    safeEnd();
  }

  return () => {
    try {
      recognition.stop();
    } catch (e) {
      // ignore
    }
    safeEnd();
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
  const voices = getLoadedVoices();
  if (!voices || voices.length === 0) return null;

  const targetBcp = (LANG_BCP47_MAP[langCode] || `${langCode}-IN`).toLowerCase();
  const langPrefix = langCode.toLowerCase().split('-')[0];

  // 1. Exact match e.g. ta-IN or hi-IN
  let matched = voices.find(v => v.lang.toLowerCase() === targetBcp);
  if (matched) return matched;

  // 2. Exact match with underscore e.g. ta_IN
  matched = voices.find(v => v.lang.toLowerCase().replace('_', '-') === targetBcp);
  if (matched) return matched;

  // 3. Prefix match e.g. ta or hi
  matched = voices.find(v => v.lang.toLowerCase().replace('_', '-').startsWith(`${langPrefix}-`) || v.lang.toLowerCase() === langPrefix);
  if (matched) return matched;

  // 4. Match voice name containing language (in English or native script) or well-known voice personalities
  const langVoiceKeywords: Record<string, string[]> = {
    ta: ['tamil', 'தமிழ்', 'valluvar', 'pallavi'],
    hi: ['hindi', 'हिन्दी', 'madhur', 'swara', 'kalpana', 'hemant'],
    te: ['telugu', 'తెలుగు', 'mohan', 'shruti'],
    ml: ['malayalam', 'മലയാളം', 'midhun', 'sobhana'],
    mr: ['marathi', 'मराठी', 'aarohi', 'manohar'],
    gu: ['gujarati', 'ગુજરાતી', 'niranjan', 'dhwani'],
    kn: ['kannada', 'ಕನ್ನಡ', 'gagan', 'sapna'],
    bn: ['bengali', 'বাংলা', 'bashkar', 'tanishaa'],
    pa: ['punjabi', 'ਪੰਜਾਬੀ', 'raavi', 'ojas'],
    en: ['indian english', 'india', 'neerja', 'prabhat', 'english']
  };

  const keywords = langVoiceKeywords[langPrefix];
  if (keywords) {
    matched = voices.find(v => {
      const vName = v.name.toLowerCase();
      return keywords.some(k => vName.includes(k));
    });
    if (matched) return matched;
  }

  // 5. If English requested, return Indian English or first English voice
  if (langPrefix === 'en') {
    return voices.find(v => v.lang.toLowerCase().includes('en-in')) ||
           voices.find(v => v.lang.toLowerCase().startsWith('en')) ||
           voices[0] || null;
  }

  // 6. For non-English languages: DO NOT fallback to English voice!
  // Return null so the browser/OS synthesizes using native cloud/OS engine for target utterance.lang.
  return null;
}

/**
 * Splits text into natural sentence / phrase chunks suitable for TTS streaming (max ~160 chars per chunk)
 */
export function splitTextIntoChunks(text: string, maxChunkLength: number = 160): string[] {
  if (!text) return [];
  const sentences = text.match(/[^.!?\n|;]+[.!?\n|;]+|[^.!?\n|;]+$/g) || [text];
  const chunks: string[] = [];

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;
    if (trimmed.length <= maxChunkLength) {
      chunks.push(trimmed);
    } else {
      const parts = trimmed.split(/([,:]\s+)/);
      let current = '';
      for (const part of parts) {
        if ((current + part).length <= maxChunkLength) {
          current += part;
        } else {
          if (current.trim()) chunks.push(current.trim());
          current = part;
        }
      }
      if (current.trim()) chunks.push(current.trim());
    }
  }

  return chunks.filter(c => c.length > 0);
}

// Active audio & speech synthesis management
let activeAudio: HTMLAudioElement | null = null;
let audioQueue: string[] = [];
let isQueueProcessing = false;
let activeUtterance: SpeechSynthesisUtterance | null = null;
let speechTimeout: ReturnType<typeof setTimeout> | null = null;
let currentAudioSession = 0;

/**
 * Checks if the browser has a genuine native speech synthesis voice installed for this language.
 */
export function hasNativeVoiceForLang(langCode: string): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return false;
  if (langCode === 'en') return true;
  const voice = getBestMatchingVoice(langCode);
  if (!voice) return false;
  const langPrefix = langCode.toLowerCase().split('-')[0];
  const voiceLang = (voice.lang || '').toLowerCase().replace('_', '-');
  const voiceName = (voice.name || '').toLowerCase();
  return voiceLang.startsWith(`${langPrefix}-`) || voiceLang === langPrefix || voiceName.includes(langPrefix);
}

/**
 * Direct Web Speech Synthesis utterance playback with Chromium cancel/speak bug fix and GC protection.
 */
export function speakUtterance(cleanText: string, langCode: string = 'en', onEnd?: () => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  const targetLangPrefix = (langCode || 'en').toLowerCase().split('-')[0];
  const bcp47 = LANG_BCP47_MAP[targetLangPrefix] || `${targetLangPrefix}-IN`;

  try {
    window.speechSynthesis.cancel();
  } catch {}

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = bcp47;
  utterance.rate = 0.95;
  utterance.pitch = 1.0;

  const matchedVoice = getBestMatchingVoice(targetLangPrefix);
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  activeUtterance = utterance;

  let ended = false;
  const finish = () => {
    if (!ended) {
      ended = true;
      activeUtterance = null;
      if (onEnd) onEnd();
    }
  };

  utterance.onend = finish;
  utterance.onerror = finish;

  // Chromium bug fix: wait 50ms after cancel() before calling speak()
  if (speechTimeout) clearTimeout(speechTimeout);
  speechTimeout = setTimeout(() => {
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("SpeechSynthesis speak invocation error:", e);
      finish();
    }
  }, 50);
}

function processAudioQueue(langCode: string, onEnd?: () => void, fullOriginalText?: string, sessionId?: number) {
  const currentSession = sessionId !== undefined ? sessionId : ++currentAudioSession;

  if (currentSession !== currentAudioSession) {
    return; // Superseded by a newer speech invocation
  }

  if (audioQueue.length === 0) {
    isQueueProcessing = false;
    activeAudio = null;
    if (onEnd) onEnd();
    return;
  }

  isQueueProcessing = true;
  const nextChunk = audioQueue.shift()!;
  const targetLang = langCode.toLowerCase().split('-')[0];
  const encoded = encodeURIComponent(nextChunk);

  const apiBase = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL)
    ? String(import.meta.env.VITE_API_URL).replace(/\/+$/, '')
    : '';
  // Primary: backend TTS proxy (avoids CORS and browser restrictions, returns high-quality audio)
  const backendUrl = `${apiBase}/api/ai/tts?lang=${encodeURIComponent(targetLang)}&text=${encoded}`;
  // Fallback direct Google TTS stream
  const directGoogleUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(targetLang)}&client=tw-ob&q=${encoded}`;

  let hasTriedFallback = false;
  let isFailureHandled = false;

  const audio = new Audio();
  try {
    (audio as any).referrerPolicy = 'no-referrer';
  } catch {}
  audio.src = backendUrl;
  activeAudio = audio;

  const cleanupAudio = () => {
    audio.onended = null;
    audio.onerror = null;
  };

  audio.onended = () => {
    cleanupAudio();
    if (currentSession !== currentAudioSession) return;
    processAudioQueue(langCode, onEnd, fullOriginalText, currentSession);
  };

  const handleStreamFailure = () => {
    if (isFailureHandled) return;
    if (currentSession !== currentAudioSession) return;
    if (activeAudio !== audio) return;

    if (!hasTriedFallback) {
      hasTriedFallback = true;
      audio.src = directGoogleUrl;
      audio.play().catch(() => {
        if (isFailureHandled) return;
        isFailureHandled = true;
        cleanupAudio();
        if (currentSession !== currentAudioSession) return;
        // Clean single fallback to local SpeechSynthesis utterance so voice never dies
        if (fullOriginalText) {
          audioQueue = [];
          isQueueProcessing = false;
          activeAudio = null;
          speakUtterance(fullOriginalText, langCode, onEnd);
        } else {
          processAudioQueue(langCode, onEnd, fullOriginalText, currentSession);
        }
      });
    } else {
      isFailureHandled = true;
      cleanupAudio();
      if (currentSession !== currentAudioSession) return;
      if (fullOriginalText) {
        audioQueue = [];
        isQueueProcessing = false;
        activeAudio = null;
        speakUtterance(fullOriginalText, langCode, onEnd);
      } else {
        processAudioQueue(langCode, onEnd, fullOriginalText, currentSession);
      }
    }
  };

  audio.onerror = () => {
    handleStreamFailure();
  };

  audio.play().catch(err => {
    console.warn(`[TTS Audio Autoplay] Primary stream playback note:`, err);
    handleStreamFailure();
  });
}

export function playOnlineTTSAudio(text: string, langCode: string, onEnd?: () => void) {
  stopSpeaking();
  const chunks = splitTextIntoChunks(text);
  if (chunks.length === 0) {
    if (onEnd) onEnd();
    return;
  }
  audioQueue = [...chunks];
  processAudioQueue(langCode, onEnd, text, currentAudioSession);
}

export function speakText(text: string, langCode: string = 'en', onEnd?: () => void) {
  if (typeof window === 'undefined') return;

  const cleanText = cleanTextForSpeech(text);
  if (!cleanText) {
    if (onEnd) onEnd();
    return;
  }

  stopSpeaking();

  const targetLangPrefix = (langCode || 'en').toLowerCase().split('-')[0];

  // 1. If English or browser has a true native voice for this language (e.g. Edge with Tamil/Hindi/etc., Android Chrome, Mac):
  // Use instant high-quality local speech synthesis
  if (targetLangPrefix === 'en' || hasNativeVoiceForLang(targetLangPrefix)) {
    speakUtterance(cleanText, targetLangPrefix, onEnd);
    return;
  }

  // 2. For non-English languages without pre-installed local OS voice packs (e.g. desktop Chrome on Windows):
  // Stream natural regional Indic voice audio, with automatic fallback to SpeechSynthesis if offline
  playOnlineTTSAudio(cleanText, targetLangPrefix, onEnd);
}

export function stopSpeaking() {
  currentAudioSession++; // Immediately invalidates any queued audio or async playback callbacks

  if (speechTimeout) {
    clearTimeout(speechTimeout);
    speechTimeout = null;
  }

  if (activeAudio) {
    try {
      activeAudio.onended = null;
      activeAudio.onerror = null;
      activeAudio.pause();
      activeAudio.currentTime = 0;
      activeAudio.removeAttribute('src');
      activeAudio.src = '';
      activeAudio.load();
    } catch {}
    activeAudio = null;
  }
  audioQueue = [];
  isQueueProcessing = false;

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
  activeUtterance = null;
}

/**
 * Checks voice navigation command across all supported languages (English, Tamil, Hindi, Telugu, Malayalam, Marathi, Gujarati)
 */
export function checkVoiceNavigationCommand(transcript: string): string | null {
  const t = transcript.toLowerCase().trim();

  // DASHBOARD / HOME
  if (
    /dashboard|home|முகப்பு|டாஷ்போர்டு|डैशबोर्ड|होम|ముఖ్య|డాష్‌బోర్డ్|డాష్‌బోర్డు|డ్యాష్‌బోర్డ్|ഡാഷ്‌ബോർഡ്|मुख्य पान|डॅशबोर्ड|મુખ્ય|ડેશબોર્ડ/i.test(t) &&
    /go|open|show|செல்ல|திற|காட்டு|खोलो|दिखाओ|తెరువు|చూపించు|వెళ్లు|തുറക്കുക|उघडा|दाखवा|जा|ખોલો/i.test(t)
  ) {
    return 'dashboard';
  }
  if (/^(dashboard|home|முகப்பு|डैशबोर्ड|முகப்புக்குச் செல்|होम पेज|హోమ్|ముఖ్య పేజీ|ప్రధాన పేజీ|मुख्य पान|होम|ഹോം|હોમ)$/i.test(t)) return 'dashboard';

  // SCHEMES / EXPLORE
  if (
    /scheme|schemes|explore|திட்டம்|திட்டங்கள்|திட்டம் காட்டு|योजना|योजनाएं|योजना सूची|योजना दाखवा|పథకం|పథకాలు|పథకాలు చూపించు|పദ്ധതി|പദ്ധതികൾ|योजनांची यादी|सर्व योजना|યોજનાઓ/i.test(t)
  ) {
    return 'explore';
  }

  // APPLICATIONS / TRACKER
  if (
    /application|applications|track|tracker|விண்ணப்பம்|விண்ணப்பங்கள்|விண்ணப்பி|கண்காணி|आवेदन|ट्रैकर|अर्ज|अर्जाची स्थिती|ट्रॅक करा|దరఖాస్తు|దరఖాస్తులు|ట్రాకర్|ట్రాక్ చేయి|అప్లికేషన్|അപേക്ഷ|അപേക്ഷകൾ|અરજી|અરજીઓ/i.test(t)
  ) {
    return 'applications';
  }

  // DOCUMENTS / VAULT
  if (
    /document|documents|vault|doc|ஆவணம்|ஆவணங்கள்|பெட்டகம்|दस्तावेज़|दस्तावेज|तिजोरी|कागदपत्रे|कागदपत्र|పత్రాలు|పత్రం|డాక్యుమెంట్లు|డాక్యుమెంట్|వాల్ట్|രേഖ|രേഖകൾ|દસ્તાવેજ|દસ્તાવેજો/i.test(t)
  ) {
    return 'documents';
  }

  // PROFILE
  if (
    /profile|சுயவிவரம்|சுயவிவர|சுய விவரம்|प्रोफाइल|प्रोफ़ाइल|माझे प्रोफाइल|माहिती|ప్రొఫైల్|నా ప్రొఫైల్|వివరాలు|പ്രൊഫൈൽ|પ્રોફાઇલ/i.test(t)
  ) {
    return 'profile';
  }

  // ASSISTANT / AI
  if (
    /assistant|ai|bot|help|உதவியாளர்|செயற்கை நுண்ணறிவு|உதவி|सहायक|मदद|సహాయకుడు|సహాయం|ఏఐ|సహాయి|സഹായി|मदत|सहाय्यक|एआय|સહાયક|મદદ/i.test(t)
  ) {
    return 'assistant';
  }

  // KIOSK
  if (
    /kiosk|கியோஸ்க்|कियोस्क|కియోస్క్|క్రియోస్క్|കിയോസ്ക്|કિયોસ્ક/i.test(t)
  ) {
    return 'kiosk';
  }

  return null;
}
