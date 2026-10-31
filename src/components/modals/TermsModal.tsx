import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, AlertTriangle, ExternalLink, Scale, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
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
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-slate-50/50 via-gray-50/30 to-white dark:from-[#0B1524] dark:to-[#07111F]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-800 text-white flex items-center justify-center font-bold shadow-md shadow-slate-500/20">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
                  {t('termsOfUseTitle', 'Terms of Use & Service Disclaimers')}
                </h2>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-300 dark:border-slate-700">
                  {t('informationalDisclaimerBadge', 'Informational & Advisory Use Only')}
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

          {/* Content */}
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-sm text-gray-700 dark:text-gray-300 leading-relaxed custom-scrollbar">
            {/* Critical Banner */}
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="text-xs text-red-900 dark:text-red-300 space-y-1">
                <p className="font-bold">Non-Affiliation Notice:</p>
                <p>GovScheme AI is an independent, non-governmental technological initiative. We are not affiliated with, endorsed by, or operating on behalf of the Government of India, the Government of Tamil Nadu, or any government agency.</p>
              </div>
            </div>

            {/* Terms Articles */}
            <section className="space-y-2">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                1. Nature of the Service
              </h3>
              <p className="text-xs sm:text-sm">
                GovScheme AI provides an automated discovery, cataloguing, and preliminary eligibility evaluation platform for Indian welfare initiatives. All assessments (including "Likely Eligible", "Possibly Eligible", or "Missing Information") are advisory preliminary indications generated from publicly available scheme gazettes and guidelines.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                2. No Guarantee of Government Approval or Benefits
              </h3>
              <p className="text-xs sm:text-sm">
                A "Likely Eligible" rating on this platform does <strong>not</strong> constitute an official grant, sanction order, or approval of welfare benefits. Final determination of eligibility, verification of original certificates, physical field inspection, and financial disbursement remain strictly within the statutory jurisdiction of the competent Government Department, Nodal Officer, or District Collectorate.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                3. Accuracy and Freshness of Scheme Data
              </h3>
              <p className="text-xs sm:text-sm">
                While we make diligent efforts to maintain verified, traceable links to official government sources (such as myscheme.gov.in and tn.gov.in), scheme rules, deadlines, and budget allocations are subject to frequent government notifications. Users must verify all requirements directly on the official department portal before submitting an application.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                4. Third-Party Official Portals & Redirects
              </h3>
              <p className="text-xs sm:text-sm">
                GovScheme contains outbound links to official Central and State government websites. We do not control, operate, or assume responsibility for external government portal downtimes, server maintenance, or processing backlogs.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                5. Limitation of Liability
              </h3>
              <p className="text-xs sm:text-sm">
                Under no circumstances shall GovScheme AI, its developers, or its contributors be held liable for any direct, indirect, incidental, or consequential damages resulting from reliance on scheme descriptions, missed application deadlines, or rejected government submissions.
              </p>
            </section>
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#07111F] flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow transition-colors"
            >
              {t('closeBtn', 'I Accept & Acknowledge')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

