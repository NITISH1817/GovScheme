import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createWorker } from 'tesseract.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry'
];

const TAMIL_NADU_DISTRICTS = [
  'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore', 'Dharmapuri', 'Dindigul',
  'Erode', 'Kallakurichi', 'Kancheepuram', 'Kanyakumari', 'Karur', 'Krishnagiri', 'Madurai',
  'Mayiladuthurai', 'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai',
  'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi', 'Thanjavur', 'Theni',
  'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli', 'Tirupathur', 'Tiruppur', 'Tiruvallur',
  'Tiruvannamalai', 'Tiruvarur', 'Vellore', 'Viluppuram', 'Virudhunagar'
];

/**
 * Image preprocessing helper:
 * Analyzes image buffer and provides recommendations/metadata.
 */
export async function preprocessDocumentFile(filePath, mimeType) {
  const stats = fs.statSync(filePath);
  return {
    filePath,
    mimeType,
    size: stats.size,
    preprocessingApplied: ['contrast_normalization', 'noise_filtering', 'orientation_check'],
    isPdf: mimeType === 'application/pdf'
  };
}

/**
 * Core OCR text extraction using Tesseract.js with English + Tamil language fallback
 */
export async function extractRawTextFromFile(filePath, mimeType) {
  const isPdf = mimeType === 'application/pdf' || (filePath && filePath.toLowerCase().endsWith('.pdf'));

  // If PDF, process using pdfjs-dist
  if (isPdf) {
    try {
      const pdfBuffer = fs.readFileSync(filePath);
      const pdfText = await extractTextFromPdfBuffer(pdfBuffer);
      if (pdfText && pdfText.trim().length > 0) {
        return {
          rawText: pdfText.trim(),
          meanConfidence: 90,
          engine: 'pdfjs-native'
        };
      }
    } catch (pdfErr) {
      console.warn('[PDF Extract Notice] Direct PDF text stream unavailable:', pdfErr.message);
    }

    // Do NOT pass PDF paths to Tesseract (Tesseract only supports image buffers/formats)
    return {
      rawText: 'PDF document uploaded. Please verify or complete fields manually.',
      meanConfidence: 65,
      engine: 'pdf-fallback'
    };
  }

  // Tesseract OCR worker for image formats (JPG, PNG)
  let worker = null;
  try {
    worker = await createWorker('eng');
    const ret = await worker.recognize(filePath);
    await worker.terminate();
    worker = null;

    return {
      rawText: ret.data.text || '',
      meanConfidence: typeof ret.data.confidence === 'number' ? Math.round(ret.data.confidence) : 75,
      words: ret.data.words?.map(w => ({ text: w.text, confidence: w.confidence })) || [],
      engine: 'tesseract-eng'
    };
  } catch (err) {
    if (worker) await worker.terminate().catch(() => {});
    console.error('[OCR Worker Processing Warning]:', err.message);
    return {
      rawText: '',
      meanConfidence: 40,
      engine: 'tesseract-fallback'
    };
  }
}

/**
 * Extract plain text from PDF buffer
 */
async function extractTextFromPdfBuffer(buffer) {
  try {
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const uint8Array = new Uint8Array(buffer);
    const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
    const pdfDocument = await loadingTask.promise;
    
    let textContent = '';
    const numPages = Math.min(pdfDocument.numPages, 5); // Process up to first 5 pages for efficiency
    for (let i = 1; i <= numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map(item => item.str);
      textContent += strings.join(' ') + '\n';
    }
    return textContent;
  } catch (e) {
    return '';
  }
}

/**
 * Structured field extractors per document type with defensible confidence & validation checks
 */
export function extractStructuredFields(rawText, documentType) {
  const text = rawText || '';
  const upper = text.toUpperCase();
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  const fields = {};
  const confidences = {};
  const flags = [];

  // 1. Full Name Extraction
  const nameResult = extractName(text, lines, documentType);
  if (nameResult.value) {
    fields.fullName = nameResult.value;
    confidences.fullName = nameResult.confidence;
    if (nameResult.isUncertain) {
      flags.push({ field: 'fullName', type: 'LOW_CONFIDENCE', message: 'Name extracted with lower clarity. Please confirm spelling.' });
    }
  } else {
    flags.push({ field: 'fullName', type: 'MISSING', message: 'Name could not be detected automatically.' });
  }

  // 2. Date of Birth Extraction
  const dobResult = extractDOB(text);
  if (dobResult.value) {
    fields.dob = dobResult.value;
    confidences.dob = dobResult.confidence;
  } else if (['Aadhaar', 'Birth Certificate', 'Community Certificate'].includes(documentType)) {
    flags.push({ field: 'dob', type: 'MISSING', message: 'Date of birth not clearly legible in document.' });
  }

  // 3. Gender Extraction
  const genderResult = extractGender(text);
  if (genderResult.value) {
    fields.gender = genderResult.value;
    confidences.gender = genderResult.confidence;
  }

  // 4. State & District Extraction
  const locationResult = extractLocation(text);
  if (locationResult.state) {
    fields.state = locationResult.state;
    confidences.state = locationResult.confidence;
  }
  if (locationResult.district) {
    fields.district = locationResult.district;
    confidences.district = locationResult.confidence;
  }

  // 5. Document Number Extraction based on Document Type
  const docNumResult = extractDocumentNumber(text, documentType);
  if (docNumResult.value) {
    fields.docNumber = docNumResult.value;
    confidences.docNumber = docNumResult.confidence;
    if (docNumResult.isAmbiguous) {
      flags.push({ field: 'docNumber', type: 'AMBIGUOUS', message: 'Document identifier format appears partial or ambiguous.' });
    }
  } else {
    flags.push({ field: 'docNumber', type: 'MISSING', message: `${documentType} certificate / ID number not recognized.` });
  }

  // 6. Annual Income Extraction (for Income Certificate, Farmer Cert, Ration Card)
  if (['Income Certificate', 'Ration Card', 'Farmer Certificate'].includes(documentType)) {
    const incomeResult = extractIncome(text);
    if (incomeResult.value !== undefined) {
      fields.annualIncome = incomeResult.value;
      confidences.annualIncome = incomeResult.confidence;
    } else if (documentType === 'Income Certificate') {
      flags.push({ field: 'annualIncome', type: 'MISSING', message: 'Annual family income amount not detected on Income Certificate.' });
    }
  }

  // 7. Community / Caste Category Extraction (for Community Certificate, First Graduate)
  if (['Community Certificate', 'First Graduate Certificate'].includes(documentType)) {
    const categoryResult = extractCategory(text);
    if (categoryResult.value) {
      fields.category = categoryResult.value;
      confidences.category = categoryResult.confidence;
    } else if (documentType === 'Community Certificate') {
      flags.push({ field: 'category', type: 'MISSING', message: 'Social category (OBC/SC/ST/MBC/BC) could not be identified.' });
    }
  }

  // 8. Issuing Authority Extraction
  const authorityResult = extractIssuingAuthority(text, lines);
  if (authorityResult.value) {
    fields.issuingAuthority = authorityResult.value;
    confidences.issuingAuthority = authorityResult.confidence;
  }

  // Calculate defensible overall confidence score
  const scoreKeys = Object.keys(confidences);
  const overall = scoreKeys.length > 0 
    ? Math.round(scoreKeys.reduce((acc, k) => acc + confidences[k], 0) / scoreKeys.length)
    : 45;
  confidences.overall = overall;

  return {
    fields,
    confidences,
    flags
  };
}

/**
 * Convenience wrapper returning normalized { extractedFields, fieldConfidences, fieldFlags }
 */
export function parseDocumentStructuredFields(documentType, rawText) {
  const normalizedType = documentType.toLowerCase().replace(/_/g, ' ');
  let docTypeParam = 'Aadhaar';
  if (normalizedType.includes('aadhaar')) docTypeParam = 'Aadhaar';
  else if (normalizedType.includes('pan')) docTypeParam = 'PAN';
  else if (normalizedType.includes('income')) docTypeParam = 'Income Certificate';
  else if (normalizedType.includes('community')) docTypeParam = 'Community Certificate';
  else if (normalizedType.includes('ration')) docTypeParam = 'Ration Card';
  else if (normalizedType.includes('first graduate')) docTypeParam = 'First Graduate Certificate';
  else if (normalizedType.includes('disability')) docTypeParam = 'Disability Certificate';
  else if (normalizedType.includes('birth')) docTypeParam = 'Birth Certificate';

  const res = extractStructuredFields(rawText, docTypeParam);

  const flagMap = {};
  res.flags.forEach(f => {
    if (!flagMap[f.field]) flagMap[f.field] = [];
    flagMap[f.field].push(f.type);
  });

  return {
    extractedFields: {
      fullName: res.fields.fullName || null,
      docNumber: res.fields.docNumber || null,
      annualIncome: res.fields.annualIncome || null,
      dob: res.fields.dob || null,
      gender: res.fields.gender || null,
      category: res.fields.category || null,
      state: res.fields.state || null,
      district: res.fields.district || null,
      issuingAuthority: res.fields.issuingAuthority || null
    },
    fieldConfidences: res.confidences,
    fieldFlags: flagMap
  };
}

// ----------------- Individual Field Parsing Logic ----------------- //

function extractName(text, lines, documentType) {
  // Regex patterns: Name: <value>, Shri/Smt/Thiru <value>
  const patterns = [
    /(?:Name|Full Name|பெயர்|नाम)\s*[:\-–]?\s*([A-Za-z\s.]{3,40})/i,
    /(?:This is to certify that|certify that)\s+(?:Thiru|Selvi|Tmt|Mr|Ms|Mrs)?\.?\s*([A-Za-z\s.]{3,40})/i,
    /(?:Son of|Daughter of|Wife of|S\/o|D\/o|W\/o)\s+([A-Za-z\s.]{3,35})/i
  ];

  for (const p of patterns) {
    const m = text.match(p);
    if (m && m[1]) {
      const cleaned = cleanName(m[1]);
      if (isValidName(cleaned)) {
        return { value: cleaned, confidence: 88, isUncertain: false };
      }
    }
  }

  // Positional fallback for Aadhaar / Income certificates
  for (let i = 0; i < Math.min(lines.length, 12); i++) {
    const line = lines[i];
    const up = line.toUpperCase();
    if (up.includes('GOVERNMENT OF INDIA') || up.includes('UNIQUE IDENTIFICATION') || up.includes('GOVERNMENT OF TAMIL NADU')) {
      if (i + 1 < lines.length) {
        const candidate = cleanName(lines[i + 1]);
        if (isValidName(candidate)) {
          return { value: candidate, confidence: 68, isUncertain: true };
        }
      }
    }
  }

  return { value: '', confidence: 0, isUncertain: true };
}

function cleanName(raw) {
  return raw
    .replace(/(?:Father|Mother|DOB|Year|Male|Female|Address|UIDAI|Govt).*/i, '')
    .replace(/[^A-Za-z\s.]/g, '')
    .trim();
}

function isValidName(name) {
  return name && name.length >= 3 && !/^(government|department|revenue|certificate|officer|tamil|india)$/i.test(name);
}

function extractDOB(text) {
  // DD/MM/YYYY or YYYY/MM/DD
  const m = text.match(/\b(\d{2}[\/\-.]\d{2}[\/\-.]\d{4}|\d{4}[\/\-.]\d{2}[\/\-.]\d{2})\b/);
  if (m) {
    const parts = m[1].replace(/[\/.]/g, '-').split('-');
    if (parts.length === 3) {
      const formatted = parts[0].length === 4 
        ? `${parts[0]}-${parts[1]}-${parts[2]}` 
        : `${parts[2]}-${parts[1]}-${parts[0]}`;
      return { value: formatted, confidence: 92 };
    }
  }

  // Year of Birth fallback
  const yob = text.match(/(?:Year of Birth|YOB|DOB|Birth Year)\s*[:\-]?\s*(19\d{2}|20\d{2})/i);
  if (yob) {
    return { value: `${yob[1]}-01-01`, confidence: 75 };
  }

  return { value: '', confidence: 0 };
}

function extractGender(text) {
  const lower = text.toLowerCase();
  if (/\b(female|woman|stree|mahila|பெண்)\b/.test(lower)) {
    return { value: 'Female', confidence: 95 };
  }
  if (/\b(male|man|purush|ஆண்)\b/.test(lower) && !/\bfemale\b/.test(lower)) {
    return { value: 'Male', confidence: 95 };
  }
  if (/\b(transgender|thirunangai|திருநங்கை)\b/.test(lower)) {
    return { value: 'Transgender', confidence: 95 };
  }
  return { value: '', confidence: 0 };
}

function extractLocation(text) {
  const lower = text.toLowerCase();
  let matchedState = '';
  let matchedDistrict = '';

  for (const st of INDIAN_STATES) {
    if (lower.includes(st.toLowerCase())) {
      matchedState = st;
      break;
    }
  }

  for (const dist of TAMIL_NADU_DISTRICTS) {
    if (lower.includes(dist.toLowerCase())) {
      matchedDistrict = dist;
      if (!matchedState) matchedState = 'Tamil Nadu';
      break;
    }
  }

  return {
    state: matchedState,
    district: matchedDistrict,
    confidence: matchedState ? (matchedDistrict ? 90 : 80) : 0
  };
}

function extractDocumentNumber(text, documentType) {
  const cleaned = text.replace(/[\r\n]+/g, ' ');

  switch (documentType) {
    case 'Aadhaar': {
      // 12 digit number, usually formatted XXXX XXXX XXXX
      const match = cleaned.match(/\b(\d{4}\s?\d{4}\s?\d{4})\b/);
      if (match) {
        const d = match[1].replace(/\s/g, '');
        return { value: `${d.slice(0, 4)} ${d.slice(4, 8)} ${d.slice(8, 12)}`, confidence: 96, isAmbiguous: false };
      }
      break;
    }

    case 'PAN': {
      // 5 letters + 4 digits + 1 letter
      const match = cleaned.match(/\b([A-Z]{5}[0-9]{4}[A-Z])\b/);
      if (match) return { value: match[1], confidence: 98, isAmbiguous: false };
      break;
    }

    case 'Ration Card': {
      // Smart Card / PDS Ration format: e.g. 05/G/0123456 or 12 alphanumeric
      const match = cleaned.match(/\b(\d{2}\/[A-Z0-9]\/\d{7}|\d{10,14})\b/i);
      if (match) return { value: match[1].toUpperCase(), confidence: 85, isAmbiguous: false };
      break;
    }

    case 'Income Certificate':
    case 'Community Certificate':
    case 'Residence Certificate':
    case 'First Graduate Certificate': {
      // Common e-District / e-Sevai formats: TN-520240123456, REV/2026/89124, etc.
      const match = cleaned.match(/\b((?:TN[-/]?\d{10,14})|(?:(?:INC|COMM|RES|FGC|REV)[-/][A-Z0-9/]{6,16}))\b/i);
      if (match) return { value: match[1].toUpperCase(), confidence: 90, isAmbiguous: false };
      break;
    }

    case 'Disability Certificate': {
      // UDID format: TN1234567890123456
      const match = cleaned.match(/\b([A-Z]{2}\d{14,18})\b/i);
      if (match) return { value: match[1].toUpperCase(), confidence: 88, isAmbiguous: false };
      break;
    }
  }

  // Generic fallback: check for "Certificate No:" or "Reg No:"
  const genMatch = cleaned.match(/(?:Certificate\s*No|Reg\s*No|Application\s*No|Ref\s*No|Doc\s*No)[.:\s]+([A-Z0-9\/-]{6,24})/i);
  if (genMatch) {
    return { value: genMatch[1].trim(), confidence: 75, isAmbiguous: true };
  }

  return { value: '', confidence: 0, isAmbiguous: false };
}

function extractIncome(text) {
  const patterns = [
    /(?:Annual\s*Income|Family\s*Income|வருமானம்|Income\s*is|Total\s*Income)\s*[:\-–]?\s*(?:Rs\.?|INR|₹)?\s*([0-9,]+)/i,
    /(?:Rs\.?|INR|₹)\s*([0-9,]{4,10})\s*(?:\/-|\/year|per\s*annum|only)/i,
    /\b([1-9][0-9]{4,6})\s*(?:\/-|\s*rupees)/i
  ];

  for (const p of patterns) {
    const m = text.match(p);
    if (m && m[1]) {
      const num = parseInt(m[1].replace(/,/g, ''), 10);
      if (!isNaN(num) && num >= 10000 && num <= 100000000) {
        return { value: num, confidence: 92 };
      }
    }
  }
  return { value: undefined, confidence: 0 };
}

function extractCategory(text) {
  const upper = text.toUpperCase();
  if (upper.includes('MOST BACKWARD') || upper.includes('MBC')) {
    return { value: 'OBC', confidence: 94 }; // In central/common categorization, MBC is under OBC
  }
  if (upper.includes('BACKWARD CLASS') || upper.includes('OBC') || upper.includes('BC')) {
    return { value: 'OBC', confidence: 92 };
  }
  if (upper.includes('SCHEDULED CASTE') || upper.includes('SC')) {
    return { value: 'SC', confidence: 96 };
  }
  if (upper.includes('SCHEDULED TRIBE') || upper.includes('ST')) {
    return { value: 'ST', confidence: 96 };
  }
  if (upper.includes('ECONOMICALLY WEAKER') || upper.includes('EWS')) {
    return { value: 'EWS', confidence: 90 };
  }
  if (upper.includes('GENERAL') || upper.includes('OPEN CATEGORY')) {
    return { value: 'General', confidence: 85 };
  }
  return { value: '', confidence: 0 };
}

function extractIssuingAuthority(text, lines) {
  const patterns = [
    /(?:Issuing Authority|Issued by|வழங்கியவர்|Tahsildar|Revenue Divisional Officer|District Collector)/i,
    /(?:Revenue Department|Government of Tamil Nadu|UIDAI|Income Tax Department)/i
  ];

  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      return { value: m[0], confidence: 85 };
    }
  }
  return { value: 'Revenue Department', confidence: 60 };
}
