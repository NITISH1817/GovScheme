import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, AlertTriangle, Link2Off, Activity, ShieldAlert, GitMerge, Check, X, CheckCircle2 } from 'lucide-react';

export const DataHealthCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'issues' | 'duplicates'>('issues');

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#07111F] dark:text-[#F8FAFC]">Data Intelligence Center</h1>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">Monitor schema integrity, detect anomalies, and resolve duplicates.</p>
        </div>
        <button className="px-4 py-2 bg-[#1769FF] hover:bg-[#123C69] text-white rounded-lg font-bold text-sm transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2">
          <Activity className="w-4 h-4" /> Run Full Scan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Visual Data Health */}
        <div className="bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] rounded-xl p-6 flex items-center justify-between shadow-sm">
          <div>
            <h3 className="font-bold text-[#07111F] dark:text-[#F8FAFC] mb-1">Overall Health</h3>
            <div className="text-4xl font-bold text-[#15803D] dark:text-[#4ADE80]">94%</div>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">+2% since last scan</p>
          </div>
          {/* Simple segmented circle mockup via SVG */}
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
                strokeDasharray="94, 100"
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
          <div className="text-3xl font-bold text-[#07111F] dark:text-[#F8FAFC]">420</div>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">Incomplete or outdated records</p>
        </div>

        <div className="bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] rounded-xl p-6 flex flex-col justify-center shadow-sm">
          <div className="flex items-center gap-2 text-[#B91C1C] dark:text-[#F87171] mb-2">
            <ShieldAlert className="w-5 h-5" />
            <span className="font-bold text-sm tracking-wider uppercase">Critical</span>
          </div>
          <div className="text-3xl font-bold text-[#07111F] dark:text-[#F8FAFC]">12</div>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">Broken URLs or missing mandatory fields</p>
        </div>
      </div>

      <div className="flex border-b border-[#E2E8F0] dark:border-[#243449]">
        <button
          onClick={() => setActiveTab('issues')}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'issues' ? 'border-[#1769FF] text-[#1769FF] dark:border-[#60A5FA] dark:text-[#60A5FA]' : 'border-transparent text-[#64748B] dark:text-[#94A3B8] hover:text-[#07111F] dark:hover:text-[#F8FAFC]'}`}
        >
          Active Issues
        </button>
        <button
          onClick={() => setActiveTab('duplicates')}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'duplicates' ? 'border-[#1769FF] text-[#1769FF] dark:border-[#60A5FA] dark:text-[#60A5FA]' : 'border-transparent text-[#64748B] dark:text-[#94A3B8] hover:text-[#07111F] dark:hover:text-[#F8FAFC]'}`}
        >
          Duplicate Resolution
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
            <div className="p-4 border-b border-[#E2E8F0] dark:border-[#243449] bg-[#F5F7FA] dark:bg-[#101D31]">
              <h3 className="font-bold text-[#07111F] dark:text-[#F8FAFC] text-sm">Needs Attention</h3>
            </div>
            <div className="divide-y divide-[#E2E8F0] dark:divide-[#243449]">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-[#F5F7FA] dark:hover:bg-[#101D31]/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-[#B91C1C]/10 text-[#B91C1C] dark:bg-[#F87171]/10 dark:text-[#F87171] rounded-lg">
                      <Link2Off className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-[#07111F] dark:text-[#F8FAFC]">National Scholarship Portal</div>
                      <div className="text-sm text-[#64748B] dark:text-[#94A3B8]">404 Error on officialApplyUrl</div>
                    </div>
                  </div>
                  <button className="px-4 py-2 border border-[#E2E8F0] dark:border-[#243449] rounded-lg font-bold text-sm text-[#07111F] dark:text-[#F8FAFC] hover:border-[#1769FF] transition-colors">Review</button>
                </div>
              ))}
            </div>
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
            {/* Duplicate Card */}
            <div className="bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-[#E2E8F0] dark:border-[#243449] bg-[#F5F7FA] dark:bg-[#101D31] flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <GitMerge className="w-5 h-5 text-[#1769FF] dark:text-[#60A5FA]" />
                  <h3 className="font-bold text-[#07111F] dark:text-[#F8FAFC] text-sm">Potential Duplicate Detected</h3>
                </div>
                <div className="px-3 py-1 bg-[#15803D]/10 text-[#15803D] dark:bg-[#4ADE80]/10 dark:text-[#4ADE80] font-bold text-xs rounded-full">92% Similarity</div>
              </div>
              
              <div className="grid grid-cols-2 divide-x divide-[#E2E8F0] dark:divide-[#243449]">
                <div className="p-6">
                  <div className="text-xs font-bold text-[#1769FF] dark:text-[#60A5FA] mb-1 uppercase tracking-wider">Record A (Existing)</div>
                  <h4 className="text-lg font-bold text-[#07111F] dark:text-[#F8FAFC] mb-4">PMAY-G (Rural Housing)</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-[#64748B] dark:text-[#94A3B8]">Department:</span> 
                      <div className="font-semibold text-[#07111F] dark:text-[#F8FAFC]">Ministry of Rural Development</div>
                    </div>
                    <div>
                      <span className="text-[#64748B] dark:text-[#94A3B8]">Benefit:</span> 
                      <div className="font-semibold text-[#07111F] dark:text-[#F8FAFC]">₹1,20,000 for house construction</div>
                    </div>
                    <div>
                      <span className="text-[#64748B] dark:text-[#94A3B8]">Last Updated:</span> 
                      <div className="font-semibold text-[#07111F] dark:text-[#F8FAFC]">12 Oct 2024</div>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-[#F5F7FA]/50 dark:bg-[#101D31]/30">
                  <div className="text-xs font-bold text-[#D97706] dark:text-[#FBBF24] mb-1 uppercase tracking-wider">Record B (New Import)</div>
                  <h4 className="text-lg font-bold text-[#07111F] dark:text-[#F8FAFC] mb-4">Pradhan Mantri Awas Yojana Gramin</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-[#64748B] dark:text-[#94A3B8]">Department:</span> 
                      <div className="font-semibold text-[#07111F] dark:text-[#F8FAFC]">Rural Dev</div>
                    </div>
                    <div>
                      <span className="text-[#64748B] dark:text-[#94A3B8]">Benefit:</span> 
                      <div className="font-semibold text-[#07111F] dark:text-[#F8FAFC]">₹1.2 Lakh</div>
                    </div>
                    <div>
                      <span className="text-[#64748B] dark:text-[#94A3B8]">Last Updated:</span> 
                      <div className="font-semibold text-[#07111F] dark:text-[#F8FAFC]">Just now</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-[#E2E8F0] dark:border-[#243449] bg-[#F5F7FA] dark:bg-[#101D31] flex justify-end gap-3">
                <button className="flex items-center gap-2 px-4 py-2 border border-[#E2E8F0] dark:border-[#243449] rounded-lg font-bold text-sm text-[#07111F] dark:text-[#F8FAFC] hover:bg-white dark:hover:bg-[#0B1424] transition-colors">
                  <X className="w-4 h-4" /> Keep Both
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#1769FF] hover:bg-[#123C69] text-white rounded-lg font-bold text-sm transition-colors">
                  <Check className="w-4 h-4" /> Merge into Record A
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
