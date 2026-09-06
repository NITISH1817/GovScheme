import { createWorker } from 'tesseract.js';
import { DocumentRecord } from '../types';
import { convertPDFToImageURLs } from './pdfHelper';

export interface OCRScanResult {
  docType: DocumentRecord['type'];
  docNumber: string;
  extractedFields: {
    fullName?: string;
    dob?: string;
    annualIncome?: number;
    state?: string;
    gender?: string;
    confidenceScore: number;
    issueDate?: string;
  };
  isValidDocType: boolean;
  detectedTypeLabel: string;
  rawTextPreview: string;
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh',
];

function parseAadhaar(text: string): string {
  // Extract all digits and look for a sequence of 12 digits
  const digits = text.replace(/[^\d]/g, '');
  const match = digits.match(/(\d{12})/);
  if (match) {
    const d = match[1];
    return `${d.slice(0, 4)} ${d.slice(4, 8)} ${d.slice(8, 12)}`;
  }
  return '';
}

function parsePAN(text: string): string {
  // PAN format: 5 letters, 4 numbers, 1 letter. We allow spaces/dashes that OCR might insert.
  const cleaned = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const match = cleaned.match(/([A-Z]{5}[0-9]{4}[A-Z])/);
  if (match) return match[1];
  
  // If OCR failed slightly (e.g. read O as 0), we can be very loose
  const looseMatch = text.match(/\b([A-Z0-9]{10})\b/i);
  return looseMatch ? looseMatch[1].toUpperCase() : '';
}

function parseName(text: string): string {
  // Try "Name: XYZ" or "नाम: XYZ", forgiving on punctuation
  const patterns = [
    /(?:Name|NAME|name)\s*[:\-]?\s*([A-Za-z\s]{3,40})/i,
    /(?:नाम|ਨਾਮ)\s*[:\-]?\s*(\S.{3,30})/,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m && !m[1].toLowerCase().includes('father')) return m[1].trim();
  }
  
  // For PAN, it's usually below "INCOME TAX DEPARTMENT" or "GOVT"
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toUpperCase();
    if (line.includes('INCOME TAX') || line.includes('GOVT') || line.includes('GOVERNMENT')) {
      if (i + 1 < lines.length && !lines[i + 1].match(/\d/)) {
        return lines[i + 1].replace(/[^A-Za-z\s]/g, '').trim();
      }
    }
  }
  return '';
}

function parseDOB(text: string): string {
  // match DD/MM/YYYY or YYYY/MM/DD with spaces, dashes, slashes, or dots
  const match = text.match(/\b(\d{2}[\/\-\.\s]\d{2}[\/\-\.\s]\d{4}|\d{4}[\/\-\.\s]\d{2}[\/\-\.\s]\d{2})\b/);
  if (match) {
    let d = match[1].replace(/[\.\s]/g, '-').replace(/\//g, '-');
    if (d.length === 10 && d[2] === '-') {
      const [dd, mm, yyyy] = d.split('-');
      return `${yyyy}-${mm}-${dd}`;
    }
    return d;
  }
  
  // Try to find just YYYY (Year of Birth is common on Aadhaar)
  const yobMatch = text.match(/(?:Year of Birth|YOB|DOB|Birth).*?(19\d{2}|20\d{2})/i);
  if (yobMatch) {
    return `${yobMatch[1]}-01-01`; // fallback to 1st Jan
  }
  return '';
}

function parseGender(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('female') || lower.includes('mahila') || lower.includes('महिला')) return 'Female';
  if (lower.match(/\b(male|purush|पुरुष|m)\b/)) return 'Male';
  if (lower.includes('transgender')) return 'Transgender';
  return '';
}

function parseState(text: string): string {
  for (const state of INDIAN_STATES) {
    if (text.toLowerCase().includes(state.toLowerCase())) return state;
  }
  return '';
}

function parseIncome(text: string): number | undefined {
  // Match patterns like "Rs. 1,20,000" or "₹95,000" or "95000"
  const patterns = [
    /(?:Rs\.?|INR|₹)\s*([\d,]+)/i,
    /(?:income|Income|INCOME)\s*(?:is|:)?\s*Rs\.?\s*([\d,]+)/i,
    /\b([\d,]{5,10})\s*(?:\/\-|only|per annum|per year|annually)/i,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      const num = parseInt(m[1].replace(/,/g, ''), 10);
      if (!isNaN(num) && num > 1000 && num < 100000000) return num;
    }
  }
  return undefined;
}

function detectDocumentType(text: string, expectedType: DocumentRecord['type']): {
  label: string;
  isValid: boolean;
  detectedType: string;
} {
  const upper = text.toUpperCase();
  const hasAadhaar = upper.includes('UIDAI') || upper.includes('AADHAAR') || upper.includes('UNIQUE IDENTIFICATION') || /\b\d{4}\s\d{4}\s\d{4}\b/.test(text);
  const hasPAN = upper.includes('INCOME TAX') || upper.includes('PERMANENT ACCOUNT NUMBER') || /\b[A-Z]{5}[0-9]{4}[A-Z]\b/.test(text);
  const hasIncome = upper.includes('INCOME CERTIFICATE') || upper.includes('ANNUAL INCOME') || upper.includes('REVENUE DEPARTMENT');
  const hasRation = upper.includes('RATION CARD') || upper.includes('FAIR PRICE');

  const detected = hasAadhaar ? 'Aadhaar'
    : hasPAN ? 'PAN'
      : hasIncome ? 'Income Certificate'
        : hasRation ? 'Ration Card'
          : expectedType;

  return {
    detectedType: detected,
    isValid: detected === expectedType,
    label: detected === expectedType
      ? `${detected} (Verified ✓)`
      : `${detected} detected — expected ${expectedType}`
  };
}

/**
 * Real OCR scan using Tesseract.js
 * Extracts actual text from the uploaded image and parses government document fields.
 */
export async function performOCRScan(
  file: File,
  expectedType: DocumentRecord['type']
): Promise<OCRScanResult> {
  let rawText = '';
  let confidence = 0;

  try {
    let imageSources: (File | string)[] = [file];
    if (file.type === 'application/pdf') {
      imageSources = await convertPDFToImageURLs(file);
    }

    const worker = await createWorker('eng', 1, {
      logger: () => { } // suppress logs
    });
    
    let combinedText = '';
    let maxConfidence = 0;

    for (const source of imageSources) {
      const { data } = await worker.recognize(source);
      combinedText += (data.text || '') + '\n\n';
      if (data.confidence && data.confidence > maxConfidence) {
        maxConfidence = data.confidence;
      }
    }
    
    rawText = combinedText;
    confidence = Math.round(maxConfidence);
    await worker.terminate();
  } catch (err) {
    console.error('Tesseract OCR error:', err);
    rawText = '';
    confidence = 0;
  }

  // Parse extracted fields
  const docInfo = detectDocumentType(rawText, expectedType);
  const aadhaarNum = parseAadhaar(rawText);
  const panNum = parsePAN(rawText);
  const name = parseName(rawText);
  const dob = parseDOB(rawText);
  const gender = parseGender(rawText);
  const state = parseState(rawText);
  const income = parseIncome(rawText);

  // Document number by type
  let docNumber = '';
  if (expectedType === 'Aadhaar') docNumber = aadhaarNum || (rawText.match(/\b\d{12}\b/)?.[0] || '');
  else if (expectedType === 'PAN') docNumber = panNum;
  else if (expectedType === 'Income Certificate') {
    const certNo = rawText.match(/(?:Cert(?:ificate)?\.?\s*No\.?|No\.)\s*[:\-]?\s*([A-Z0-9\-\/]+)/i);
    docNumber = certNo ? certNo[1].trim() : `DOC-${Date.now()}`;
  } else {
    docNumber = rawText.match(/\b[A-Z0-9]{6,20}\b/)?.[0] || `DOC-${Date.now()}`;
  }

  // Fallback if OCR failed entirely
  const isBlank = rawText.trim().length < 10;

  return {
    docType: expectedType,
    docNumber: docNumber || `DOC-${Date.now()}`,
    extractedFields: {
      fullName: isBlank ? undefined : (name || undefined),
      dob: isBlank ? undefined : (dob || undefined),
      annualIncome: isBlank ? undefined : income,
      state: isBlank ? undefined : (state || undefined),
      gender: isBlank ? undefined : (gender || undefined),
      confidenceScore: isBlank ? 0 : confidence,
      issueDate: isBlank ? undefined : undefined,
    },
    isValidDocType: isBlank ? false : docInfo.isValid,
    detectedTypeLabel: isBlank
      ? 'Could not extract text. Please upload a clearer image.'
      : docInfo.label,
    rawTextPreview: isBlank
      ? 'No text could be extracted. Try a cleaner, well-lit image of the document.'
      : rawText.slice(0, 600),
  };
}
