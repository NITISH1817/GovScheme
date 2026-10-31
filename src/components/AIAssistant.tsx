import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  User,
  ExternalLink,
  Info,
  ShieldCheck
} from 'lucide-react';
import { ChatMessage, Scheme, UserProfile, LanguageCode } from '../types';
import { startVoiceListening, speakText, stopSpeaking, isSpeechRecognitionSupported, checkVoiceNavigationCommand } from '../services/voiceService';
import { GovSchemeLogoMark, GovSchemeLogoLoader } from './brand';

interface AIAssistantProps {
  user: UserProfile;
  schemes: Scheme[];
  currentLang: LanguageCode;
  onNavigateTab: (tab: string) => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  user,
  schemes,
  currentLang,
  onNavigateTab
}) => {
  const { t } = useTranslation();

  const getLocalizedGreeting = () => {
    const firstName = user.fullName.split(' ')[0] || '';
    let greeting = t('aiGreeting', 'Hello Citizen. I am your Official AI Scheme Assistant. Based on your profile, I can help you discover welfare schemes, analyze eligibility, compare programs, and guide your official application. How can I help you today?');
    if (firstName) {
      greeting = greeting.replace(/Citizen|નાગરિક|नागरिक|குடிமகனே|పౌరుడా|പൗരൻ/, firstName);
    }
    return greeting;
  };

  const getSuggestedPrompts = () => [
    t('qRelevantToStudents', 'Which schemes are relevant to students?'),
    t('qSchemesForFarmers', 'What schemes can farmers apply for?'),
    t('qWhyRecommended', 'Why was a scheme recommended?'),
    t('qWhatDocs', 'What documents do I need?')
  ];

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'assistant',
      text: getLocalizedGreeting(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedPrompts: getSuggestedPrompts()
    }
  ]);

  useEffect(() => {
    setMessages(prev => {
      const newMsgs = [...prev];
      if (newMsgs.length > 0 && newMsgs[0].id === 'msg-init') {
        newMsgs[0] = {
          ...newMsgs[0],
          text: getLocalizedGreeting(),
          suggestedPrompts: getSuggestedPrompts()
        };
      }
      return newMsgs;
    });
  }, [currentLang, t, user.fullName]);

  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [voicePlaybackEnabled, setVoicePlaybackEnabled] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      }).catch(() => null); // Catch network errors and fallback

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
                  fullText = `AI Provider Notice: ${data.error} (Using local verified scheme dataset).`;
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
        // Fallback Grounded Scheme Knowledge Engine
        const lowerText = text.toLowerCase();
        let matchedSchemes = schemes.filter(s => lowerText.includes(s.category.toLowerCase().split(' ')[0]) || lowerText.includes(s.name.toLowerCase()));
        
        if (matchedSchemes.length === 0) {
          if (lowerText.includes('farmer') || lowerText.includes('agriculture')) {
            matchedSchemes = schemes.filter(s => s.category.includes('Agriculture'));
          } else if (lowerText.includes('student') || lowerText.includes('education')) {
            matchedSchemes = schemes.filter(s => s.category.includes('Education'));
          } else {
            matchedSchemes = schemes.slice(0, 2);
          }
        }

        const notice = t('groundedEngineNotice', '[Grounded Knowledge Engine • AI Provider Notice: Live AI service unavailable, grounded in verified local scheme database]');
        const foundHeader = t('basedOnQueryFound', 'Based on your query, here is what I found in the verified scheme records:');
        const legalNote = t('officialEligibilityRuleNote', '*Note: Official scheme eligibility is always determined by deterministic rules.*');

        let schemeDetails = '';
        if (matchedSchemes.length > 0) {
          const topS = matchedSchemes[0];
          const localizedName = t(`${topS.id}_name`, topS.name);
          const localizedDesc = t(`${topS.id}_desc`, topS.shortDescription);
          schemeDetails = `• ${localizedName}: ${localizedDesc}`;
        } else {
          schemeDetails = t('noSchemeFoundExplore', 'I could not find a specific scheme for that, but you can explore all categories on the discovery portal.');
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
      
      // Auto-suggest chips at the end
      setMessages(prev => prev.map(m => 
        m.id === aiMsgId ? {
          ...m,
          suggestedPrompts: [
            t('qMoreEligibility', 'Tell me more about the eligibility criteria'),
            t('qWhatDocsPrepare', 'What documents do I need to prepare?'),
            t('qHowTrackApp', 'How do I track my application?')
          ]
        } : m
      ));

      if (voicePlaybackEnabled) {
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
      setIsListening(false);
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      alert("Voice speech recognition is not supported in your browser.");
      return;
    }

    setIsListening(true);
    startVoiceListening(
      currentLang,
      (transcript) => {
        setIsListening(false);
        setInputText(transcript);
        
        const navCommand = checkVoiceNavigationCommand(transcript);
        if (navCommand) {
          onNavigateTab(navCommand);
          if (voicePlaybackEnabled) {
            const destName = t(navCommand, navCommand);
            speakText(t('navigatingTo', 'Navigating to {{destination}}', { destination: destName }), currentLang);
          }
          return;
        }
        
        handleSendMessage(transcript);
      },
      (err) => {
        setIsListening(false);
        console.error("Voice error:", err);
      }
    );
  };

  return (
    <div className="h-[calc(100vh-80px)] bg-[#F8FAFC] dark:bg-[#07111F] py-6 pb-20 sm:pb-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col">
        <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#0F1B2D] border border-gray-200 dark:border-gray-800 rounded shadow-sm overflow-hidden">
          
          {/* Chat Header */}
          <div className="border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between bg-gray-50 dark:bg-[#16243A]/50">
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
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('nlSemanticEnabled', 'Natural language semantic analysis enabled')}</p>
              </div>
            </div>

            <button
              onClick={() => {
                setVoicePlaybackEnabled(!voicePlaybackEnabled);
                if (voicePlaybackEnabled) stopSpeaking();
              }}
              className="p-2 rounded text-xs font-semibold flex items-center gap-2 transition-colors text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              title="Toggle Voice Output"
            >
              {voicePlaybackEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{voicePlaybackEnabled ? t('voiceOn', 'Voice On') : t('voiceOff', 'Voice Off')}</span>
            </button>
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
                                {referenced.map(refScheme => (
                                  <div key={refScheme.id} className="p-2 rounded bg-white dark:bg-[#0c1626] border border-gray-200 dark:border-gray-700 flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                      <div className="font-bold text-gray-800 dark:text-gray-200 truncate text-[11px]">{refScheme.name}</div>
                                      <div className="text-[10px] text-gray-500 truncate">{refScheme.department} • {refScheme.state || 'Central'}</div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const url = refScheme.officialApplyUrl || refScheme.officialWebsite;
                                        if (url) {
                                          window.dispatchEvent(new CustomEvent('govscheme_open_modal', {
                                            detail: {
                                              type: 'redirect',
                                              url,
                                              schemeName: refScheme.name,
                                              department: refScheme.department
                                            }
                                          }));
                                        } else {
                                          onNavigateTab('schemes');
                                        }
                                      }}
                                      className="px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-[10px] hover:underline shrink-0 flex items-center gap-1"
                                    >
                                      <ExternalLink className="w-2.5 h-2.5" />
                                      <span>{t('viewOfficialPortal', 'Official Portal')}</span>
                                    </button>
                                  </div>
                                ))}
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
                className={`p-3 rounded transition-colors ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                title="Voice Search"
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={isListening ? t('listeningSpeakNow', 'Listening... Speak your question now') : t('askAboutSchemes', "Ask about schemes, eligibility, or required documents...")}
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
