import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, Filter, ShieldCheck, ShieldAlert, Eye, X, Download, 
  MapPin, Briefcase, IndianRupee, FileText, CheckCircle, AlertCircle, RefreshCw
} from 'lucide-react';
import { apiClient } from '../../api/apiClient';

interface CitizenUser {
  _id: string;
  fullName: string;
  email: string;
  mobile?: string;
  role: string;
  isActive: boolean;
  profile?: {
    age?: number;
    gender?: string;
    annualIncome?: number;
    category?: string;
    state?: string;
    district?: string;
    occupation?: string;
  };
  createdAt: string;
}

export const CitizenManagementView: React.FC = () => {
  const [users, setUsers] = useState<CitizenUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [selectedCitizen, setSelectedCitizen] = useState<CitizenUser | null>(null);
  const [citizenDetails, setCitizenDetails] = useState<{ applications: any[]; documents: any[] } | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      let res: any = null;
      try {
        res = await apiClient.get('/admin/citizens', {
          role: 'Citizen',
          q: searchQuery,
          state: stateFilter !== 'All' ? stateFilter : undefined,
          isActive: statusFilter !== 'All' ? (statusFilter === 'Active') : undefined,
          page,
          limit: 10
        });
      } catch (adminErr: any) {
        // Fallback to /users endpoint if /admin/citizens is unavailable
        res = await apiClient.get('/users', {
          role: 'Citizen',
          q: searchQuery,
          state: stateFilter !== 'All' ? stateFilter : undefined,
          isActive: statusFilter !== 'All' ? (statusFilter === 'Active') : undefined,
          page,
          limit: 10
        });
      }

      if (res) {
        const citizenList = res.citizens || res.users || [];
        setUsers(citizenList);
        setTotalPages(res.pages || 1);
        setTotalCount(res.total !== undefined ? res.total : citizenList.length);
      }
    } catch (e: any) {
      console.error('Error fetching citizens', e);
      setError(e?.message || 'Failed to fetch registered citizens from database.');
      setUsers([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, stateFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const openCitizenDetails = async (citizen: CitizenUser) => {
    setSelectedCitizen(citizen);
    setLoadingDetails(true);
    try {
      let res: any = null;
      try {
        res = await apiClient.get(`/admin/citizens/${citizen._id}`);
      } catch {
        res = await apiClient.get(`/users/${citizen._id}/details`);
      }

      if (res && res.success) {
        setCitizenDetails({
          applications: res.applications || [],
          documents: res.documents || []
        });
      } else {
        setCitizenDetails({ applications: [], documents: [] });
      }
    } catch (e) {
      console.error('Failed to load details', e);
      setCitizenDetails({ applications: [], documents: [] });
    } finally {
      setLoadingDetails(false);
    }
  };

  const toggleUserStatus = async (citizen: CitizenUser) => {
    const newStatus = !citizen.isActive;
    const confirmMsg = newStatus 
      ? `Re-activate citizen account for ${citizen.fullName}?` 
      : `Suspend citizen access for ${citizen.fullName}?`;
    
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await apiClient.put(`/users/${citizen._id}/status`, { isActive: newStatus });
      if (res && res.success) {
        setUsers(prev => prev.map(u => u._id === citizen._id ? { ...u, isActive: newStatus } : u));
        if (selectedCitizen && selectedCitizen._id === citizen._id) {
          setSelectedCitizen(prev => prev ? { ...prev, isActive: newStatus } : null);
        }
        setActionSuccess(`Account ${newStatus ? 'Activated' : 'Suspended'} successfully`);
        setTimeout(() => setActionSuccess(null), 3500);
      }
    } catch (e: any) {
      alert(`Status update failed: ${e.message}`);
    }
  };

  // Safe masking for sensitive data compliance
  const maskEmail = (email: string) => {
    if (!email) return 'N/A';
    const parts = email.split('@');
    if (parts.length < 2) return '***@***';
    return `${parts[0].slice(0, 3)}***@${parts[1]}`;
  };

  const maskPhone = (phone?: string) => {
    if (!phone) return '••••••••••';
    return `••••••${phone.slice(-4)}`;
  };

      const exportCitizensCSV = () => {
    const headers = ['Citizen ID', 'Name', 'Email (Masked)', 'Mobile (Masked)', 'State', 'District', 'Role', 'Status', 'Registered Date'];
    const rows = users.map((c: CitizenUser) => [
      `"${c._id}"`,
      `"${(c.fullName || '').replace(/"/g, '""')}"`,
      `"${maskEmail(c.email)}"`,
      `"${maskPhone(c.mobile)}"`,
      `"${c.profile?.state || 'Tamil Nadu'}"`,
      `"${c.profile?.district || 'Chennai'}"`,
      `"${c.role || 'Citizen'}"`,
      `"${c.isActive !== false ? 'Active' : 'Suspended'}"`,
      `"${c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((row: string[]) => row.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `govscheme_citizens_directory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statesList = ['All', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh', 'Gujarat', 'Central'];

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#07111F] dark:text-[#F8FAFC]">Citizens & Beneficiaries</h1>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
            Directory of registered beneficiaries with masked privacy protection and verification history.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={exportCitizensCSV} 
            className="flex items-center gap-2 px-3 py-2 bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] hover:border-[#1769FF] rounded-lg text-sm font-semibold text-[#07111F] dark:text-[#F8FAFC] transition-colors shadow-sm"
            title="Export citizen beneficiary directory to CSV"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button 
            onClick={fetchUsers} 
            className="flex items-center gap-2 px-3 py-2 bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] hover:border-[#1769FF] rounded-lg text-sm font-semibold text-[#07111F] dark:text-[#F8FAFC] transition-colors shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -8 }} 
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 font-medium text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button 
            type="button" 
            onClick={fetchUsers} 
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors shrink-0 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry Request
          </button>
        </motion.div>
      )}

      {actionSuccess && (
        <motion.div 
          initial={{ opacity: 0, y: -8 }} 
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-[#15803D]/10 border border-[#15803D]/20 rounded-lg text-[#15803D] dark:text-[#4ADE80] font-semibold text-sm flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4" /> {actionSuccess}
        </motion.div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#94A3B8]" />
          <input 
            type="text" 
            placeholder="Search by citizen name or identifier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#F8FAFC] dark:bg-[#101D31] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-sm text-[#07111F] dark:text-[#F8FAFC] focus:border-[#1769FF] outline-none"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-[#64748B] dark:text-[#94A3B8]">
            <Filter className="w-4 h-4" /> State:
            <select 
              value={stateFilter} 
              onChange={(e) => { setStateFilter(e.target.value); setPage(1); }}
              className="px-2.5 py-1.5 bg-[#F8FAFC] dark:bg-[#101D31] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-sm font-semibold text-[#07111F] dark:text-[#F8FAFC] outline-none"
            >
              {statesList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 text-sm text-[#64748B] dark:text-[#94A3B8]">
            Status:
            <select 
              value={statusFilter} 
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-2.5 py-1.5 bg-[#F8FAFC] dark:bg-[#101D31] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-sm font-semibold text-[#07111F] dark:text-[#F8FAFC] outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] rounded-xl shadow-sm flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#F5F7FA] dark:bg-[#101D31] border-b border-[#E2E8F0] dark:border-[#243449] z-10">
              <tr>
                <th className="px-6 py-3.5 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Citizen</th>
                <th className="px-6 py-3.5 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Location</th>
                <th className="px-6 py-3.5 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Demographics</th>
                <th className="px-6 py-3.5 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Registered</th>
                <th className="px-6 py-3.5 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#243449]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-4">
                      <div className="h-6 bg-[#E2E8F0] dark:bg-[#243449] rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#64748B] dark:text-[#94A3B8]">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Users className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                      <span className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                        {totalCount === 0 && !searchQuery && stateFilter === 'All' && statusFilter === 'All'
                          ? 'No registered citizens in database yet.'
                          : 'No citizens match the selected filter criteria.'}
                      </span>
                      <p className="text-xs text-gray-500">
                        Total database citizen count: {totalCount}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map(citizen => (
                  <tr 
                    key={citizen._id}
                    onClick={() => openCitizenDetails(citizen)}
                    className="hover:bg-[#F5F7FA] dark:hover:bg-[#101D31]/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#1769FF]/10 text-[#1769FF] dark:text-[#60A5FA] flex items-center justify-center font-bold text-sm shrink-0">
                          {citizen.fullName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-[#07111F] dark:text-[#F8FAFC]">{citizen.fullName}</div>
                          <div className="text-xs text-[#64748B] dark:text-[#94A3B8]">{maskEmail(citizen.email)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#07111F] dark:text-[#F8FAFC]">
                      <div className="flex items-center gap-1.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[#64748B] dark:text-[#94A3B8]" />
                        {citizen.profile?.state || 'Not specified'}
                      </div>
                      <div className="text-xs text-[#64748B] dark:text-[#94A3B8]">{citizen.profile?.district || 'General district'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-semibold text-[#07111F] dark:text-[#F8FAFC]">
                        {citizen.profile?.occupation || 'General Public'}
                      </div>
                      <div className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                        Category: {citizen.profile?.category || 'General'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        citizen.isActive 
                          ? 'bg-[#15803D]/10 text-[#15803D] dark:bg-[#4ADE80]/10 dark:text-[#4ADE80]' 
                          : 'bg-[#B91C1C]/10 text-[#B91C1C] dark:bg-[#F87171]/10 dark:text-[#F87171]'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${citizen.isActive ? 'bg-[#15803D] dark:bg-[#4ADE80]' : 'bg-[#B91C1C] dark:bg-[#F87171]'}`}></span>
                        {citizen.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#64748B] dark:text-[#94A3B8]">
                      {new Date(citizen.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openCitizenDetails(citizen)}
                          title="View Profile" 
                          className="p-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#243449] hover:border-[#1769FF] text-[#64748B] dark:text-[#94A3B8] hover:text-[#1769FF] transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => toggleUserStatus(citizen)}
                          title={citizen.isActive ? "Suspend Account" : "Activate Account"}
                          className={`p-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#243449] transition-colors ${
                            citizen.isActive 
                              ? 'hover:border-[#B91C1C] text-[#64748B] hover:text-[#B91C1C]' 
                              : 'hover:border-[#15803D] text-[#64748B] hover:text-[#15803D]'
                          }`}
                        >
                          {citizen.isActive ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-[#E2E8F0] dark:border-[#243449] flex items-center justify-between text-sm bg-[#FFFFFF] dark:bg-[#0B1424]">
          <span className="text-[#64748B] dark:text-[#94A3B8]">
            Showing {users.length} of {totalCount} registered citizens
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 border border-[#E2E8F0] dark:border-[#243449] rounded-lg font-semibold text-[#07111F] dark:text-[#F8FAFC] disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-xs font-bold px-2 text-[#64748B] dark:text-[#94A3B8]">Page {page} of {totalPages}</span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 border border-[#E2E8F0] dark:border-[#243449] rounded-lg font-semibold text-[#07111F] dark:text-[#F8FAFC] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Citizen Details Side Drawer */}
      <AnimatePresence>
        {selectedCitizen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#07111F]/30 backdrop-blur-sm z-40"
              onClick={() => setSelectedCitizen(null)}
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-xl bg-[#FFFFFF] dark:bg-[#0B1424] border-l border-[#E2E8F0] dark:border-[#243449] z-50 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-[#E2E8F0] dark:border-[#243449] flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#1769FF]/10 text-[#1769FF] dark:text-[#60A5FA] flex items-center justify-center font-bold text-lg">
                    {selectedCitizen.fullName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#07111F] dark:text-[#F8FAFC]">{selectedCitizen.fullName}</h2>
                    <div className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                      ID: {selectedCitizen._id} • {selectedCitizen.role}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedCitizen(null)} 
                  className="p-2 hover:bg-[#F5F7FA] dark:hover:bg-[#101D31] rounded-lg"
                >
                  <X className="w-5 h-5 text-[#64748B]" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {/* Privacy Badge Alert */}
                <div className="p-3.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-xl text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
                  <span>
                    <strong>GovScheme Privacy Shield:</strong> Aadhaar numbers and private KYC tokens are encrypted and masked according to national privacy guidelines.
                  </span>
                </div>

                {/* Profile Key Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-[#F8FAFC] dark:bg-[#101D31] rounded-xl border border-[#E2E8F0] dark:border-[#243449]">
                    <div className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">State</div>
                    <div className="font-bold text-[#07111F] dark:text-[#F8FAFC]">{selectedCitizen.profile?.state || 'Central'}</div>
                  </div>
                  <div className="p-3.5 bg-[#F8FAFC] dark:bg-[#101D31] rounded-xl border border-[#E2E8F0] dark:border-[#243449]">
                    <div className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">Category</div>
                    <div className="font-bold text-[#07111F] dark:text-[#F8FAFC]">{selectedCitizen.profile?.category || 'General'}</div>
                  </div>
                  <div className="p-3.5 bg-[#F8FAFC] dark:bg-[#101D31] rounded-xl border border-[#E2E8F0] dark:border-[#243449]">
                    <div className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">Status</div>
                    <div className={`font-bold ${selectedCitizen.isActive ? 'text-[#15803D]' : 'text-[#B91C1C]'}`}>
                      {selectedCitizen.isActive ? 'Active' : 'Suspended'}
                    </div>
                  </div>
                  <div className="p-3.5 bg-[#F8FAFC] dark:bg-[#101D31] rounded-xl border border-[#E2E8F0] dark:border-[#243449]">
                    <div className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">Occupation</div>
                    <div className="font-bold text-[#07111F] dark:text-[#F8FAFC]">{selectedCitizen.profile?.occupation || 'Citizen'}</div>
                  </div>
                  <div className="p-3.5 bg-[#F8FAFC] dark:bg-[#101D31] rounded-xl border border-[#E2E8F0] dark:border-[#243449]">
                    <div className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">Annual Income</div>
                    <div className="font-bold text-[#07111F] dark:text-[#F8FAFC]">
                      {selectedCitizen.profile?.annualIncome ? `₹${selectedCitizen.profile.annualIncome.toLocaleString('en-IN')}` : 'Not declared'}
                    </div>
                  </div>
                  <div className="p-3.5 bg-[#F8FAFC] dark:bg-[#101D31] rounded-xl border border-[#E2E8F0] dark:border-[#243449]">
                    <div className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">Registered On</div>
                    <div className="font-bold text-[#07111F] dark:text-[#F8FAFC]">
                      {new Date(selectedCitizen.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                {/* Submitted Applications */}
                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-[#07111F] dark:text-[#F8FAFC] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#1769FF]" /> Submitted Applications ({citizenDetails?.applications.length || 0})
                  </h3>
                  {loadingDetails ? (
                    <div className="h-16 bg-[#F8FAFC] dark:bg-[#101D31] rounded-lg animate-pulse" />
                  ) : citizenDetails?.applications.length === 0 ? (
                    <div className="p-4 bg-[#F8FAFC] dark:bg-[#101D31] rounded-xl text-center text-xs text-[#64748B] dark:text-[#94A3B8]">
                      No active applications on record for this citizen.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {citizenDetails?.applications.map((app: any) => (
                        <div key={app._id} className="p-3 bg-[#F8FAFC] dark:bg-[#101D31] border border-[#E2E8F0] dark:border-[#243449] rounded-xl flex items-center justify-between">
                          <div>
                            <div className="font-bold text-sm text-[#07111F] dark:text-[#F8FAFC] flex items-center gap-2">
                              <span>{app.schemeId?.name || 'Government Scheme'}</span>
                              {app.applicationNumber && (
                                <span className="font-mono text-xs text-[#1769FF] font-semibold bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">
                                  {app.applicationNumber}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-[#64748B] dark:text-[#94A3B8]">{app.schemeId?.department || 'National Ministry'}</div>
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#1769FF]/10 text-[#1769FF] dark:text-[#60A5FA]">
                            {app.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Document Submissions */}
                <div className="space-y-3">
                  <h3 className="font-bold text-sm text-[#07111F] dark:text-[#F8FAFC] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#15803D]" /> KYC Documents ({citizenDetails?.documents.length || 0})
                  </h3>
                  {citizenDetails?.documents.map((doc: any) => (
                    <div key={doc._id} className="p-3 bg-[#F8FAFC] dark:bg-[#101D31] border border-[#E2E8F0] dark:border-[#243449] rounded-xl flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm text-[#07111F] dark:text-[#F8FAFC]">{doc.type}</div>
                        <div className="text-xs text-[#64748B] dark:text-[#94A3B8]">{doc.docNumber || 'DOC-ENCRYPTED'}</div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        doc.status === 'Verified' ? 'bg-[#15803D]/10 text-[#15803D]' : 'bg-[#D97706]/10 text-[#D97706]'
                      }`}>
                        {doc.status || (doc.verified ? 'Verified' : 'Pending')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Drawer Actions */}
              <div className="p-4 border-t border-[#E2E8F0] dark:border-[#243449] flex justify-end gap-3 bg-[#F5F7FA] dark:bg-[#101D31]">
                <button 
                  onClick={() => setSelectedCitizen(null)} 
                  className="px-4 py-2 border border-[#E2E8F0] dark:border-[#243449] rounded-lg font-bold text-sm text-[#07111F] dark:text-[#F8FAFC]"
                >
                  Close
                </button>
                <button 
                  onClick={() => toggleUserStatus(selectedCitizen)}
                  className={`px-4 py-2 text-white rounded-lg font-bold text-sm transition-colors ${
                    selectedCitizen.isActive ? 'bg-[#B91C1C] hover:bg-[#991B1B]' : 'bg-[#15803D] hover:bg-[#166534]'
                  }`}
                >
                  {selectedCitizen.isActive ? 'Suspend Citizen' : 'Re-activate Citizen'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
