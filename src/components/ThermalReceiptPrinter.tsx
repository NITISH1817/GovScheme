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
  ChevronUp
} from 'lucide-react';
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
  const [activeTabSection, setActiveTabSection] = useState<'printer' | 'details'>('printer');

  // Audio synthesis ref
  const audioContextRef = useRef<AudioContext | null>(null);
  const printTimerRef = useRef<any>(null);

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
      // Audio autoplay or web audio policy catch
    }
  };

  // Start smooth print animation
  const startPrint = () => {
    if (isPrinting) return;
    setIsPrinting(true);
    setIsTorn(false);
    setFeedOffset(0);
    setPaperProgress(0);

    let progress = 0;
    if (printTimerRef.current) clearInterval(printTimerRef.current);

    printTimerRef.current = setInterval(() => {
      progress += 4;
      setPaperProgress(Math.min(progress, 100));
      if (progress % 12 === 0) {
        playMechanicalSound(500 + Math.random() * 200, 0.05);
      }
      if (progress >= 100) {
        clearInterval(printTimerRef.current);
        printTimerRef.current = null;
        setIsPrinting(false);
      }
    }, 60);
  };

  // Initial print when component mounts
  useEffect(() => {
    if (reportData.isComplete) {
      startPrint();
    }
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
    setFeedOffset(prev => prev + 40);
    playMechanicalSound(350, 0.06);
  };

  // Tear button: detaches receipt
  const handleTear = () => {
    if (isPrinting || isTorn) return;
    setIsTorn(true);
    playMechanicalSound(1200, 0.12);
  };

  // Reset button: restores initial printer state
  const handleReset = () => {
    if (printTimerRef.current) clearInterval(printTimerRef.current);
    setIsPrinting(false);
    setIsTorn(false);
    setPaperProgress(0);
    setFeedOffset(0);
  };

  // Re-print button: restarts animation
  const handleReprintClick = () => {
    if (onReprint) onReprint();
    startPrint();
  };

  const handlePrintPdf = () => {
    window.print();
  };

  // Calculate paper height in px: fully out = 640px + feedOffset
  const paperTranslation = Math.min(680, (paperProgress / 100) * 580) + feedOffset;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Printer Section Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-300/40">
            <Printer className="w-3.5 h-3.5" /> AI Report Printer Module
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Thermal Citizen Eligibility Report
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Rendered live from verified OCR attributes and deterministic recommendation matching.
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
          
          {/* Subdued Grid Backdrop Container */}
          <div className="w-full max-w-[460px] bg-slate-100/90 dark:bg-slate-950/80 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-inner flex flex-col items-center relative overflow-hidden">
            
            {/* Subtle Grid Lines Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:16px_16px] opacity-30 dark:opacity-10 pointer-events-none" />

            {/* Title Badge on Printer */}
            <div className="text-center mb-6 z-10">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                AI Thermal Receipt Dispenser
              </span>
            </div>

            {/* THE PRINTER MACHINE HOUSING (Stationary White Thermal Head) */}
            <div className="w-full max-w-[380px] relative z-20">
              
              {/* Outer Printer Curved Chasis */}
              <div className="w-full h-24 bg-gradient-to-b from-white via-slate-50 to-slate-200 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 rounded-t-3xl rounded-b-xl border-t border-x border-slate-300 dark:border-slate-700 shadow-[0_12px_24px_rgba(0,0,0,0.12)] relative flex flex-col items-center justify-between p-3">
                
                {/* Status Indicator LED lights */}
                <div className="w-full flex items-center justify-between px-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${isPrinting ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                      {isPrinting ? 'PRINTING' : 'READY'}
                    </span>
                  </div>
                  <span className="font-mono text-[9px] text-slate-400">THERMAL 80MM</span>
                </div>

                {/* Dark Horizontal Recessed Paper Ejection Slot */}
                <div className="w-[92%] h-4 bg-slate-950 rounded-full shadow-[inset_0_4px_8px_rgba(0,0,0,0.9)] border-b border-white/20 relative overflow-hidden">
                  <div className="absolute inset-x-2 top-1 h-[2px] bg-slate-800 rounded-full" />
                </div>
              </div>

              {/* CLIPPED RECEIPT PAPER CONTAINER (Emerges from beneath the slot) */}
              <div 
                className="w-full flex justify-center relative overflow-hidden" 
                style={{ minHeight: '440px', marginTop: '-6px' }}
              >
                {/* The Paper Sheet */}
                <div
                  className={`w-[88%] bg-[#fcfcfc] text-slate-900 font-mono text-[11px] leading-tight shadow-[0_14px_30px_rgba(0,0,0,0.18)] border-x border-slate-300 dark:border-slate-300 rounded-b-md transition-all duration-300 select-text ${
                    isTorn ? 'translate-y-6 rotate-1 opacity-90' : ''
                  }`}
                  style={{
                    transform: isTorn 
                      ? `translateY(${Math.max(10, paperTranslation - 320)}px) rotate(1.2deg)` 
                      : `translateY(${paperTranslation > 0 ? 0 : -100}%)`,
                    maxHeight: '620px',
                    overflowY: 'auto'
                  }}
                >
                  
                  {/* Believable Torn Paper Top Edge if Torn */}
                  {isTorn ? (
                    <div 
                      className="w-full h-4 bg-repeat-x bg-[bottom]" 
                      style={{
                        backgroundImage: `radial-gradient(circle, transparent, transparent 50%, #fcfcfc 50%, #fcfcfc 100%)`,
                        backgroundSize: '12px 12px'
                      }} 
                    />
                  ) : (
                    <div className="h-2 bg-slate-200/50" />
                  )}

                  {/* Red/Orange Logo Banner inside Thermal Receipt Header */}
                  <div className="p-3 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white rounded-t-sm text-center shadow-inner my-1 mx-2">
                    <span className="text-[10px] font-black uppercase tracking-widest block">
                      ★ GOVSCHEME CITIZEN REPORT ★
                    </span>
                    <span className="text-[8px] opacity-80 uppercase tracking-wider block">
                      NATIONAL WELFARE ADVISORY ENGINE
                    </span>
                  </div>

                  {/* Printable Thermal Receipt Text Content */}
                  <div className="p-4 space-y-3">
                    
                    {/* Header text */}
                    <div className="text-center space-y-0.5 border-b border-dashed border-slate-400 pb-2.5">
                      <div className="font-extrabold text-xs uppercase tracking-wide">
                        CITIZEN VERIFICATION & SCHEMES
                      </div>
                      <div className="text-[10px] text-slate-600">
                        OFFICIAL SUMMARY ASSESSMENT
                      </div>
                      <div className="text-[9px] text-slate-500 pt-1">
                        Report ID: <strong className="font-bold">{reportData.reportId}</strong>
                      </div>
                      <div className="text-[9px] text-slate-500">
                        Date: {reportData.generatedDate}
                      </div>
                    </div>

                    {/* Citizen Profile Snapshot */}
                    <div className="space-y-1 text-[10px] border-b border-dashed border-slate-300 pb-2">
                      <div className="flex justify-between">
                        <span className="text-slate-600">CITIZEN:</span>
                        <span className="font-bold truncate max-w-[140px]">{reportData.citizenName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">STATE:</span>
                        <span className="font-bold">{reportData.state}</span>
                      </div>
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
                    </div>

                    {/* Document Isolation & OCR Summary */}
                    <div className="space-y-1 text-[10px] border-b border-dashed border-slate-300 pb-2">
                      <div className="font-bold text-[10px] text-slate-700 tracking-wider">
                        DOCUMENT SUMMARY
                      </div>
                      <div className="flex justify-between">
                        <span>Documents Uploaded:</span>
                        <span className="font-bold">{reportData.uploadedDocumentsCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>OCR Processed:</span>
                        <span className="font-bold">{reportData.ocrCompletedCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Verification Status:</span>
                        <span className="font-bold text-emerald-700">{reportData.verificationOutcome}</span>
                      </div>

                      {/* Document List */}
                      {reportData.documents.length > 0 && (
                        <div className="pt-1.5 space-y-1">
                          {reportData.documents.map((doc, idx) => (
                            <div key={idx} className="flex justify-between text-[9px] text-slate-600 bg-slate-100 p-1 rounded">
                              <span className="font-bold uppercase">{doc.documentType}:</span>
                              <span>{doc.maskedIdentifier} [{doc.verificationStatus}]</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Recommended Schemes */}
                    <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-2">
                      <div className="font-bold text-[10px] text-slate-700 tracking-wider flex justify-between">
                        <span>RECOMMENDED SCHEMES</span>
                        <span>({reportData.recommendedSchemes.length})</span>
                      </div>

                      {reportData.recommendedSchemes.length === 0 ? (
                        <div className="text-[10px] text-slate-500 italic py-1">
                          No qualifying schemes found for current demographic profile.
                        </div>
                      ) : (
                        <div className="space-y-2 pt-1">
                          {reportData.recommendedSchemes.slice(0, 4).map((scheme, idx) => (
                            <div key={idx} className="text-[9px] space-y-0.5">
                              <div className="font-bold text-slate-900">
                                {idx + 1}. {scheme.schemeName}
                              </div>
                              <div className="text-slate-600 pl-3">
                                • {scheme.benefitSummary}
                              </div>
                            </div>
                          ))}
                          {reportData.recommendedSchemes.length > 4 && (
                            <div className="text-[9px] text-slate-500 text-center italic">
                              + {reportData.recommendedSchemes.length - 4} more schemes in full profile view
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Missing Document Checklist */}
                    {reportData.missingDocumentsChecklist.length > 0 && (
                      <div className="space-y-1 text-[9px] border-b border-dashed border-slate-300 pb-2">
                        <div className="font-bold text-slate-700">DOCUMENTS STILL REQUIRED:</div>
                        <ul className="list-disc pl-4 space-y-0.5 text-slate-600">
                          {reportData.missingDocumentsChecklist.slice(0, 4).map((doc, idx) => (
                            <li key={idx}>{doc}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Official Transparency Disclaimer */}
                    <div className="text-[8px] text-slate-500 leading-tight border-b border-dashed border-slate-300 pb-2">
                      <strong>Important Notice:</strong> Recommendations are advisory. Final sanction is determined solely by the competent authority following official verification.
                    </div>

                    {/* Footer End of Report Barcode Simulation */}
                    <div className="text-center pt-2 space-y-1">
                      <div className="text-[9px] font-bold tracking-widest">
                        ================================
                      </div>
                      <div className="text-[9px] font-bold uppercase tracking-wider">
                        END OF ASSESSMENT REPORT
                      </div>
                      {/* CSS Barcode lines */}
                      <div className="h-6 flex items-center justify-center gap-0.5 pt-1 opacity-70">
                        {Array.from({ length: 42 }).map((_, i) => (
                          <span
                            key={i}
                            className="bg-black inline-block h-full"
                            style={{ width: i % 3 === 0 ? '3px' : i % 2 === 0 ? '1.5px' : '1px' }}
                          />
                        ))}
                      </div>
                      <div className="text-[8px] text-slate-400 font-mono">
                        *{reportData.reportId}*
                      </div>
                    </div>

                  </div>
                </div>
              </div>

            </div>

            {/* MECHANICAL CONTROLLER BUTTONS (RE-PRINT, TEAR, FEED, RESET, AUDIO) */}
            <div className="w-full max-w-[420px] mt-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full p-1.5 shadow-xl flex items-center justify-between gap-1 z-30">
              
              {/* 1. RE-PRINT */}
              <button
                type="button"
                onClick={handleReprintClick}
                disabled={isPrinting}
                className="flex-1 py-2 px-2.5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:bg-slate-800 font-black text-[11px] flex items-center justify-center gap-1.5 transition-transform active:scale-95 disabled:opacity-50"
                title="Restart printing animation"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>RE-PRINT</span>
              </button>

              {/* 2. TEAR */}
              <button
                type="button"
                onClick={handleTear}
                disabled={isPrinting || isTorn}
                className="py-2 px-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white font-black text-[11px] flex items-center justify-center gap-1 transition-transform active:scale-95 disabled:opacity-40 shadow-sm"
                title="Tear receipt paper"
              >
                <Scissors className="w-3.5 h-3.5" />
                <span>TEAR</span>
              </button>

              {/* 3. FEED */}
              <button
                type="button"
                onClick={handleFeed}
                disabled={isPrinting}
                className="py-2 px-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-[11px] flex items-center justify-center gap-1 transition-colors"
                title="Advance paper downward"
              >
                <ArrowDown className="w-3.5 h-3.5" />
                <span>FEED</span>
              </button>

              {/* 4. RESET */}
              <button
                type="button"
                onClick={handleReset}
                className="py-2 px-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-black text-[11px] flex items-center justify-center gap-1 transition-colors"
                title="Reset printer to initial position"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RESET</span>
              </button>

              {/* 5. AUDIO */}
              <button
                type="button"
                onClick={() => {
                  const nextState = !isAudioEnabled;
                  setIsAudioEnabled(nextState);
                  if (nextState) playMechanicalSound(700, 0.08);
                }}
                className={`p-2 rounded-full transition-colors ${
                  isAudioEnabled 
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' 
                    : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title={isAudioEnabled ? 'Mute printer audio' : 'Enable thermal printer sound effects'}
              >
                {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

            </div>

          </div>
        </div>

        {/* Right Column: Structured Live Report Details & Audit Records (Span 5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Section 1: AI Document Assistant & Extracted Info */}
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
                  {reportData.annualIncome !== undefined ? `₹${reportData.annualIncome.toLocaleString('en-IN')}` : 'Not provided'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Authenticity Status:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{reportData.verificationOutcome}</span>
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

          {/* Section 3: Missing Document Warnings */}
          {reportData.missingDocumentsChecklist.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 space-y-2">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                Required Supporting Documents Before Applying:
              </div>
              <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                {reportData.missingDocumentsChecklist.map((doc, idx) => (
                  <li key={idx}>{doc}</li>
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
