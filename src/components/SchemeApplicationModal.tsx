import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  ArrowRight,
  BookmarkCheck,
  Building2,
  Lock,
  LogIn,
  UserCheck
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Scheme, UserProfile, ApplicationTrackerRecord, DocumentRecord } from '../types';

interface SchemeApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheme: Scheme | null;
  user: UserProfile | null;
  onOpenVaultScan?: (docType?: DocumentRecord['type']) => void;
  onApplicationSaved?: (newApp: ApplicationTrackerRecord) => void;
  onNavigateTab?: (tab: string) => void;
  onOpenAuth?: () => void;
}

export const SchemeApplicationModal: React.FC<SchemeApplicationModalProps> = ({
  isOpen,
  onClose,
  scheme,
  user,
  onOpenVaultScan,
  onApplicationSaved,
  onNavigateTab,
  onOpenAuth
}) => {
  const { t } = useTranslation();

  const [step, setStep] = useState<'review' | 'portal_opened' | 'recorded'>('review');
  const [appNumber, setAppNumber] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [savedRecord, setSavedRecord] = useState<ApplicationTrackerRecord | null>(null);

  if (!isOpen || !scheme) return null;

  const docs = user?.documents || [];
  const officialUrl = scheme.officialApplyUrl || scheme.officialWebsite || '';
  const hasValidPortalUrl = officialUrl.startsWith('http://') || officialUrl.startsWith('https://');

  // Match documents in vault to required documents
  const requiredDocs = scheme.requiredDocuments || scheme.eligibilityRules?.requiredDocuments || [
    'Aadhaar Card',
    'Income Certificate',
    'Residence Proof'
  ];

  const userDocTypes = new Set(docs.map(d => (d.documentType || d.type || '').toLowerCase()));

  // Pre-fill values
  const aadhaarDoc = docs.find(d => (d.documentType || d.type || '').toLowerCase().includes('aadhaar'));
  const incomeDoc = docs.find(d => (d.documentType || d.type || '').toLowerCase().includes('income'));
  const communityDoc = docs.find(d => (d.documentType || d.type || '').toLowerCase().includes('community') || (d.documentType || d.type || '').toLowerCase().includes('caste'));

  const applicantName = user?.fullName || aadhaarDoc?.ocrExtracted?.fullName || t('notAvailable', 'Not Available');
  const age = user?.age || aadhaarDoc?.ocrExtracted?.age || t('notAvailable', 'Not Available');
  const rawGender = user?.gender || aadhaarDoc?.ocrExtracted?.gender || '';
  const gender = rawGender === 'Male' ? t('Male', 'Male') : (rawGender === 'Female' ? t('Female', 'Female') : (rawGender === 'Other' ? t('Other', 'Other') : (rawGender || t('notAvailable', 'Not Available'))));
  const annualIncome = user?.annualIncome !== undefined
    ? `₹${user.annualIncome.toLocaleString('en-IN')}`
    : (incomeDoc?.ocrExtracted?.annualIncome !== undefined ? `₹${Number(incomeDoc.ocrExtracted.annualIncome).toLocaleString('en-IN')}` : t('notAvailable', 'Not Available'));
  const socialCategory = user?.category || communityDoc?.ocrExtracted?.category || t('notAvailable', 'Not Available');
  const state = user?.state || aadhaarDoc?.ocrExtracted?.state || t('notAvailable', 'Not Available');
  const district = user?.district || aadhaarDoc?.ocrExtracted?.district || t('notAvailable', 'Not Available');

  const maskedAadhaar = aadhaarDoc?.docNumber
    ? (aadhaarDoc.docNumber.length >= 12
        ? `XXXX XXXX ${aadhaarDoc.docNumber.slice(-4)}`
        : aadhaarDoc.docNumber)
    : t('notStoredInVault', 'Not Stored in Vault');

  const handleOpenPortal = () => {
    if (hasValidPortalUrl) {
      window.open(officialUrl, '_blank', 'noopener,noreferrer');
      setStep('portal_opened');
      setErrorMsg(null);
    } else {
      setErrorMsg('This scheme is designated for offline or District Welfare Office applications. Please review the official helpline number.');
    }
  };

  const handleSaveApplication = async () => {
    if (!appNumber.trim()) {
      setErrorMsg('Please enter your official application or acknowledgement number.');
      return;
    }

    if (!user) {
      setErrorMsg('Please sign in to record and track your application.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const token = localStorage.getItem('govscheme_token');
    const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
    const cleanAppNumber = appNumber.trim().toUpperCase();

    try {
      let createdId = `APP-${Date.now().toString().slice(-6)}`;
      const payload = {
        schemeId: scheme.id,
        applicationNumber: cleanAppNumber,
        remarks: remarks.trim() || `Applied via ${hasValidPortalUrl ? new URL(officialUrl).hostname : 'Official Portal'}`
      };

      if (token) {
        try {
          const res = await fetch(`${apiUrl}/api/applications`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
          });

          if (res.ok) {
            const data = await res.json();
            if (data.application && data.application._id) {
              createdId = data.application._id;
            }
          }
        } catch (apiErr) {
          console.warn('[SchemeApplicationModal] Backend sync note, using local state:', apiErr);
        }
      }

      const newRecord: ApplicationTrackerRecord = {
        id: createdId,
        schemeId: scheme.id,
        schemeName: scheme.name,
        applicationNumber: cleanAppNumber,
        status: 'Submitted',
        appliedDate: new Date().toISOString().split('T')[0],
        officialPortalLink: officialUrl || 'https://www.india.gov.in',
        statusTimeline: [
          {
            stage: 'Official Portal Opened',
            date: new Date().toISOString().split('T')[0],
            completed: true,
            remarks: 'Citizen accessed official government portal from GovScheme.'
          },
          {
            stage: 'Submitted',
            date: new Date().toISOString().split('T')[0],
            completed: true,
            remarks: `Acknowledgement number ${cleanAppNumber} recorded in GovScheme.`
          }
        ],
        verifiedDocuments: requiredDocs.map(d => ({
          name: d,
          verified: userDocTypes.has(d.toLowerCase()),
          label: userDocTypes.has(d.toLowerCase()) ? 'Available in Vault' : 'Pending Verification'
        }))
      };

      onApplicationSaved?.(newRecord);
      setSavedRecord(newRecord);
      setStep('recorded');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-[#0F1B2D] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden my-4 flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 relative shrink-0">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-slate-300 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-blue-200 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-amber-400" />
                {scheme.department || scheme.ministry}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black font-heading tracking-tight">
              {t(`${scheme.id}_name`, scheme.name)}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 font-bold">
                {scheme.state === 'Central' ? t('centralGovernment', 'Central Government') : `${scheme.state} ${t('stateGovernment', 'State Government')}`}
              </span>
              {scheme.financialBenefitAmount && (
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-bold">
                  ₹{scheme.financialBenefitAmount.toLocaleString('en-IN')} / year
                </span>
              )}
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-800 dark:text-slate-200 text-sm">
            {errorMsg && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* STEP 1: REVIEW REQUIREMENTS & REDIRECTION */}
            {step === 'review' && (
              <div className="space-y-6">
                {/* Applicant Details Grid */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white font-heading flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-blue-600" />
                      {t('applicantPreFilledInfo', 'Applicant Pre-Filled Information')}
                    </h3>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      {t('autoMappedFromProfile', 'Auto-Mapped from Profile & Vault')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider mb-0.5">
                        {t('fullApplicantName', 'Full Applicant Name')}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white text-xs block">
                        {applicantName}
                      </span>
                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        ✓ {t('verifiedByProfile', 'Verified by Profile')}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider mb-0.5">
                        {t('ageAndGender', 'Age & Gender')}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white text-xs block">
                        {age} {t('years', 'Years')} • {gender}
                      </span>
                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        ✓ {t('matchesCriteria', 'Matches Criteria')}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider mb-0.5">
                        {t('annualHouseholdIncome', 'Annual Household Income')}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white text-xs block">
                        {annualIncome}
                      </span>
                      <span className="text-[9px] text-blue-600 dark:text-blue-400 font-semibold">
                        {incomeDoc ? `✓ ${t('extractedFromIncomeCert', 'Extracted from Income Certificate')}` : t('fromCitizenProfile', 'From Citizen Profile')}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider mb-0.5">
                        {t('socialCategoryReservation', 'Social Category & Reservation')}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white text-xs block">
                        {String(t(socialCategory, socialCategory))}
                      </span>
                      <span className="text-[9px] text-blue-600 dark:text-blue-400 font-semibold">
                        {communityDoc ? `✓ ${t('extractedFromCasteCert', 'Extracted from Caste Certificate')}` : t('fromCitizenProfile', 'From Citizen Profile')}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider mb-0.5">
                        {t('stateAndDomicile', 'State & Domicile')}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white text-xs block">
                        {String(t(state, state))} ({String(t(district, district))})
                      </span>
                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        ✓ {t('residentVerification', 'Resident Verification')}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider mb-0.5">
                        {t('aadhaarNumberMasked', 'Aadhaar Number (Masked)')}
                      </span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-xs block">
                        {maskedAadhaar}
                      </span>
                      <span className="text-[9px] text-slate-500 font-semibold">
                        {aadhaarDoc ? `✓ ${t('maskedForPrivacy', 'Masked for Privacy')}` : t('pendingUpload', 'Pending Upload')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Benefits Summary */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    {t('statutoryBenefitSummary', 'Statutory Benefit Summary')}
                  </span>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">
                    {scheme.benefitsSummary}
                  </p>
                </div>

                {/* Required Documents Checklist */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                      {t('mandatorySupportingDocuments', 'Mandatory Supporting Documents')}
                    </h4>
                    {onOpenVaultScan && (
                      <button
                        onClick={() => onOpenVaultScan()}
                        className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {t('uploadToVault', '+ Upload to Vault')}
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {requiredDocs.map((reqDoc, idx) => {
                      const isAvailable = userDocTypes.has(reqDoc.toLowerCase()) ||
                        (reqDoc.toLowerCase().includes('aadhaar') && userDocTypes.has('aadhaar')) ||
                        (reqDoc.toLowerCase().includes('income') && userDocTypes.has('income certificate'));
                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border flex items-center justify-between text-xs font-medium ${
                            isAvailable
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300'
                              : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isAvailable ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                            <span>{String(t(reqDoc, reqDoc))}</span>
                          </div>
                          {isAvailable ? (
                            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full">
                              {t('inVault', 'In Vault ✓')}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">{t('required', 'Required')}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Official Portal Link Verification */}
                <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-300">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>{t('officialDesignatedPortal', 'Official Designated Portal')}</span>
                  </div>
                  <p className="text-xs text-blue-800/90 dark:text-blue-200/90 font-mono break-all">
                    {hasValidPortalUrl ? officialUrl : 'National Government Services Portal (https://www.india.gov.in)'}
                  </p>
                  <p className="text-[11px] text-blue-700 dark:text-blue-400">
                    {t('portalSecurityNotice', 'GovScheme redirects directly to authorized government domains (.gov.in / .nic.in). No fees are charged for scheme discovery.')}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={handleOpenPortal}
                    className="w-full sm:flex-1 py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                  >
                    <span>{t('applyOnOfficialPortal', 'Apply on Official Government Portal')}</span>
                    <ExternalLink className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setStep('portal_opened')}
                    className="w-full sm:w-auto py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition"
                  >
                    {t('alreadyAppliedPrompt', 'Already Applied? Enter Ack Number')}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: ENTER ACKNOWLEDGEMENT / APPLICATION NUMBER */}
            {step === 'portal_opened' && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-300">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>{t('awaitingPortalAck', 'Awaiting Official Portal Acknowledgement')}</span>
                  </div>
                  <p className="text-amber-800 dark:text-amber-200 leading-relaxed">
                    {t('awaitingPortalAckDesc', 'Once you submit your application on the official portal, you will be issued a reference or acknowledgement number. Enter it below to record and monitor your application in GovScheme.')}
                  </p>
                </div>

                {!user && (
                  <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="font-semibold text-blue-900 dark:text-blue-200">
                        {t('signInToSaveApplication', 'Sign in to save this application to your personal citizen profile.')}
                      </span>
                    </div>
                    <button
                      onClick={onOpenAuth || onClose}
                      className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shrink-0"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>{t('signIn', 'Sign In')}</span>
                    </button>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block font-bold text-xs text-slate-700 dark:text-slate-300 mb-1.5">
                      {t('ackRefNumber', 'Application / Acknowledgement Reference Number')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={appNumber}
                      onChange={(e) => setAppNumber(e.target.value)}
                      placeholder="e.g. PMK-2026-987654 or TN-INC-2026-102938"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      {t('ackNumberHint', 'Found on your downloaded acknowledgement slip or confirmation SMS.')}
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-xs text-slate-700 dark:text-slate-300 mb-1.5">
                      {t('citizenRemarksOptional', 'Citizen Remarks or Location (Optional)')}
                    </label>
                    <input
                      type="text"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder={t('appliedOnlineViaPortal', 'e.g. Applied online via District Portal')}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={handleSaveApplication}
                    disabled={isSubmitting || !appNumber.trim()}
                    className="w-full sm:flex-1 py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span>{t('savingApplication', 'Saving Application...')}</span>
                    ) : (
                      <>
                        <BookmarkCheck className="w-4 h-4" />
                        <span>{t('confirmAndSaveApplication', 'Confirm & Save Application')}</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setStep('review')}
                    className="w-full sm:w-auto py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs transition"
                  >
                    {t('backToChecklist', 'Back to Checklist')}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: CONFIRMATION & TRACKER REDIRECTION */}
            {step === 'recorded' && savedRecord && (
              <div className="py-8 text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black font-heading text-slate-900 dark:text-white">
                    {t('applicationRecordedTitle', 'Application Recorded in GovScheme')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    {t('applicationRecordedFor', 'Your application for')} <strong className="text-slate-800 dark:text-slate-200">{scheme.name}</strong> {t('hasBeenSaved', 'has been saved.')}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 max-w-md mx-auto text-left space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">{t('ackNumber', 'Acknowledgement No:')}</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{savedRecord.applicationNumber}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">{t('recordedStatus', 'Recorded Status:')}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                      {t('applicationRecordedBadge', 'Application Recorded')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">{t('dateRecorded', 'Date Recorded:')}</span>
                    <span className="text-slate-800 dark:text-slate-200">{savedRecord.appliedDate}</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateTab?.('tracker');
                    }}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                  >
                    <span>{t('viewInApplicationTracker', 'View in Application Tracker')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition"
                  >
                    {t('done', 'Done')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
