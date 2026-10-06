import React, { useState, useEffect } from 'react';
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
  IndianRupee
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, useAnimation, useMotionValue, useSpring } from 'framer-motion';
import { LanguageCode, UserProfile, Scheme } from '../types';
import { GovSchemeLogo3D } from './brand';

interface LandingPageProps {
  currentLang: LanguageCode;
  onGetStarted: (mode: 'wizard' | 'life-event' | 'what-can-i-get') => void;
  onTalkToAI: () => void;
  onNavigateTab: (tab: string) => void;
  topSchemes: Scheme[];
  user: UserProfile | null;
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
  currentLang,
  onGetStarted,
  onTalkToAI,
  onNavigateTab,
  topSchemes,
  user
}) => {
  const { t } = useTranslation();
  
  // Hero Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.2 }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  const categories = [
    { icon: GraduationCap, label: t('Education'), color: 'from-blue-500 to-gov-blue' },
    { icon: Tractor, label: t('Agriculture'), color: 'from-green-500 to-gov-green' },
    { icon: HeartPulse, label: t('Healthcare'), color: 'from-red-400 to-gov-red' },
    { icon: Home, label: t('Housing'), color: 'from-purple-500 to-purple-700' },
    { icon: Briefcase, label: t('Employment'), color: 'from-gov-saffron to-orange-600' },
    { icon: Baby, label: t('Women & Child'), color: 'from-pink-500 to-pink-700' },
    { icon: Rocket, label: t('Entrepreneurship'), color: 'from-teal-500 to-teal-700' },
    { icon: IndianRupee, label: t('Financial Help'), color: 'from-yellow-500 to-yellow-700' },
  ];

  return (
    <div className="pt-12 pb-12 space-y-12 bg-[#F8FAFC] dark:bg-[#07111F] min-h-screen relative overflow-hidden">
      
      {/* Clean 2D Background */}
      <div className="absolute inset-0 bg-white dark:bg-[#07111F] z-0">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEgMWgxOG0tMTggMThoMTgiIHN0cm9rZT0icmdiYSgwLDAsMCwwLjAyKSIgZmlsbD0ibm9uZSIvPjwvc3ZnPg==')] opacity-50 dark:opacity-20 pointer-events-none" />
      </div>

      {user ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 pt-4 space-y-8">
          {/* AI-Powered Personalized Home Dashboard */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/60 dark:bg-[#0B1220]/60 backdrop-blur-xl p-8 rounded-3xl border border-gov-border dark:border-white/10 shadow-sm"
          >
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gov-navy dark:text-white font-sans tracking-tight mb-2">
                {t('goodMorningCitizen', 'Good morning, Citizen').replace('Citizen', user.fullName.split(' ')[0] || 'Citizen')}
              </h1>
              <p className="text-gov-textMuted dark:text-gray-400 text-lg">
                {t('basedOnProfileIn', 'Based on your profile in')} <span className="font-bold text-gov-navy dark:text-white">{user.state ? t(`state_${user.state.replace(/\\s+/g, '')}`, user.state) : 'India'}</span> {t('andYourInterests', 'and your interests:')}
              </p>
              <div className="mt-4 flex items-center gap-3">
                <span className="px-4 py-1.5 bg-gov-green/10 text-gov-green font-bold text-sm rounded-full border border-gov-green/20">
                  {topSchemes.length} {t('schemesMayBeRelevant', 'schemes may be relevant to you')}
                </span>
              </div>
            </div>
            <MagneticButton
              onClick={() => onNavigateTab('schemes')}
              className="group relative overflow-hidden rounded-full bg-gov-navy dark:bg-white p-2 flex items-center justify-between shadow-lg shrink-0"
            >
              <span className="text-white dark:text-black font-bold text-sm pl-6 pr-4">
                {t('viewMyRecommendations', 'View My Recommendations')}
              </span>
              <div className="w-10 h-10 rounded-full bg-white/10 dark:bg-black/10 flex items-center justify-center transition-transform group-hover:scale-105">
                <ArrowRight className="w-5 h-5 text-white dark:text-black group-hover:translate-x-1 transition-transform" />
              </div>
            </MagneticButton>
          </motion.div>

          {/* Quick Action Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-[#0F1B2D] p-6 rounded-2xl border border-gov-border dark:border-white/5 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => onNavigateTab('profile')}>
              <div className="w-12 h-12 bg-gov-saffron/10 rounded-full flex items-center justify-center mb-4">
                <UserCheck className="w-6 h-6 text-gov-saffron" />
              </div>
              <h3 className="font-bold text-gov-navy dark:text-white mb-2">{t('completeYourProfile', 'Complete Your Profile')}</h3>
              <p className="text-sm text-gov-textMuted dark:text-gray-400">{t('unlockMoreAccurateAI', 'Unlock more accurate AI recommendations by updating your details.')}</p>
              <div className="mt-4 w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                <div className="bg-gov-saffron h-1.5 rounded-full" style={{ width: `${user.profileCompletionScore}%` }}></div>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0F1B2D] p-6 rounded-2xl border border-gov-border dark:border-white/5 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => onNavigateTab('tracker')}>
              <div className="w-12 h-12 bg-gov-blue/10 rounded-full flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6 text-gov-blue" />
              </div>
              <h3 className="font-bold text-gov-navy dark:text-white mb-2">{t('continueApplications', 'Continue Applications')}</h3>
              <p className="text-sm text-gov-textMuted dark:text-gray-400">{t('youHavePendingApp', 'You have 1 pending application requiring document verification.')}</p>
            </div>

            <div className="bg-white dark:bg-[#0F1B2D] p-6 rounded-2xl border border-gov-border dark:border-white/5 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => onNavigateTab('assistant')}>
              <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-bold text-gov-navy dark:text-white mb-2">{t('aiDocAssistant', 'AI Document Assistant (Auto-Detect)')}</h3>
              <p className="text-sm text-gov-textMuted dark:text-gray-400">{t('needHelpIdentifyingDoc', 'Need help identifying or verifying a government document? Ask AI.')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recommended for You */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gov-navy dark:text-white">{t('recommendedForYou', 'Recommended for You')}</h2>
              <div className="space-y-3">
                {topSchemes.slice(0, 3).map(scheme => (
                  <div key={scheme.id} className="bg-white dark:bg-[#0F1B2D] p-4 rounded-xl border border-gov-border dark:border-white/5 flex items-center justify-between group hover:border-gov-blue transition-colors cursor-pointer" onClick={() => onNavigateTab('schemes')}>
                    <div>
                      <h4 className="font-bold text-sm text-gov-navy dark:text-white mb-1 group-hover:text-gov-blue transition-colors">
                        {t(`${scheme.id}_name`, scheme.name)}
                      </h4>
                      <p className="text-xs text-gov-textMuted dark:text-gray-400 line-clamp-1">
                        {t(`${scheme.id}_desc`, scheme.shortDescription)}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gov-border dark:text-gray-600 group-hover:text-gov-blue transition-colors shrink-0 ml-4" />
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Deadlines */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gov-navy dark:text-white">{t('upcomingDeadlines', 'Upcoming Deadlines')}</h2>
              <div className="bg-red-50 dark:bg-red-900/10 p-5 rounded-2xl border border-red-100 dark:border-red-900/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-red-900 dark:text-red-400">{t('pm-kisan_name', 'PM Kisan Samman Nidhi')}</h4>
                    <p className="text-xs text-red-700 dark:text-red-500">{t('ekycDeadline', 'e-KYC Deadline in 5 days')}</p>
                  </div>
                </div>
                <button className="w-full py-2 bg-white dark:bg-[#111827] border border-red-200 dark:border-red-900/50 rounded-lg text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  {t('completeNow', 'Complete Now')}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10 pt-4">
        <motion.section 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="relative bg-white/60 dark:bg-[#0B1220]/60 backdrop-blur-2xl text-gov-text dark:text-white rounded-[2rem] p-2 shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden"
        >
          {/* Inner Core for Double-Bezel */}
          <div className="bg-white/40 dark:bg-[#050505]/40 backdrop-blur-xl rounded-[calc(2rem-0.5rem)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border border-white/40 dark:border-white/5 p-6 sm:p-12 relative overflow-hidden">
            {/* Subtle animated gradient background elements */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-gov-navy/5 dark:from-white/5 to-transparent rounded-full blur-3xl -mr-64 -mt-64"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 2, delay: 0.5, ease: "easeOut" }}
              className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-gov-saffron/5 dark:from-gov-saffron/10 to-transparent rounded-full blur-3xl -ml-32 -mb-32"
            />

            <div className="relative max-w-5xl mx-auto flex flex-col md:flex-row items-center text-center md:text-left gap-12">
              
              <div className="flex-1 space-y-6 flex flex-col items-center md:items-start">
                <motion.h1 variants={itemVariants} className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight font-sans text-gov-navy dark:text-white">
                  {t('tagline', "Find Government Schemes You May Be Eligible For")}
                </motion.h1>

                <motion.p variants={itemVariants} className="text-gov-textMuted dark:text-gray-400 text-lg sm:text-2xl max-w-2xl leading-relaxed">
                  {t('heroSubtitle', 'Answer a few simple questions and discover government schemes relevant to your age, income, occupation, location and other eligibility criteria.')}
                </motion.p>

                {/* Primary Action Buttons */}
                <motion.div variants={itemVariants} className="pt-6 flex flex-col sm:flex-row items-center gap-4 w-full md:justify-start justify-center">
                  <MagneticButton
                    onClick={() => onGetStarted('wizard')}
                    className="group relative overflow-hidden rounded-full bg-gov-navy dark:bg-white p-2 flex items-center justify-between shadow-2xl w-full sm:w-auto min-w-[280px]"
                  >
                    <span className="text-white dark:text-black font-bold text-lg pl-6 pr-4">
                      {t('getStarted', 'Check My Eligibility')}
                    </span>
                    <div className="w-12 h-12 rounded-full bg-white/10 dark:bg-black/10 flex items-center justify-center transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:bg-white/20 dark:group-hover:bg-black/20 group-hover:scale-105">
                      <ArrowRight className="w-6 h-6 text-white dark:text-black group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                  </MagneticButton>

                  <MagneticButton
                    onClick={() => onGetStarted('life-event')}
                    className="group relative overflow-hidden rounded-full bg-white dark:bg-[#111827] p-2 flex items-center justify-between shadow-lg border border-gov-border dark:border-white/10 w-full sm:w-auto min-w-[240px]"
                  >
                    <span className="text-gov-navy dark:text-white font-bold text-lg pl-6 pr-8 w-full text-center">
                      {t('lifeEventMode', 'Life Event Mode')}
                    </span>
                  </MagneticButton>
                </motion.div>
              </div>

              {/* 3D Logo Hero Presentation */}
              <motion.div variants={itemVariants} className="flex-1 flex justify-center items-center w-full max-w-[320px] md:max-w-[400px]">
                <GovSchemeLogo3D size={320} interactive={true} />
              </motion.div>

            </div>
            
            {/* Trust Indicators */}
            <motion.div variants={itemVariants} className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 w-full border-t border-gov-border mt-4">
              {[
                { icon: Search, label: t('Schemes Available'), value: topSchemes.length > 0 ? `${topSchemes.length}+` : '4000+', color: 'text-gov-blue' },
                { icon: ShieldCheck, label: t('Central & State Schemes'), value: t('Verified'), color: 'text-gov-green' },
                { icon: UserCheck, label: t('Personalized Eligibility'), value: t('AI Match'), color: 'text-gov-saffron' },
                { icon: CheckCircle2, label: t('Official Scheme Sources'), value: t('100% Authentic'), color: 'text-gov-navy' }
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center space-y-3 group">
                  <div className={`p-3 rounded-full bg-gray-50 group-hover:bg-gray-100 transition-colors ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <span className="text-xl font-bold text-gov-navy">{stat.value}</span>
                  <span className="text-xs text-gov-textMuted dark:text-gray-400 font-medium text-center uppercase tracking-wider">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.section>
      </div>
      )}

      {/* Interactive Category Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center space-y-3 mb-10">
          <h2 className="text-2xl font-extrabold text-gov-navy font-sans">{t('browseByCategory', 'Browse by Category')}</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat, idx) => (
            <TiltCard key={idx}>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group cursor-pointer bg-white border border-gov-border p-6 rounded-2xl flex flex-col items-center text-center space-y-4 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold bg-gradient-to-br ${cat.color} text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <cat.icon className="w-7 h-7" />
                </div>
                <h4 className="text-sm font-bold text-gov-navy font-sans group-hover:text-gov-blue transition-colors">
                  {cat.label}
                </h4>
              </motion.div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* Simple 4-Step Interactive Workflow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-2xl font-extrabold text-gov-navy font-sans">
            {t('howItWorks', 'How it Works')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
          {/* Animated connector line for desktop */}
          <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-gov-border -z-10 -translate-y-1/2">
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: '100%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-gov-blue"
            />
          </div>

          {[
            { title: t('step1Title', 'Tell us about yourself'), icon: UserCheck },
            { title: t('step2Title', 'Analyze eligibility'), icon: Zap },
            { title: t('step3Title', 'Discover matching schemes'), icon: Search },
            { title: t('step4Title', 'Understand why you qualify'), icon: Filter },
            { title: t('apply', 'Apply'), icon: ExternalLink }
          ].map((step, idx) => (
             <motion.div 
                key={idx} 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="bg-white border border-gov-border p-6 rounded-2xl flex flex-col items-center text-center space-y-4 shadow-sm hover:shadow-md transition-shadow relative z-10"
             >
                <div className="w-14 h-14 rounded-full flex items-center justify-center font-bold bg-white text-gov-navy border-4 border-gov-background shadow-inner">
                  <step.icon className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-gov-navy font-sans">
                  {step.title}
                </h4>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};
