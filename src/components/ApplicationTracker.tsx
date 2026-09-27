import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Clock, 
  ExternalLink, 
  FileText, 
  AlertCircle
} from 'lucide-react';
import { ApplicationTrackerRecord } from '../types';

interface ApplicationTrackerProps {
  applications: ApplicationTrackerRecord[];
  onNavigateTab: (tab: string) => void;
}

export const ApplicationTracker: React.FC<ApplicationTrackerProps> = ({
  applications,
  onNavigateTab
}) => {
  const { t } = useTranslation();
  const customBezier = [0.32, 0.72, 0, 1];

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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gov-navy/5 dark:bg-white/10 text-gov-navy dark:text-white text-xs font-bold border border-gov-navy/10 dark:border-white/10">
            <Clock className="w-4 h-4 text-gov-saffron animate-pulse" /> {t('liveTracking', 'Live Government DBT Tracking')}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold font-sans tracking-tight text-gov-navy dark:text-white">
            {t('citizenAppTracker', 'Application Tracker')}
          </h1>
          <p className="text-lg text-gov-textMuted dark:text-gray-400 max-w-xl">
            {t('trackerDesc', 'Real-time status updates on submitted welfare applications across official portals.')}
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('schemes')}
          className="px-6 py-3 rounded bg-[#123C69] hover:bg-blue-900 text-white font-bold text-sm shadow-sm transition-colors flex items-center gap-2"
        >
          {t('applyNewScheme', 'Apply For New Scheme')}
          <FileText className="w-4 h-4" />
        </button>
      </motion.div>

      {/* Applications List */}
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
                    {t('appId', 'Application ID')}: <span className="font-mono text-gov-navy dark:text-gray-300">{app.applicationNumber}</span> • {t('appliedDate', 'Applied')}: <span className="font-mono text-gov-navy dark:text-gray-300">{app.appliedDate}</span>
                  </p>
                </div>

                <button
                  onClick={() => window.open(app.officialPortalLink, '_blank')}
                  className="px-6 py-2.5 rounded bg-[#1769FF] text-white font-bold text-xs shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2 shrink-0"
                >
                  {t('Track on Official Portal')} <ExternalLink className="w-4 h-4" />
                </button>
              </div>

              {/* Document Verification Smart Checklist */}
              <div className="px-8 sm:px-10 py-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#07111F]">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">{t('Document Verification Checklist')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded bg-green-50 dark:bg-[#16243A] border border-green-200 dark:border-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <div>
                      <span className="block text-sm font-bold text-gray-900 dark:text-white">{t('Aadhaar Card')}</span>
                      <span className="text-xs text-green-700 dark:text-green-400">{t('Verified via DigiLocker')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded bg-green-50 dark:bg-[#16243A] border border-green-200 dark:border-gray-700">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <div>
                      <span className="block text-sm font-bold text-gray-900 dark:text-white">{t('Bank Passbook')}</span>
                      <span className="text-xs text-green-700 dark:text-green-400">{t('NPCI Mapping Complete')}</span>
                    </div>
                  </div>
                  {app.status === 'Under Review' ? (
                    <div className="flex items-center gap-3 p-3 rounded bg-yellow-50 dark:bg-[#16243A] border border-yellow-200 dark:border-gray-700 relative overflow-hidden">
                      <AlertCircle className="w-5 h-5 text-[#D97706]" />
                      <div className="flex-1">
                        <span className="block text-sm font-bold text-gray-900 dark:text-white">{t('Income Certificate')}</span>
                        <span className="text-xs text-[#D97706]">{t('Awaiting Officer Verification')}</span>
                      </div>
                      <button className="text-xs font-bold text-[#1769FF] hover:underline shrink-0">{t('Upload New')}</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 rounded bg-green-50 dark:bg-[#16243A] border border-green-200 dark:border-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                      <div>
                        <span className="block text-sm font-bold text-gray-900 dark:text-white">{t('Income Certificate')}</span>
                        <span className="text-xs text-green-700 dark:text-green-400">{t('Manually Verified')}</span>
                      </div>
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
                    whileInView={{ width: `${(app.statusTimeline.filter(s => s.completed).length / (app.statusTimeline.length - 1)) * 100}%` }}
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
    </div>
  );
};
