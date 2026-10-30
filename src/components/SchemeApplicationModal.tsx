import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  FileCheck2,
  Copy,
  Printer,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileText,
  UserCheck,
  Check,
  Building,
  ArrowRight
} from 'lucide-react';
import { Scheme, UserProfile, DocumentRecord } from '../types';

interface SchemeApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheme: Scheme;
  user: UserProfile | null;
  onOpenVaultScan?: (docType: DocumentRecord['type']) => void;
}

export const SchemeApplicationModal: React.FC<SchemeApplicationModalProps> = ({
  isOpen,
  onClose,
  scheme,
  user,
  onOpenVaultScan
}) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const docs = user?.documents || [];

  // Match documents in vault to required documents
  const requiredDocs = scheme.requiredDocuments || scheme.eligibilityRules?.requiredDocuments || [
    'Aadhaar Card',
    'Income Certificate',
    'Residence Proof'
  ];

  const getDocInVault = (reqDocName: string): DocumentRecord | undefined => {
    const lower = reqDocName.toLowerCase();
    return docs.find(d => {
      const typeLower = (d.documentType || d.type || '').toLowerCase();
      if (lower.includes('aadhaar') && typeLower.includes('aadhaar')) return true;
      if (lower.includes('pan') && typeLower.includes('pan')) return true;
      if (lower.includes('income') && typeLower.includes('income')) return true;
      if (lower.includes('ration') && typeLower.includes('ration')) return true;
      if ((lower.includes('voter') || lower.includes('epic')) && typeLower.includes('voter')) return true;
      if ((lower.includes('caste') || lower.includes('community')) && typeLower.includes('community')) return true;
      if (lower.includes('disability') && typeLower.includes('disability')) return true;
      if ((lower.includes('residence') || lower.includes('domicile')) && (typeLower.includes('residence') || typeLower.includes('domicile'))) return true;
      if (lower.includes('birth') && typeLower.includes('birth')) return true;
      return false;
    });
  };

  // Pre-fill values
  const aadhaarDoc = docs.find(d => (d.documentType || d.type || '').toLowerCase().includes('aadhaar'));
  const incomeDoc = docs.find(d => (d.documentType || d.type || '').toLowerCase().includes('income'));
  const panDoc = docs.find(d => (d.documentType || d.type || '').toLowerCase().includes('pan'));
  const voterDoc = docs.find(d => (d.documentType || d.type || '').toLowerCase().includes('voter'));
  const communityDoc = docs.find(d => (d.documentType || d.type || '').toLowerCase().includes('community'));

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

  const panNumber = panDoc?.docNumber || t('notStoredInVault', 'Not Stored in Vault');
  const voterNumber = voterDoc?.docNumber || t('notStoredInVault', 'Not Stored in Vault');
  const incomeCertNumber = incomeDoc?.docNumber || t('notStoredInVault', 'Not Stored in Vault');

  const applicationSummaryText = `================================================
GOVSCHEME PRE-FILLED CITIZEN APPLICATION SUMMARY
================================================
Scheme: ${scheme.name}
Ministry / Department: ${scheme.ministry || scheme.department || 'N/A'}
Beneficiary Level: ${scheme.state || 'Central / State'}

APPLICANT DETAILS:
- Full Name: ${applicantName}
- Age: ${age}
- Gender: ${gender}
- Annual Household Income: ${annualIncome}
- Social Category: ${socialCategory}
- State: ${state}
- District: ${district}

IDENTIFICATION DETAILS:
- Aadhaar (Masked): ${maskedAadhaar}
- PAN Card: ${panNumber}
- Voter ID (EPIC): ${voterNumber}
- Income Certificate No: ${incomeCertNumber}

REQUIRED DOCUMENTS STATUS:
${requiredDocs.map(req => {
  const vDoc = getDocInVault(req);
  return `- ${req}: ${vDoc ? `READY IN VAULT (${vDoc.docNumber || 'Uploaded'})` : 'MISSING'}`;
}).join('\n')}

OFFICIAL APPLICATION PORTAL:
${scheme.officialApplyUrl || scheme.officialWebsite || 'https://www.india.gov.in'}

NOTE: This summary is prepared by GovScheme for citizen convenience to facilitate filling out the official government application form. GovScheme does not charge fees or submit applications directly.
================================================`;

  const handleCopySummary = () => {
    navigator.clipboard.writeText(applicationSummaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden transition-colors my-4 flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 relative shrink-0 print:bg-none print:text-black print:p-2">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-300 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition print:hidden"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1.5">
            <FileCheck2 className="w-5 h-5 text-emerald-400 print:hidden" />
            <span className="text-xs font-bold text-blue-200 uppercase tracking-wider print:text-black">
              {t('preFilledAppFormTitle', 'Intelligent Scheme Pre-Filled Application Form')}
            </span>
          </div>
          <h2 className="text-2xl font-black font-heading tracking-tight">
            {scheme.name}
          </h2>
          <div className="flex items-center gap-2 text-xs text-blue-100/90 mt-1 print:text-slate-600">
            <Building className="w-3.5 h-3.5" />
            <span>{scheme.department || scheme.ministry}</span>
            <span>•</span>
            <span className="font-semibold text-emerald-300 print:text-slate-800">
              {scheme.state === 'Central' ? t('centralGovtScheme', 'Central Government Scheme') : `${scheme.state} ${t('stateScheme', 'State Scheme')}`}
            </span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-800 dark:text-slate-200 text-xs print:p-2 print:overflow-visible">
          {/* Trust Disclaimer */}
          <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 flex items-start gap-3 print:border-black">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5 print:hidden" />
            <div className="text-[11px] leading-relaxed text-blue-900 dark:text-blue-200">
              <span className="font-bold">{t('autoFormAssistantTitle', 'Automated Form Filling Assistant')}: </span>
              {t('autoFormAssistantDesc', 'Your verified citizen profile and vault documents have been mapped into the application form below. You can copy or print this pre-filled summary to quickly submit your application on the official government portal.')}
            </div>
          </div>

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
                  {socialCategory}
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
                  {state} ({district})
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

          {/* Document Readiness Checklist for Scheme */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white font-heading flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                {t('schemeDocReadinessChecklist', 'Scheme Document Readiness Checklist')}
              </h3>
              <span className="text-[10px] text-slate-500 font-semibold">
                {t('requiredForPortalApproval', 'Required for Portal Approval')}
              </span>
            </div>

            <div className="space-y-2">
              {requiredDocs.map((reqDoc, idx) => {
                const vaultDoc = getDocInVault(reqDoc);
                const isReady = Boolean(vaultDoc);

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                      isReady
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60'
                        : 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {isReady ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      )}
                      <div>
                        <span className="font-bold text-xs text-slate-900 dark:text-white block">
                          {reqDoc}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {isReady
                            ? `${t('availableInVault', 'Available in Vault')} (ID: ${vaultDoc?.docNumber || t('formatVerified', 'Format Verified')})`
                            : t('notUploadedInVaultYet', 'Not uploaded in Vault yet')}
                        </span>
                      </div>
                    </div>

                    {!isReady && onOpenVaultScan && (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenVaultScan(reqDoc as any);
                        }}
                        className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] shadow-sm transition print:hidden"
                      >
                        {t('scanNow', 'Scan Now')}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Sticky Actions */}
        <div className="bg-slate-50 dark:bg-slate-800/90 border-t border-slate-200 dark:border-slate-700 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleCopySummary}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition flex items-center justify-center gap-1.5"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? t('summaryCopied', 'Summary Copied!') : t('copySummary', 'Copy Summary')}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition flex items-center justify-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>{t('printForm', 'Print Form')}</span>
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-bold text-xs transition"
            >
              {t('close', 'Close')}
            </button>

            <button
              type="button"
              onClick={() => {
                if (scheme.officialApplyUrl || scheme.officialWebsite) {
                  window.open(scheme.officialApplyUrl || scheme.officialWebsite, '_blank', 'noopener,noreferrer');
                }
              }}
              className="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
            >
              <span>{t('applyOnOfficialPortal', 'Apply on Official Portal')}</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

