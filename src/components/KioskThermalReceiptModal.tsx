import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Copy,
  Check,
  RotateCcw
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UserProfile, Scheme } from '../types';
import {
  generateAssessment,
  generateThermalReceiptText,
  CitizenAssessmentResult
} from '../services/assessmentService';

interface KioskThermalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Partial<UserProfile>;
  schemes: Scheme[];
}

export const KioskThermalReceiptModal: React.FC<KioskThermalReceiptModalProps> = ({
  isOpen,
  onClose,
  profile,
  schemes
}) => {
  const { t } = useTranslation();
  const [paperWidth, setPaperWidth] = useState<'80mm' | '58mm'>('80mm');
  const [copied, setCopied] = useState(false);
  const [printStatus, setPrintStatus] = useState<string | null>(null);

  // Normalize full UserProfile object from partial kiosk data
  const normalizedUser: UserProfile = useMemo(() => {
    return {
      id: profile.id || `kiosk-${Date.now()}`,
      fullName: profile.fullName || 'Citizen Beneficiary',
      mobile: profile.mobile || '',
      email: profile.email || '',
      age: profile.age ?? 0,
      gender: profile.gender || ('' as any),
      maritalStatus: profile.maritalStatus || '',
      state: profile.state || 'All India',
      district: profile.district || '',
      category: profile.category || ('' as any),
      occupation: profile.occupation || 'Farmer',
      annualIncome: profile.annualIncome ?? 0,
      landHoldingAcres: profile.landHoldingAcres || 0,
      educationLevel: profile.educationLevel || '',
      familyMembersCount: profile.familyMembersCount || 1,
      hasDisability: Boolean(profile.hasDisability),
      disabilityPercentage: profile.disabilityPercentage || 0,
      isRegisteredWorker: Boolean(profile.isRegisteredWorker),
      verificationBadge: true,
      interests: [],
      savedSchemeIds: profile.savedSchemeIds || [],
      documents: profile.documents || [],
      role: 'citizen',
      profileCompletionScore: 85
    };
  }, [profile]);

  const assessment: CitizenAssessmentResult = useMemo(() => {
    return generateAssessment(normalizedUser, schemes);
  }, [normalizedUser, schemes]);

  const receiptText: string = useMemo(() => {
    return generateThermalReceiptText(assessment, paperWidth);
  }, [assessment, paperWidth]);

  if (!isOpen) return null;

  const handlePrint = () => {
    try {
      setPrintStatus('Opening system print dialog for thermal receipt...');

      // Inject temporary print style for exact 58mm/80mm thermal roll printing
      const styleId = 'thermal-print-styles';
      let styleEl = document.getElementById(styleId);
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
      }

      const widthVal = paperWidth === '58mm' ? '58mm' : '80mm';
      styleEl.innerHTML = `
        @media print {
          @page {
            size: ${widthVal} auto;
            margin: 2mm;
          }
          body * {
            visibility: hidden !important;
          }
          #thermal-receipt-printable, #thermal-receipt-printable * {
            visibility: visible !important;
          }
          #thermal-receipt-printable {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: ${widthVal} !important;
            margin: 0 !important;
            padding: 2mm !important;
            font-size: ${paperWidth === '58mm' ? '9px' : '11px'} !important;
            line-height: 1.25 !important;
            color: black !important;
            background: white !important;
          }
        }
      `;

      window.print();

      setTimeout(() => {
        setPrintStatus('Receipt sent to printer spooler. Please collect printed receipt from dispenser slot.');
      }, 1000);
    } catch (err) {
      console.error('Thermal print error:', err);
      setPrintStatus('Notice: Hardware printer communication failed. You can copy or download the text receipt below.');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(receiptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const element = document.createElement('a');
    const file = new Blob([receiptText], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `GovScheme_Receipt_${assessment.assessmentId}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-[#0B1424] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-xl w-full my-4 flex flex-col max-h-[92vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-[#12365B] text-white p-5 sm:p-6 relative shrink-0">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-slate-300 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition"
              aria-label="Close receipt modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1.5">
              <Printer className="w-5 h-5 text-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-200">
                CSC KIOSK THERMAL PRINTER DISPENSER
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-heading tracking-tight">
              Citizen Scheme Assessment Receipt
            </h2>
            <p className="text-xs text-blue-100/80 mt-0.5">
              Ref: {assessment.assessmentId} • Direct POS ESC/P Thermal Output
            </p>
          </div>

          {/* Width Selection Bar */}
          <div className="p-4 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Select Thermal Paper Width:
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPaperWidth('80mm')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                  paperWidth === '80mm'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                }`}
              >
                80 mm (Standard POS)
              </button>
              <button
                type="button"
                onClick={() => setPaperWidth('58mm')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                  paperWidth === '58mm'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                }`}
              >
                58 mm (Compact)
              </button>
            </div>
          </div>

          {/* Status Alert if triggered */}
          {printStatus && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border-b border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{printStatus}</span>
            </div>
          )}

          {/* Scrollable Receipt Monospace Body */}
          <div className="p-5 overflow-y-auto flex-1 bg-slate-50 dark:bg-slate-950 flex justify-center">
            <div
              id="thermal-receipt-printable"
              className={`bg-white text-black p-4 font-mono shadow-md border border-slate-300 rounded-sm text-xs leading-relaxed select-text whitespace-pre overflow-x-auto ${
                paperWidth === '58mm' ? 'max-w-[280px] text-[10px]' : 'max-w-[360px] text-[11px]'
              }`}
            >
              {receiptText}
            </div>
          </div>

          {/* Footer Controls */}
          <div className="p-4 bg-white dark:bg-[#0B1424] border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Text'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadTxt}
                className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>Save .txt</span>
              </button>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handlePrint}
                className="px-6 py-2.5 rounded-xl bg-[#16A34A] hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Thermal Receipt ({paperWidth})</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-xs transition"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
