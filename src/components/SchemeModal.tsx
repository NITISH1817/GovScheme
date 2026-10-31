import React from 'react';
import { Scheme, CombinedSchemeAnalysis, UserProfile, DocumentRecord, DocumentPossessionStatus } from '../types';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  X,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Check,
  FileText,
  AlertCircle,
  HelpCircle,
  Activity,
  Copy,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Phone,
  Info,
  FileCheck2
} from 'lucide-react';
import { SchemeApplicationModal } from './SchemeApplicationModal';
import { evaluateSchemeEligibility } from '../engine/ruleEngine';
import { computeMLRecommendation } from '../engine/mlEngine';
import { evaluateExplainableEligibility, PRELIMINARY_DISCLAIMER } from '../engine/explainableEligibility';

const STATUTORY_ENTITIES: Record<string, string> = {
  'mudra.org.in': 'SIDBI (Small Industries Development Bank of India)',
  'pfrda.org.in': 'PFRDA (Statutory Regulatory Authority under MoF)',
  'proteantech.in': 'Protean eGov Technologies (Authorized Central Recordkeeping Agency)',
  'aicte-india.org': 'AICTE (Statutory Council under Ministry of Education)',
  'vidyalakshmi.co.in': 'Dept of Higher Education & IBA / Protean',
  'ugcnet.nta.ac.in': 'National Testing Agency (Ministry of Education)',
  'tngasa.in': 'Directorate of Collegiate Education (Govt of Tamil Nadu)',
  'agritech.tnau.ac.in': 'Tamil Nadu Agricultural University (TNAU)',
  'cmchistn.com': 'United India Insurance / State Health Society Tamil Nadu',
  'nikshay.in': 'Central TB Division, MoHFW / National Health Mission',
  'pmkvyofficial.org': 'National Skill Development Corporation (MSDE)',
  'standupmitra.in': 'SIDBI under Department of Financial Services guidelines',
  'maandhan.in': 'Ministry of Labour & Employment / LIC'
};

const getSafeHostname = (url?: string): string => {
  if (!url || typeof url !== 'string') return '';
  try {
    return new URL(url).hostname;
  } catch {
    return url.replace(/^https?:\/\//i, '').split('/')[0] || '';
  }
};

const getStatutoryEntity = (url?: string): string | null => {
  const host = getSafeHostname(url).toLowerCase();
  for (const [domain, entity] of Object.entries(STATUTORY_ENTITIES)) {
    if (host.includes(domain)) return entity;
  }
  return null;
};

interface SchemeModalProps {
  user: UserProfile | null;
  analysis: CombinedSchemeAnalysis;
  onClose: () => void;
  currentLang: string;
  onToggleBookmark: (schemeId: string) => void;
  isBookmarked: boolean;
  onNavigateTab: (tab: string) => void;
  onApplyScheme?: (scheme: Scheme) => void;
}

export const SchemeModal: React.FC<SchemeModalProps> = ({
  user,
  analysis,
  onClose,
  currentLang,
  onToggleBookmark,
  isBookmarked,
  onNavigateTab,
  onApplyScheme
}) => {
  const { scheme } = analysis;
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const [reportedDocs, setReportedDocs] = React.useState<Record<string, DocumentPossessionStatus>>({});
  const [isAppFormOpen, setIsAppFormOpen] = React.useState(false);

  const explainableResult = React.useMemo(() => {
    return evaluateExplainableEligibility(user, scheme, reportedDocs);
  }, [user, scheme, reportedDocs, currentLang]);

  const effectiveRuleResult = React.useMemo(() => {
    if (!user) return analysis.ruleResult;
    return evaluateSchemeEligibility(user, scheme);
  }, [user, scheme, currentLang, analysis.ruleResult]);

  const effectiveMlResult = React.useMemo(() => {
    if (!user) return analysis.mlResult;
    return computeMLRecommendation(user, scheme, effectiveRuleResult, [scheme]);
  }, [user, scheme, effectiveRuleResult, currentLang, analysis.mlResult]);

  const handleToggleDocPossession = (docId: string, status: DocumentPossessionStatus) => {
    setReportedDocs(prev => ({
      ...prev,
      [docId]: status
    }));
  };

  const handleResetDocPossession = (docId: string) => {
    setReportedDocs(prev => {
      const copy = { ...prev };
      delete copy[docId];
      return copy;
    });
  };

  const [copied, setCopied] = React.useState(false);
  const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(`Scheme: ${scheme.name}\nWebsite: ${scheme.officialWebsite}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex justify-end">
        {/* Backdrop */}
        <motion.div          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0.05 : 0.3 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Drawer */}
        <motion.div          role="dialog"
          aria-modal="true"
          aria-labelledby="scheme-modal-title"
          initial={shouldReduceMotion ? { opacity: 0 } : { x: '100%' }}
          animate={shouldReduceMotion ? { opacity: 1 } : { x: 0 }}
          exit={shouldReduceMotion ? { opacity: 0 } : { x: '100%' }}
          transition={shouldReduceMotion ? { duration: 0.1 } : { duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-4xl h-[100dvh] bg-white dark:bg-[#07111F] shadow-2xl relative z-10 flex flex-col border-l border-gray-200 dark:border-gray-800"
        >
          {/* Header */}
          <div className="px-4 sm:px-8 py-4 sm:py-6 flex justify-between items-start border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0F1B2D] sticky top-0 z-20">
            <div className="max-w-2xl space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {t(scheme.category, scheme.category).split('&')[0]}
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {scheme.state === 'Central' ? t('govtOfIndia', 'Government of India') : t(`state_${scheme.state}`, scheme.state)}
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                {scheme.verificationStatus === 'OFFICIALLY_VERIFIED' ? (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    ✓ {t('officiallyVerified', 'Officially Verified')}
                  </span>
                ) : scheme.verificationStatus === 'ADMIN_VERIFIED' ? (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                    ✓ {t('adminVerified', 'Admin Verified')}
                  </span>
                ) : scheme.verificationStatus === 'PORTAL_CURATED' || (scheme.verificationStatus as string) === 'Verified' ? (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    ✓ {t('portalCurated', 'Portal Curated')}
                  </span>
                ) : (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                    ⚠ {t('pendingReview', 'Pending Review')}
                  </span>
                )}
              </div>
              <h2 id="scheme-modal-title" className="text-2xl sm:text-3xl font-bold text-[#123C69] dark:text-white font-sans break-words">
                {t(`${scheme.id}_name`, scheme.name)}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                <span>{t('lastUpdatedLabel', 'Last updated:')} {scheme.lastUpdated ? new Date(scheme.lastUpdated).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                {scheme.curationSource && (
                  <span>• {t('sourceLabel', 'Source:')} {scheme.curationSource}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-2">
              <button
                onClick={handleCopy}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex items-center justify-center hover:bg-blue-100 transition-colors relative"
                title={copied ? t('copied', 'Copied!') : t('copyInfo', 'Copy Scheme Info')}
                aria-label={copied ? t('copied', 'Copied!') : t('copyInfo', 'Copy Scheme Info')}
              >
                {copied ? <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" /> : <Copy className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />}
              </button>
              <button
                onClick={() => {
                  const url = encodeURIComponent(window.location.href);
                  const text = encodeURIComponent(`Check out this government scheme: ${scheme.name}`);
                  window.open(`https://wa.me/?text=${text}%20${url}`, '_blank', 'noopener,noreferrer');
                }}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center justify-center hover:bg-green-100 transition-colors tooltip-wrapper relative group"
                aria-label={t('shareWhatsApp', 'Share scheme on WhatsApp')}
              >
                {/* SVG for WhatsApp */}
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
              </button>
              <button                onClick={() => onToggleBookmark(scheme.id)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded bg-gray-50 dark:bg-[#16243A] border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 transition-colors"
                aria-label={isBookmarked ? t('removeBookmark', 'Remove bookmark') : t('saveBookmark', 'Bookmark scheme')}
              >
                {isBookmarked ? <BookmarkCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#F59E0B]" fill="currentColor" /> : <Bookmark className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />}
              </button>
              <button                onClick={onClose}                className="w-9 h-9 sm:w-10 sm:h-10 rounded bg-gray-50 dark:bg-[#16243A] border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 transition-colors"
                aria-label={t('close', 'Close')}
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>

          {/* Content Scrollable */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 sm:py-10 space-y-8 sm:space-y-12">
            {/* Overview */}
            <section className="space-y-4">
              <h3 className="text-xl font-bold text-[#123C69] dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">{t('overview', 'Overview')}</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {t(`${scheme.id}_desc`, scheme.shortDescription)}
              </p>
            </section>

            {/* Benefits */}
            <section className="space-y-4">
              <h3 className="text-xl font-bold text-[#123C69] dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">{t('benefits', 'Benefits')}</h3>
              <div className="bg-gray-50 dark:bg-[#0F1B2D] border border-gray-200 dark:border-gray-800 rounded p-6">
                {scheme.financialBenefitAmount && (
                  <div className="mb-4">
                    <span className="block text-sm font-semibold text-gray-500 mb-1">{t('financialAssistance', 'Financial Assistance')}</span>
                    <span className="text-2xl font-bold text-[#15803D]">₹{scheme.financialBenefitAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {t(`${scheme.id}_benefits`, scheme.benefitsSummary || scheme.shortDescription)}
                </div>
              </div>
            </section>

            {/* Explainable Recommendations */}
            <section className="space-y-4">
              <h3 className="text-xl font-bold text-[#123C69] dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">{t('whyRecommended', 'Why This Scheme Was Recommended')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Match Score */}
                <div className="bg-blue-50 dark:bg-[#16243A]/50 border border-blue-200 dark:border-blue-800 rounded p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('matchScore', 'Relevance & Priority Score')}</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{t('matchDesc', 'Deterministic rule evaluation and profile affinity weighting.')}</span>
                    </div>
                    <div className="text-3xl font-bold text-[#1769FF]">
                      {Math.round(effectiveMlResult.confidenceScore)}%
                    </div>
                  </div>
                  {effectiveMlResult.scoreBreakdown && (
                    <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-blue-100 dark:border-blue-900/50">
                      <div className="text-center">
                        <span className="block text-[10px] uppercase font-bold text-gray-500">{t('demographic', 'Demographic')}</span>
                        <span className="font-semibold text-blue-700 dark:text-blue-300">{effectiveMlResult.scoreBreakdown.demographic}%</span>
                      </div>
                      <div className="text-center border-l border-r border-blue-100 dark:border-blue-900/50">
                        <span className="block text-[10px] uppercase font-bold text-gray-500">{t('needAffinity', 'Need/Affinity')}</span>
                        <span className="font-semibold text-blue-700 dark:text-blue-300">{effectiveMlResult.scoreBreakdown.need}%</span>
                      </div>
                      <div className="text-center">
                        <span className="block text-[10px] uppercase font-bold text-gray-500">{t('financial', 'Financial')}</span>
                        <span className="font-semibold text-blue-700 dark:text-blue-300">{effectiveMlResult.scoreBreakdown.financial}%</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Priority Weighting */}
                <div className="bg-gray-50 dark:bg-[#0F1B2D] border border-gray-200 dark:border-gray-800 rounded p-4 flex items-center justify-between">
                  <div>
                    <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('priorityWeighting', 'Priority Weighting')}</span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{t('priorityWeightingDesc', 'Hard rules vs Soft semantic matching.')}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{t('highPriority', 'High Priority')}</span>
                    <span className="block text-xs text-gray-500 mt-1">{t('tier1Rec', 'Tier 1 Recommendation')}</span>
                  </div>
                </div>
              </div>
            </section>

              {/* Explainable Eligibility & Decision Support */}
              <div className="overflow-hidden rounded border border-gray-200 dark:border-gray-800 mt-6 bg-white dark:bg-[#07111F]">
                <div className="bg-gray-50 dark:bg-[#0F1B2D] border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#123C69] dark:text-[#1769FF]" />
                    <span className="font-bold text-gray-900 dark:text-white text-base">
                      {t('eligibilityExplainingTitle', 'Explainable Eligibility & Decision Support')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-[#15803D]/10 text-[#15803D] border border-[#15803D]/20">
                      <Check className="w-3 h-3" /> {explainableResult.satisfied.length} {t('criteriaSatisfied', 'Criteria Met')}
                    </span>
                    {explainableResult.notSatisfied.length > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-800">
                        <X className="w-3 h-3" /> {explainableResult.notSatisfied.length} {t('criteriaUnmet', 'Unmet')}
                      </span>
                    )}
                    {explainableResult.unknown.length > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        <HelpCircle className="w-3 h-3" /> {explainableResult.unknown.length} {t('criteriaNeeded', 'Needed')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Satisfied Criteria */}
                  {explainableResult.satisfied.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                        {t('satisfiedCriteriaHeader', 'Satisfied Criteria')} ({explainableResult.satisfied.length})
                      </h4>
                      <div className="space-y-2">
                        {explainableResult.satisfied.map(crit => (
                          <div key={crit.id} className="p-3 rounded border border-green-200 dark:border-green-900/30 bg-green-50/50 dark:bg-green-950/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-gray-900 dark:text-white">{crit.title}</span>
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                                  ✓ {t('satisfied', 'Satisfied')}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{crit.reason}</p>
                            </div>
                            {crit.userValueDescription && (
                              <div className="text-xs text-gray-500 shrink-0 text-right sm:text-right">
                                <span className="font-medium text-gray-700 dark:text-gray-300">{crit.userValueDescription}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Unmet Criteria */}
                  {explainableResult.notSatisfied.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                        <XCircle className="w-4 h-4 text-red-600" />
                        {t('unmetCriteriaHeader', 'Unmet Criteria')} ({explainableResult.notSatisfied.length})
                      </h4>
                      <div className="space-y-2">
                        {explainableResult.notSatisfied.map(crit => (
                          <div key={crit.id} className="p-3 rounded border border-red-200 dark:border-red-900/30 bg-red-50/50 dark:bg-red-950/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-gray-900 dark:text-white">{crit.title}</span>
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300">
                                  ✕ {t('unmet', 'Unmet')}
                                </span>
                              </div>
                              <p className="text-xs text-red-700 dark:text-red-300 mt-1">{crit.reason}</p>
                            </div>
                            <div className="text-xs text-gray-500 shrink-0 sm:text-right">
                              <span className="block text-[11px] text-gray-400">Required: {crit.requiredValueDescription}</span>
                              {crit.userValueDescription && (
                                <span className="font-medium text-red-600 dark:text-red-400">Profile: {crit.userValueDescription}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Information Needed */}
                  {explainableResult.unknown.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        {t('informationNeededHeader', 'Information Still Needed')} ({explainableResult.unknown.length})
                      </h4>
                      <div className="space-y-2">
                        {explainableResult.unknown.map(crit => (
                          <div key={crit.id} className="p-3 rounded border border-blue-200 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-950/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-gray-900 dark:text-white">{crit.title}</span>
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                                  ? {t('criteriaNeeded', 'Needed')}
                                </span>
                              </div>
                              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">{crit.reason}</p>
                            </div>
                            <div className="text-xs text-gray-500 shrink-0 sm:text-right">
                              <span className="block text-[11px] text-gray-400">Target: {crit.requiredValueDescription}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Official Eligibility Parameters Reference */}
              <section className="space-y-4">
                <h3 className="text-xl font-bold text-[#123C69] dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">{t('officialEligibility', 'Official Eligibility')}</h3>
                <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                  {(() => {
                    const raw: any = scheme.eligibilityRules || {};
                    const entries: [string, any][] = [];
                    const normalizeRuleKey = (str: string) => str.toLowerCase().replace(/[^a-z]/g, '');
                    const seenNormalized = new Set<string>();

                    const minAgeVal = raw.minAge ?? raw.ageMin ?? raw.age_min ?? raw.min_age;
                    const maxAgeVal = raw.maxAge ?? raw.ageMax ?? raw.age_max ?? raw.max_age;
                    const incomeVal = raw.maxAnnualIncome ?? raw.incomeLimit ?? raw.max_annual_income ?? raw.income_limit;

                    // If universal open age scheme (0 to 100/120)
                    if (minAgeVal === 0 && (maxAgeVal >= 100 || maxAgeVal === undefined)) {
                      entries.push(['eligibleAgeGroup', t('allAgesEligible', 'All Ages Eligible')]);
                      seenNormalized.add('minage');
                      seenNormalized.add('agemin');
                      seenNormalized.add('maxage');
                      seenNormalized.add('agemax');
                    } else {
                      if (minAgeVal !== undefined && minAgeVal !== null) {
                        entries.push(['minAge', minAgeVal]);
                        seenNormalized.add('minage');
                        seenNormalized.add('agemin');
                      }
                      if (maxAgeVal !== undefined && maxAgeVal !== null) {
                        entries.push(['maxAge', maxAgeVal]);
                        seenNormalized.add('maxage');
                        seenNormalized.add('agemax');
                      }
                    }

                    if (incomeVal !== undefined && incomeVal !== null) {
                      entries.push(['incomeLimit', incomeVal]);
                      seenNormalized.add('maxannualincome');
                      seenNormalized.add('incomelimit');
                      seenNormalized.add('annualincome');
                    }

                    for (const [k, v] of Object.entries(raw)) {
                      const norm = normalizeRuleKey(k);
                      if (seenNormalized.has(norm)) continue;
                      if (v === undefined || v === null || (Array.isArray(v) && v.length === 0)) continue;
                      entries.push([k, v]);
                      seenNormalized.add(norm);
                    }

                    return entries.map(([key, val], idx) => {
                      const getLocalizedLabel = (k: string) => {
                        const norm = normalizeRuleKey(k);
                        if (norm === 'minage' || norm === 'agemin') return t('minAge', 'Minimum Age');
                        if (norm === 'maxage' || norm === 'agemax') return t('maxAge', 'Maximum Age');
                        if (norm === 'incomelimit' || norm === 'maxannualincome') return t('incomeLimit', 'Annual Income Limit');
                        if (norm === 'gender' || norm === 'eligiblegender') return t('gender', 'Eligible Gender');
                        if (norm === 'category' || norm === 'allowedcategories') return t('allowedCategories', 'Allowed Categories');
                        if (norm === 'state' || norm === 'states' || norm === 'eligiblestates') return t('state', 'Eligible States');
                        if (norm === 'requireddocuments' || norm === 'documents') return t('requiredDocuments', 'Required Documents');
                        if (norm === 'requiresdisability') return t('requiresDisability', 'Disability Status');
                        if (norm === 'mindisabilitypercentage') return t('minDisabilityPercentage', 'Minimum Disability %');
                        if (norm === 'targetoccupations' || norm === 'allowedoccupations' || norm === 'occupation') return t('targetOccupations', 'Target Occupations');
                        if (norm === 'maxlandholdingacres') return t('maxLandHoldingAcres', 'Maximum Landholding');
                        if (norm === 'eligibleagegroup') return t('eligibleAgeGroup', 'Eligible Age');
                        return t(k, k.replace(/([A-Z])/g, ' $1'));
                      };

                      const renderValue = () => {
                        if (key === 'eligibleAgeGroup') {
                          return val;
                        }
                        if (typeof val === 'boolean') {
                          return val ? t('yes', 'Yes') : t('no', 'No');
                        }
                        if (key === 'minAge' || key === 'maxAge' || key === 'ageMin' || key === 'ageMax') {
                          return `${val} ${t('yearsUnit', 'years')}`;
                        }
                        if (key === 'minDisabilityPercentage') {
                          return `${val}%`;
                        }
                        if (key === 'maxAnnualIncome' || key === 'incomeLimit') {
                          if (val === 0 || val === '0') return t('noIncomeLimit', 'No income limit');
                          return `₹${Number(val).toLocaleString('en-IN')}`;
                        }
                        if (key === 'maxLandHoldingAcres') {
                          return `${val} ${t('acresUnit', 'acres')}`;
                        }
                        if (Array.isArray(val)) {
                          return val.map(v => t(String(v), String(v))).join(', ');
                        }
                        return t(String(val), String(val));
                      };

                      return (
                        <li key={idx}>
                          <span className="font-semibold">{getLocalizedLabel(key)}:</span> {renderValue()}
                        </li>
                      );
                    });
                  })()}
                </ul>
              </section>

              {/* Smart Document Readiness Checklist */}
              <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
                  <h3 className="text-xl font-bold text-[#123C69] dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#1769FF]" />
                    {t('documentReadinessChecklist', 'Smart Document Readiness Checklist')}
                  </h3>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded bg-gray-100 dark:bg-[#16243A] text-gray-700 dark:text-gray-300">
                    {explainableResult.availableDocuments.length} / {explainableResult.requiredDocuments.length} {t('documentsReady', 'documents ready')}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-[#15803D] h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${explainableResult.requiredDocuments.length === 0 ? 100 : (explainableResult.availableDocuments.length / explainableResult.requiredDocuments.length) * 100}%`
                    }}
                  />
                </div>

                {/* Catalogue Discrepancy Banner */}
                {explainableResult.documentConflictDetected && explainableResult.documentConflictDetails && (
                  <div className="p-3.5 rounded border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                    <div>
                      <span className="font-bold">{t('docConflictNotice', 'Catalogue Discrepancy')}:</span> {explainableResult.documentConflictDetails}
                    </div>
                  </div>
                )}

                {/* No Document Metadata State */}
                {explainableResult.requiredDocuments.length === 0 && (
                  <div className="p-4 rounded border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0F1B2D] text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Info className="w-4 h-4 text-gray-500 shrink-0" />
                    <span>{t('noDocsRequiredInCatalogue', 'Document requirements are not specified in the catalogue for this scheme. Verify with the official portal or local CSC Kendra.')}</span>
                  </div>
                )}

                {/* Document Items Grid */}
                {explainableResult.documentItems.length > 0 && (
                  <div className="grid grid-cols-1 gap-3">
                    {explainableResult.documentItems.map(item => {
                      const isAvailable = item.status === 'AVAILABLE';
                      const isMissing = item.status === 'MISSING';
                      const isUnconfirmed = item.status === 'UNCONFIRMED';

                      return (
                        <div
                          key={item.id}
                          className={`p-3.5 border rounded-lg transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isAvailable
                              ? 'bg-[#15803D]/5 border-[#15803D]/25'
                              : isMissing
                              ? 'bg-red-50/50 dark:bg-red-950/15 border-red-200 dark:border-red-900/30'
                              : 'bg-gray-50 dark:bg-[#0F1B2D] border-gray-200 dark:border-gray-800'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              {isAvailable ? (
                                <Check className="w-4 h-4 text-[#15803D] shrink-0" />
                              ) : isMissing ? (
                                <X className="w-4 h-4 text-red-600 shrink-0" />
                              ) : (
                                <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                              )}
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {t(item.documentName, item.documentName)}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                  isAvailable
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                                    : isMissing
                                    ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                                }`}
                              >
                                {isAvailable
                                  ? t('haveDocBadge', 'Available')
                                  : isMissing
                                  ? t('missingDocBadge', 'Missing')
                                  : t('unconfirmedDocBadge', 'Unconfirmed')}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 pl-6">{item.explanation}</p>
                          </div>

                          {/* Citizen interactive buttons */}
                          <div className="flex items-center gap-1.5 pl-6 sm:pl-0 shrink-0">
                            {!isAvailable && (
                              <button
                                onClick={() => handleToggleDocPossession(item.id, 'AVAILABLE')}
                                className="px-2.5 py-1 text-xs rounded border border-green-600 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30 font-medium transition-colors"
                              >
                                {t('markHaveDoc', 'I have this')}
                              </button>
                            )}
                            {!isMissing && (
                              <button
                                onClick={() => handleToggleDocPossession(item.id, 'MISSING')}
                                className="px-2.5 py-1 text-xs rounded border border-red-400 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 font-medium transition-colors"
                              >
                                {t('markMissingDoc', "I don't have this")}
                              </button>
                            )}
                            {item.possessionReportedByCitizen && (
                              <button
                                onClick={() => handleResetDocPossession(item.id)}
                                className="px-2 py-1 text-xs rounded text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                              >
                                {t('resetDocStatus', 'Reset')}
                              </button>
                            )}
                            {!isAvailable && user && (
                              <button
                                onClick={() => {
                                  onClose();
                                  onNavigateTab('vault');
                                }}
                                className="px-2.5 py-1 text-xs rounded bg-blue-50 dark:bg-blue-900/20 text-[#1769FF] font-bold hover:underline"
                              >
                                {t('upload', 'Upload')}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Practical Next Steps Section */}
              <section className="space-y-4">
                <h3 className="text-xl font-bold text-[#123C69] dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
                  {t('practicalNextSteps', 'Practical Next Steps & Actions')}
                </h3>
                <div className="space-y-2.5">
                  {explainableResult.nextSteps.map((step, idx) => (
                    <div key={idx} className="p-3 rounded border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0F1B2D] flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#123C69] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium">{t(step, step)}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Preliminary Advisory Disclaimer Notice */}
              <div className="p-4 rounded-lg border border-blue-200 dark:border-blue-900/40 bg-blue-50/70 dark:bg-blue-950/20 text-xs text-blue-900 dark:text-blue-300 space-y-1">
                <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-[11px] text-blue-800 dark:text-blue-200">
                  <ShieldCheck className="w-4 h-4 text-[#1769FF]" />
                  {t('preliminaryAdvisoryNotice', 'Preliminary Advisory')}
                </div>
                <p className="leading-relaxed text-gray-700 dark:text-gray-300">
                  {t('preliminaryAdvisoryText', explainableResult.disclaimer)}
                </p>
              </div>

            {/* Application Process */}
            <section className="space-y-4">
              <h3 className="text-xl font-bold text-[#123C69] dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">{t('applicationProcess', 'Application Process')}</h3>
              <div className="relative py-4 border-l-2 border-gray-200 dark:border-gray-800 ml-4 space-y-8">
                {(scheme.applicationSteps && scheme.applicationSteps.length > 0
                  ? scheme.applicationSteps
                  : [
                      t('processStep1', 'Prepare Documents'),
                      t('processStep2', 'Apply Online'),
                      t('processStep3', 'Submit Verification'),
                      t('processStep4', 'Department Review'),
                      t('processStep5', 'Decision')
                    ]
                ).map((step, idx) => (
                  <div key={idx} className="relative pl-8">
                    <div className="absolute left-[-9px] top-1 w-4 h-4 rounded-full bg-[#123C69] border-4 border-white dark:border-[#07111F]" />
                    <span className="text-xs font-bold text-gray-400 tracking-wider mb-1 block">{idx < 9 ? `0${idx + 1}` : `${idx + 1}`}</span>
                    <span className="font-semibold text-gray-900 dark:text-white leading-relaxed">
                      {t(`${scheme.id}_step_${idx + 1}`, t(step, step))}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Expandable FAQs */}
            {scheme.faqs && scheme.faqs.length > 0 && (
              <section className="space-y-4 pt-4">
                <h3 className="text-xl font-bold text-[#123C69] dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  {t('frequentlyAskedQuestions', 'Frequently Asked Questions')}
                </h3>
                <div className="space-y-2">
                  {scheme.faqs.map((faq, idx) => (
                    <div key={idx} className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-gray-50 dark:bg-[#0F1B2D]">
                      <button
                        className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-100 dark:hover:bg-[#16243A] transition"
                        onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                      >
                        <span className="font-bold text-gray-900 dark:text-white text-left">{t(faq.question, faq.question)}</span>
                        {openFaqIndex === idx ? <ChevronUp className="w-5 h-5 text-gray-500 shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-500 shrink-0" />}
                      </button>
                      <AnimatePresence>
                        {openFaqIndex === idx && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-4 pt-2 text-gray-700 dark:text-gray-300">
                              {t(faq.answer, faq.answer)}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>

          {/* Footer Sticky Action */}
          <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0F1B2D] flex flex-col sm:flex-row sm:items-center justify-between shadow-[0_-10px_20px_rgba(0,0,0,0.02)] gap-4">
            {/* Trust Panel */}
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 text-green-700 dark:text-green-300" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-green-800 dark:text-green-300 uppercase tracking-wider">{t('officialSourceCompiled', 'Official Source Portal')}</div>
                <div className="text-sm text-green-700 dark:text-green-400 font-medium truncate max-w-[240px]" title={scheme.officialApplyUrl || scheme.officialWebsite}>
                  {getSafeHostname(scheme.officialApplyUrl || scheme.officialWebsite) || t('govtPortal', 'Govt Portal')}
                </div>
                {getStatutoryEntity(scheme.officialApplyUrl || scheme.officialWebsite) && (
                  <div className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300">
                    {getStatutoryEntity(scheme.officialApplyUrl || scheme.officialWebsite)}
                  </div>
                )}
                <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                  {t('independentAdvisoryNotice', 'GovScheme is an independent citizen advisory portal.')}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setIsAppFormOpen(true)}
                className="min-h-[44px] px-5 sm:px-6 py-3 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>{t('autoFillApplication', 'Auto-Fill Application Form')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onApplyScheme) {
                    onClose();
                    onApplyScheme(scheme);
                  } else {
                    window.open(scheme.officialApplyUrl || '#', '_blank', 'noopener,noreferrer');
                  }
                }}
                className="min-h-[44px] px-6 sm:px-8 py-3 rounded bg-[#1769FF] text-white font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <span>{t('applyOnOfficialPortal', 'Apply on Official Portal')}</span>
                <span className="sr-only"> ({t('opensInNewTab', 'opens in a new tab')})</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>

          <SchemeApplicationModal
            isOpen={isAppFormOpen}
            onClose={() => setIsAppFormOpen(false)}
            scheme={scheme}
            user={user}
            onNavigateTab={onNavigateTab}
            onOpenVaultScan={() => {
              setIsAppFormOpen(false);
              onClose();
              onNavigateTab('vault');
            }}
          />

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
