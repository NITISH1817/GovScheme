import React from 'react';
import {
  ShieldCheck,
  ScanLine,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Trash2,
  Download,
  RefreshCw,
  Plus,
  Eye,
  Building2
} from 'lucide-react';
import { UserProfile, DocumentRecord } from '../types';

interface DocumentVaultProps {
  user: UserProfile;
  onOpenOCR: (expectedType: DocumentRecord['type']) => void;
  onDeleteDoc: (docId: string) => void;
}

export const DocumentVault: React.FC<DocumentVaultProps> = ({
  user,
  onOpenOCR,
  onDeleteDoc
}) => {
  const documentTypes: DocumentRecord['type'][] = [
    'Aadhaar',
    'PAN',
    'Income Certificate',
    'Community Certificate',
    'Bank Passbook',
    'Ration Card',
    'Education Certificate'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-800 border-l-4 border-gov-navy shadow-sm rounded-md p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-200 dark:border-slate-700">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-600">
            <ShieldCheck className="w-4 h-4 text-gov-navy dark:text-blue-400" /> Official DigiLocker-Style Vault
          </div>
          <h1 className="text-3xl font-bold font-heading tracking-tight text-slate-900 dark:text-white">Verified Citizen Document Vault</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Securely store official welfare documents. The Rule Engine automatically uses these to verify scheme eligibility.
          </p>
        </div>

        <button
          onClick={() => onOpenOCR('Aadhaar')}
          className="px-6 py-3 rounded-md bg-gov-navy hover:bg-gov-blue text-white font-bold text-sm shadow-sm transition flex items-center gap-2"
        >
          <ScanLine className="w-4 h-4" />
          <span>Launch AI OCR Scanner</span>
        </button>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {documentTypes.map((docType) => {
          const existingDoc = user.documents.find(d => d.type === docType);

          return (
            <div
              key={docType}
              className={`gov-card p-6 flex flex-col justify-between space-y-4 ${existingDoc ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-slate-300 dark:border-l-slate-700'
                }`}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <span className="font-extrabold text-slate-900 dark:text-white font-heading text-base">
                    {docType}
                  </span>
                  {existingDoc ? (
                    <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {existingDoc.status}
                    </span>
                  ) : (
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold text-[10px] px-2 py-0.5 rounded-full">
                      Not Uploaded
                    </span>
                  )}
                </div>

                {existingDoc ? (
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Document Number</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{existingDoc.docNumber}</span>
                    </div>

                    {existingDoc.ocrExtracted && (
                      <div className="p-2.5 rounded-lg bg-blue-50/50 dark:bg-slate-900/80 border border-blue-100 dark:border-slate-800 text-[11px] space-y-1">
                        <span className="font-bold text-blue-900 dark:text-blue-300 block">OCR Extracted Metadata</span>
                        {existingDoc.ocrExtracted.fullName && <p>Name: <strong>{existingDoc.ocrExtracted.fullName}</strong></p>}
                        {existingDoc.ocrExtracted.annualIncome && <p>Income: <strong>₹{existingDoc.ocrExtracted.annualIncome.toLocaleString('en-IN')}</strong></p>}
                        <p className="text-[10px] text-slate-500">Confidence: {existingDoc.ocrExtracted.confidenceScore}%</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Upload or scan this document to unlock schemes requiring {docType} verification.
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                {existingDoc ? (
                  <>
                    <button
                      onClick={() => onOpenOCR(docType)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs transition flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" /> Replace / Rescan
                    </button>
                    <button
                      onClick={() => onDeleteDoc(existingDoc.id)}
                      className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition"
                      title="Delete Document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => onOpenOCR(docType)}
                    className="w-full py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5"
                  >
                    <ScanLine className="w-4 h-4" />
                    <span>Scan with AI OCR</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
