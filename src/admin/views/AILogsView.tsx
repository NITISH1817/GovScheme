import React, { useState } from 'react';
import { Search, Filter, Cpu, MessageSquare, Target, Activity } from 'lucide-react';

export const AILogsView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Placeholder data
  const aiLogs = [
    { id: 'LOG-001', type: 'recommendation', user: 'Rohan Kumar', action: 'Matched: PM Kisan Samman Nidhi', timestamp: '2023-11-21 14:32:10', status: 'success', latency: '245ms' },
    { id: 'LOG-002', type: 'chatbot', user: 'Unknown (Session: a8f9)', action: 'Query: "How to apply for Awas Yojana?"', timestamp: '2023-11-21 14:28:45', status: 'success', latency: '890ms' },
    { id: 'LOG-003', type: 'ocr', user: 'System', action: 'Failed to extract text from DOC-045', timestamp: '2023-11-21 14:15:22', status: 'error', latency: '3500ms' },
    { id: 'LOG-004', type: 'recommendation', user: 'Priya Singh', action: 'Matched: Beti Bachao Beti Padhao', timestamp: '2023-11-21 13:55:01', status: 'success', latency: '210ms' },
    { id: 'LOG-005', type: 'chatbot', user: 'Aarav Patel', action: 'Query: "Eligibility for Mudra loan"', timestamp: '2023-11-21 13:40:19', status: 'success', latency: '750ms' },
  ];

  const filteredLogs = aiLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || log.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'recommendation': return <Target size={16} className="text-blue-500" />;
      case 'chatbot': return <MessageSquare size={16} className="text-emerald-500" />;
      case 'ocr': return <Activity size={16} className="text-amber-500" />;
      default: return <Cpu size={16} className="text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 w-full sm:w-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search logs by user or action..."
            className="w-full sm:max-w-md pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select 
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="recommendation">Recommendations</option>
            <option value="chatbot">Chatbot</option>
            <option value="ocr">OCR</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
            <Filter size={18} />
            <span>More Filters</span>
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
            <div>
              <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Total Requests (24h)</div>
              <div className="text-2xl font-bold text-slate-800">14,205</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
               <Activity size={20} />
            </div>
         </div>
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
            <div>
              <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Avg Latency</div>
              <div className="text-2xl font-bold text-slate-800">412ms</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
               <Cpu size={20} />
            </div>
         </div>
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
            <div>
              <div className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Error Rate</div>
              <div className="text-2xl font-bold text-amber-600">0.8%</div>
            </div>
             <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
               <Filter size={20} />
            </div>
         </div>
      </div>

      {/* Log Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Timestamp</th>
                <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">User/Session</th>
                <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Action/Query</th>
                <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">Latency</th>
              </tr>
            </thead>
            <tbody className="text-sm font-mono text-slate-600">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-slate-500">{log.timestamp}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(log.type)}
                      <span className="capitalize">{log.type}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-700">{log.user}</td>
                  <td className="p-4 truncate max-w-xs" title={log.action}>{log.action}</td>
                  <td className="p-4">
                     <span className={`px-2 py-0.5 rounded text-xs font-medium font-sans ${
                      log.status === 'success' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="p-4 text-right text-slate-500">{log.latency}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLogs.length === 0 && (
            <div className="p-8 text-center text-slate-500 font-sans">
              No logs found matching criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
