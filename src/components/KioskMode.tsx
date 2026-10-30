import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Building2,
  MapPin,
  ClipboardList,
  FileText,
  Bot,
  Mic,
  Volume2,
  Globe,
  Users,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  LogOut,
  Eye,
  Printer,
  X,
  ChevronRight,
  ChevronDown,
  Phone,
  Info,
  Check,
  Send,
  Play,
  Pause,
  Square,
  Sparkles,
  Lock,
  Award,
  RefreshCw,
  FolderLock,
  Edit3,
  Bookmark,
  CheckSquare
} from 'lucide-react';
import {
  LanguageCode,
  Scheme,
  CombinedSchemeAnalysis,
  UserProfile,
  ApplicationTrackerRecord,
  DocumentRecord
} from '../types';
import { schemesData as defaultSchemes } from '../data/schemes';
import { SchemeDiscovery } from './SchemeDiscovery';
import { SchemeModal } from './SchemeModal';
import { ApplicationTracker } from './ApplicationTracker';
import { DocumentVault } from './DocumentVault';
import {
  speakText,
  startVoiceListening,
  stopSpeaking,
  isSpeechRecognitionSupported
} from '../services/voiceService';
import { GovSchemeLogoMark } from './brand';
import { evaluateSchemeEligibility } from '../engine/ruleEngine';
import { computeMLRecommendation } from '../engine/mlEngine';
import { evaluateExplainableEligibility } from '../engine/explainableEligibility';
import { KioskThermalReceiptModal } from './KioskThermalReceiptModal';

export interface KioskModeProps {
  user?: UserProfile | null;
  schemes?: Scheme[];
  applications?: ApplicationTrackerRecord[];
  onGenerateReport: (profile: Partial<UserProfile>) => void;
  onExit: () => void;
  onLogout?: () => void;
  onTrackApplication?: (schemeId: string, customAppNumber?: string) => Promise<void>;
  onOpenAuth?: (mode?: 'login' | 'signup', reason?: string) => void;
  onOpenOCR?: (expectedType: DocumentRecord['type']) => void;
  onDeleteDoc?: (docId: string) => void;
  onUpdateProfile?: (profile: Partial<UserProfile>) => Promise<void> | void;
  bookmarks?: string[];
  onToggleBookmark?: (schemeId: string) => void;
  isBookmarked?: (schemeId: string) => boolean;
  currentLang?: LanguageCode;
  onLanguageChange?: (lang: LanguageCode) => void;
}

export type KioskView = 'home' | 'schemes' | 'recommendations' | 'vault' | 'tracker' | 'assistant';

export const KioskMode: React.FC<KioskModeProps> = ({
  user,
  schemes = defaultSchemes,
  applications = [],
  onGenerateReport,
  onExit,
  onLogout,
  onTrackApplication,
  onOpenAuth,
  onOpenOCR,
  onDeleteDoc,
  onUpdateProfile,
  bookmarks = [],
  onToggleBookmark,
  isBookmarked,
  currentLang = 'en',
  onLanguageChange
}) => {
  const { t, i18n } = useTranslation();

  // Active view inside Touchscreen Kiosk
  const [activeView, setActiveView] = useState<KioskView>('home');

  // Display & Accessibility settings
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isAccessMenuOpen, setIsAccessMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  // Audio Guidance State
  const [isAudioGuidanceActive, setIsAudioGuidanceActive] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [showAudioTranscript, setShowAudioTranscript] = useState(false);

  // Scheme Modal state
  const [selectedSchemeAnalysis, setSelectedSchemeAnalysis] = useState<CombinedSchemeAnalysis | null>(null);

  // Inactivity & Session Security (120s idle + 15s warning)
  const [idleTimeRemaining, setIdleTimeRemaining] = useState<number>(120);
  const [showInactivityModal, setShowInactivityModal] = useState(false);
  const idleTimerRef = useRef<any>(null);
  const countdownIntervalRef = useRef<any>(null);

  // Recommendation Step inside Scheme Recommendations sub-view
  const [recommendationStep, setRecommendationStep] = useState<'questionnaire' | 'results'>('questionnaire');
  const [isThermalReceiptOpen, setIsThermalReceiptOpen] = useState(false);

  // Recommendation Questionnaire Form State
  const [recFormData, setRecFormData] = useState<Partial<UserProfile>>({
    fullName: user?.fullName || 'Citizen Beneficiary',
    age: user?.age !== undefined && user?.age !== null ? user.age : 35,
    gender: user?.gender || 'Male',
    state: user?.state || 'Tamil Nadu',
    district: user?.district || 'Madurai',
    annualIncome: user?.annualIncome !== undefined && user?.annualIncome !== null ? user.annualIncome : 120000,
    category: user?.category || 'OBC',
    occupation: user?.occupation || 'Farmer',
    landHoldingAcres: user?.landHoldingAcres !== undefined ? user.landHoldingAcres : 2,
    hasDisability: user?.hasDisability || false,
    disabilityPercentage: user?.disabilityPercentage || 0,
    residenceType: user?.residenceType || 'Rural',
    interests: user?.interests || ['Agriculture', 'Financial Support']
  });

  // Voice AI Assistant State inside Kiosk
  const [assistantMessages, setAssistantMessages] = useState<Array<{
    sender: 'user' | 'assistant';
    text: string;
    time: string;
    schemes?: Scheme[];
  }>>([
    {
      sender: 'assistant',
      text: t('kioskAssistantWelcome', 'Welcome to GovScheme AI Voice Assistant. Speak or tap any topic below to discover government benefits, check eligibility, or inquire about required documents.'),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [voiceInputText, setVoiceInputText] = useState('');
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  // Sync recommendation form data if user changes
  useEffect(() => {
    if (user) {
      setRecFormData(prev => ({
        ...prev,
        fullName: user.fullName || prev.fullName,
        age: user.age !== undefined && user.age !== null ? user.age : prev.age,
        gender: user.gender || prev.gender,
        state: user.state || prev.state,
        district: user.district || prev.district,
        annualIncome: user.annualIncome !== undefined && user.annualIncome !== null ? user.annualIncome : prev.annualIncome,
        category: user.category || prev.category,
        occupation: user.occupation || prev.occupation,
        landHoldingAcres: user.landHoldingAcres !== undefined ? user.landHoldingAcres : prev.landHoldingAcres,
        hasDisability: user.hasDisability !== undefined ? user.hasDisability : prev.hasDisability,
        disabilityPercentage: user.disabilityPercentage !== undefined ? user.disabilityPercentage : prev.disabilityPercentage,
        residenceType: user.residenceType || prev.residenceType
      }));
    }
  }, [user]);

  // Handle local bookmarking fallback
  const [localBookmarks, setLocalBookmarks] = useState<string[]>(bookmarks);
  const handleToggleLocalBookmark = (id: string) => {
    if (onToggleBookmark) {
      onToggleBookmark(id);
    } else {
      setLocalBookmarks(prev =>
        prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
      );
    }
  };
  const checkIsBookmarked = (id: string) => {
    if (isBookmarked) return isBookmarked(id);
    return localBookmarks.includes(id);
  };

  // --------------------------------------------------------------------------
  // KIOSK INACTIVITY & SESSION TIMEOUT (2 minutes idle + 15 second warning)
  // --------------------------------------------------------------------------
  const resetIdleTimer = useCallback(() => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    setShowInactivityModal(false);
    setIdleTimeRemaining(120);

    // After 105s (120s - 15s), show the warning countdown modal
    idleTimerRef.current = setTimeout(() => {
      setShowInactivityModal(true);
      setIdleTimeRemaining(15);

      countdownIntervalRef.current = setInterval(() => {
        setIdleTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            handleEndSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 105000);
  }, []);

  useEffect(() => {
    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll'];
    const handleActivity = () => {
      if (!showInactivityModal) {
        resetIdleTimer();
      }
    };

    activityEvents.forEach(evt => window.addEventListener(evt, handleActivity, { passive: true }));
    resetIdleTimer();

    return () => {
      activityEvents.forEach(evt => window.removeEventListener(evt, handleActivity));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      stopSpeaking();
    };
  }, [resetIdleTimer, showInactivityModal]);

  // Session Reset Handler
  const handleEndSession = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    stopSpeaking();
    setSelectedSchemeAnalysis(null);
    setActiveView('home');

    if (onLogout) {
      onLogout();
    }
  };

  const handleExitKiosk = () => {
    stopSpeaking();
    onExit();
  };

  // --------------------------------------------------------------------------
  // AUDIO GUIDANCE (MULTILINGUAL SPEECH SYNTHESIS)
  // --------------------------------------------------------------------------
  const activeLangCode = (currentLang || i18n.language || 'en') as LanguageCode;

  const audioGuidanceScript = useMemo(() => {
    return t(
      'kioskAudioScript',
      'Welcome to GovScheme Citizen Kiosk. Touch any of the 4 primary services on screen: Find Government Schemes, Scheme Recommendations, Document Vault, or My Applications. You can also touch Talk to GovScheme AI to speak directly in your native language.'
    );
  }, [t, activeLangCode]);

  const handleToggleAudioGuidance = () => {
    if (isAudioPlaying) {
      stopSpeaking();
      setIsAudioPlaying(false);
    } else {
      setIsAudioGuidanceActive(true);
      setIsAudioPlaying(true);
      speakText(audioGuidanceScript, activeLangCode);
    }
  };

  const handleStopAudioGuidance = () => {
    stopSpeaking();
    setIsAudioPlaying(false);
    setIsAudioGuidanceActive(false);
  };

  // --------------------------------------------------------------------------
  // VOICE-FIRST AI ASSISTANT (MICROPHONE + TEXT FALLBACK)
  // --------------------------------------------------------------------------
  const handleStartVoiceRecording = () => {
    if (!isSpeechRecognitionSupported()) {
      setVoiceError(t('speechNotSupported', 'Speech recognition is not supported in this browser. Please use text input below.'));
      return;
    }
    setVoiceError(null);
    setIsVoiceListening(true);

    try {
      startVoiceListening(
        activeLangCode,
        (transcript) => {
          setIsVoiceListening(false);
          if (transcript.trim()) {
            handleSendVoiceQuery(transcript);
          }
        },
        () => {
          setIsVoiceListening(false);
          setVoiceError(t('micError', 'Microphone error or permission denied. Tap to retry or type below.'));
        }
      );
    } catch {
      setIsVoiceListening(false);
      setVoiceError(t('micError', 'Microphone error or permission denied.'));
    }
  };

  const handleSendVoiceQuery = (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsg = {
      sender: 'user' as const,
      text: queryText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setAssistantMessages(prev => [...prev, userMsg]);
    setVoiceInputText('');

    // Query matcher with schemes
    const lower = queryText.toLowerCase();
    const matched = schemes.filter((s: Scheme) => {
      const matchName = s.name.toLowerCase().includes(lower);
      const matchDesc = (s.description || s.shortDescription || '').toLowerCase().includes(lower);
      const matchCat = (s.category || '').toLowerCase().includes(lower);
      return matchName || matchDesc || matchCat;
    }).slice(0, 3);

    let reply = '';
    if (matched.length > 0) {
      reply = `I found ${matched.length} schemes matching your query, including ${matched.map(m => m.name).join(', ')}. Touch any scheme card to see benefits and application steps.`;
    } else {
      reply = `Thank you for asking. Based on our 75+ central and state schemes, I recommend visiting Scheme Recommendations to check full eligibility criteria for your age, income, and location.`;
    }

    const aiMsg = {
      sender: 'assistant' as const,
      text: reply,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      schemes: matched
    };

    setTimeout(() => {
      setAssistantMessages(prev => [...prev, aiMsg]);
      speakText(reply, activeLangCode);
    }, 400);
  };

  // --------------------------------------------------------------------------
  // RECOMMENDATION COMPUTATION (RULE ENGINE + ML RANKING)
  // --------------------------------------------------------------------------
  const recommendedSchemes = useMemo(() => {
    const profileToEvaluate: UserProfile = {
      id: user?.id || 'kiosk-citizen',
      fullName: recFormData.fullName || 'Citizen Beneficiary',
      email: user?.email || '',
      mobile: user?.mobile || '',
      age: Number(recFormData.age) || 35,
      gender: (recFormData.gender as any) || 'Male',
      maritalStatus: user?.maritalStatus || '',
      state: recFormData.state || 'Tamil Nadu',
      district: recFormData.district || 'Madurai',
      annualIncome: Number(recFormData.annualIncome) || 120000,
      category: (recFormData.category as any) || 'OBC',
      occupation: recFormData.occupation || 'Farmer',
      educationLevel: user?.educationLevel || 'Secondary',
      familyMembersCount: user?.familyMembersCount || 4,
      landHoldingAcres: Number(recFormData.landHoldingAcres) || 0,
      hasDisability: Boolean(recFormData.hasDisability),
      disabilityPercentage: Number(recFormData.disabilityPercentage) || 0,
      isRegisteredWorker: user?.isRegisteredWorker || false,
      residenceType: (recFormData.residenceType as any) || 'Rural',
      interests: recFormData.interests || [],
      verificationBadge: user?.verificationBadge || false,
      profileCompletionScore: user?.profileCompletionScore || 85,
      savedSchemeIds: user?.savedSchemeIds || [],
      documents: user?.documents || []
    };

    return schemes.map(scheme => {
      const ruleResult = evaluateSchemeEligibility(profileToEvaluate, scheme);
      const mlResult = computeMLRecommendation(profileToEvaluate, scheme, ruleResult, schemes);
      const explainable = evaluateExplainableEligibility(profileToEvaluate, scheme);
      return { scheme, ruleResult, mlResult, explainable };
    }).sort((a, b) => {
      const score = (res: any) => {
        if (res.status === 'Eligible') return 3;
        if (res.status === 'Conditionally Eligible') return 2;
        if (res.status === 'Almost Eligible') return 1;
        return 0;
      };
      const diff = score(b.ruleResult) - score(a.ruleResult);
      if (diff !== 0) return diff;
      return b.mlResult.confidenceScore - a.mlResult.confidenceScore;
    });
  }, [schemes, user, recFormData]);

  const eligibleCount = useMemo(() => {
    return recommendedSchemes.filter(
      r => r.ruleResult.status === 'Eligible' || r.ruleResult.status === 'Conditionally Eligible'
    ).length;
  }, [recommendedSchemes]);

  const handleGenerateRecommendations = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateProfile) {
      onUpdateProfile(recFormData);
    }
    setRecommendationStep('results');
  };

  // 7 Regional Languages configuration
  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' }
  ];

  // Font size scale adjustments for accessibility
  const textScaleClass = largeText ? 'text-lg sm:text-xl' : 'text-sm sm:text-base';
  const headingScaleClass = largeText ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl';

  return (
    <div
      className={`min-h-screen w-full transition-colors flex flex-col font-sans select-none ${
        highContrast
          ? 'bg-white text-[#12365B] border-4 border-[#12365B]'
          : 'bg-[#F8FAFC] text-[#12365B]'
      }`}
      style={{ touchAction: 'manipulation' }}
    >
      {/* ------------------------------------------------------------------ */}
      {/* HEADER: CLEAN WHITE BAR (NAVY BRANDING, BLUE & ORANGE ACCENTS) */}
      {/* ------------------------------------------------------------------ */}
      <header className="bg-white border-b border-[#DCE5EF] px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-sm sticky top-0 z-50">

        {/* Left: Branding & Node Info */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => setActiveView('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#EAF2FF] border border-[#BFDBFE] flex items-center justify-center text-[#2563EB] shadow-sm">
              <GovSchemeLogoMark size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg sm:text-xl tracking-tight text-[#12365B]">
                  GOVSCHEME KIOSK
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EAF2FF] text-[#2563EB] border border-blue-200 uppercase">
                  CSC Terminal
                </span>
              </div>
              <p className="text-xs text-[#64748B] hidden sm:block">
                {t('kioskTerminalSubtitle', 'Public Citizen Service Touchscreen Terminal')}
              </p>
            </div>
          </div>

          {/* Active Citizen Node Indicator */}
          {user && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs text-[#16A34A] font-semibold ml-4">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
              <span>{user.fullName || 'Citizen Session'} ({user.state || 'Tamil Nadu'})</span>
            </div>
          )}
        </div>

        {/* Right: Audio Guidance, Voice AI, Display Settings, Language & Exit */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Audio Guidance Button */}
          <button
            type="button"
            onClick={handleToggleAudioGuidance}
            className={`min-h-[48px] px-3.5 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all active:scale-95 border ${
              isAudioPlaying
                ? 'bg-[#F59E0B] text-white border-amber-500 shadow-md animate-pulse'
                : 'bg-white hover:bg-[#F1F5F9] text-[#12365B] border-[#DCE5EF] shadow-sm'
            }`}
            aria-label="Toggle Audio Guidance"
          >
            <Volume2 className="w-4 h-4 text-[#F59E0B]" />
            <span className="hidden md:inline">{t('kioskAudioGuidance', 'Audio Guidance')}</span>
          </button>

          {/* Talk to GovScheme AI Button */}
          <button
            type="button"
            onClick={() => setActiveView('assistant')}
            className="min-h-[48px] px-3.5 sm:px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all active:scale-95 shadow-sm"
          >
            <Bot className="w-4 h-4" />
            <span className="hidden sm:inline">{t('kioskTalkToAI', 'Talk to AI')}</span>
          </button>

          {/* Display & Touchscreen Accessibility Settings */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsAccessMenuOpen(!isAccessMenuOpen)}
              className="min-h-[48px] p-2.5 sm:px-3 bg-white hover:bg-[#F1F5F9] border border-[#DCE5EF] rounded-xl text-[#12365B] flex items-center gap-1.5 transition-colors active:scale-95 shadow-sm"
              aria-label="Accessibility Settings"
              title="Display & Accessibility"
            >
              <Eye className="w-5 h-5 text-[#2563EB]" />
              <ChevronDown className="w-3.5 h-3.5 text-[#64748B] hidden sm:block" />
            </button>

            {isAccessMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-[#DCE5EF] rounded-2xl shadow-xl p-3 z-50 text-[#12365B] space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-[#2563EB] px-2 py-1 border-b border-[#DCE5EF]">
                  Touchscreen Accessibility
                </div>
                {/* High Contrast Toggle */}
                <button
                  type="button"
                  onClick={() => setHighContrast(!highContrast)}
                  className={`w-full min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between border ${
                    highContrast ? 'bg-[#12365B] text-white border-[#12365B]' : 'bg-[#F8FAFC] text-[#12365B] border-[#DCE5EF]'
                  }`}
                >
                  <span>{t('kioskHighContrast', 'High Contrast Mode')}</span>
                  {highContrast ? <Check className="w-4 h-4" /> : null}
                </button>
                {/* Large Text Toggle */}
                <button
                  type="button"
                  onClick={() => setLargeText(!largeText)}
                  className={`w-full min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between border ${
                    largeText ? 'bg-[#2563EB] text-white border-blue-600' : 'bg-[#F8FAFC] text-[#12365B] border-[#DCE5EF]'
                  }`}
                >
                  <span>{t('kioskLargeText', 'Large Text Mode')}</span>
                  {largeText ? <Check className="w-4 h-4" /> : null}
                </button>
                {/* Reduced Motion Toggle */}
                <button
                  type="button"
                  onClick={() => setReducedMotion(!reducedMotion)}
                  className={`w-full min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-between border ${
                    reducedMotion ? 'bg-[#16A34A] text-white border-emerald-600' : 'bg-[#F8FAFC] text-[#12365B] border-[#DCE5EF]'
                  }`}
                >
                  <span>{t('kioskReducedMotion', 'Reduced Motion')}</span>
                  {reducedMotion ? <Check className="w-4 h-4" /> : null}
                </button>
              </div>
            )}
          </div>

          {/* Multilingual Selector (7 Regional Languages) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="min-h-[48px] px-3.5 py-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#DCE5EF] rounded-xl text-xs sm:text-sm font-bold text-[#12365B] flex items-center gap-2 transition-colors active:scale-95"
              aria-label="Select Language"
            >
              <Globe className="w-4 h-4 text-[#2563EB]" />
              <span>{languages.find(l => l.code === (currentLang || i18n.language))?.nativeName || 'English'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
            </button>

            {langMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-[#DCE5EF] rounded-2xl shadow-xl p-2 z-50 text-[#12365B] space-y-1 max-h-[80vh] overflow-y-auto">
                <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-[#2563EB] border-b border-[#DCE5EF]">
                  Select Language (7 Languages)
                </div>
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      i18n.changeLanguage(lang.code);
                      if (onLanguageChange) onLanguageChange(lang.code as LanguageCode);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full min-h-[44px] text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                      (currentLang || i18n.language) === lang.code
                        ? 'bg-[#2563EB] text-white shadow-sm'
                        : 'hover:bg-[#F1F5F9] text-[#12365B]'
                    }`}
                  >
                    <span>{lang.nativeName}</span>
                    <span className={`text-[10px] font-normal ${(currentLang || i18n.language) === lang.code ? 'text-blue-100' : 'text-[#64748B]'}`}>
                      ({lang.name})
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Exit Kiosk Button */}
          <button
            type="button"
            onClick={handleExitKiosk}
            className="min-h-[48px] px-3.5 py-2 rounded-xl bg-white hover:bg-[#F1F5F9] border border-[#DCE5EF] text-[#64748B] hover:text-[#12365B] text-xs sm:text-sm font-bold transition-colors active:scale-95 shadow-sm"
          >
            {t('exitKiosk', 'Exit Kiosk')}
          </button>
        </div>
      </header>

      {/* -------------------------------------------------------------------- */}
      {/* AUDIO GUIDANCE BANNER (LIGHT THEME) */}
      {/* -------------------------------------------------------------------- */}
      {isAudioGuidanceActive && (
        <div className="bg-[#FFFBEB] text-[#92400E] px-4 sm:px-8 py-3 border-b border-[#FDE68A] flex flex-wrap items-center justify-between gap-3 shadow-sm sticky top-[72px] z-40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#FEF3C7] text-[#D97706] border border-[#FCD34D] flex items-center justify-center shrink-0">
              <Volume2 className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-xs uppercase tracking-wider block text-[#B45309]">
                {isAudioPlaying ? t('kioskAudioPlaying', 'Playing Audio Guidance') : t('kioskAudioPaused', 'Audio Guidance Paused')}
              </span>
              <p className="text-xs text-[#78350F] max-w-xl truncate">
                {audioGuidanceScript}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleAudioGuidance}
              className="min-h-[40px] px-3.5 py-1.5 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
            >
              {isAudioPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isAudioPlaying ? 'Pause' : 'Resume'}</span>
            </button>
            <button
              type="button"
              onClick={handleStopAudioGuidance}
              className="min-h-[40px] px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-[#78350F] border border-[#FDE68A] font-bold text-xs flex items-center gap-1 shadow-sm"
            >
              <Square className="w-3.5 h-3.5" />
              <span>{t('kioskAudioStop', 'Stop')}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowAudioTranscript(!showAudioTranscript)}
              className="min-h-[40px] px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-[#78350F] border border-[#FDE68A] font-bold text-xs shadow-sm"
            >
              {t('kioskAudioTextAlternative', 'Transcript')}
            </button>
          </div>
        </div>
      )}

      {/* Audio Transcript Drawer */}
      {showAudioTranscript && (
        <div className="bg-[#FFFDF5] border-b border-[#FDE68A] p-4 sm:p-6 text-[#12365B] text-xs sm:text-sm">
          <div className="max-w-4xl mx-auto space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-[#B45309] uppercase tracking-wider text-xs">
                {t('kioskAudioTextAlternative', 'Guidance Audio Transcript (Text-Alternative)')}
              </h4>
              <button onClick={() => setShowAudioTranscript(false)} className="text-[#64748B] hover:text-[#12365B] p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[#475569] leading-relaxed bg-white p-4 rounded-xl border border-[#DCE5EF] shadow-sm">
              {audioGuidanceScript}
            </p>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* MAIN VIEW CONTROLLER */}
      {/* -------------------------------------------------------------------- */}
      <main className="flex-1 flex flex-col">
        {/* SUB-VIEW HEADER BAR */}
        {activeView !== 'home' && (
          <div className="bg-white border-b border-[#DCE5EF] px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-sm">
            <button
              type="button"
              onClick={() => {
                setSelectedSchemeAnalysis(null);
                setActiveView('home');
              }}
              className="min-h-[48px] px-4 sm:px-5 py-2.5 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#12365B] font-bold text-xs sm:text-sm flex items-center gap-2 border border-[#DCE5EF] transition-all active:scale-95 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 text-[#2563EB]" />
              <span>{t('kioskBackToMenu', 'Back to Kiosk Menu')}</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-[#2563EB]">
                {activeView === 'schemes' && t('kioskCard1Title', 'Find Government Schemes')}
                {activeView === 'recommendations' && t('kioskCard2Title', 'Scheme Recommendations')}
                {activeView === 'vault' && t('kioskCard3Title', 'Document Vault')}
                {activeView === 'tracker' && t('kioskCard4Title', 'My Applications')}
                {activeView === 'assistant' && t('kioskCard5Title', 'Talk to GovScheme AI')}
              </span>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* VIEW: KIOSK HOMEPAGE (LIGHT THEME) */}
        {/* ------------------------------------------------------------------ */}
        {activeView === 'home' && (
          <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 flex flex-col justify-between space-y-8">

            {/* LARGE WHITE WELCOME CARD */}
            <div className="bg-white rounded-3xl border border-[#DCE5EF] p-8 sm:p-10 shadow-sm text-center space-y-3">
              <h1 className={`font-black tracking-tight text-[#12365B] ${headingScaleClass}`}>
                {t('kioskWelcomeTitle', 'Welcome to GovScheme Citizen Service Kiosk')}
              </h1>
              <p className={`text-[#64748B] font-medium max-w-2xl mx-auto ${textScaleClass}`}>
                {t('kioskWelcomeSubtitle', 'How can we help you today? Select a service below.')}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-[#EAF2FF] text-[#2563EB] border border-[#BFDBFE]">
                  {schemes.length}+ {t('schemesVerified', 'Verified Government Welfare Schemes')}
                </span>
                <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200">
                  100% Free Public Citizen Service
                </span>
              </div>
            </div>

            {/* 4 PRIMARY SERVICE CARDS (4 COLUMNS ON WIDE SCREENS) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

              {/* CARD 1 — FIND GOVERNMENT SCHEMES */}
              <motion.div
                whileHover={reducedMotion ? {} : { scale: 1.02, y: -3 }}
                whileTap={reducedMotion ? {} : { scale: 0.98 }}
                onClick={() => setActiveView('schemes')}
                className="bg-white border border-[#DCE5EF] hover:border-[#2563EB] hover:shadow-lg transition-all rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-sm cursor-pointer group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-[#EAF2FF] text-[#2563EB] flex items-center justify-center shrink-0">
                      <Search className="w-7 h-7" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#EAF2FF] text-[#2563EB] border border-blue-200 uppercase tracking-wider">
                      Discovery
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#12365B] group-hover:text-[#2563EB] transition-colors leading-snug">
                      {t('kioskCard1Title', 'Find Government Schemes')}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#64748B] mt-2 leading-relaxed">
                      {t('kioskCard1Desc', 'Discover scholarships, pensions, agricultural assistance and government benefits.')}
                    </p>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-[#F1F5F9] flex items-center justify-between text-[#2563EB] font-bold text-sm">
                  <span>{t('kioskCard1Action', 'Explore Schemes')}</span>
                  <div className="w-8 h-8 rounded-full bg-[#EAF2FF] group-hover:bg-[#2563EB] group-hover:text-white flex items-center justify-center transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>

              {/* CARD 2 — SCHEME RECOMMENDATIONS (REPLACES GOVERNMENT SERVICES) */}
              <motion.div
                whileHover={reducedMotion ? {} : { scale: 1.02, y: -3 }}
                whileTap={reducedMotion ? {} : { scale: 0.98 }}
                onClick={() => setActiveView('recommendations')}
                className="bg-white border border-[#DCE5EF] hover:border-[#2563EB] hover:shadow-lg transition-all rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-sm cursor-pointer group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-[#EAF2FF] text-[#2563EB] flex items-center justify-center shrink-0">
                      <Sparkles className="w-7 h-7" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#EAF2FF] text-[#2563EB] border border-blue-200 uppercase tracking-wider">
                      {t('kioskCard2Badge', 'PERSONALIZED FOR YOU')}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#12365B] group-hover:text-[#2563EB] transition-colors leading-snug">
                      {t('kioskCard2Title', 'Scheme Recommendations')}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#64748B] mt-2 leading-relaxed">
                      {t('kioskCard2Desc', 'Discover government schemes that match your age, income, occupation, location and eligibility.')}
                    </p>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-[#F1F5F9] flex items-center justify-between text-[#2563EB] font-bold text-sm">
                  <span>{t('kioskCard2Action', 'Get Recommendations')}</span>
                  <div className="w-8 h-8 rounded-full bg-[#EAF2FF] group-hover:bg-[#2563EB] group-hover:text-white flex items-center justify-center transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>

              {/* CARD 3 — DOCUMENT VAULT (REPLACES FIND NEARBY SERVICE CENTRES) */}
              <motion.div
                whileHover={reducedMotion ? {} : { scale: 1.02, y: -3 }}
                whileTap={reducedMotion ? {} : { scale: 0.98 }}
                onClick={() => setActiveView('vault')}
                className="bg-white border border-[#DCE5EF] hover:border-purple-600 hover:shadow-lg transition-all rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-sm cursor-pointer group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 uppercase tracking-wider">
                      {t('kioskCard3Badge', 'DOCUMENT MANAGEMENT')}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#12365B] group-hover:text-purple-700 transition-colors leading-snug">
                      {t('kioskCard3Title', 'Document Vault')}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#64748B] mt-2 leading-relaxed">
                      {t('kioskCard3Desc', 'Securely access, upload and manage your important government application documents.')}
                    </p>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-[#F1F5F9] flex items-center justify-between text-purple-600 font-bold text-sm">
                  <span>{t('kioskCard3Action', 'Open Document Vault')}</span>
                  <div className="w-8 h-8 rounded-full bg-purple-50 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>

              {/* CARD 4 — MY APPLICATIONS */}
              <motion.div
                whileHover={reducedMotion ? {} : { scale: 1.02, y: -3 }}
                whileTap={reducedMotion ? {} : { scale: 0.98 }}
                onClick={() => setActiveView('tracker')}
                className="bg-white border border-[#DCE5EF] hover:border-purple-500 hover:shadow-lg transition-all rounded-3xl p-6 sm:p-7 flex flex-col justify-between shadow-sm cursor-pointer group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                      <ClipboardList className="w-7 h-7" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 uppercase tracking-wider">
                      Tracker
                    </span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#12365B] group-hover:text-purple-700 transition-colors leading-snug">
                      {t('kioskCard4Title', 'My Applications')}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#64748B] mt-2 leading-relaxed">
                      {t('kioskCard4Desc', 'Track your submitted government scheme applications.')}
                    </p>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-[#F1F5F9] flex items-center justify-between text-purple-600 font-bold text-sm">
                  <span>{t('kioskCard4Action', 'Track Applications')}</span>
                  <div className="w-8 h-8 rounded-full bg-purple-50 group-hover:bg-purple-600 group-hover:text-white flex items-center justify-center transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>

            </div>

            {/* CARD 5 — VISUALLY PROMINENT AI ASSISTANT FEATURE (LIGHT ORANGE BACKGROUND) */}
            <motion.div
              whileHover={reducedMotion ? {} : { scale: 1.01 }}
              whileTap={reducedMotion ? {} : { scale: 0.99 }}
              onClick={() => setActiveView('assistant')}
              className="bg-[#FFFBEB] border-2 border-[#FCD34D] hover:border-[#F59E0B] rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row items-center justify-between gap-6"
            >
              <div className="space-y-3 max-w-2xl text-left">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] flex items-center justify-center shrink-0 shadow-sm">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#F59E0B] text-white">
                      Voice-First AI • Speak in 7 Languages
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#78350F] mt-0.5">
                      {t('kioskCard5Title', 'Talk to GovScheme AI')}
                    </h2>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-[#92400E] leading-relaxed">
                  {t('kioskCard5Desc', 'Speak naturally to discover schemes, check eligibility and understand application procedures.')}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="px-3 py-1 rounded-xl text-xs bg-white text-[#92400E] border border-[#FDE68A] shadow-sm">
                    🌾 "What schemes are for farmers?"
                  </span>
                  <span className="px-3 py-1 rounded-xl text-xs bg-white text-[#92400E] border border-[#FDE68A] shadow-sm">
                    🎓 "Scholarships for students"
                  </span>
                  <span className="px-3 py-1 rounded-xl text-xs bg-white text-[#92400E] border border-[#FDE68A] shadow-sm">
                    📄 "Documents needed for PM-KISAN"
                  </span>
                </div>
              </div>

              <div className="w-full md:w-auto shrink-0 flex items-center justify-center">
                <div className="min-h-[52px] px-6 py-3 rounded-2xl bg-[#F59E0B] hover:bg-[#D97706] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md shadow-amber-500/20 transition-all">
                  <Mic className="w-5 h-5 animate-pulse" />
                  <span>{t('kioskCard5Action', 'Start Voice Conversation')}</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </motion.div>

            {/* Bottom Terminal Notice */}
            <div className="pt-2 text-center text-xs text-[#64748B] space-y-1">
              <p>
                GovScheme Public Citizen Service Terminal • Protected by Inactivity Auto-Reset • Authorized Common Service Centre Node
              </p>
              <p className="text-[11px] text-[#94A3B8]">
                Official National Portal: <a href="https://www.india.gov.in" target="_blank" rel="noreferrer" className="underline text-[#2563EB]">india.gov.in</a> • Technical Support & Inquiries: 14599
              </p>
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* VIEW 1: SCHEME DISCOVERY EMBEDDED (LIGHT THEME) */}
        {/* ------------------------------------------------------------------ */}
        {activeView === 'schemes' && (
          <div className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full bg-[#F8FAFC]">
            <SchemeDiscovery
              schemes={schemes}
              user={user || null}
              currentLang={activeLangCode}
              onSelectScheme={(analysis) => setSelectedSchemeAnalysis(analysis)}
              onToggleBookmark={handleToggleLocalBookmark}
              isBookmarked={checkIsBookmarked}
              onNavigateTab={(tab) => {
                if (tab === 'home') setActiveView('home');
                else if (tab === 'tracker') setActiveView('tracker');
                else if (tab === 'vault') setActiveView('vault');
                else if (tab === 'assistant') setActiveView('assistant');
              }}
            />
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* VIEW 2: SCHEME RECOMMENDATIONS (QUESTIONNAIRE & RESULTS) */}
        {/* ------------------------------------------------------------------ */}
        {activeView === 'recommendations' && (
          <div className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-8 space-y-8 bg-[#F8FAFC]">

            {/* STEP A: RECOMMENDATION QUESTIONNAIRE */}
            {recommendationStep === 'questionnaire' && (
              <div className="space-y-6">
                <div className="text-center space-y-2 max-w-2xl mx-auto">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF2FF] text-[#2563EB] text-xs font-bold border border-[#BFDBFE]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Personalized Recommendation Questionnaire</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#12365B]">
                    {t('kioskRecQuestionnaireTitle', 'Scheme Eligibility Questionnaire')}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#64748B]">
                    {t('kioskRecQuestionnaireSubtitle', 'Enter or update your details below to generate instant, personalized scheme recommendations.')}
                  </p>
                </div>

                <form onSubmit={handleGenerateRecommendations} className="bg-white border border-[#DCE5EF] rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
                  {/* Section 1: Personal Details */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-extrabold text-[#12365B] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-[#F1F5F9]">
                      <span className="w-6 h-6 rounded-full bg-[#EAF2FF] text-[#2563EB] flex items-center justify-center text-xs">1</span>
                      Personal Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <label className="block text-[#12365B] font-bold mb-1">Full Legal Name</label>
                        <input
                          type="text"
                          required
                          value={recFormData.fullName || ''}
                          onChange={e => setRecFormData({ ...recFormData, fullName: e.target.value })}
                          className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#DCE5EF] text-[#12365B] text-sm outline-none focus:border-[#2563EB]"
                          placeholder="e.g. Murugan K"
                        />
                      </div>
                      <div>
                        <label className="block text-[#12365B] font-bold mb-1">Age (Years)</label>
                        <input
                          type="number"
                          required
                          min={1}
                          max={120}
                          value={recFormData.age || ''}
                          onChange={e => setRecFormData({ ...recFormData, age: Number(e.target.value) })}
                          className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#DCE5EF] text-[#12365B] text-sm outline-none focus:border-[#2563EB]"
                          placeholder="e.g. 38"
                        />
                      </div>
                      <div>
                        <label className="block text-[#12365B] font-bold mb-1">Gender</label>
                        <select
                          value={recFormData.gender || 'Male'}
                          onChange={e => setRecFormData({ ...recFormData, gender: e.target.value as any })}
                          className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#DCE5EF] text-[#12365B] text-sm font-semibold outline-none focus:border-[#2563EB]"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Transgender">Transgender</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Location */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-extrabold text-[#12365B] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-[#F1F5F9]">
                      <span className="w-6 h-6 rounded-full bg-[#EAF2FF] text-[#2563EB] flex items-center justify-center text-xs">2</span>
                      Geographic Location
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block text-[#12365B] font-bold mb-1">State / Union Territory</label>
                        <select
                          value={recFormData.state || 'Tamil Nadu'}
                          onChange={e => setRecFormData({ ...recFormData, state: e.target.value })}
                          className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#DCE5EF] text-[#12365B] text-sm font-semibold outline-none focus:border-[#2563EB]"
                        >
                          <option value="Tamil Nadu">Tamil Nadu</option>
                          <option value="Maharashtra">Maharashtra</option>
                          <option value="Gujarat">Gujarat</option>
                          <option value="Karnataka">Karnataka</option>
                          <option value="Kerala">Kerala</option>
                          <option value="Andhra Pradesh">Andhra Pradesh</option>
                          <option value="Telangana">Telangana</option>
                          <option value="Uttar Pradesh">Uttar Pradesh</option>
                          <option value="Bihar">Bihar</option>
                          <option value="Madhya Pradesh">Madhya Pradesh</option>
                          <option value="Rajasthan">Rajasthan</option>
                          <option value="West Bengal">West Bengal</option>
                          <option value="Punjab">Punjab</option>
                          <option value="Central">All India / Central</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[#12365B] font-bold mb-1">District</label>
                        <input
                          type="text"
                          required
                          value={recFormData.district || ''}
                          onChange={e => setRecFormData({ ...recFormData, district: e.target.value })}
                          className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#DCE5EF] text-[#12365B] text-sm outline-none focus:border-[#2563EB]"
                          placeholder="e.g. Madurai, Thanjavur, Pune"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Economic & Social Profile */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-extrabold text-[#12365B] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-[#F1F5F9]">
                      <span className="w-6 h-6 rounded-full bg-[#EAF2FF] text-[#2563EB] flex items-center justify-center text-xs">3</span>
                      Economic & Social Eligibility
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block text-[#12365B] font-bold mb-1">Annual Household Income (₹)</label>
                        <input
                          type="number"
                          required
                          min={0}
                          value={recFormData.annualIncome !== undefined ? recFormData.annualIncome : ''}
                          onChange={e => setRecFormData({ ...recFormData, annualIncome: Number(e.target.value) })}
                          className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#DCE5EF] text-[#12365B] text-sm font-bold outline-none focus:border-[#2563EB]"
                          placeholder="e.g. 120000"
                        />
                        <div className="flex items-center gap-1.5 mt-2">
                          <button
                            type="button"
                            onClick={() => setRecFormData({ ...recFormData, annualIncome: 60000 })}
                            className="px-2.5 py-1 rounded-lg bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#12365B] text-[11px] font-semibold"
                          >
                            ₹60,000 (BPL)
                          </button>
                          <button
                            type="button"
                            onClick={() => setRecFormData({ ...recFormData, annualIncome: 120000 })}
                            className="px-2.5 py-1 rounded-lg bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#12365B] text-[11px] font-semibold"
                          >
                            ₹1,20,000
                          </button>
                          <button
                            type="button"
                            onClick={() => setRecFormData({ ...recFormData, annualIncome: 250000 })}
                            className="px-2.5 py-1 rounded-lg bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#12365B] text-[11px] font-semibold"
                          >
                            ₹2,50,000 (EWS)
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[#12365B] font-bold mb-1">Social Category</label>
                        <select
                          value={recFormData.category || 'OBC'}
                          onChange={e => setRecFormData({ ...recFormData, category: e.target.value as any })}
                          className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#DCE5EF] text-[#12365B] text-sm font-semibold outline-none focus:border-[#2563EB]"
                        >
                          <option value="General">General</option>
                          <option value="OBC">OBC (Other Backward Class)</option>
                          <option value="SC">SC (Scheduled Caste)</option>
                          <option value="ST">ST (Scheduled Tribe)</option>
                          <option value="EWS">EWS (Economically Weaker Section)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Occupation & Land Holding */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-extrabold text-[#12365B] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-[#F1F5F9]">
                      <span className="w-6 h-6 rounded-full bg-[#EAF2FF] text-[#2563EB] flex items-center justify-center text-xs">4</span>
                      Occupation & Land Holding
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block text-[#12365B] font-bold mb-1">Primary Occupation</label>
                        <select
                          value={recFormData.occupation || 'Farmer'}
                          onChange={e => setRecFormData({ ...recFormData, occupation: e.target.value })}
                          className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#DCE5EF] text-[#12365B] text-sm font-semibold outline-none focus:border-[#2563EB]"
                        >
                          <option value="Farmer">Farmer (Agricultural Cultivator)</option>
                          <option value="Agricultural Laborer">Agricultural Laborer / Daily Wage</option>
                          <option value="Student">Student / Scholar</option>
                          <option value="Self Employed / Artisan">Artisan / Small Business / Trader</option>
                          <option value="Construction Worker">Construction / Registered Laborer</option>
                          <option value="Unemployed">Unemployed / Job Seeker</option>
                          <option value="Homemaker">Homemaker / Women SHG Member</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[#12365B] font-bold mb-1">Land Holding (Acres)</label>
                        <input
                          type="number"
                          step="0.1"
                          min={0}
                          value={recFormData.landHoldingAcres !== undefined ? recFormData.landHoldingAcres : 0}
                          onChange={e => setRecFormData({ ...recFormData, landHoldingAcres: Number(e.target.value) })}
                          className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#DCE5EF] text-[#12365B] text-sm font-bold outline-none focus:border-[#2563EB]"
                          placeholder="e.g. 2.5 (0 for landless)"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 5: Disability & Residence */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-extrabold text-[#12365B] uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-[#F1F5F9]">
                      <span className="w-6 h-6 rounded-full bg-[#EAF2FF] text-[#2563EB] flex items-center justify-center text-xs">5</span>
                      Special Needs & Residence
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div>
                        <label className="block text-[#12365B] font-bold mb-1">Residence Type</label>
                        <select
                          value={recFormData.residenceType || 'Rural'}
                          onChange={e => setRecFormData({ ...recFormData, residenceType: e.target.value as any })}
                          className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#DCE5EF] text-[#12365B] text-sm font-semibold outline-none focus:border-[#2563EB]"
                        >
                          <option value="Rural">Rural (Village / Panchayat)</option>
                          <option value="Urban">Urban (City / Municipality)</option>
                          <option value="Semi-Urban">Semi-Urban</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2 flex flex-col justify-center">
                        <label className="flex items-center gap-3 cursor-pointer pt-2">
                          <input
                            type="checkbox"
                            checked={Boolean(recFormData.hasDisability)}
                            onChange={e => setRecFormData({ ...recFormData, hasDisability: e.target.checked })}
                            className="w-5 h-5 rounded text-[#2563EB]"
                          />
                          <span className="text-xs sm:text-sm font-bold text-[#12365B]">
                            Person with Disability (Divyangjan / UDID Cardholder)
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Submit Action */}
                  <div className="pt-4 flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => setActiveView('home')}
                      className="px-6 py-3 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#64748B] font-bold text-xs sm:text-sm transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-8 py-3.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-extrabold text-sm sm:text-base shadow-md hover:shadow-lg flex items-center gap-2 transition-all active:scale-95"
                    >
                      <Sparkles className="w-5 h-5 text-amber-300" />
                      <span>{t('kioskGenerateRecs', 'Find My Eligible Schemes')}</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* STEP B: PERSONALIZED RECOMMENDATION RESULTS */}
            {recommendationStep === 'results' && (
              <div className="space-y-6">

                {/* Results Summary Banner */}
                <div className="bg-white border border-[#DCE5EF] rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#16A34A] text-xs font-bold border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{eligibleCount} Verified Schemes Match Your Profile</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-[#12365B]">
                      {t('kioskRecResultsTitle', 'Personalized Scheme Recommendations')}
                    </h2>
                    <p className="text-xs sm:text-sm text-[#64748B]">
                      Evaluated for <strong>{recFormData.fullName}</strong> • Age {recFormData.age} • {recFormData.occupation} • {recFormData.state} • Annual Income ₹{Number(recFormData.annualIncome || 0).toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <button
                      type="button"
                      onClick={() => setRecommendationStep('questionnaire')}
                      className="min-h-[46px] px-4 py-2.5 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#12365B] font-bold text-xs flex items-center gap-2 border border-[#DCE5EF] transition-all"
                    >
                      <Edit3 className="w-4 h-4 text-[#2563EB]" />
                      <span>{t('kioskEditQuestionnaire', 'Update Criteria')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsThermalReceiptOpen(true)}
                      className="min-h-[46px] px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print Thermal Receipt</span>
                    </button>
                  </div>
                </div>

                {/* Recommendation Cards List */}
                <div className="grid grid-cols-1 gap-5">
                  {recommendedSchemes.map(({ scheme, ruleResult, mlResult, explainable }) => {
                    const isEligible = ruleResult.status === 'Eligible';
                    const isCondEligible = ruleResult.status === 'Conditionally Eligible';
                    const statusBadgeClass = isEligible
                      ? 'bg-emerald-50 text-[#16A34A] border-emerald-200'
                      : isCondEligible
                      ? 'bg-amber-50 text-[#D97706] border-amber-200'
                      : 'bg-slate-100 text-[#64748B] border-slate-200';

                    const satisfiedReasons = explainable.satisfied && explainable.satisfied.length > 0
                      ? explainable.satisfied.map((c: any) => c.reason)
                      : (ruleResult.matchedCriteria && ruleResult.matchedCriteria.length > 0 ? ruleResult.matchedCriteria : ['Matches citizen demographic and occupational profile']);

                    return (
                      <div
                        key={scheme.id}
                        className="bg-white border border-[#DCE5EF] hover:border-[#2563EB] rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="space-y-1.5 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EAF2FF] text-[#2563EB] border border-[#BFDBFE]">
                                {scheme.governmentLevel || (scheme.state === 'Central' ? 'Central Government' : `${scheme.state} State Government`)}
                              </span>
                              <span className="text-[10px] font-semibold text-[#64748B]">
                                {scheme.department || scheme.category}
                              </span>
                            </div>
                            <h3 className="text-xl font-bold text-[#12365B]">
                              {scheme.name}
                            </h3>
                            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                              {scheme.shortDescription || scheme.description}
                            </p>
                          </div>

                          <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusBadgeClass}`}>
                              {ruleResult.status}
                            </span>
                            <span className="text-[11px] font-bold text-[#2563EB]">
                              {mlResult.confidenceScore}% Eligibility Match
                            </span>
                          </div>
                        </div>

                        {/* Benefit Summary Highlight */}
                        <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div>
                            <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Benefit Entitlement</span>
                            <span className="font-extrabold text-[#12365B] text-sm">
                              {scheme.benefitsSummary || (scheme.financialBenefitAmount ? `₹${Number(scheme.financialBenefitAmount).toLocaleString('en-IN')} Financial Support` : 'Authorized Welfare Support')}
                            </span>
                          </div>
                          {scheme.category && (
                            <span className="px-2.5 py-1 rounded-lg bg-white border border-[#DCE5EF] text-[#12365B] font-semibold text-xs">
                              Category: {scheme.category}
                            </span>
                          )}
                        </div>

                        {/* Why You Match Section */}
                        <div className="space-y-2">
                          <h4 className="text-xs font-bold text-[#12365B] uppercase tracking-wider flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
                            <span>{t('kioskWhyYouMatch', 'Why You Match This Scheme')}</span>
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#475569]">
                            {satisfiedReasons.slice(0, 4).map((reason: string, idx: number) => (
                              <div key={idx} className="flex items-start gap-2 p-2 rounded-xl bg-[#F8FAFC] border border-[#F1F5F9]">
                                <span className="text-[#16A34A] font-bold">✓</span>
                                <span className="leading-snug">{reason}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Required Documents */}
                        {scheme.requiredDocuments && scheme.requiredDocuments.length > 0 && (
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                              {t('kioskRequiredDocs', 'Required Documents')}:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {scheme.requiredDocuments.map((doc, i) => (
                                <span key={i} className="px-2.5 py-0.5 rounded-lg bg-[#EAF2FF] text-[#2563EB] text-[11px] font-medium border border-[#BFDBFE]">
                                  {doc}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action Row */}
                        <div className="pt-3 border-t border-[#F1F5F9] flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedSchemeAnalysis({ scheme, ruleResult, mlResult })}
                              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
                            >
                              <span>{t('kioskViewDetails', 'View Full Scheme Details')}</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleLocalBookmark(scheme.id)}
                              className={`min-h-[44px] px-3.5 py-2.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-colors ${
                                checkIsBookmarked(scheme.id)
                                  ? 'bg-[#EAF2FF] border-blue-300 text-[#2563EB]'
                                  : 'bg-white hover:bg-[#F8FAFC] border-[#DCE5EF] text-[#64748B]'
                              }`}
                              title="Bookmark Scheme"
                            >
                              <Bookmark className="w-4 h-4" />
                            </button>
                          </div>

                          {(scheme.officialWebsite || scheme.officialApplyUrl) && (
                            <a
                              href={scheme.officialApplyUrl || scheme.officialWebsite}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-white hover:bg-[#F1F5F9] text-[#12365B] font-bold text-xs flex items-center gap-1.5 border border-[#DCE5EF] transition-colors"
                            >
                              <span>{t('kioskOfficialApply', 'Official Application Portal')}</span>
                              <ExternalLink className="w-3.5 h-3.5 text-[#2563EB]" />
                            </a>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>
            )}

          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* VIEW 3: DOCUMENT VAULT (REPLACES NEARBY SERVICE CENTRES) */}
        {/* ------------------------------------------------------------------ */}
        {activeView === 'vault' && (
          <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8 bg-[#F8FAFC]">
            {user ? (
              <DocumentVault
                user={user}
                onOpenOCR={onOpenOCR || (() => {})}
                onDeleteDoc={onDeleteDoc || (() => {})}
                className="py-4 sm:py-6"
              />
            ) : (
              <div className="bg-white border border-[#DCE5EF] rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto space-y-6 my-12 shadow-sm">
                <div className="w-16 h-16 rounded-3xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-[#12365B]">
                    {t('kioskVaultGuestTitle', 'Document Vault Access Required')}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
                    {t(
                      'kioskVaultGuestSubtitle',
                      'Sign in or create an account to securely access, scan with OCR, and manage your welfare documents with end-to-end encryption.'
                    )}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#DCE5EF] text-xs text-[#64748B] text-left space-y-2">
                  <div className="flex items-center gap-2 font-bold text-[#12365B]">
                    <Lock className="w-4 h-4 text-purple-600" />
                    <span>Citizen Isolation & Encryption Guarantee</span>
                  </div>
                  <p>
                    Your documents are strictly isolated to your verified account. No unauthorized third party or kiosk visitor can view your documents.
                  </p>
                </div>
                <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenAuth) {
                        onOpenAuth('login', t('kioskAuthVaultNotice', 'Please sign in to access your secure Document Vault.'));
                      }
                    }}
                    className="min-h-[48px] px-8 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md transition-all active:scale-95"
                  >
                    Sign In / Create Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveView('home')}
                    className="min-h-[48px] px-6 py-3 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#64748B] font-bold text-xs"
                  >
                    Back to Kiosk
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* VIEW 4: MY APPLICATIONS (LIGHT THEME) */}
        {/* ------------------------------------------------------------------ */}
        {activeView === 'tracker' && (
          <div className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-8 bg-[#F8FAFC]">
            {user ? (
              <ApplicationTracker
                applications={applications}
                schemes={schemes}
                user={user}
                onTrackApplication={onTrackApplication}
                onNavigateTab={(tab) => {
                  if (tab === 'schemes') setActiveView('schemes');
                  else if (tab === 'home') setActiveView('home');
                  else if (tab === 'vault') setActiveView('vault');
                }}
              />
            ) : (
              <div className="bg-white border border-[#DCE5EF] rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto space-y-6 my-12 shadow-sm">
                <div className="w-16 h-16 rounded-3xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center mx-auto">
                  <ClipboardList className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-[#12365B]">
                    {t('kioskTrackerSignInTitle', 'Application Tracker Access')}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#64748B]">
                    {t('kioskTrackerSignInDesc', 'Sign in with your citizen account to track real-time government scheme application stages, review dates, and benefit disbursal.')}
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenAuth) {
                        onOpenAuth('login', t('kioskAuthTrackerNotice', 'Please sign in to track your applications.'));
                      }
                    }}
                    className="min-h-[48px] px-8 py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all active:scale-95"
                  >
                    Sign In to Track Applications
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* VIEW 5: TALK TO GOVSCHEME AI ASSISTANT (LIGHT THEME) */}
        {/* ------------------------------------------------------------------ */}
        {activeView === 'assistant' && (
          <div className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-8 flex flex-col justify-between space-y-6 bg-[#F8FAFC]">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A] flex items-center justify-center mx-auto shadow-sm">
                <Bot className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#12365B]">
                {t('kioskCard5Title', 'Talk to GovScheme AI')}
              </h2>
              <p className="text-xs sm:text-sm text-[#64748B] max-w-md mx-auto">
                Ask in English, हिन्दी, தமிழ் or any of the 7 supported languages. Touch the microphone to speak or type below.
              </p>
            </div>

            {/* Chat Conversation History */}
            <div className="flex-1 min-h-[350px] bg-white border border-[#DCE5EF] rounded-3xl p-4 sm:p-6 space-y-4 overflow-y-auto max-h-[500px] shadow-sm">
              {assistantMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 space-y-2 text-xs sm:text-sm shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-[#2563EB] text-white'
                        : 'bg-[#F8FAFC] text-[#12365B] border border-[#DCE5EF]'
                    }`}
                  >
                    <p className="leading-relaxed">{msg.text}</p>
                    <span className={`text-[10px] block ${msg.sender === 'user' ? 'text-blue-200 text-right' : 'text-[#64748B]'}`}>
                      {msg.time}
                    </span>

                    {/* Matched Scheme Cards inside Chat */}
                    {msg.schemes && msg.schemes.length > 0 && (
                      <div className="pt-2 space-y-2 border-t border-[#E2E8F0]">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#2563EB] block">
                          Suggested Schemes:
                        </span>
                        {msg.schemes.map(sch => (
                          <div
                            key={sch.id}
                            onClick={() => {
                              const rule = evaluateSchemeEligibility(user || null, sch);
                              const ml = computeMLRecommendation(user || null, sch, rule, schemes);
                              setSelectedSchemeAnalysis({ scheme: sch, ruleResult: rule, mlResult: ml });
                            }}
                            className="p-3 bg-white hover:bg-[#F1F5F9] rounded-xl border border-[#DCE5EF] cursor-pointer flex items-center justify-between text-[#12365B] transition-colors"
                          >
                            <span className="font-bold text-xs">{sch.name}</span>
                            <ChevronRight className="w-4 h-4 text-[#2563EB]" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Microphone & Text Input Control */}
            <div className="space-y-3 bg-white border border-[#DCE5EF] p-4 rounded-2xl shadow-sm">
              {voiceError && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[#92400E] text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#D97706] shrink-0" />
                  <span>{voiceError}</span>
                </div>
              )}

              <div className="flex items-center gap-3">
                {/* Large Microphone Button */}
                <button
                  type="button"
                  onClick={handleStartVoiceRecording}
                  disabled={isVoiceListening}
                  className={`min-h-[50px] px-5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all active:scale-95 shadow-sm ${
                    isVoiceListening
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-[#F59E0B] hover:bg-[#D97706] text-white'
                  }`}
                >
                  <Mic className="w-5 h-5" />
                  <span>{isVoiceListening ? t('listening', 'Listening...') : t('speakNow', 'Tap to Speak')}</span>
                </button>

                {/* Text Fallback Input */}
                <input
                  type="text"
                  value={voiceInputText}
                  onChange={e => setVoiceInputText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSendVoiceQuery(voiceInputText);
                  }}
                  placeholder={isVoiceListening ? 'Listening to your voice...' : 'Type or tap mic to speak in English / हिन्दी / தமிழ்...'}
                  className="flex-1 min-h-[48px] px-4 rounded-xl bg-[#F8FAFC] border border-[#DCE5EF] text-[#12365B] text-xs sm:text-sm outline-none focus:border-[#2563EB]"
                />

                <button
                  type="button"
                  onClick={() => handleSendVoiceQuery(voiceInputText)}
                  className="min-h-[48px] px-5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center transition-colors shrink-0 shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* -------------------------------------------------------------------- */}
      {/* INACTIVITY WARNING COUNTDOWN MODAL (LIGHT THEME) */}
      {/* -------------------------------------------------------------------- */}
      <AnimatePresence>
        {showInactivityModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white border-2 border-red-500 rounded-3xl max-w-md w-full p-6 sm:p-8 text-center space-y-5 shadow-2xl text-[#12365B]"
            >
              <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto animate-bounce">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-[#12365B]">
                  {t('kioskInactivityWarning', 'Session Inactivity Warning')}
                </h3>
                <p className="text-xs sm:text-sm text-[#64748B]">
                  {t('kioskInactivityDesc', 'Are you still using this terminal? To protect your personal privacy, this session will reset in')}
                </p>
                <div className="text-5xl font-black text-red-600 font-mono py-2">
                  {idleTimeRemaining}
                </div>
                <p className="text-[11px] text-[#64748B]">
                  {t('kioskSeconds', 'seconds remaining')}
                </p>
              </div>
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={resetIdleTimer}
                  className="w-full min-h-[50px] py-3 rounded-2xl bg-[#16A34A] hover:bg-emerald-700 text-white font-extrabold text-sm sm:text-base shadow-md transition-all active:scale-95"
                >
                  {t('kioskContinueSession', 'Continue My Session')}
                </button>
                <button
                  type="button"
                  onClick={handleEndSession}
                  className="w-full min-h-[46px] py-2.5 rounded-2xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#64748B] font-bold text-xs transition-colors border border-[#DCE5EF]"
                >
                  {t('kioskEndSessionNow', 'End Session Now')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* -------------------------------------------------------------------- */}
      {/* SCHEME MODAL (TOUCHSCREEN DETAILS VIEW) */}
      {/* -------------------------------------------------------------------- */}
      {selectedSchemeAnalysis && (
        <SchemeModal
          user={user || null}
          analysis={selectedSchemeAnalysis}
          onClose={() => setSelectedSchemeAnalysis(null)}
          currentLang={activeLangCode}
          onToggleBookmark={handleToggleLocalBookmark}
          isBookmarked={checkIsBookmarked(selectedSchemeAnalysis.scheme.id)}
          onNavigateTab={(tab) => {
            setSelectedSchemeAnalysis(null);
            if (tab === 'vault') setActiveView('vault');
            else if (tab === 'tracker') setActiveView('tracker');
            else if (tab === 'schemes') setActiveView('schemes');
          }}
        />
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 58mm / 80mm POS Thermal Receipt Dialog */}
      {/* -------------------------------------------------------------------- */}
      <KioskThermalReceiptModal
        isOpen={isThermalReceiptOpen}
        onClose={() => setIsThermalReceiptOpen(false)}
        profile={recFormData}
        schemes={schemes}
      />

      {/* -------------------------------------------------------------------- */}
      {/* FOOTER BAR (LIGHT THEME) */}
      {/* -------------------------------------------------------------------- */}
      <footer className="bg-white border-t border-[#DCE5EF] px-4 sm:px-8 py-3 flex items-center justify-between text-xs text-[#64748B]">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[#16A34A]" />
          <span className="font-semibold text-[#12365B]">GovScheme Terminal v2.4</span>
          <span className="hidden md:inline">• National e-Governance Infrastructure</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleEndSession}
            className="min-h-[40px] px-4 py-1.5 rounded-xl bg-[#F1F5F9] hover:bg-red-50 text-[#64748B] hover:text-red-600 font-bold text-xs flex items-center gap-1.5 border border-[#DCE5EF] hover:border-red-200 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('kioskEndSession', 'End Session')}</span>
          </button>
        </div>
      </footer>

    </div>
  );
};
