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
import { startVoiceListening, speakText, stopSpeaking, isSpeechRecognitionSupported } from '../services/voiceService';

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

  const handleSendMessage = (textToSend?: string) => {
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

    // AI Response Logic
    setTimeout(() => {
      let replyText = '';
      let referenced: Scheme[] = [];

      const queryLower = text.toLowerCase();

      if (queryLower.includes('pm-kisan') || queryLower.includes('kisan') || (queryLower.includes('farmer') && !queryLower.includes('insurance'))) {
        const pmKisan = schemes.find(s => s.id === 'pm-kisan');
        const pmfby = schemes.find(s => s.id === 'pm-fasal-bima');
        replyText = `Based on your profile as a **${user.occupation}** with ${user.landHoldingAcres} acres in **${user.state}**, you are likely eligible for **PM-KISAN** — ₹6,000/year credited in 3 installments of ₹2,000 directly to your bank account. Also check **PM Fasal Bima Yojana** for crop loss protection!`;
        if (pmKisan) referenced.push(pmKisan);
        if (pmfby) referenced.push(pmfby);

      } else if (queryLower.includes('crop insurance') || queryLower.includes('fasal bima') || queryLower.includes('pmfby') || queryLower.includes('farming risk') || queryLower.includes('crop loss')) {
        const pmfby = schemes.find(s => s.id === 'pm-fasal-bima');
        replyText = `**PM Fasal Bima Yojana (PMFBY)** provides comprehensive crop insurance! Farmers pay only **2% premium** for Kharif crops — the rest is borne by Centre & State Governments. If crop loss occurs, file intimation within 72 hours via the Crop Insurance App or helpline 1800-180-1111.`;
        if (pmfby) referenced.push(pmfby);

      } else if (queryLower.includes('awas') || queryLower.includes('housing') || queryLower.includes('house') || queryLower.includes('home')) {
        const pmay = schemes.find(s => s.id === 'pmay-g');
        replyText = `For housing support, **PM Awas Yojana - Gramin (PMAY-G)** provides a financial grant of **₹1.20 Lakh** for rural households with income below ₹1.8 Lakh to build pucca houses, plus 90 days of MGNREGA wages. Apply through your Gram Panchayat or pmayg.nic.in.`;
        if (pmay) referenced.push(pmay);

      } else if (queryLower.includes('health') || queryLower.includes('hospital') || queryLower.includes('ayushman') || queryLower.includes('medical')) {
        const pmjay = schemes.find(s => s.id === 'pmjay-ayushman');
        replyText = `**Ayushman Bharat (PM-JAY)** is the world's largest health coverage — **₹5 Lakh per family per year** cashless hospitalization at 27,000+ hospitals. Coverage starts from Day 1, no premium for eligible families. Check eligibility at mera.pmjay.gov.in.`;
        if (pmjay) referenced.push(pmjay);

      } else if (queryLower.includes('pension') || queryLower.includes('retirement') || queryLower.includes('atal') || queryLower.includes('apy') || queryLower.includes('old age')) {
        const apy = schemes.find(s => s.id === 'atal-pension-yojana');
        const ignoaps = schemes.find(s => s.id === 'nsap-old-age-pension');
        if (user.age <= 40) {
          replyText = `Since you are **${user.age} years old**, you can enroll in **Atal Pension Yojana (APY)** — a government-backed scheme guaranteeing pension of ₹1,000 to ₹5,000/month after age 60. Join before 40 to get government co-contribution of 50%. Apply at any bank or via net banking.`;
          if (apy) referenced.push(apy);
        } else {
          replyText = `For senior citizens aged 60+ below poverty line, **Indira Gandhi National Old Age Pension Scheme (IGNOAPS)** provides ₹1,000 to ₹3,000/month. If you are below 40, **Atal Pension Yojana (APY)** is excellent for retirement planning.`;
          if (ignoaps) referenced.push(ignoaps);
          if (apy) referenced.push(apy);
        }

      } else if (queryLower.includes('disability') || queryLower.includes('divyang') || queryLower.includes('udid') || queryLower.includes('handicap')) {
        const udid = schemes.find(s => s.id === 'udid-disability-scheme');
        const igndps = schemes.find(s => s.id === 'igndps-disability-pension');
        replyText = `For **Persons with Disabilities (Divyangjan)**, you should first get your **UDID Card** at swavlambancard.gov.in — this unlocks 3% job reservation, tax deductions up to ₹1.25 Lakh, railway concessions, and free assistive devices. If you have 80%+ disability and low income, the **IGNDPS pension** of ₹1,000-₹2,500/month is also available.`;
        if (udid) referenced.push(udid);
        if (igndps) referenced.push(igndps);

      } else if (queryLower.includes('scholarship') || queryLower.includes('student') || queryLower.includes('education') || queryLower.includes('study')) {
        const scholarship = schemes.find(s => s.id === 'post-matric-scholarship');
        replyText = `For higher education, **Post-Matric Scholarship for SC/ST/OBC students** covers full tuition fee + monthly allowance up to ₹13,500/year. Apply at scholarships.gov.in before **31st October 2026** deadline. Register with Aadhaar e-KYC for OTR (One-Time Registration).`;
        if (scholarship) referenced.push(scholarship);

      } else if (queryLower.includes('mudra') || queryLower.includes('business loan') || queryLower.includes('entrepreneurship') || queryLower.includes('loan')) {
        const mudra = schemes.find(s => s.id === 'pm-mudra');
        replyText = `**PM MUDRA Yojana** offers **collateral-free business loans**: Shishu (up to ₹50,000), Kishor (₹50K-₹5L), and Tarun (₹5L-₹10L). For startups, also check **Startup India Seed Fund** — grants up to ₹20 Lakh for PoC and ₹50 Lakh for market entry!`;
        if (mudra) referenced.push(mudra);

      } else if (queryLower.includes('street vendor') || queryLower.includes('hawker') || queryLower.includes('svanidhi')) {
        const svanidhi = schemes.find(s => s.id === 'pm-svanidhi');
        replyText = `**PM SVANidhi** is designed for urban street vendors. First loan: **₹10,000** at subsidized 7% interest. Repay on time to get ₹20,000 (2nd tranche) then ₹50,000 (3rd tranche). Plus cashback on digital transactions! Apply at pmsvanidhi.mohua.gov.in or CSC.`;
        if (svanidhi) referenced.push(svanidhi);

      } else if (queryLower.includes('employment') || queryLower.includes('nrega') || queryLower.includes('mgnrega') || queryLower.includes('job card') || queryLower.includes('wage')) {
        const mgnrega = schemes.find(s => s.id === 'mgnrega');
        replyText = `**MGNREGA** guarantees **100 days of paid work per year** for every rural household. Wages range from ₹240-₹375/day depending on state. Get your free **Job Card** from the Gram Panchayat and demand work in writing — you are entitled to unemployment allowance if work isn't provided within 15 days!`;
        if (mgnrega) referenced.push(mgnrega);

      } else if (queryLower.includes('lpg') || queryLower.includes('gas') || queryLower.includes('ujjwala') || queryLower.includes('cooking fuel')) {
        const ujjwala = schemes.find(s => s.id === 'pm-ujjwala');
        replyText = `**PM Ujjwala Yojana 2.0** provides a **free LPG gas connection** (deposit-free) along with the first cylinder refill and a stove — exclusively for adult women from BPL households. Apply at any Indane, Bharatgas, or HP Gas distributor with Aadhaar and Ration Card.`;
        if (ujjwala) referenced.push(ujjwala);

      } else if (queryLower.includes('girl') || queryLower.includes('daughter') || queryLower.includes('sukanya') || queryLower.includes('kanya')) {
        const ssy = schemes.find(s => s.id === 'sukanya-samriddhi');
        replyText = `For your girl child's future, **Sukanya Samriddhi Yojana (SSY)** offers **8.2% tax-free interest** (highest among small savings schemes). Deposit ₹250 to ₹1.5 Lakh/year for up to 15 years. The account matures when the girl turns 21. Open at any Post Office or authorized bank branch.`;
        if (ssy) referenced.push(ssy);

      } else if (queryLower.includes('jan dhan') || queryLower.includes('bank account') || queryLower.includes('pmjdy') || queryLower.includes('zero balance') || queryLower.includes('rupay')) {
        const jandhan = schemes.find(s => s.id === 'pm-jan-dhan');
        replyText = `**PM Jan Dhan Yojana (PMJDY)** gives you a **zero-balance savings account** with a free RuPay Debit Card, **₹2 Lakh accident insurance**, ₹30,000 life cover, and ₹10,000 overdraft after 6 months. Visit any nationalized bank or Bank Mitra with your Aadhaar to open in minutes!`;
        if (jandhan) referenced.push(jandhan);

      } else if (queryLower.includes('food') || queryLower.includes('ration') || queryLower.includes('grain') || queryLower.includes('nfsa') || queryLower.includes('pmgkay') || queryLower.includes('rice') || queryLower.includes('wheat')) {
        const pmgkay = schemes.find(s => s.id === 'pm-garib-kalyan-anna');
        replyText = `**PM Garib Kalyan Anna Yojana (PMGKAY)** provides **5 kg free food grain** (wheat/rice) per person per month to 81 Crore beneficiaries through your Ration Card at Fair Price Shops. Make sure your Aadhaar is linked to your Ration Card for seamless collection!`;
        if (pmgkay) referenced.push(pmgkay);

      } else if (queryLower.includes('startup') || queryLower.includes('innovation') || queryLower.includes('seed fund') || queryLower.includes('dpiit') || queryLower.includes('incubator')) {
        const startup = schemes.find(s => s.id === 'startup-india-seed-fund');
        replyText = `**Startup India Seed Fund Scheme** provides **up to ₹20 Lakh grant** for PoC/prototype and **up to ₹50 Lakh investment** for commercialization through empanelled incubators. First get DIPP recognition at startupindia.gov.in, then apply to seed fund incubators!`;
        if (startup) referenced.push(startup);

      } else if (queryLower.includes('document') || queryLower.includes('aadhaar') || queryLower.includes('proof') || queryLower.includes('certificate')) {
        replyText = `For most Central and State schemes, you need: 1. **Aadhaar Card** (linked to mobile), 2. **Income Certificate** from Revenue/Tehsildar, 3. **Bank Passbook**, 4. **Ration Card**. You currently have **${user.documents.length} verified documents** in your Vault. Open the Document Vault tab to scan new documents using OCR.`;

      } else {
        // Smart personalized fallback
        const eligibleCount = schemes.filter(s => {
          const occ = s.eligibilityRules.allowedOccupations;
          const inc = s.eligibilityRules.maxAnnualIncome;
          return (!occ || occ.some(o => o.toLowerCase().includes(user.occupation.toLowerCase()))) &&
            (!inc || user.annualIncome <= inc);
        }).length;
        replyText = `As a **${user.occupation}** with annual income of **₹${user.annualIncome.toLocaleString('en-IN')}** in **${user.state}**, our Rule Engine has found approximately **${eligibleCount} schemes** that could match your profile. Try asking about: pension, housing, health insurance, education, farming, business loans, food security, or disability benefits!`;
        referenced = schemes.slice(0, 2);
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        referencedSchemes: referenced,
        suggestedPrompts: [
          "What documents do I need?",
          "Tell me about crop insurance",
          "How to apply for Jan Dhan?",
          "Find pension schemes for me"
        ]
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);

      if (voicePlaybackEnabled) {
        speakText(replyText, currentLang);
      }
    }, 1200);
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
