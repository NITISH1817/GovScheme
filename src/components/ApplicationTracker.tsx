import React, { useState, useMemo } from 'react';
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
  Send,
  Search,
  Copy,
  Check,
  Printer,
  RefreshCw,
  Building2,
  Calendar,
  Sparkles,
  Trash2
} from 'lucide-react';
import { ApplicationTrackerRecord, UserProfile, Scheme } from '../types';

interface ApplicationTrackerProps {
  applications: ApplicationTrackerRecord[];
  onNavigateTab: (tab: string) => void;
  user?: UserProfile | null;
  schemes?: Scheme[];
  onTrackApplication?: (schemeId: string, customAppNumber?: string) => Promise<any>;
  onOpenAuth?: () => void;
  onDeleteApplication?: (id: string, appNumber?: string) => Promise<any> | void;
}

export const ApplicationTracker: React.FC<ApplicationTrackerProps> = ({
  applications,
  onNavigateTab,
  user,
  schemes = [],
  onTrackApplication,
  onOpenAuth,
  onDeleteApplication
}) => {
  const { t } = useTranslation();
  const customBezier = [0.32, 0.72, 0, 1];

  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [selectedSchemeId, setSelectedSchemeId] = useState(schemes[0]?.id || '');
  const [customAppId, setCustomAppId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Search and status filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Submitted' | 'Under Review' | 'Approved'>('All');

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: customBezier } }
  };

  const handleCopyId = (idText: string) => {
    try {
      navigator.clipboard.writeText(idText);
      setCopiedId(idText);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {}
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
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

  // Filtered applications
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const matchSearch =
        !searchQuery.trim() ||
        app.schemeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.applicationNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Submitted' && (app.status === 'Submitted' || app.status === 'Started')) ||
        (statusFilter === 'Under Review' && app.status === 'Under Review') ||
        (statusFilter === 'Approved' && (app.status === 'Approved' || app.status === 'Benefit Released'));

      return matchSearch && matchStatus;
    });
  }, [applications, searchQuery, statusFilter]);

  // Statistics counts
  const totalCount = applications.length;
  const inReviewCount = applications.filter((a) => a.status === 'Under Review' || a.status === 'Submitted').length;
  const approvedCount = applications.filter((a) => a.status === 'Approved' || a.status === 'Benefit Released').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-24 sm:py-32 space-y-10">

      {/* Hero Header & Live Real-Time Banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: customBezier }}
        className="space-y-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#1769FF] dark:text-blue-300 text-xs font-bold border border-blue-200/60 dark:border-blue-900/40 shadow-sm">
                <Clock className="w-3.5 h-3.5 text-[#1769FF]" />
                {t('citizenAppTracker', 'Application Tracker')}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200/60 dark:border-emerald-900/40 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {t('liveSyncActive', 'Live Real-Time Sync Active')}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gov-navy dark:text-white font-sans">
              {t('welfareApplicationTracker', 'Welfare Application Tracker')}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-2xl leading-relaxed">
              {t('trackerDetailedDesc', 'Real-time multi-stage monitoring of your Central & State welfare applications, nodal department review stages, document verification, and DBT milestone disbursements.')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleRefresh}
              title={t('refreshLiveTracker', 'Refresh Live Tracker')}
              className="px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#0F1B2D] hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold transition flex items-center gap-2 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#1769FF] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{t('refreshData', 'Sync Live')}</span>
            </button>

            {onDeleteApplication && applications.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(t('confirmClearAllApps', 'Clear all applications from your tracker?'))) {
                    applications.forEach(a => onDeleteApplication(a.id, a.applicationNumber));
                  }
                }}
                title={t('clearAllApps', 'Clear All Applications')}
                className="px-3.5 py-2.5 rounded-xl border border-red-200 dark:border-red-900/40 bg-white dark:bg-[#0F1B2D] hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{t('clearAll', 'Clear All')}</span>
              </button>
            )}

            <button
              onClick={() => onNavigateTab('schemes')}
              className="px-4 py-2.5 rounded-xl bg-[#123C69] hover:bg-blue-900 text-white font-bold text-xs shadow-sm transition flex items-center gap-2"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{t('applyNewScheme', 'Apply For New Scheme')}</span>
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
                className="px-4 py-2.5 rounded-xl bg-[#1769FF] hover:bg-blue-700 text-white font-bold text-xs shadow transition flex items-center gap-2"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{t('trackApplicationAction', 'Track Application')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Metrics Quick Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0F1B2D] border border-gray-200 dark:border-gray-800/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block">
                {t('totalTracked', 'Total Tracked Applications')}
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-gov-navy dark:text-white mt-1 block">
                {totalCount}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#1769FF] flex items-center justify-center font-bold">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0F1B2D] border border-gray-200 dark:border-gray-800/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                {t('inReviewOrSubmitted', 'In Review / Processing')}
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-1 block">
                {inReviewCount}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0F1B2D] border border-gray-200 dark:border-gray-800/80 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                {t('approvedOrReleased', 'Approved / Benefit Released')}
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 block">
                {approvedCount}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search and Status Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-2 sm:p-3 rounded-2xl bg-white dark:bg-[#0F1B2D] border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchTrackPlaceholder', 'Search by scheme name or tracking ID...')}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#07111F] text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#1769FF] transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {(['All', 'Submitted', 'Under Review', 'Approved'] as const).map((filterKey) => (
            <button
              key={filterKey}
              onClick={() => setStatusFilter(filterKey)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === filterKey
                  ? 'bg-[#1769FF] text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {t(filterKey, filterKey)}
              {filterKey === 'All' && ` (${totalCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Applications List or Empty State */}
      {filteredApps.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-12 sm:p-16 text-center rounded-3xl border border-dashed border-gray-300 dark:border-gray-800 bg-white dark:bg-[#0F1B2D] space-y-6 shadow-sm"
        >
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#1769FF] flex items-center justify-center mx-auto shadow-inner">
            <FileText className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-2xl font-bold text-gov-navy dark:text-white font-sans">
              {searchQuery || statusFilter !== 'All'
                ? t('noMatchingApplications', 'No Matching Applications Found')
                : t('noLiveApplications', 'No Live Applications Found')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {searchQuery || statusFilter !== 'All'
                ? t('tryAdjustingFilters', 'Try adjusting your search query or status filter to see other applications.')
                : t('noAppsSubmittedYet', 'Whenever you apply for any government scheme on GovScheme, it is automatically logged here with a live tracking reference code!')}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigateTab('schemes')}
              className="px-6 py-3 rounded-xl bg-[#1769FF] hover:bg-blue-700 text-white font-bold text-sm shadow transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{t('exploreSchemes', 'Browse Verified Schemes to Apply')}</span>
            </button>
            {onTrackApplication && (
              <button
                type="button"
                onClick={() => setIsTrackModalOpen(true)}
                className="px-5 py-3 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center gap-2 shadow-sm"
              >
                <PlusCircle className="w-4 h-4 text-[#1769FF]" />
                <span>{t('trackExistingApp', 'Track Existing Application Number')}</span>
              </button>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {filteredApps.map((app) => {
            const matchedScheme = schemes.find(
              (s) => s.id === app.schemeId || (s as any).schemeId === app.schemeId
            );
            const stateLabel =
              matchedScheme?.state === 'All' || matchedScheme?.state === 'Central'
                ? 'Central Scheme'
                : `${matchedScheme?.state || 'State'} Welfare Initiative`;

            return (
              <motion.div
                key={app.id}
                variants={itemVariants}
                className="rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden bg-white dark:bg-[#0F1B2D] transition hover:shadow-md"
              >
                {/* Application Header Card */}
                <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-800/80 bg-slate-50/70 dark:bg-[#0B1524] flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider bg-blue-100/70 dark:bg-blue-900/40 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                        {stateLabel}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase shadow-sm border ${
                          app.status === 'Approved' || app.status === 'Benefit Released'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            app.status === 'Approved' || app.status === 'Benefit Released'
                              ? 'bg-emerald-500'
                              : 'bg-amber-500 animate-pulse'
                          }`}
                        />
                        {t(app.status, app.status)}
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-extrabold text-gov-navy dark:text-white tracking-tight">
                      {t(`${app.schemeId}_name`, app.schemeName)}
                    </h2>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">{t('appId', 'Reference ID')}:</span>
                        <code className="px-2 py-0.5 rounded bg-gray-200/70 dark:bg-gray-800 font-mono font-bold text-gray-900 dark:text-white text-xs">
                          {app.applicationNumber}
                        </code>
                        <button
                          type="button"
                          onClick={() => handleCopyId(app.applicationNumber)}
                          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition"
                          title="Copy Application Number"
                        >
                          {copiedId === app.applicationNumber ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span>{t('appliedDate', 'Applied')}:</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{app.appliedDate}</span>
                      </div>

                      {matchedScheme?.department && (
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-gray-400" />
                          <span className="truncate max-w-xs">{t(matchedScheme.department, matchedScheme.department)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#07111F] hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                      title="Print Application Acknowledgment Slip"
                    >
                      <Printer className="w-3.5 h-3.5 text-gray-500" />
                      <span className="hidden sm:inline">{t('printSlip', 'Slip')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const skipNotice = localStorage.getItem('govscheme_skip_redirect_notice');
                        if (skipNotice === 'true') {
                          window.open(app.officialPortalLink, '_blank', 'noopener,noreferrer');
                        } else {
                          window.dispatchEvent(
                            new CustomEvent('govscheme_open_modal', {
                              detail: {
                                type: 'redirect',
                                url: app.officialPortalLink,
                                schemeName: app.schemeName
                              }
                            })
                          );
                        }
                      }}
                      className="px-5 py-2.5 rounded-xl bg-[#1769FF] hover:bg-blue-700 text-white font-bold text-xs shadow transition flex items-center gap-2"
                    >
                      <span>{t('trackOnOfficialPortal', 'Track on Official Portal')}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>

                    {onDeleteApplication && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(t('confirmRemoveApp', 'Remove this application from your tracker?'))) {
                            onDeleteApplication(app.id, app.applicationNumber);
                          }
                        }}
                        className="p-2.5 rounded-xl border border-red-200 dark:border-red-900/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition shadow-sm"
                        title={t('removeApp', 'Remove from Tracker')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Document Verification Checklist */}
                <div className="px-6 sm:px-8 py-5 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#07111F]">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>{t('documentVerificationChecklist', 'Document Verification & Eligibility Checklist')}</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {app.verifiedDocuments && app.verifiedDocuments.length > 0 ? (
                      app.verifiedDocuments.map((doc, dIdx) => (
                        <div
                          key={dIdx}
                          className={`flex items-center gap-3 p-3 rounded-2xl border ${
                            doc.verified
                              ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60'
                              : 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60'
                          }`}
                        >
                          {doc.verified ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <span className="block text-xs font-bold text-gray-900 dark:text-white truncate">
                              {doc.name}
                            </span>
                            <span
                              className={`text-[11px] font-medium ${
                                doc.verified
                                  ? 'text-emerald-700 dark:text-emerald-400'
                                  : 'text-amber-700 dark:text-amber-400'
                              }`}
                            >
                              {doc.label}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : user?.documents && user.documents.length > 0 ? (
                      user.documents.slice(0, 3).map((doc, dIdx) => (
                        <div
                          key={dIdx}
                          className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div className="min-w-0">
                            <span className="block text-xs font-bold text-gray-900 dark:text-white truncate">
                              {doc.type || doc.documentType}
                            </span>
                            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                              {doc.status === 'Verified'
                                ? t('verifiedVault', 'Verified in Citizen Vault')
                                : t('uploadedLinked', 'Uploaded & Linked')}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full py-2.5 px-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-300 flex items-center justify-between">
                        <span>
                          {t(
                            'noDocsLinkedNotice',
                            'No documents directly attached yet. Keep your Citizen Vault updated for accelerated DBT approval.'
                          )}
                        </span>
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

                {/* Animated Horizontal Timeline Progress */}
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400">
                      {t('timelineProgress', 'Official Verification Stages & Milestone Flow')}
                    </h3>
                    <span className="text-xs font-semibold text-gray-500">
                      {app.statusTimeline.filter((s) => s.completed).length} / {app.statusTimeline.length} {t('stagesDone', 'Completed')}
                    </span>
                  </div>

                  <div className="relative pt-2 pb-4">
                    {/* Background Track Line */}
                    <div className="hidden md:block absolute top-7 left-8 right-8 h-1 bg-gray-200 dark:bg-gray-800 rounded-full" />

                    {/* Active Progress Line */}
                    <div
                      style={{
                        width: `${
                          (app.statusTimeline.filter((s) => s.completed).length /
                            Math.max(1, app.statusTimeline.length - 1)) *
                          100
                        }%`
                      }}
                      className="hidden md:block absolute top-7 left-8 h-1 bg-emerald-600 rounded-full origin-left z-0 transition-all duration-700"
                    />

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 relative z-10">
                      {app.statusTimeline.map((stageItem, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col items-center text-center group/node"
                        >
                          <div
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm mb-3 transition-all ${
                              stageItem.completed
                                ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            {stageItem.completed ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : (
                              <Clock className="w-4 h-4 opacity-50" />
                            )}
                          </div>

                          <span className="font-extrabold text-xs text-gov-navy dark:text-white leading-tight mb-1">
                            {t(stageItem.stage, stageItem.stage)}
                          </span>

                          <span className="text-[10px] font-mono text-gray-400">
                            {stageItem.completed ? stageItem.date : t('pending', 'Pending')}
                          </span>

                          {stageItem.remarks && (
                            <span className="text-[10px] font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md mt-1.5 leading-tight block w-full truncate" title={stageItem.remarks}>
                              {stageItem.remarks}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Live Track Application Modal */}
      <AnimatePresence>
        {isTrackModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white dark:bg-[#0F1B2D] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2.5 text-gov-navy dark:text-white font-extrabold text-lg">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#1769FF] flex items-center justify-center font-bold">
                    <PlusCircle className="w-5 h-5" />
                  </div>
                  <span>{t('trackNewAppTitle', 'Track Government Application')}</span>
                </div>
                <button
                  onClick={() => setIsTrackModalOpen(false)}
                  className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {trackError && (
                <div className="mt-4 p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5 border border-red-200 dark:border-red-800">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{trackError}</span>
                </div>
              )}

              <form onSubmit={handleModalSubmit} className="space-y-5 mt-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                    {t('selectScheme', 'Select Welfare Scheme')} *
                  </label>
                  <select
                    value={selectedSchemeId}
                    onChange={(e) => setSelectedSchemeId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#07111F] text-gray-900 dark:text-white text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#1769FF]"
                    required
                  >
                    {schemes.map((s) => (
                      <option key={s.id} value={s.id}>
                        {t(`${s.id}_name`, s.name)} ({s.state === 'All' || s.state === 'Central' ? 'Central' : s.state})
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
                    placeholder={t('appRefPlaceholder', 'e.g. PMK-TN-2026-98124 or leave blank to auto-generate')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#07111F] text-gray-900 dark:text-white text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#1769FF]"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    {t('appRefHint', 'Enter receipt ID or leave empty for automatic official verification reference.')}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsTrackModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    {t('cancel', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#1769FF] hover:bg-blue-700 text-white shadow transition flex items-center gap-2 disabled:opacity-50"
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
