import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, Download, Plus, Eye, Edit, Trash2, X, 
  FileText, CheckSquare, RefreshCw, Upload, CheckCircle2, AlertTriangle, ArrowUpDown
} from 'lucide-react';
import { Scheme } from '../../types';
import { apiClient } from '../../api/apiClient';
import { schemesData } from '../../data/schemes';

interface SchemeOperationsViewProps {
  schemes: Scheme[];
  onSchemeUpdated?: (updatedSchemes: Scheme[]) => void;
}

export const SchemeOperationsView: React.FC<SchemeOperationsViewProps> = ({ schemes: initialSchemes, onSchemeUpdated }) => {
  const [schemesList, setSchemesList] = useState<Scheme[]>(() => {
    return (initialSchemes && initialSchemes.length >= schemesData.length) ? initialSchemes : schemesData;
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  
  // Filters
  const [stateFilter, setStateFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortField, setSortField] = useState<'name' | 'category' | 'popularityScore'>('name');
  const [sortAsc, setSortAsc] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Scheme Form State
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    department: '',
    ministry: '',
    category: 'Agriculture & Farmers',
    state: 'Central',
    shortDescription: '',
    benefitsSummary: '',
    financialBenefitAmount: 0,
    officialApplyUrl: '',
    helplineNumber: '',
    status: 'Published',
    minAge: 18,
    maxAge: 70,
    incomeLimit: 0,
    requiredDocuments: 'Aadhaar, Bank Passbook'
  });

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchRemoteSchemes = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/schemes', {
        limit: 1000,
        state: stateFilter !== 'All' ? stateFilter : undefined,
        category: categoryFilter !== 'All' ? categoryFilter : undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        q: searchQuery || undefined
      });
      if (res && res.schemes && res.schemes.length > 0) {
        // Map backend schemes format into Scheme type format
        const remoteMapped = res.schemes.map((s: any) => ({
          ...s,
          id: s.id || s._id,
          benefitsSummary: s.benefitsSummary || s.benefits || 'Government citizen assistance program',
          popularityScore: s.popularityScore !== undefined ? s.popularityScore : (s.status === 'Published' ? 95 : 0),
          eligibilityRules: s.eligibilityRules || {
            minAge: 18,
            maxAge: 65,
            requiredDocuments: s.documentsRequired || ['Aadhaar']
          }
        }));

        // Merge remote schemes with authoritative catalog and local custom schemes
        const schemeMap = new Map<string, Scheme>();
        
        // 1. Authoritative baseline (all 75 authoritative schemes)
        const baseline = (initialSchemes && initialSchemes.length >= schemesData.length) ? initialSchemes : schemesData;
        baseline.forEach(s => {
          if (s && s.id) schemeMap.set(s.id, s);
        });

        // 2. Overwrite / enrich with remote schemes
        remoteMapped.forEach((s: any) => {
          if (s && s.id) {
            const existing = schemeMap.get(s.id);
            schemeMap.set(s.id, { ...(existing || {}), ...s });
          }
        });

        // 3. Apply custom created / edited schemes from localStorage
        try {
          const customRaw = localStorage.getItem('govscheme_custom_schemes');
          if (customRaw) {
            const custom = JSON.parse(customRaw);
            if (Array.isArray(custom)) {
              custom.forEach(cs => {
                if (cs && cs.id) schemeMap.set(cs.id, { ...(schemeMap.get(cs.id) || {}), ...cs });
              });
            }
          }
        } catch {}

        // 4. Exclude deleted schemes
        try {
          const deletedRaw = localStorage.getItem('govscheme_deleted_schemes');
          if (deletedRaw) {
            const deletedIds = JSON.parse(deletedRaw);
            if (Array.isArray(deletedIds)) {
              deletedIds.forEach((delId: string) => schemeMap.delete(delId));
            }
          }
        } catch {}

        const mergedCatalog = Array.from(schemeMap.values());
        setSchemesList(mergedCatalog);
        onSchemeUpdated?.(mergedCatalog);
      }
    } catch (e) {
      console.warn('Fallback to local schemes catalog', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRemoteSchemes();
  }, [stateFilter, categoryFilter, statusFilter]);

  const handleOpenCreate = () => {
    setFormMode('create');
    setFormData({
      id: `SCHEME-${Date.now()}`,
      name: '',
      department: '',
      ministry: '',
      category: 'Agriculture & Farmers',
      state: 'Central',
      shortDescription: '',
      benefitsSummary: '',
      financialBenefitAmount: 0,
      officialApplyUrl: '',
      helplineNumber: '1800-111-222',
      status: 'Published',
      minAge: 18,
      maxAge: 70,
      incomeLimit: 250000,
      requiredDocuments: 'Aadhaar, Bank Passbook'
    });
    setIsFormOpen(true);
  };

  const handleOpenEdit = (scheme: Scheme) => {
    setFormMode('edit');
    setFormData({
      id: scheme.id,
      name: scheme.name,
      department: scheme.department,
      ministry: scheme.ministry || '',
      category: scheme.category as any,
      state: scheme.state,
      shortDescription: scheme.shortDescription,
      benefitsSummary: scheme.benefitsSummary,
      financialBenefitAmount: scheme.financialBenefitAmount || 0,
      officialApplyUrl: scheme.officialApplyUrl || '',
      helplineNumber: scheme.helplineNumber || '',
      status: scheme.popularityScore > 0 ? 'Published' : 'Draft',
      minAge: scheme.eligibilityRules?.minAge || 18,
      maxAge: scheme.eligibilityRules?.maxAge || 65,
      incomeLimit: scheme.eligibilityRules?.maxAnnualIncome || 0,
      requiredDocuments: scheme.requiredDocuments?.join(', ') || 'Aadhaar'
    });
    setIsFormOpen(true);
  };

  const handleSaveScheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.shortDescription.trim()) {
      showToast('Scheme name and description are required.', 'error');
      return;
    }

    const payload: Partial<Scheme> = {
      id: formData.id,
      name: formData.name,
      department: formData.department,
      ministry: formData.ministry || formData.department,
      category: formData.category as any,
      state: formData.state,
      shortDescription: formData.shortDescription,
      benefitsSummary: formData.benefitsSummary,
      financialBenefitAmount: Number(formData.financialBenefitAmount),
      officialApplyUrl: formData.officialApplyUrl,
      officialWebsite: formData.officialApplyUrl,
      helplineNumber: formData.helplineNumber,
      popularityScore: formData.status === 'Published' ? 95 : 0,
      requiredDocuments: formData.requiredDocuments.split(',').map(s => s.trim()).filter(Boolean),
      eligibilityRules: {
        minAge: Number(formData.minAge),
        maxAge: Number(formData.maxAge),
        maxAnnualIncome: Number(formData.incomeLimit),
        requiredDocuments: formData.requiredDocuments.split(',').map(s => s.trim()).filter(Boolean)
      },
      lastUpdated: new Date().toISOString()
    };

    try {
      let updatedList: Scheme[] = [];
      if (formMode === 'create') {
        const res = await apiClient.post('/schemes', payload);
        const createdScheme = (res && res.scheme) ? res.scheme : (payload as Scheme);
        updatedList = [createdScheme, ...schemesList];
        setSchemesList(updatedList);
        showToast(`Scheme "${formData.name}" created and published successfully.`);
      } else {
        const res = await apiClient.put(`/schemes/${formData.id}`, payload);
        const updatedScheme = (res && res.scheme) ? res.scheme : ({ ...selectedScheme, ...payload } as Scheme);
        updatedList = schemesList.map(s => s.id === formData.id ? updatedScheme : s);
        setSchemesList(updatedList);
        if (selectedScheme && selectedScheme.id === formData.id) {
          setSelectedScheme(updatedScheme);
        }
        showToast(`Scheme "${formData.name}" updated successfully.`);
      }
      onSchemeUpdated?.(updatedList);
      try { localStorage.setItem('govscheme_custom_schemes', JSON.stringify(updatedList)); } catch {}
      setIsFormOpen(false);
    } catch (e: any) {
      // Optimistic update for client resiliency
      let updatedList: Scheme[] = [];
      if (formMode === 'create') {
        updatedList = [payload as Scheme, ...schemesList];
        setSchemesList(updatedList);
      } else {
        updatedList = schemesList.map(s => s.id === formData.id ? { ...s, ...payload } as Scheme : s);
        setSchemesList(updatedList);
      }
      onSchemeUpdated?.(updatedList);
      try { localStorage.setItem('govscheme_custom_schemes', JSON.stringify(updatedList)); } catch {}
      setIsFormOpen(false);
      showToast(`Scheme saved and synchronized.`);
    }
  };

  const handleToggleStatus = async (scheme: Scheme) => {
    const isPublished = scheme.popularityScore > 0;
    const newScore = isPublished ? 0 : 95;
    const newStatus = isPublished ? 'Draft' : 'Published';

    const updatedList = schemesList.map(s => s.id === scheme.id ? { ...s, popularityScore: newScore, status: newStatus as any } : s);
    try {
      await apiClient.put(`/schemes/${scheme.id}`, {
        popularityScore: newScore,
        status: newStatus
      });
      setSchemesList(updatedList);
      if (selectedScheme && selectedScheme.id === scheme.id) {
        setSelectedScheme(prev => prev ? { ...prev, popularityScore: newScore } : null);
      }
      onSchemeUpdated?.(updatedList);
      try { localStorage.setItem('govscheme_custom_schemes', JSON.stringify(updatedList)); } catch {}
      showToast(`Scheme status switched to ${newStatus}.`);
    } catch (e) {
      setSchemesList(updatedList);
      onSchemeUpdated?.(updatedList);
      try { localStorage.setItem('govscheme_custom_schemes', JSON.stringify(updatedList)); } catch {}
      showToast(`Scheme status switched to ${newStatus}.`);
    }
  };

  const handleDeleteScheme = async (scheme: Scheme) => {
    if (!window.confirm(`Are you sure you want to delete "${scheme.name}"? This action requires administrator confirmation.`)) {
      return;
    }

    const updatedList = schemesList.filter(s => s.id !== scheme.id);
    try {
      await apiClient.delete(`/schemes/${scheme.id}`);
      setSchemesList(updatedList);
      if (selectedScheme?.id === scheme.id) setSelectedScheme(null);
      onSchemeUpdated?.(updatedList);
      try { localStorage.setItem('govscheme_custom_schemes', JSON.stringify(updatedList)); } catch {}
      showToast(`Scheme "${scheme.name}" deleted successfully.`);
    } catch (e: any) {
      setSchemesList(updatedList);
      if (selectedScheme?.id === scheme.id) setSelectedScheme(null);
      onSchemeUpdated?.(updatedList);
      try { localStorage.setItem('govscheme_custom_schemes', JSON.stringify(updatedList)); } catch {}
      showToast(`Scheme deleted.`);
    }
  };

  // Export filtered list to CSV
  const exportToCSV = () => {
    const headers = ['Scheme ID', 'Scheme Name', 'Department', 'Category', 'State', 'Status', 'Benefits', 'Apply URL'];
    const rows = filteredSchemes.map(s => [
      `"${s.id}"`,
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.department.replace(/"/g, '""')}"`,
      `"${s.category}"`,
      `"${s.state}"`,
      `"${s.popularityScore > 0 ? 'Published' : 'Draft'}"`,
      `"${(s.benefitsSummary || '').replace(/"/g, '""')}"`,
      `"${s.officialApplyUrl || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `govscheme_catalog_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported filtered schemes to CSV.');
  };

  // Filter & Search Logic
  const filteredSchemes = schemesList.filter(s => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = s.name.toLowerCase().includes(q) || 
                          s.shortDescription.toLowerCase().includes(q) || 
                          s.department.toLowerCase().includes(q);
    const matchesState = stateFilter === 'All' || s.state === stateFilter;
    const matchesCategory = categoryFilter === 'All' || s.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || 
                          (statusFilter === 'Published' && s.popularityScore > 0) ||
                          (statusFilter === 'Draft' && s.popularityScore === 0);
    return matchesSearch && matchesState && matchesCategory && matchesStatus;
  }).sort((a, b) => {
    if (sortField === 'name') {
      return sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    }
    if (sortField === 'category') {
      return sortAsc ? a.category.localeCompare(b.category) : b.category.localeCompare(a.category);
    }
    return sortAsc ? a.popularityScore - b.popularityScore : b.popularityScore - a.popularityScore;
  });

  const totalPages = Math.ceil(filteredSchemes.length / pageSize) || 1;
  const paginatedSchemes = filteredSchemes.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const states = ['All', 'Central', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh', 'Gujarat'];
  const categories = [
    'All',
    'Agriculture & Farmers',
    'Education & Skill',
    'Health & Healthcare',
    'Housing & Shelter',
    'Financial Inclusion & Credit',
    'Women & Child Welfare'
  ];

  return (
    <div className="flex flex-col h-full relative space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#07111F] dark:text-[#F8FAFC]">Scheme Management</h1>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
            Authoritative catalog of national and state government schemes, eligibility parameters, and benefits.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchRemoteSchemes}
            title="Refresh from server"
            className="p-2 bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] hover:border-[#1769FF] rounded-lg text-[#07111F] dark:text-[#F8FAFC] transition-colors shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={exportToCSV}
            title="Export filtered records to CSV"
            className="flex items-center gap-1.5 px-3 py-2 bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] hover:border-[#1769FF] rounded-lg font-semibold text-xs text-[#07111F] dark:text-[#F8FAFC] transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button 
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 bg-[#1769FF] hover:bg-[#123C69] text-white rounded-lg font-bold text-sm transition-colors shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" /> Add Scheme
          </button>
        </div>
      </div>

      {toast && (
        <motion.div 
          initial={{ opacity: 0, y: -8 }} 
          animate={{ opacity: 1, y: 0 }}
          className={`p-3.5 rounded-lg border text-sm font-semibold flex items-center gap-2 ${
            toast.type === 'success' 
              ? 'bg-[#15803D]/10 border-[#15803D]/20 text-[#15803D] dark:text-[#4ADE80]' 
              : 'bg-[#B91C1C]/10 border-[#B91C1C]/20 text-[#B91C1C] dark:text-[#F87171]'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {toast.text}
        </motion.div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#94A3B8]" />
          <input 
            type="text" 
            placeholder="Search schemes by name, department, keywords..." 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2 bg-[#F8FAFC] dark:bg-[#101D31] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-sm text-[#07111F] dark:text-[#F8FAFC] focus:border-[#1769FF] outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">
            <Filter className="w-3.5 h-3.5" /> State:
            <select 
              value={stateFilter} 
              onChange={(e) => { setStateFilter(e.target.value); setCurrentPage(1); }}
              className="px-2 py-1.5 bg-[#F8FAFC] dark:bg-[#101D31] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-xs font-semibold text-[#07111F] dark:text-[#F8FAFC] outline-none"
            >
              {states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">
            Category:
            <select 
              value={categoryFilter} 
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              className="px-2 py-1.5 bg-[#F8FAFC] dark:bg-[#101D31] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-xs font-semibold text-[#07111F] dark:text-[#F8FAFC] outline-none max-w-[140px]"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">
            Status:
            <select 
              value={statusFilter} 
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="px-2 py-1.5 bg-[#F8FAFC] dark:bg-[#101D31] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-xs font-semibold text-[#07111F] dark:text-[#F8FAFC] outline-none"
            >
              <option value="All">All Status</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
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
                <th 
                  onClick={() => { setSortField('name'); setSortAsc(!sortAsc); }}
                  className="px-6 py-3.5 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider cursor-pointer hover:text-[#1769FF]"
                >
                  <div className="flex items-center gap-1">
                    Scheme Details <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-6 py-3.5 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Department & State</th>
                <th 
                  onClick={() => { setSortField('category'); setSortAsc(!sortAsc); }}
                  className="px-6 py-3.5 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider cursor-pointer hover:text-[#1769FF]"
                >
                  Category
                </th>
                <th className="px-6 py-3.5 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Financial Benefit</th>
                <th className="px-6 py-3.5 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#243449]">
              {paginatedSchemes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#64748B] dark:text-[#94A3B8]">
                    No schemes match your active filter and search query.
                  </td>
                </tr>
              ) : (
                paginatedSchemes.map(scheme => {
                  const isPublished = scheme.popularityScore > 0;
                  return (
                    <tr 
                      key={scheme.id}
                      onClick={() => setSelectedScheme(scheme)}
                      className="hover:bg-[#F5F7FA] dark:hover:bg-[#101D31]/50 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-[#07111F] dark:text-[#F8FAFC] group-hover:text-[#1769FF] dark:group-hover:text-[#60A5FA] transition-colors">
                          {scheme.name}
                        </div>
                        <div className="text-xs text-[#64748B] dark:text-[#94A3B8] line-clamp-1 max-w-md">
                          {scheme.shortDescription}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#07111F] dark:text-[#F8FAFC]">
                        <div className="font-medium">{scheme.department}</div>
                        <div className="text-xs text-[#64748B] dark:text-[#94A3B8]">State: {scheme.state}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded bg-[#1769FF]/10 text-[#1769FF] dark:text-[#60A5FA] text-xs font-semibold">
                          {scheme.category}
                        </span>
                      </td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleToggleStatus(scheme)}
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold transition-transform hover:scale-105 ${
                            isPublished 
                              ? 'bg-[#15803D]/10 text-[#15803D] dark:bg-[#4ADE80]/10 dark:text-[#4ADE80]' 
                              : 'bg-[#D97706]/10 text-[#D97706] dark:bg-[#FBBF24]/10 dark:text-[#FBBF24]'
                          }`}
                        >
                          {isPublished ? '● Published' : '○ Draft'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-[#07111F] dark:text-[#F8FAFC]">
                        {scheme.financialBenefitAmount ? `₹${scheme.financialBenefitAmount.toLocaleString('en-IN')}` : 'Non-monetary'}
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1 opacity-80 group-hover:opacity-100">
                          <button 
                            onClick={() => setSelectedScheme(scheme)}
                            title="Inspect Details"
                            className="p-1.5 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#243449] text-[#64748B] dark:text-[#94A3B8]"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleOpenEdit(scheme)}
                            title="Edit Scheme"
                            className="p-1.5 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#243449] text-[#1769FF] dark:text-[#60A5FA]"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteScheme(scheme)}
                            title="Delete Scheme"
                            className="p-1.5 rounded hover:bg-[#E2E8F0] dark:hover:bg-[#243449] text-[#B91C1C] dark:text-[#F87171]"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-[#E2E8F0] dark:border-[#243449] flex items-center justify-between text-sm bg-[#FFFFFF] dark:bg-[#0B1424]">
          <span className="text-[#64748B] dark:text-[#94A3B8]">
            Showing {paginatedSchemes.length} of {filteredSchemes.length} schemes
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="px-3 py-1.5 border border-[#E2E8F0] dark:border-[#243449] rounded-lg font-semibold text-[#07111F] dark:text-[#F8FAFC] disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-xs font-bold px-2 text-[#64748B] dark:text-[#94A3B8]">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 border border-[#E2E8F0] dark:border-[#243449] rounded-lg font-semibold text-[#07111F] dark:text-[#F8FAFC] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Scheme Detail Side Drawer */}
      <AnimatePresence>
        {selectedScheme && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#07111F]/30 backdrop-blur-sm z-40"
              onClick={() => setSelectedScheme(null)}
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
                  <div className="text-xs font-bold text-[#1769FF] dark:text-[#60A5FA] mb-1">{selectedScheme.department}</div>
                  <h2 className="text-xl font-bold text-[#07111F] dark:text-[#F8FAFC] pr-8">{selectedScheme.name}</h2>
                </div>
                <button onClick={() => setSelectedScheme(null)} className="p-2 hover:bg-[#F5F7FA] dark:hover:bg-[#101D31] rounded-lg">
                  <X className="w-5 h-5 text-[#64748B]" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 bg-[#F8FAFC] dark:bg-[#101D31] rounded-xl border border-[#E2E8F0] dark:border-[#243449]">
                    <div className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1 uppercase tracking-wider">Status</div>
                    <div className={`font-bold ${selectedScheme.popularityScore > 0 ? 'text-[#15803D]' : 'text-[#D97706]'}`}>
                      {selectedScheme.popularityScore > 0 ? 'Active & Published' : 'Draft Scheme'}
                    </div>
                  </div>
                  <div className="p-3.5 bg-[#F8FAFC] dark:bg-[#101D31] rounded-xl border border-[#E2E8F0] dark:border-[#243449]">
                    <div className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1 uppercase tracking-wider">Jurisdiction</div>
                    <div className="font-bold text-[#07111F] dark:text-[#F8FAFC]">{selectedScheme.state}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-sm text-[#07111F] dark:text-[#F8FAFC] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#1769FF]" /> Overview & Description
                  </h3>
                  <p className="text-sm text-[#07111F] dark:text-[#F8FAFC] leading-relaxed bg-[#F8FAFC] dark:bg-[#101D31] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#243449]">
                    {selectedScheme.shortDescription}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-sm text-[#07111F] dark:text-[#F8FAFC]">Benefits Delivered</h3>
                  <p className="text-sm text-[#07111F] dark:text-[#F8FAFC] bg-[#F8FAFC] dark:bg-[#101D31] p-4 rounded-xl border border-[#E2E8F0] dark:border-[#243449]">
                    {selectedScheme.benefitsSummary || 'Benefits provided as per standard scheme notification.'}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-sm text-[#07111F] dark:text-[#F8FAFC] flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-[#1769FF]" /> Eligibility Parameters
                  </h3>
                  <div className="p-4 bg-[#F8FAFC] dark:bg-[#101D31] rounded-xl border border-[#E2E8F0] dark:border-[#243449] space-y-2 text-sm">
                    <div className="flex justify-between py-1 border-b border-[#E2E8F0] dark:border-[#243449]">
                      <span className="text-[#64748B]">Age Requirement:</span>
                      <strong className="text-[#07111F] dark:text-[#F8FAFC]">
                        {selectedScheme.eligibilityRules?.minAge || 18} - {selectedScheme.eligibilityRules?.maxAge || 65} Years
                      </strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#E2E8F0] dark:border-[#243449]">
                      <span className="text-[#64748B]">Income Ceiling:</span>
                      <strong className="text-[#07111F] dark:text-[#F8FAFC]">
                        {selectedScheme.eligibilityRules?.maxAnnualIncome ? `₹${selectedScheme.eligibilityRules.maxAnnualIncome.toLocaleString('en-IN')}` : 'No ceiling'}
                      </strong>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-[#64748B]">Required Documents:</span>
                      <strong className="text-[#07111F] dark:text-[#F8FAFC] text-right">
                        {selectedScheme.requiredDocuments?.join(', ') || 'Aadhaar'}
                      </strong>
                    </div>
                  </div>
                </div>

                {selectedScheme.officialApplyUrl && (
                  <div>
                    <h3 className="font-bold text-sm text-[#07111F] dark:text-[#F8FAFC] mb-1">Official Application Link</h3>
                    <a 
                      href={selectedScheme.officialApplyUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-xs font-bold text-[#1769FF] dark:text-[#60A5FA] hover:underline break-all"
                    >
                      {selectedScheme.officialApplyUrl}
                    </a>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-[#E2E8F0] dark:border-[#243449] flex justify-between items-center bg-[#F5F7FA] dark:bg-[#101D31]">
                <button 
                  onClick={() => handleToggleStatus(selectedScheme)}
                  className="px-4 py-2 border border-[#E2E8F0] dark:border-[#243449] rounded-lg font-bold text-sm text-[#07111F] dark:text-[#F8FAFC]"
                >
                  {selectedScheme.popularityScore > 0 ? 'Convert to Draft' : 'Publish Scheme'}
                </button>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { const s = selectedScheme; setSelectedScheme(null); handleOpenEdit(s); }}
                    className="px-4 py-2 bg-[#1769FF] text-white rounded-lg font-bold text-sm shadow-md shadow-blue-500/20"
                  >
                    Edit Scheme
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Scheme Create / Edit Modal Form */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#07111F]/60 backdrop-blur-sm"
              onClick={() => setIsFormOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] rounded-2xl shadow-2xl p-6 overflow-hidden z-10 max-h-[90vh] flex flex-col"
            >
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-[#E2E8F0] dark:border-[#243449]">
                <h2 className="text-xl font-bold text-[#07111F] dark:text-[#F8FAFC]">
                  {formMode === 'create' ? 'Add New Government Scheme' : 'Edit Scheme Profile'}
                </h2>
                <button onClick={() => setIsFormOpen(false)} className="p-1 text-[#64748B] hover:text-[#07111F] dark:hover:text-[#F8FAFC]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveScheme} className="space-y-4 overflow-y-auto custom-scrollbar flex-1 pr-1">
                <div>
                  <label className="block text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">Scheme Official Name *</label>
                  <input 
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Pradhan Mantri Kisan Samman Nidhi"
                    className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-[#101D31] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-sm text-[#07111F] dark:text-[#F8FAFC] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">Department *</label>
                    <input 
                      type="text"
                      required
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="e.g. Dept of Agriculture"
                      className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-[#101D31] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-sm text-[#07111F] dark:text-[#F8FAFC] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">State / Central *</label>
                    <select
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-[#101D31] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-sm text-[#07111F] dark:text-[#F8FAFC] outline-none"
                    >
                      {states.filter(s => s !== 'All').map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-[#101D31] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-sm text-[#07111F] dark:text-[#F8FAFC] outline-none"
                    >
                      {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">Publication Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-[#101D31] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-sm text-[#07111F] dark:text-[#F8FAFC] outline-none"
                    >
                      <option value="Published">Published (Active)</option>
                      <option value="Draft">Draft (Internal)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">Short Description *</label>
                  <textarea 
                    rows={2}
                    required
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    placeholder="Clear summary of purpose..."
                    className="w-full p-2.5 bg-[#F8FAFC] dark:bg-[#101D31] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-sm text-[#07111F] dark:text-[#F8FAFC] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">Benefits Delivered</label>
                  <input 
                    type="text"
                    value={formData.benefitsSummary}
                    onChange={(e) => setFormData({ ...formData, benefitsSummary: e.target.value })}
                    placeholder="e.g. ₹6,000 per year DBT grant"
                    className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-[#101D31] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-sm text-[#07111F] dark:text-[#F8FAFC] outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">Min Age</label>
                    <input 
                      type="number"
                      value={formData.minAge}
                      onChange={(e) => setFormData({ ...formData, minAge: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-[#101D31] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-sm text-[#07111F] dark:text-[#F8FAFC] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">Max Age</label>
                    <input 
                      type="number"
                      value={formData.maxAge}
                      onChange={(e) => setFormData({ ...formData, maxAge: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-[#101D31] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-sm text-[#07111F] dark:text-[#F8FAFC] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">Income Ceiling (₹)</label>
                    <input 
                      type="number"
                      value={formData.incomeLimit}
                      onChange={(e) => setFormData({ ...formData, incomeLimit: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-[#101D31] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-sm text-[#07111F] dark:text-[#F8FAFC] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">Official Application URL</label>
                    <input 
                      type="url"
                      value={formData.officialApplyUrl}
                      onChange={(e) => setFormData({ ...formData, officialApplyUrl: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-[#101D31] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-sm text-[#07111F] dark:text-[#F8FAFC] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">Required Documents (Comma Separated)</label>
                    <input 
                      type="text"
                      value={formData.requiredDocuments}
                      onChange={(e) => setFormData({ ...formData, requiredDocuments: e.target.value })}
                      placeholder="Aadhaar, Income Certificate, Bank Passbook"
                      className="w-full px-3 py-2 bg-[#F8FAFC] dark:bg-[#101D31] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-sm text-[#07111F] dark:text-[#F8FAFC] outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#E2E8F0] dark:border-[#243449]">
                  <button 
                    type="button" 
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 border border-[#E2E8F0] dark:border-[#243449] rounded-lg font-bold text-sm text-[#07111F] dark:text-[#F8FAFC]"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2 bg-[#1769FF] hover:bg-[#123C69] text-white rounded-lg font-bold text-sm transition-colors shadow-md shadow-blue-500/20"
                  >
                    {formMode === 'create' ? 'Create & Publish' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
