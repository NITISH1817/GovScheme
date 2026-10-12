import React, { useState, useEffect, useRef, useId } from 'react';
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
  ChevronUp
} from 'lucide-react';
import { jsPDF } from 'jspdf';
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
}

export const ThermalReceiptPrinter: React.FC<ThermalReceiptPrinterProps> = ({
  reportData,
  onReprint,
  onRegenerateReport
}) => {
  // Animation states
  const [paperProgress, setPaperProgress] = useState<number>(0); // 0 to 100%
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [isTorn, setIsTorn] = useState<boolean>(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(false);
  const [feedOffset, setFeedOffset] = useState<number>(0);

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
      progress += 2.5;
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
    }, 45);
  };

  // Initial print when component mounts or reportId changes
  useEffect(() => {
    startPrint();

    return () => {
      if (printTimerRef.current) clearInterval(printTimerRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [reportData.reportId]);

  // Feed button: advances receipt downward
  const handleFeed = () => {
    if (isPrinting) return;
    setFeedOffset(prev => prev + 45);
    playMechanicalSound(340, 0.05);
  };

  // Helper to generate formatted plain-text thermal receipt file for download
  const generateReceiptText = (): string => {
    const divider = '================================================';
    const subDivider = '------------------------------------------------';
    const lines: string[] = [];

    lines.push(divider);
    lines.push('          GOVSCHEME CITIZEN REPORT              ');
    lines.push('       AI THERMAL PRINTER ASSESSMENT            ');
    lines.push(divider);
    lines.push(`Report ID   : ${reportData.reportId}`);
    lines.push(`Date        : ${reportData.generatedDate}`);
    lines.push(`Citizen     : ${reportData.citizenName}`);
    lines.push(`Age / Gender: ${reportData.age} Years / ${reportData.gender}`);
    lines.push(`State       : ${reportData.state}${reportData.district ? ` (${reportData.district})` : ''}`);
    lines.push(`Occupation  : ${reportData.occupation}`);
    if (reportData.annualIncome !== undefined) {
      lines.push(`Income      : Rs. ${reportData.annualIncome.toLocaleString('en-IN')}`);
    }
    if (reportData.socialCategory) {
      lines.push(`Category    : ${reportData.socialCategory}`);
    }
    lines.push(subDivider);
    lines.push(`Status      : ${reportData.verificationOutcome}`);
    lines.push(`Docs Tracked: ${reportData.uploadedDocumentsCount} uploaded, ${reportData.ocrCompletedCount} verified`);
    lines.push(subDivider);

    lines.push('RECOMMENDED SCHEMES:');
    if (reportData.recommendedSchemes.length === 0) {
      lines.push('  No matched schemes at this time.');
    } else {
      reportData.recommendedSchemes.forEach((sch, i) => {
        lines.push(`\n[${i + 1}] ${sch.schemeName}`);
        lines.push(`    Category : ${sch.category}`);
        lines.push(`    Benefit  : ${sch.benefitSummary}`);
        if (sch.officialWebsite) {
          lines.push(`    Portal   : ${sch.officialWebsite}`);
        }
      });
    }

    if (reportData.missingDocumentsChecklist.length > 0 || reportData.missingSteps.length > 0) {
      lines.push('\n' + subDivider);
      lines.push('ACTION REQUIRED / NEXT STEPS:');
      reportData.missingSteps.forEach(s => lines.push(`  - ${s}`));
      reportData.missingDocumentsChecklist.forEach(d => lines.push(`  - Upload verified ${d}`));
    }

    lines.push('\n' + divider);
    lines.push('Notice: Advisory assessment. Final sanction is subject');
    lines.push('to government departmental verification.');
    lines.push(`*${reportData.reportId}*`);
    lines.push(divider);

    return lines.join('\n');
  };

  // Helper to generate and download authentic PDF receipt
  const downloadReceipt = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 260] // Realistic 80mm thermal receipt roll dimensions
      });

      const pageWidth = 80;
      let y = 10;

      // Header Banner
      doc.setFillColor(20, 45, 95);
      doc.rect(4, y, pageWidth - 8, 14, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.text('GOVSCHEME CITIZEN REPORT', pageWidth / 2, y + 6, { align: 'center' });
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      doc.text(reportData.isPreview ? 'SAMPLE ASSESSMENT PREVIEW' : 'OFFICIAL WELFARE ADVISORY ENGINE', pageWidth / 2, y + 10.5, { align: 'center' });
      
      y += 18;

      // Title & Meta
      doc.setTextColor(20, 30, 45);
      doc.setFont('courier', 'bold');
      doc.setFontSize(8.5);
      doc.text('CITIZEN ELIGIBILITY ASSESSMENT', pageWidth / 2, y, { align: 'center' });
      y += 4;
      doc.setFontSize(7);
      doc.setFont('courier', 'normal');
      doc.text(`Report ID: ${reportData.reportId}`, pageWidth / 2, y, { align: 'center' });
      y += 3.5;
      doc.text(`Date: ${reportData.generatedDate}`, pageWidth / 2, y, { align: 'center' });
      y += 5;

      // Divider Line
      doc.setDrawColor(180, 180, 180);
      doc.setLineDashPattern([1.5, 1.5], 0);
      doc.line(5, y, pageWidth - 5, y);
      y += 5;

      // Profile Table
      doc.setFont('courier', 'bold');
      doc.setFontSize(7.5);
      doc.text('CITIZEN PROFILE DETAILS', 6, y);
      y += 4;
      doc.setFont('courier', 'normal');
      doc.setFontSize(6.5);

      const addRow = (label: string, val: string) => {
        doc.text(label, 6, y);
        doc.text(val, pageWidth - 6, y, { align: 'right' });
        y += 3.8;
      };

      addRow('Name:', reportData.citizenName);
      addRow('Age / Gender:', `${reportData.age} Yrs / ${reportData.gender}`);
      addRow('State:', `${reportData.state}${reportData.district ? ` (${reportData.district})` : ''}`);
      addRow('Occupation:', reportData.occupation);
      if (reportData.annualIncome !== undefined) {
        addRow('Income:', `Rs. ${reportData.annualIncome.toLocaleString('en-IN')}`);
      }
      if (reportData.socialCategory) {
        addRow('Social Category:', reportData.socialCategory);
      }
      addRow('Verification:', reportData.verificationOutcome);
      addRow('Vault Docs:', `${reportData.uploadedDocumentsCount} uploaded, ${reportData.ocrCompletedCount} verified`);

      y += 2;
      doc.line(5, y, pageWidth - 5, y);
      y += 5;

      // Recommended Schemes Section
      doc.setFont('courier', 'bold');
      doc.setFontSize(7.5);
      doc.text(`RECOMMENDED SCHEMES (${reportData.recommendedSchemes.length})`, 6, y);
      y += 4;

      if (reportData.recommendedSchemes.length === 0) {
        doc.setFont('courier', 'italic');
        doc.setFontSize(6.5);
        doc.text('No matching schemes identified.', 6, y);
        y += 4;
      } else {
        reportData.recommendedSchemes.forEach((sch, i) => {
          doc.setFont('courier', 'bold');
          doc.setFontSize(7);
          const title = `${i + 1}. ${sch.schemeName}`;
          const splitTitle = doc.splitTextToSize(title, pageWidth - 12);
          doc.text(splitTitle, 6, y);
          y += (splitTitle.length * 3.2);

          doc.setFont('courier', 'normal');
          doc.setFontSize(6.2);
          const ben = `Benefit: ${sch.benefitSummary}`;
          const splitBen = doc.splitTextToSize(ben, pageWidth - 12);
          doc.text(splitBen, 6, y);
          y += (splitBen.length * 3.1);

          if (sch.officialWebsite) {
            doc.setTextColor(20, 80, 180);
            doc.text(`Portal: ${sch.officialWebsite}`, 6, y);
            doc.setTextColor(20, 30, 45);
            y += 3.2;
          }
          y += 1.5;
        });
      }

      // Next Steps Checklist
      if (reportData.missingSteps.length > 0 || reportData.missingDocumentsChecklist.length > 0) {
        y += 1;
        doc.line(5, y, pageWidth - 5, y);
        y += 4.5;
        doc.setFont('courier', 'bold');
        doc.setFontSize(7.5);
        doc.text('ACTION REQUIRED BEFORE APPLYING', 6, y);
        y += 4;
        doc.setFont('courier', 'normal');
        doc.setFontSize(6.2);

        reportData.missingSteps.forEach(step => {
          const stepText = `* ${step}`;
          const splitStep = doc.splitTextToSize(stepText, pageWidth - 12);
          doc.text(splitStep, 6, y);
          y += (splitStep.length * 3);
        });

        reportData.missingDocumentsChecklist.forEach(docName => {
          const docText = `* Upload verified ${docName}`;
          const splitDoc = doc.splitTextToSize(docText, pageWidth - 12);
          doc.text(splitDoc, 6, y);
          y += (splitDoc.length * 3);
        });
      }

      // Footer Disclaimer
      y += 2;
      doc.line(5, y, pageWidth - 5, y);
      y += 4;
      doc.setFont('courier', 'normal');
      doc.setFontSize(5.8);
      const disclaimer = 'Notice: Advisory assessment. Final sanction is subject to government departmental verification.';
      const splitDisc = doc.splitTextToSize(disclaimer, pageWidth - 12);
      doc.text(splitDisc, pageWidth / 2, y, { align: 'center' });
      y += (splitDisc.length * 2.8) + 2;

      doc.setFont('courier', 'bold');
      doc.setFontSize(7.5);
      doc.text(`*${reportData.reportId}*`, pageWidth / 2, y, { align: 'center' });
      y += 3.5;
      doc.text('====================================', pageWidth / 2, y, { align: 'center' });

      doc.save(`GovScheme_Report_${reportData.reportId || 'Assessment'}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF receipt with jsPDF, falling back to print:', err);
      window.print();
    }
  };

  // Tear button: detaches receipt with air gap, plays sound, and triggers download
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
    setPaperProgress(0);
    setFeedOffset(0);
  };

  // Re-print button: restarts animation from beginning
  const handleReprintClick = () => {
    if (onReprint) onReprint();
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
            <Printer className="w-3.5 h-3.5" /> AI Report Printer
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Thermal Citizen Eligibility Report
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {reportData.isPreview 
              ? 'Demonstration Preview Mode • Safe sample data rendered so you can test all printer animation controls.'
              : 'Deterministic assessment generated from verified citizen OCR attributes and scheme criteria.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrintPdf}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
            title="Download PDF or Print Browser View"
          >
            <Download className="w-4 h-4" /> Download / Print PDF
          </button>
          {onRegenerateReport && (
            <button
              onClick={onRegenerateReport}
              className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Refresh Report
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
                AI Thermal Receipt Dispenser
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
                        isPrinting ? 'animate-ping bg-amber-400' : 'bg-emerald-400'
                      }`} />
                      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                        isPrinting ? 'bg-amber-500' : 'bg-emerald-500'
                      }`} />
                    </span>
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      {isPrinting ? 'PRINTING...' : (paperProgress === 100 ? 'PRINT COMPLETE' : 'READY')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {reportData.isPreview && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300/40">
                        DEMO PREVIEW
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
              {/* The paper realistically emerges directly from the slot slit */}
              <div 
                className="w-full flex justify-center relative z-10 transition-all duration-300"
                style={{ 
                  marginTop: '-10px',
                  minHeight: '480px'
                }}
              >
                {/* Paper reveal mask: controls emergence from the slot */}
                <div
                  className="w-[92%] transition-all duration-200"
                  style={{
                    maxHeight: paperProgress === 0 && !isTorn 
                      ? '14px' 
                      : (isTorn ? 'none' : `${Math.max(16, (paperProgress / 100) * 820 + feedOffset)}px`),
                    overflow: isTorn ? 'visible' : 'hidden',
                    transform: isTorn ? 'translateY(32px) rotate(1.2deg)' : 'none',
                    transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)'
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
                        ★ GOVSCHEME CITIZEN REPORT ★
                      </span>
                      <span className="text-[8px] opacity-90 uppercase tracking-wider block">
                        {reportData.isPreview ? 'SAMPLE ASSESSMENT PREVIEW' : 'OFFICIAL WELFARE ADVISORY ENGINE'}
                      </span>
                    </div>

                    {/* Receipt Details Body */}
                    <div className="p-4 pt-1 space-y-3">
                      
                      {/* Header ID & Timestamp */}
                      <div className="text-center space-y-0.5 border-b border-dashed border-slate-400 pb-2.5">
                        <div className="font-black text-xs uppercase tracking-wide">
                          CITIZEN ELIGIBILITY ASSESSMENT
                        </div>
                        <div className="text-[9px] text-slate-600 font-semibold">
                          {reportData.isPreview ? 'DEMO VERIFICATION PREVIEW' : 'OFFICIAL CITIZEN REPORT'}
                        </div>
                        <div className="text-[9px] text-slate-700 pt-1">
                          Report ID: <strong className="font-bold">{reportData.reportId}</strong>
                        </div>
                        <div className="text-[9px] text-slate-600">
                          Date: {reportData.generatedDate}
                        </div>
                      </div>

                      {/* Citizen Profile Snapshot */}
                      <div className="space-y-1 text-[10px] border-b border-dashed border-slate-300 pb-2">
                        <div className="flex justify-between">
                          <span className="text-slate-600">CITIZEN:</span>
                          <span className="font-bold truncate max-w-[170px]">{reportData.citizenName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">STATE:</span>
                          <span className="font-bold">{reportData.state}</span>
                        </div>
                        {reportData.district && (
                          <div className="flex justify-between">
                            <span className="text-slate-600">DISTRICT:</span>
                            <span className="font-bold">{reportData.district}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-slate-600">AGE / GENDER:</span>
                          <span className="font-bold">{reportData.age} YRS • {reportData.gender}</span>
                        </div>
                        {reportData.annualIncome !== undefined && (
                          <div className="flex justify-between">
                            <span className="text-slate-600">ANNUAL INCOME:</span>
                            <span className="font-bold">₹{reportData.annualIncome.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-slate-600">OCCUPATION:</span>
                          <span className="font-bold">{reportData.occupation}</span>
                        </div>
                        {reportData.socialCategory && (
                          <div className="flex justify-between">
                            <span className="text-slate-600">CATEGORY:</span>
                            <span className="font-bold">{reportData.socialCategory}</span>
                          </div>
                        )}
                      </div>

                      {/* Document Processing & Verification Summary */}
                      <div className="space-y-1 text-[10px] border-b border-dashed border-slate-300 pb-2">
                        <div className="font-bold text-[10px] text-slate-800 tracking-wider">
                          DOCUMENT PROCESSING SUMMARY
                        </div>
                        <div className="flex justify-between">
                          <span>Documents Uploaded:</span>
                          <span className="font-bold">{reportData.uploadedDocumentsCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>OCR Extracted:</span>
                          <span className="font-bold">{reportData.ocrCompletedCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Verification Outcome:</span>
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
                      <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-2">
                        <div className="font-bold text-[10px] text-slate-800 tracking-wider flex justify-between">
                          <span>RECOMMENDED SCHEMES</span>
                          <span>({reportData.recommendedSchemes.length} Matches)</span>
                        </div>

                        {reportData.recommendedSchemes.length === 0 ? (
                          <div className="text-[10px] text-slate-500 italic py-1">
                            No matching welfare schemes for current profile criteria.
                          </div>
                        ) : (
                          <div className="space-y-2 pt-1">
                            {reportData.recommendedSchemes.slice(0, 4).map((scheme, idx) => (
                              <div key={idx} className="text-[9px] space-y-0.5">
                                <div className="font-bold text-slate-900 flex items-start justify-between gap-1">
                                  <span>{idx + 1}. {scheme.schemeName}</span>
                                  <span className="text-[8px] px-1 py-0.2 rounded bg-slate-200 text-slate-700 shrink-0">
                                    {scheme.category}
                                  </span>
                                </div>
                                <div className="text-slate-600 pl-3">
                                  • {scheme.benefitSummary}
                                </div>
                              </div>
                            ))}
                            {reportData.recommendedSchemes.length > 4 && (
                              <div className="text-[9px] text-slate-500 text-center italic pt-1">
                                + {reportData.recommendedSchemes.length - 4} more matching schemes in portal
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Missing Steps / Required Documents */}
                      {(reportData.missingSteps.length > 0 || reportData.missingDocumentsChecklist.length > 0) && (
                        <div className="space-y-1 text-[9px] border-b border-dashed border-slate-300 pb-2">
                          <div className="font-bold text-slate-800">NEXT STEPS & REQUIREMENTS:</div>
                          <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                            {reportData.missingSteps.map((step, idx) => (
                              <li key={`step-${idx}`}>{step}</li>
                            ))}
                            {reportData.missingDocumentsChecklist.slice(0, 3).map((doc, idx) => (
                              <li key={`doc-${idx}`}>Verify {doc}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Transparency Disclaimer */}
                      <div className="text-[8px] text-slate-500 leading-tight border-b border-dashed border-slate-300 pb-2">
                        <strong>Notice:</strong> Advisory assessment. Final sanction subject to government departmental verification.
                      </div>

                      {/* Barcode Simulation & End of Receipt */}
                      <div className="text-center pt-1 space-y-1">
                        <div className="text-[9px] font-bold tracking-widest text-slate-500">
                          ================================
                        </div>
                        <div className="text-[9px] font-bold uppercase tracking-wider">
                          END OF ASSESSMENT RECEIPT
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
              </div>

            </div>

            {/* MECHANICAL CONTROLLER BUTTONS (RE-PRINT, FEED, TEAR, RESET, AUDIO) */}
            <div className="w-full max-w-[440px] mt-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-xl flex items-center justify-between gap-1.5 z-30">
              
              {/* 1. RE-PRINT */}
              <button
                type="button"
                onClick={handleReprintClick}
                disabled={isPrinting}
                className="flex-1 py-2 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[11px] flex items-center justify-center gap-1.5 transition-transform active:scale-95 disabled:opacity-50 shadow-sm"
                title="Restart receipt printing animation from beginning"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>RE-PRINT</span>
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
                <span>FEED</span>
              </button>

              {/* 3. TEAR & DOWNLOAD */}
              <button
                type="button"
                onClick={handleTear}
                disabled={isPrinting}
                className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] flex items-center justify-center gap-1 transition-transform active:scale-95 disabled:opacity-40 shadow-sm"
                title={isTorn ? "Download receipt file again" : "Tear receipt paper and download report"}
              >
                <Scissors className="w-3.5 h-3.5" />
                <span>{isTorn ? "DOWNLOAD" : "TEAR"}</span>
              </button>

              {/* 4. RESET */}
              <button
                type="button"
                onClick={handleReset}
                className="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-[11px] flex items-center justify-center gap-1 transition-transform active:scale-95"
                title="Reset printer to initial state"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RESET</span>
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
                Extracted Information & Verification
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {reportData.uploadedDocumentsCount} Docs
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Citizen Profile:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{reportData.citizenName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">State / Nativity:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{reportData.state}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Age:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{reportData.age} Years</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Annual Family Income:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {reportData.annualIncome !== undefined ? `₹${reportData.annualIncome.toLocaleString('en-IN')}` : 'Not specified'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Authenticity Status:</span>
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
                <div className="text-[11px] font-bold text-slate-400 uppercase">Tracked Vault Documents:</div>
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
                Recommended Government Schemes
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                {reportData.recommendedSchemes.length} Matches
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
                      Official Portal <ExternalLink className="w-3 h-3" />
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
                Action Required Before Applying:
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
    </div>
  );
};

export default ThermalReceiptPrinter;
