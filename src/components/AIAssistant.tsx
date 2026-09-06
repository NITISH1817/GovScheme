import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Paperclip,
  Sparkles,
  User,
  Building2,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { ChatMessage, Scheme, UserProfile, LanguageCode } from '../types';
import { startVoiceListening, speakText, stopSpeaking, isSpeechRecognitionSupported, checkVoiceNavigationCommand } from '../services/voiceService';

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
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'assistant',
      text: `Namaste ${user.fullName.split(' ')[0]}! 🙏 I am your AI Government Scheme Assistant. Based on your profile as a ${user.occupation} in ${user.state}, you have ${schemes.length}+ schemes to explore. I can help you discover welfare schemes, analyze eligibility, compare programs, and guide your official application.`,
      timestamp: 'Just now',
      suggestedPrompts: [
        `What schemes am I eligible for as a ${user.occupation}?`,
        `How do I apply for PM-KISAN?`,
        `Tell me about Atal Pension Yojana`,
        `What is Jan Dhan Yojana?`
      ]
    }
  ]);

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
      const response = await fetch('http://localhost:5000/api/ai/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ message: text })
      });

      if (!response.body) throw new Error('ReadableStream not yet supported in this browser.');
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      
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
                fullText = "I encountered an error connecting to the AI.";
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

      setIsTyping(false);
      
      // Auto-suggest chips at the end
      setMessages(prev => prev.map(m => 
        m.id === aiMsgId ? {
          ...m,
          suggestedPrompts: [
            "What documents do I need?",
            "Tell me about crop insurance",
            "Find pension schemes for me"
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
            speakText("Navigating to " + navCommand, currentLang);
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
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
      <div className="gov-card flex flex-col h-[75vh] overflow-hidden shadow-sm rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        {/* Chat Header */}
        <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-4 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-gov-navy text-white flex items-center justify-center font-bold shadow-sm">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-heading text-slate-900 dark:text-white">GovScheme AI Assistant</h2>
                <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                  <span className="pulse-dot"></span> Online
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Multilingual Voice & Chat Assistance for Rural Citizens</p>
            </div>
          </div>

          <button
            onClick={() => {
              setVoicePlaybackEnabled(!voicePlaybackEnabled);
              if (voicePlaybackEnabled) stopSpeaking();
            }}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition ${voicePlaybackEnabled
                ? 'bg-amber-400 text-slate-950 border-amber-500'
                : 'bg-blue-950/60 text-blue-200 border-blue-700'
              }`}
            title="Toggle Text-to-Speech Voice Playback"
          >
            {voicePlaybackEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{voicePlaybackEnabled ? 'Voice On' : 'Voice Off'}</span>
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 bg-slate-50/50 dark:bg-slate-900/50">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${msg.sender === 'user' ? 'bg-blue-700 text-white' : 'bg-amber-500 text-slate-950'
                }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className="space-y-3">
                <div className={`p-4 rounded-2xl text-xs leading-relaxed ${msg.sender === 'user'
                    ? 'bg-blue-700 text-white rounded-tr-none'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-none shadow-sm'
                  }`}>
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Referenced Scheme Cards inside Assistant */}
                  {msg.referencedSchemes && msg.referencedSchemes.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                        Referenced Scheme Card:
                      </span>
                      {msg.referencedSchemes.map(sch => (
                        <div key={sch.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">{sch.name}</span>
                            <span className="text-emerald-600 font-bold">{sch.benefitsSummary}</span>
                          </div>
                          <a
                            href={sch.officialApplyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-[11px] hover:bg-amber-400 transition flex items-center gap-1"
                          >
                            <span>Apply</span> <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}

                  <span className="block text-[10px] text-right mt-1 opacity-60">{msg.timestamp}</span>
                </div>

                {/* Suggested Prompt Chips */}
                {msg.suggestedPrompts && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {msg.suggestedPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(prompt)}
                        className="px-3 py-1.5 rounded-full bg-blue-50 dark:bg-slate-800 hover:bg-blue-100 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-slate-700 text-[11px] font-medium transition"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing Animation Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-500 italic">
              <Bot className="w-4 h-4 text-amber-500 animate-spin" />
              <span>GovScheme AI is processing legal rules & generating response...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Voice Mic Input Button */}
            <button
              type="button"
              onClick={handleMicClick}
              className={`p-3 rounded-xl transition ${isListening
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800'
                }`}
              title="Voice Input (Speech-to-Text)"
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isListening ? "Listening... Speak your question now" : "Ask about schemes, eligibility, required documents..."}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-blue-600 outline-none"
            />

            {/* Submit Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="px-5 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold text-xs shadow transition flex items-center gap-1.5"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
