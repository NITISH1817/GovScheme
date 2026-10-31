import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, ShieldCheck, AlertTriangle, Building, ArrowRight, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ExternalRedirectModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUrl: string;
  schemeName?: string;
  department?: string;
}

export const ExternalRedirectModal: React.FC<ExternalRedirectModalProps> = ({
  isOpen,
  onClose,
  targetUrl,
  schemeName,
  department
}) => {
  const { t } = useTranslation();
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen || !targetUrl) return null;

  let hostname = '';
  let isGovDomain = false;
  let isNicDomain = false;

  try {
    const urlObj = new URL(targetUrl);
    hostname = urlObj.hostname;
    isGovDomain = hostname.endsWith('.gov.in') || hostname.endsWith('.tn.gov.in');
    isNicDomain = hostname.endsWith('.nic.in');
  } catch {
    hostname = targetUrl;
  }

  const isVerifiedOfficial = isGovDomain || isNicDomain;

  const handleProceed = () => {
    if (dontShowAgain && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('govscheme_skip_redirect_notice', 'true');
      } catch {}
    }
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white dark:bg-[#07111F] rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gradient-to-r from-blue-50/60 to-white dark:from-[#0B1524] dark:to-[#07111F]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950 text-[#1769FF] flex items-center justify-center font-bold">
                <ExternalLink className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-gray-900 dark:text-white">
                  {t('leavingGovScheme', 'Leaving GovScheme')}
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('redirectingExternal', 'Redirecting to official external portal')}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4 text-xs sm:text-sm">
            {/* Destination Preview Card */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#0B1424] border border-gray-200 dark:border-gray-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{t('destinationWebsite', 'Destination Website')}</span>
                {isVerifiedOfficial ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    {t('verifiedGovPortal', 'Verified Government Portal')}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-800">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    {t('deptAgencyPortal', 'Department / Agency Portal')}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-mono font-bold text-sm text-gray-900 dark:text-white truncate">
                  {hostname}
                </span>
              </div>

              <p className="text-[11px] font-mono text-gray-500 truncate" title={targetUrl}>
                {targetUrl}
              </p>

              {schemeName && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-gray-900 dark:text-white">Scheme:</span> {schemeName}
                  {department && <span className="block text-[11px] text-gray-500">{department}</span>}
                </div>
              )}
            </div>

            {/* Platform Disclaimers */}
            <div className="space-y-2 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              <p>
                <strong>Notice:</strong> GovScheme AI is an independent advisory directory and does not accept applications or collect processing fees.
              </p>
              <p>
                You are being taken directly to the authorized government portal to fill and submit your application. Always verify application instructions, dates, and required documents directly on the official portal.
              </p>
            </div>

            {/* Don't show again for official gov domains */}
            {isVerifiedOfficial && (
              <label className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="rounded border-gray-300 text-[#1769FF] focus:ring-[#1769FF]"
                />
                <span>{t('dontShowAgainNotice', "Don't show this confirmation for verified .gov.in portals")}</span>
              </label>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#07111F] flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 text-xs font-semibold transition"
            >
              Stay on GovScheme
            </button>
            <button
              onClick={handleProceed}
              className="px-6 py-2.5 rounded-xl bg-[#1769FF] hover:bg-blue-700 text-white font-bold text-xs shadow flex items-center gap-1.5 transition"
            >
              <span>{t('proceedToOfficialPortal', 'Proceed to Official Portal')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

