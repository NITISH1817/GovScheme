import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldAlert, Search, Filter, Calendar, Terminal, RefreshCw, 
  Download, ArrowDownUp, CheckCircle, AlertOctagon, UserCheck
} from 'lucide-react';
import { apiClient } from '../../api/apiClient';

interface AuditLogItem {
  _id: string;
  adminName?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('All');
  const [entityFilter, setEntityFilter] = useState('All');
  const [totalCount, setTotalCount] = useState(0);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/audit', {
        action: actionFilter !== 'All' ? actionFilter : undefined,
        entityType: entityFilter !== 'All' ? entityFilter : undefined,
        q: searchQuery,
        limit: 50
      });

      if (res && res.logs) {
        setLogs(res.logs);
        setTotalCount(res.total || res.logs.length);
      }
    } catch (e) {
      console.error('Failed to load audit logs', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, entityFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  const exportAuditCSV = () => {
    const headers = ['Timestamp', 'Officer / Actor', 'Action', 'Entity Type', 'Target ID', 'IP Address', 'Details'];
    const rows = logs.map(l => [
      `"${new Date(l.createdAt).toISOString()}"`,
      `"${l.adminName || 'Super Admin'}"`,
      `"${l.action}"`,
      `"${l.entityType || 'General'}"`,
      `"${l.entityId || 'N/A'}"`,
      `"${l.ipAddress || '127.0.0.1'}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `govscheme_audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionColor = (action: string) => {
    if (action.includes('DELETE') || action.includes('SUSPEND') || action.includes('REJECT')) {
      return 'bg-[#B91C1C]/10 text-[#B91C1C] dark:bg-[#F87171]/10 dark:text-[#F87171] border-[#B91C1C]/20';
    }
    if (action.includes('CREATE') || action.includes('VERIFY') || action.includes('APPROVE')) {
      return 'bg-[#15803D]/10 text-[#15803D] dark:bg-[#4ADE80]/10 dark:text-[#4ADE80] border-[#15803D]/20';
    }
    return 'bg-[#1769FF]/10 text-[#1769FF] dark:bg-[#60A5FA]/10 dark:text-[#60A5FA] border-[#1769FF]/20';
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#07111F] dark:text-[#F8FAFC] flex items-center gap-2">
            Audit & Security Event Trail
          </h1>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
            Immutable chronological record of administrative actions, authentication checkpoints, and data modifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchLogs} 
            className="flex items-center gap-2 px-3 py-2 bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] hover:border-[#1769FF] rounded-lg text-sm font-semibold text-[#07111F] dark:text-[#F8FAFC] transition-colors shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button 
            onClick={exportAuditCSV}
            className="flex items-center gap-2 px-4 py-2 bg-[#1769FF] hover:bg-[#123C69] text-white rounded-lg text-sm font-bold transition-colors shadow-md shadow-blue-500/20"
          >
            <Download className="w-4 h-4" /> Export CSV Log
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#94A3B8]" />
          <input 
            type="text" 
            placeholder="Search action, actor, target ID, or IP..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#F8FAFC] dark:bg-[#101D31] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-sm text-[#07111F] dark:text-[#F8FAFC] focus:border-[#1769FF] outline-none"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-[#64748B] dark:text-[#94A3B8]">
            <Filter className="w-4 h-4" /> Entity:
            <select 
              value={entityFilter} 
              onChange={(e) => setEntityFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-[#F8FAFC] dark:bg-[#101D31] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-xs font-semibold text-[#07111F] dark:text-[#F8FAFC] outline-none"
            >
              <option value="All">All Entities</option>
              <option value="schemes">Schemes</option>
              <option value="applications">Applications</option>
              <option value="documents">Documents</option>
              <option value="users">Citizens/Users</option>
              <option value="auth">Authentication</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] rounded-xl shadow-sm flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#F5F7FA] dark:bg-[#101D31] border-b border-[#E2E8F0] dark:border-[#243449] z-10">
              <tr>
                <th className="px-6 py-3.5 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3.5 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Officer / Actor</th>
                <th className="px-6 py-3.5 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Action Dispatched</th>
                <th className="px-6 py-3.5 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Target Entity</th>
                <th className="px-6 py-3.5 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Security Details</th>
                <th className="px-6 py-3.5 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#243449]">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-4">
                      <div className="h-6 bg-[#E2E8F0] dark:bg-[#243449] rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#64748B] dark:text-[#94A3B8]">
                    No audit records match the current criteria.
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log._id} className="hover:bg-[#F5F7FA] dark:hover:bg-[#101D31]/50 transition-colors">
                    <td className="px-6 py-4 text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit', second: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-sm text-[#07111F] dark:text-[#F8FAFC] flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-[#1769FF]" />
                        {log.adminName || 'Super Admin'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      <div className="font-bold text-[#07111F] dark:text-[#F8FAFC] uppercase">{log.entityType || 'General'}</div>
                      <div className="text-[#64748B] dark:text-[#94A3B8] font-mono">{log.entityId || 'SYS-EVENT'}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-[#07111F] dark:text-[#F8FAFC] max-w-xs truncate">
                      {log.details || 'Standard system action logged.'}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-xs text-[#64748B] dark:text-[#94A3B8]">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-[#E2E8F0] dark:border-[#243449] flex items-center justify-between text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] bg-[#FFFFFF] dark:bg-[#0B1424]">
          <span>Logged {logs.length} audit entries</span>
          <span>Compliance: National Cyber Security Standard v2.4</span>
        </div>
      </div>
    </div>
  );
};
