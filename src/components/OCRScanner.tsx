import React, { useState } from 'react';
import {
  X,
  UploadCloud,
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Save,
  Edit3,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { DocumentRecord, UserProfile } from '../types';
import { performOCRScan, OCRScanResult } from '../services/ocrService';

interface OCRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  expectedType: DocumentRecord['type'];
  onSaveDocument: (doc: DocumentRecord, autoFillFields?: Partial<UserProfile>) => void;
}

export const OCRScanner: React.FC<OCRScannerProps> = ({
  isOpen,
  onClose,
  expectedType,
  onSaveDocument
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<OCRScanResult | null>(null);
  const [editableDocNumber, setEditableDocNumber] = useState('');
  const [editableName, setEditableName] = useState('');
  const [editableIncome, setEditableIncome] = useState<number | undefined>(undefined);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setScanResult(null);
    }
  };

  const handleStartScan = async () => {
    if (!selectedFile) return;
    setIsScanning(true);
    try {
      const res = await performOCRScan(selectedFile, expectedType);
      setScanResult(res);
      setEditableDocNumber(res.docNumber);
      setEditableName(res.extractedFields.fullName || '');
      setEditableIncome(res.extractedFields.annualIncome);
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSaveToVault = () => {
    if (!scanResult) return;

    const newDoc: DocumentRecord = {
      id: `doc-${Date.now()}`,
      type: expectedType,
      docNumber: editableDocNumber || scanResult.docNumber,
      status: scanResult.isValidDocType ? 'Verified' : 'Pending',
      ocrExtracted: {
        ...scanResult.extractedFields,
        fullName: editableName || scanResult.extractedFields.fullName,
        annualIncome: editableIncome !== undefined ? editableIncome : scanResult.extractedFields.annualIncome
      },
      uploadedAt: new Date().toISOString().split('T')[0]
    };

    const autoFill: Partial<UserProfile> = {};
    if (editableName) autoFill.fullName = editableName;
    if (editableIncome !== undefined) autoFill.annualIncome = editableIncome;

    onSaveDocument(newDoc, autoFill);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden transition-colors my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-slate-300 hover:text-white p-1 rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <ScanLine className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">AI OCR Document Extraction</span>
          </div>
          <h2 className="text-2xl font-bold font-heading">Scan {expectedType} Document</h2>
          <p className="text-xs text-blue-100 mt-1">Extract details & auto-fill profile for rule verification.</p>
        </div>

        <div className="p-6 space-y-6 text-xs text-slate-700 dark:text-slate-300">
          {/* File Upload Dropzone */}
          {!scanResult && !isScanning && (
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 text-center space-y-4 hover:border-blue-500 transition">
              <UploadCloud className="w-12 h-12 text-blue-600 mx-auto" />
              <div>
                <span className="font-bold text-slate-900 dark:text-white text-sm block">Upload {expectedType} Image or PDF</span>
                <span className="text-slate-500 text-xs">Supports JPG, PNG, WEBP, PDF up to 10MB</span>
              </div>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
                id="ocr-file-input"
              />
              <label
                htmlFor="ocr-file-input"
                className="inline-block px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold cursor-pointer transition shadow"
              >
                Select File
              </label>

              {selectedFile && (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-semibold flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                </div>
              )}
            </div>
          )}

          {/* Scanning Animation */}
          {isScanning && (
            <div className="p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mx-auto animate-pulse">
                <ScanLine className="w-8 h-8 animate-spin" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white font-heading">
                AI OCR Extracting Text...
              </h3>
              <p className="text-xs text-slate-500">
                Detecting document headers, verifying Aadhaar/PAN formats, and measuring OCR confidence score.
              </p>
            </div>
          )}

          {/* OCR Scan Results & Manual Field Editor */}
          {scanResult && !isScanning && (
            <div className="space-y-4">
              {/* Type Warning / Verification Badge */}
              <div className={`p-4 rounded-xl border flex items-center gap-3 ${scanResult.isValidDocType
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                }`}>
                {scanResult.isValidDocType ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-amber-600" />}
                <div>
                  <span className="font-bold block">{scanResult.detectedTypeLabel}</span>
                  <span className="text-[11px]">Confidence Score: {scanResult.extractedFields.confidenceScore}%</span>
                </div>
              </div>

              {/* Edit Extracted Fields */}
              <div className="space-y-3 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-white block font-heading">
                  Review & Verify Extracted Information
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Document Number</label>
                    <input
                      type="text"
                      value={editableDocNumber}
                      onChange={(e) => setEditableDocNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Name on Document</label>
                    <input
                      type="text"
                      value={editableName}
                      onChange={(e) => setEditableName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                    />
                  </div>

                  {expectedType === 'Income Certificate' && (
                    <div className="sm:col-span-2">
                      <label className="block font-semibold mb-1">Extracted Annual Income (₹)</label>
                      <input
                        type="number"
                        value={editableIncome || ''}
                        onChange={(e) => setEditableIncome(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
                      />
                    </div>
                  )}
                </div>

                {/* Raw OCR Text Preview Box */}
                <div className="pt-2">
                  <span className="text-[10px] font-bold text-slate-500 block mb-1">Raw OCR Extracted Preview:</span>
                  <pre className="p-2.5 rounded-lg bg-slate-900 text-slate-300 text-[10px] font-mono whitespace-pre-wrap max-h-24 overflow-y-auto">
                    {scanResult.rawTextPreview}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs"
          >
            Cancel
          </button>

          {!scanResult ? (
            <button
              onClick={handleStartScan}
              disabled={!selectedFile}
              className="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold text-xs shadow flex items-center gap-1.5"
            >
              <span>Start AI Extraction</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSaveToVault}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Document & Auto-Fill Profile</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
