import React, { useState, useEffect } from 'react';
import { Search, Filter, Shield, User, FileText, Settings, Download } from 'lucide-react';
import { apiClient } from '../../api/apiClient';

export const AuditLogsView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await apiClient.get('/audit');
        if (res.success) {
          setAuditLogs(res.logs || []);
        }
      } catch (error) {
        console.error('Failed to fetch audit logs', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = auditLogs.filter(log => 
    (log.adminName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (log.action || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getResourceIcon = (resource: string) => {
    const str = String(resource).toLowerCase();
    if (str.includes('system') || str.includes('setting')) return <Settings size={16} className="text-slate-500" />;
    if (str.includes('application')) return <FileText size={16} className="text-blue-500" />;
    if (str.includes('user') || str.includes('citizen')) return <User size={16} className="text-emerald-500" />;
    return <Shield size={16} className="text-slate-500" />;
  };

  const handleExportCSV = () => {
    const headers = ['Log ID', 'Date', 'Admin', 'Action', 'Resource', 'IP Address'];
    const rows = filteredLogs.map(log => [
      log._id,
      new Date(log.createdAt).toLocaleString(),
      log.adminName,
      log.action,
      log.entityType,
      log.ipAddress
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 w-full sm:w-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search audit logs by admin or action..."
            className="w-full sm:max-w-md pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
            <Filter size={18} />
            <span>Filter Logs</span>
          </button>
           <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors">
            <Download size={18} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Shield size={18} className="text-blue-600" /> Security & Activity Logs
            </h3>
            <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2.5 py-1 rounded-full">
              Latest 100 Logs
            </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Log ID</th>
                <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Timestamp</th>
                <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Admin User</th>
                <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider">Resource Affected</th>
                <th className="p-4 text-xs font-medium text-slate-500 uppercase tracking-wider text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">Loading audit logs...</td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">No audit logs found matching "{searchTerm}"</td>
                </tr>
              ) : filteredLogs.map((log) => (
                <tr key={log._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-mono text-xs text-slate-500" title={log._id}>...{String(log._id).slice(-6)}</td>
                  <td className="p-4 text-slate-600">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="p-4 font-medium text-slate-800 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                      <User size={12} />
                    </div>
                    {log.adminName}
                  </td>
                  <td className="p-4 text-slate-700">{log.action}</td>
                  <td className="p-4 text-slate-600">
                    <div className="flex items-center gap-2">
                      {getResourceIcon(log.entityType)}
                      <span className="capitalize">{log.entityType}</span>
                    </div>
                    {log.entityId !== 'N/A' && (
                      <div className="text-[10px] text-slate-400 font-mono mt-1">ID: {log.entityId}</div>
                    )}
                  </td>
                  <td className="p-4 text-right font-mono text-xs text-slate-500">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
