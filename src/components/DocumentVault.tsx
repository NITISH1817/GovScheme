import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  ScanLine,
  CheckCircle2,
  RefreshCw,
  Trash2,
  Lock,
  FileText,
  AlertTriangle,
  Award,
  Sparkles,
  Check,
  ArrowRight
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
  const { t } = useTranslation();
  const customBezier = [0.32, 0.72, 0, 1];

  // 10 Core Supported Document Types for Rural Welfare Scheme Processing
  const documentTypes: Array<{ type: DocumentRecord['type']; label: string; desc: string }> = [
    { type: 'Aadhaar', label: 'Aadhaar Card', desc: 'Proof of identity, age, and biometric uniqueness' },
    { type: 'PAN', label: 'PAN Card', desc: 'Tax identification and financial verification' },
    { type: 'Income Certificate', label: 'Income Certificate', desc: 'Official annual household income verification' },
    { type: 'Ration Card', label: 'Ration Card', desc: 'Family composition and food subsidy eligibility' },
    { type: 'Voter ID', label: 'Voter ID (EPIC)', desc: 'Electoral identity and constituency residence proof' },
    { type: 'Community Certificate', label: 'Community / Caste Certificate', desc: 'Social reservation and category verification' },
    { type: 'Disability Certificate', label: 'Disability Certificate (UDID)', desc: 'Disability percentage and welfare pension eligibility' },
    { type: 'Residence Certificate', label: 'Residence / Domicile Certificate', desc: 'State domicile for regional welfare schemes' },
    { type: 'Birth Certificate', label: 'Birth Certificate', desc: 'Proof of age and maternal/child benefits eligibility' },
    { type: 'Education Certificate', label: 'Education / Skill Certificate', desc: 'Educational qualifications for scholarships and loans' }
  ];

  const userDocs = user.documents || [];
  const uploadedCount = userDocs.length;
  const verifiedCount = userDocs.filter(
    d => d.status === 'Verified' || d.verificationStatus === 'CHECKS_PASSED'
  ).length;

  // Calculate readiness score out of 100%
  const readinessPercentage = Math.min(Math.round((uploadedCount / 5) * 100), 100);

  // Helper to safely mask sensitive numbers like Aadhaar
  const formatDisplayDocNumber = (doc: DocumentRecord) => {
    const raw = doc.docNumber || doc.ocrExtracted?.docNumber || '';
    if (!raw) return '—';
    if (doc.type === 'Aadhaar' || raw.replace(/\D/g, '').length === 12) {
      const clean = raw.replace(/\D/g, '');
      if (clean.length === 12) {
        return `XXXX XXXX ${clean.slice(8)}`;
      }
    }
    return raw;
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gov-green/10 text-gov-green text-xs font-bold border border-gov-green/20">
            <Lock className="w-4 h-4" /> {t('digilockerVault', 'End-to-End Encrypted Citizen Vault')}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold font-sans tracking-tight text-gov-navy dark:text-white">
            {t('verifiedCitizenVault', 'Intelligent Document Vault')}
          </h1>
          <p className="text-base text-gov-textMuted dark:text-gray-400 max-w-2xl leading-relaxed">
            {t(
              'vaultDesc',
              'Securely store official welfare documents. The AI OCR engine extracts validated data to automatically verify your scheme eligibility and pre-fill official application forms.'
            )}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto">
          <button
            onClick={() => onOpenOCR('Aadhaar')}
            className="group relative overflow-hidden rounded-[2rem] bg-gov-navy dark:bg-white p-2.5 flex items-center justify-between shadow-2xl min-w-[280px]"
          >
            <span className="text-white dark:text-black font-bold text-sm pl-6 pr-4 flex-1 text-left">
              {t('launchOCR', 'Scan Official Document')}
            </span>
            <div className="w-10 h-10 shrink-0 rounded-full bg-white/10 dark:bg-black/10 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
              <ScanLine className="w-5 h-5 text-white dark:text-black" />
            </div>
          </button>

          <button
            onClick={() => onOpenOCR('Unknown')}
            className="group relative overflow-hidden rounded-[2rem] bg-indigo-600 hover:bg-indigo-700 p-2.5 flex items-center justify-between shadow-lg min-w-[280px] transition-colors"
          >
            <span className="text-white font-bold text-sm pl-6 pr-4 flex-1 text-left">
              {t('aiDocAssistant', 'Auto-Detect Any Document')}
            </span>
            <div className="w-10 h-10 shrink-0 rounded-full bg-white/10 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
          </button>
        </div>
      </motion.div>

      {/* Document Readiness Summary Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="p-6 rounded-3xl bg-gradient-to-br from-blue-900/10 via-indigo-900/5 to-slate-900/5 dark:from-blue-950/40 dark:via-indigo-950/20 dark:to-slate-900/40 border border-blue-200 dark:border-blue-900/50 shadow-sm"
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
                Scheme Application Document Readiness: {readinessPercentage}%
              </h2>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Having your Aadhaar, Income Certificate, and Community/Ration Card stored enables instant one-click eligibility matching across 100% of Central and State welfare programmes.
            </p>
            {/* Progress Bar */}
            <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mt-3">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-700"
                style={{ width: `${readinessPercentage}%` }}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6 w-full lg:w-auto">
            <div className="px-5 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500 block">
                Total Documents
              </span>
              <span className="text-2xl font-black text-slate-900 dark:text-white font-sans">
                {uploadedCount} <span className="text-xs font-semibold text-slate-400">/ 10</span>
              </span>
            </div>

            <div className="px-5 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-600 dark:text-emerald-400 block">
                Format Verified
              </span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-sans">
                {verifiedCount}
              </span>
            </div>

            <div className="px-5 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-600 dark:text-amber-400 block">
                Pending Upload
              </span>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400 font-sans">
                {Math.max(0, 10 - uploadedCount)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Documents Grid */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.08 } }
        }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {documentTypes.map(({ type: docType, label, desc }) => {
          const existingDoc = userDocs.find(
            d => d.type === docType || d.documentType === docType
          );

          const isVerified = existingDoc && (
            existingDoc.status === 'Verified' ||
            existingDoc.verificationStatus === 'CHECKS_PASSED'
          );

          return (
            <motion.div
              key={docType}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: customBezier } }
              }}
              className="p-1 rounded-[2rem] bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 shadow-sm hover:shadow-xl transition-shadow duration-500 flex flex-col group"
            >
              <div
                className={`flex-1 rounded-[calc(2rem-0.25rem)] border border-gov-border dark:border-white/10 p-6 flex flex-col justify-between relative overflow-hidden ${
                  existingDoc ? 'bg-white dark:bg-[#0B1220]' : 'bg-slate-50/70 dark:bg-[#050505]'
                }`}
              >
                {/* Glowing orb for verified documents */}
                {existingDoc && (
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                )}

                <div className="space-y-4">
                  {/* Card Title & Status Pill */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-extrabold text-lg text-gov-navy dark:text-white font-sans tracking-tight">
                        {label}
                      </h3>
                      <p className="text-[11px] text-gov-textMuted dark:text-gray-400 mt-0.5">
                        {desc}
                      </p>
                    </div>

                    {existingDoc ? (
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border shadow-sm ${
                          isVerified
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 border-emerald-300 dark:border-emerald-700'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-600 border-amber-300 dark:border-amber-700'
                        }`}
                        title={isVerified ? 'Format Checks Passed' : 'Verification Incomplete'}
                      >
                        {isVerified ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <AlertTriangle className="w-5 h-5" />
                        )}
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/5 text-slate-400 flex items-center justify-center shrink-0 border border-slate-200 dark:border-white/10">
                        <FileText className="w-4 h-4 opacity-40" />
                      </div>
                    )}
                  </div>

                  {/* Document Information / Extracted Metadata */}
                  {existingDoc ? (
                    <div className="space-y-3 pt-2">
                      {/* Document Number Display */}
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                        <span className="text-slate-500 dark:text-gray-400 block text-[10px] uppercase tracking-wider font-bold mb-0.5">
                          {t('docNumber', 'Document Number')}
                        </span>
                        <span className="font-mono font-bold text-xs text-gov-navy dark:text-gray-200 tracking-wider">
                          {formatDisplayDocNumber(existingDoc)}
                        </span>
                      </div>

                      {/* Extracted Metadata Box */}
                      {existingDoc.ocrExtracted && (
                        <div className="p-3 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-[11px] space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider text-[10px]">
                              Extracted Fields
                            </span>
                            {existingDoc.ocrExtracted.confidenceScore !== undefined && (
                              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                                {existingDoc.ocrExtracted.confidenceScore}% Confidence
                              </span>
                            )}
                          </div>

                          {existingDoc.ocrExtracted.fullName && (
                            <p className="text-slate-700 dark:text-slate-300">
                              Name: <strong className="text-slate-900 dark:text-white">{existingDoc.ocrExtracted.fullName}</strong>
                            </p>
                          )}

                          {existingDoc.ocrExtracted.annualIncome !== undefined && (
                            <p className="text-slate-700 dark:text-slate-300">
                              Income: <strong className="text-slate-900 dark:text-white">₹{Number(existingDoc.ocrExtracted.annualIncome).toLocaleString('en-IN')}</strong>
                            </p>
                          )}

                          {existingDoc.ocrExtracted.dob && (
                            <p className="text-slate-700 dark:text-slate-300">
                              DOB: <strong className="text-slate-900 dark:text-white">{existingDoc.ocrExtracted.dob}</strong>
                            </p>
                          )}

                          {existingDoc.ocrExtracted.category && (
                            <p className="text-slate-700 dark:text-slate-300">
                              Category: <strong className="text-slate-900 dark:text-white">{existingDoc.ocrExtracted.category}</strong>
                            </p>
                          )}

                          {existingDoc.ocrExtracted.disabilityPercentage !== undefined && (
                            <p className="text-slate-700 dark:text-slate-300">
                              Disability: <strong className="text-slate-900 dark:text-white">{existingDoc.ocrExtracted.disabilityPercentage}%</strong>
                            </p>
                          )}

                          {existingDoc.ocrExtracted.state && (
                            <p className="text-slate-700 dark:text-slate-300">
                              State: <strong className="text-slate-900 dark:text-white">{existingDoc.ocrExtracted.state}</strong>
                            </p>
                          )}

                          <div className="pt-1 text-[9px] text-slate-500 border-t border-blue-100 dark:border-blue-900/30">
                            Format verified • Authenticity unverified (no issuer API)
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      Upload or scan this document to unlock schemes requiring {label} verification and auto-fill applications.
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-5 mt-auto">
                  {existingDoc ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenOCR(docType)}
                        className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-gov-navy dark:text-white font-bold text-xs transition flex items-center justify-center gap-2"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Rescan</span>
                      </button>
                      <button
                        onClick={() => onDeleteDoc(existingDoc.id || existingDoc.documentId || existingDoc._id || '')}
                        className="w-10 h-10 rounded-xl border border-red-200 dark:border-red-900/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center justify-center transition-colors shrink-0"
                        title="Delete Document from Vault"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onOpenOCR(docType)}
                      className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-blue-700 dark:text-blue-300 font-bold text-xs shadow-sm hover:shadow transition flex items-center justify-between"
                    >
                      <span>Scan with AI OCR</span>
                      <ScanLine className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};
