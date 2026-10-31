import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  UserCheck,
  FileText,
  BookmarkCheck,
  Bot,
  Monitor,
  ArrowRight,
  ArrowLeft,
  X,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Info
} from 'lucide-react';

export interface HomepageUserGuidanceProps {
  onNavigateTab: (tab: string) => void;
  onGetStarted: (mode: 'wizard' | 'life-event' | 'what-can-i-get') => void;
  onTalkToAI: () => void;
  isWalkthroughOpen?: boolean;
  onToggleWalkthrough?: (isOpen: boolean) => void;
}

export interface WalkthroughStep {
  id: number;
  tabKey: string;
  badgeKey: string;
  badgeDefault: string;
  titleKey: string;
  titleDefault: string;
  descKey: string;
  descDefault: string;
  instructionKey: string;
  instructionDefault: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  bgColor: string;
  borderColor: string;
  actionKey: string;
  actionDefault: string;
  onAction: () => void;
  highlightSelector?: string;
  details?: {
    point1Key: string;
    point1Default: string;
    point2Key: string;
    point2Default: string;
    point3Key: string;
    point3Default: string;
    disclaimerKey?: string;
    disclaimerDefault?: string;
  };
}

export const HomepageUserGuidance: React.FC<HomepageUserGuidanceProps> = ({
  onNavigateTab,
  onGetStarted,
  onTalkToAI,
  isWalkthroughOpen: propIsOpen,
  onToggleWalkthrough
}) => {
  const { t } = useTranslation();
  const [localIsOpen, setLocalIsOpen] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);

  const isControlled = typeof propIsOpen === 'boolean';
  const isWalkthroughOpen = isControlled ? propIsOpen : localIsOpen;

  const setWalkthroughOpen = (open: boolean) => {
    if (!open) {
      setCurrentStepIndex(0);
    }
    if (isControlled) {
      onToggleWalkthrough?.(open);
    } else {
      setLocalIsOpen(open);
    }
  };

  // Reset to step 0 whenever the guide is opened
  useEffect(() => {
    if (isWalkthroughOpen) {
      setCurrentStepIndex(0);
    }
  }, [isWalkthroughOpen]);

  const steps: WalkthroughStep[] = [
    {
      id: 1,
      tabKey: 'schemes',
      badgeKey: 'guidanceStep1Badge',
      badgeDefault: 'STEP 1: DISCOVERY',
      titleKey: 'guidanceStep1Title',
      titleDefault: 'Discover Government Schemes',
      descKey: 'guidanceStep1Desc',
      descDefault: 'Search and filter over 75+ Central and State government welfare schemes by name, category, department, and eligible benefits.',
      instructionKey: 'guidanceStep1Instruction',
      instructionDefault: 'Use the Schemes tab to browse categorized cards, filter by Central or State jurisdiction, or search by keywords such as scholarship, subsidy, or pension.',
      icon: Search,
      accentColor: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/40',
      borderColor: 'border-blue-200 dark:border-blue-800',
      actionKey: 'guidanceStep1Action',
      actionDefault: 'Explore Scheme Directory',
      highlightSelector: '#walkthrough-target-1, #categories-section, #guidance-step-1',
      onAction: () => {
        setWalkthroughOpen(false);
        onNavigateTab('schemes');
      },
      details: {
        point1Key: 'guidanceStep1P1',
        point1Default: 'Keyword & Semantic Search: Find programs using common language or scheme acronyms (e.g., PM-KISAN, PMAY).',
        point2Key: 'guidanceStep1P2',
        point2Default: 'Category Filters: Browse Agriculture, Education, Health, Housing, Women & Child, and more.',
        point3Key: 'guidanceStep1P3',
        point3Default: 'Scheme Comparison: Compare up to 4 schemes side-by-side across 11 statutory eligibility criteria.',
        disclaimerKey: 'guidanceStep1Disclaimer',
        disclaimerDefault: 'GovScheme aggregates schemes published by official Central Ministries and State Departments.'
      }
    },
    {
      id: 2,
      tabKey: 'wizard',
      badgeKey: 'guidanceStep2Badge',
      badgeDefault: 'STEP 2: ELIGIBILITY CHECK',
      titleKey: 'guidanceStep2Title',
      titleDefault: 'Check Scheme Eligibility',
      descKey: 'guidanceStep2Desc',
      descDefault: 'Provide basic demographic information to evaluate criteria against verified eligibility rules.',
      instructionKey: 'guidanceStep2Instruction',
      instructionDefault: 'Launch the Eligibility Wizard to answer quick questions about your age, location, occupation, and family income to see exactly what you qualify for.',
      icon: UserCheck,
      accentColor: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40',
      borderColor: 'border-emerald-200 dark:border-emerald-800',
      actionKey: 'guidanceStep2Action',
      actionDefault: 'Start Eligibility Wizard',
      highlightSelector: '#walkthrough-target-2, #complete-profile-section, #guidance-step-2',
      onAction: () => {
        setWalkthroughOpen(false);
        onGetStarted('wizard');
      },
      details: {
        point1Key: 'guidanceStep2P1',
        point1Default: 'SATISFIED Criteria: Green checkmarks indicate demographic factors that fully meet official guidelines.',
        point2Key: 'guidanceStep2P2',
        point2Default: 'NOT_SATISFIED Criteria: Red alerts highlight age, income, or category criteria outside official limits.',
        point3Key: 'guidanceStep2P3',
        point3Default: 'UNKNOWN Criteria: Amber notices mark optional attributes requiring further documentation.',
        disclaimerKey: 'guidanceStep2Disclaimer',
        disclaimerDefault: 'Preliminary Advisory Notice: Algorithmic checks are for preliminary discovery only. Final statutory eligibility is determined solely by the competent government authority.'
      }
    },
    {
      id: 3,
      tabKey: 'vault',
      badgeKey: 'guidanceStep3Badge',
      badgeDefault: 'STEP 3: DOCUMENT VAULT & OCR',
      titleKey: 'guidanceStep3Title',
      titleDefault: 'Use the Document Vault',
      descKey: 'guidanceStep3Desc',
      descDefault: 'Store essential certificates securely. The built-in AI OCR engine extracts candidate text to auto-fill application forms.',
      instructionKey: 'guidanceStep3Instruction',
      instructionDefault: 'Upload JPG, PNG, or PDF copies of Aadhaar, Income, Community, or Ration Cards. The OCR scanner extracts text with Indic numeral normalization.',
      icon: FileText,
      accentColor: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/40',
      borderColor: 'border-indigo-200 dark:border-indigo-800',
      actionKey: 'guidanceStep3Action',
      actionDefault: 'Open Document Vault',
      highlightSelector: '#walkthrough-target-3, #guidance-step-3',
      onAction: () => {
        setWalkthroughOpen(false);
        onNavigateTab('vault');
      },
      details: {
        point1Key: 'guidanceStep3P1',
        point1Default: 'Encrypted Storage: Uploaded files are isolated per citizen with cryptographic access controls.',
        point2Key: 'guidanceStep3P2',
        point2Default: 'Aadhaar Masking: Identity numbers are masked (XXXX XXXX 1234) for privacy protection.',
        point3Key: 'guidanceStep3P3',
        point3Default: 'Citizen Review Required: You review and approve every extracted field before saving to your profile.',
        disclaimerKey: 'guidanceStep3Disclaimer',
        disclaimerDefault: 'Authenticity Disclaimer: OCR extracts candidate text for your convenience. GovScheme does not certify the statutory or legal authenticity of uploaded documents.'
      }
    },
    {
      id: 4,
      tabKey: 'tracker',
      badgeKey: 'guidanceStep4Badge',
      badgeDefault: 'STEP 4: APPLICATION TRACKING',
      titleKey: 'guidanceStep4Title',
      titleDefault: 'Track Applications',
      descKey: 'guidanceStep4Desc',
      descDefault: 'Record official government application numbers and monitor your milestone progression in one unified dashboard.',
      instructionKey: 'guidanceStep4Instruction',
      instructionDefault: 'After applying on an official government portal (.gov.in / .nic.in), enter your acknowledgement number here to track status updates and deadlines.',
      icon: BookmarkCheck,
      accentColor: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/40',
      borderColor: 'border-purple-200 dark:border-purple-800',
      actionKey: 'guidanceStep4Action',
      actionDefault: 'Open Application Tracker',
      highlightSelector: '#walkthrough-target-4, #guidance-step-4',
      onAction: () => {
        setWalkthroughOpen(false);
        onNavigateTab('tracker');
      },
      details: {
        point1Key: 'guidanceStep4P1',
        point1Default: 'Milestone Timeline: Follow stages from Official Portal Opened to Submitted, Under Verification, and Approved.',
        point2Key: 'guidanceStep4P2',
        point2Default: 'Document Checklist: Check whether required supporting certificates are verified in your vault.',
        point3Key: 'guidanceStep4P3',
        point3Default: 'Official Portal Redirection: One-click links take you directly to authorized government web services.',
        disclaimerKey: 'guidanceStep4Disclaimer',
        disclaimerDefault: 'Tracking Distinction: Tracking records are maintained by the citizen. For legally binding disbursement updates, consult the official departmental portal.'
      }
    },
    {
      id: 5,
      tabKey: 'assistant',
      badgeKey: 'guidanceStep5Badge',
      badgeDefault: 'STEP 5: AI CONVERSATION',
      titleKey: 'guidanceStep5Title',
      titleDefault: 'Access AI Assistance',
      descKey: 'guidanceStep5Desc',
      descDefault: 'Ask questions in your natural language using voice or text to discover matching programs and get eligibility advice.',
      instructionKey: 'guidanceStep5Instruction',
      instructionDefault: 'Open GovScheme AI to converse in English, Hindi, Tamil, Telugu, Malayalam, Marathi, or Gujarati with grounded scheme knowledge.',
      icon: Bot,
      accentColor: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40',
      borderColor: 'border-amber-200 dark:border-amber-800',
      actionKey: 'guidanceStep5Action',
      actionDefault: 'Chat with GovScheme AI',
      highlightSelector: '#walkthrough-target-5, #guidance-step-5',
      onAction: () => {
        setWalkthroughOpen(false);
        onTalkToAI();
      },
      details: {
        point1Key: 'guidanceStep5P1',
        point1Default: '7-Language Parity: Speaks and understands major Indian languages with script transliteration.',
        point2Key: 'guidanceStep5P2',
        point2Default: 'Grounded Responses: Answers are strictly backed by statutory scheme guidelines with zero hallucinations.',
        point3Key: 'guidanceStep5P3',
        point3Default: 'Voice Navigation: Speak naturally using your device microphone for accessibility.',
        disclaimerKey: 'guidanceStep5Disclaimer',
        disclaimerDefault: 'AI Advisory Notice: AI guidance provides navigational help and should not be construed as legal counsel.'
      }
    },
    {
      id: 6,
      tabKey: 'kiosk',
      badgeKey: 'guidanceStep6Badge',
      badgeDefault: 'STEP 6: CSC KIOSK TERMINAL',
      titleKey: 'guidanceStep6Title',
      titleDefault: 'Use CSC Kiosk Services',
      descKey: 'guidanceStep6Desc',
      descDefault: 'Designed for Common Service Centres and public touchscreens with large touch targets, audio guidance, and thermal receipts.',
      instructionKey: 'guidanceStep6Instruction',
      instructionDefault: 'Switch to CSC Kiosk Mode for high-contrast accessibility, automated inactivity timeouts, 58mm/80mm thermal receipt printing, and assisted citizen workflows.',
      icon: Monitor,
      accentColor: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-50 dark:bg-rose-950/40',
      borderColor: 'border-rose-200 dark:border-rose-800',
      actionKey: 'guidanceStep6Action',
      actionDefault: 'Launch Kiosk Terminal Mode',
      highlightSelector: '#walkthrough-target-6, #guidance-step-6',
      onAction: () => {
        setWalkthroughOpen(false);
        onNavigateTab('kiosk');
      },
      details: {
        point1Key: 'guidanceStep6P1',
        point1Default: 'Touchscreen Optimization: Minimum 48px touch targets, big fonts, and simplified 1-tap options.',
        point2Key: 'guidanceStep6P2',
        point2Default: 'Thermal Receipt Printing: Print eligibility summaries directly on 58mm or 80mm POS slip printers.',
        point3Key: 'guidanceStep6P3',
        point3Default: 'Audio Guidance & Privacy: Spoken voice prompts and automatic session timeouts protect public users.',
        disclaimerKey: 'guidanceStep6Disclaimer',
        disclaimerDefault: 'Kiosk Operator Notice: CSC VLE operators can generate instant citizen assessment reports for rural beneficiaries.'
      }
    }
  ];

  const currentStep = steps[currentStepIndex];

  // Highlight targeted homepage section or fallback element
  useEffect(() => {
    const clearHighlights = () => {
      document.querySelectorAll('.govscheme-walkthrough-highlight').forEach((el) => {
        el.classList.remove(
          'govscheme-walkthrough-highlight',
          'ring-4',
          'ring-blue-600',
          'ring-offset-4',
          'ring-offset-white',
          'dark:ring-offset-slate-900',
          'shadow-2xl',
          'relative',
          'z-40'
        );
      });
    };

    if (!isWalkthroughOpen || !currentStep) {
      clearHighlights();
      return;
    }

    let targetEl: HTMLElement | null = null;
    const selectors = (currentStep.highlightSelector || '').split(',').map((s) => s.trim());
    for (const sel of selectors) {
      if (!sel) continue;
      try {
        const found = document.querySelector<HTMLElement>(sel);
        if (found) {
          targetEl = found;
          break;
        }
      } catch {
        // Safe selector handling
      }
    }

    // Fallback to step card if specific target not found
    if (!targetEl) {
      targetEl = document.getElementById(`guidance-step-${currentStep.id}`);
    }

    clearHighlights();

    if (targetEl) {
      targetEl.classList.add(
        'govscheme-walkthrough-highlight',
        'ring-4',
        'ring-blue-600',
        'ring-offset-4',
        'ring-offset-white',
        'dark:ring-offset-slate-900',
        'shadow-2xl',
        'relative',
        'z-40'
      );
      try {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch {
        // Safe scroll fallback
      }
    }

    return () => {
      clearHighlights();
    };
  }, [isWalkthroughOpen, currentStepIndex]);

  // Handle keyboard navigation inside interactive walkthrough
  useEffect(() => {
    if (!isWalkthroughOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setWalkthroughOpen(false);
      } else if (e.key === 'ArrowRight') {
        setCurrentStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowLeft') {
        setCurrentStepIndex((prev) => (prev > 0 ? prev - 1 : prev));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isWalkthroughOpen, steps.length]);

  return (
    <section
      id="how-to-use-govscheme"
      className="space-y-8 pt-8 border-t border-[#DCE5EF] dark:border-slate-800"
      aria-labelledby="guidance-main-heading"
    >
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/70 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-200 dark:border-blue-800">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{t('guidanceBadge', 'Citizen User Guide & Onboarding')}</span>
          </div>
          <h2
            id="guidance-main-heading"
            className="text-2xl sm:text-3xl font-extrabold text-[#12365B] dark:text-white font-sans tracking-tight"
          >
            {t('guidanceSectionHeading', 'How to Use GovScheme — Citizen Service Journey')}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            {t(
              'guidanceSectionSubheading',
              'Follow these 6 steps to find welfare programs, verify your eligibility, scan documents, and track your applications.'
            )}
          </p>
        </div>

        {/* Walkthrough Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setCurrentStepIndex(0);
              setWalkthroughOpen(true);
            }}
            className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition flex items-center gap-2 focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[44px]"
            aria-label={t('startWalkthroughAria', 'Start interactive How to Use walkthrough')}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{t('startWalkthroughBtn', 'Show Me How (Interactive Guide)')}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 6 Step Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {steps.map((step, idx) => {
          const StepIcon = step.icon;
          return (
            <motion.div
              key={step.id}
              id={`guidance-step-${step.id}`}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className="bg-white dark:bg-slate-900 border border-[#DCE5EF] dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition group relative overflow-hidden"
            >
              {/* Top Accent Strip */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 rounded-2xl ${step.bgColor} ${step.borderColor} border flex items-center justify-center ${step.accentColor} shrink-0 group-hover:scale-105 transition-transform`}
                  >
                    <StepIcon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {t(step.badgeKey, step.badgeDefault)}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-base font-bold text-[#12365B] dark:text-white font-sans flex items-center gap-1.5">
                    <span>{t(step.titleKey, step.titleDefault)}</span>
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {t(step.descKey, step.descDefault)}
                  </p>
                </div>

                {/* Sub-points */}
                {step.details && (
                  <ul className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{t(step.details.point1Key, step.details.point1Default)}</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{t(step.details.point2Key, step.details.point2Default)}</span>
                    </li>
                  </ul>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={step.onAction}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition focus:outline-none min-h-[44px]"
                >
                  <span>{t(step.actionKey, step.actionDefault)}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStepIndex(idx);
                    setWalkthroughOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition min-h-[44px] flex items-center"
                >
                  {t('viewGuide', 'Details')}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Interactive Walkthrough Modal / Step-by-Step Overlay */}
      <AnimatePresence>
        {isWalkthroughOpen && currentStep && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-[2px] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="walkthrough-title"
          >
            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 border-2 border-blue-600 dark:border-blue-500 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden my-2 sm:my-6 flex flex-col max-h-[88vh]"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 sm:p-6 relative shrink-0">
                <button
                  type="button"
                  onClick={() => setWalkthroughOpen(false)}
                  className="absolute top-4 sm:top-5 right-4 sm:right-5 text-slate-300 hover:text-white p-2 rounded-full hover:bg-white/10 transition min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label={t('closeWalkthrough', 'Close walkthrough')}
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex flex-wrap items-center gap-2 mb-2 pr-10">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider font-mono">
                    {t(currentStep.badgeKey, currentStep.badgeDefault)}
                  </span>
                  <span className="text-xs text-blue-200">
                    • {t('walkthroughStepOf', 'Step {{current}} of {{total}}', { current: currentStepIndex + 1, total: steps.length })}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const target = document.querySelector('.govscheme-walkthrough-highlight');
                      if (target) {
                        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }}
                    className="text-[11px] font-semibold text-emerald-300 hover:text-white bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 px-2.5 py-0.5 rounded-full flex items-center gap-1 transition"
                    aria-label={t('walkthroughHighlightingLabel', 'Target Section Highlighted')}
                  >
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>{t('walkthroughHighlightingLabel', 'Target Section Highlighted')}</span>
                  </button>
                </div>

                <h3 id="walkthrough-title" className="text-lg sm:text-2xl font-black font-heading tracking-tight">
                  {t(currentStep.titleKey, currentStep.titleDefault)}
                </h3>

                {/* Progress Bar */}
                <div className="w-full bg-white/20 h-1.5 rounded-full mt-3 sm:mt-4 overflow-hidden">
                  <div
                    className="bg-amber-400 h-full transition-all duration-300 ease-out"
                    style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1 text-slate-800 dark:text-slate-200 text-xs sm:text-sm">
                {/* Instruction Highlight Banner */}
                <div className={`p-4 rounded-2xl ${currentStep.bgColor} ${currentStep.borderColor} border space-y-2`}>
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                    <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span className="text-slate-900 dark:text-white">{t('walkthroughInstructionLabel', 'Actionable Guidance')}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {t(currentStep.instructionKey, currentStep.instructionDefault)}
                  </p>
                </div>

                {/* Key Points */}
                {currentStep.details && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {t('whatYouNeedToKnow', 'Key Details & Capabilities')}
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{t(currentStep.details.point1Key, currentStep.details.point1Default)}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{t(currentStep.details.point2Key, currentStep.details.point2Default)}</span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{t(currentStep.details.point3Key, currentStep.details.point3Default)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Statutory Disclaimer */}
                {currentStep.details?.disclaimerKey && (
                  <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2 leading-relaxed">
                    <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{t(currentStep.details.disclaimerKey, currentStep.details.disclaimerDefault || '')}</span>
                  </div>
                )}
              </div>

              {/* Modal Footer Controls */}
              <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
                {/* Left: Direct Feature Action */}
                <button
                  type="button"
                  onClick={currentStep.onAction}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow transition flex items-center justify-center gap-1.5 min-h-[44px]"
                  aria-label={t(currentStep.actionKey, currentStep.actionDefault)}
                >
                  <span>{t(currentStep.actionKey, currentStep.actionDefault)}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {/* Right: Step Navigation Controls */}
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                  {/* Replay Button when at final step */}
                  {currentStepIndex === steps.length - 1 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStepIndex(0)}
                      className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition flex items-center gap-1 min-h-[44px]"
                      aria-label={t('walkthroughReplay', 'Replay Guide')}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t('walkthroughReplay', 'Replay')}</span>
                    </button>
                  )}

                  {/* Previous Step Button */}
                  <button
                    type="button"
                    disabled={currentStepIndex === 0}
                    onClick={() => setCurrentStepIndex((prev) => Math.max(prev - 1, 0))}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-300 font-bold text-xs transition flex items-center gap-1 min-h-[44px]"
                    aria-label={t('walkthroughPrev', 'Previous')}
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{t('walkthroughPrev', 'Previous')}</span>
                  </button>

                  {/* Next Step / Finish Button */}
                  {currentStepIndex < steps.length - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentStepIndex((prev) => Math.min(prev + 1, steps.length - 1))}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-bold text-xs shadow transition flex items-center gap-1 min-h-[44px]"
                      aria-label={t('walkthroughNext', 'Next')}
                    >
                      <span>{t('walkthroughNext', 'Next')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setWalkthroughOpen(false)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition flex items-center gap-1 min-h-[44px]"
                      aria-label={t('walkthroughFinish', 'Finish Guide')}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t('walkthroughFinish', 'Finish Guide')}</span>
                    </button>
                  )}

                  {/* Skip Button */}
                  <button
                    type="button"
                    onClick={() => setWalkthroughOpen(false)}
                    className="px-3.5 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition min-h-[44px]"
                    aria-label={t('walkthroughSkip', 'Skip')}
                  >
                    {t('walkthroughSkip', 'Skip')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default HomepageUserGuidance;
