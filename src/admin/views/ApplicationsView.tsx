import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import { apiClient } from '../../api/apiClient';

export const ApplicationsView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [remarks, setRemarks] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/applications', { status: statusFilter });
      if (res.success) {
        setApplications(res.applications);
      }
    } catch (error) {
      console.error('Failed to fetch applications', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const handleStatusUpdate = async (status: string) => {
    if (!selectedApp) return;
    try {
      const res = await apiClient.put(`/applications/${selectedApp._id}/status`, { status, remarks });
      if (res.success) {
        setSelectedApp(null);
        setRemarks('');
        fetchApplications();
      }
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const filteredApplications = applications.filter(app => {
    const searchLower = searchTerm.toLowerCase();
    const name = app.userId?.fullName?.toLowerCase() || '';
    const id = app._id.toLowerCase();
    return name.includes(searchLower) || id.includes(searchLower);
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 w-full sm:w-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by applicant name or ID..."
            className="w-full sm:max-w-md pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors focus:outline-none"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-sm font-medium text-slate-600">Application ID</th>
                <th className="p-4 text-sm font-medium text-slate-600">Applicant</th>
                <th className="p-4 text-sm font-medium text-slate-600">Date</th>
                <th className="p-4 text-sm font-medium text-slate-600">Status</th>
                <th className="p-4 text-sm font-medium text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading...</td></tr>
              ) : filteredApplications.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">No applications found matching "{searchTerm}"</td></tr>
              ) : filteredApplications.map((app) => (
                <tr key={app._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-mono text-sm text-slate-600">...{app._id.slice(-6)}</td>
                  <td className="p-4 font-medium text-slate-800">
                    {app.userId?.fullName || 'Unknown'}
                    <div className="text-xs text-slate-500">{app.userId?.email}</div>
                  </td>
                  <td className="p-4 text-sm text-slate-600">{new Date(app.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      app.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                      app.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {app.status === 'Approved' && <CheckCircle size={12} className="mr-1" />}
                      {app.status === 'Pending' && <Clock size={12} className="mr-1" />}
                      {app.status === 'Rejected' && <XCircle size={12} className="mr-1" />}
                      {app.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => setSelectedApp(app)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                      title="Review"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">Review Application</h3>
              <button onClick={() => setSelectedApp(null)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-slate-500 mb-1">Applicant Name</div>
                  <div className="font-medium text-slate-800">{selectedApp.userId?.fullName}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">State</div>
                  <div className="font-medium text-slate-800">{selectedApp.userId?.state}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Category</div>
                  <div className="font-medium text-slate-800">{selectedApp.userId?.category}</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Current Status</div>
                  <div className="font-medium text-slate-800">{selectedApp.status}</div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <label className="block text-sm font-medium text-slate-700 mb-2">Remarks (Optional)</label>
                <textarea 
                  className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  rows={3}
                  placeholder="Add any notes regarding the approval or rejection..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100"
              >
                Cancel
              </button>
              {selectedApp.status === 'Pending' && (
                <>
                  <button 
                    onClick={() => handleStatusUpdate('Rejected')}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                  >
                    <XCircle size={18} /> Reject
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate('Approved')}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-2"
                  >
                    <CheckCircle size={18} /> Approve
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
