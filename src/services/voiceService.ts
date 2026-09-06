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
  
  // Map lang codes to Speech API BCP 47 tags
  const langMap: Record<string, string> = {
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

  recognition.lang = langMap[langCode] || 'en-IN';

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

export function speakText(text: string, langCode: string = 'en') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn("Speech Synthesis not supported");
    return;
  }

  window.speechSynthesis.cancel(); // Stop any active speech

  const utterance = new SpeechSynthesisUtterance(text);
  const langMap: Record<string, string> = {
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

  utterance.lang = langMap[langCode] || 'en-IN';
  utterance.rate = 0.95; // Slightly clear & deliberate for clarity
  utterance.pitch = 1.0;

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function checkVoiceNavigationCommand(transcript: string): string | null {
  const t = transcript.toLowerCase();
  
  if (t.match(/go to dashboard/i) || t.match(/show dashboard/i) || t.match(/open dashboard/i)) return 'dashboard';
  if (t.match(/go to scheme/i) || t.match(/show scheme/i) || t.match(/explore scheme/i)) return 'explore';
  if (t.match(/go to application/i) || t.match(/my application/i) || t.match(/track application/i)) return 'applications';
  if (t.match(/go to document/i) || t.match(/my document/i) || t.match(/show document/i) || t.match(/vault/i)) return 'documents';
  if (t.match(/go to profile/i) || t.match(/show profile/i) || t.match(/my profile/i)) return 'profile';
  if (t.match(/talk to ai/i) || t.match(/open ai/i) || t.match(/voice assistant/i)) return 'assistant';

  return null;
}
