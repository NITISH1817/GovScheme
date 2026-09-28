import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Download, Plus, MoreHorizontal, Eye, Edit, Trash2, X, FileText, BarChart3, Database, CheckSquare } from 'lucide-react';
import { Scheme } from '../../types';

interface SchemeOperationsViewProps {
  schemes: Scheme[];
}

export const SchemeOperationsView: React.FC<SchemeOperationsViewProps> = ({ schemes }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const filteredSchemes = schemes.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 15);

  const toggleRow = (id: string) => {
    const newSet = new Set(selectedRows);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedRows(newSet);
  };

  const toggleAll = () => {
    if (selectedRows.size === filteredSchemes.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredSchemes.map(s => s.id)));
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#07111F] dark:text-[#F8FAFC]">Scheme Operations</h1>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">Manage, verify, and monitor all active schemes.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#94A3B8]" />
            <input 
              type="text" 
              placeholder="Search schemes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-sm text-[#07111F] dark:text-[#F8FAFC] focus:border-[#1769FF] dark:focus:border-[#60A5FA] outline-none"
            />
          </div>
          <button className="p-2 bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-[#07111F] dark:text-[#F8FAFC] hover:border-[#1769FF] dark:hover:border-[#60A5FA] transition-colors">
            <Filter className="w-4 h-4" />
          </button>
          <button className="p-2 bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-[#07111F] dark:text-[#F8FAFC] hover:border-[#1769FF] dark:hover:border-[#60A5FA] transition-colors">
            <Download className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1769FF] hover:bg-[#123C69] text-white rounded-lg font-bold text-sm transition-colors shadow-lg shadow-blue-500/20">
            <Plus className="w-4 h-4" /> Add Scheme
          </button>
        </div>
      </div>

      <div className="bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] rounded-xl shadow-sm flex-1 overflow-hidden flex flex-col relative">
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#F5F7FA] dark:bg-[#101D31] border-b border-[#E2E8F0] dark:border-[#243449] z-10">
              <tr>
                <th className="px-6 py-4 w-12">
                  <input 
                    type="checkbox" 
                    checked={selectedRows.size > 0 && selectedRows.size === filteredSchemes.length}
                    onChange={toggleAll}
                    className="rounded border-[#E2E8F0] dark:border-[#243449] text-[#1769FF]"
                  />
                </th>
                <th className="px-6 py-4 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Scheme</th>
                <th className="px-6 py-4 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Data Health</th>
                <th className="px-6 py-4 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#243449]">
              <AnimatePresence>
                {filteredSchemes.map((scheme, i) => (
                  <motion.tr 
                    key={scheme.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => setSelectedScheme(scheme)}
                    className="hover:bg-[#F5F7FA] dark:hover:bg-[#101D31]/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        checked={selectedRows.has(scheme.id)}
                        onChange={() => toggleRow(scheme.id)}
                        className="rounded border-[#E2E8F0] dark:border-[#243449] text-[#1769FF]"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#07111F] dark:text-[#F8FAFC]">{scheme.name}</div>
                      <div className="text-xs text-[#64748B] dark:text-[#94A3B8]">{scheme.category}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#07111F] dark:text-[#F8FAFC]">
                      {scheme.department}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${
                        scheme.popularityScore > 0 
                          ? 'bg-[#15803D]/10 text-[#15803D] dark:bg-[#4ADE80]/10 dark:text-[#4ADE80]' 
                          : 'bg-[#D97706]/10 text-[#D97706] dark:bg-[#FBBF24]/10 dark:text-[#FBBF24]'
                      }`}>
                        {scheme.popularityScore > 0 ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-full h-1.5 bg-[#E2E8F0] dark:bg-[#243449] rounded-full overflow-hidden max-w-[80px]">
                          <div className="h-full bg-[#15803D] dark:bg-[#4ADE80]" style={{ width: '94%' }}></div>
                        </div>
                        <span className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">94%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-[#64748B] dark:text-[#94A3B8] hover:text-[#1769FF] dark:hover:text-[#60A5FA]"><Edit className="w-4 h-4" /></button>
                        <button className="p-2 text-[#64748B] dark:text-[#94A3B8] hover:text-[#B91C1C] dark:hover:text-[#F87171]"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-[#E2E8F0] dark:border-[#243449] flex items-center justify-between text-sm bg-[#FFFFFF] dark:bg-[#0B1424]">
          <span className="text-[#64748B] dark:text-[#94A3B8]">Showing {filteredSchemes.length} of {schemes.length} records</span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 border border-[#E2E8F0] dark:border-[#243449] rounded font-semibold text-[#07111F] dark:text-[#F8FAFC] disabled:opacity-50">Prev</button>
            <button className="px-3 py-1.5 border border-[#E2E8F0] dark:border-[#243449] rounded font-semibold text-[#07111F] dark:text-[#F8FAFC]">Next</button>
          </div>
        </div>
      </div>

      {/* Side Drawer for Details */}
      <AnimatePresence>
        {selectedScheme && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#07111F]/20 backdrop-blur-sm z-20"
              onClick={() => setSelectedScheme(null)}
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute top-0 right-0 bottom-0 w-full max-w-xl bg-[#FFFFFF] dark:bg-[#0B1424] border-l border-[#E2E8F0] dark:border-[#243449] z-30 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-[#E2E8F0] dark:border-[#243449] flex justify-between items-start">
                <div>
                  <div className="text-xs font-bold text-[#1769FF] dark:text-[#60A5FA] mb-1">{selectedScheme.department}</div>
                  <h2 className="text-xl font-bold text-[#07111F] dark:text-[#F8FAFC] pr-8">{selectedScheme.name}</h2>
                </div>
                <button onClick={() => setSelectedScheme(null)} className="p-2 hover:bg-[#F5F7FA] dark:hover:bg-[#101D31] rounded-lg">
                  <X className="w-5 h-5 text-[#64748B]" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-[#F5F7FA] dark:bg-[#101D31] rounded-xl border border-[#E2E8F0] dark:border-[#243449]">
                    <div className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1 uppercase tracking-wider">Status</div>
                    <div className="font-bold text-[#15803D] dark:text-[#4ADE80]">Active & Published</div>
                  </div>
                  <div className="p-4 bg-[#F5F7FA] dark:bg-[#101D31] rounded-xl border border-[#E2E8F0] dark:border-[#243449]">
                    <div className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1 uppercase tracking-wider">Data Health</div>
                    <div className="font-bold text-[#07111F] dark:text-[#F8FAFC]">94% Complete</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-[#E2E8F0] dark:border-[#243449] pb-2">
                    <FileText className="w-4 h-4 text-[#1769FF]" />
                    <h3 className="font-bold text-[#07111F] dark:text-[#F8FAFC]">Overview</h3>
                  </div>
                  <p className="text-sm text-[#07111F] dark:text-[#F8FAFC] leading-relaxed">
                    {selectedScheme.shortDescription}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-[#E2E8F0] dark:border-[#243449] pb-2">
                    <CheckSquare className="w-4 h-4 text-[#1769FF]" />
                    <h3 className="font-bold text-[#07111F] dark:text-[#F8FAFC]">Eligibility Rules</h3>
                  </div>
                  <ul className="space-y-2">
                    {Object.entries(selectedScheme.eligibilityRules).map(([key, val]) => {
                      if(val === undefined || (Array.isArray(val) && val.length === 0)) return null;
                      return (
                        <li key={key} className="flex justify-between text-sm py-1 border-b border-[#E2E8F0] dark:border-[#243449] last:border-0">
                          <span className="text-[#64748B] dark:text-[#94A3B8] capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span className="font-semibold text-[#07111F] dark:text-[#F8FAFC] max-w-[200px] text-right truncate">
                            {Array.isArray(val) ? val.join(', ') : String(val)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

              </div>

              <div className="p-4 border-t border-[#E2E8F0] dark:border-[#243449] flex justify-end gap-3 bg-[#F5F7FA] dark:bg-[#101D31]">
                <button className="px-4 py-2 border border-[#E2E8F0] dark:border-[#243449] rounded-lg font-bold text-sm text-[#07111F] dark:text-[#F8FAFC]">Archive</button>
                <button className="px-4 py-2 bg-[#1769FF] text-white rounded-lg font-bold text-sm">Edit Scheme</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
