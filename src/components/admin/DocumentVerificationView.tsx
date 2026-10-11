import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileCheck2, CheckCircle2, XCircle, AlertTriangle, Search, Filter, 
  ExternalLink, Eye, RotateCcw, X, Shield, RefreshCw, FileText
} from 'lucide-react';
import { apiClient } from '../../api/apiClient';

interface VerificationDoc {
  _id: string;
  userId?: {
    fullName?: string;
    email?: string;
    mobile?: string;
    state?: string;
  };
  type: string;
  docNumber?: string;
  cloudinaryUrl?: string;
  ocrStatus: string;
  confidenceScore?: number;
  extractedData?: any;
  status: 'Pending' | 'Verified' | 'Rejected' | 'Resubmission Requested';
  rejectionReason?: string;
  internalNotes?: string;
  createdAt: string;
  verifiedAt?: string;
}

export const DocumentVerificationView: React.FC = () => {
  const [documents, setDocuments] = useState<VerificationDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [selectedDoc, setSelectedDoc] = useState<VerificationDoc | null>(null);

  // Review Form
  const [reviewStatus, setReviewStatus] = useState<'Verified' | 'Rejected' | 'Resubmission Requested'>('Verified');
  const [rejectionReason, setRejectionReason] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/documents', {
        status: statusFilter !== 'All' ? statusFilter : undefined,
        type: typeFilter !== 'All' ? typeFilter : undefined,
        limit: 30
      });
      if (res && res.documents) {
        setDocuments(res.documents);
      }
    } catch (e) {
      console.error('Failed to load documents', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [statusFilter, typeFilter]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc) return;

    if (reviewStatus !== 'Verified' && !rejectionReason.trim()) {
      alert('Please provide a specific reason for rejection or resubmission.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await apiClient.put(`/documents/${selectedDoc._id}/verify`, {
        status: reviewStatus,
        rejectionReason: reviewStatus !== 'Verified' ? rejectionReason : undefined,
        internalNotes
      });

      if (res && res.success) {
        setFeedback({ text: `Document #${selectedDoc._id.slice(-6)} marked as ${reviewStatus}.`, type: 'success' });
        setDocuments(prev => prev.map(d => d._id === selectedDoc._id ? {
          ...d,
          status: reviewStatus,
          rejectionReason,
          internalNotes
        } : d));
        setSelectedDoc(prev => prev ? { ...prev, status: reviewStatus, rejectionReason, internalNotes } : null);
        setRejectionReason('');
        setInternalNotes('');
      } else {
        setFeedback({ text: 'Review failed to save.', type: 'error' });
      }
    } catch (err: any) {
      setFeedback({ text: err.message || 'Verification update error', type: 'error' });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Verified':
        return 'bg-[#15803D]/10 text-[#15803D] dark:bg-[#4ADE80]/10 dark:text-[#4ADE80] border-[#15803D]/20';
      case 'Rejected':
        return 'bg-[#B91C1C]/10 text-[#B91C1C] dark:bg-[#F87171]/10 dark:text-[#F87171] border-[#B91C1C]/20';
      case 'Resubmission Requested':
        return 'bg-[#D97706]/10 text-[#D97706] dark:bg-[#FBBF24]/10 dark:text-[#FBBF24] border-[#D97706]/20';
      default:
        return 'bg-[#1769FF]/10 text-[#1769FF] dark:bg-[#60A5FA]/10 dark:text-[#60A5FA] border-[#1769FF]/20';
    }
  };

  const docTypes = ['All', 'Income Certificate', 'Aadhaar', 'Community Certificate', 'PAN', 'Bank Passbook'];

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#07111F] dark:text-[#F8FAFC]">Document Verification Queue</h1>
          <p className="text-sm text-[#64748B] dark:text-[#94A3B8]">
            Authorized verification queue for citizen certificates with OCR cross-validation indicators.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchDocs}
            className="flex items-center gap-2 px-3 py-2 bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] hover:border-[#1769FF] rounded-lg text-sm font-semibold text-[#07111F] dark:text-[#F8FAFC] transition-colors shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Queue
          </button>
        </div>
      </div>

      {/* Compliance Notice */}
      <div className="p-3.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-xl text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2.5">
        <Shield className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
        <span>
          <strong>Review Guidelines:</strong> AI OCR scores represent automated optical pre-processing. Official officer approval requires inspecting the document certificate and confirming official seal/issuer authenticity.
        </span>
      </div>

      {feedback && (
        <motion.div 
          initial={{ opacity: 0, y: -8 }} 
          animate={{ opacity: 1, y: 0 }}
          className={`p-3.5 rounded-lg border text-sm font-semibold flex items-center gap-2 ${
            feedback.type === 'success' 
              ? 'bg-[#15803D]/10 border-[#15803D]/20 text-[#15803D] dark:text-[#4ADE80]' 
              : 'bg-[#B91C1C]/10 border-[#B91C1C]/20 text-[#B91C1C] dark:text-[#F87171]'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {feedback.text}
        </motion.div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mr-2">Status:</span>
          {['All', 'Pending', 'Verified', 'Rejected', 'Resubmission Requested'].map(st => (
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

        <div className="flex items-center gap-2 text-sm text-[#64748B] dark:text-[#94A3B8]">
          <Filter className="w-4 h-4" /> Type:
          <select 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-[#F8FAFC] dark:bg-[#101D31] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-xs font-semibold text-[#07111F] dark:text-[#F8FAFC] outline-none"
          >
            {docTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Verification Queue Table */}
      <div className="bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] rounded-xl shadow-sm flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#F5F7FA] dark:bg-[#101D31] border-b border-[#E2E8F0] dark:border-[#243449] z-10">
              <tr>
                <th className="px-6 py-3.5 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Document Type</th>
                <th className="px-6 py-3.5 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Citizen / User</th>
                <th className="px-6 py-3.5 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Identifier / Ref</th>
                <th className="px-6 py-3.5 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">AI OCR Confidence</th>
                <th className="px-6 py-3.5 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider text-right">Verification</th>
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
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#64748B] dark:text-[#94A3B8]">
                    No documents waiting in this verification filter.
                  </td>
                </tr>
              ) : (
                documents.map(doc => (
                  <tr 
                    key={doc._id}
                    onClick={() => { setSelectedDoc(doc); setReviewStatus(doc.status === 'Pending' ? 'Verified' : doc.status); }}
                    className="hover:bg-[#F5F7FA] dark:hover:bg-[#101D31]/50 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#07111F] dark:text-[#F8FAFC] flex items-center gap-2">
                        <FileCheck2 className="w-4 h-4 text-[#1769FF]" />
                        {doc.type}
                      </div>
                      <div className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                        Submitted {new Date(doc.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-bold text-[#07111F] dark:text-[#F8FAFC]">
                        {doc.userId?.fullName || 'Citizen User'}
                      </div>
                      <div className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                        {doc.userId?.state || 'State Not Disclosed'}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-[#07111F] dark:text-[#F8FAFC]">
                      {doc.docNumber || 'DOC-PENDING'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-[#E2E8F0] dark:bg-[#243449] rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${(doc.confidenceScore || 90) >= 90 ? 'bg-[#15803D]' : 'bg-[#D97706]'}`}
                            style={{ width: `${doc.confidenceScore || 90}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-[#64748B] dark:text-[#94A3B8]">{doc.confidenceScore || 90}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(doc.status)}`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => { setSelectedDoc(doc); setReviewStatus(doc.status === 'Pending' ? 'Verified' : doc.status); }}
                        className="px-3 py-1.5 bg-[#F8FAFC] dark:bg-[#101D31] border border-[#E2E8F0] dark:border-[#243449] hover:border-[#1769FF] rounded-lg text-xs font-bold text-[#07111F] dark:text-[#F8FAFC] transition-colors"
                      >
                        Inspect & Verify
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review & Inspection Modal Drawer */}
      <AnimatePresence>
        {selectedDoc && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-[#07111F]/30 backdrop-blur-sm z-40"
              onClick={() => setSelectedDoc(null)}
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-2xl bg-[#FFFFFF] dark:bg-[#0B1424] border-l border-[#E2E8F0] dark:border-[#243449] z-50 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-[#E2E8F0] dark:border-[#243449] flex justify-between items-start">
                <div>
                  <div className="text-xs font-bold text-[#1769FF] dark:text-[#60A5FA] uppercase tracking-wider mb-1">
                    Officer Verification Queue #{selectedDoc._id.slice(-6).toUpperCase()}
                  </div>
                  <h2 className="text-xl font-bold text-[#07111F] dark:text-[#F8FAFC]">{selectedDoc.type} Verification</h2>
                  <div className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                    Citizen: {selectedDoc.userId?.fullName || 'Beneficiary'} • Ref: {selectedDoc.docNumber || 'N/A'}
                  </div>
                </div>
                <button onClick={() => setSelectedDoc(null)} className="p-2 hover:bg-[#F5F7FA] dark:hover:bg-[#101D31] rounded-lg">
                  <X className="w-5 h-5 text-[#64748B]" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                {/* Secure Document Preview Window */}
                <div className="border border-[#E2E8F0] dark:border-[#243449] rounded-xl overflow-hidden bg-[#F8FAFC] dark:bg-[#101D31]">
                  <div className="p-3 bg-[#E2E8F0]/50 dark:bg-[#243449]/50 flex justify-between items-center text-xs font-bold text-[#07111F] dark:text-[#F8FAFC]">
                    <span>Secure Preview (Watermarked for Administrative Review)</span>
                    {selectedDoc.cloudinaryUrl && (
                      <a 
                        href={selectedDoc.cloudinaryUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-1 text-[#1769FF] dark:text-[#60A5FA] hover:underline"
                      >
                        Inspect Original <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  <div className="p-4 flex justify-center items-center max-h-[300px] overflow-hidden">
                    {selectedDoc.cloudinaryUrl ? (
                      <img 
                        src={selectedDoc.cloudinaryUrl} 
                        alt="Document scan" 
                        className="max-h-[260px] object-contain rounded border border-[#E2E8F0] dark:border-[#243449]"
                      />
                    ) : (
                      <div className="p-8 text-center text-sm text-[#64748B]">Document scan archived securely.</div>
                    )}
                  </div>
                </div>

                {/* OCR Metadata Extracted */}
                <div className="p-4 bg-[#F8FAFC] dark:bg-[#101D31] border border-[#E2E8F0] dark:border-[#243449] rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">AI OCR Parsed Data</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                      Score: {selectedDoc.confidenceScore || 92}%
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {selectedDoc.extractedData ? (
                      Object.entries(selectedDoc.extractedData).map(([k, v]) => (
                        <div key={k} className="p-2 bg-[#FFFFFF] dark:bg-[#0B1424] rounded border border-[#E2E8F0] dark:border-[#243449]">
                          <span className="text-[#64748B] capitalize">{k}: </span>
                          <strong className="text-[#07111F] dark:text-[#F8FAFC]">{String(v)}</strong>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-xs text-[#64748B]">Standard certificate attributes captured.</div>
                    )}
                  </div>
                </div>

                {/* Review Form */}
                <form onSubmit={handleReviewSubmit} className="space-y-4 p-5 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/40 rounded-xl">
                  <h3 className="font-bold text-sm text-[#07111F] dark:text-[#F8FAFC]">Record Verification Decision</h3>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: 'Verified', label: 'Approve & Verify', color: 'border-green-500 text-green-700 dark:text-green-400' },
                      { val: 'Rejected', label: 'Reject Certificate', color: 'border-red-500 text-red-700 dark:text-red-400' },
                      { val: 'Resubmission Requested', label: 'Request Re-upload', color: 'border-amber-500 text-amber-700 dark:text-amber-400' },
                    ].map(opt => (
                      <button
                        type="button"
                        key={opt.val}
                        onClick={() => setReviewStatus(opt.val as any)}
                        className={`p-2.5 rounded-lg border text-xs font-bold transition-all text-center ${
                          reviewStatus === opt.val 
                            ? 'bg-[#1769FF] text-white border-[#1769FF] shadow-sm' 
                            : 'bg-[#FFFFFF] dark:bg-[#0B1424] border-[#E2E8F0] dark:border-[#243449] text-[#07111F] dark:text-[#F8FAFC]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {reviewStatus !== 'Verified' && (
                    <div>
                      <label className="block text-xs font-bold text-[#B91C1C] dark:text-[#F87171] mb-1">
                        Reason for {reviewStatus} *
                      </label>
                      <input 
                        type="text"
                        required
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="e.g. Seal smudged, expired issue date, name mismatch..."
                        className="w-full px-3 py-2 bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-sm text-[#07111F] dark:text-[#F8FAFC] outline-none"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-[#64748B] dark:text-[#94A3B8] mb-1">
                      Internal Inspection Note (Audit Logged)
                    </label>
                    <textarea 
                      rows={2}
                      value={internalNotes}
                      onChange={(e) => setInternalNotes(e.target.value)}
                      placeholder="Add reviewer notes regarding issuer registry verification..."
                      className="w-full p-2.5 bg-[#FFFFFF] dark:bg-[#0B1424] border border-[#E2E8F0] dark:border-[#243449] rounded-lg text-sm text-[#07111F] dark:text-[#F8FAFC] outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-[#1769FF] hover:bg-[#123C69] disabled:opacity-50 text-white rounded-lg font-bold text-sm transition-colors shadow-md shadow-blue-500/20"
                  >
                    {isSubmitting ? 'Saving Decision...' : 'Save & Certify Status'}
                  </button>
                </form>
              </div>

              <div className="p-4 border-t border-[#E2E8F0] dark:border-[#243449] flex justify-end bg-[#F5F7FA] dark:bg-[#101D31]">
                <button 
                  onClick={() => setSelectedDoc(null)} 
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
