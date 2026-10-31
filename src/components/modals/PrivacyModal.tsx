import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Lock, EyeOff, Trash2, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearData?: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose, onClearData }) => {
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
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-white dark:from-[#081F1A] dark:to-[#07111F]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#059669] text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
                  {t('privacyPolicyTitle', 'Privacy Policy & Data Protection')}
                </h2>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                  {t('dpdpAlignedBadge', 'DPDP Act Aligned • Zero Tracker Guarantee')}
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
            {/* Key Commitment Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 text-center space-y-1">
                <EyeOff className="w-5 h-5 text-emerald-600 mx-auto" />
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">No Aadhaar Required</h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Search and check eligibility without uploading identity docs.</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 text-center space-y-1">
                <Lock className="w-5 h-5 text-blue-600 mx-auto" />
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">Local-First Storage</h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Profile data stays in your browser's private vault.</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-800/40 text-center space-y-1">
                <CheckCircle2 className="w-5 h-5 text-purple-600 mx-auto" />
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">Zero Third-Party Ads</h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">No ad pixels, monetization trackers, or data selling.</p>
              </div>
            </div>

            {/* Section 1: What We Collect & Why */}
            <section className="space-y-2">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                1. Data Collection & Purpose Limitation
              </h3>
              <p className="text-xs sm:text-sm">
                In strict adherence to the Indian Digital Personal Data Protection (DPDP) Act, GovScheme AI adheres to the principle of <strong>data minimization</strong>. We only process demographic and socio-economic attributes (such as age, gender, state/district, annual income bracket, occupation, and education tier) strictly necessary to compute scheme eligibility.
              </p>
              <p className="text-xs sm:text-sm">
                <strong>We never mandate or store:</strong> bank account credentials, Aadhaar biometric data, PAN copies, or payment details. Browsing and searching schemes requires zero registration.
              </p>
            </section>

            {/* Section 2: Document Vault & OCR Processing */}
            <section className="space-y-2">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                2. Document Vault & Client-Side OCR
              </h3>
              <p className="text-xs sm:text-sm">
                When you use the AI Document Assistant / OCR Scanner, documents are processed using client-side optical character recognition (Tesseract.js). Extracted parameters (e.g. name or date of birth) are displayed for your explicit manual review and confirmation before being saved to your local profile. No unencrypted document files are transmitted to public AI training pools.
              </p>
            </section>

            {/* Section 3: Third-Party Government Portals */}
            <section className="space-y-2">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                3. Redirection to Official Government Portals
              </h3>
              <p className="text-xs sm:text-sm">
                When you click "Apply on Official Portal", you leave GovScheme and navigate to the external government portal (e.g., pmkisan.gov.in, tn.gov.in). Those external portals operate under their respective Ministry privacy policies and terms. GovScheme does not track your actions or receive application confirmation tokens on third-party government websites.
              </p>
            </section>

            {/* Section 4: Citizen Right to Erasure */}
            <section className="space-y-2">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                4. Your Right to Data Erasure & Account Deletion
              </h3>
              <p className="text-xs sm:text-sm">
                You maintain complete ownership of your data. You may at any time delete all stored profile attributes, document records, saved schemes, and application tracking entries by clicking the "Erase My Data" button below or through the Profile Settings.
              </p>
            </section>
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#07111F] flex flex-col sm:flex-row items-center justify-between gap-3">
            {onClearData ? (
              <button
                onClick={() => {
                  if (window.confirm("Are you sure you want to permanently erase all locally stored citizen profile data, documents, and application records? This action cannot be undone.")) {
                    onClearData();
                    onClose();
                  }
                }}
                className="text-xs text-red-600 dark:text-red-400 font-bold hover:underline flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Erase All My Profile Data
              </button>
            ) : <div />}

            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-[#059669] hover:bg-emerald-700 text-white font-bold text-xs shadow transition-colors"
            >
              {t('closeBtn', 'I Understand & Agree')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

