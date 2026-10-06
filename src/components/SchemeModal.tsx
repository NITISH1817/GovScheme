import React from 'react';
import { CombinedSchemeAnalysis, UserProfile, DocumentRecord } from '../types';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Bookmark, BookmarkCheck, Check, FileText, AlertCircle, HelpCircle, Activity, Copy, ChevronDown, ChevronUp } from 'lucide-react';

interface SchemeModalProps {
  user: UserProfile | null;
  analysis: CombinedSchemeAnalysis;
  onClose: () => void;
  currentLang: string;
  onToggleBookmark: (schemeId: string) => void;
  isBookmarked: boolean;
  onNavigateTab: (tab: string) => void;
}

export const SchemeModal: React.FC<SchemeModalProps> = ({
  user,
  analysis,
  onClose,
  currentLang,
  onToggleBookmark,
  isBookmarked,
  onNavigateTab
}) => {
  const { scheme, mlResult, ruleResult } = analysis;
  const { t } = useTranslation();
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
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Drawer */}
        <motion.div 
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-4xl h-[100dvh] bg-white dark:bg-[#07111F] shadow-2xl relative z-10 flex flex-col border-l border-gray-200 dark:border-gray-800"
        >
          {/* Header */}
          <div className="px-8 py-6 flex justify-between items-start border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0F1B2D] sticky top-0 z-20">
            <div className="max-w-2xl space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {t(scheme.category, scheme.category).split('&')[0]}
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {scheme.state === 'Central' ? t('govtOfIndia', 'Government of India') : t(`state_${scheme.state}`, scheme.state)}
                </span>
              </div>
              <h2 className="text-3xl font-bold text-[#123C69] dark:text-white font-sans">
                {t(`${scheme.id}_name`, scheme.name)}
              </h2>
              <div className="text-sm text-gray-500">
                {t('lastUpdatedLabel', 'Last updated:')} {scheme.lastUpdated ? new Date(scheme.lastUpdated).toLocaleDateString() : new Date().toLocaleDateString()}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleCopy}
                className="w-10 h-10 rounded bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex items-center justify-center hover:bg-blue-100 transition-colors relative"
                title={copied ? "Copied!" : "Copy Scheme Info"}
              >
                {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 text-blue-600" />}
              </button>
              <button 
                onClick={() => {
                  const url = encodeURIComponent(window.location.href);
                  const text = encodeURIComponent(`Check out this government scheme: ${scheme.name}`);
                  window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
                }}
                className="w-10 h-10 rounded bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-center justify-center hover:bg-green-100 transition-colors tooltip-wrapper relative group"
              >
                {/* SVG for WhatsApp */}
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
              </button>
              <button 
                onClick={() => onToggleBookmark(scheme.id)}
                className="w-10 h-10 rounded bg-gray-50 dark:bg-[#16243A] border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                {isBookmarked ? <BookmarkCheck className="w-5 h-5 text-[#F59E0B]" fill="currentColor" /> : <Bookmark className="w-5 h-5 text-gray-400" />}
              </button>
              <button 
                onClick={onClose} 
                className="w-10 h-10 rounded bg-gray-50 dark:bg-[#16243A] border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>

          {/* Content Scrollable */}
          <div className="flex-1 overflow-y-auto px-8 py-10 space-y-12">
            
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
                      <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{t('matchScore', 'Match Score')}</span>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{t('matchDesc', 'AI-driven confidence based on profile factors.')}</span>
                    </div>
                    <div className="text-3xl font-bold text-[#1769FF]">
                      {Math.round(mlResult.confidenceScore)}%
                    </div>
                  </div>
                  {mlResult.scoreBreakdown && (
                    <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-blue-100 dark:border-blue-900/50">
                      <div className="text-center">
                        <span className="block text-[10px] uppercase font-bold text-gray-500">{t('demographic', 'Demographic')}</span>
                        <span className="font-semibold text-blue-700 dark:text-blue-300">{mlResult.scoreBreakdown.demographic}%</span>
                      </div>
                      <div className="text-center border-l border-r border-blue-100 dark:border-blue-900/50">
                        <span className="block text-[10px] uppercase font-bold text-gray-500">{t('needAffinity', 'Need/Affinity')}</span>
                        <span className="font-semibold text-blue-700 dark:text-blue-300">{mlResult.scoreBreakdown.need}%</span>
                      </div>
                      <div className="text-center">
                        <span className="block text-[10px] uppercase font-bold text-gray-500">{t('financial', 'Financial')}</span>
                        <span className="font-semibold text-blue-700 dark:text-blue-300">{mlResult.scoreBreakdown.financial}%</span>
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

              <div className="overflow-hidden rounded border border-gray-200 dark:border-gray-800 mt-6">
                <div className="bg-gray-50 dark:bg-[#0F1B2D] border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#123C69] dark:text-[#1769FF]" />
                  <span className="font-bold text-gray-900 dark:text-white">{t('eligibilityAnalysis', 'Eligibility Analysis')}</span>
                </div>
                
                <table className="w-full text-left text-sm">
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-[#07111F]">
                    {/* Matched Criteria */}
                    {ruleResult.matchedCriteria.map((factor, idx) => (
                      <tr key={`match-${idx}`} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="px-6 py-4">
                          <span className="text-gray-700 dark:text-gray-300 font-medium">{t(factor, factor)}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#15803D]/10 text-[#15803D] text-xs font-bold">
                            <Check className="w-3 h-3" /> {t('matched', 'Matched')}
                          </span>
                        </td>
                      </tr>
                    ))}

                    {/* Failed Criteria */}
                    {ruleResult.failedCriteria.map((factor, idx) => (
                      <tr key={`failed-${idx}`} className="hover:bg-red-50 dark:hover:bg-red-900/10">
                        <td className="px-6 py-4">
                          <span className="text-gray-700 dark:text-gray-300 font-medium">{t(factor, factor)}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-red-100 text-red-700 text-xs font-bold">
                            <X className="w-3 h-3" /> {t('unmet', 'Unmet')}
                          </span>
                        </td>
                      </tr>
                    ))}

                    {/* Missing Info / Documents */}
                    {ruleResult.missingDocuments.map((doc, idx) => (
                      <tr key={`missing-${idx}`} className="hover:bg-yellow-50 dark:hover:bg-yellow-900/10">
                        <td className="px-6 py-4">
                          <span className="text-gray-700 dark:text-gray-300 font-medium">{t('missingDoc', 'Missing Document:')} {t(doc, doc)}</span>
                          <p className="text-xs text-gray-500 mt-1">{t('pleaseUpload', 'Please upload this document to your vault.')}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-yellow-100 text-yellow-700 text-xs font-bold">
                            <HelpCircle className="w-3 h-3" /> {t('missingInfo', 'Missing Info')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Eligibility */}
            <section className="space-y-4">
              <h3 className="text-xl font-bold text-[#123C69] dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">{t('officialEligibility', 'Official Eligibility')}</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                {Object.entries(scheme.eligibilityRules).map(([key, val], idx) => {
                  if (!val || (Array.isArray(val) && val.length === 0)) return null;
                  return (
                    <li key={idx}>
                      <span className="font-semibold capitalize">{t(key, key.replace(/([A-Z])/g, ' $1'))}:</span> {Array.isArray(val) ? val.map(v => t(String(v), String(v))).join(', ') : t(String(val), String(val))}
                    </li>
                  );
                })}
              </ul>
            </section>

            {/* Documents */}
            <section className="space-y-4">
              <h3 className="text-xl font-bold text-[#123C69] dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">{t('documentsRequired', 'Smart Document Checklist')}</h3>
              
              {user && (
                <div className="mb-4">
                  <span className="text-sm font-semibold text-gray-500">
                    {scheme.requiredDocuments.filter(doc => user.documents.some((d: any) => d.type === doc)).length} / {scheme.requiredDocuments.length} {t('documentsReady', 'documents ready')}
                  </span>
                  <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 mt-2">
                    <div className="bg-[#15803D] h-1.5 rounded-full" style={{ width: `${(scheme.requiredDocuments.filter(doc => user.documents.some((d: any) => d.type === doc)).length / scheme.requiredDocuments.length) * 100}%` }}></div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {scheme.requiredDocuments.map((doc, idx) => {
                  const isUploaded = user?.documents.some(d => d.type === doc);
                  return (
                    <div key={idx} className={`flex items-center justify-between gap-3 p-3 border rounded ${isUploaded ? 'bg-[#15803D]/5 border-[#15803D]/20' : 'bg-gray-50 dark:bg-[#0F1B2D] border-gray-200 dark:border-gray-800'}`}>
                      <div className="flex items-center gap-3">
                        {isUploaded ? <Check className="w-5 h-5 text-[#15803D] shrink-0" /> : <FileText className="w-5 h-5 text-gray-400 shrink-0" />}
                        <span className={`text-sm ${isUploaded ? 'text-[#15803D] font-semibold' : 'text-gray-700 dark:text-gray-300'}`}>{t(doc, doc)}</span>
                      </div>
                      {!isUploaded && user && (
                        <button onClick={() => { onClose(); onNavigateTab('vault'); }} className="text-xs text-[#1769FF] font-bold hover:underline">
                          Upload
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Application Process */}
            <section className="space-y-4">
              <h3 className="text-xl font-bold text-[#123C69] dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">{t('applicationProcess', 'Application Process')}</h3>
              <div className="relative py-4 border-l-2 border-gray-200 dark:border-gray-800 ml-4 space-y-8">
                {[
                  t('processStep1', 'Prepare Documents'), 
                  t('processStep2', 'Apply Online'), 
                  t('processStep3', 'Submit Verification'), 
                  t('processStep4', 'Department Review'), 
                  t('processStep5', 'Decision')
                ].map((step, idx) => (
                  <div key={idx} className="relative pl-8">
                    <div className="absolute left-[-9px] top-1 w-4 h-4 rounded-full bg-[#123C69] border-4 border-white dark:border-[#07111F]" />
                    <span className="text-xs font-bold text-gray-400 tracking-wider mb-1 block">0{idx + 1}</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{step}</span>
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
                        <span className="font-bold text-gray-900 dark:text-white text-left">{faq.question}</span>
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
                              {faq.answer}
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
          <div className="p-6 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0F1B2D] flex flex-col sm:flex-row sm:items-center justify-between shadow-[0_-10px_20px_rgba(0,0,0,0.02)] gap-4">
            
            {/* Trust Panel */}
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                <Check className="w-4 h-4 text-green-700 dark:text-green-300" />
              </div>
              <div>
                <div className="text-xs font-bold text-green-800 dark:text-green-300 uppercase tracking-wider">{t('officialVerified', 'Verified Official Source')}</div>
                <div className="text-sm text-green-700 dark:text-green-400 font-medium truncate max-w-[200px]" title={scheme.officialApplyUrl}>
                  {scheme.officialApplyUrl ? new URL(scheme.officialApplyUrl).hostname : t('govtPortal', 'Govt Portal')}
                </div>
              </div>
            </div>

            <button 
              onClick={() => window.open(scheme.officialApplyUrl || '#', '_blank')}
              className="px-8 py-3 rounded bg-[#1769FF] text-white font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              {t('applyOnOfficialPortal', 'Apply on Official Portal')} <ExternalLink className="w-4 h-4" />
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
