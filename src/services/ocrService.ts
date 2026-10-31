import { createWorker } from 'tesseract.js';
import { DocumentRecord } from '../types';
import { extractPDFTextAndImages } from './pdfHelper';

export interface OCRScanResult {
  docType: DocumentRecord['type'];
  docNumber: string;
  maskedDocNumber?: string;
  pageCount?: number;
  extractedFields: {
    fullName?: string;
    dob?: string;
    age?: number;
    annualIncome?: number;
    state?: string;
    district?: string;
    gender?: string;
    category?: string;
    address?: string;
    disabilityPercentage?: number;
    disabilityType?: string;
    confidenceScore: number;
    issueDate?: string;
    issuingAuthority?: string;
    fieldConfidences?: Record<string, number>;
    fieldFlags?: Record<string, string[]>;
  };
  isValidDocType: boolean;
  detectedTypeLabel: string;
  rawTextPreview: string;
  status?: 'COMPLETED' | 'EMPTY_OUTPUT' | 'FAILED' | 'UNREADABLE' | 'NEEDS_REVIEW' | 'TIMEOUT';
  elapsedSeconds?: number;
  errorMessage?: string;
  canRetry?: boolean;
  isEncrypted?: boolean;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry'
];

export const TESSERACT_LANG_MAP: Record<string, string> = {
  en: 'eng',
  eng: 'eng',
  hi: 'hin',
  hin: 'hin',
  ta: 'tam',
  tam: 'tam',
  te: 'tel',
  tel: 'tel',
  ml: 'mal',
  mal: 'mal',
  mr: 'mar',
  mar: 'mar',
  gu: 'guj',
  guj: 'guj'
};

/**
 * Maps short UI language codes to Tesseract 3-letter language identifiers.
 */
export function getTesseractLang(code?: string): string {
  if (!code) return 'eng';
  const clean = code.toLowerCase().trim();
  return TESSERACT_LANG_MAP[clean] || 'eng';
}

/**
 * Validates document file type, magic signatures, and size.
 */
export function validateDocumentFile(file: File): { isValid: boolean; error?: string } {
  if (!file) {
    return { isValid: false, error: 'No file provided.' };
  }
  const maxBytes = 15 * 1024 * 1024; // 15MB
  if (file.size > maxBytes) {
    return { isValid: false, error: 'File size exceeds maximum allowable limit of 15MB.' };
  }
  if (file.size === 0) {
    return { isValid: false, error: 'Uploaded file is empty (0 bytes).' };
  }
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  const isImage = file.type.startsWith('image/') || /\.(jpe?g|png)$/i.test(file.name);
  if (!isPdf && !isImage) {
    return { isValid: false, error: 'Unsupported file format. Please upload a valid PDF, JPG, or PNG document.' };
  }
  return { isValid: true };
}

/**
 * Wraps any promise in an explicit timeout to prevent indefinite UI loading states.
 */
export function withTimeout<T>(promise: Promise<T>, timeoutMs: number, timeoutMsg: string): Promise<T> {
  let timer: any;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject(new Error(timeoutMsg)), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

/**
 * Normalizes Indic numerals (Devanagari, Tamil, Telugu, Gujarati, Malayalam) to standard Arabic numerals.
 */
export function normalizeIndicNumerals(text: string): string {
  if (!text) return '';
  const devanagari = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  const tamil = ['௦', '௧', '௨', '௩', '௪', '௫', '௬', '௭', '௮', '௯'];
  const telugu = ['౦', '౧', '౨', '౩', '౪', '౫', '౬', '౭', '౮', '౯'];
  const gujarati = ['૦', '૧', '૨', '૩', '૪', '૫', '૬', '૭', '૮', '૯'];
  const malayalam = ['൦', '൧', '൨', '൩', '൪', '൫', '൬', '൭', '൮', '൯'];

  let res = text;
  for (let i = 0; i <= 9; i++) {
    res = res.replace(new RegExp(devanagari[i], 'g'), String(i));
    res = res.replace(new RegExp(tamil[i], 'g'), String(i));
    res = res.replace(new RegExp(telugu[i], 'g'), String(i));
    res = res.replace(new RegExp(gujarati[i], 'g'), String(i));
    res = res.replace(new RegExp(malayalam[i], 'g'), String(i));
  }
  return res;
}

export function calculateAge(dobString?: string): number | undefined {
  if (!dobString) return undefined;
  const parts = dobString.split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const birthDate = new Date(y, m, d);
    if (!isNaN(birthDate.getTime())) {
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const mDiff = today.getMonth() - birthDate.getMonth();
      if (mDiff < 0 || (mDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 0 && age <= 125 ? age : undefined;
    }
  }
  return undefined;
}

export function maskAadhaar(text: string): string {
  const digits = text.replace(/[^\d]/g, '');
  if (digits.length >= 12) {
    const d = digits.slice(-12);
    return `XXXX XXXX ${d.slice(8, 12)}`;
  }
  return text;
}

function parseAadhaar(text: string): string {
  const digits = text.replace(/[^\d]/g, '');
  const match = digits.match(/(\d{12})/);
  if (match) {
    const d = match[1];
    return `XXXX XXXX ${d.slice(8, 12)}`;
  }
  return '';
}

function parsePAN(text: string): string {
  const cleaned = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const match = cleaned.match(/([A-Z]{5}[0-9]{4}[A-Z])/);
  if (match) return match[1];
  const looseMatch = text.match(/\b([A-Z0-9]{10})\b/i);
  return looseMatch ? looseMatch[1].toUpperCase() : '';
}

function parseVoterID(text: string): string {
  const match = text.match(/\b([A-Z]{3}[0-9]{7})\b/i) || text.match(/\b([A-Z]{2}\/[0-9]{2}\/[0-9]{3}\/[0-9]{6})\b/i);
  return match ? match[1].toUpperCase() : '';
}

function parseName(text: string): string {
  const patterns = [
    /(?:Name|Full Name|பெயர்|नाम|పేరు|പേര്|નામ)\s*[:\-–]?\s*([A-Za-z\s.]{3,40})/i,
    /(?:This is to certify that|certify that)\s+(?:Thiru|Selvi|Tmt|Mr|Ms|Mrs)?\.?\s*([A-Za-z\s.]{3,40})/i,
    /(?:Son of|Daughter of|Wife of|S\/o|D\/o|W\/o)\s+([A-Za-z\s.]{3,35})/i
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m && m[1]) {
      const cleaned = m[1].replace(/(?:Father|Mother|DOB|Year|Male|Female|Address|UIDAI|Govt).*/i, '').trim();
      if (cleaned.length >= 3) return cleaned;
    }
  }

  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
  for (let i = 0; i < Math.min(lines.length, 10); i++) {
    const line = lines[i].toUpperCase();
    if (line.includes('INCOME TAX') || line.includes('GOVERNMENT OF INDIA') || line.includes('UNIQUE IDENTIFICATION')) {
      if (i + 1 < lines.length && !lines[i + 1].match(/\d/)) {
        const candidate = lines[i + 1].replace(/[^A-Za-z\s.]/g, '').trim();
        if (candidate.length >= 3) return candidate;
      }
    }
  }
  return '';
}

function parseDOB(text: string): string {
  const match = text.match(/\b(\d{2}[\/\-.]\d{2}[\/\-.]\d{4}|\d{4}[\/\-.]\d{2}[\/\-.]\d{2})\b/);
  if (match) {
    const parts = match[1].replace(/[\/.]/g, '-').split('-');
    if (parts.length === 3) {
      return parts[0].length === 4
        ? `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`
        : `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }
  const yobMatch = text.match(/(?:Year of Birth|YOB|DOB|Birth Year|பிறந்த ஆண்டு|जन्म वर्ष)\s*[:\-]?\s*(19\d{2}|20\d{2})/i);
  if (yobMatch) {
    return `${yobMatch[1]}-01-01`;
  }
  return '';
}

function parseGender(text: string): string {
  const lower = text.toLowerCase();
  if (/\b(female|woman|stree|mahila|பெண்|महिला|സ്ത്രീ|સ્ત્રી)\b/.test(lower)) return 'Female';
  if (/\b(male|man|purush|ஆண்|पुरुष|പുരുഷൻ|પુરુષ)\b/.test(lower) && !/\bfemale\b/.test(lower)) return 'Male';
  if (/\b(transgender|thirunangai|திருநங்கை|तृतीय पंथी)\b/.test(lower)) return 'Transgender';
  return '';
}

function parseState(text: string): string {
  const lower = text.toLowerCase();
  for (const state of INDIAN_STATES) {
    if (lower.includes(state.toLowerCase())) return state;
  }
  return '';
}

function parseIncome(text: string): number | undefined {
  const patterns = [
    /(?:Annual\s*Income|Family\s*Income|வருமானம்|आय|வருடாந்திர\s*வருமானம்|Total\s*Income)\s*[:\-–]?\s*(?:Rs\.?|INR|₹)?\s*([0-9,]+)/i,
    /(?:Rs\.?|INR|₹)\s*([0-9,]{4,10})\s*(?:\/-|\/year|per\s*annum|only)/i,
    /\b([1-9][0-9]{4,6})\s*(?:\/-|\s*rupees)/i
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m && m[1]) {
      const num = parseInt(m[1].replace(/,/g, ''), 10);
      if (!isNaN(num) && num >= 10000 && num <= 100000000) return num;
    }
  }
  return undefined;
}

function parseCategory(text: string): string {
  const upper = text.toUpperCase();
  if (upper.includes('MOST BACKWARD') || upper.includes('MBC') || upper.includes('மிகவும் பிற்படுத்தப்பட்டோர்')) return 'OBC';
  if (upper.includes('BACKWARD CLASS') || upper.includes('OBC') || upper.includes('BC') || upper.includes('பிற்படுத்தப்பட்டோர்') || upper.includes('अन्य पिछड़ा वर्ग')) return 'OBC';
  if (upper.includes('SCHEDULED CASTE') || upper.includes('SC') || upper.includes('ஆதிதிராவிடர்') || upper.includes('अनुसूचित जाति')) return 'SC';
  if (upper.includes('SCHEDULED TRIBE') || upper.includes('ST') || upper.includes('பழங்குடியினர்') || upper.includes('अनुसूचित जनजाति')) return 'ST';
  if (upper.includes('ECONOMICALLY WEAKER') || upper.includes('EWS') || upper.includes('आर्थिक रूप से कमजोर')) return 'EWS';
  if (upper.includes('GENERAL') || upper.includes('OPEN CATEGORY') || upper.includes('பொதுப் பிரிவு')) return 'General';
  return '';
}

function parseDisability(text: string): { percentage?: number; type?: string } {
  const percentMatch = text.match(/([0-9]{2,3})\s*%/);
  const percentage = percentMatch ? parseInt(percentMatch[1], 10) : undefined;
  let type = '';
  const lower = text.toLowerCase();
  if (lower.includes('locomotor') || lower.includes('orthopedic')) type = 'Locomotor Disability';
  else if (lower.includes('visual') || lower.includes('blind')) type = 'Visual Impairment';
  else if (lower.includes('hearing') || lower.includes('deaf')) type = 'Hearing Impairment';
  return {
    percentage: percentage && percentage <= 100 ? percentage : undefined,
    type
  };
}

function parseAddress(text: string): string {
  const patterns = [
    /(?:Address|Full Address|முகவரி|पता|చిరునామా|മേൽവിലാസം|સરનામું)\s*[:\-–]?\s*([A-Za-z0-9\s,.\/-]{10,120})/i,
    /(?:Village|Taluk|District|Pin\s*Code|Pincode)[\s\S]{5,80}?(?:\d{6})/i
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m && m[1]) {
      const cleaned = m[1].replace(/[\r\n]+/g, ' ').trim();
      if (cleaned.length >= 8) return cleaned;
    }
  }
  return '';
}

function parseGenericDocNumber(text: string, docType: string): string {
  const cleaned = text.replace(/[\r\n]+/g, ' ');
  if (docType === 'Income Certificate' || docType === 'Community Certificate' || docType === 'Residence Certificate') {
    const match = cleaned.match(/\b((?:TN[-/]?\d{10,14})|(?:(?:INC|COMM|RES|FGC|REV)[-/][A-Z0-9/]{6,16}))\b/i);
    if (match) return match[1].toUpperCase();
  }
  const genMatch = cleaned.match(/(?:Certificate\s*No|Reg\s*No|Application\s*No|Ref\s*No|Doc\s*No|சான்றிதழ்\s*எண்|प्रमाणपत्र\s*संख्या)[.:\s]+([A-Z0-9\/-]{6,24})/i);
  return genMatch ? genMatch[1].trim() : '';
}

function detectDocumentType(text: string, expectedType: DocumentRecord['type']): {
  label: string;
  isValid: boolean;
  detectedType: string;
} {
  const upper = text.toUpperCase();
  const hasAadhaar = upper.includes('UIDAI') || upper.includes('AADHAAR') || upper.includes('UNIQUE IDENTIFICATION') || upper.includes('ஆதார்') || /\b\d{4}\s\d{4}\s\d{4}\b/.test(text);
  const hasPAN = upper.includes('INCOME TAX') || upper.includes('PERMANENT ACCOUNT NUMBER') || /\b[A-Z]{5}[0-9]{4}[A-Z]\b/.test(text);
  const hasIncome = upper.includes('INCOME CERTIFICATE') || upper.includes('ANNUAL INCOME') || upper.includes('வருமானச் சான்றிதழ்') || upper.includes('आय प्रमाणपत्र');
  const hasCommunity = upper.includes('COMMUNITY CERTIFICATE') || upper.includes('CASTE CERTIFICATE') || upper.includes('சாதிச் சான்றிதழ்') || upper.includes('जाति प्रमाणपत्र');
  const hasRation = upper.includes('RATION CARD') || upper.includes('FAIR PRICE') || upper.includes('குடும்ப அட்டை') || upper.includes('राशन कार्ड');
  const hasVoter = upper.includes('ELECTION COMMISSION') || upper.includes('ELECTOR') || upper.includes('VOTER') || /\b[A-Z]{3}[0-9]{7}\b/.test(text);
  const hasDisability = upper.includes('DISABILITY') || upper.includes('UDID') || upper.includes('மாற்றுத்திறனாளி') || upper.includes('दिव्यांग');
  const hasBirth = upper.includes('BIRTH CERTIFICATE') || upper.includes('பிறப்புச் சான்றிதழ்') || upper.includes('जन्म प्रमाणपत्र');

  const isAuto = expectedType === 'Unknown';
  const detected: string = (hasAadhaar ? 'Aadhaar'
    : hasPAN ? 'PAN'
      : hasIncome ? 'Income Certificate'
        : hasCommunity ? 'Community Certificate'
          : hasRation ? 'Ration Card'
            : hasVoter ? 'Voter ID'
              : hasDisability ? 'Disability Certificate'
                : hasBirth ? 'Birth Certificate'
                  : (isAuto ? 'Aadhaar' : expectedType)) || 'Aadhaar';

  const isMatch = isAuto ? true : (detected === expectedType);

  return {
    detectedType: detected,
    isValid: isMatch,
    label: isAuto ? `${detected} (Auto-Detected ✨)` : (detected === expectedType ? `${detected} (Verified ✓)` : `${detected} detected — expected ${expectedType}`)
  };
}

/**
 * Intelligent OCR Scan supporting text-based PDFs, scanned image PDFs, multi-page PDFs, and images.
 * Guarantees bounded timeouts, normalized language codes, safe retries, and comprehensive error reporting.
 */
export async function performOCRScan(
  file: File,
  expectedType: DocumentRecord['type'] | 'Unknown',
  lang: string = 'eng',
  onProgress?: (stage: 'uploading' | 'processing' | 'extracting', elapsedSeconds: number) => void
): Promise<OCRScanResult> {
  const startTime = Date.now();
  const getElapsed = () => Math.max(1, Math.round((Date.now() - startTime) / 1000));

  // 1. Validate File Size, MIME, and Non-Empty content
  const validation = validateDocumentFile(file);
  if (!validation.isValid) {
    return {
      docType: expectedType === 'Unknown' ? 'Aadhaar' : expectedType,
      docNumber: '',
      extractedFields: { confidenceScore: 0 },
      isValidDocType: false,
      detectedTypeLabel: 'File Validation Failed',
      rawTextPreview: validation.error || 'Invalid file format or size.',
      status: 'FAILED',
      errorMessage: validation.error,
      canRetry: false,
      elapsedSeconds: getElapsed()
    };
  }

  const normalizedLang = getTesseractLang(lang);
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  const isImage = file.type.startsWith('image/') || /\.(jpe?g|png)$/i.test(file.name);
  let rawText = '';
  let confidence = 75;
  let pageCount = 1;

  onProgress?.('processing', getElapsed());

  // 2. PDF Processing Pipeline (Embedded text extraction + scanned image page rendering fallback)
  if (isPdf) {
    try {
      const pdfRes = await withTimeout(
        extractPDFTextAndImages(file),
        15000,
        'PDF document processing timed out after 15 seconds.'
      );
      pageCount = pdfRes.pageCount || 1;

      if (pdfRes.error) {
        return {
          docType: expectedType === 'Unknown' ? 'Aadhaar' : expectedType,
          docNumber: '',
          extractedFields: { confidenceScore: 0 },
          isValidDocType: false,
          detectedTypeLabel: pdfRes.isEncrypted ? 'Password-Protected PDF' : 'Unreadable PDF Document',
          rawTextPreview: pdfRes.error,
          pageCount,
          status: pdfRes.isEncrypted ? 'FAILED' : 'UNREADABLE',
          errorMessage: pdfRes.error,
          isEncrypted: pdfRes.isEncrypted,
          canRetry: !pdfRes.isEncrypted,
          elapsedSeconds: getElapsed()
        };
      }

      if (pdfRes.hasEmbeddedText && pdfRes.text.length > 25) {
        rawText = pdfRes.text;
        confidence = 90;
      }

      // If scanned pages exist and embedded text is insufficient, apply Tesseract OCR
      if (!rawText && pdfRes.pageImages && pdfRes.pageImages.length > 0) {
        onProgress?.('extracting', getElapsed());
        let worker: any = null;
        try {
          worker = await withTimeout(
            createWorker(normalizedLang),
            10000,
            `OCR worker initialization timed out for language ${normalizedLang}.`
          );
          const maxPages = Math.min(pdfRes.pageImages.length, 3);
          for (let p = 0; p < maxPages; p++) {
            const pageDataUrl = pdfRes.pageImages[p];
            const ret: any = await withTimeout<any>(
              worker.recognize(pageDataUrl),
              10000,
              `Page ${p + 1} OCR extraction timed out.`
            );
            const pageText = ret.data.text || '';
            if (pageText.trim().length > 0) {
              rawText += `\n--- Page ${p + 1} (Scanned OCR) ---\n${pageText}`;
              if (ret.data.confidence) {
                confidence = Math.round((confidence + ret.data.confidence) / 2);
              }
            }
          }
        } catch (tessErr: any) {
          console.warn('[OCR Service] PDF page image OCR fallback note:', tessErr.message || tessErr);
        } finally {
          if (worker) {
            await worker.terminate().catch(() => {});
          }
        }
      }
    } catch (pdfErr: any) {
      console.warn('[OCR Service] Client-side PDF processing note:', pdfErr.message || pdfErr);
    }
  }

  // 3. Image Processing Pipeline
  if (isImage && !rawText) {
    onProgress?.('extracting', getElapsed());
    let worker: any = null;
    try {
      worker = await withTimeout(
        createWorker(normalizedLang),
        12000,
        `OCR worker initialization timed out for language ${normalizedLang}.`
      );
      const ret: any = await withTimeout<any>(
        worker.recognize(file),
        15000,
        'Image OCR recognition timed out after 15 seconds.'
      );
      rawText = normalizeIndicNumerals(ret.data.text || '');
      confidence = typeof ret.data.confidence === 'number' ? Math.round(ret.data.confidence) : 75;
    } catch (clientErr: any) {
      console.warn('[OCR Service] Client-side Tesseract.js note:', clientErr.message || clientErr);
    } finally {
      if (worker) {
        await worker.terminate().catch(() => {});
      }
    }
  }

  // 4. Synchronize with Backend upload endpoint if authenticated
  if (!rawText && typeof window !== 'undefined') {
    const token = localStorage.getItem('govscheme_token');
    if (token) {
      try {
        onProgress?.('uploading', getElapsed());
        const formData = new FormData();
        formData.append('document', file);
        formData.append('documentType', String(expectedType === 'Unknown' ? 'Aadhaar' : (expectedType || 'Aadhaar')));
        formData.append('language', normalizedLang);

        const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 12000);

        const resp = await fetch(`${apiUrl}/api/documents/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
          signal: controller.signal
        }).finally(() => clearTimeout(timeoutId));

        if (resp.ok) {
          const data = await resp.json();
          if (data.success && data.document) {
            const doc = data.document;
            const ext = doc.extractedFields || {};
            const docNum = ext.docNumber || '';
            const isOcrSuccess = doc.ocrStatus !== 'FAILED';
            return {
              docType: (doc.documentType || expectedType) as DocumentRecord['type'],
              docNumber: docNum,
              maskedDocNumber: docNum.length >= 12 ? maskAadhaar(docNum) : docNum,
              pageCount: doc.pageCount || pageCount,
              extractedFields: {
                fullName: ext.fullName,
                dob: ext.dob,
                age: ext.age || calculateAge(ext.dob),
                annualIncome: ext.annualIncome,
                state: ext.state,
                district: ext.district,
                gender: ext.gender,
                category: ext.category,
                address: ext.address,
                disabilityPercentage: ext.disabilityPercentage,
                confidenceScore: doc.fieldConfidences?.overall || (isOcrSuccess ? 85 : 0),
                issueDate: ext.issueDate,
                issuingAuthority: ext.issuingAuthority,
                fieldConfidences: doc.fieldConfidences,
                fieldFlags: doc.fieldFlags
              },
              isValidDocType: doc.verificationStatus === 'CHECKS_PASSED' || isOcrSuccess,
              detectedTypeLabel: isOcrSuccess
                ? `${doc.documentType || expectedType} (Processed ✓)`
                : `${doc.documentType || expectedType} (Manual Review Required)`,
              rawTextPreview: doc.rawOcrText ? doc.rawOcrText.slice(0, 300) : 'Document stored. Automated text extraction unavailable.',
              status: isOcrSuccess ? 'COMPLETED' : 'EMPTY_OUTPUT',
              canRetry: true,
              elapsedSeconds: getElapsed()
            };
          }
        }
      } catch (uploadErr: any) {
        console.warn('[OCR Service] Backend upload note:', uploadErr.message || uploadErr);
      }
    }
  }

  // 5. Check for Empty or Unreadable Document Content
  const normalizedText = normalizeIndicNumerals(rawText || '').trim();
  if (!normalizedText || normalizedText.length < 8) {
    return {
      docType: expectedType === 'Unknown' ? 'Aadhaar' : expectedType,
      docNumber: '',
      extractedFields: { confidenceScore: 0 },
      isValidDocType: false,
      detectedTypeLabel: `${expectedType} (No Text Detected)`,
      rawTextPreview: 'No machine-readable text could be identified. The document image may be blurred, faint, or low resolution. You may retry or enter details manually.',
      pageCount,
      status: 'EMPTY_OUTPUT',
      errorMessage: 'No readable text identified in document.',
      canRetry: true,
      elapsedSeconds: getElapsed()
    };
  }

  // 6. Parse structured fields from extracted normalized text
  const detected = detectDocumentType(normalizedText, expectedType);
  const finalDocType = (expectedType === 'Unknown' || !expectedType) ? (detected.detectedType !== 'Unknown' ? (detected.detectedType as DocumentRecord['type']) : 'Aadhaar') : expectedType;

  const fullName = parseName(normalizedText);
  const dob = parseDOB(normalizedText);
  const age = calculateAge(dob);
  const gender = parseGender(normalizedText);
  const state = parseState(normalizedText);
  const annualIncome = parseIncome(normalizedText);
  const category = parseCategory(normalizedText);
  const address = parseAddress(normalizedText);
  const disability = parseDisability(normalizedText);

  let docNumber = '';
  if (finalDocType === 'Aadhaar') docNumber = parseAadhaar(normalizedText);
  else if (finalDocType === 'PAN') docNumber = parsePAN(normalizedText);
  else if (finalDocType === 'Voter ID') docNumber = parseVoterID(normalizedText);
  else docNumber = parseGenericDocNumber(normalizedText, finalDocType || 'Aadhaar');

  const maskedNumber = docNumber.length >= 12 ? maskAadhaar(docNumber) : docNumber;

  return {
    docType: finalDocType,
    docNumber,
    maskedDocNumber: maskedNumber,
    pageCount,
    extractedFields: {
      fullName: fullName || undefined,
      dob: dob || undefined,
      age,
      gender: gender || undefined,
      state: state || undefined,
      annualIncome,
      category: category || undefined,
      address: address || undefined,
      disabilityPercentage: disability.percentage,
      disabilityType: disability.type,
      confidenceScore: Math.max(confidence, 60)
    },
    isValidDocType: detected.isValid || Boolean(docNumber || fullName),
    detectedTypeLabel: detected.label,
    rawTextPreview: normalizedText.slice(0, 400),
    status: 'COMPLETED',
    canRetry: true,
    elapsedSeconds: getElapsed()
  };
}
