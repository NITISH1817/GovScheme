import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Edit2, Trash2, Eye, Plus, MoreVertical,
  Copy, Archive, Globe, Download, CheckSquare, Square, X,
  ChevronDown, RefreshCw, BookOpen, CheckCircle
} from 'lucide-react';
import { apiClient } from '../../api/apiClient';
import { SchemeForm } from '../components/SchemeForm';
import { SchemeDetailsModal } from '../components/SchemeDetailsModal';
import { useToast } from '../components/Toast';
import { TableSkeleton } from '../components/Skeleton';

interface SchemeData {
  _id: string;
  id: string;
  name: string;
  department: string;
  state: string;
  category: string;
  status: string;
}

const STATUS_STYLES: Record<string, string> = {
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Draft: 'bg-amber-50 text-amber-700 border-amber-200',
  Archived: 'bg-slate-100 text-slate-500 border-slate-200',
};

export const SchemeManagementView: React.FC = () => {
  const toast = useToast();
  const [schemes, setSchemes] = useState<SchemeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editScheme, setEditScheme] = useState<SchemeData | null>(null);
  const [viewScheme, setViewScheme] = useState<SchemeData | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSchemes, setTotalSchemes] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const sseRef = useRef<EventSource | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const res = await apiClient.post('/schemes/bulk-import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.success) {
        toast.success('Bulk Import Successful', `Imported ${res.count} schemes.`);
        fetchSchemes();
      }
    } catch (err) {
      toast.error('Import failed', 'Invalid CSV format or server error.');
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const fetchSchemes = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = { q: searchTerm, page, limit: 10 };
      if (statusFilter !== 'All') params.status = statusFilter;
      const data = await apiClient.get('/schemes', params);
      setSchemes(data.schemes || []);
      setTotalPages(data.pages || 1);
      setTotalSchemes(data.total || 0);
    } catch {
      toast.error('Failed to load schemes', 'Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, page, statusFilter]);

  useEffect(() => {
    fetchSchemes();
  }, [fetchSchemes]);

  // Real-time SSE listener — citizen portal gets the same events
  useEffect(() => {
    const es = new EventSource('http://localhost:5000/api/schemes/events');
    es.onmessage = (e) => {
      const payload = JSON.parse(e.data);
      if (['scheme_created', 'scheme_updated', 'scheme_deleted', 'schemes_bulk_updated'].includes(payload.type)) {
        fetchSchemes();
      }
    };
    sseRef.current = es;
    return () => es.close();
  }, [fetchSchemes]);

  const handleDelete = async (scheme: SchemeData) => {
    if (!window.confirm(`Delete "${scheme.name}"? This cannot be undone.`)) return;
    try {
      await apiClient.delete(`/schemes/${scheme._id}`);
      toast.success('Scheme deleted', scheme.name);
    } catch {
      toast.error('Delete failed', 'Please try again.');
    }
  };

  const handleStatusChange = async (scheme: SchemeData, status: string) => {
    try {
      await apiClient.put(`/schemes/${scheme._id}`, { status });
      toast.success(`Scheme ${status === 'Active' ? 'published' : status.toLowerCase()}`, scheme.name);
      setMenuOpen(null);
    } catch {
      toast.error('Update failed');
    }
  };

  const handleDuplicate = async (scheme: SchemeData) => {
    try {
      await apiClient.post(`/schemes/${scheme._id}/duplicate`, {});
      toast.success('Scheme duplicated', `"${scheme.name} (Copy)" created as Draft`);
      setMenuOpen(null);
    } catch {
      toast.error('Duplicate failed');
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedIds.size === 0) return;
    const label = action === 'delete' ? 'Delete' : action === 'publish' ? 'Publish' : 'Archive';
    if (action === 'delete' && !window.confirm(`${label} ${selectedIds.size} scheme(s)?`)) return;
    try {
      await apiClient.post('/schemes/bulk', { ids: Array.from(selectedIds), action });
      toast.success(`Bulk ${label.toLowerCase()} done`, `${selectedIds.size} scheme(s) updated`);
      setSelectedIds(new Set());
    } catch {
      toast.error('Bulk action failed');
    }
  };

  const exportCSV = () => {
    const headers = ['Name', 'Department', 'State', 'Category', 'Status'];
    const rows = schemes.map(s => [s.name, s.department, s.state, s.category, s.status]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schemes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === schemes.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(schemes.map(s => s._id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-full flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/80">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          {/* Search + Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search schemes..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-56 outline-none bg-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 bg-white outline-none"
            >
              <option value="All">All Status</option>
              <option value="Active">Published</option>
              <option value="Draft">Draft</option>
              <option value="Archived">Archived</option>
            </select>
            <button
              onClick={fetchSchemes}
              className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {selectedIds.size > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-sm"
              >
                <span className="font-medium text-blue-700">{selectedIds.size} selected</span>
                <button onClick={() => handleBulkAction('publish')} className="text-emerald-600 hover:text-emerald-700 text-xs font-semibold">Publish</button>
                <button onClick={() => handleBulkAction('archive')} className="text-amber-600 hover:text-amber-700 text-xs font-semibold">Archive</button>
                <button onClick={() => handleBulkAction('delete')} className="text-red-600 hover:text-red-700 text-xs font-semibold">Delete</button>
                <button onClick={() => setSelectedIds(new Set())} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
              </motion.div>
            )}
            
            <input 
              type="file" 
              accept=".csv"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              title="Import CSV"
            >
              <Download size={15} className="rotate-180" /> Import
            </button>

            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Download size={15} /> Export
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
            >
              <Plus size={16} /> Add Scheme
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {loading ? <TableSkeleton rows={8} cols={6} /> : (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 sticky top-0 border-b border-slate-200 z-10">
              <tr>
                <th className="px-4 py-3 w-8">
                  <button onClick={toggleSelectAll} className="text-slate-400 hover:text-slate-600">
                    {selectedIds.size === schemes.length && schemes.length > 0 ? <CheckSquare size={16} className="text-blue-600" /> : <Square size={16} />}
                  </button>
                </th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Scheme Name</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Department</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">State</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schemes.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-16 text-center text-slate-400">
                  <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
                  No schemes found.
                </td></tr>
              ) : schemes.map(scheme => (
                <tr
                  key={scheme._id}
                  className={`hover:bg-slate-50 transition-colors ${selectedIds.has(scheme._id) ? 'bg-blue-50/50' : ''}`}
                >
                  <td className="px-4 py-3">
                    <button onClick={() => toggleSelect(scheme._id)} className="text-slate-400 hover:text-slate-600">
                      {selectedIds.has(scheme._id) ? <CheckSquare size={16} className="text-blue-600" /> : <Square size={16} />}
                    </button>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    <div className="max-w-[240px] truncate" title={scheme.name}>{scheme.name}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 max-w-[120px] truncate">{scheme.department}</td>
                  <td className="px-4 py-3">
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-medium">{scheme.state}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{scheme.category}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLES[scheme.status] || STATUS_STYLES.Draft}`}>
                      {scheme.status === 'Active' ? 'Published' : scheme.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setViewScheme(scheme)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="View"
                      ><Eye size={16} /></button>
                      <button
                        onClick={() => setEditScheme(scheme)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                        title="Edit"
                      ><Edit2 size={16} /></button>
                      <div className="relative">
                        <button
                          onClick={() => setMenuOpen(menuOpen === scheme._id ? null : scheme._id)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
                          title="More"
                        ><MoreVertical size={16} /></button>
                        <AnimatePresence>
                          {menuOpen === scheme._id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -4 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -4 }}
                              transition={{ duration: 0.1 }}
                              className="absolute right-0 top-8 z-20 bg-white border border-slate-200 rounded-xl shadow-xl w-44 py-1 overflow-hidden"
                            >
                              {scheme.status !== 'Active' && (
                                <button onClick={() => handleStatusChange(scheme, 'Active')} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-emerald-700 hover:bg-emerald-50 transition-colors">
                                  <Globe size={14} /> Publish
                                </button>
                              )}
                              {scheme.status !== 'Draft' && (
                                <button onClick={() => handleStatusChange(scheme, 'Draft')} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-amber-700 hover:bg-amber-50 transition-colors">
                                  <BookOpen size={14} /> Set as Draft
                                </button>
                              )}
                              {scheme.status !== 'Archived' && (
                                <button onClick={() => handleStatusChange(scheme, 'Archived')} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                                  <Archive size={14} /> Archive
                                </button>
                              )}
                              <button onClick={() => handleDuplicate(scheme)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
                                <Copy size={14} /> Duplicate
                              </button>
                              <div className="border-t border-slate-100 mt-1 pt-1">
                                <button onClick={() => { setMenuOpen(null); handleDelete(scheme); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                                  <Trash2 size={14} /> Delete
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/80 flex items-center justify-between text-sm text-slate-600 shrink-0">
        <div>Showing <span className="font-medium">{schemes.length}</span> of <span className="font-medium">{totalSchemes}</span> schemes</div>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 transition-colors">Prev</button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-1.5 border rounded-lg transition-colors ${p === page ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 hover:bg-white'}`}
            >{p}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-40 transition-colors">Next</button>
        </div>
      </div>

      {/* Modals */}
      {showAddForm && (
        <SchemeForm onClose={() => setShowAddForm(false)} onSuccess={() => { setShowAddForm(false); fetchSchemes(); toast.success('Scheme created!'); }} />
      )}
      {editScheme && (
        <SchemeForm scheme={editScheme} onClose={() => setEditScheme(null)} onSuccess={() => { setEditScheme(null); fetchSchemes(); toast.success('Scheme updated!'); }} />
      )}
      {viewScheme && (
        <SchemeDetailsModal scheme={viewScheme} onClose={() => setViewScheme(null)} />
      )}
    </div>
  );
};
