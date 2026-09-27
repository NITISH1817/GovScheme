import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  ScanLine,
  CheckCircle2,
  RefreshCw,
  Trash2,
  Lock
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
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-32 space-y-16">
      
      {/* Header (Double-Bezel) */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: customBezier }}
        className="flex flex-col md:flex-row items-center justify-between gap-8 text-center sm:text-left"
      >
        <div className="space-y-4 relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gov-green/10 text-gov-green text-xs font-bold border border-gov-green/20">
            <Lock className="w-4 h-4" /> {t('digilockerVault', 'End-to-End Encrypted Vault')}
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold font-sans tracking-tight text-gov-navy dark:text-white">
            {t('verifiedCitizenVault', 'Document Vault')}
          </h1>
          <p className="text-lg text-gov-textMuted dark:text-gray-400 max-w-xl">
            {t('vaultDesc', 'Securely store official welfare documents. The AI engine automatically uses these to verify your scheme eligibility.')}
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full md:w-auto">
          <button
            onClick={() => onOpenOCR('Aadhaar')}
            className="group relative overflow-hidden rounded-[2rem] bg-gov-navy dark:bg-white p-2 flex items-center justify-between shadow-2xl min-w-[280px]"
          >
            <span className="text-white dark:text-black font-bold text-sm pl-6 pr-4 flex-1 text-left">
              {t('launchOCR', 'Scan New Document')}
            </span>
            <div className="w-12 h-12 shrink-0 rounded-full bg-white/10 dark:bg-black/10 flex items-center justify-center transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:bg-white/20 dark:group-hover:bg-black/20 group-hover:scale-105">
              <ScanLine className="w-5 h-5 text-white dark:text-black group-hover:scale-110 transition-transform" />
            </div>
          </button>
          <button
            onClick={() => onOpenOCR('Unknown' as any)}
            className="group relative overflow-hidden rounded-[2rem] bg-purple-600 p-2 flex items-center justify-between shadow-lg min-w-[280px]"
          >
            <span className="text-white font-bold text-sm pl-6 pr-4 flex-1 text-left">
              {t('aiDocAssistant', 'AI Document Assistant (Auto-Detect)')}
            </span>
            <div className="w-12 h-12 shrink-0 rounded-full bg-white/10 flex items-center justify-center transition-transform duration-700 group-hover:bg-white/20 group-hover:scale-105">
              <ShieldCheck className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
            </div>
          </button>
        </div>
      </motion.div>

      {/* Documents Grid (Asymmetrical Bento-like layout) */}
      <motion.div 
        initial="hidden"
        animate="show"
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {documentTypes.map((docType) => {
          const existingDoc = user.documents.find(d => d.type === docType);

          return (
            <motion.div
              key={docType}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: customBezier } }
              }}
              className="p-1.5 rounded-[2rem] bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 shadow-sm hover:shadow-xl transition-shadow duration-500 flex flex-col group"
            >
              <div className={`bg-white dark:bg-[#0B1220] flex-1 rounded-[calc(2rem-0.375rem)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] border border-gov-border dark:border-white/10 overflow-hidden relative ${existingDoc ? '' : 'bg-slate-50 dark:bg-[#050505]'}`}>
                
                {/* Decorative glowing orb if verified */}
                {existingDoc && (
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-gov-green/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                )}

                <div className="p-8 flex flex-col h-full justify-between">
                  <div className="space-y-6">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-extrabold text-xl text-gov-navy dark:text-white font-sans tracking-tight">
                        {t(docType, docType)}
                      </h3>
                      {existingDoc ? (
                        <div className="w-10 h-10 rounded-full bg-gov-green/10 text-gov-green flex items-center justify-center shrink-0 border border-gov-green/20 shadow-sm">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 text-gov-textMuted dark:text-gray-500 flex items-center justify-center shrink-0 border border-gov-border dark:border-white/10">
                          <ShieldCheck className="w-5 h-5 opacity-50" />
                        </div>
                      )}
                    </div>

                    {existingDoc ? (
                      <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#111827] border border-gov-border dark:border-white/10">
                          <span className="text-gov-textMuted dark:text-gray-400 block text-[10px] uppercase tracking-wider font-bold mb-1">{t('docNumber', 'Document Number')}</span>
                          <span className="font-mono font-bold text-gov-navy dark:text-gray-200">{existingDoc.docNumber}</span>
                        </div>

                        {existingDoc.ocrExtracted && (
                          <div className="p-4 rounded-2xl bg-gov-blue/5 dark:bg-gov-blue/10 border border-gov-blue/10 dark:border-gov-blue/20 text-xs space-y-2">
                            <span className="font-bold text-gov-blue block uppercase tracking-wider text-[10px]">{t('ocrMetadata', 'Verified OCR Metadata')}</span>
                            {existingDoc.ocrExtracted.fullName && <p className="text-gov-navy dark:text-gray-300">{t('name', 'Name')}: <strong className="text-gov-navy dark:text-white">{existingDoc.ocrExtracted.fullName}</strong></p>}
                            {existingDoc.ocrExtracted.annualIncome && <p className="text-gov-navy dark:text-gray-300">{t('income', 'Income')}: <strong className="text-gov-navy dark:text-white">₹{existingDoc.ocrExtracted.annualIncome.toLocaleString('en-IN')}</strong></p>}
                            {existingDoc.ocrExtracted.expiryDate && (
                              <p className={`font-bold ${new Date(existingDoc.ocrExtracted.expiryDate) < new Date() ? 'text-red-500' : 'text-gov-green'}`}>
                                {t('validUntil', 'Valid until')}: {new Date(existingDoc.ocrExtracted.expiryDate).toLocaleDateString()}
                                {new Date(existingDoc.ocrExtracted.expiryDate) < new Date() && <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-[10px]">Expired</span>}
                              </p>
                            )}
                            <p className="text-[10px] text-gov-textMuted dark:text-gray-500 font-bold">{t('confidence', 'Confidence')}: {existingDoc.ocrExtracted.confidenceScore}%</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gov-textMuted dark:text-gray-400 font-medium">
                        {t('uploadOrScan', 'Scan this document to unlock restricted schemes requiring {t(docType, docType)} verification.').replace('{t(docType, docType)}', docType)}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-8 mt-auto">
                    {existingDoc ? (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onOpenOCR(docType)}
                          className="flex-1 py-3 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-gov-navy dark:text-white font-bold text-xs transition flex items-center justify-center gap-2"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />{t('replaceRescan', 'Rescan')}
                        </button>
                        <button
                          onClick={() => onDeleteDoc(existingDoc.id)}
                          className="w-12 h-12 rounded-full border border-red-200 dark:border-red-900/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center justify-center transition-colors shrink-0"
                          title="Delete Document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => onOpenOCR(docType)}
                        className="w-full group/btn relative overflow-hidden rounded-full bg-white dark:bg-[#111827] border border-gov-border dark:border-white/10 p-1.5 flex items-center justify-between shadow-sm hover:shadow-md transition-all"
                      >
                        <span className="text-gov-navy dark:text-white font-bold text-xs pl-4 pr-3 flex-1 text-center">
                          {t('scanWithOCR', 'Scan Document')}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-gov-background dark:bg-white/5 flex items-center justify-center transition-transform group-hover/btn:scale-105">
                          <ScanLine className="w-3.5 h-3.5 text-gov-navy dark:text-white" />
                        </div>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};
