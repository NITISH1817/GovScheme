import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  ScanLine,
  CheckCircle2,
  RefreshCw,
  Trash2,
  Lock,
  Eye,
  Edit3,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { UserProfile, DocumentRecord } from '../types';
import {
  getCitizenDocuments,
  deleteCitizenDocument,
  verifyCitizenDocument,
  reprocessDocumentOCR
} from '../services/documentService';

interface DocumentVaultProps {
  user: UserProfile;
  onOpenOCR: (expectedType: string) => void;
  onDeleteDoc?: (docId: string) => void;
}

const DOCUMENT_CATEGORIES = [
  { id: 'aadhaar', label: 'Aadhaar Card' },
  { id: 'pan', label: 'PAN Card' },
  { id: 'ration_card', label: 'Ration Card / Smart Card' },
  { id: 'income_certificate', label: 'Income Certificate' },
  { id: 'community_certificate', label: 'Community Certificate' },
  { id: 'first_graduate', label: 'First Graduate Certificate' },
  { id: 'residence_certificate', label: 'Residence / Nativity Certificate' },
  { id: 'birth_certificate', label: 'Birth Certificate' },
  { id: 'disability_certificate', label: 'Disability Certificate (UDID)' },
  { id: 'farmer_certificate', label: 'Farmer / Patta Chitta' }
];

export const DocumentVault: React.FC<DocumentVaultProps> = ({
  user,
  onOpenOCR,
  onDeleteDoc
}) => {
  const { t } = useTranslation();
  const [userDocs, setUserDocs] = useState<DocumentRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [selectedDocDetails, setSelectedDocDetails] = useState<DocumentRecord | null>(null);
  const [isVerifyingId, setIsVerifyingId] = useState<string | null>(null);

  const customBezier = [0.32, 0.72, 0, 1];

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const docs = await getCitizenDocuments();
      setUserDocs(docs);
    } catch (err) {
      console.warn('Could not fetch backend documents, using user prop documents:', err);
      // Fallback to user.documents
      if (user.documents) {
        setUserDocs(
          user.documents.map((d) => ({
            documentId: d.documentId || d.id || `doc-${Date.now()}`,
            documentType: (d.documentType || d.type || 'aadhaar').toLowerCase().replace(/\s+/g, '_'),
            originalFileName: d.originalFileName || `${d.type || 'document'}.pdf`,
            fileUrl: d.fileUrl || '',
            ocrStatus: 'COMPLETED',
            extractedFields: d.extractedFields || d.ocrExtracted || {},
            correctedFields: d.correctedFields || {},
            verificationStatus: ((d.verificationStatus || (d.status === 'Verified' ? 'CHECKS_PASSED' : 'PENDING'))) as any,
            uploadedAt: d.uploadedAt || new Date().toISOString()
          }))
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDelete = async (docId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this document?')) return;
    try {
      await deleteCitizenDocument(docId);
      setUserDocs((prev) => prev.filter((d) => d.documentId !== docId));
      setActionMessage('Document deleted successfully.');
      if (onDeleteDoc) onDeleteDoc(docId);
    } catch (err) {
      console.error('Delete document failed:', err);
      setActionMessage('Failed to delete document.');
    }
  };

  const handleVerify = async (docId: string) => {
    setIsVerifyingId(docId);
    try {
      const res = await verifyCitizenDocument(docId);
      setUserDocs((prev) =>
        prev.map((d) => (d.documentId === docId ? res.document : d))
      );
      setActionMessage(`Verification check completed: ${res.verificationStatus}`);
    } catch (err) {
      console.error('Verification failed:', err);
      setActionMessage('Verification check encountered an error.');
    } finally {
      setIsVerifyingId(null);
    }
  };

  const handleReprocess = async (docId: string) => {
    try {
      const reprocessed = await reprocessDocumentOCR(docId);
      setUserDocs((prev) =>
        prev.map((d) => (d.documentId === docId ? reprocessed : d))
      );
      setActionMessage('OCR reprocessed successfully.');
    } catch (err) {
      console.error('Reprocessing failed:', err);
      setActionMessage('Failed to reprocess OCR.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-32 space-y-12">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: customBezier }}
        className="flex flex-col md:flex-row items-center justify-between gap-8 text-center sm:text-left"
      >
        <div className="space-y-4 relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-600/20">
            <Lock className="w-4 h-4" /> End-to-End Encrypted Document Isolation
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Document Management Dashboard
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl">
            Each uploaded proof maintains a strictly isolated ID, preserves raw OCR text separately from your manual corrections, and undergoes honest authenticity validation.
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full md:w-auto">
          <button
            onClick={() => onOpenOCR('aadhaar')}
            className="group relative overflow-hidden rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white p-3 flex items-center justify-between shadow-xl min-w-[260px] transition-all"
          >
            <span className="font-bold text-sm pl-4 pr-3 flex-1 text-left">
              Upload & Scan Document
            </span>
            <div className="w-10 h-10 shrink-0 rounded-xl bg-white/10 flex items-center justify-center">
              <ScanLine className="w-5 h-5 text-white" />
            </div>
          </button>
        </div>
      </motion.div>

      {/* Action Notification */}
      {actionMessage && (
        <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-medium flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-xs text-slate-500 hover:text-slate-700">Dismiss</button>
        </div>
      )}

      {/* Documents Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Your Uploaded Documents ({userDocs.length})
          </h2>
          <button
            onClick={fetchDocuments}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>

        {userDocs.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-4">
            <FileText className="w-16 h-16 mx-auto text-slate-400 opacity-60" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No documents uploaded yet</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Upload your Aadhaar card, Ration card, or Income certificate to unlock tailored government scheme recommendations.
            </p>
            <button
              onClick={() => onOpenOCR('aadhaar')}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm inline-flex items-center gap-2"
            >
              <ScanLine className="w-4 h-4" /> Start First Scan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userDocs.map((doc) => {
              const docTypeLabel =
                DOCUMENT_CATEGORIES.find((c) => c.id === doc.documentType)?.label ||
                doc.documentType.replace('_', ' ').toUpperCase();

              const primaryName =
                doc.correctedFields?.fullName || doc.extractedFields?.fullName || 'Not extracted';
              const docNum =
                doc.correctedFields?.docNumber || doc.extractedFields?.docNumber || 'Unreadable';
              const income =
                doc.correctedFields?.annualIncome || doc.extractedFields?.annualIncome;

              return (
                <div
                  key={doc.documentId}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                          {doc.documentId}
                        </span>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white mt-1">
                          {docTypeLabel}
                        </h3>
                        <p className="text-xs text-slate-500">
                          Uploaded: {new Date(doc.uploadedAt || doc.createdAt || Date.now()).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1.5">
                        {/* Verification Status */}
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          doc.verificationStatus === 'CHECKS_PASSED' || doc.verificationStatus === 'OFFICIALLY_VERIFIED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : doc.verificationStatus === 'NEEDS_REVIEW'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {doc.verificationStatus}
                        </span>

                        {/* OCR Status */}
                        <span className="text-[10px] text-slate-400 font-mono">
                          OCR: {doc.ocrStatus}
                        </span>
                      </div>
                    </div>

                    {/* Metadata Card */}
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                      <div>
                        <span className="text-slate-500 font-medium">Citizen Name: </span>
                        <strong className="text-slate-800 dark:text-slate-200">{primaryName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Identifier / Doc #: </span>
                        <strong className="font-mono text-slate-800 dark:text-slate-200">{docNum}</strong>
                      </div>
                      {income && (
                        <div>
                          <span className="text-slate-500 font-medium">Annual Income: </span>
                          <strong className="text-slate-800 dark:text-slate-200">₹{Number(income).toLocaleString('en-IN')}</strong>
                        </div>
                      )}
                      <div className="text-[11px] text-slate-400 pt-1">
                        Correction Status: {doc.isUserConfirmed ? 'Confirmed by user' : 'Pending user confirmation'}
                      </div>
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => onOpenOCR(doc.documentType)}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      title="Edit corrections or view document"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Review / Edit
                    </button>

                    <button
                      onClick={() => handleVerify(doc.documentId)}
                      disabled={isVerifyingId === doc.documentId}
                      className="py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                      title="Run authenticity check"
                    >
                      <ShieldCheck className={`w-3.5 h-3.5 ${isVerifyingId === doc.documentId ? 'animate-spin' : ''}`} />
                      Verify
                    </button>

                    <button
                      onClick={() => handleReprocess(doc.documentId)}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Reprocess OCR"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDelete(doc.documentId)}
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Delete Document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
export default DocumentVault;
