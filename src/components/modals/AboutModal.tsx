import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, ShieldAlert, Award, FileCheck2, Database, HelpCircle, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFeedback?: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, onOpenFeedback }) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white dark:bg-[#07111F] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-white dark:from-[#0B1728] dark:to-[#07111F]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#1769FF] text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
                  {t('aboutPlatformTitle', 'About GovScheme AI')}
                </h2>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                  {t('independentNoticeBadge', 'Independent Public Information Platform')}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-sm text-gray-700 dark:text-gray-300 leading-relaxed custom-scrollbar">
            {/* Core Statutory Disclaimer Box */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs text-amber-900 dark:text-amber-200">
                <p className="font-bold">
                  {t('officialTransparencyStatement', 'GovScheme is an independent information platform and is not an official government website.')}
                </p>
                <p>
                  {t('officialTransparencyStatementDetail', 'Scheme information is provided for informational and educational purposes only. Always verify eligibility, deadlines, and application requirements through the relevant government department.')}
                </p>
              </div>
            </div>

            {/* Platform Purpose */}
            <section className="space-y-2">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-600" />
                {t('aboutPurposeTitle', 'Our Mission & Objective')}
              </h3>
              <p className="text-xs sm:text-sm">
                {t('aboutMissionP1', 'GovScheme AI was built to solve the widespread challenge of government scheme opacity in India. Over 800+ welfare initiatives are launched by Central and State Governments, yet millions of eligible citizens—especially smallholder farmers, rural women, marginalized categories, and students in Tamil Nadu and across India—miss out due to scattered information, complex criteria, and language barriers.')}
              </p>
              <p className="text-xs sm:text-sm">
                {t('aboutMissionP2', 'We organize publicly available welfare guidelines into a structured, multilingual knowledge base powered by deterministic eligibility rules and explainable AI recommendations.')}
              </p>
            </section>

            {/* Methodology & Rule Engine */}
            <section className="space-y-2">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-emerald-600" />
                {t('aboutMethodologyTitle', 'How Eligibility is Determined')}
              </h3>
              <p className="text-xs sm:text-sm">
                {t('aboutMethodologyDesc', 'We reject "black-box" decision making. Our platform uses a deterministic, rule-based eligibility engine that evaluates exact criteria (age bounds, annual income ceilings, district/state domicile, education tier, and required documents) against authoritative scheme rules. AI is used solely for natural-language search, semantic term mapping, and multilingual translation—never to invent eligibility requirements.')}
              </p>
            </section>

            {/* Sourcing & Verification */}
            <section className="space-y-2">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-600" />
                {t('aboutSourcingTitle', 'Data Sources & Verification')}
              </h3>
              <p className="text-xs sm:text-sm">
                {t('aboutSourcingDesc', 'Every scheme on GovScheme links directly to traceable official sources:')}
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li><a href="https://www.myscheme.gov.in" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-semibold">{t('aboutSourcingPoint1', 'Official Government of India portal: myScheme.gov.in')}</a></li>
                <li><a href="https://www.tn.gov.in" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-semibold">{t('aboutSourcingPoint2', 'Government of Tamil Nadu portal: tn.gov.in')}</a></li>
                <li>{t('aboutSourcingPoint3', 'Central Ministries: Agriculture (pmkisan.gov.in), Health (pmjay.gov.in), Education (scholarships.gov.in)')}</li>
                <li>{t('aboutSourcingPoint4', 'Designated statutory agencies: Protean eGov, DDRC, and District Collectorates')}</li>
              </ul>
              <p className="text-xs">
                {t('aboutVerificationNote', 'Each record displays its Last Verified Date, Implementing Department, and Data Version. Records older than 90 days are flagged for re-verification.')}
              </p>
            </section>

            {/* Platform Limitations */}
            <section className="space-y-2 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-gray-500" />
                {t('platformLimitationsHeader', 'Important Limitations to Note')}
              </h4>
              <ul className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300">
                <li>• {t('limitationsPoint1', 'GovScheme is not an application processing body. We do not approve, process, or release financial subsidies.')}</li>
                <li>• {t('limitationsPoint2', 'No government employee or officer is bound by automated assessments generated on this platform.')}</li>
                <li>• {t('limitationsPoint3', 'Citizens must submit applications through verified official government portals or at their nearest Common Service Centre (CSC) / e-Sevai centre.')}</li>
              </ul>
            </section>
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#07111F] flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={() => {
                onClose();
                if (onOpenFeedback) onOpenFeedback();
              }}
              className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
            >
              {t('reportAnIssueLink', 'Report an Issue or Incorrect Scheme Information →')}
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-[#1769FF] hover:bg-blue-700 text-white font-bold text-xs shadow transition-colors"
            >
              {t('closeBtn', 'Understood & Close')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
