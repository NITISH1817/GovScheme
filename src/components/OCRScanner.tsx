import React, { useState } from 'react';
import {
  X,
  UploadCloud,
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Save,
  RotateCw,
  ShieldCheck,
  Eye,
  Info
} from 'lucide-react';
import { DocumentRecord, UserProfile } from '../types';
import {
  uploadCitizenDocument,
  saveDocumentCorrections,
  reprocessDocumentOCR,
  verifyCitizenDocument
} from '../services/documentService';
import { GovSchemeLogoLoader } from './brand';

interface OCRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  expectedType: string;
  onSaveDocument?: (doc: DocumentRecord, autoFillFields?: Partial<UserProfile>) => void;
}

const SUPPORTED_DOCUMENTS = [
  { id: 'aadhaar', label: 'Aadhaar Card' },
  { id: 'pan', label: 'PAN Card' },
  { id: 'ration_card', label: 'Ration Card / Smart Card' },
  { id: 'income_certificate', label: 'Income Certificate' },
  { id: 'community_certificate', label: 'Community Certificate (Caste)' },
  { id: 'first_graduate', label: 'First Graduate Certificate' },
  { id: 'residence_certificate', label: 'Residence / Nativity Certificate' },
  { id: 'birth_certificate', label: 'Birth Certificate' },
  { id: 'disability_certificate', label: 'Disability Certificate (UDID)' },
  { id: 'farmer_certificate', label: 'Farmer / Patta Chitta Certificate' }
];

export const OCRScanner: React.FC<OCRScannerProps> = ({
  isOpen,
  onClose,
  expectedType,
  onSaveDocument
}) => {
  const [selectedDocType, setSelectedDocType] = useState<string>(
    expectedType && expectedType !== 'Unknown'
      ? expectedType.toLowerCase().replace(/\s+/g, '_')
      : 'aadhaar'
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeDocument, setActiveDocument] = useState<DocumentRecord | null>(null);
  const [correctedValues, setCorrectedValues] = useState<Record<string, any>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showRawOcr, setShowRawOcr] = useState(false);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setErrorMessage(null);
      setSuccessMessage(null);
      setActiveDocument(null);

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleUploadAndOCR = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select a government document image or PDF first.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const doc = await uploadCitizenDocument(selectedFile, selectedDocType);
      setActiveDocument(doc);
      // Pre-fill editable fields with whatever was extracted or already corrected
      const initialForm = {
        ...(doc.extractedFields || {}),
        ...(doc.correctedFields || {})
      };
      setCorrectedValues(initialForm);
      setSuccessMessage('Document processed successfully with isolated ID: ' + doc.documentId);
    } catch (err: any) {
      console.error('Upload OCR error:', err);
      setErrorMessage(
        err?.response?.data?.message || err?.message || 'Failed to process document OCR.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFieldChange = (key: string, value: string) => {
    setCorrectedValues((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveCorrections = async () => {
    if (!activeDocument) return;

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const updated = await saveDocumentCorrections(activeDocument.documentId, correctedValues);
      setActiveDocument(updated);
      setSuccessMessage('User corrections saved strictly without altering original OCR output.');

      if (onSaveDocument) {
        const autoFill: Partial<UserProfile> = {};
        if (correctedValues.fullName) autoFill.fullName = String(correctedValues.fullName);
        if (correctedValues.annualIncome) autoFill.annualIncome = Number(correctedValues.annualIncome);
        if (correctedValues.gender) autoFill.gender = correctedValues.gender as any;
        if (correctedValues.category) autoFill.category = correctedValues.category as any;
        if (correctedValues.state) autoFill.state = String(correctedValues.state);
        onSaveDocument(updated, autoFill);
      }
    } catch (err: any) {
      console.error('Save corrections error:', err);
      setErrorMessage('Failed to save user corrections.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReprocess = async () => {
    if (!activeDocument) return;

    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const reprocessed = await reprocessDocumentOCR(activeDocument.documentId);
      setActiveDocument(reprocessed);
      setCorrectedValues({
        ...(reprocessed.extractedFields || {}),
        ...(reprocessed.correctedFields || {})
      });
      setSuccessMessage('Document re-processed through OCR pipeline.');
    } catch (err: any) {
      setErrorMessage('Reprocessing failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerify = async () => {
    if (!activeDocument) return;

    setIsVerifying(true);
    setErrorMessage(null);
    try {
      const verifyRes = await verifyCitizenDocument(activeDocument.documentId);
      setActiveDocument(verifyRes.document);
      setSuccessMessage(`Authenticity Check: ${verifyRes.verificationStatus}`);
    } catch (err: any) {
      setErrorMessage('Verification request failed.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400">
              <ScanLine className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Government Document OCR & Verification
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Isolated per document • Defensible confidence • Preserves original & corrected fields
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Notifications */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <div>{successMessage}</div>
            </div>
          )}

          {/* Document Type Selection & File Upload Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                1. Select Document Type
              </label>
              <select
                value={selectedDocType}
                onChange={(e) => setSelectedDocType(e.target.value)}
                disabled={isProcessing || isSaving}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {SUPPORTED_DOCUMENTS.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                2. Choose File (JPG, PNG, or PDF)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                  onChange={handleFileSelect}
                  disabled={isProcessing}
                  className="flex-1 text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-emerald-950 dark:file:text-emerald-300 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={handleUploadAndOCR}
                  disabled={!selectedFile || isProcessing}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm flex items-center gap-2 shadow-sm disabled:opacity-50 transition-all shrink-0"
                >
                  {isProcessing ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      Extracting...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      Run OCR
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Active Extraction & Document Review View */}
          {activeDocument && (
            <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
              
              {/* Document Identity Badge Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                      ID: {activeDocument.documentId}
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white capitalize">
                      {activeDocument.documentType.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Original File: {activeDocument.originalFileName} • Uploaded on {new Date(activeDocument.uploadedAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* OCR Status Badge */}
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    activeDocument.ocrStatus === 'COMPLETED'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    OCR: {activeDocument.ocrStatus}
                  </span>

                  {/* Verification Status Badge */}
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    activeDocument.verificationStatus === 'CHECKS_PASSED' || activeDocument.verificationStatus === 'OFFICIALLY_VERIFIED'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : activeDocument.verificationStatus === 'NEEDS_REVIEW'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                  }`}>
                    Verification: {activeDocument.verificationStatus}
                  </span>
                </div>
              </div>

              {/* Two Column Layout: Preview & Editable Fields */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left: Document Preview */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center min-h-[260px] max-h-[380px] overflow-hidden">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Document Preview"
                        className="max-h-[360px] w-auto object-contain rounded-lg shadow-sm"
                      />
                    ) : (
                      <div className="text-center p-6 text-slate-400">
                        <FileText className="w-16 h-16 mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-medium">{activeDocument.originalFileName}</p>
                        <p className="text-xs text-slate-500">Preview not rendered for PDF or remote file</p>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleReprocess}
                      disabled={isProcessing}
                      className="flex-1 py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <RotateCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                      Reprocess OCR
                    </button>
                    <button
                      type="button"
                      onClick={handleVerify}
                      disabled={isVerifying}
                      className="flex-1 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verify Document
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowRawOcr(!showRawOcr)}
                      className="py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      {showRawOcr ? 'Hide Raw' : 'Raw Text'}
                    </button>
                  </div>

                  {/* Collapsible Raw OCR View */}
                  {showRawOcr && (
                    <div className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-xs max-h-48 overflow-y-auto whitespace-pre-wrap border border-slate-800">
                      {activeDocument.rawOcrText || 'No raw text available.'}
                    </div>
                  )}
                </div>

                {/* Right: Interactive OCR Review & Field Correction */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                      Extracted Fields & Human Review
                    </h3>
                    <span className="text-xs text-slate-500">
                      Edit any field to correct OCR inaccuracies
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                    {/* Render standard and document-specific fields */}
                    {[
                      { key: 'fullName', label: 'Full Name' },
                      { key: 'docNumber', label: 'Document Number / Sequence' },
                      { key: 'annualIncome', label: 'Annual Income (₹)' },
                      { key: 'dob', label: 'Date of Birth (DOB)' },
                      { key: 'gender', label: 'Gender' },
                      { key: 'category', label: 'Community / Caste Category' },
                      { key: 'state', label: 'State / Nativity' },
                      { key: 'disabilityPercentage', label: 'Disability Percentage (%)' },
                      { key: 'issuingAuthority', label: 'Issuing Authority / Officer' }
                    ].map(({ key, label }) => {
                      const rawVal = activeDocument.extractedFields?.[key];
                      const currentVal = correctedValues[key] !== undefined ? correctedValues[key] : (rawVal || '');
                      const confidence = activeDocument.fieldConfidences?.[key];
                      const flags = activeDocument.fieldFlags?.[key] || [];

                      return (
                        <div
                          key={key}
                          className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 space-y-1.5"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              {label}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {flags.length > 0 && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-semibold">
                                  {flags.join(', ')}
                                </span>
                              )}
                              {confidence !== undefined && (
                                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                  confidence >= 80
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                }`}>
                                  Conf: {confidence}%
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={currentVal}
                              onChange={(e) => handleFieldChange(key, e.target.value)}
                              placeholder={`Enter or correct ${label.toLowerCase()}...`}
                              className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                          </div>

                          {/* Original OCR preservation indicator */}
                          {rawVal && String(rawVal) !== String(currentVal) && (
                            <div className="text-[11px] text-slate-400 italic">
                              Original OCR: <span className="font-mono text-slate-500">{String(rawVal)}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Verification Outcome Panel if verified */}
                  {activeDocument.verificationChecks && activeDocument.verificationChecks.length > 0 && (
                    <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 text-xs space-y-2">
                      <div className="font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        Verification Details & Disclosures:
                      </div>
                      <div className="space-y-1">
                        {activeDocument.verificationChecks.map((chk, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-slate-700 dark:text-slate-300">
                            <span className={chk.passed ? 'text-emerald-600' : 'text-amber-600'}>
                              {chk.passed ? '✓' : '⚠'}
                            </span>
                            <span><strong>{chk.checkName}:</strong> {chk.details}</span>
                          </div>
                        ))}
                      </div>
                      {activeDocument.verificationLimitations && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 border-t border-indigo-200/50 dark:border-indigo-800/50 pt-1.5 mt-1">
                          <Info className="w-3.5 h-3.5 inline mr-1 text-slate-400" />
                          {activeDocument.verificationLimitations}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Save Corrections Button */}
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleSaveCorrections}
                      disabled={isSaving}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                    >
                      {isSaving ? (
                        <>
                          <RotateCw className="w-4 h-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Confirm & Save Corrections
                        </>
                      )}
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
export default OCRScanner;
