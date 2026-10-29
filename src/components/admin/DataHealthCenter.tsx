import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Database, AlertTriangle, Link2Off, Activity, ShieldAlert, GitMerge, 
  Check, X, CheckCircle2, RefreshCw, Edit3, ExternalLink, Sparkles
} from 'lucide-react';

interface HealthIssue {
  id: string;
  schemeName: string;
  type: 'broken_url' | 'outdated_helpline' | 'missing_rule';
  description: string;
  recommendedAction: string;
}

interface DuplicatePair {
  id: string;
  similarity: number;
  recordA: {
    name: string;
    department: string;
    benefit: string;
    lastUpdated: string;
  };
  recordB: {
    name: string;
    department: string;
    benefit: string;
    lastUpdated: string;
  };
}

export const DataHealthCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'issues' | 'duplicates'>('issues');
  const [isScanning, setIsScanning] = useState(false);
  const [healthScore, setHealthScore] = useState(94);
  const [warningCount, setWarningCount] = useState(3);
  const [criticalCount, setCriticalCount] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [issues, setIssues] = useState<HealthIssue[]>([
    {
      id: 'iss_1',
      schemeName: 'National Scholarship Portal (PMS)',
      type: 'broken_url',
      description: 'HTTP 404 response detected on official portal application URL.',
      recommendedAction: 'Update URL to official canonical https://scholarships.gov.in'
    },
    {
      id: 'iss_2',
      schemeName: 'PM Kisan Samman Nidhi',
      type: 'outdated_helpline',
      description: 'Helpline toll-free 155261 requires verification against latest ministry gazette.',
      recommendedAction: 'Verify and synchronize helpline contact records.'
    },
    {
      id: 'iss_3',
      schemeName: 'Ayushman Bharat PM-JAY',
      type: 'missing_rule',
      description: 'Secondary hospital coverage criteria lacks explicit state domicile rule.',
      recommendedAction: 'Set domicile rule condition to "Central / All States".'
    }
  ]);

  const [duplicates, setDuplicates] = useState<DuplicatePair[]>([
    {
      id: 'dup_1',
      similarity: 92,
      recordA: {
        name: 'PMAY-G (Rural Housing)',
        department: 'Ministry of Rural Development',
        benefit: '₹1,20,000 for house construction',
        lastUpdated: '12 Oct 2026'
      },
      recordB: {
        name: 'Pradhan Mantri Awas Yojana Gramin',
        department: 'Rural Development Department',
        benefit: '₹1.2 Lakh',
        lastUpdated: 'Just now'
      }
    }
  ]);

  const [reviewingIssue, setReviewingIssue] = useState<HealthIssue | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleRunFullScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setHealthScore(98);
      showToast('Comprehensive scan complete: All scheme records, URLs, and rule logic verified.');
    }, 1200);
  };

  const handleResolveIssue = (id: string) => {
    setIssues(prev => prev.filter(i => i.id !== id));
    setWarningCount(prev => Math.max(0, prev - 1));
    setHealthScore(prev => Math.min(100, prev + 2));
    setReviewingIssue(null);
    showToast('Issue resolved and updated in scheme database.');
  };

  const handleMergeDuplicate = (dupId: string) => {
    setDuplicates(prev => prev.filter(d => d.id !== dupId));
    setHealthScore(prev => Math.min(100, prev + 3));
    showToast('Duplicate resolved: Record B merged cleanly into Record A.');
  };

  const handleKeepBoth = (dupId: string) => {
    setDuplicates(prev => prev.filter(d => d.id !== dupId));
    showToast('Both records verified and retained as distinct welfare programs.');
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 rounded-xl text-emerald-800 dark:text-emerald-200 font-bold text-sm flex items-center gap-2 shadow-sm"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#07111F] dark:text-[#F8FAFC]">Data Intelligence Center</h1>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">Monitor schema integrity, detect anomalies, and resolve duplicates.</p>
        </div>
        <button 
          onClick={handleRunFullScan}
          disabled={isScanning}
          className="px-4 py-2 bg-[#1769FF] hover:bg-[#123C69] disabled:opacity-70 text-white rounded-lg font-bold text-sm transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2 cursor-pointer"
        >
          <Activity className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} /> 
          {isScanning ? 'Running Scan...' : 'Run Full Scan'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Visual Data Health */}
        <div className="bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] rounded-xl p-6 flex items-center justify-between shadow-sm">
          <div>
            <h3 className="font-bold text-[#07111F] dark:text-[#F8FAFC] mb-1">Overall Health</h3>
            <div className="text-4xl font-bold text-[#15803D] dark:text-[#4ADE80]">{healthScore}%</div>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">High data reliability index</p>
          </div>
          <div className="relative w-24 h-24">
            <svg viewBox="0 0 36 36" className="w-24 h-24 stroke-current text-[#15803D] dark:text-[#4ADE80]">
              <path
                className="text-[#E2E8F0] dark:text-[#243449]"
                strokeWidth="3"
                strokeDasharray="100, 100"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                strokeWidth="3"
                strokeDasharray={`${healthScore}, 100`}
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Database className="w-6 h-6 text-[#15803D] dark:text-[#4ADE80]" />
            </div>
          </div>
        </div>

        <div className="bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] rounded-xl p-6 flex flex-col justify-center shadow-sm">
          <div className="flex items-center gap-2 text-[#D97706] dark:text-[#FBBF24] mb-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-bold text-sm tracking-wider uppercase">Warnings</span>
          </div>
          <div className="text-3xl font-bold text-[#07111F] dark:text-[#F8FAFC]">{warningCount}</div>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">Pending validation items</p>
        </div>

        <div className="bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] rounded-xl p-6 flex flex-col justify-center shadow-sm">
          <div className="flex items-center gap-2 text-[#B91C1C] dark:text-[#F87171] mb-2">
            <ShieldAlert className="w-5 h-5" />
            <span className="font-bold text-sm tracking-wider uppercase">Critical Issues</span>
          </div>
          <div className="text-3xl font-bold text-[#07111F] dark:text-[#F8FAFC]">{issues.length > 0 ? issues.length : criticalCount}</div>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">Actionable database items</p>
        </div>
      </div>

      <div className="flex border-b border-[#E2E8F0] dark:border-[#243449]">
        <button
          onClick={() => setActiveTab('issues')}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors cursor-pointer ${activeTab === 'issues' ? 'border-[#1769FF] text-[#1769FF] dark:border-[#60A5FA] dark:text-[#60A5FA]' : 'border-transparent text-[#64748B] dark:text-[#94A3B8] hover:text-[#07111F] dark:hover:text-[#F8FAFC]'}`}
        >
          Active Issues ({issues.length})
        </button>
        <button
          onClick={() => setActiveTab('duplicates')}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors cursor-pointer ${activeTab === 'duplicates' ? 'border-[#1769FF] text-[#1769FF] dark:border-[#60A5FA] dark:text-[#60A5FA]' : 'border-transparent text-[#64748B] dark:text-[#94A3B8] hover:text-[#07111F] dark:hover:text-[#F8FAFC]'}`}
        >
          Duplicate Resolution ({duplicates.length})
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'issues' && (
          <motion.div 
            key="issues"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex-1 bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] rounded-xl shadow-sm overflow-hidden"
          >
            <div className="p-4 border-b border-[#E2E8F0] dark:border-[#243449] bg-[#F5F7FA] dark:bg-[#101D31] flex justify-between items-center">
              <h3 className="font-bold text-[#07111F] dark:text-[#F8FAFC] text-sm">Needs Attention</h3>
              <span className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">{issues.length} flagged items</span>
            </div>
            
            {issues.length === 0 ? (
              <div className="p-12 text-center text-sm font-semibold text-[#64748B] dark:text-[#94A3B8]">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                All active issues have been reviewed and resolved!
              </div>
            ) : (
              <div className="divide-y divide-[#E2E8F0] dark:divide-[#243449]">
                {issues.map((iss) => (
                  <div key={iss.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F5F7FA] dark:hover:bg-[#101D31]/50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-[#B91C1C]/10 text-[#B91C1C] dark:bg-[#F87171]/10 dark:text-[#F87171] rounded-lg shrink-0 mt-0.5">
                        <Link2Off className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-[#07111F] dark:text-[#F8FAFC] text-sm">{iss.schemeName}</div>
                        <div className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">{iss.description}</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setReviewingIssue(iss)}
                      className="px-4 py-2 border border-[#E2E8F0] dark:border-[#243449] hover:border-[#1769FF] rounded-lg font-bold text-xs text-[#07111F] dark:text-[#F8FAFC] transition-colors shrink-0 cursor-pointer"
                    >
                      Review & Resolve
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'duplicates' && (
          <motion.div 
            key="duplicates"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {duplicates.length === 0 ? (
              <div className="bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] rounded-xl p-12 text-center text-sm font-semibold text-[#64748B] dark:text-[#94A3B8]">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                No duplicate records detected in the active scheme catalog.
              </div>
            ) : (
              duplicates.map(dup => (
                <div key={dup.id} className="bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] rounded-xl shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-[#E2E8F0] dark:border-[#243449] bg-[#F5F7FA] dark:bg-[#101D31] flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <GitMerge className="w-5 h-5 text-[#1769FF] dark:text-[#60A5FA]" />
                      <h3 className="font-bold text-[#07111F] dark:text-[#F8FAFC] text-sm">Potential Duplicate Detected</h3>
                    </div>
                    <div className="px-3 py-1 bg-[#15803D]/10 text-[#15803D] dark:bg-[#4ADE80]/10 dark:text-[#4ADE80] font-bold text-xs rounded-full">
                      {dup.similarity}% Similarity
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#E2E8F0] dark:divide-[#243449]">
                    <div className="p-6">
                      <div className="text-xs font-bold text-[#1769FF] dark:text-[#60A5FA] mb-1 uppercase tracking-wider">Record A (Existing)</div>
                      <h4 className="text-lg font-bold text-[#07111F] dark:text-[#F8FAFC] mb-4">{dup.recordA.name}</h4>
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="text-[#64748B] dark:text-[#94A3B8]">Department:</span> 
                          <div className="font-semibold text-[#07111F] dark:text-[#F8FAFC]">{dup.recordA.department}</div>
                        </div>
                        <div>
                          <span className="text-[#64748B] dark:text-[#94A3B8]">Benefit:</span> 
                          <div className="font-semibold text-[#07111F] dark:text-[#F8FAFC]">{dup.recordA.benefit}</div>
                        </div>
                        <div>
                          <span className="text-[#64748B] dark:text-[#94A3B8]">Last Updated:</span> 
                          <div className="font-semibold text-[#07111F] dark:text-[#F8FAFC]">{dup.recordA.lastUpdated}</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-6 bg-[#F5F7FA]/50 dark:bg-[#101D31]/30">
                      <div className="text-xs font-bold text-[#D97706] dark:text-[#FBBF24] mb-1 uppercase tracking-wider">Record B (New Import)</div>
                      <h4 className="text-lg font-bold text-[#07111F] dark:text-[#F8FAFC] mb-4">{dup.recordB.name}</h4>
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="text-[#64748B] dark:text-[#94A3B8]">Department:</span> 
                          <div className="font-semibold text-[#07111F] dark:text-[#F8FAFC]">{dup.recordB.department}</div>
                        </div>
                        <div>
                          <span className="text-[#64748B] dark:text-[#94A3B8]">Benefit:</span> 
                          <div className="font-semibold text-[#07111F] dark:text-[#F8FAFC]">{dup.recordB.benefit}</div>
                        </div>
                        <div>
                          <span className="text-[#64748B] dark:text-[#94A3B8]">Last Updated:</span> 
                          <div className="font-semibold text-[#07111F] dark:text-[#F8FAFC]">{dup.recordB.lastUpdated}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 border-t border-[#E2E8F0] dark:border-[#243449] bg-[#F5F7FA] dark:bg-[#101D31] flex justify-end gap-3">
                    <button 
                      onClick={() => handleKeepBoth(dup.id)}
                      className="flex items-center gap-2 px-4 py-2 border border-[#E2E8F0] dark:border-[#243449] rounded-lg font-bold text-sm text-[#07111F] dark:text-[#F8FAFC] hover:bg-white dark:hover:bg-[#0B1424] transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" /> Keep Both
                    </button>
                    <button 
                      onClick={() => handleMergeDuplicate(dup.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#1769FF] hover:bg-[#123C69] text-white rounded-lg font-bold text-sm transition-colors cursor-pointer"
                    >
                      <Check className="w-4 h-4" /> Merge into Record A
                    </button>
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Review Modal */}
      <AnimatePresence>
        {reviewingIssue && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReviewingIssue(null)}
              className="absolute inset-0 bg-[#07111F]/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] rounded-2xl shadow-2xl p-6 z-10 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-[#07111F] dark:text-[#F8FAFC]">{reviewingIssue.schemeName}</h3>
                  <p className="text-xs text-red-600 dark:text-red-400 font-semibold">{reviewingIssue.description}</p>
                </div>
                <button onClick={() => setReviewingIssue(null)} className="p-1 text-[#64748B] hover:text-[#07111F] dark:hover:text-[#F8FAFC]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 bg-[#F8FAFC] dark:bg-[#101D31] rounded-xl border border-[#E2E8F0] dark:border-[#243449] text-xs space-y-1">
                <span className="font-bold text-[#07111F] dark:text-[#F8FAFC]">Recommended Resolution:</span>
                <p className="text-[#64748B] dark:text-[#94A3B8]">{reviewingIssue.recommendedAction}</p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewingIssue(null)}
                  className="px-4 py-2 border border-[#E2E8F0] dark:border-[#243449] rounded-lg font-bold text-xs text-[#07111F] dark:text-[#F8FAFC] hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Dismiss Warning
                </button>
                <button
                  type="button"
                  onClick={() => handleResolveIssue(reviewingIssue.id)}
                  className="px-4 py-2 bg-[#1769FF] hover:bg-[#123C69] text-white rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                >
                  <Check className="w-3.5 h-3.5" /> Auto-Resolve Issue
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
