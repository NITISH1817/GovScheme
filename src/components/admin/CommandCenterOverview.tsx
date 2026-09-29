import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, CheckSquare, Clock, Database, TrendingUp, AlertTriangle, ShieldAlert, CheckCircle2, Activity, Zap, ExternalLink } from 'lucide-react';

import { useTranslation } from 'react-i18next';

interface CommandCenterOverviewProps {
  stats: any;
}

export const CommandCenterOverview: React.FC<CommandCenterOverviewProps> = ({ stats }) => {
  const { t } = useTranslation();
  const [expandedKpi, setExpandedKpi] = useState<string | null>(null);
  const [selectedInsight, setSelectedInsight] = useState<number | null>(null);

  const kpis = [
    { id: 'total', label: t('adminTotalSchemes', 'Total Schemes'), value: stats.total, trend: t('adminTrendMonth', '+120 this month'), icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', details: t('adminTotalDetails', 'Central: 2,100 | State: 2,400') },
    { id: 'published', label: t('adminPublished', 'Published'), value: stats.published, trend: t('adminTrendActive', '+5% active'), icon: CheckSquare, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', details: t('adminPublishedDetails', 'High confidence matches: 84%') },
    { id: 'pending', label: t('adminPendingReview', 'Pending Review'), value: stats.pending, trend: t('adminTrendYesterday', '-2 since yesterday'), icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', details: t('adminPendingDetails', 'Urgent: 3 | Standard: 9') },
    { id: 'health', label: t('adminDataHealth', 'Data Health'), value: `${stats.dataQuality}%`, trend: t('adminTrendImproved', '+2% improved'), icon: Database, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20', details: t('adminHealthDetails', 'No critical errors detected.') },
  ];

  const insights = [
    { id: 1, type: 'warning', text: t('insightVerification', '12 schemes require verification'), icon: AlertTriangle, color: 'text-amber-500', action: t('actionReviewQueue', 'Review Queue') },
    { id: 2, type: 'error', text: t('insightUrls', '4 official URLs appear unavailable'), icon: ShieldAlert, color: 'text-red-500', action: t('actionFixLinks', 'Fix Links') },
    { id: 3, type: 'trend', text: t('insightSearchTrend', 'Education searches increased 24%'), icon: TrendingUp, color: 'text-blue-500', action: t('actionViewAnalytics', 'View Analytics') },
    { id: 4, type: 'info', text: t('insightIncomplete', '8 schemes have incomplete eligibility data'), icon: Database, color: 'text-indigo-500', action: t('actionUpdateRecords', 'Update Records') },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-12"
    >
      {/* Hero Panel */}
      <motion.div variants={itemVariants} className="bg-gradient-to-br from-[#123C69] to-[#0A2645] dark:from-[#101D31] dark:to-[#0B1424] rounded-2xl p-8 shadow-xl text-white relative overflow-hidden border border-blue-800/30">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 text-blue-300 font-bold text-xs tracking-widest uppercase mb-2">
              <Activity className="w-4 h-4" /> {t('adminOperationsHeader', 'GOVSCHEME OPERATIONS')}
            </div>
            <h2 className="text-3xl font-bold mb-2">{t('adminOverviewTitle', 'Scheme Ecosystem Overview')}</h2>
            <div className="flex items-center gap-2 text-sm text-blue-200">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              {t('adminSystemsOperational', 'All systems operational')}
            </div>
          </div>
          <div className="flex gap-8 bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div>
              <div className="text-blue-300 text-xs font-bold uppercase tracking-wider mb-1">{t('adminSchemesLabel', 'Schemes')}</div>
              <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-blue-300 text-xs font-bold uppercase tracking-wider mb-1">{t('adminRecsLabel', 'Recommendations')}</div>
              <div className="text-2xl font-bold">2,840</div>
            </div>
            <div>
              <div className="text-blue-300 text-xs font-bold uppercase tracking-wider mb-1">{t('adminDataHealthLabel', 'Data Health')}</div>
              <div className="text-2xl font-bold text-emerald-400">{stats.dataQuality}%</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <motion.div 
            key={kpi.id}
            layoutId={`kpi-${kpi.id}`}
            onClick={() => setExpandedKpi(expandedKpi === kpi.id ? null : kpi.id)}
            className={`bg-[#FFFFFF] dark:bg-[#0B1424] p-6 rounded-xl border border-[#E2E8F0] dark:border-[#243449] shadow-sm hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden group`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-lg ${kpi.bg} ${kpi.color}`}>
                <kpi.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">{kpi.trend}</span>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#07111F] dark:text-[#F8FAFC] mb-1 group-hover:scale-105 origin-left transition-transform duration-300">{kpi.value}</div>
              <div className="text-sm font-semibold text-[#64748B] dark:text-[#94A3B8]">{kpi.label}</div>
            </div>
            
            <AnimatePresence>
              {expandedKpi === kpi.id && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-[#E2E8F0] dark:border-[#243449]"
                >
                  <p className="text-sm text-[#07111F] dark:text-[#F8FAFC] font-medium">{kpi.details}</p>
                  <button className="mt-3 text-xs font-bold text-[#1769FF] dark:text-[#60A5FA] hover:underline flex items-center gap-1">
                    {t('adminViewDetails', 'View Details')} <ExternalLink className="w-3 h-3" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Data Insights */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-[#FFFFFF] dark:bg-[#0B1424] rounded-xl border border-[#E2E8F0] dark:border-[#243449] shadow-sm flex flex-col h-full">
          <div className="p-6 border-b border-[#E2E8F0] dark:border-[#243449] flex justify-between items-center bg-[#F8FAFC] dark:bg-[#101D31] rounded-t-xl">
            <h3 className="font-bold text-[#07111F] dark:text-[#F8FAFC] flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#1769FF] dark:text-[#60A5FA]" /> {t('adminAIInsights', 'AI DATA INSIGHTS')}
            </h3>
            <span className="text-xs font-bold bg-[#1769FF]/10 text-[#1769FF] dark:text-[#60A5FA] px-2 py-1 rounded-md">{t('adminLiveAnalysis', 'Live Analysis')}</span>
          </div>
          <div className="p-6 flex-1 flex flex-col gap-4">
            {insights.map(insight => (
              <div key={insight.id} className="border border-[#E2E8F0] dark:border-[#243449] rounded-lg overflow-hidden transition-all hover:border-[#1769FF]/50 dark:hover:border-[#60A5FA]/50">
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#F8FAFC] dark:hover:bg-[#101D31]/50"
                  onClick={() => setSelectedInsight(selectedInsight === insight.id ? null : insight.id)}
                >
                  <div className="flex items-center gap-3">
                    <insight.icon className={`w-5 h-5 ${insight.color}`} />
                    <span className="font-semibold text-sm text-[#07111F] dark:text-[#F8FAFC]">{insight.text}</span>
                  </div>
                  <button className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">
                    {selectedInsight === insight.id ? t('close', 'Close') : t('review', 'Review')}
                  </button>
                </div>
                <AnimatePresence>
                  {selectedInsight === insight.id && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-4 pb-4 pt-2 bg-[#F8FAFC] dark:bg-[#101D31] border-t border-[#E2E8F0] dark:border-[#243449]"
                    >
                      <div className="text-sm text-[#64748B] dark:text-[#94A3B8] mb-4">
                        AI detected anomalies during the last synchronization cycle. It is recommended to perform manual verification on the affected records.
                      </div>
                      <button className="text-sm font-bold bg-white dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] px-4 py-2 rounded-lg text-[#07111F] dark:text-[#F8FAFC] hover:border-[#1769FF] dark:hover:border-[#60A5FA] transition-colors shadow-sm">
                        {insight.action}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.div>

        {/* System Status & Recent Activity */}
        <motion.div variants={itemVariants} className="flex flex-col gap-6 h-full">
          {/* Status Panel */}
          <div className="bg-[#FFFFFF] dark:bg-[#0B1424] rounded-xl border border-[#E2E8F0] dark:border-[#243449] shadow-sm p-6">
            <h3 className="font-bold text-xs text-[#64748B] dark:text-[#94A3B8] tracking-wider uppercase mb-4">SYSTEM STATUS</h3>
            <div className="space-y-3">
              {['Database', 'Authentication', 'AI Service', 'OCR Service', 'Search'].map((sys, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm font-semibold text-[#07111F] dark:text-[#F8FAFC]">
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#15803D] dark:bg-[#4ADE80]"></div>
                    {sys}
                  </span>
                  <span className="text-xs text-[#15803D] dark:text-[#4ADE80]">99.9%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-[#FFFFFF] dark:bg-[#0B1424] rounded-xl border border-[#E2E8F0] dark:border-[#243449] shadow-sm p-6 flex-1">
            <h3 className="font-bold text-xs text-[#64748B] dark:text-[#94A3B8] tracking-wider uppercase mb-4">RECENT ACTIVITY</h3>
            <div className="space-y-4">
              <div className="relative pl-4 border-l-2 border-[#E2E8F0] dark:border-[#243449]">
                <div className="absolute w-2 h-2 rounded-full bg-[#1769FF] dark:bg-[#60A5FA] -left-[5px] top-1.5"></div>
                <div className="text-xs text-[#64748B] dark:text-[#94A3B8] mb-0.5">12:31</div>
                <div className="text-sm font-semibold text-[#07111F] dark:text-[#F8FAFC]">Scheme updated</div>
                <div className="text-xs text-[#1769FF] dark:text-[#60A5FA]">Education Scholarship</div>
              </div>
              <div className="relative pl-4 border-l-2 border-[#E2E8F0] dark:border-[#243449]">
                <div className="absolute w-2 h-2 rounded-full bg-[#15803D] dark:bg-[#4ADE80] -left-[5px] top-1.5"></div>
                <div className="text-xs text-[#64748B] dark:text-[#94A3B8] mb-0.5">12:27</div>
                <div className="text-sm font-semibold text-[#07111F] dark:text-[#F8FAFC]">Scheme verified</div>
                <div className="text-xs text-[#1769FF] dark:text-[#60A5FA]">Farmer Support Scheme</div>
              </div>
              <div className="relative pl-4 border-l-2 border-transparent">
                <div className="absolute w-2 h-2 rounded-full bg-[#B91C1C] dark:bg-[#F87171] -left-[5px] top-1.5"></div>
                <div className="text-xs text-[#64748B] dark:text-[#94A3B8] mb-0.5">12:21</div>
                <div className="text-sm font-semibold text-[#07111F] dark:text-[#F8FAFC]">Data quality issue detected</div>
                <div className="text-xs text-[#B91C1C] dark:text-[#F87171]">3 records affected</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
