import React from 'react';
import {
  Building2,
  Zap,
  Search,
  Filter,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  GraduationCap,
  Tractor,
  HeartPulse,
  Home,
  Briefcase,
  Baby,
  Rocket,
  IndianRupee,
  Monitor,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { LanguageCode, UserProfile, Scheme } from '../types';

interface LandingPageProps {
  currentLang: LanguageCode;
  onGetStarted: (mode: 'wizard' | 'life-event' | 'what-can-i-get') => void;
  onTalkToAI: () => void;
  onNavigateTab: (tab: string) => void;
  onSelectCategory?: (category: string) => void;
  topSchemes: Scheme[];
  user: UserProfile | null;
  onLiveDemo?: () => void;
  onOpenAuth?: () => void;
}

// Magnetic Button Component
const MagneticButton = ({ children, onClick, className }: { children: React.ReactNode, onClick?: () => void, className?: string }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((e.clientX - centerX) * 0.2);
    y.set((e.clientY - centerY) * 0.2);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className={`relative overflow-hidden group ${className}`}
    >
      {children}
    </motion.button>
  );
};

// 2D Card Component
const TiltCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({
  currentLang: _currentLang,
  onGetStarted,
  onTalkToAI,
  onNavigateTab,
  onSelectCategory,
  topSchemes,
  user,
  onLiveDemo: _onLiveDemo,
  onOpenAuth
}) => {
  const { t } = useTranslation();

  // 8 Specific Scheme Categories with exact specified hex accent colours
  const categories = [
    { key: 'Education', icon: GraduationCap, label: t('Education'), color: '#2563EB' },
    { key: 'Agriculture', icon: Tractor, label: t('Agriculture'), color: '#16A34A' },
    { key: 'Healthcare', icon: HeartPulse, label: t('Healthcare'), color: '#F87171' },
    { key: 'Housing', icon: Home, label: t('Housing'), color: '#9333EA' },
    { key: 'Employment', icon: Briefcase, label: t('Employment'), color: '#F59E0B' },
    { key: 'Women & Child', icon: Baby, label: t('Women & Child'), color: '#DB2777' },
    { key: 'Entrepreneurship', icon: Rocket, label: t('Entrepreneurship'), color: '#0D9488' },
    { key: 'Financial Help', icon: IndianRupee, label: t('Financial Help'), color: '#CA8A04' },
  ];

  return (
    <div className="pt-4 sm:pt-6 pb-16 space-y-10 sm:space-y-12 bg-[#F8FAFC] dark:bg-[#07111F] min-h-screen relative overflow-hidden">
      {/* Clean Background Pattern */}
      <div className="absolute inset-0 bg-white dark:bg-[#07111F] z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMWgxOG0tMTggMThoMTgiIHN0cm9rZT0icmdiYSgwLDAsMCwwLjAyKSIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==')] opacity-50 dark:opacity-20" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 space-y-8 sm:space-y-10">

        {user ? (
          <>
            {/* 1. GOOD MORNING, CITIZEN WELCOME & RECOMMENDATIONS BANNER */}
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white dark:bg-[#0B1220]/70 p-6 sm:p-8 rounded-3xl border border-[#DCE5EF] dark:border-white/10 shadow-sm"
            >
              <div className="space-y-2 text-center md:text-left">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#12365B] dark:text-white font-sans tracking-tight">
                  {t('goodMorningCitizen', 'Good morning, Citizen').replace('Citizen', user.fullName ? user.fullName.split(' ')[0] : 'Citizen')}
                </h1>
                <p className="text-[#64748B] dark:text-gray-400 text-base sm:text-lg">
                  {t('basedOnProfileIn', 'Based on your profile in')}{' '}
                  <span className="font-bold text-[#12365B] dark:text-white">
                    {user.state ? (t(user.state, t(`state_${user.state.replace(/\s+/g, '')}`, user.state))) : t('India', 'India')}
                  </span>{' '}
                  {t('andYourInterests', 'and your interests:')}
                </p>
                <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <span className="px-4 py-1.5 bg-[#16A34A]/10 text-[#16A34A] font-bold text-sm rounded-full border border-[#16A34A]/20">
                    {topSchemes.length > 0 ? `${topSchemes.length}` : '75'}+ {t('schemesMayBeRelevant', 'schemes may be relevant to you')}
                  </span>
                  {user.verificationBadge && (
                    <span className="px-3 py-1 bg-[#2563EB]/10 text-[#2563EB] font-bold text-xs rounded-full border border-[#2563EB]/20 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {t('verifiedCitizen', 'Verified Citizen')}
                    </span>
                  )}
                </div>
              </div>
              <MagneticButton
                onClick={() => onNavigateTab('schemes')}
                className="group relative overflow-hidden rounded-full bg-[#12365B] dark:bg-white p-2 flex items-center justify-between shadow-lg shrink-0 w-full sm:w-auto min-w-[240px]"
              >
                <span className="text-white dark:text-black font-bold text-sm pl-6 pr-4">
                  {t('viewMyRecommendations', 'View My Recommendations')}
                </span>
                <div className="w-10 h-10 rounded-full bg-white/10 dark:bg-black/10 flex items-center justify-center transition-transform group-hover:scale-105">
                  <ArrowRight className="w-5 h-5 text-white dark:text-black group-hover:translate-x-1 transition-transform" />
                </div>
              </MagneticButton>
            </motion.section>

            {/* 2. COMPLETE YOUR PROFILE CARD/BOX */}
            <motion.section
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="bg-white dark:bg-[#0F1B2D] p-6 sm:p-7 rounded-2xl border border-[#DCE5EF] dark:border-white/10 shadow-sm"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#F59E0B]/10 flex items-center justify-center shrink-0">
                    <UserCheck className="w-7 h-7 text-[#F59E0B]" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl sm:text-2xl font-bold text-[#12365B] dark:text-white">
                        {t('completeYourProfile', 'Complete Your Profile')}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30">
                        {user.profileCompletionScore}%
                      </span>
                    </div>
                    <p className="text-sm sm:text-base text-[#64748B] dark:text-gray-400 max-w-2xl">
                      {t('unlockMoreAccurateAI', 'Unlock more accurate AI recommendations by updating your details.')}
                    </p>
                    <div className="pt-2 max-w-md w-full">
                      <div className="w-full bg-[#EAF2FF] dark:bg-gray-800 rounded-full h-2">
                        <div
                          className="bg-[#F59E0B] h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(10, user.profileCompletionScore)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-auto shrink-0 flex items-center gap-3">
                  <button
                    onClick={() => onNavigateTab('profile')}
                    className="w-full md:w-auto px-6 py-3 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{t('updateProfile', 'Update Profile')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.section>
          </>
        ) : (
          /* PUBLIC VISITOR HERO BANNER (BEFORE SIGN IN) */
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/40 dark:from-[#0B1220] dark:via-[#0F1B2D] dark:to-[#0B1220] p-6 sm:p-10 rounded-3xl border border-[#DCE5EF] dark:border-white/10 shadow-sm overflow-hidden"
          >
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -mr-28 -mt-28 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl -ml-24 -mb-24 pointer-events-none" />

            <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600/10 dark:bg-blue-400/10 border border-blue-600/20 dark:border-blue-400/20 text-[#12365B] dark:text-blue-300 text-xs font-bold shadow-sm">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{t('aiPoweredWelfarePortal', 'AI-Powered Citizen Welfare Discovery Engine')}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#12365B] dark:text-white font-sans tracking-tight leading-tight">
                {t('tagline', "Find Government Schemes You're Eligible For")}
              </h1>

              <p className="text-[#64748B] dark:text-gray-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                {t('heroSubtitle', 'Helping Indian citizens & rural households discover welfare schemes in minutes using Artificial Intelligence & Rule-Based Eligibility Engine.')}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 pt-1">
                <span className="px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {topSchemes.length > 0 ? `${topSchemes.length}+` : '75+'} {t('Central & State Schemes', 'Central & State Schemes')}
                </span>
                <span className="px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-700 dark:text-blue-400 font-bold text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {t('freePublicAdvisory', '100% Free Public Advisory')}
                </span>
                <span className="px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-700 dark:text-purple-400 font-bold text-xs flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  {t('instantMatching', 'Instant Eligibility Match')}
                </span>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5">
                <button
                  type="button"
                  onClick={() => onGetStarted('wizard')}
                  className="px-6 sm:px-8 py-3.5 rounded-2xl bg-[#1769FF] hover:bg-blue-700 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group cursor-pointer"
                >
                  <span>{t('checkEligibilityWizard', 'Check My Eligibility')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateTab('schemes')}
                  className="px-6 py-3.5 rounded-2xl bg-white dark:bg-[#111827] border border-[#DCE5EF] dark:border-white/10 text-[#12365B] dark:text-white font-bold text-sm shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center gap-2 cursor-pointer"
                >
                  <Search className="w-4 h-4 text-[#1769FF]" />
                  <span>{t('exploreSchemes', 'Explore Schemes')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenAuth ? onOpenAuth() : onNavigateTab('auth')}
                  className="px-6 py-3.5 rounded-2xl bg-[#12365B] hover:bg-[#0c243d] dark:bg-white dark:text-slate-900 text-white font-bold text-sm shadow-sm transition flex items-center gap-2 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{t('signIn', 'Sign In')} / {t('signUp', 'Sign Up')}</span>
                </button>
              </div>

              {/* 4 Feature Value Pillars Before Sign In */}
              <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-left border-t border-[#DCE5EF]/60 dark:border-white/10 mt-6">
                <div className="p-4 rounded-xl bg-white/70 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#12365B] dark:text-white">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>{t('instantMatching', 'Instant Eligibility Match')}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-gray-400">
                    {t('instantMatchPillar', 'Filter 75+ schemes against your exact demographic profile with zero paperwork.')}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/70 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#12365B] dark:text-white">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>{t('verifiedCitizenVault', 'Intelligent Document Vault')}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-gray-400">
                    {t('docVaultPillar', 'Secure client-side OCR for Aadhaar, Income & Caste certificates with masked privacy.')}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/70 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#12365B] dark:text-white">
                    <Building2 className="w-4 h-4 text-blue-500" />
                    <span>{t('multiLangVoice', '7 Regional Languages')}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-gray-400">
                    {t('voiceAssistantPillar', 'Voice commands and native translations across Tamil, Hindi, Telugu, and more.')}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/70 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#12365B] dark:text-white">
                    <Monitor className="w-4 h-4 text-purple-500" />
                    <span>{t('cscKioskMode', 'CSC Kiosk Mode')}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-gray-400">
                    {t('kioskPillar', 'Accessible touch interface with instant thermal receipt generation for rural CSCs.')}
                  </p>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* 3. BROWSE SCHEMES BY CATEGORY (8 CARDS - POSITIONED IMMEDIATELY AFTER COMPLETE YOUR PROFILE) */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#12365B] dark:text-white font-sans">
              {t('exploreByCategoryTitle', 'Explore Government Schemes by Category')}
            </h2>
            <p className="text-[#64748B] dark:text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
              {t('exploreByCategorySubtitle', 'Find government schemes based on your needs and interests.')}
            </p>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {categories.map((cat) => (
              <TiltCard key={cat.key}>
                <div
                  onClick={() => {
                    if (onSelectCategory) {
                      onSelectCategory(cat.key);
                    } else {
                      onNavigateTab('schemes');
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      if (onSelectCategory) onSelectCategory(cat.key);
                      else onNavigateTab('schemes');
                    }
                  }}
                  className="group cursor-pointer bg-white dark:bg-[#0B1220]/70 border border-[#DCE5EF] dark:border-white/10 p-6 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md hover:border-[#2563EB]/40 transition-all duration-200 select-none h-full min-h-[170px]"
                >
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-sm transition-transform duration-200 group-hover:scale-105"
                    style={{ backgroundColor: cat.color }}
                  >
                    <cat.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#12365B] dark:text-white font-sans mt-4 group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors">
                    {cat.label}
                  </h3>
                </div>
              </TiltCard>
            ))}
          </div>
        </section>

        {/* 4. EXISTING RECOMMENDED SCHEMES & 5. EXISTING UPCOMING DEADLINES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recommended for You */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-[#12365B] dark:text-white">
                {t('recommendedForYou', 'Recommended for You')}
              </h2>
              <button
                onClick={() => onNavigateTab('schemes')}
                className="text-sm font-bold text-[#2563EB] hover:underline flex items-center gap-1"
              >
                <span>{t('viewAll', 'View All')}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {topSchemes.slice(0, 3).map(scheme => (
                <div
                  key={scheme.id}
                  className="bg-white dark:bg-[#0F1B2D] p-4 rounded-xl border border-[#DCE5EF] dark:border-white/5 flex items-center justify-between group hover:border-[#2563EB] transition-colors cursor-pointer shadow-sm hover:shadow-md"
                  onClick={() => onNavigateTab('schemes')}
                >
                  <div>
                    <h4 className="font-bold text-sm text-[#12365B] dark:text-white mb-1 group-hover:text-[#2563EB] transition-colors">
                      {t(`${scheme.id}_name`, scheme.name)}
                    </h4>
                    <p className="text-xs text-[#64748B] dark:text-gray-400 line-clamp-1">
                      {t(`${scheme.id}_desc`, scheme.shortDescription)}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[#64748B] dark:text-gray-600 group-hover:text-[#2563EB] transition-colors shrink-0 ml-4" />
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold text-[#12365B] dark:text-white">
              {t('upcomingDeadlines', 'Upcoming Deadlines')}
            </h2>
            <div className="bg-red-50 dark:bg-red-900/10 p-5 rounded-2xl border border-red-100 dark:border-red-900/30 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-red-900 dark:text-red-400">
                    {t('pm-kisan_name', 'PM Kisan Samman Nidhi')}
                  </h4>
                  <p className="text-xs text-red-700 dark:text-red-500">
                    {t('ekycDeadline', 'e-KYC Deadline in 5 days')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('schemes')}
                className="w-full py-2.5 bg-white dark:bg-[#111827] border border-red-200 dark:border-red-900/50 rounded-lg text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                {t('completeNow', 'Complete Now')}
              </button>
            </div>
          </div>
        </div>

        {/* 6. ALL REMAINING EXISTING HOMEPAGE SECTIONS */}
        {/* Quick Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div
            className="bg-white dark:bg-[#0F1B2D] p-6 rounded-2xl border border-[#DCE5EF] dark:border-white/5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onNavigateTab('tracker')}
          >
            <div className="w-12 h-12 bg-[#2563EB]/10 rounded-full flex items-center justify-center mb-4">
              <Building2 className="w-6 h-6 text-[#2563EB]" />
            </div>
            <h3 className="font-bold text-[#12365B] dark:text-white mb-2">{t('continueApplications', 'Continue Applications')}</h3>
            <p className="text-sm text-[#64748B] dark:text-gray-400">{t('youHavePendingApp', 'Track and manage your government scheme applications.')}</p>
          </div>

          <div
            className="bg-white dark:bg-[#0F1B2D] p-6 rounded-2xl border border-[#DCE5EF] dark:border-white/5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={onTalkToAI}
          >
            <div className="w-12 h-12 bg-[#9333EA]/10 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6 text-[#9333EA]" />
            </div>
            <h3 className="font-bold text-[#12365B] dark:text-white mb-2">{t('aiDocAssistant', 'AI Document Assistant (Auto-Detect)')}</h3>
            <p className="text-sm text-[#64748B] dark:text-gray-400">{t('needHelpIdentifyingDoc', 'Need help identifying or verifying a government document? Ask AI.')}</p>
          </div>

          <div
            className="bg-white dark:bg-[#0F1B2D] p-6 rounded-2xl border border-[#DCE5EF] dark:border-white/5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onNavigateTab('kiosk')}
          >
            <div className="w-12 h-12 bg-[#F59E0B]/10 rounded-full flex items-center justify-center mb-4">
              <Monitor className="w-6 h-6 text-[#F59E0B]" />
            </div>
            <h3 className="font-bold text-[#12365B] dark:text-white mb-2">{t('cscKioskMode', 'CSC Kiosk Mode')}</h3>
            <p className="text-sm text-[#64748B] dark:text-gray-400">{t('kioskCardDesc', 'Assisted mode for operators to generate instant printable beneficiary reports.')}</p>
          </div>
        </div>

        {/* 4-Step Interactive Workflow */}
        <section className="space-y-6 pt-4">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl font-extrabold text-[#12365B] dark:text-white font-sans">
              {t('howItWorks', 'How it Works')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
            <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-[#DCE5EF] -z-10 -translate-y-1/2" />

            {[
              { title: t('step1Title', 'Tell us about yourself'), icon: UserCheck },
              { title: t('step2Title', 'Analyze eligibility'), icon: Zap },
              { title: t('step3Title', 'Discover matching schemes'), icon: Search },
              { title: t('step4Title', 'Understand why you qualify'), icon: Filter },
              { title: t('apply', 'Apply'), icon: ExternalLink }
            ].map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white border border-[#DCE5EF] p-6 rounded-2xl flex flex-col items-center text-center space-y-4 shadow-sm hover:shadow-md transition-shadow relative z-10"
              >
                <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold bg-white text-[#12365B] border-4 border-[#F8FAFC] shadow-inner">
                  <step.icon className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-[#12365B] font-sans">
                  {step.title}
                </h4>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="pt-8 border-t border-[#DCE5EF] dark:border-white/10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
            {[
              { icon: Search, label: t('Schemes Available'), value: topSchemes.length > 0 ? `${topSchemes.length}+` : '75+', color: 'text-[#2563EB]' },
              { icon: ShieldCheck, label: t('Central & State Schemes'), value: t('Curated', 'Curated'), color: 'text-[#16A34A]' },
              { icon: UserCheck, label: t('Personalized Eligibility'), value: t('AI Match', 'AI Match'), color: 'text-[#F59E0B]' },
              { icon: CheckCircle2, label: t('Official Scheme Sources'), value: t('Official Portals', 'Official Portals'), color: 'text-[#12365B]' }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center space-y-2 group">
                <div className={`p-3 rounded-full bg-gray-50 dark:bg-gray-800/50 group-hover:bg-gray-100 transition-colors ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <span className="text-xl font-bold text-[#12365B] dark:text-white">{stat.value}</span>
                <span className="text-xs text-[#64748B] dark:text-gray-400 font-medium text-center uppercase tracking-wider">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};
