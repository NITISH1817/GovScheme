import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  FileText,
  AlertCircle,
  PlusCircle,
  X,
  ShieldCheck,
  Send
} from 'lucide-react';
import { ApplicationTrackerRecord, UserProfile, Scheme } from '../types';

interface ApplicationTrackerProps {
  applications: ApplicationTrackerRecord[];
  onNavigateTab: (tab: string) => void;
  user?: UserProfile | null;
  schemes?: Scheme[];
  onTrackApplication?: (schemeId: string, customAppNumber?: string) => Promise<void>;
  onOpenAuth?: () => void;
}

export const ApplicationTracker: React.FC<ApplicationTrackerProps> = ({
  applications,
  onNavigateTab,
  user,
  schemes = [],
  onTrackApplication,
  onOpenAuth
}) => {
  const { t } = useTranslation();
  const customBezier = [0.32, 0.72, 0, 1];

  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [selectedSchemeId, setSelectedSchemeId] = useState(schemes[0]?.id || '');
  const [customAppId, setCustomAppId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: customBezier } }
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchemeId) return;
    if (!user && onOpenAuth) {
      setIsTrackModalOpen(false);
      onOpenAuth();
      return;
    }
    if (!onTrackApplication) return;

    setIsSubmitting(true);
    setTrackError(null);
    try {
      await onTrackApplication(selectedSchemeId, customAppId.trim() || undefined);
      setIsTrackModalOpen(false);
      setCustomAppId('');
    } catch (err: any) {
      setTrackError(err.message || 'Failed to record application');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-32 space-y-16">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: customBezier }}
        className="flex flex-col md:flex-row items-center justify-between gap-8 text-center sm:text-left"
      >
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-white/10 text-[#1769FF] dark:text-blue-300 text-xs font-bold border border-blue-200/60 dark:border-white/10">
            <Clock className="w-4 h-4 text-[#1769FF]" /> {t('trackerBadge', 'Application & Verification Status Tracker')}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold font-sans tracking-tight text-gov-navy dark:text-white">
            {t('citizenAppTracker', 'Application Tracker')}
          </h1>
          <p className="text-lg text-gov-textMuted dark:text-gray-400 max-w-xl">
            {t('trackerDesc', 'Status updates on submitted welfare applications across official portals.')}
          </p>
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-xs text-blue-950 dark:text-blue-300 max-w-2xl">
            <AlertCircle className="w-4 h-4 text-[#1769FF] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {t('trackerOperationalDisclaimer', 'GovScheme records application information and status updates entered by citizens or authorized administrators. For official application and benefit disbursement status, visit the relevant government portal.')}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => onNavigateTab('schemes')}
            className="px-6 py-3 rounded bg-[#123C69] hover:bg-blue-900 text-white font-bold text-sm shadow-sm transition-colors flex items-center gap-2"
          >
            {t('applyNewScheme', 'Apply For New Scheme')}
            <FileText className="w-4 h-4" />
          </button>
          {onTrackApplication && (
            <button
              onClick={() => {
                if (!user && onOpenAuth) {
                  onOpenAuth();
                } else {
                  setIsTrackModalOpen(true);
                }
              }}
              className="px-5 py-3 rounded border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-white font-bold text-sm shadow-sm transition-colors flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-[#1769FF]" />
              {t('trackApplicationAction', 'Track Application')}
            </button>
          )}
        </div>
      </motion.div>

      {/* Applications List or Live Empty State */}
      {applications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-12 sm:p-16 text-center rounded-2xl border border-dashed border-gray-300 dark:border-gray-800 bg-white dark:bg-[#0F1B2D] space-y-6 shadow-sm"
        >
          <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#1769FF] flex items-center justify-center mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-2xl font-bold text-gov-navy dark:text-white font-sans">
              {t('noLiveApplications', 'No Live Applications Found')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {!user
                ? t('signInToTrackLive', 'Sign in with your verified citizen account to track your real-time welfare applications, DBT benefits, and nodal review stages.')
                : t('noAppsSubmittedYet', 'You have not submitted or recorded any scheme applications yet. Browse verified Central and State schemes to apply or record an existing application.')}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {!user ? (
              <button
                type="button"
                onClick={onOpenAuth}
                className="px-6 py-3 rounded bg-[#1769FF] hover:bg-blue-700 text-white font-bold text-sm shadow transition"
              >
                {t('signInToTrack', 'Sign In to Access Live Tracker')}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onNavigateTab('schemes')}
                  className="px-6 py-3 rounded bg-[#1769FF] hover:bg-blue-700 text-white font-bold text-sm shadow transition flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  {t('exploreSchemes', 'Explore Schemes & Apply')}
                </button>
                {onTrackApplication && (
                  <button
                    type="button"
                    onClick={() => setIsTrackModalOpen(true)}
                    className="px-5 py-3 rounded border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4 text-[#1769FF]" />
                    {t('trackExistingApp', 'Track Existing Application')}
                  </button>
                )}
              </>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-12"
        >
          {applications.map((app) => (
            <motion.div key={app.id} variants={itemVariants} className="p-0 rounded border border-gray-200 dark:border-gray-800 shadow-sm relative group overflow-hidden bg-white dark:bg-[#0F1B2D]">
              <div className="relative z-10 flex flex-col">

                <div className="p-8 sm:p-10 border-b border-gov-border dark:border-white/10 bg-slate-50 dark:bg-[#050505] flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-extrabold text-2xl text-gov-navy dark:text-white font-sans tracking-tight">
                        {t(`${app.schemeId}_name`, app.schemeName)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-extrabold tracking-wider uppercase shadow-sm border ${
                        app.status === 'Approved' || app.status === 'Benefit Released'
                          ? 'bg-gov-green/10 text-gov-green border-gov-green/20'
                          : 'bg-gov-saffron/10 text-gov-saffron border-gov-saffron/20'
                      }`}>
                        {t(app.status, app.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gov-textMuted dark:text-gray-400 font-medium">
                      {t('appId', 'Application ID')}: <span className="font-mono text-gov-navy dark:text-gray-300 font-bold">{app.applicationNumber}</span> • {t('appliedDate', 'Applied')}: <span className="font-mono text-gov-navy dark:text-gray-300">{app.appliedDate}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => window.open(app.officialPortalLink, '_blank')}
                    className="px-6 py-2.5 rounded bg-[#1769FF] text-white font-bold text-xs shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2 shrink-0"
                  >
                    {t('trackOnOfficialPortal', 'Track on Official Portal')} <ExternalLink className="w-4 h-4" />
                  </button>
                </div>

                {/* Dynamic Document Verification Checklist */}
                <div className="px-8 sm:px-10 py-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#07111F]">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    {t('documentVerificationChecklist', 'Document Verification Checklist')}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {app.verifiedDocuments && app.verifiedDocuments.length > 0 ? (
                      app.verifiedDocuments.map((doc, dIdx) => (
                        <div key={dIdx} className={`flex items-center gap-3 p-3 rounded border ${
                          doc.verified
                            ? 'bg-green-50 dark:bg-[#16243A] border-green-200 dark:border-gray-700'
                            : 'bg-yellow-50 dark:bg-[#16243A] border-yellow-200 dark:border-gray-700'
                        }`}>
                          {doc.verified ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-[#D97706] shrink-0" />
                          )}
                          <div className="min-w-0">
                            <span className="block text-sm font-bold text-gray-900 dark:text-white truncate">{doc.name}</span>
                            <span className={`text-xs ${doc.verified ? 'text-green-700 dark:text-green-400' : 'text-[#D97706]'}`}>
                              {doc.label}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : user?.documents && user.documents.length > 0 ? (
                      user.documents.slice(0, 3).map((doc, dIdx) => (
                        <div key={dIdx} className="flex items-center gap-3 p-3 rounded bg-green-50 dark:bg-[#16243A] border border-green-200 dark:border-gray-700">
                          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                          <div className="min-w-0">
                            <span className="block text-sm font-bold text-gray-900 dark:text-white truncate">{doc.type || doc.documentType}</span>
                            <span className="text-xs text-green-700 dark:text-green-400">
                              {doc.status === 'Verified' ? t('verifiedVault', 'Verified in Citizen Vault') : t('uploadedLinked', 'Uploaded & Linked')}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full py-2 px-3 rounded bg-gray-50 dark:bg-[#16243A] border border-gray-200 dark:border-gray-700 text-xs text-gray-600 dark:text-gray-300 flex items-center justify-between">
                        <span>{t('noDocsLinkedNotice', 'No documents directly attached yet. Keep your Citizen Vault updated for accelerated DBT approval.')}</span>
                        <button
                          type="button"
                          onClick={() => onNavigateTab('vault')}
                          className="text-[#1769FF] font-bold hover:underline ml-2 shrink-0"
                        >
                          {t('openVaultAction', 'Open Vault →')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Animated Horizontal Timeline */}
                <div className="p-8 sm:p-10 relative">
                  <h3 className="font-bold text-sm text-gov-navy dark:text-white font-sans tracking-tight mb-8">
                    {t('timelineProgress', 'Verification Timeline')}
                  </h3>

                  <div className="relative">
                    {/* Background Track Line */}
                    <div className="absolute top-6 left-6 right-6 h-1 bg-gray-200 dark:bg-gray-800 rounded-full" />

                    {/* Progress Line */}
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(app.statusTimeline.filter(s => s.completed).length / Math.max(1, app.statusTimeline.length - 1)) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, delay: 0.5 }}
                      className="absolute top-6 left-6 h-1 bg-[#15803D] rounded-full origin-left z-0"
                    />

                    <div className="grid grid-cols-2 md:grid-cols-6 gap-6 relative z-10">
                      {app.statusTimeline.map((stageItem, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.6, delay: 0.2 + (idx * 0.1), ease: customBezier }}
                          className="flex flex-col items-center text-center group/node"
                        >
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm mb-4 transition-colors relative z-10 ${
                              stageItem.completed
                                ? 'bg-[#15803D] text-white border-2 border-white dark:border-[#0F1B2D]'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 border-2 border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            {stageItem.completed ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : (
                              <Clock className="w-4 h-4 opacity-50" />
                            )}
                          </div>

                          <span className="font-extrabold text-sm text-gov-navy dark:text-white leading-tight mb-1">
                            {t(stageItem.stage, stageItem.stage)}
                          </span>

                          {stageItem.completed && (
                            <span className="text-[10px] font-bold text-gov-textMuted dark:text-gray-400 tracking-wider uppercase">
                              {stageItem.date}
                            </span>
                          )}

                          {stageItem.remarks && (
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="text-[10px] text-gov-saffron font-bold bg-gov-saffron/10 px-2 py-1.5 rounded-md mt-2 w-full leading-tight"
                            >
                              {t(stageItem.remarks, stageItem.remarks)}
                            </motion.p>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Live Track Application Modal */}
      <AnimatePresence>
        {isTrackModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-[#0F1B2D] border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2 text-gov-navy dark:text-white font-bold text-lg">
                  <PlusCircle className="w-5 h-5 text-[#1769FF]" />
                  <span>{t('trackNewAppTitle', 'Track Government Application')}</span>
                </div>
                <button
                  onClick={() => setIsTrackModalOpen(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {trackError && (
                <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{trackError}</span>
                </div>
              )}

              <form onSubmit={handleModalSubmit} className="space-y-5 mt-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    {t('selectScheme', 'Select Welfare Scheme')}
                  </label>
                  <select
                    value={selectedSchemeId}
                    onChange={(e) => setSelectedSchemeId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#07111F] text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-[#1769FF]"
                    required
                  >
                    {schemes.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.state === 'All' ? 'Central' : s.state})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    {t('appRefNumber', 'Application / Acknowledgement Number (Optional)')}
                  </label>
                  <input
                    type="text"
                    value={customAppId}
                    onChange={(e) => setCustomAppId(e.target.value)}
                    placeholder={t('appRefPlaceholder', 'e.g. PMK-TN-2026-98124 or AwasSoft Ref ID')}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#07111F] text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-[#1769FF]"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    {t('appRefHint', 'Enter the reference code provided by the official portal receipt.')}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsTrackModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    {t('cancel', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 rounded-lg text-sm font-bold bg-[#1769FF] hover:bg-blue-700 text-white shadow transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>{t('saving', 'Saving...')}</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{t('startTracking', 'Start Live Tracking')}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
