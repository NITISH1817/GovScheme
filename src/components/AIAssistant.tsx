import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  User,
  ExternalLink,
  Info,
  ShieldCheck,
  Languages,
  ChevronDown
} from 'lucide-react';
import { ChatMessage, Scheme, UserProfile, LanguageCode } from '../types';
import {
  startVoiceListening,
  speakText,
  stopSpeaking,
  isSpeechRecognitionSupported,
  checkVoiceNavigationCommand,
  LANG_BCP47_MAP
} from '../services/voiceService';
import { GovSchemeLogoMark, GovSchemeLogoLoader } from './brand';
import { languages, translations } from '../data/translations';

interface AIAssistantProps {
  user: UserProfile;
  schemes: Scheme[];
  currentLang: LanguageCode;
  onNavigateTab: (tab: string) => void;
  onLanguageChange?: (lang: LanguageCode) => void;
}

const LANGUAGE_SWITCH_CONFIRMATION: Record<string, string> = {
  ta: 'வணக்கம்! AI குரல் உதவியாளர் தமிழுக்கு மாற்றப்பட்டது. உங்கள் கேள்விகளை தமிழில் பேசலாம் அல்லது தட்டச்சு செய்யலாம்.',
  hi: 'नमस्ते! AI वॉयस सहायक हिन्दी में स्विच हो गया है। आप हिन्दी में बोल या लिख सकते हैं।',
  te: 'నమస్కారం! AI వాయిస్ అసిస్టెంట్ తెలుగులోకి మారింది. మీరు ఇప్పుడు తెలుగులో మాట్లాడవచ్చు లేదా టైప్ చేయవచ్చు.',
  ml: 'നമസ്കാരം! AI വോയ്സ് അസിസ്റ്റന്റ് മലയാളത്തിലേക്ക് മാറി. നിങ്ങൾക്ക് മലയാളത്തിൽ സംസാരിക്കാം അല്ലെങ്കിൽ ടൈപ്പ് ചെയ്യാം.',
  mr: 'नमस्कार! AI व्हॉइस असिस्टंट मराठीत बदलला आहे. आपण आता मराठीत बोलू किंवा लिहू शकता.',
  gu: 'નમસ્તે! AI વૉઇસ સહાયક ગુજરાતીમાં બદલાઈ ગયું છે. હવે તમે ગુજરાતીમાં બોલી અથવા ટાઈપ કરી શકો છો.',
  en: 'Hello! AI Voice Assistant is now in English. You can speak or type your questions in English.',
  kn: 'ನಮಸ್ಕಾರ! AI ಧ್ವನಿ ಸಹಾಯಕ ಕನ್ನಡಕ್ಕೆ ಬದಲಾಗಿದೆ. ನೀವು ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಬಹುದು ಅಥವಾ ಟೈಪ್ ಮಾಡಬಹುದು.',
  bn: 'নমস্কার! AI ভয়েস সহকারী বাংলায় রূপান্তরিত হয়েছে। আপনি বাংলায় বলতে বা টাইপ করতে পারেন।',
  pa: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! AI ਵੌਇਸ ਅਸਿਸਟੈਂਟ ਪੰਜਾਬੀ ਵਿੱਚ ਬਦਲ ਗਿਆ ਹੈ।'
};

export const AIAssistant: React.FC<AIAssistantProps> = ({
  user,
  schemes,
  currentLang,
  onNavigateTab,
  onLanguageChange
}) => {
  const { t, i18n } = useTranslation();

  const getLanguageNativeName = (code: string) => {
    const found = languages.find(l => l.code === code);
    return found ? found.nativeName : code.toUpperCase();
  };

  const getLocalizedGreeting = (lang: LanguageCode = currentLang) => {
    const firstName = user?.fullName ? user.fullName.split(' ')[0] : '';
    const dict = (translations as any)[lang] || translations.en;
    let greeting = dict.aiGreeting || t('aiGreeting', 'Hello Citizen. I am your Official AI Scheme Assistant. Based on your profile, I can help you discover welfare schemes, analyze eligibility, compare programs, and guide your official application. How can I help you today?');
    if (firstName) {
      greeting = greeting.replace(/Citizen|નાગરિક|नागरिक|குடிமகனே|పౌరుడా|പൗரൻ|ਪਾਤਰ/, firstName);
    }
    return greeting;
  };

  const getSuggestedPrompts = (lang: LanguageCode = currentLang) => {
    const dict = (translations as any)[lang] || translations.en;
    return [
      dict.qRelevantToStudents || t('qRelevantToStudents', 'Which schemes are relevant to students?'),
      dict.qSchemesForFarmers || t('qSchemesForFarmers', 'What schemes can farmers apply for?'),
      dict.qWhyRecommended || t('qWhyRecommended', 'Why was a scheme recommended?'),
      dict.qWhatDocs || t('qWhatDocs', 'What documents do I need?')
    ];
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg-init',
      sender: 'assistant',
      text: getLocalizedGreeting(currentLang),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedPrompts: getSuggestedPrompts(currentLang)
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [voicePlaybackEnabled, setVoicePlaybackEnabled] = useState(true);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionStopRef = useRef<(() => void) | null>(null);
  const isInitialMount = useRef(true);

  // Synchronize when current language changes
  useEffect(() => {
    // 1. Immediately halt any previous language voice playback
    stopSpeaking();

    // 2. Halt active microphone recognition if running so it restarts in the new language
    if (recognitionStopRef.current) {
      recognitionStopRef.current();
      recognitionStopRef.current = null;
      setIsListening(false);
    }

    // 3. Update the messages and prompt chips into the new language
    setMessages(prev => {
      if (prev.length === 0 || (prev.length === 1 && prev[0].id === 'msg-init')) {
        return [{
          id: 'msg-init',
          sender: 'assistant',
          text: getLocalizedGreeting(currentLang),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedPrompts: getSuggestedPrompts(currentLang)
        }];
      }
      
      const switchNotice: ChatMessage = {
        id: `lang-switch-${Date.now()}`,
        sender: 'assistant',
        text: LANGUAGE_SWITCH_CONFIRMATION[currentLang] || `🗣️ Language switched to ${getLanguageNativeName(currentLang)}. You can speak or type in this language.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedPrompts: getSuggestedPrompts(currentLang)
      };
      return [...prev, switchNotice];
    });

    // 4. Voice announcement in the newly selected language if user switched language and voice is enabled
    if (!isInitialMount.current && voicePlaybackEnabled && !onLanguageChange) {
      const confirmSpeech = LANGUAGE_SWITCH_CONFIRMATION[currentLang] || `Voice language switched to ${getLanguageNativeName(currentLang)}`;
      speakText(confirmSpeech, currentLang);
    }

    isInitialMount.current = false;
  }, [currentLang, user.fullName]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    const aiMsgId = `ai-${Date.now()}`;
    const initialAiMsg: ChatMessage = {
      id: aiMsgId,
      sender: 'assistant',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, initialAiMsg]);

    try {
      const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
      const authToken = localStorage.getItem('govscheme_token') || localStorage.getItem('token') || '';
      const response = await fetch(`${API_URL}/api/ai/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({ message: text, language: currentLang })
      }).catch(() => null);

      let fullText = '';
      if (response && response.body && response.ok) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.error) {
                  fullText = `AI Provider Notice: ${data.error}`;
                  break;
                }
                if (data.done) {
                  break;
                }
                if (data.text) {
                  fullText += data.text;
                  setMessages(prev => prev.map(m => 
                    m.id === aiMsgId ? { ...m, text: fullText } : m
                  ));
                }
              } catch (e) {
                console.error('SSE JSON parse error:', e);
              }
            }
          }
        }
      } else {
        // Fallback Grounded Scheme Knowledge Engine with explicit language localization
        const dict = (translations as any)[currentLang] || translations.en;
        const lowerText = text.toLowerCase();
        let matchedSchemes = schemes.filter(s => 
          lowerText.includes(s.category.toLowerCase().split(' ')[0]) || 
          lowerText.includes(s.name.toLowerCase())
        );
        
        if (matchedSchemes.length === 0) {
          if (lowerText.includes('farmer') || lowerText.includes('agriculture') || lowerText.includes('விவசாய') || lowerText.includes('किसान') || lowerText.includes('రైతు') || lowerText.includes('ಕೃಷಿ') || lowerText.includes('കർഷക') || lowerText.includes('शेतकरी') || lowerText.includes('ખેડૂત')) {
            matchedSchemes = schemes.filter(s => s.category.includes('Agriculture'));
          } else if (lowerText.includes('student') || lowerText.includes('education') || lowerText.includes('மாணவ') || lowerText.includes('छात्र') || lowerText.includes('విద్యార్థి') || lowerText.includes('ವಿದ್ಯಾರ್ಥಿ') || lowerText.includes('വിദ്യാർത്ഥി') || lowerText.includes('विद्यार्थी') || lowerText.includes('વિદ્યાર્થી')) {
            matchedSchemes = schemes.filter(s => s.category.includes('Education'));
          } else if (lowerText.includes('women') || lowerText.includes('female') || lowerText.includes('பெண்') || lowerText.includes('மகளிர்') || lowerText.includes('महिला') || lowerText.includes('మహిళ') || lowerText.includes('ಮಹಿಳೆ') || lowerText.includes('സ്ത്രീ') || lowerText.includes('મહિલા')) {
            matchedSchemes = schemes.filter(s => s.category.includes('Women') || s.eligibilityRules?.gender === 'Female' || (s.eligibilityRules as any)?.eligibleGender === 'Female');
          } else if (lowerText.includes('health') || lowerText.includes('hospital') || lowerText.includes('மருத்துவ') || lowerText.includes('சுகாதார') || lowerText.includes('स्वास्थ्य') || lowerText.includes('ఆరోగ్య') || lowerText.includes('ಆರೋಗ್ಯ') || lowerText.includes('ആരോഗ്യ') || lowerText.includes('आरोग्य')) {
            matchedSchemes = schemes.filter(s => s.category.includes('Healthcare'));
          } else if (lowerText.includes('pension') || lowerText.includes('senior') || lowerText.includes('ஓய்வூதிய') || lowerText.includes('பென்ஷன்') || lowerText.includes('पेंशन') || lowerText.includes('పింఛను') || lowerText.includes('ಪೆನ್ಷನ್') || lowerText.includes('പെൻഷൻ')) {
            matchedSchemes = schemes.filter(s => s.category.includes('Social Empowerment') || s.category.includes('Pensions'));
          } else if (lowerText.includes('house') || lowerText.includes('housing') || lowerText.includes('வீடு') || lowerText.includes('ஆவாஸ்') || lowerText.includes('आवास') || lowerText.includes('ఇల్లు') || lowerText.includes('ಮನೆ') || lowerText.includes('വീട്')) {
            matchedSchemes = schemes.filter(s => s.category.includes('Housing'));
          } else {
            matchedSchemes = schemes.slice(0, 2);
          }
        }

        const notice = dict.groundedEngineNotice || t('groundedEngineNotice', '[Grounded Knowledge Engine • AI Provider Notice: Live AI service unavailable, grounded in verified local scheme database]');
        const foundHeader = dict.basedOnQueryFound || t('basedOnQueryFound', 'Based on your query, here is what I found in the verified scheme records:');
        const legalNote = dict.officialEligibilityRuleNote || t('officialEligibilityRuleNote', '*Note: Official scheme eligibility is always determined by deterministic rules.*');

        let schemeDetails = '';
        if (matchedSchemes.length > 0) {
          const topS = matchedSchemes[0];
          const localizedName = dict[`${topS.id}_name`] || t(`${topS.id}_name`, topS.name);
          const localizedBenefits = dict[`${topS.id}_benefits`] || dict[`${topS.id}_desc`] || t(`${topS.id}_benefits`, topS.shortDescription);
          const localizedCat = dict[topS.category] || topS.category;
          const localizedState = (topS.state === 'All' || topS.state === 'Central') ? (dict['Central'] || 'Central') : (dict[topS.state] || topS.state);
          const portalUrl = topS.officialApplyUrl || topS.officialWebsite || 'https://www.india.gov.in';

          if (currentLang === 'te') {
            schemeDetails = `**పథకం:** ${localizedName}\n**వర్గం:** ${localizedCat} (${localizedState})\n**ప్రయోజనాలు:** ${localizedBenefits}\n**అధికారిక దరఖాస్తు పోర్టల్:** ${portalUrl}`;
          } else if (currentLang === 'ta') {
            schemeDetails = `**அரசுத் திட்டம்:** ${localizedName}\n**பிரிவு:** ${localizedCat} (${localizedState})\n**நன்மைகள்:** ${localizedBenefits}\n**அதிகாரப்பூர்வ விண்ணப்ப போர்ட்டல்:** ${portalUrl}`;
          } else if (currentLang === 'hi') {
            schemeDetails = `**योजना:** ${localizedName}\n**श्रेणी:** ${localizedCat} (${localizedState})\n**लाभ:** ${localizedBenefits}\n**आधिकारिक आवेदन पोर्टल:** ${portalUrl}`;
          } else if (currentLang === 'mr') {
            schemeDetails = `**योजना:** ${localizedName}\n**श्रेणी:** ${localizedCat} (${localizedState})\n**फायदे:** ${localizedBenefits}\n**अधिकृत अर्ज पोर्टल:** ${portalUrl}`;
          } else if (currentLang === 'ml') {
            schemeDetails = `**പദ്ധതി:** ${localizedName}\n**വിഭാഗം:** ${localizedCat} (${localizedState})\n**ആനുകൂല്യങ്ങൾ:** ${localizedBenefits}\n**ഔദ്യോഗിക അപേക്ഷാ പോർട്ടൽ:** ${portalUrl}`;
          } else if (currentLang === 'gu') {
            schemeDetails = `**યોજના:** ${localizedName}\n**શ્રેણી:** ${localizedCat} (${localizedState})\n**લાભો:** ${localizedBenefits}\n**સત્તાવાર અરજી પોર્ટલ:** ${portalUrl}`;
          } else {
            schemeDetails = `**Published Scheme:** ${localizedName}\n**Category:** ${localizedCat} (${localizedState})\n**Benefits:** ${localizedBenefits}\n**Official Application Portal:** ${portalUrl}`;
          }
        } else {
          schemeDetails = dict.noSchemeFoundExplore || t('noSchemeFoundExplore', 'I could not find a specific scheme for that, but you can explore all categories on the discovery portal.');
        }

        const generatedResponse = `${notice}\n\n${foundHeader}\n\n${schemeDetails}\n\n${legalNote}`;
        
        // Stream effect simulation
        const words = generatedResponse.split(' ');
        for (let i = 0; i < words.length; i++) {
          fullText += words[i] + ' ';
          setMessages(prev => prev.map(m => 
            m.id === aiMsgId ? { ...m, text: fullText } : m
          ));
          await new Promise(r => setTimeout(r, 20));
        }
      }

      setIsTyping(false);
      
      // Auto-suggest chips at the end in current language
      const dict = (translations as any)[currentLang] || translations.en;
      setMessages(prev => prev.map(m => 
        m.id === aiMsgId ? {
          ...m,
          suggestedPrompts: [
            dict.qMoreEligibility || t('qMoreEligibility', 'Tell me more about the eligibility criteria'),
            dict.qWhatDocsPrepare || t('qWhatDocsPrepare', 'What documents do I need to prepare?'),
            dict.qHowTrackApp || t('qHowTrackApp', 'How do I track my application?')
          ]
        } : m
      ));

      if (voicePlaybackEnabled && fullText) {
        speakText(fullText, currentLang);
      }

    } catch (err) {
      setIsTyping(false);
      setMessages(prev => prev.map(m => 
        m.id === aiMsgId ? { ...m, text: "Connection error. Please try again later." } : m
      ));
    }
  };

  const handleMicClick = () => {
    if (isListening) {
      if (recognitionStopRef.current) {
        recognitionStopRef.current();
        recognitionStopRef.current = null;
      }
      setIsListening(false);
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      alert(t('speechNotSupported', 'Voice speech recognition is not supported in your browser.'));
      return;
    }

    stopSpeaking(); // Stop any audio currently playing
    setIsListening(true);

    const stopFn = startVoiceListening(
      currentLang,
      (transcript) => {
        setIsListening(false);
        recognitionStopRef.current = null;
        if (!transcript || !transcript.trim()) return;

        setInputText(transcript);
        
        const navCommand = checkVoiceNavigationCommand(transcript);
        if (navCommand) {
          const tabMap: Record<string, string> = {
            dashboard: 'home',
            explore: 'schemes',
            applications: 'tracker',
            documents: 'vault',
            profile: 'profile',
            assistant: 'assistant'
          };
          const targetTab = tabMap[navCommand] || navCommand;
          onNavigateTab(targetTab);
          if (voicePlaybackEnabled) {
            const destName = t(targetTab, targetTab);
            speakText(t('navigatingTo', 'Navigating to {{destination}}', { destination: destName }), currentLang);
          }
          return;
        }
        
        handleSendMessage(transcript);
      },
      (err) => {
        setIsListening(false);
        recognitionStopRef.current = null;
        console.error("Voice error:", err);
      },
      () => {
        setIsListening(false);
        recognitionStopRef.current = null;
      }
    );

    recognitionStopRef.current = stopFn;
  };

  return (
    <div className="h-[calc(100vh-80px)] bg-[#F8FAFC] dark:bg-[#07111F] py-6 pb-20 sm:pb-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col">
        <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#0F1B2D] border border-gray-200 dark:border-gray-800 rounded shadow-sm overflow-hidden">
          
          {/* Chat Header */}
          <div className="border-b border-gray-200 dark:border-gray-800 p-4 flex flex-wrap items-center justify-between gap-3 bg-gray-50 dark:bg-[#16243A]/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-white dark:bg-black/20 text-[#123C69] dark:text-white flex items-center justify-center shadow-sm border border-gray-200 dark:border-gray-800 shrink-0">
                <GovSchemeLogoMark size={24} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  {t('askSchemeAssistant', 'Ask Scheme Assistant')}
                  <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-green-100 text-green-700 text-[10px] uppercase font-bold tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> {t('online', 'Online')}
                  </span>
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('nlSemanticEnabled', 'Natural language semantic analysis enabled')}</p>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    🗣️ {getLanguageNativeName(currentLang)} ({LANG_BCP47_MAP[currentLang] || currentLang})
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Language Switcher inside Assistant */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className="px-2.5 py-1.5 rounded text-xs font-bold border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827] text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-1.5 transition-colors shadow-sm"
                  title="Switch Voice Assistant Language"
                >
                  <Languages className="w-3.5 h-3.5 text-[#1769FF]" />
                  <span>{getLanguageNativeName(currentLang)}</span>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </button>

                {langMenuOpen && (
                  <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-[#0F1B2D] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-1.5 z-30">
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Select Voice Language
                    </div>
                    {languages.map(l => (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => {
                          setLangMenuOpen(false);
                          if (onLanguageChange) {
                            onLanguageChange(l.code);
                          } else {
                            i18n.changeLanguage(l.code);
                          }
                        }}
                        className={`w-full text-left px-2.5 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-between ${
                          currentLang === l.code
                            ? 'bg-[#1769FF] text-white'
                            : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <span>{l.nativeName}</span>
                        <span className="text-[10px] opacity-75 font-mono">{LANG_BCP47_MAP[l.code] || l.code}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Voice Output Toggle */}
              <button
                type="button"
                onClick={() => {
                  setVoicePlaybackEnabled(!voicePlaybackEnabled);
                  if (voicePlaybackEnabled) stopSpeaking();
                }}
                className={`p-2 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  voicePlaybackEnabled
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                title="Toggle Voice Output"
              >
                {voicePlaybackEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                <span className="hidden sm:inline">{voicePlaybackEnabled ? t('voiceOn', 'Voice On') : t('voiceOff', 'Voice Off')}</span>
              </button>
            </div>
          </div>

          {/* Message Stream */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-4 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${msg.sender === 'user' ? 'bg-[#1769FF] text-white' : 'bg-white dark:bg-[#07111F] text-[#123C69] dark:text-white border border-gray-200 dark:border-gray-800'}`}>
                  {msg.sender === 'user' ? <User className="w-4 h-4" /> : <GovSchemeLogoMark size={20} />}
                </div>

                <div className={`space-y-2 flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`p-4 text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-[#1769FF] text-white rounded-l rounded-br' : 'bg-gray-50 dark:bg-[#16243A] text-gray-900 dark:text-gray-100 rounded-r rounded-bl border border-gray-200 dark:border-gray-800'}`}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    
                    {/* Speaker Listen Button for Assistant Messages */}
                    {msg.sender === 'assistant' && msg.text && (
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => speakText(msg.text, currentLang)}
                          className="px-2 py-0.5 rounded text-[11px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/60 inline-flex items-center gap-1 transition-colors"
                          title="Listen in active voice"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>{t('listen', 'Listen')} ({getLanguageNativeName(currentLang)})</span>
                        </button>
                      </div>
                    )}

                    {msg.sender === 'assistant' && msg.text.length > 25 && (() => {
                      const lower = msg.text.toLowerCase();
                      const referenced = (msg.referencedSchemes && msg.referencedSchemes.length > 0)
                        ? msg.referencedSchemes
                        : schemes.filter(s => {
                            const words = s.name.toLowerCase().split(/\s+/).filter(w => w.length > 4);
                            return words.some(w => lower.includes(w));
                          }).slice(0, 2);

                      return (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700/60 space-y-2 text-xs">
                          {/* Grounded Evidence Citations */}
                          {referenced.length > 0 && (
                            <div className="space-y-1.5">
                              <span className="font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                {t('groundedCitations', 'Authoritative Source Citations')}
                              </span>
                              <div className="grid grid-cols-1 gap-1.5">
                                {referenced.map(refScheme => {
                                  const rawState = refScheme.state || 'Central';
                                  const locName = (translations as any)[currentLang]?.[`${refScheme.id}_name`] || t(`${refScheme.id}_name`, refScheme.name);
                                  const locDept = (translations as any)[currentLang]?.[refScheme.department] || t(refScheme.department, refScheme.department);
                                  const locState = (rawState === 'All' || rawState === 'Central')
                                    ? ((translations as any)[currentLang]?.['Central'] || t('Central', 'Central'))
                                    : ((translations as any)[currentLang]?.[rawState] || t(rawState, rawState));

                                  return (
                                    <div key={refScheme.id} className="p-2 rounded bg-white dark:bg-[#0c1626] border border-gray-200 dark:border-gray-700 flex items-center justify-between gap-2">
                                      <div className="min-w-0">
                                        <div className="font-bold text-gray-800 dark:text-gray-200 truncate text-[11px]">{locName}</div>
                                        <div className="text-[10px] text-gray-500 truncate">{locDept} • {locState}</div>
                                      </div>
                                      <a
                                        href={refScheme.officialApplyUrl || refScheme.officialWebsite || '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => {
                                          const url = refScheme.officialApplyUrl || refScheme.officialWebsite;
                                          if (url) {
                                            window.dispatchEvent(new CustomEvent('govscheme_open_modal', {
                                              detail: {
                                                type: 'redirect',
                                                url,
                                                schemeName: locName,
                                                department: locDept,
                                                schemeId: refScheme.id,
                                                scheme: refScheme
                                              }
                                            }));
                                          } else {
                                            e.preventDefault();
                                            onNavigateTab('schemes');
                                          }
                                        }}
                                        className="px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-[10px] hover:underline shrink-0 flex items-center gap-1 no-underline cursor-pointer"
                                      >
                                        <ExternalLink className="w-2.5 h-2.5" />
                                        <span>{t('viewOfficialPortal', 'Official Portal')}</span>
                                      </a>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Advisory Non-Affiliation Notice */}
                          <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-900 dark:text-amber-300 leading-normal flex items-start gap-1.5">
                            <Info className="w-3 h-3 text-amber-600 shrink-0 mt-0.5" />
                            <span>
                              {t('aiAdvisoryNotice', 'Advisory Notice: Responses are synthesized from verified government documentation. Always confirm eligibility rules, deadlines, and required documentation directly with the implementing department.')}
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                  
                  <span className="text-[10px] font-semibold text-gray-400 px-1">{msg.timestamp}</span>

                  {/* Suggested Prompts */}
                  {msg.suggestedPrompts && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {msg.suggestedPrompts.map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(prompt)}
                          className="px-3 py-1.5 rounded-full bg-white dark:bg-[#0F1B2D] border border-gray-300 dark:border-gray-700 hover:border-[#1769FF] hover:text-[#1769FF] text-gray-600 dark:text-gray-300 text-xs font-semibold transition-colors text-left"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-white dark:bg-[#07111F] text-[#123C69] dark:text-white border border-gray-200 dark:border-gray-800 flex items-center justify-center shrink-0">
                  <GovSchemeLogoMark size={20} />
                </div>
                <div className="p-4 bg-gray-50 dark:bg-[#16243A] rounded border border-gray-200 dark:border-gray-800 flex items-center gap-2 h-[52px]">
                  <GovSchemeLogoLoader size={24} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0F1B2D]">
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleMicClick}
                className={`p-3 rounded transition-colors ${
                  isListening
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white'
                }`}
                title={`Voice Search in ${getLanguageNativeName(currentLang)}`}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  isListening
                    ? `${t('listening', 'Listening in')} ${getLanguageNativeName(currentLang)} (${LANG_BCP47_MAP[currentLang] || currentLang})... ${t('speakNow', 'Speak now')}`
                    : `${t('askAboutSchemes', 'Ask about schemes in')} ${getLanguageNativeName(currentLang)}...`
                }
                className="flex-1 p-3 rounded bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:border-[#1769FF] focus:ring-1 focus:ring-[#1769FF] outline-none text-gray-900 dark:text-white text-sm"
              />
              
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="px-6 py-3 rounded bg-[#1769FF] text-white font-bold text-sm disabled:opacity-50 hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                {t('send', 'Send')} <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
          
        </div>
      </div>
    </div>
  );
};
