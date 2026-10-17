import React, { useState, useEffect, useRef } from 'react';
import {
  Printer,
  RotateCcw,
  Scissors,
  ArrowDown,
  Volume2,
  VolumeX,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Download,
  Info,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FileText,
  Building2,
  Award,
  QrCode
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useTranslation } from 'react-i18next';
import { UserProfile, Scheme } from '../types';

export interface CitizenReportData {
  reportId: string;
  generatedDate: string;
  citizenName: string;
  age: number;
  gender: string;
  state: string;
  district?: string;
  occupation: string;
  annualIncome?: number;
  socialCategory?: string;
  studentStatus?: string;
  farmerStatus?: string;
  disabilityStatus?: string;
  uploadedDocumentsCount: number;
  ocrCompletedCount: number;
  needsReviewCount: number;
  verificationOutcome: string;
  documents: Array<{
    documentId: string;
    documentType: string;
    ocrStatus: string;
    verificationStatus: string;
    maskedIdentifier: string;
  }>;
  recommendedSchemes: Array<{
    schemeId: string;
    schemeName: string;
    category: string;
    benefitSummary: string;
    matchStatus: string;
    officialWebsite?: string;
    requiredDocuments: string[];
  }>;
  missingDocumentsChecklist: string[];
  isComplete: boolean;
  isPreview?: boolean;
  missingSteps: string[];
}

interface ThermalReceiptPrinterProps {
  reportData: CitizenReportData;
  onReprint?: () => void;
  onRegenerateReport?: () => void;
  autoStartPrint?: boolean;
}

export const ThermalReceiptPrinter: React.FC<ThermalReceiptPrinterProps> = ({
  reportData,
  onReprint,
  onRegenerateReport,
  autoStartPrint = false
}) => {
  const { t, i18n } = useTranslation();

  // Animation states
  const [paperProgress, setPaperProgress] = useState<number>(0); // 0 to 100%
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [hasGenerated, setHasGenerated] = useState<boolean>(Boolean(autoStartPrint));
  const [isTorn, setIsTorn] = useState<boolean>(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(false);
  const [feedOffset, setFeedOffset] = useState<number>(0);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);

  // Audio synthesis ref
  const audioContextRef = useRef<AudioContext | null>(null);
  const printTimerRef = useRef<any>(null);
  const receiptContentRef = useRef<HTMLDivElement | null>(null);

  // Check reduced motion preference
  const isReducedMotionPreferred = () => {
    if (typeof window === 'undefined') return false;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const hasClass = document.documentElement.classList.contains('reduced-motion');
    return Boolean(mediaQuery?.matches || hasClass);
  };

  // Play thermal mechanical buzz/chirp sound
  const playMechanicalSound = (frequency = 600, duration = 0.08) => {
    if (!isAudioEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(frequency * 0.4, ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio policy catch
    }
  };

  // Play cutter sound on tear
  const playCutterSound = () => {
    if (!isAudioEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioContextRef.current) audioContextRef.current = new AudioCtx();
      if (audioContextRef.current.state === 'suspended') audioContextRef.current.resume();

      const ctx = audioContextRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // Ignore
    }
  };

  // Start smooth print animation
  const startPrint = () => {
    if (printTimerRef.current) {
      clearInterval(printTimerRef.current);
      printTimerRef.current = null;
    }

    setHasGenerated(true);
    setIsPrinting(true);
    setIsTorn(false);
    setFeedOffset(0);

    // If reduced motion is preferred, jump straight to fully printed
    if (isReducedMotionPreferred()) {
      setPaperProgress(100);
      setIsPrinting(false);
      return;
    }

    setPaperProgress(0);
    let progress = 0;

    printTimerRef.current = setInterval(() => {
      progress += 2.0;
      if (progress >= 100) {
        setPaperProgress(100);
        setIsPrinting(false);
        if (printTimerRef.current) {
          clearInterval(printTimerRef.current);
          printTimerRef.current = null;
        }
      } else {
        setPaperProgress(Math.floor(progress));
        if (Math.floor(progress) % 10 === 0) {
          playMechanicalSound(480 + Math.random() * 180, 0.04);
        }
      }
    }, 40);
  };

  // Explicit trigger to generate assessment report and start animation
  const handleGenerateAssessment = () => {
    setHasGenerated(true);
    startPrint();
  };

  // Print only when autoStartPrint is explicitly enabled or reportId updates while active
  useEffect(() => {
    if (autoStartPrint) {
      setHasGenerated(true);
      startPrint();
    }

    return () => {
      if (printTimerRef.current) clearInterval(printTimerRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [reportData.reportId, autoStartPrint]);

  // Feed button: advances receipt downward
  const handleFeed = () => {
    if (isPrinting) return;
    setFeedOffset(prev => prev + 45);
    playMechanicalSound(340, 0.05);
  };

  // Direct jsPDF fallback that guarantees an A4 PDF output
  const fallbackDownloadA4Pdf = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4' // 210 x 297 mm
      });

      const pageWidth = 210;
      let y = 16;

      // Header Banner
      doc.setFillColor(18, 60, 105);
      doc.rect(14, y, pageWidth - 28, 20, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.text('GOVERNMENT OF INDIA • WELFARE ELIGIBILITY CERTIFICATE', pageWidth / 2, y + 8, { align: 'center' });
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.text('CSC DIGITAL SEVA • OFFICIAL CITIZEN WELFARE ASSESSMENT (A4)', pageWidth / 2, y + 15, { align: 'center' });

      y += 26;

      // Report Meta
      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text(`Report ID: ${reportData.reportId}`, 16, y);
      doc.text(`Date of Issue: ${reportData.generatedDate}`, pageWidth - 16, y, { align: 'right' });
      y += 5;

      doc.setDrawColor(203, 213, 225);
      doc.line(14, y, pageWidth - 14, y);
      y += 7;

      // Beneficiary Demographic Profile
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('BENEFICIARY DEMOGRAPHIC PROFILE', 16, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const addRow = (label: string, val: string) => {
        doc.text(label, 16, y);
        doc.setFont('helvetica', 'bold');
        doc.text(val, 80, y);
        doc.setFont('helvetica', 'normal');
        y += 5;
      };

      addRow('Full Name:', reportData.citizenName);
      addRow('Age / Gender:', `${reportData.age} Years / ${reportData.gender}`);
      addRow('State / District:', `${reportData.state}${reportData.district ? ` (${reportData.district})` : ''}`);
      addRow('Occupation:', reportData.occupation);
      if (reportData.annualIncome !== undefined) {
        addRow('Annual Household Income:', `Rs. ${reportData.annualIncome.toLocaleString('en-IN')}`);
      }
      addRow('Social Category:', reportData.socialCategory || 'General');
      addRow('Verification Status:', reportData.verificationOutcome);
      addRow('Vault Document Proofs:', `${reportData.uploadedDocumentsCount} uploaded, ${reportData.ocrCompletedCount} verified`);

      y += 3;
      doc.line(14, y, pageWidth - 14, y);
      y += 7;

      // Recommended Schemes
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(`RECOMMENDED GOVERNMENT SCHEMES (${reportData.recommendedSchemes.length})`, 16, y);
      y += 6;

      if (reportData.recommendedSchemes.length === 0) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.text('No matching schemes identified at this time.', 16, y);
        y += 6;
      } else {
        reportData.recommendedSchemes.slice(0, 5).forEach((sch, i) => {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9.5);
          const title = `${i + 1}. ${sch.schemeName} [${sch.category}]`;
          doc.text(title, 16, y);
          y += 4.5;

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          const ben = `Benefit: ${sch.benefitSummary}`;
          const splitBen = doc.splitTextToSize(ben, pageWidth - 32);
          doc.text(splitBen, 16, y);
          y += (splitBen.length * 3.8);

          if (sch.officialWebsite) {
            doc.setTextColor(23, 105, 255);
            doc.text(`Official Portal: ${sch.officialWebsite}`, 16, y);
            doc.setTextColor(30, 41, 59);
            y += 4;
          }
          y += 2;
        });
      }

      // Mandatory Next Steps
      if (reportData.missingSteps.length > 0 || reportData.missingDocumentsChecklist.length > 0) {
        y += 2;
        doc.line(14, y, pageWidth - 14, y);
        y += 6;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.text('MANDATORY REQUIREMENTS & NEXT STEPS', 16, y);
        y += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);

        reportData.missingSteps.forEach(step => {
          doc.text(`* ${step}`, 16, y);
          y += 4;
        });
        reportData.missingDocumentsChecklist.forEach(docName => {
          doc.text(`* Present verified original ${docName}`, 16, y);
          y += 4;
        });
      }

      // Footer Disclaimer
      y = Math.max(y + 6, 264);
      doc.setDrawColor(203, 213, 225);
      doc.line(14, y, pageWidth - 14, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      const disclaimer = 'Notice: Official advisory eligibility certificate. Final sanction and DBT disbursement remain subject to government departmental verification.';
      doc.text(disclaimer, pageWidth / 2, y, { align: 'center' });
      y += 4;
      doc.setFont('helvetica', 'bold');
      doc.text(`*${reportData.reportId}* • CSC DIGITAL SEVA ADVISORY REPORT`, pageWidth / 2, y, { align: 'center' });

      doc.save(`GovScheme_A4_Eligibility_Report_${reportData.reportId || 'Assessment'}.pdf`);
    } catch (err) {
      console.error('Fallback PDF generation error:', err);
      window.print();
    }
  };

  // Helper to generate and download authentic A4 PDF sheet (with full multi-language Unicode rendering via html2canvas)
  const downloadReceipt = async () => {
    setIsDownloadingPdf(true);
    try {
      const a4Element = document.getElementById('formal-a4-pdf-document');
      if (a4Element) {
        // High-resolution canvas capture of the localized A4 template
        const canvas = await html2canvas(a4Element, {
          scale: 2, // 2x for high resolution 300dpi clarity
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4' // Standard A4: 210mm x 297mm
        });

        const pdfWidth = 210;
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        if (pdfHeight <= 297) {
          pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        } else {
          let heightLeft = pdfHeight;
          let position = 0;
          pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, Math.min(297, pdfHeight));
          heightLeft -= 297;
          while (heightLeft > 5) {
            position -= 297;
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight);
            heightLeft -= 297;
          }
        }

        pdf.save(`GovScheme_A4_Eligibility_Report_${reportData.reportId || 'Assessment'}.pdf`);
        setIsDownloadingPdf(false);
        return;
      }
    } catch (err) {
      console.error('Error generating A4 PDF via html2canvas, trying fallback:', err);
    }

    fallbackDownloadA4Pdf();
    setIsDownloadingPdf(false);
  };

  // Tear button: detaches receipt with air gap, plays sound, and triggers download of A4 sheet PDF
  const handleTear = () => {
    if (isPrinting) return;
    setIsTorn(true);
    playCutterSound();
    downloadReceipt();
  };

  // Reset button: restores initial printer state
  const handleReset = () => {
    if (printTimerRef.current) {
      clearInterval(printTimerRef.current);
      printTimerRef.current = null;
    }
    setIsPrinting(false);
    setIsTorn(false);
    setHasGenerated(false);
    setPaperProgress(0);
    setFeedOffset(0);
  };

  // Re-print button: restarts animation from beginning
  const handleReprintClick = () => {
    if (onReprint) onReprint();
    setHasGenerated(true);
    startPrint();
  };

  const handlePrintPdf = () => {
    downloadReceipt();
  };

  // Serrated jagged edge for torn receipt top
  const tornEdgePolygon = `polygon(
    0% 7px, 2% 0px, 4% 7px, 6% 0px, 8% 7px, 10% 0px, 12% 7px, 14% 0px,
    16% 7px, 18% 0px, 20% 7px, 22% 0px, 24% 7px, 26% 0px, 28% 7px, 30% 0px,
    32% 7px, 34% 0px, 36% 7px, 38% 0px, 40% 7px, 42% 0px, 44% 7px, 46% 0px,
    48% 7px, 50% 0px, 52% 7px, 54% 0px, 56% 7px, 58% 0px, 60% 7px, 62% 0px,
    64% 7px, 66% 0px, 68% 7px, 70% 0px, 72% 7px, 74% 0px, 76% 7px, 78% 0px,
    80% 7px, 82% 0px, 84% 7px, 86% 0px, 88% 7px, 90% 0px, 92% 7px, 94% 0px,
    96% 7px, 98% 0px, 100% 7px, 100% 100%, 0% 100%
  )`;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Printer Section Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-xs font-bold border border-blue-300/40">
            <Printer className="w-3.5 h-3.5" /> {t('aiReportPrinter', 'AI Report Printer')}
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('thermalCitizenReport', 'Thermal Citizen Eligibility Report')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {reportData.isPreview 
              ? t('demoPreviewNotice', 'Demonstration Preview Mode • Safe sample data rendered so you can test all printer animation controls.')
              : t('deterministicAssessmentDesc', 'Deterministic assessment generated from verified citizen OCR attributes and scheme criteria.')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleGenerateAssessment}
            disabled={isPrinting}
            className="px-4 py-2 rounded-xl bg-[#15803D] hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            title="Generate live assessment report and start thermal printing animation"
          >
            <FileText className="w-4 h-4" />
            <span>{hasGenerated ? t('reGenerateAssessment', 'Re-generate Assessment') : t('generateAssessmentReport', 'Generate Assessment Report')}</span>
          </button>

          <button
            type="button"
            onClick={handlePrintPdf}
            disabled={isDownloadingPdf}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Download authentic A4 Sheet PDF"
          >
            <Download className="w-4 h-4" />
            <span>{isDownloadingPdf ? 'Generating A4 PDF...' : t('downloadPrintPdf', 'Download / Print PDF')}</span>
          </button>

          {onRegenerateReport && (
            <button
              type="button"
              onClick={onRegenerateReport}
              className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> {t('refreshReport', 'Refresh Report')}
            </button>
          )}
        </div>
      </div>

      {/* Main Interactive Thermal Machine Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Realistic Physical Thermal Printer Animation (Span 7) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          
          {/* Machine Outer Enclosure */}
          <div className="w-full max-w-[480px] bg-slate-100/95 dark:bg-slate-950/90 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-inner flex flex-col items-center relative">
            
            {/* Subtle Grid Backdrop */}
            <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px] opacity-25 dark:opacity-10 pointer-events-none rounded-3xl" />

            {/* Title Badge on Printer */}
            <div className="text-center mb-4 z-10">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 flex items-center gap-1.5 justify-center">
                <Printer className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                {t('aiThermalDispenser', 'AI Thermal Receipt Dispenser')}
              </span>
            </div>

            {/* THE PRINTER MACHINE ASSEMBLY */}
            <div className="w-full max-w-[420px] relative flex flex-col items-center">
              
              {/* 1. UPPER WHITE PRINTER HOUSING WITH ROUNDED CORNERS */}
              <div className="w-full bg-gradient-to-b from-white via-slate-50 to-slate-200 dark:from-slate-800 dark:via-slate-850 dark:to-slate-900 rounded-3xl border border-slate-300 dark:border-slate-700 shadow-[0_12px_24px_rgba(0,0,0,0.14)] relative z-20 flex flex-col items-center p-3 pb-3.5">
                
                {/* Metallic Top Bezel & Ventilation Grooves */}
                <div className="w-full flex items-center justify-between px-3 pb-2 border-b border-slate-200/80 dark:border-slate-700/80 mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400/60 dark:bg-slate-600" />
                    <span className="w-2 h-2 rounded-full bg-slate-400/60 dark:bg-slate-600" />
                    <span className="w-2 h-2 rounded-full bg-slate-400/60 dark:bg-slate-600" />
                  </div>
                  <span className="font-mono text-[9px] font-bold text-slate-400 dark:text-slate-500 tracking-wider">
                    GOV-PRINT TP-80 • 203 DPI
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400/60 dark:bg-slate-600" />
                    <span className="w-2 h-2 rounded-full bg-slate-400/60 dark:bg-slate-600" />
                  </div>
                </div>

                {/* Status Indicator LED lights */}
                <div className="w-full flex items-center justify-between px-4 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        isPrinting ? 'animate-ping bg-amber-400' : hasGenerated ? 'bg-emerald-400' : 'bg-blue-400'
                      }`} />
                      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                        isPrinting ? 'bg-amber-500' : hasGenerated ? 'bg-emerald-500' : 'bg-blue-500'
                      }`} />
                    </span>
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      {isPrinting 
                        ? `${t('printingStatus', 'PRINTING...')} ${paperProgress}%` 
                        : (hasGenerated && paperProgress === 100 ? t('printComplete', 'PRINT COMPLETE') : t('printerReady', 'READY'))}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {reportData.isPreview && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300/40">
                        {t('demoPreview', 'DEMO PREVIEW')}
                      </span>
                    )}
                    <span className="font-mono text-[9px] text-slate-500 dark:text-slate-400 font-semibold">
                      80mm THERMAL
                    </span>
                  </div>
                </div>

                {/* Dark Horizontal Recessed Paper Ejection Slot */}
                <div className="w-[94%] h-5 bg-neutral-950 rounded-full shadow-[inset_0_4px_8px_rgba(0,0,0,0.95)] border-b border-white/20 relative flex items-center justify-center px-4 overflow-hidden">
                  {/* Internal Cutter Blade Metallic Strip Accent */}
                  <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-slate-500 to-transparent opacity-80" />
                  {/* Subtle Slot Lip Highlight */}
                  <div className="absolute inset-x-3 bottom-0 h-[1px] bg-slate-700/60" />
                </div>
              </div>

              {/* 2. RECEIPT PAPER VIEWPORT CONTAINER */}
              <div 
                className="w-full flex flex-col items-center justify-start relative z-10 transition-all duration-300"
                style={{ 
                  marginTop: '-10px',
                  minHeight: '480px'
                }}
              >
                {!hasGenerated ? (
                  <div className="w-[92%] mt-6 p-7 rounded-2xl bg-white/95 dark:bg-slate-900/95 border-2 border-dashed border-emerald-500/40 shadow-xl flex flex-col items-center text-center space-y-4 animate-fade-in z-20">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-inner">
                      <FileText className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-black text-slate-900 dark:text-white text-base">
                        {t('readyToGenerate', 'Ready to Generate Assessment')}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                        {t('clickToRunRules', 'Click below to run scheme eligibility rules and trigger the physical thermal receipt dispensing animation.')}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleGenerateAssessment}
                      className="w-full py-3.5 px-6 rounded-xl bg-[#15803D] hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <FileText className="w-5 h-5" />
                      <span>{t('generateAssessmentReport', 'Generate Assessment Report')}</span>
                    </button>
                  </div>
                ) : (
                  /* Paper reveal mask: controls emergence from the slot */
                  <div
                    className="w-[92%]"
                    style={{
                      maxHeight: paperProgress === 0 && !isTorn 
                        ? '14px' 
                        : (isTorn ? 'none' : `${Math.max(16, (paperProgress / 100) * 820 + feedOffset)}px`),
                      overflow: isTorn ? 'visible' : 'hidden',
                      transform: isTorn ? 'translateY(32px) rotate(1.2deg)' : 'none',
                      transition: isTorn 
                        ? 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)' 
                        : 'max-height 0.04s linear'
                    }}
                  >
                  {/* The Thermal Paper Sheet */}
                  <div
                    ref={receiptContentRef}
                    className="w-full bg-[#fdfdfd] text-slate-900 font-mono text-[11px] leading-tight shadow-[0_16px_36px_rgba(0,0,0,0.22)] border-x border-b border-slate-300 dark:border-slate-300 rounded-b-md select-text relative transition-all"
                    style={{
                      clipPath: isTorn ? tornEdgePolygon : 'none',
                      paddingTop: isTorn ? '16px' : '8px'
                    }}
                  >
                    {/* Header Banner on Receipt */}
                    <div className="mx-2 mt-1 mb-2 p-2.5 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white rounded text-center shadow-inner">
                      <span className="text-[10px] font-black uppercase tracking-widest block">
                        ★ {t('govSchemeCitizenReport', 'GOVSCHEME CITIZEN REPORT')} ★
                      </span>
                      <span className="text-[8px] opacity-90 uppercase tracking-wider block">
                        {reportData.isPreview ? t('demoPreview', 'SAMPLE ASSESSMENT PREVIEW') : t('officialWelfareEngine', 'OFFICIAL WELFARE ADVISORY ENGINE')}
                      </span>
                    </div>

                    {/* Receipt Details Body */}
                    <div className="p-4 pt-1 space-y-3">
                      
                      {/* Header ID & Timestamp */}
                      <div className="text-center space-y-0.5 border-b border-dashed border-slate-400 pb-2.5">
                        <div className="font-black text-xs uppercase tracking-wide">
                          {t('citizenEligibilityAssessment', 'CITIZEN ELIGIBILITY ASSESSMENT')}
                        </div>
                        <div className="text-[9px] text-slate-600 font-semibold">
                          {reportData.isPreview ? t('demoPreview', 'DEMO VERIFICATION PREVIEW') : t('officialCitizenReport', 'OFFICIAL CITIZEN REPORT')}
                        </div>
                        <div className="text-[9px] text-slate-700 pt-1">
                          {t('reportId', 'Report ID')}: <strong className="font-bold">{reportData.reportId}</strong>
                        </div>
                        <div className="text-[9px] text-slate-600">
                          {t('reportDate', 'Date')}: {reportData.generatedDate}
                        </div>
                      </div>

                      {/* Citizen Profile Snapshot */}
                      <div className="space-y-1 text-[10px] border-b border-dashed border-slate-300 pb-2">
                        <div className="flex justify-between">
                          <span className="text-slate-600">{t('citizenLabel', 'CITIZEN')}:</span>
                          <span className="font-bold truncate max-w-[170px]">{reportData.citizenName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">{t('stateLabel', 'STATE')}:</span>
                          <span className="font-bold">{reportData.state}</span>
                        </div>
                        {reportData.district && (
                          <div className="flex justify-between">
                            <span className="text-slate-600">{t('districtLabel', 'DISTRICT')}:</span>
                            <span className="font-bold">{reportData.district}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-slate-600">{t('ageGenderLabel', 'AGE / GENDER')}:</span>
                          <span className="font-bold">{reportData.age} {t('yearsUnit', 'YRS')} • {reportData.gender}</span>
                        </div>
                        {reportData.annualIncome !== undefined && (
                          <div className="flex justify-between">
                            <span className="text-slate-600">{t('incomeLabel', 'ANNUAL INCOME')}:</span>
                            <span className="font-bold">₹{reportData.annualIncome.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-slate-600">{t('occupationLabel', 'OCCUPATION')}:</span>
                          <span className="font-bold">{reportData.occupation}</span>
                        </div>
                        {reportData.socialCategory && (
                          <div className="flex justify-between">
                            <span className="text-slate-600">{t('categoryLabel', 'CATEGORY')}:</span>
                            <span className="font-bold">{reportData.socialCategory}</span>
                          </div>
                        )}
                      </div>

                      {/* Document Processing & Verification Summary */}
                      <div className="space-y-1 text-[10px] border-b border-dashed border-slate-300 pb-2">
                        <div className="font-bold text-[10px] text-slate-800 tracking-wider">
                          {t('docProcessingSummary', 'DOCUMENT PROCESSING SUMMARY')}
                        </div>
                        <div className="flex justify-between">
                          <span>{t('docsUploaded', 'Documents Uploaded')}:</span>
                          <span className="font-bold">{reportData.uploadedDocumentsCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('ocrExtracted', 'OCR Extracted')}:</span>
                          <span className="font-bold">{reportData.ocrCompletedCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('verificationOutcome', 'Verification Outcome')}:</span>
                          <span className={`font-bold ${
                            reportData.verificationOutcome === 'CHECKS_PASSED' 
                              ? 'text-emerald-700' 
                              : (reportData.verificationOutcome === 'SAMPLE_PREVIEW' ? 'text-blue-700' : 'text-amber-700')
                          }`}>
                            {reportData.verificationOutcome}
                          </span>
                        </div>

                        {/* Document List */}
                        {reportData.documents.length > 0 && (
                          <div className="pt-1.5 space-y-1">
                            {reportData.documents.map((doc, idx) => (
                              <div key={idx} className="flex justify-between text-[9px] text-slate-700 bg-slate-100/90 p-1 rounded">
                                <span className="font-bold uppercase">{doc.documentType}:</span>
                                <span>{doc.maskedIdentifier} [{doc.verificationStatus}]</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Recommended Schemes */}
                      <div className="space-y-2 border-b border-dashed border-slate-300 pb-2">
                        <div className="font-bold text-[10px] text-slate-800 tracking-wider">
                          {t('recommendedSchemesUpper', 'RECOMMENDED SCHEMES')} ({reportData.recommendedSchemes.length})
                        </div>
                        {reportData.recommendedSchemes.map((sch, i) => (
                          <div key={i} className="text-[10px] space-y-0.5 bg-slate-50/80 p-1.5 rounded border border-slate-200">
                            <div className="font-bold text-slate-900">{i + 1}. {sch.schemeName}</div>
                            <div className="text-[9px] text-slate-600">{t('benefitLabel', 'Benefit')}: {sch.benefitSummary}</div>
                            {sch.officialWebsite && (
                              <div className="text-[8px] text-blue-700 font-semibold">{t('portalLabel', 'Portal')}: {sch.officialWebsite}</div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Action Required Before Applying */}
                      {(reportData.missingSteps.length > 0 || reportData.missingDocumentsChecklist.length > 0) && (
                        <div className="space-y-1 text-[9px] border-b border-dashed border-slate-300 pb-2">
                          <div className="font-bold text-[9px] text-amber-800 tracking-wider">
                            {t('actionRequiredUpper', 'ACTION REQUIRED BEFORE APPLYING')}
                          </div>
                          {reportData.missingSteps.map((step, idx) => (
                            <div key={`st-${idx}`} className="text-slate-700 font-mono">• {step}</div>
                          ))}
                          {reportData.missingDocumentsChecklist.map((doc, idx) => (
                            <div key={`dc-${idx}`} className="text-slate-700 font-mono">• Upload verified {doc}</div>
                          ))}
                        </div>
                      )}

                      {/* Transparency Disclaimer */}
                      <div className="text-[8px] text-slate-500 leading-tight border-b border-dashed border-slate-300 pb-2">
                        {t('thermalNotice', 'Notice: Advisory assessment. Final sanction subject to government departmental verification.')}
                      </div>

                      {/* Barcode Simulation & End of Receipt */}
                      <div className="text-center pt-1 space-y-1">
                        <div className="text-[9px] font-bold tracking-widest text-slate-500">
                          ================================
                        </div>
                        <div className="text-[9px] font-bold uppercase tracking-wider">
                          {t('endOfReceipt', 'END OF ASSESSMENT RECEIPT')}
                        </div>
                        
                        {/* Barcode lines */}
                        <div className="h-6 flex items-center justify-center gap-0.5 pt-1 opacity-80">
                          {Array.from({ length: 44 }).map((_, i) => (
                            <span
                              key={i}
                              className="bg-black inline-block h-full"
                              style={{ width: i % 4 === 0 ? '2.5px' : i % 2 === 0 ? '1.5px' : '1px' }}
                            />
                          ))}
                        </div>
                        <div className="text-[8px] text-slate-500 font-mono">
                          *{reportData.reportId}*
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
                )}
              </div>

            </div>

            {/* MECHANICAL CONTROLLER BUTTONS (RE-PRINT, FEED, TEAR, RESET, AUDIO) */}
            <div className="w-full max-w-[440px] mt-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-xl flex items-center justify-between gap-1.5 z-30">
              
              {/* 1. PRINT / RE-PRINT */}
              <button
                type="button"
                onClick={hasGenerated ? handleReprintClick : handleGenerateAssessment}
                disabled={isPrinting}
                className="flex-1 py-2 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[11px] flex items-center justify-center gap-1.5 transition-transform active:scale-95 disabled:opacity-50 shadow-sm"
                title={hasGenerated ? "Restart receipt printing animation from beginning" : "Start receipt printing animation"}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{hasGenerated ? t('reprintBtn', 'RE-PRINT') : t('printBtn', 'PRINT')}</span>
              </button>

              {/* 2. FEED */}
              <button
                type="button"
                onClick={handleFeed}
                disabled={isPrinting}
                className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-[11px] flex items-center justify-center gap-1 transition-transform active:scale-95 disabled:opacity-40"
                title="Advance receipt paper downward"
              >
                <ArrowDown className="w-3.5 h-3.5" />
                <span>{t('feedBtn', 'FEED')}</span>
              </button>

              {/* 3. TEAR & DOWNLOAD (Directly downloads A4 Sheet PDF) */}
              <button
                type="button"
                onClick={handleTear}
                disabled={isPrinting || isDownloadingPdf}
                className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] flex items-center justify-center gap-1 transition-transform active:scale-95 disabled:opacity-40 shadow-sm"
                title={isTorn ? "Download formal A4 sheet PDF again" : "Tear receipt and download formal A4 sheet PDF"}
              >
                <Scissors className="w-3.5 h-3.5" />
                <span>{isDownloadingPdf ? 'PDF...' : (isTorn ? t('downloadBtn', 'DOWNLOAD') : t('tearBtn', 'TEAR'))}</span>
              </button>

              {/* 4. RESET */}
              <button
                type="button"
                onClick={handleReset}
                className="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-[11px] flex items-center justify-center gap-1 transition-transform active:scale-95"
                title="Reset printer to initial state"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('resetBtn', 'RESET')}</span>
              </button>

              {/* 5. AUDIO */}
              <button
                type="button"
                onClick={() => {
                  const next = !isAudioEnabled;
                  setIsAudioEnabled(next);
                  if (next) playMechanicalSound(650, 0.08);
                }}
                className={`p-2 rounded-xl transition-colors ${
                  isAudioEnabled 
                    ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300/50' 
                    : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title={isAudioEnabled ? 'Mute printer audio' : 'Enable thermal mechanical printing sound effects'}
              >
                {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

            </div>

          </div>
        </div>

        {/* Right Column: Structured Live Report Details & Audit Records (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Section 1: Extracted Information & Verification */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                {t('extractedInfoVerification', 'Extracted Information & Verification')}
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {reportData.uploadedDocumentsCount} {t('docsCount', 'Docs')}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">{t('citizenProfileLabel', 'Citizen Profile:')}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{reportData.citizenName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">{t('stateNativityLabel', 'State / Nativity:')}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{reportData.state}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">{t('ageLabel', 'Age:')}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{reportData.age} {t('yearsUnit', 'Years')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">{t('annualFamilyIncome', 'Annual Family Income:')}</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {reportData.annualIncome !== undefined ? `₹${reportData.annualIncome.toLocaleString('en-IN')}` : 'Not specified'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">{t('authenticityStatus', 'Authenticity Status:')}</span>
                <span className={`font-bold ${
                  reportData.verificationOutcome === 'CHECKS_PASSED' 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-blue-600 dark:text-blue-400'
                }`}>
                  {reportData.verificationOutcome}
                </span>
              </div>
            </div>

            {/* Uploaded Documents List */}
            {reportData.documents.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-[11px] font-bold text-slate-400 uppercase">{t('trackedVaultDocs', 'Tracked Vault Documents:')}</div>
                <div className="space-y-1.5">
                  {reportData.documents.map((doc, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                      <div className="truncate mr-2">
                        <span className="font-bold capitalize">{doc.documentType.replace('_', ' ')}</span>
                        <span className="block text-[10px] text-slate-500 font-mono">{doc.maskedIdentifier}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold shrink-0">
                        {doc.verificationStatus}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Recommended Government Schemes */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                {t('recommendedGovSchemes', 'Recommended Government Schemes')}
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                {reportData.recommendedSchemes.length} {t('matchesUnit', 'Matches')}
              </span>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {reportData.recommendedSchemes.map((scheme, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                      {scheme.schemeName}
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-semibold shrink-0">
                      {scheme.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                    {scheme.benefitSummary}
                  </p>
                  {scheme.officialWebsite && (
                    <a
                      href={scheme.officialWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline pt-1"
                    >
                      {t('officialPortalLink', 'Official Portal')} <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Next Steps & Warnings */}
          {(reportData.missingSteps.length > 0 || reportData.missingDocumentsChecklist.length > 0) && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 space-y-2">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                {t('actionRequiredBeforeApply', 'Action Required Before Applying:')}
              </div>
              <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                {reportData.missingSteps.map((step, idx) => (
                  <li key={`step-${idx}`}>{step}</li>
                ))}
                {reportData.missingDocumentsChecklist.map((doc, idx) => (
                  <li key={`doc-${idx}`}>Upload verified copy of {doc}</li>
                ))}
              </ul>
            </div>
          )}

        </div>

      </div>

      {/* ========================================================================= */}
      {/* FORMAL A4 SHEET PDF TEMPLATE (Captured by html2canvas for Download on TEAR) */}
      {/* ========================================================================= */}
      <div
        id="formal-a4-pdf-document"
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: '-9999px',
          top: '0px',
          width: '794px',
          minHeight: '1123px',
          backgroundColor: '#ffffff',
          color: '#0f172a',
          padding: '40px 48px',
          fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          boxSizing: 'border-box',
          zIndex: -100
        }}
      >
        {/* 1. Indian Government Tricolor Bar Header Accent */}
        <div style={{ display: 'flex', height: '6px', width: '100%', marginBottom: '24px', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ flex: 1, backgroundColor: '#FF9933' }} />
          <div style={{ flex: 1, backgroundColor: '#FFFFFF', borderTop: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1' }} />
          <div style={{ flex: 1, backgroundColor: '#138808' }} />
        </div>

        {/* 2. Official Header with National Branding and Reference IDs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0f172a', paddingBottom: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Republic of India / GovScheme Crest Simulation */}
            <div style={{ width: '56px', height: '56px', borderRadius: '12px', backgroundColor: '#0f2942', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
              <Building2 style={{ width: '32px', height: '32px', color: '#38bdf8' }} />
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em', color: '#0369a1', textTransform: 'uppercase' }}>
                {t('formalA4ReportTitle', 'GOVERNMENT OF INDIA • WELFARE ELIGIBILITY CERTIFICATE')}
              </div>
              <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', margin: '2px 0 4px', letterSpacing: '-0.02em' }}>
                GovScheme AI • Citizen Assessment
              </h1>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                {t('cscKioskAssessmentA4', 'CSC Digital Seva • Official Citizen Welfare Assessment (A4)')}
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right', fontSize: '11px', color: '#475569', lineHeight: 1.5 }}>
            <div><strong>{t('reportId', 'Ref ID')}:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0284c7' }}>{reportData.reportId}</span></div>
            <div><strong>{t('dateOfIssue', 'Date of Issue')}:</strong> {reportData.generatedDate}</div>
            <div><strong>{t('issuingAuthority', 'Issuing Authority')}:</strong> CSC Digital Seva</div>
            <div style={{ marginTop: '4px' }}>
              <span style={{ display: 'inline-block', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 800, backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #86efac' }}>
                {reportData.verificationOutcome === 'CHECKS_PASSED' ? 'VERIFIED • ELIGIBLE' : 'ASSESSMENT COMPLETED'}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Beneficiary Demographic Profile Grid */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0f2942', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award style={{ width: '16px', height: '16px', color: '#0284c7' }} />
            {t('beneficiaryDetails', 'Beneficiary Demographic Profile')}
          </div>
          
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <tbody>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '8px 12px', fontWeight: 700, color: '#64748b', width: '22%' }}>{t('citizenLabel', 'Citizen Name')}</td>
                <td style={{ padding: '8px 12px', fontWeight: 800, color: '#0f172a', width: '28%' }}>{reportData.citizenName}</td>
                <td style={{ padding: '8px 12px', fontWeight: 700, color: '#64748b', width: '22%' }}>{t('ageGenderLabel', 'Age / Gender')}</td>
                <td style={{ padding: '8px 12px', fontWeight: 800, color: '#0f172a', width: '28%' }}>{reportData.age} {t('yearsUnit', 'Years')} / {reportData.gender}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '8px 12px', fontWeight: 700, color: '#64748b' }}>{t('stateLabel', 'State / Nativity')}</td>
                <td style={{ padding: '8px 12px', fontWeight: 800, color: '#0f172a' }}>{reportData.state}{reportData.district ? ` (${reportData.district})` : ''}</td>
                <td style={{ padding: '8px 12px', fontWeight: 700, color: '#64748b' }}>{t('occupationLabel', 'Occupation')}</td>
                <td style={{ padding: '8px 12px', fontWeight: 800, color: '#0f172a' }}>{reportData.occupation}</td>
              </tr>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '8px 12px', fontWeight: 700, color: '#64748b' }}>{t('incomeLabel', 'Annual Household Income')}</td>
                <td style={{ padding: '8px 12px', fontWeight: 800, color: '#0f172a' }}>
                  {reportData.annualIncome !== undefined ? `₹${reportData.annualIncome.toLocaleString('en-IN')}` : 'N/A'}
                </td>
                <td style={{ padding: '8px 12px', fontWeight: 700, color: '#64748b' }}>{t('categoryLabel', 'Social Category')}</td>
                <td style={{ padding: '8px 12px', fontWeight: 800, color: '#0f172a' }}>{reportData.socialCategory || 'General'}</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 12px', fontWeight: 700, color: '#64748b' }}>{t('authenticityStatus', 'Verification Status')}</td>
                <td style={{ padding: '8px 12px', fontWeight: 800, color: '#16a34a' }}>{reportData.verificationOutcome}</td>
                <td style={{ padding: '8px 12px', fontWeight: 700, color: '#64748b' }}>{t('docsUploaded', 'Tracked Vault Documents')}</td>
                <td style={{ padding: '8px 12px', fontWeight: 800, color: '#0f172a' }}>{reportData.uploadedDocumentsCount} uploaded ({reportData.ocrCompletedCount} OCR verified)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 4. Verified Government Documents Table */}
        {reportData.documents.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0f2942', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck style={{ width: '14px', height: '14px', color: '#16a34a' }} />
              {t('verifiedVaultRecords', 'Verified Vault & Identification Records')}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1', textAlign: 'left' }}>
                  <th style={{ padding: '6px 10px', color: '#475569' }}>Document Type</th>
                  <th style={{ padding: '6px 10px', color: '#475569' }}>Identification ID</th>
                  <th style={{ padding: '6px 10px', color: '#475569' }}>OCR Extraction</th>
                  <th style={{ padding: '6px 10px', color: '#475569' }}>Security Audit Status</th>
                </tr>
              </thead>
              <tbody>
                {reportData.documents.map((doc, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: i % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                    <td style={{ padding: '6px 10px', fontWeight: 700, textTransform: 'uppercase' }}>{doc.documentType.replace('_', ' ')}</td>
                    <td style={{ padding: '6px 10px', fontFamily: 'monospace' }}>{doc.maskedIdentifier}</td>
                    <td style={{ padding: '6px 10px', color: '#0284c7', fontWeight: 600 }}>{doc.ocrStatus}</td>
                    <td style={{ padding: '6px 10px', color: '#16a34a', fontWeight: 700 }}>{doc.verificationStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. Recommended Government Schemes Table */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#0f2942', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles style={{ width: '16px', height: '16px', color: '#d97706' }} />
            {t('eligibleSchemesEntitlements', 'Eligible Government Schemes & Entitlements')} ({reportData.recommendedSchemes.length} Matches)
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5px' }}>
            <thead>
              <tr style={{ backgroundColor: '#0f2942', color: '#ffffff', textAlign: 'left' }}>
                <th style={{ padding: '8px 10px', width: '5%' }}>#</th>
                <th style={{ padding: '8px 10px', width: '30%' }}>Scheme Name</th>
                <th style={{ padding: '8px 10px', width: '20%' }}>Category</th>
                <th style={{ padding: '8px 10px', width: '30%' }}>Entitled Welfare Benefit</th>
                <th style={{ padding: '8px 10px', width: '15%' }}>Official Portal</th>
              </tr>
            </thead>
            <tbody>
              {reportData.recommendedSchemes.slice(0, 6).map((sch, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: i % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                  <td style={{ padding: '8px 10px', fontWeight: 700, color: '#64748b' }}>{i + 1}</td>
                  <td style={{ padding: '8px 10px', fontWeight: 800, color: '#0f172a' }}>{sch.schemeName}</td>
                  <td style={{ padding: '8px 10px' }}>
                    <span style={{ display: 'inline-block', padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 700, backgroundColor: '#e0f2fe', color: '#0369a1' }}>
                      {sch.category}
                    </span>
                  </td>
                  <td style={{ padding: '8px 10px', color: '#334155', lineHeight: 1.4 }}>{sch.benefitSummary}</td>
                  <td style={{ padding: '8px 10px', color: '#0284c7', fontWeight: 600, wordBreak: 'break-all' }}>
                    {sch.officialWebsite ? sch.officialWebsite.replace('https://', '').replace('http://', '').slice(0, 20) : 'Gov Portal'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 6. Mandatory Requirements & Next Steps Checklist */}
        {(reportData.missingSteps.length > 0 || reportData.missingDocumentsChecklist.length > 0) && (
          <div style={{ marginBottom: '24px', padding: '12px 16px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', fontSize: '10px' }}>
            <div style={{ fontWeight: 800, color: '#92400e', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle style={{ width: '14px', height: '14px' }} />
              {t('mandatoryRequirementsChecklist', 'Mandatory Requirements & Next Steps Checklist')}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px', color: '#78350f' }}>
              {reportData.missingSteps.map((st, i) => (
                <div key={`ms-${i}`}>☑ {st}</div>
              ))}
              {reportData.missingDocumentsChecklist.map((dc, i) => (
                <div key={`md-${i}`}>☑ Present verified physical copy of {dc} at CSC Block Office</div>
              ))}
            </div>
          </div>
        )}

        {/* 7. Official Legal Disclaimer & Notice */}
        <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '12px', marginBottom: '24px', fontSize: '9px', color: '#64748b', lineHeight: 1.4 }}>
          <strong>{t('disclaimer', 'Official Notice / Disclaimer')}:</strong> {t('kioskDisclaimer', 'This report is automatically generated based on user input and rule verification. Final approval is subject to document verification by the respective government department.')}
        </div>

        {/* 8. Authorized Signatures, Digital Seal & Security Barcode */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '2px solid #0f172a', paddingTop: '16px' }}>
          {/* CSC Digital Seva Official Stamp Seal */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px dashed #0284c7', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '4px' }}>
              <div style={{ fontSize: '7px', fontWeight: 900, color: '#0284c7', textTransform: 'uppercase' }}>CSC SEVA</div>
              <div style={{ fontSize: '6px', color: '#64748b' }}>ASSESSED</div>
              <div style={{ fontSize: '6px', fontWeight: 700, color: '#16a34a' }}>REPORT</div>
            </div>
            <div style={{ fontSize: '9px', color: '#475569' }}>
              <div style={{ fontWeight: 800, color: '#0f172a' }}>{t('cscSevaCertified', 'CSC Digital Seva Advisory Output')}</div>
              <div>E-Governance Services India Limited</div>
              <div>Unique Assessment Hash: <span style={{ fontFamily: 'monospace' }}>GS-{reportData.reportId.slice(-4)}-ADVISORY</span></div>
            </div>
          </div>

          {/* Barcode Simulation */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', height: '24px', alignItems: 'center', justifyContent: 'center', gap: '1px' }}>
              {Array.from({ length: 42 }).map((_, i) => (
                <span
                  key={i}
                  style={{
                    backgroundColor: '#000000',
                    display: 'inline-block',
                    height: '100%',
                    width: i % 4 === 0 ? '2.5px' : i % 2 === 0 ? '1.5px' : '1px'
                  }}
                />
              ))}
            </div>
            <div style={{ fontSize: '8px', fontFamily: 'monospace', color: '#475569', marginTop: '3px' }}>
              *{reportData.reportId}*
            </div>
          </div>

          {/* Authorized Signature Block */}
          <div style={{ textAlign: 'right', minWidth: '180px' }}>
            <div style={{ borderBottom: '1px solid #0f172a', paddingBottom: '4px', marginBottom: '4px', fontStyle: 'italic', color: '#0369a1', fontWeight: 700, fontSize: '11px' }}>
              GovScheme AI / Advisory Assessment Engine
            </div>
            <div style={{ fontSize: '9.5px', fontWeight: 800, color: '#0f172a' }}>
              {t('authorizedSignature', 'Authorized Officer Signature')}
            </div>
            <div style={{ fontSize: '8.5px', color: '#64748b' }}>Digital Advisory Sanction & Review</div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default ThermalReceiptPrinter;
