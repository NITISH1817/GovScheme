import React from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ExternalLink,
  Building2,
  Phone,
  Calendar,
  FileText,
  Share2,
  Bookmark,
  Download,
  HelpCircle,
  ShieldCheck,
  Award
} from 'lucide-react';
import { CombinedSchemeAnalysis, LanguageCode } from '../types';
import { useTranslation } from 'react-i18next';

interface SchemeModalProps {
  analysis: CombinedSchemeAnalysis | null;
  onClose: () => void;
  currentLang: LanguageCode;
  onToggleBookmark: (schemeId: string) => void;
  isBookmarked: boolean;
  onNavigateTab: (tab: string) => void;
}

export const SchemeModal: React.FC<SchemeModalProps> = ({
  analysis,
  onClose,
  currentLang,
  onToggleBookmark,
  isBookmarked,
  onNavigateTab
}) => {
  const { t } = useTranslation();
  if (!analysis) return null;
  const { scheme, ruleResult, mlResult } = analysis;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: scheme.name,
        text: `Check your eligibility for ${scheme.name} on GovScheme AI`,
        url: window.location.href,
      }).catch(() => { });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Scheme link copied to clipboard!");
    }
  };

  const handleDownloadPDF = () => {
    alert(`Downloading official scheme guidelines summary PDF for ${scheme.name}...`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-6 sm:p-8 relative sticky top-0 z-10 border-b border-blue-700">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-slate-300 hover:text-white p-2 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="bg-amber-400 text-slate-950 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase">
              {scheme.state === 'Central' ? t('centralGovtScheme', 'Central Govt Scheme') : scheme.state}
            </span>
            <span className="bg-blue-950/80 border border-blue-700 text-blue-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
              {scheme.category}
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
              {t('matchScore', 'Match Score')}: {mlResult.confidenceScore}%
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-heading tracking-tight">
            {t(`${scheme.id}_name`, scheme.name)}
          </h2>
          <p className="text-xs text-blue-200 mt-2">
            {scheme.ministry} • {scheme.department}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-8 text-xs text-slate-700 dark:text-slate-300">
          {/* Rule Engine Legal Eligibility Explanation Card */}
          <div className={`p-6 rounded-2xl border ${ruleResult.status === 'Eligible'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
              : ruleResult.status === 'Conditionally Eligible'
                ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
            }`}>
            <div className="flex items-center gap-3 mb-4">
              {ruleResult.status === 'Eligible' && <CheckCircle2 className="w-6 h-6 text-emerald-600" />}
              {ruleResult.status === 'Conditionally Eligible' && <AlertCircle className="w-6 h-6 text-amber-600" />}
              {ruleResult.status === 'Not Eligible' && <XCircle className="w-6 h-6 text-slate-500" />}

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                  {t('eligibilityEvalStatus', 'Eligibility Evaluation Status')}: {t(ruleResult.status, ruleResult.status.toUpperCase())}
                </h3>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                  {ruleResult.overallReason}
                </p>
              </div>
            </div>

            {/* Matched Criteria Checklist */}
            {ruleResult.matchedCriteria.length > 0 && (
              <div className="space-y-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-white block">{t('whyEligible', 'Why You Are Eligible')}:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ruleResult.matchedCriteria.map((c, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Requirements / Documents */}
            {ruleResult.missingDocuments.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                <span className="font-bold text-amber-800 dark:text-amber-300 block">{t('missingRequirements', 'Missing Requirements / Documents')}:</span>
                <ul className="list-disc pl-5 space-y-1 text-amber-700 dark:text-amber-400 font-medium">
                  {ruleResult.missingDocuments.map((doc, i) => (
                    <li key={i}>{t('missingInVault', 'Missing in Vault')}: <strong>{doc}</strong></li>
                  ))}
                </ul>
                <p className="text-[11px] text-slate-500 mt-2">
                  {t('tipUploadMissing', 'Tip: Upload missing documents in your ')}<button onClick={() => { onClose(); onNavigateTab('vault'); }} className="text-blue-600 underline font-bold">{t('documentVault', 'Document Vault')}</button>{t('orScanWithOCR', ' or scan with OCR before proceeding.')}
                </p>
              </div>
            )}
          </div>

          {/* Scheme Overview & Financial Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                {t('schemeOverviewBenefits', 'Scheme Overview & Key Benefits')}
              </h3>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                {t(`${scheme.id}_desc`, scheme.shortDescription)}
              </p>
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                <span className="font-bold text-blue-900 dark:text-blue-300 block mb-1">{t('financialBenefitSummary', 'Financial Benefit Summary')}</span>
                <p className="text-xs text-blue-800 dark:text-blue-200">{scheme.benefitsSummary}</p>
              </div>
            </div>

            {/* Important Info Panel */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
              <h4 className="font-bold text-slate-900 dark:text-white font-heading">{t('importantDetails', 'Important Details')}</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Calendar className="w-4 h-4 text-amber-500" />
                  <span>{t('deadline', 'Deadline')}: <strong>{scheme.deadline}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Phone className="w-4 h-4 text-emerald-500" />
                  <a
                    href={`tel:${scheme.helplineNumber.split('/')[0].trim()}`}
                    className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    title="Click to call helpline"
                  >
                    📞 {scheme.helplineNumber}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Building2 className="w-4 h-4 text-blue-500" />
                  <span>{t('state', 'State')}: <strong>{scheme.state}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Required Documents Section */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
              {t('mandatoryDocs', 'Mandatory Official Documents Required')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {scheme.requiredDocuments.map((doc, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <span className="font-medium text-slate-800 dark:text-slate-200">{doc}</span>
                  <FileText className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </div>
          </div>

          {/* Application Steps */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
              {t('officialAppSteps', 'Official Application Process Steps')}
            </h3>
            <ol className="space-y-2 list-decimal pl-5 text-slate-600 dark:text-slate-300">
              {scheme.applicationSteps.map((step, idx) => (
                <li key={idx} className="leading-relaxed">{step}</li>
              ))}
            </ol>
          </div>

          {/* FAQs */}
          {scheme.faqs && scheme.faqs.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-500" /> {t('faqs', 'Frequently Asked Questions')}
              </h3>
              <div className="space-y-3">
                {scheme.faqs.map((faq, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="font-bold text-slate-900 dark:text-white block mb-1">{t('q_question', 'Q')}: {faq.question}</span>
                    <p className="text-slate-600 dark:text-slate-400">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Official Source Transparency Notice */}
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-500 space-y-1">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">{t('officialSourceInfo', 'Official Source Information')}</span>
            <p>{t('dataUpdatedOn', 'Data updated on')} {scheme.lastUpdated}. {t('source', 'Source')}: {scheme.ministry} ({scheme.officialWebsite})</p>
            <p className="text-amber-600 dark:text-amber-400 font-semibold">{t('guaranteedDisclaimer', 'You may be eligible based on the information provided.')}</p>
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-0 z-10">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => onToggleBookmark(scheme.id)}
              className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 transition"
              title="Bookmark Scheme"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 transition"
              title="Share Scheme"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownloadPDF}
              className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 transition"
              title="Download PDF Guidelines"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          {/* Primary Redirect Apply Button */}
          <a
            href={scheme.officialApplyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg transition flex items-center justify-center gap-2"
          >
            <span>{t('applyOfficial', 'Apply on Official Portal')}</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
