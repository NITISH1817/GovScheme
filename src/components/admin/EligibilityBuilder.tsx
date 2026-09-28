import React from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Settings, Play, X, Search, ChevronRight } from 'lucide-react';

export const EligibilityBuilder: React.FC = () => {
  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#07111F] dark:text-[#F8FAFC]">Eligibility Rule Builder</h1>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">Visually construct boolean logic for dynamic citizen matching.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#F5F7FA] dark:bg-[#101D31] border border-[#E2E8F0] dark:border-[#243449] hover:border-[#1769FF] text-[#07111F] dark:text-[#F8FAFC] rounded-lg font-bold text-sm transition-colors shadow-sm">
            <Play className="w-4 h-4" /> Test Logic
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#15803D] hover:bg-[#166534] text-white rounded-lg font-bold text-sm transition-colors shadow-lg shadow-green-500/20">
            Save Ruleset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
        
        {/* Variables Palette */}
        <div className="bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] rounded-xl shadow-sm p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-5 h-5 text-[#64748B] dark:text-[#94A3B8]" />
            <h3 className="font-bold text-[#07111F] dark:text-[#F8FAFC] text-sm">Citizen Variables</h3>
          </div>
          <div className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#94A3B8]" />
            <input 
              type="text" 
              placeholder="Filter..." 
              className="w-full pl-9 pr-4 py-2 bg-[#F5F7FA] dark:bg-[#101D31] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-sm text-[#07111F] dark:text-[#F8FAFC] focus:border-[#1769FF] outline-none"
            />
          </div>
          <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1">
            {['Age', 'Annual Income', 'Gender', 'State', 'Category', 'Disability Status', 'Marital Status', 'Occupation'].map(v => (
              <div key={v} className="flex items-center justify-between p-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#243449] hover:border-[#1769FF] dark:hover:border-[#60A5FA] cursor-grab bg-[#FFFFFF] dark:bg-[#0B1424] transition-colors">
                <span className="text-sm font-semibold text-[#07111F] dark:text-[#F8FAFC]">{v}</span>
                <ChevronRight className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8]" />
              </div>
            ))}
          </div>
        </div>

        {/* Builder Canvas */}
        <div className="lg:col-span-3 bg-[#F5F7FA] dark:bg-[#060D18] border border-[#E2E8F0] dark:border-[#243449] rounded-xl shadow-inner p-6 overflow-y-auto custom-scrollbar relative">
          
          <div className="max-w-2xl mx-auto relative">
            {/* Connection Lines via SVG background logic */}
            <div className="absolute left-6 top-8 bottom-8 w-1 bg-gradient-to-b from-[#1769FF] via-[#1769FF] to-transparent z-0 rounded-full"></div>

            {/* IF Block */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative z-10 mb-8 ml-6"
            >
              <div className="absolute -left-8 top-5 w-4 h-4 bg-[#1769FF] dark:bg-[#60A5FA] rounded-full border-4 border-[#F5F7FA] dark:border-[#060D18]"></div>
              
              <div className="bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#1769FF] dark:border-[#60A5FA] rounded-xl shadow-lg shadow-blue-500/10">
                <div className="bg-[#1769FF]/10 dark:bg-[#60A5FA]/10 px-5 py-3 border-b border-[#1769FF]/20 dark:border-[#60A5FA]/20 rounded-t-xl flex justify-between items-center">
                  <span className="font-bold text-[#1769FF] dark:text-[#60A5FA] tracking-wider uppercase text-sm">IF Condition</span>
                </div>
                <div className="p-5 space-y-4">
                  {/* Rule 1 */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="px-3 py-2 bg-[#F5F7FA] dark:bg-[#101D31] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-sm font-semibold text-[#07111F] dark:text-[#F8FAFC]">Age</div>
                    <select className="px-3 py-2 bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-sm font-semibold text-[#1769FF] dark:text-[#60A5FA] outline-none">
                      <option>&gt;= (Greater or Equal)</option>
                      <option>== (Equal)</option>
                      <option>&lt;= (Less or Equal)</option>
                    </select>
                    <input type="text" value="18" readOnly className="w-20 px-3 py-2 bg-[#F5F7FA] dark:bg-[#101D31] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-sm font-semibold text-[#07111F] dark:text-[#F8FAFC] outline-none text-center" />
                    <button className="ml-auto p-2 text-[#64748B] dark:text-[#94A3B8] hover:text-[#B91C1C] dark:hover:text-[#F87171] transition-colors"><X className="w-4 h-4" /></button>
                  </div>
                  
                  {/* Operator */}
                  <div className="flex items-center pl-10">
                    <div className="px-3 py-1 bg-[#123C69] text-white text-xs font-bold rounded-md">AND</div>
                  </div>

                  {/* Rule 2 */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="px-3 py-2 bg-[#F5F7FA] dark:bg-[#101D31] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-sm font-semibold text-[#07111F] dark:text-[#F8FAFC]">Annual Income</div>
                    <select className="px-3 py-2 bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-sm font-semibold text-[#1769FF] dark:text-[#60A5FA] outline-none">
                      <option>&lt;= (Less or Equal)</option>
                    </select>
                    <input type="text" value="₹3,00,000" readOnly className="w-32 px-3 py-2 bg-[#F5F7FA] dark:bg-[#101D31] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-sm font-semibold text-[#07111F] dark:text-[#F8FAFC] outline-none text-center" />
                    <button className="ml-auto p-2 text-[#64748B] dark:text-[#94A3B8] hover:text-[#B91C1C] dark:hover:text-[#F87171] transition-colors"><X className="w-4 h-4" /></button>
                  </div>

                  <button className="w-full py-3 border-2 border-dashed border-[#E2E8F0] dark:border-[#243449] rounded-lg text-sm font-bold text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F5F7FA] dark:hover:bg-[#101D31] hover:border-[#1769FF] dark:hover:border-[#60A5FA] hover:text-[#1769FF] dark:hover:text-[#60A5FA] transition-all">
                    + Add Condition
                  </button>
                </div>
              </div>
            </motion.div>

            {/* THEN Block */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="relative z-10 ml-6 mt-12"
            >
              <div className="absolute -left-8 top-5 w-4 h-4 bg-[#15803D] dark:bg-[#4ADE80] rounded-full border-4 border-[#F5F7FA] dark:border-[#060D18]"></div>
              
              <div className="bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#15803D] dark:border-[#4ADE80] rounded-xl shadow-lg shadow-green-500/10">
                <div className="bg-[#15803D]/10 dark:bg-[#4ADE80]/10 px-5 py-3 border-b border-[#15803D]/20 dark:border-[#4ADE80]/20 rounded-t-xl">
                  <span className="font-bold text-[#15803D] dark:text-[#4ADE80] tracking-wider uppercase text-sm">THEN Result</span>
                </div>
                <div className="p-5 flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#15803D] dark:bg-[#4ADE80] flex items-center justify-center">
                    <CheckSquare className="w-3 h-3 text-white dark:text-[#0B1424]" />
                  </div>
                  <span className="font-bold text-[#07111F] dark:text-[#F8FAFC]">Citizen is Eligible</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
