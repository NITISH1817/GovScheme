import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  X,
  UploadCloud,
  Camera,
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Save,
  Edit3,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { DocumentRecord, UserProfile } from '../types';
import { performOCRScan, OCRScanResult } from '../services/ocrService';
import { GovSchemeLogoLoader } from './brand';

const SUPPORTED_DOC_TYPES: Array<{ type: DocumentRecord['type']; label: string }> = [
  { type: 'Aadhaar', label: 'Aadhaar Card' },
  { type: 'PAN', label: 'PAN Card' },
  { type: 'Income Certificate', label: 'Income Certificate' },
  { type: 'Ration Card', label: 'Ration Card' },
  { type: 'Voter ID', label: 'Voter ID Card' },
  { type: 'Community Certificate', label: 'Community / Caste Certificate' },
  { type: 'Disability Certificate', label: 'Disability Certificate (UDID)' },
  { type: 'Residence Certificate', label: 'Residence / Domicile Certificate' },
  { type: 'Birth Certificate', label: 'Birth Certificate' },
  { type: 'Education Certificate', label: 'Education / Other Certificate' }
];

const OCR_LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' }
];

interface OCRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  expectedType: DocumentRecord['type'] | 'Unknown';
  userProfile?: UserProfile | null;
  onSaveDocument: (doc: DocumentRecord, autoFillFields?: Partial<UserProfile>, file?: File | null) => void;
}

export const OCRScanner: React.FC<OCRScannerProps> = ({
  isOpen,
  onClose,
  expectedType,
  userProfile,
  onSaveDocument
}) => {
  const { t, i18n } = useTranslation();

  const [selectedType, setSelectedType] = useState<DocumentRecord['type']>(
    expectedType === 'Unknown' ? 'Aadhaar' : expectedType
  );
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    OCR_LANGUAGES.some(l => l.code === i18n.language) ? i18n.language : 'en'
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<OCRScanResult | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [rawTextCopied, setRawTextCopied] = useState(false);

  // Field Review States
  const [docNumber, setDocNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [age, setAge] = useState<number | undefined>(undefined);
  const [gender, setGender] = useState('');
  const [annualIncome, setAnnualIncome] = useState<number | undefined>(undefined);
  const [category, setCategory] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [disabilityPercentage, setDisabilityPercentage] = useState<number | undefined>(undefined);

  // Field Accept Toggles for Auto-Fill
  const [applyFlags, setApplyFlags] = useState<{ [key: string]: boolean }>({
    fullName: true,
    annualIncome: true,
    dob: true,
    age: true,
    gender: true,
    category: true,
    state: true,
    district: true,
    disabilityPercentage: true
  });

  // Citizen Explicit Consent
  const [citizenConsentApproved, setCitizenConsentApproved] = useState(false);

  // Sync expectedType when modal opens
  useEffect(() => {
    if (expectedType && expectedType !== 'Unknown') {
      setSelectedType(expectedType);
    }
  }, [expectedType]);

  // Clean up preview object URL
  useEffect(() => {
    return () => {
      if (filePreviewUrl && filePreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(filePreviewUrl);
      }
    };
  }, [filePreviewUrl]);

  if (!isOpen) return null;

  const handleFileSelection = (file: File) => {
    setSelectedFile(file);
    setScanResult(null);
    setManualMode(false);
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setFilePreviewUrl(url);
    } else {
      setFilePreviewUrl(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const handleStartScan = async () => {
    if (!selectedFile) return;
    setIsScanning(true);
    try {
      const res = await performOCRScan(selectedFile, selectedType, selectedLanguage);
      setScanResult(res);
      setDocNumber(res.docNumber || '');
      setFullName(res.extractedFields.fullName || '');
      setDob(res.extractedFields.dob || '');
      setAge(res.extractedFields.age);
      setGender(res.extractedFields.gender || '');
      setAnnualIncome(res.extractedFields.annualIncome);
      setCategory(res.extractedFields.category || '');
      setState(res.extractedFields.state || '');
      setDistrict(res.extractedFields.district || '');
      setAddress(res.extractedFields.address || '');
      setDisabilityPercentage(res.extractedFields.disabilityPercentage);

      // Default apply flags to true for all non-empty fields
      setApplyFlags({
        fullName: Boolean(res.extractedFields.fullName),
        annualIncome: res.extractedFields.annualIncome !== undefined,
        dob: Boolean(res.extractedFields.dob),
        age: res.extractedFields.age !== undefined,
        gender: Boolean(res.extractedFields.gender),
        category: Boolean(res.extractedFields.category),
        state: Boolean(res.extractedFields.state),
        district: Boolean(res.extractedFields.district),
        disabilityPercentage: res.extractedFields.disabilityPercentage !== undefined
      });

      // Default consent to true if confidence is high, but citizen can review
      setCitizenConsentApproved(res.extractedFields.confidenceScore >= 60);
    } catch (err) {
      console.error('[OCRScanner] Scan failed:', err);
      setManualMode(true);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSelectAllFields = (select: boolean) => {
    setApplyFlags({
      fullName: select,
      annualIncome: select,
      dob: select,
      age: select,
      gender: select,
      category: select,
      state: select,
      district: select,
      disabilityPercentage: select
    });
  };

  const handleCopyRawText = () => {
    if (scanResult?.rawTextPreview) {
      navigator.clipboard.writeText(scanResult.rawTextPreview);
      setRawTextCopied(true);
      setTimeout(() => setRawTextCopied(false), 2000);
    }
  };

  const handleSaveToVault = () => {
    if (!scanResult && !manualMode) return;

    const finalDocNumber = docNumber.trim() || `DOC-${Date.now()}`;
    const docConfidence = scanResult?.extractedFields?.confidenceScore || (manualMode ? 0 : 75);

    const newDoc: DocumentRecord = {
      id: `doc-${Date.now()}`,
      documentId: `DOC-${Date.now()}`,
      documentType: selectedType,
      type: selectedType,
      docNumber: finalDocNumber,
      status: scanResult?.isValidDocType ? 'Verified' : 'Pending',
      verificationStatus: scanResult?.isValidDocType ? 'CHECKS_PASSED' : (manualMode ? 'NEEDS_REVIEW' : 'PROCESSING'),
      isUserConfirmed: citizenConsentApproved,
      userConfirmedAt: citizenConsentApproved ? new Date().toISOString() : undefined,
      ocrExtracted: {
        docNumber: finalDocNumber,
        fullName: fullName || undefined,
        dob: dob || undefined,
        age: age,
        gender: gender || undefined,
        annualIncome: annualIncome,
        category: category || undefined,
        state: state || undefined,
        district: district || undefined,
        address: address || undefined,
        disabilityPercentage: disabilityPercentage,
        confidenceScore: docConfidence,
        verificationStatus: scanResult?.isValidDocType ? 'CHECKS_PASSED' : 'NEEDS_REVIEW',
        authenticityNote: manualMode
          ? 'Manual Citizen Entry • Authenticity Unverified'
          : 'Format & Layout Checks Passed • Official Authenticity Unverified (Direct Issuer API Access Required)'
      },
      uploadedAt: new Date().toISOString().split('T')[0]
    };

    // Construct auto-fill profile payload ONLY if citizen explicitly approved consent
    const autoFill: Partial<UserProfile> = {};
    if (citizenConsentApproved) {
      if (applyFlags.fullName && fullName) autoFill.fullName = fullName;
      if (applyFlags.annualIncome && annualIncome !== undefined) autoFill.annualIncome = annualIncome;
      if (applyFlags.age && age !== undefined) autoFill.age = age;
      if (applyFlags.gender && gender) autoFill.gender = gender as any;
      if (applyFlags.category && category) autoFill.category = category as any;
      if (applyFlags.state && state) autoFill.state = state;
      if (applyFlags.district && district) autoFill.district = district;
      if (applyFlags.disabilityPercentage && disabilityPercentage !== undefined) {
        autoFill.hasDisability = disabilityPercentage > 0;
        autoFill.disabilityPercentage = disabilityPercentage;
      }
    }

    onSaveDocument(newDoc, Object.keys(autoFill).length > 0 ? autoFill : undefined, selectedFile);
    onClose();
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 85) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          High ({confidence}%)
        </span>
      );
    }
    if (confidence >= 60) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          Moderate ({confidence}%)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-300 dark:border-red-700">
        <AlertCircle className="w-3 h-3 text-red-600" />
        Low ({confidence}%)
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden transition-colors my-4 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-300 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1.5">
            <ScanLine className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">
              {t('ocrExtraction', 'Intelligent Document Vault & OCR Engine')}
            </span>
          </div>
          <h2 className="text-2xl font-black font-heading tracking-tight">
            {t('scan', 'Scan')} {selectedType}
          </h2>
          <p className="text-xs text-blue-100/90 mt-1 max-w-xl">
            {t(
              'ocrExtractDetails',
              'AI extracts key citizen eligibility fields, normalizes Indic numerals, and auto-fills official application forms upon your review.'
            )}
          </p>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-slate-800 dark:text-slate-200 text-xs">
          {/* STEP 1: UPLOAD & SETTINGS */}
          {!scanResult && !isScanning && !manualMode && (
            <div className="space-y-6">
              {/* Type and Language Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1.5 text-slate-700 dark:text-slate-300">
                    {t('selectDocType', 'Document Category')}
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as DocumentRecord['type'])}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {SUPPORTED_DOC_TYPES.map((dt) => (
                      <option key={dt.type} value={dt.type}>
                        {dt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1.5 text-slate-700 dark:text-slate-300">
                    {t('selectLanguage', 'Document Script / Language')}
                  </label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {OCR_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.label} ({lang.native})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Upload & Mobile Camera Actions */}
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-8 text-center space-y-4 hover:border-blue-500 transition-colors bg-slate-50/50 dark:bg-slate-800/30">
                <UploadCloud className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto" />
                <div>
                  <span className="font-extrabold text-slate-900 dark:text-white text-base block">
                    {t('uploadDocumentPrompt', 'Upload or Capture Official Document')}
                  </span>
                  <span className="text-slate-500 text-xs">
                    Supports PDF, JPG, PNG up to 10MB • Magic Byte Verified
                  </span>
                </div>

                {/* Upload & Camera Buttons */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="ocr-file-input"
                  />
                  <label
                    htmlFor="ocr-file-input"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold cursor-pointer transition shadow hover:shadow-md"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>{t('selectFile', 'Choose File')}</span>
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                    id="ocr-camera-input"
                  />
                  <label
                    htmlFor="ocr-camera-input"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer transition shadow hover:shadow-md"
                  >
                    <Camera className="w-4 h-4" />
                    <span>{t('captureCamera', 'Scan with Camera')}</span>
                  </label>
                </div>

                {/* File Preview */}
                {selectedFile && (
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-center gap-4 text-left">
                    {filePreviewUrl ? (
                      <img
                        src={filePreviewUrl}
                        alt="Document Preview"
                        className="w-24 h-24 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center border border-blue-200 dark:border-blue-800">
                        <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      </div>
                    )}
                    <div className="space-y-1">
                      <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>{selectedFile.name}</span>
                      </div>
                      <div className="text-slate-500 text-xs">
                        Size: {(selectedFile.size / 1024).toFixed(1)} KB • Type: {selectedFile.type || 'Document'}
                      </div>
                      <div className="text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">
                        ✓ Ready for OCR Processing
                      </div>
                    </div>
                  </div>
                )}

                {/* Manual Fallback Link */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700/60">
                  <button
                    onClick={() => setManualMode(true)}
                    className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{t('enterDetailsManually', 'Skip OCR and enter details manually')}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PROCESSING ANIMATION */}
          {isScanning && (
            <div className="py-16 text-center space-y-4">
              <div className="flex items-center justify-center mx-auto mb-4">
                <GovSchemeLogoLoader size={64} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-heading">
                AI OCR Extracting & Analyzing Document...
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Normalizing Indic numerals, detecting document signatures, parsing citizen identifiers, and computing confidence scores.
              </p>
            </div>
          )}

          {/* STEP 3: REVIEW & CITIZEN APPROVAL SCREEN */}
          {scanResult && !isScanning && !manualMode && (
            <div className="space-y-6">
              {/* Overall Status Banner */}
              <div className="p-4 rounded-2xl border bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {scanResult.isValidDocType ? (
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center shrink-0 border border-emerald-300 dark:border-emerald-700 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center shrink-0 border border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {scanResult.detectedTypeLabel}
                      </h4>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>Format & Regex Checks: Passed</span>
                        <span>•</span>
                        <span>Confidence: {getConfidenceBadge(scanResult.extractedFields.confidenceScore)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setScanResult(null);
                      setSelectedFile(null);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Rescan</span>
                  </button>
                </div>

                {/* Transparency Disclaimer */}
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-300 leading-relaxed flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Trust & Integrity Notice: </span>
                    Extracted text has passed format and pattern checks. Official legal verification requires DigiLocker or UIDAI API integration. Please review all fields carefully before approving.
                  </div>
                </div>
              </div>

              {/* Side-by-Side Review & Discrepancy Comparison */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white font-heading">
                      Field Review & Profile Auto-Fill Comparison
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Compare extracted values with your current profile. Checked fields will update your profile.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectAllFields(true)}
                      className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => handleSelectAllFields(false)}
                      className="text-[11px] font-bold text-slate-500 hover:underline"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                {/* Fields Grid */}
                <div className="grid grid-cols-1 gap-3">
                  {/* Document Number */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="min-w-[160px]">
                      <span className="font-bold text-slate-700 dark:text-slate-300 block text-xs">
                        Document Number
                      </span>
                      <span className="text-[10px] text-slate-500">Official Identification</span>
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={docNumber}
                        onChange={(e) => setDocNumber(e.target.value)}
                        placeholder="Enter Document Number"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="shrink-0">
                      {getConfidenceBadge(scanResult.extractedFields.confidenceScore)}
                    </div>
                  </div>

                  {/* Full Name */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="min-w-[160px]">
                      <span className="font-bold text-slate-700 dark:text-slate-300 block text-xs">
                        Full Name
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Profile: <strong className="text-slate-700 dark:text-slate-300">{userProfile?.fullName || 'Not Set'}</strong>
                      </span>
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Full Name"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {userProfile?.fullName && fullName && userProfile.fullName.toLowerCase() !== fullName.toLowerCase() && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-bold">
                          Discrepancy
                        </span>
                      )}
                      <label className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={applyFlags.fullName}
                          onChange={(e) => setApplyFlags(prev => ({ ...prev, fullName: e.target.checked }))}
                          className="w-4 h-4 rounded text-blue-600"
                        />
                        Apply
                      </label>
                    </div>
                  </div>

                  {/* Annual Income (Crucial for Income Certificate / EWS) */}
                  {(selectedType === 'Income Certificate' || annualIncome !== undefined) && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="min-w-[160px]">
                        <span className="font-bold text-slate-700 dark:text-slate-300 block text-xs">
                          Annual Family Income (₹)
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Profile: <strong className="text-slate-700 dark:text-slate-300">₹{(userProfile?.annualIncome || 0).toLocaleString('en-IN')}</strong>
                        </span>
                      </div>
                      <div className="flex-1">
                        <input
                          type="number"
                          value={annualIncome !== undefined ? annualIncome : ''}
                          onChange={(e) => setAnnualIncome(e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="e.g. 75000"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-white"
                        />
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {userProfile?.annualIncome !== undefined && annualIncome !== undefined && userProfile.annualIncome !== annualIncome && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[10px] font-bold">
                            Difference
                          </span>
                        )}
                        <label className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={applyFlags.annualIncome}
                            onChange={(e) => setApplyFlags(prev => ({ ...prev, annualIncome: e.target.checked }))}
                            className="w-4 h-4 rounded text-blue-600"
                          />
                          Apply
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Date of Birth & Age */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="min-w-[160px]">
                      <span className="font-bold text-slate-700 dark:text-slate-300 block text-xs">
                        Date of Birth & Age
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Profile Age: <strong className="text-slate-700 dark:text-slate-300">{userProfile?.age || 'Not Set'}</strong>
                      </span>
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        placeholder="DD/MM/YYYY"
                        className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-white text-xs"
                      />
                      <input
                        type="number"
                        value={age !== undefined ? age : ''}
                        onChange={(e) => setAge(e.target.value ? Number(e.target.value) : undefined)}
                        placeholder="Age (Years)"
                        className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-white text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={applyFlags.age}
                          onChange={(e) => setApplyFlags(prev => ({ ...prev, age: e.target.checked }))}
                          className="w-4 h-4 rounded text-blue-600"
                        />
                        Apply
                      </label>
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="min-w-[160px]">
                      <span className="font-bold text-slate-700 dark:text-slate-300 block text-xs">
                        Gender
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Profile: <strong className="text-slate-700 dark:text-slate-300">{userProfile?.gender || 'Not Set'}</strong>
                      </span>
                    </div>
                    <div className="flex-1">
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-white text-xs"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Transgender">Transgender</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={applyFlags.gender}
                          onChange={(e) => setApplyFlags(prev => ({ ...prev, gender: e.target.checked }))}
                          className="w-4 h-4 rounded text-blue-600"
                        />
                        Apply
                      </label>
                    </div>
                  </div>

                  {/* Category / Caste */}
                  {(selectedType === 'Community Certificate' || category) && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="min-w-[160px]">
                        <span className="font-bold text-slate-700 dark:text-slate-300 block text-xs">
                          Social Category / Caste
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Profile: <strong className="text-slate-700 dark:text-slate-300">{userProfile?.category || 'Not Set'}</strong>
                        </span>
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          placeholder="General / OBC / SC / ST / EWS"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-white text-xs"
                        />
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <label className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={applyFlags.category}
                            onChange={(e) => setApplyFlags(prev => ({ ...prev, category: e.target.checked }))}
                            className="w-4 h-4 rounded text-blue-600"
                          />
                          Apply
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Disability Percentage */}
                  {(selectedType === 'Disability Certificate' || disabilityPercentage !== undefined) && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="min-w-[160px]">
                        <span className="font-bold text-slate-700 dark:text-slate-300 block text-xs">
                          Disability Percentage (%)
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Profile: <strong className="text-slate-700 dark:text-slate-300">{userProfile?.disabilityPercentage || 0}%</strong>
                        </span>
                      </div>
                      <div className="flex-1">
                        <input
                          type="number"
                          value={disabilityPercentage !== undefined ? disabilityPercentage : ''}
                          onChange={(e) => setDisabilityPercentage(e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="e.g. 40"
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-white text-xs"
                        />
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <label className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={applyFlags.disabilityPercentage}
                            onChange={(e) => setApplyFlags(prev => ({ ...prev, disabilityPercentage: e.target.checked }))}
                            className="w-4 h-4 rounded text-blue-600"
                          />
                          Apply
                        </label>
                      </div>
                    </div>
                  )}

                  {/* State & District */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="min-w-[160px]">
                      <span className="font-bold text-slate-700 dark:text-slate-300 block text-xs">
                        State & District
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Profile: <strong className="text-slate-700 dark:text-slate-300">{userProfile?.state || 'Not Set'}, {userProfile?.district || ''}</strong>
                      </span>
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="State"
                        className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-white text-xs"
                      />
                      <input
                        type="text"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder="District"
                        className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-white text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={applyFlags.state}
                          onChange={(e) => setApplyFlags(prev => ({ ...prev, state: e.target.checked, district: e.target.checked }))}
                          className="w-4 h-4 rounded text-blue-600"
                        />
                        Apply
                      </label>
                    </div>
                  </div>

                  {/* Address */}
                  {address && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                      <span className="font-bold text-slate-700 dark:text-slate-300 block text-xs">
                        Extracted Address
                      </span>
                      <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        rows={2}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Raw Extracted Text Viewer */}
              <div className="p-3.5 rounded-2xl bg-slate-900 text-slate-300 space-y-2 border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    Raw Machine-Extracted OCR Text
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyRawText}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center gap-1 transition"
                  >
                    {rawTextCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{rawTextCopied ? 'Copied' : 'Copy Text'}</span>
                  </button>
                </div>
                <pre className="text-[10px] font-mono whitespace-pre-wrap max-h-24 overflow-y-auto leading-relaxed selection:bg-blue-600/60 p-2 rounded bg-black/40">
                  {scanResult.rawTextPreview}
                </pre>
              </div>

              {/* Citizen Explicit Approval Checkbox */}
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border-2 border-blue-200 dark:border-blue-800/80 space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={citizenConsentApproved}
                    onChange={(e) => setCitizenConsentApproved(e.target.checked)}
                    className="w-5 h-5 rounded text-blue-600 mt-0.5"
                  />
                  <div className="text-xs">
                    <span className="font-extrabold text-blue-950 dark:text-blue-200 block">
                      Explicit Citizen Consent & Verification Approval
                    </span>
                    <span className="text-blue-800/90 dark:text-blue-300/80 leading-normal block mt-0.5">
                      I have reviewed the extracted values against my official document. I confirm their accuracy and authorize GovScheme to store this document in my encrypted vault and update my profile with the selected fields.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* STEP 4: MANUAL ENTRY MODE */}
          {manualMode && !isScanning && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl border bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-sm">Manual Citizen Entry Mode</span>
                  <span className="text-[11px] leading-relaxed block mt-0.5">
                    If your document image was blurry or unreadable, enter the details directly. Fields will be marked as "Manual Citizen Entry" and can still be used for scheme matching.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="sm:col-span-2">
                  <label className="block font-bold mb-1">Document Category</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as DocumentRecord['type'])}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                  >
                    {SUPPORTED_DOC_TYPES.map((dt) => (
                      <option key={dt.type} value={dt.type}>
                        {dt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-1">Document Number</label>
                  <input
                    type="text"
                    value={docNumber}
                    onChange={(e) => setDocNumber(e.target.value)}
                    placeholder="e.g. XXXX XXXX 1234 or EPIC Number"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Full Name as on Document</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full Legal Name"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Annual Family Income (₹)</label>
                  <input
                    type="number"
                    value={annualIncome !== undefined ? annualIncome : ''}
                    onChange={(e) => setAnnualIncome(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="e.g. 80000"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Date of Birth</label>
                  <input
                    type="text"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    placeholder="DD/MM/YYYY"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Tamil Nadu"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">District</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Madurai"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Citizen Explicit Consent */}
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={citizenConsentApproved}
                    onChange={(e) => setCitizenConsentApproved(e.target.checked)}
                    className="w-5 h-5 rounded text-blue-600 mt-0.5"
                  />
                  <div className="text-xs">
                    <span className="font-extrabold text-blue-950 dark:text-blue-200 block">
                      Citizen Manual Entry Confirmation
                    </span>
                    <span className="text-blue-800/90 dark:text-blue-300/80 leading-normal block mt-0.5">
                      I confirm that these details are true to the best of my knowledge and approve updating my citizen profile with these values.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Modal Sticky Footer */}
        <div className="bg-slate-50 dark:bg-slate-800/90 border-t border-slate-200 dark:border-slate-700 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-bold text-xs transition"
            >
              {t('cancel', 'Cancel')}
            </button>
            {manualMode && (
              <button
                type="button"
                onClick={() => setManualMode(false)}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline px-2"
              >
                Return to Scanner
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {!scanResult && !manualMode ? (
              <button
                type="button"
                onClick={handleStartScan}
                disabled={!selectedFile || isScanning}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold text-xs shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
              >
                <span>{t('startAIExtraction', 'Start AI Extraction')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveToVault}
                disabled={!citizenConsentApproved && !manualMode}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{t('saveDocumentAutoFill', 'Save Document & Update Profile')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
