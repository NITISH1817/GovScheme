import React from 'react';
import {
  Building2,
  Sparkles,
  Bot,
  ShieldCheck,
  Globe2,
  ArrowRight,
  CheckCircle2,
  UserCheck,
  FileText,
  ExternalLink,
  Mic,
  ScanLine,
  Zap,
  Award,
  ChevronRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { LanguageCode, UserProfile, Scheme } from '../types';

interface LandingPageProps {
  currentLang: LanguageCode;
  onGetStarted: () => void;
  onTalkToAI: () => void;
  onNavigateTab: (tab: string) => void;
  topSchemes: Scheme[];
  user: UserProfile | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  currentLang,
  onGetStarted,
  onTalkToAI,
  onNavigateTab,
  topSchemes,
  user
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-16 py-6 pb-16">
      {/* Hero Section (USAJOBS Style) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative bg-uswds-primary text-white rounded-lg p-8 sm:p-14 shadow-sm border border-uswds-secondary"
        >
          <div className="relative max-w-4xl mx-auto flex flex-col items-start text-left space-y-6">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight font-sans">
              {t('heroTitle', "Find Government Schemes You're Eligible For")}
            </h1>

            <p className="text-blue-100 text-base sm:text-lg max-w-2xl leading-relaxed">
              {t('heroSubtitle', 'Helping citizens discover government benefits quickly using AI-powered eligibility recommendations.')}
            </p>

            {/* Primary Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <button
                onClick={onGetStarted}
                className="w-full sm:w-auto min-w-[160px] px-6 py-3.5 rounded-md bg-white text-uswds-primary font-bold text-sm sm:text-base shadow-sm transition hover:bg-slate-50 flex items-center justify-center gap-2"
              >
                <span className="whitespace-nowrap">{t('getStarted', 'Get Started')}</span>
              </button>

              <button
                onClick={() => onNavigateTab('schemes')}
                className="w-full sm:w-auto min-w-[160px] px-6 py-3.5 rounded-md bg-uswds-secondary hover:bg-blue-900 text-white font-bold text-sm sm:text-base transition flex items-center justify-center gap-2 border border-blue-800"
              >
                <span className="whitespace-nowrap">{t('exploreSchemes', 'Explore Schemes')}</span>
              </button>
            </div>
          </div>
        </motion.section>
      </div>

      {/* Three Core Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: AI Powered */}
          <div className="bg-white border border-uswds-border p-6 rounded-md shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
            <div className="w-12 h-12 rounded bg-uswds-background text-uswds-primary flex items-center justify-center mb-4 border border-uswds-border">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-uswds-primary font-sans mb-2">
              {t('aiPoweredTitle', 'AI Powered Match')}
            </h3>
            <p className="text-sm text-uswds-textMuted leading-relaxed flex-grow">
              {t('aiPoweredDesc', 'Our advanced engine matches your profile...')}
            </p>
          </div>

          {/* Card 2: Multilingual */}
          <div className="bg-white border border-uswds-border p-6 rounded-md shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
            <div className="w-12 h-12 rounded bg-uswds-background text-uswds-primary flex items-center justify-center mb-4 border border-uswds-border">
              <Globe2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-uswds-primary font-sans mb-2">
              {t('multilingualTitle', '10+ Languages')}
            </h3>
            <p className="text-sm text-uswds-textMuted leading-relaxed flex-grow">
              {t('multilingualDesc', 'Experience the platform in your native language...')}
            </p>
          </div>

          {/* Card 3: Government Verified */}
          <div className="bg-white border border-uswds-border p-6 rounded-md shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
            <div className="w-12 h-12 rounded bg-uswds-background text-uswds-primary flex items-center justify-center mb-4 border border-uswds-border">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-uswds-primary font-sans mb-2">
              {t('govtVerifiedTitle', 'Govt. Verified')}
            </h3>
            <p className="text-sm text-uswds-textMuted leading-relaxed flex-grow">
              {t('govtVerifiedDesc', 'Only 100% authentic schemes from official portals.')}
            </p>
          </div>
        </div>
      </section>

      {/* National Impact Stats Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-white rounded-md px-6 py-8 border-y-4 border-y-uswds-primary shadow-sm border-x border-x-uswds-border">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-uswds-textMuted mb-6">
            {t('nationalImpact', 'National Impact in Numbers')}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '15 Cr+', label: t('beneficiariesStat', 'Beneficiaries Reached') },
              { value: '₹2.5L Cr', label: t('disbursedStat', 'Benefits Disbursed') },
              { value: '500+', label: t('activeSchemesStat', 'Active Schemes') },
              { value: '28', label: t('statesCoveredStat', 'States Covered') },
            ].map((stat, i) => (
              <div key={i} className="space-y-1">
                <div className="text-3xl sm:text-4xl font-black font-sans text-uswds-primary tabular-nums">
                  {stat.value}
                </div>
                <div className="text-xs font-semibold text-uswds-textMuted uppercase tracking-wide">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Simple 4-Step Interactive Workflow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
        <div className="text-center space-y-3 mb-10">
          <h2 className="text-3xl font-extrabold text-uswds-primary font-sans">
            {t('howItWorks', 'How it Works')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {[
            {
              title: t('step1Title', 'Profile & Scan'),
              desc: t('step1Desc', 'Enter details or scan documents'),
              icon: FileText
            },
            {
              title: t('step2Title', 'AI Match'),
              desc: t('step2Desc', 'Engine finds eligible schemes'),
              icon: Zap
            },
            {
              title: t('step3Title', 'Review'),
              desc: t('step3Desc', 'Check eligibility rules'),
              icon: Award
            },
            {
              title: t('step4Title', 'Apply'),
              desc: t('step4Desc', 'Apply via official portal'),
              icon: ExternalLink
            }
          ].map((step, idx) => (
            <div key={idx} className="bg-white border border-uswds-border p-6 rounded-md flex flex-col justify-between space-y-4 h-full shadow-sm">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded flex items-center justify-center font-bold bg-uswds-background text-uswds-primary border border-uswds-border">
                  <step.icon className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-uswds-primary font-sans">
                  {step.title}
                </h4>
                <p className="text-sm text-uswds-textMuted leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Schemes Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-uswds-primary font-sans">
              {t('featuredSchemes', 'Featured National Welfare Schemes')}
            </h2>
            <p className="text-sm text-uswds-textMuted">
              {t('featuredSchemesDesc', 'Discover verified welfare initiatives across Central and State Governments.')}
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('schemes')}
            className="text-sm font-bold text-uswds-primary hover:underline flex items-center gap-1 whitespace-nowrap"
          >
            <span>{t('viewAllSchemes', 'View All Schemes')} ({topSchemes.length}+)</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topSchemes.slice(0, 3).map(scheme => (
            <div key={scheme.id} className="bg-white border border-uswds-border p-6 rounded-md shadow-sm hover:shadow-md transition-shadow flex flex-col space-y-4 h-full">
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <span className="bg-uswds-background text-uswds-primary border border-uswds-border text-[10px] font-bold px-2.5 py-0.5 rounded whitespace-nowrap uppercase tracking-wider">
                    {scheme.state === 'Central' ? t('centralGovt', 'Central Govt') : scheme.state}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-uswds-success text-right">
                    {scheme.financialBenefitAmount ? `${t('upTo', 'Up to')} ₹${scheme.financialBenefitAmount.toLocaleString('en-IN')}` : t('welfareBenefit', 'Welfare Benefit')}
                  </span>
                </div>

                <h3 className="text-base font-bold text-uswds-primary line-clamp-1 font-sans">
                  {scheme.name}
                </h3>
                <p className="text-sm text-uswds-textMuted line-clamp-2 leading-relaxed">
                  {scheme.shortDescription}
                </p>
              </div>

              <div className="pt-4 border-t border-uswds-border flex flex-wrap justify-between items-center gap-2 text-xs">
                <span className="text-uswds-textMuted font-medium bg-uswds-background px-2 py-1 border border-uswds-border rounded">
                  {scheme.category}
                </span>
                <button
                  onClick={() => onNavigateTab('schemes')}
                  className="px-4 py-2 bg-uswds-primary hover:bg-uswds-secondary text-white font-bold rounded-md transition shadow-sm"
                >
                  {t('checkEligibility', 'Check Eligibility')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 rounded-2xl p-8 sm:p-10 text-slate-950 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-xl sm:text-2xl font-black font-heading tracking-tight">
              {t('readyToDiscover', 'Ready to Discover Your Eligible Government Schemes?')}
            </h3>
            <p className="text-[10px] sm:text-xs font-semibold opacity-90 leading-relaxed">
              {t('readyToDiscoverDesc', 'Complete your profile in 2 minutes or speak to our AI Assistant to find all welfare programs for your household.')}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-950 text-white font-bold text-[10px] sm:text-xs hover:bg-slate-900 transition shadow whitespace-nowrap"
            >
              {t('buildProfile', 'Build Profile')}
            </button>
            <button
              onClick={onTalkToAI}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-slate-950 font-bold text-[10px] sm:text-xs hover:bg-slate-100 transition shadow flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <Bot className="w-4 h-4 text-blue-700 shrink-0" />
              <span>{t('talkToAI', 'Talk to AI')}</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
