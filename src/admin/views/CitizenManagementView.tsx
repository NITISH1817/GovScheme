import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Shield, User, Mail, Phone, Calendar, Power, PowerOff } from 'lucide-react';
import { apiClient } from '../../api/apiClient';

export const CitizenManagementView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [citizens, setCitizens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCitizens = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/users', { q: searchTerm, limit: 50 });
      if (res.success) {
        setCitizens(res.users);
      }
    } catch (error) {
      console.error('Failed to fetch citizens', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCitizens();
  }, [searchTerm]);

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await apiClient.put(`/users/${id}/status`, { isActive: !currentStatus });
      if (res.success) {
        // Update local state instead of re-fetching to be faster
        setCitizens(citizens.map(c => c._id === id ? { ...c, isActive: !currentStatus } : c));
      }
    } catch (error: any) {
      alert(error.message || 'Failed to update status');
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
            placeholder="Search citizens by name or email..."
            className="w-full sm:max-w-md pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
          <Filter size={18} />
          <span>Filter</span>
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-sm font-medium text-slate-600">Citizen</th>
                <th className="p-4 text-sm font-medium text-slate-600">Contact Info</th>
                <th className="p-4 text-sm font-medium text-slate-600">Status</th>
                <th className="p-4 text-sm font-medium text-slate-600">Joined Date</th>
                <th className="p-4 text-sm font-medium text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading...</td></tr>
              ) : citizens.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">No citizens found matching "{searchTerm}"</td></tr>
              ) : citizens.map((citizen) => (
                <tr key={citizen._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                        <User size={20} />
                      </div>
                      <div>
                        <div className="font-medium text-slate-800">{citizen.fullName}</div>
                        <div className="text-xs text-slate-500">ID: ...{citizen._id.slice(-6)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 space-y-1">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail size={14} /> <span>{citizen.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone size={14} /> <span>{citizen.phone || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      citizen.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {citizen.isActive && <Shield size={12} className="mr-1" />}
                      {citizen.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar size={14} /> <span>{new Date(citizen.createdAt).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => toggleStatus(citizen._id, citizen.isActive)}
                      className={`p-2 rounded-lg transition-colors ${citizen.isActive ? 'text-red-500 hover:bg-red-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                      title={citizen.isActive ? 'Suspend User' : 'Activate User'}
                    >
                      {citizen.isActive ? <PowerOff size={20} /> : <Power size={20} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
