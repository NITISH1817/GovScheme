import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Search, Filter, CheckCircle2, Clock, XCircle, Eye, Download, 
  ChevronRight, Calendar, User, Building, AlertCircle, RefreshCw, X, Check
} from 'lucide-react';
import { apiClient } from '../../api/apiClient';

interface ApplicationItem {
  _id: string;
  applicationNumber?: string;
  userId?: {
    fullName?: string;
    email?: string;
    mobile?: string;
    state?: string;
    category?: string;
  };
  schemeId?: {
    name?: string;
    department?: string;
    category?: string;
  };
  status: string;
  remarks?: string;
  createdAt: string;
  updatedAt?: string;
  timeline?: {
    status: string;
    remarks?: string;
    timestamp: string;
  }[];
}

export const ApplicationManagementView: React.FC = () => {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newRemarks, setNewRemarks] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/applications', {
        status: statusFilter !== 'All' ? statusFilter : undefined,
        limit: 30
      });
      if (res && res.applications) {
        setApplications(res.applications);
      }
    } catch (e) {
      console.error('Failed to load applications', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !newStatus) return;

    if (!window.confirm(`Update status of application #${selectedApp._id.slice(-6)} to "${newStatus}"?`)) {
      return;
    }

    try {
      setUpdating(true);
      const res = await apiClient.put(`/applications/${selectedApp._id}/status`, {
        status: newStatus,
        remarks: newRemarks || `Status updated to ${newStatus} by Administrator.`
      });

      if (res && res.success) {
        setMessage({ text: `Application #${selectedApp._id.slice(-6)} updated to ${newStatus}.`, type: 'success' });
        setApplications(prev => prev.map(a => a._id === selectedApp._id ? {
          ...a,
          status: newStatus,
          remarks: newRemarks || a.remarks,
          timeline: [...(a.timeline || []), { status: newStatus, remarks: newRemarks, timestamp: new Date().toISOString() }]
        } : a));
        setSelectedApp(prev => prev ? {
          ...prev,
          status: newStatus,
          remarks: newRemarks || prev.remarks
        } : null);
        setNewRemarks('');
      } else {
        setMessage({ text: 'Status update failed.', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Status update failed', type: 'error' });
    } finally {
      setUpdating(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
      case 'Benefit Released':
        return 'bg-[#15803D]/10 text-[#15803D] dark:bg-[#4ADE80]/10 dark:text-[#4ADE80] border-[#15803D]/20';
      case 'Rejected':
        return 'bg-[#B91C1C]/10 text-[#B91C1C] dark:bg-[#F87171]/10 dark:text-[#F87171] border-[#B91C1C]/20';
      case 'Under Review':
        return 'bg-[#1769FF]/10 text-[#1769FF] dark:bg-[#60A5FA]/10 dark:text-[#60A5FA] border-[#1769FF]/20';
      default:
        return 'bg-[#D97706]/10 text-[#D97706] dark:bg-[#FBBF24]/10 dark:text-[#FBBF24] border-[#D97706]/20';
    }
  };

  const filteredApps = applications.filter(a => {
    const q = searchQuery.toLowerCase();
    const citizen = a.userId?.fullName?.toLowerCase() || '';
    const scheme = a.schemeId?.name?.toLowerCase() || '';
    const id = a._id.toLowerCase();
    const appNum = a.applicationNumber?.toLowerCase() || '';
    return citizen.includes(q) || scheme.includes(q) || id.includes(q) || appNum.includes(q);
  });

  const exportApplicationsCSV = () => {
    const headers = ['Application ID', 'Scheme Name', 'Citizen Beneficiary', 'Status', 'Registered Date', 'Remarks'];
    const rows = filteredApps.map(a => [
      `"${a.applicationNumber || a._id}"`,
      `"${(a.schemeId?.name || 'Welfare Scheme').replace(/"/g, '""')}"`,
      `"${(a.userId?.fullName || 'Citizen').replace(/"/g, '""')}"`,
      `"${a.status}"`,
      `"${a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ''}"`,
      `"${(a.remarks || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `govscheme_applications_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#07111F] dark:text-[#F8FAFC]">Application Management</h1>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
            Review, evaluate, and track internal workflow statuses for citizen benefit requests.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={exportApplicationsCSV}
            className="flex items-center gap-2 px-3 py-2 bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] hover:border-[#1769FF] rounded-lg text-sm font-semibold text-[#07111F] dark:text-[#F8FAFC] transition-colors shadow-sm"
            title="Export filtered applications to CSV"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button 
            onClick={fetchApplications}
            className="flex items-center gap-2 px-3 py-2 bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] hover:border-[#1769FF] rounded-lg text-sm font-semibold text-[#07111F] dark:text-[#F8FAFC] transition-colors shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Official Disclaimer Banner */}
      <div className="p-3.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
        <span>
          <strong>Operational Note:</strong> Applications tracked here represent internal GovScheme administrative requests. Official government approvals must be corroborated with official ministry portals.
        </span>
      </div>

      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -8 }} 
          animate={{ opacity: 1, y: 0 }}
          className={`p-3.5 rounded-lg border text-sm font-semibold flex items-center gap-2 ${
            message.type === 'success' 
              ? 'bg-[#15803D]/10 border-[#15803D]/20 text-[#15803D] dark:text-[#4ADE80]' 
              : 'bg-[#B91C1C]/10 border-[#B91C1C]/20 text-[#B91C1C] dark:text-[#F87171]'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {message.text}
        </motion.div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#94A3B8]" />
          <input 
            type="text" 
            placeholder="Search by citizen, scheme, or ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#F8FAFC] dark:bg-[#101D31] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-sm text-[#07111F] dark:text-[#F8FAFC] focus:border-[#1769FF] outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Status:</span>
          {['All', 'Submitted', 'Under Review', 'Approved', 'Rejected'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === st 
                  ? 'bg-[#1769FF] text-white shadow-md shadow-blue-500/20' 
                  : 'bg-[#F8FAFC] dark:bg-[#101D31] text-[#64748B] dark:text-[#94A3B8] hover:text-[#07111F] dark:hover:text-[#F8FAFC]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] rounded-xl shadow-sm flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#F5F7FA] dark:bg-[#101D31] border-b border-[#E2E8F0] dark:border-[#243449] z-10">
              <tr>
                <th className="px-6 py-3.5 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">App ID</th>
                <th className="px-6 py-3.5 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Scheme</th>
                <th className="px-6 py-3.5 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Citizen</th>
                <th className="px-6 py-3.5 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Date Submitted</th>
                <th className="px-6 py-3.5 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Current Status</th>
                <th className="px-6 py-3.5 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#243449]">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-4">
                      <div className="h-6 bg-[#E2E8F0] dark:bg-[#243449] rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#64748B] dark:text-[#94A3B8]">
                    No applications found for the selected status.
                  </td>
                </tr>
              ) : (
                filteredApps.map(app => (
                  <tr 
                    key={app._id}
                    onClick={() => { setSelectedApp(app); setNewStatus(app.status); }}
                    className="hover:bg-[#F5F7FA] dark:hover:bg-[#101D31]/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4 font-mono text-xs font-bold text-[#1769FF] dark:text-[#60A5FA]">
                      {app.applicationNumber || `#${app._id.slice(-6).toUpperCase()}`}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#07111F] dark:text-[#F8FAFC]">
                        {app.schemeId?.name || 'National Scheme'}
                      </div>
                      <div className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                        {app.schemeId?.department || 'Central Ministry'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-bold text-[#07111F] dark:text-[#F8FAFC]">
                        {app.userId?.fullName || 'Citizen User'}
                      </div>
                      <div className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                        {app.userId?.state || 'State Not Specified'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#64748B] dark:text-[#94A3B8]">
                      {new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadge(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => { setSelectedApp(app); setNewStatus(app.status); }}
                        className="px-3 py-1.5 bg-[#F8FAFC] dark:bg-[#101D31] border border-[#E2E8F0] dark:border-[#243449] hover:border-[#1769FF] rounded-lg text-xs font-bold text-[#07111F] dark:text-[#F8FAFC] transition-colors"
                      >
                        Inspect & Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Application Detail & Workflow Drawer */}
      <AnimatePresence>
        {selectedApp && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#07111F]/30 backdrop-blur-sm z-40"
              onClick={() => setSelectedApp(null)}
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-xl bg-[#FFFFFF] dark:bg-[#0B1424] border-l border-[#E2E8F0] dark:border-[#243449] z-50 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-[#E2E8F0] dark:border-[#243449] flex justify-between items-start">
                <div>
                  <div className="text-xs font-bold text-[#1769FF] dark:text-[#60A5FA] uppercase tracking-wider mb-1">
                    Application Details {selectedApp.applicationNumber ? `(${selectedApp.applicationNumber})` : `#${selectedApp._id.slice(-6).toUpperCase()}`}
                  </div>
                  <h2 className="text-xl font-bold text-[#07111F] dark:text-[#F8FAFC]">
                    {selectedApp.schemeId?.name || 'National Scheme'}
                  </h2>
                </div>
                <button onClick={() => setSelectedApp(null)} className="p-2 hover:bg-[#F5F7FA] dark:hover:bg-[#101D31] rounded-lg">
                  <X className="w-5 h-5 text-[#64748B]" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {/* Meta details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3.5 bg-[#F8FAFC] dark:bg-[#101D31] rounded-xl border border-[#E2E8F0] dark:border-[#243449]">
                    <div className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">Citizen Applicant</div>
                    <div className="font-bold text-[#07111F] dark:text-[#F8FAFC]">{selectedApp.userId?.fullName || 'Citizen'}</div>
                    <div className="text-xs text-[#64748B] dark:text-[#94A3B8]">{selectedApp.userId?.state || 'National'}</div>
                  </div>
                  <div className="p-3.5 bg-[#F8FAFC] dark:bg-[#101D31] rounded-xl border border-[#E2E8F0] dark:border-[#243449]">
                    <div className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">Current Status</div>
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadge(selectedApp.status)}`}>
                      {selectedApp.status}
                    </span>
                  </div>
                </div>

                {/* Existing remarks */}
                {selectedApp.remarks && (
                  <div className="p-4 bg-[#F8FAFC] dark:bg-[#101D31] border border-[#E2E8F0] dark:border-[#243449] rounded-xl">
                    <div className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1 uppercase tracking-wider">Internal Administrative Note</div>
                    <p className="text-sm text-[#07111F] dark:text-[#F8FAFC]">{selectedApp.remarks}</p>
                  </div>
                )}

                {/* Status Update Form */}
                <form onSubmit={handleUpdateStatus} className="p-5 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/40 rounded-xl space-y-4">
                  <h3 className="font-bold text-sm text-[#07111F] dark:text-[#F8FAFC]">Update Application Workflow Status</h3>
                  <div>
                    <label className="block text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">Target Status</label>
                    <select 
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-sm font-semibold text-[#07111F] dark:text-[#F8FAFC] outline-none"
                    >
                      <option value="Submitted">Submitted (Under Initial Intake)</option>
                      <option value="Under Review">Under Review (Document Queue)</option>
                      <option value="Approved">Approved (Eligibility Confirmed)</option>
                      <option value="Rejected">Rejected (Ineligible)</option>
                      <option value="Benefit Released">Benefit Released (Direct Transfer)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">Audit Remarks / Justification</label>
                    <textarea 
                      rows={3}
                      value={newRemarks}
                      onChange={(e) => setNewRemarks(e.target.value)}
                      placeholder="Add reviewer notes regarding document checks or official validation..."
                      className="w-full p-3 bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-sm text-[#07111F] dark:text-[#F8FAFC] outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={updating}
                    className="w-full py-2.5 bg-[#1769FF] hover:bg-[#123C69] disabled:opacity-50 text-white rounded-lg font-bold text-sm transition-colors shadow-md shadow-blue-500/20 flex justify-center items-center gap-2"
                  >
                    {updating ? 'Saving Status...' : 'Commit Status Update'}
                  </button>
                </form>

                {/* Audit Timeline */}
                <div>
                  <h3 className="font-bold text-sm text-[#07111F] dark:text-[#F8FAFC] mb-3">Workflow Timeline</h3>
                  <div className="space-y-3 relative pl-4 border-l-2 border-[#E2E8F0] dark:border-[#243449]">
                    {(selectedApp.timeline && selectedApp.timeline.length > 0 ? selectedApp.timeline : [
                      { status: 'Submitted', remarks: 'Application registered online.', timestamp: selectedApp.createdAt },
                      { status: selectedApp.status, remarks: selectedApp.remarks || 'Current workflow status', timestamp: selectedApp.updatedAt || selectedApp.createdAt }
                    ]).map((item, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#1769FF] dark:bg-[#60A5FA]"></div>
                        <div className="text-xs font-bold text-[#07111F] dark:text-[#F8FAFC]">{item.status}</div>
                        <div className="text-xs text-[#64748B] dark:text-[#94A3B8]">{item.remarks}</div>
                        <div className="text-[10px] text-[#94A3B8] mt-0.5">
                          {new Date(item.timestamp).toLocaleString('en-IN')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-[#E2E8F0] dark:border-[#243449] flex justify-end bg-[#F5F7FA] dark:bg-[#101D31]">
                <button 
                  onClick={() => setSelectedApp(null)} 
                  className="px-4 py-2 border border-[#E2E8F0] dark:border-[#243449] rounded-lg font-bold text-sm text-[#07111F] dark:text-[#F8FAFC]"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
