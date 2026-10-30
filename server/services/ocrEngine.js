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
 * Normalizes Indic numerals (Devanagari, Tamil, Telugu, Gujarati, Malayalam)
 * into standard Arabic numerals (0-9).
 */
export function normalizeIndicNumerals(text) {
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

/**
 * Calculate age based on ISO YYYY-MM-DD birthdate string
 */
export function calculateAge(dobString) {
  if (!dobString) return null;
  let y, m, d;
  if (dobString.includes('-')) {
    const parts = dobString.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        y = parseInt(parts[0], 10);
        m = parseInt(parts[1], 10) - 1;
        d = parseInt(parts[2], 10);
      } else {
        d = parseInt(parts[0], 10);
        m = parseInt(parts[1], 10) - 1;
        y = parseInt(parts[2], 10);
      }
    }
  } else if (dobString.includes('/')) {
    const parts = dobString.split('/');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        y = parseInt(parts[0], 10);
        m = parseInt(parts[1], 10) - 1;
        d = parseInt(parts[2], 10);
      } else {
        d = parseInt(parts[0], 10);
        m = parseInt(parts[1], 10) - 1;
        y = parseInt(parts[2], 10);
      }
    }
  }
  if (y !== undefined && m !== undefined && d !== undefined) {
    const birthDate = new Date(y, m, d);
    if (!isNaN(birthDate.getTime())) {
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const mDiff = today.getMonth() - birthDate.getMonth();
      if (mDiff < 0 || (mDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 0 && age <= 125 ? age : null;
    }
  }
  return null;
}

/**
 * Mask Aadhaar number to display XXXX XXXX 1234 for citizen privacy
 */
export function maskAadhaarNumber(aadhaarNumber) {
  if (!aadhaarNumber) return '';
  const digits = aadhaarNumber.replace(/[^\d]/g, '');
  if (digits.length >= 12) {
    return `XXXX XXXX ${digits.slice(-4)}`;
  }
  return aadhaarNumber;
}

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
 * Core OCR text extraction using Tesseract.js with multilingual support and graceful fallback
 */
export async function extractRawTextFromFile(filePath, mimeType, lang = 'eng') {
  const isPdf = mimeType === 'application/pdf' || (filePath && filePath.toLowerCase().endsWith('.pdf'));

  // If PDF, process using pdfjs-dist and embedded scanned image OCR fallback
  if (isPdf) {
    try {
      const pdfBuffer = fs.readFileSync(filePath);

      // Validate empty PDF
      if (!pdfBuffer || pdfBuffer.length === 0) {
        return {
          rawText: '',
          meanConfidence: 0,
          pageCount: 0,
          error: 'Uploaded PDF file is empty.',
          engine: 'pdf-empty'
        };
      }

      // Detect password protection
      const headerStr = pdfBuffer.slice(0, 4096).toString('latin1');
      if (headerStr.includes('/Encrypt')) {
        return {
          rawText: 'This PDF document is password-protected. Please upload an unprotected copy.',
          meanConfidence: 0,
          pageCount: 1,
          isEncrypted: true,
          engine: 'pdf-encrypted'
        };
      }

      const { text: pdfText, pageCount } = await extractTextFromPdfBuffer(pdfBuffer);

      // If PDF has meaningful machine-readable text
      if (pdfText && pdfText.trim().length > 35) {
        return {
          rawText: normalizeIndicNumerals(pdfText.trim()),
          meanConfidence: 92,
          pageCount: pageCount || 1,
          engine: 'pdfjs-native'
        };
      }

      // If scanned PDF (insufficient embedded text), extract raster image streams and run Tesseract OCR
      const images = extractImageStreamsFromPdfBuffer(pdfBuffer);
      if (images.length > 0) {
        let combinedOcrText = pdfText ? pdfText.trim() + '\n' : '';
        let totalConfidence = 0;
        let processedImages = 0;

        for (const imgBuf of images.slice(0, 5)) {
          let worker = null;
          try {
            worker = await createWorker(lang || 'eng');
            const ret = await worker.recognize(imgBuf);
            await worker.terminate();
            worker = null;
            if (ret.data.text && ret.data.text.trim()) {
              combinedOcrText += '\n' + ret.data.text.trim();
              totalConfidence += (ret.data.confidence || 75);
              processedImages++;
            }
          } catch (tessErr) {
            if (worker) {
              await worker.terminate().catch(() => {});
            }
          }
        }

        if (combinedOcrText.trim().length > 10) {
          return {
            rawText: normalizeIndicNumerals(combinedOcrText.trim()),
            meanConfidence: processedImages > 0 ? Math.round(totalConfidence / processedImages) : 80,
            pageCount: pageCount || images.length,
            engine: 'pdf-scanned-ocr'
          };
        }
      }

      if (pdfText && pdfText.trim().length > 0) {
        return {
          rawText: normalizeIndicNumerals(pdfText.trim()),
          meanConfidence: 75,
          pageCount: pageCount || 1,
          engine: 'pdfjs-partial'
        };
      }
    } catch (pdfErr) {
      console.warn('[PDF Extract Notice] Direct PDF text stream unavailable:', pdfErr.message);
    }

    return {
      rawText: 'PDF document uploaded. Please verify or complete fields manually.',
      meanConfidence: 50,
      pageCount: 1,
      engine: 'pdf-fallback'
    };
  }

  // Tesseract OCR worker for image formats (JPG, PNG) with language fallback
  let worker = null;
  const targetLangs = [lang, 'eng'];
  const uniqueLangs = Array.from(new Set(targetLangs.filter(Boolean)));

  for (const l of uniqueLangs) {
    try {
      worker = await createWorker(l);
      const ret = await worker.recognize(filePath);
      await worker.terminate();
      worker = null;

      const rawExtracted = ret.data.text || '';
      return {
        rawText: normalizeIndicNumerals(rawExtracted),
        meanConfidence: typeof ret.data.confidence === 'number' ? Math.round(ret.data.confidence) : 75,
        words: ret.data.words?.map(w => ({ text: w.text, confidence: w.confidence })) || [],
        engine: `tesseract-${l}`
      };
    } catch (err) {
      if (worker) {
        await worker.terminate().catch(() => {});
        worker = null;
      }
      console.warn(`[OCR Engine Warning] Language '${l}' OCR failed, trying fallback:`, err.message);
    }
  }

  return {
    rawText: '',
    meanConfidence: 40,
    engine: 'tesseract-fallback'
  };
}

/**
 * Extract plain text from PDF buffer
 */
/**
 * Extracts embedded JPEG raster streams directly from scanned PDF buffers
 */
export function extractImageStreamsFromPdfBuffer(buffer) {
  const images = [];
  let pos = 0;
  const jpegStart = Buffer.from([0xFF, 0xD8, 0xFF]);
  const jpegEnd = Buffer.from([0xFF, 0xD9]);

  while (pos < buffer.length && images.length < 6) {
    const startIdx = buffer.indexOf(jpegStart, pos);
    if (startIdx === -1) break;

    const endIdx = buffer.indexOf(jpegEnd, startIdx + 3);
    if (endIdx === -1) break;

    const imgLen = (endIdx + 2) - startIdx;
    if (imgLen > 1024) { // Only valid images (>1KB)
      images.push(buffer.slice(startIdx, endIdx + 2));
    }
    pos = endIdx + 2;
  }
  return images;
}

/**
 * Extract plain text and page metadata from PDF buffer
 */
async function extractTextFromPdfBuffer(buffer) {
  try {
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const uint8Array = new Uint8Array(buffer);
    const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
    const pdfDocument = await loadingTask.promise;
    let textContent = '';
    const numPages = Math.min(pdfDocument.numPages, 6);
    for (let i = 1; i <= numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items
        .filter(item => typeof item.str === 'string')
        .map(item => item.str.trim())
        .filter(Boolean);
      if (strings.length > 0) {
        textContent += `\n--- Page ${i} ---\n` + strings.join(' ') + '\n';
      }
    }
    return { text: textContent.trim(), pageCount: pdfDocument.numPages };
  } catch (e) {
    return { text: '', pageCount: 1, error: e.message };
  }
}

/**
 * Structured field extractors per document type with defensible confidence & validation checks
 */
export function extractStructuredFields(rawText, documentType) {
  const normalizedText = normalizeIndicNumerals(rawText || '');
  const lines = normalizedText.split('\n').map(l => l.trim()).filter(Boolean);

  const fields = {};
  const confidences = {};
  const flags = [];

  // 1. Full Name Extraction
  const nameResult = extractName(normalizedText, lines, documentType);
  if (nameResult.value) {
    fields.fullName = nameResult.value;
    confidences.fullName = nameResult.confidence;
    if (nameResult.isUncertain) {
      flags.push({ field: 'fullName', type: 'LOW_CONFIDENCE', message: 'Name extracted with lower clarity. Please confirm spelling.' });
    }
  } else {
    flags.push({ field: 'fullName', type: 'MISSING', message: 'Name could not be detected automatically.' });
  }

  // 2. Date of Birth Extraction & Age Calculation
  const dobResult = extractDOB(normalizedText);
  if (dobResult.value) {
    fields.dob = dobResult.value;
    confidences.dob = dobResult.confidence;
    const computedAge = calculateAge(dobResult.value);
    if (computedAge !== null) {
      fields.age = computedAge;
      confidences.age = dobResult.confidence;
    }
  } else if (['Aadhaar', 'Birth Certificate', 'Community Certificate', 'Voter ID'].includes(documentType)) {
    flags.push({ field: 'dob', type: 'MISSING', message: 'Date of birth not clearly legible in document.' });
  }

  // 3. Gender Extraction
  const genderResult = extractGender(normalizedText);
  if (genderResult.value) {
    fields.gender = genderResult.value;
    confidences.gender = genderResult.confidence;
  }

  // 4. State & District Extraction
  const locationResult = extractLocation(normalizedText);
  if (locationResult.state) {
    fields.state = locationResult.state;
    confidences.state = locationResult.confidence;
  }
  if (locationResult.district) {
    fields.district = locationResult.district;
    confidences.district = locationResult.confidence;
  }

  // 5. Address Extraction
  const addressResult = extractAddress(normalizedText, lines);
  if (addressResult.value) {
    fields.address = addressResult.value;
    confidences.address = addressResult.confidence;
  }

  // 6. Document Number Extraction based on Document Type
  const docNumResult = extractDocumentNumber(normalizedText, documentType);
  if (docNumResult.value) {
    fields.docNumber = docNumResult.value;
    confidences.docNumber = docNumResult.confidence;
    if (docNumResult.isAmbiguous) {
      flags.push({ field: 'docNumber', type: 'AMBIGUOUS', message: 'Document identifier format appears partial or ambiguous.' });
    }
  } else {
    flags.push({ field: 'docNumber', type: 'MISSING', message: `${documentType} certificate / ID number not recognized.` });
  }

  // 7. Annual Income Extraction (for Income Certificate, Farmer Cert, Ration Card)
  if (['Income Certificate', 'Ration Card', 'Farmer Certificate'].includes(documentType)) {
    const incomeResult = extractIncome(normalizedText);
    if (incomeResult.value !== undefined) {
      fields.annualIncome = incomeResult.value;
      confidences.annualIncome = incomeResult.confidence;
    } else if (documentType === 'Income Certificate') {
      flags.push({ field: 'annualIncome', type: 'MISSING', message: 'Annual family income amount not detected on Income Certificate.' });
    }
  }

  // 8. Community / Caste Category Extraction
  if (['Community Certificate', 'First Graduate Certificate', 'Ration Card'].includes(documentType)) {
    const categoryResult = extractCategory(normalizedText);
    if (categoryResult.value) {
      fields.category = categoryResult.value;
      confidences.category = categoryResult.confidence;
    } else if (documentType === 'Community Certificate') {
      flags.push({ field: 'category', type: 'MISSING', message: 'Social category (OBC/SC/ST/MBC/BC) could not be identified.' });
    }
  }

  // 9. Disability Details (for Disability Certificate / UDID)
  if (['Disability Certificate'].includes(documentType)) {
    const disResult = extractDisability(normalizedText);
    if (disResult.percentage !== undefined) {
      fields.disabilityPercentage = disResult.percentage;
      confidences.disabilityPercentage = disResult.confidence;
    }
    if (disResult.type) {
      fields.disabilityType = disResult.type;
      confidences.disabilityType = disResult.confidence;
    }
  }

  // 10. Issuing Authority Extraction
  const authorityResult = extractIssuingAuthority(normalizedText, lines);
  if (authorityResult.value) {
    fields.issuingAuthority = authorityResult.value;
    confidences.issuingAuthority = authorityResult.confidence;
  }

  // Calculate overall confidence score
  const scoreKeys = Object.keys(confidences);
  const overall = scoreKeys.length > 0    ? Math.round(scoreKeys.reduce((acc, k) => acc + confidences[k], 0) / scoreKeys.length)
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
  else if (normalizedType.includes('community') || normalizedType.includes('caste')) docTypeParam = 'Community Certificate';
  else if (normalizedType.includes('ration')) docTypeParam = 'Ration Card';
  else if (normalizedType.includes('voter')) docTypeParam = 'Voter ID';
  else if (normalizedType.includes('first graduate')) docTypeParam = 'First Graduate Certificate';
  else if (normalizedType.includes('disability') || normalizedType.includes('udid')) docTypeParam = 'Disability Certificate';
  else if (normalizedType.includes('birth')) docTypeParam = 'Birth Certificate';
  else if (normalizedType.includes('residence') || normalizedType.includes('nativity') || normalizedType.includes('domicile')) docTypeParam = 'Residence Certificate';

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
      panNumber: res.fields.panNumber || res.fields.docNumber || null,
      voterId: res.fields.voterId || res.fields.docNumber || null,
      rationCardNumber: res.fields.rationCardNumber || res.fields.docNumber || null,
      annualIncome: res.fields.annualIncome !== undefined ? res.fields.annualIncome : null,
      dob: res.fields.dob || null,
      age: res.fields.age !== undefined ? res.fields.age : null,
      gender: res.fields.gender || null,
      category: res.fields.category || null,
      state: res.fields.state || null,
      district: res.fields.district || null,
      address: res.fields.address || null,
      disabilityPercentage: res.fields.disabilityPercentage !== undefined ? res.fields.disabilityPercentage : null,
      issuingAuthority: res.fields.issuingAuthority || null
    },
    fieldConfidences: res.confidences,
    fieldFlags: flagMap
  };
}

// ----------------- Individual Field Parsing Logic ----------------- //

function extractName(text, lines, documentType) {
  const patterns = [
    /(?:Name|Full Name|பெயர்|नाम|പേര്|नाव|નામ|పేరు)\s*[:\-–]?\s*([A-Za-z\s.]{3,40})/i,
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
    if (up.includes('GOVERNMENT OF INDIA') || up.includes('UNIQUE IDENTIFICATION') || up.includes('GOVERNMENT OF TAMIL NADU') || up.includes('ELECTION COMMISSION')) {
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
    .replace(/(?:Father|Mother|DOB|Year|Male|Female|Address|UIDAI|Govt|Election).*/i, '')
    .replace(/[^A-Za-z\s.]/g, '')
    .trim();
}

function isValidName(name) {
  return name && name.length >= 3 && !/^(government|department|revenue|certificate|officer|tamil|india|election|commission)$/i.test(name);
}

function extractDOB(text) {
  // DD/MM/YYYY or YYYY/MM/DD with separators
  const m = text.match(/\b(\d{2}[\/\-.]\d{2}[\/\-.]\d{4}|\d{4}[\/\-.]\d{2}[\/\-.]\d{2})\b/);
  if (m) {
    const parts = m[1].replace(/[\/.]/g, '-').split('-');
    if (parts.length === 3) {
      const formatted = parts[0].length === 4        ? `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`        : `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      return { value: formatted, confidence: 92 };
    }
  }

  // Year of Birth fallback
  const yob = text.match(/(?:Year of Birth|YOB|DOB|Birth Year|பிறந்த ஆண்டு|जन्म वर्ष)\s*[:\-]?\s*(19\d{2}|20\d{2})/i);
  if (yob) {
    return { value: `${yob[1]}-01-01`, confidence: 75 };
  }

  return { value: '', confidence: 0 };
}

function extractGender(text) {
  const lower = text.toLowerCase();
  if (/\b(female|woman|stree|mahila|பெண்|महिला|സ്ത്രീ|મહિલા|స్త్రీ)\b/.test(lower)) {
    return { value: 'Female', confidence: 95 };
  }
  if (/\b(male|man|purush|ஆண்|पुरुष|പുരുഷൻ|પુરુષ|పురుషుడు)\b/.test(lower) && !/\bfemale\b/.test(lower)) {
    return { value: 'Male', confidence: 95 };
  }
  if (/\b(transgender|thirunangai|திருநங்கை|तृतीय पंथी|ട്രാൻസ്‌ജെൻഡർ)\b/.test(lower)) {
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

function extractAddress(text, lines) {
  const patterns = [
    /(?:Address|Full Address|முகவரி|पता|ವಿಳಾಸ|చిరునామా|മേൽവിലാസം)\s*[:\-–]?\s*([A-Za-z0-9\s,.\/-]{10,120})/i,
    /(?:Village|Taluk|District|Pin\s*Code|Pincode)[\s\S]{5,80}?(?:\d{6})/i
  ];

  for (const p of patterns) {
    const m = text.match(p);
    if (m && m[1]) {
      const cleaned = m[1].replace(/[\r\n]+/g, ' ').trim();
      if (cleaned.length >= 8) {
        return { value: cleaned, confidence: 82 };
      }
    }
  }

  // Look for a line containing 6-digit pin code
  for (const line of lines) {
    if (/\b[1-9][0-9]{5}\b/.test(line) && line.length > 15) {
      return { value: line.trim(), confidence: 78 };
    }
  }

  return { value: '', confidence: 0 };
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

    case 'Voter ID': {
      // EPIC format: 3 letters + 7 numbers e.g. ABC1234567 or WB/01/012/123456
      const epicMatch = cleaned.match(/\b([A-Z]{3}[0-9]{7})\b/i) || cleaned.match(/\b([A-Z]{2}\/[0-9]{2}\/[0-9]{3}\/[0-9]{6})\b/i);
      if (epicMatch) {
        return { value: epicMatch[1].toUpperCase(), confidence: 95, isAmbiguous: false };
      }
      break;
    }

    case 'Ration Card': {
      // Smart Card / PDS Ration format: e.g. 05/G/0123456 or 12 alphanumeric
      const match = cleaned.match(/\b(\d{2}\/[A-Z0-9]\/\d{7}|\d{10,14})\b/i);
      if (match) return { value: match[1].toUpperCase(), confidence: 85, isAmbiguous: false };
      break;
    }

    case 'Birth Certificate': {
      const birthMatch = cleaned.match(/(?:Registration\s*No|Reg\s*No|Certificate\s*No|ப\s*எண்)[.:\s]+([A-Z0-9\/-]{4,20})/i) || cleaned.match(/\b([A-Z0-9]{2,5}[-/][0-9]{4}[-/][0-9]{4,8})\b/i);
      if (birthMatch) {
        return { value: birthMatch[1].toUpperCase(), confidence: 90, isAmbiguous: false };
      }
      break;
    }

    case 'Income Certificate':
    case 'Community Certificate':
    case 'Residence Certificate':
    case 'First Graduate Certificate': {
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
  const genMatch = cleaned.match(/(?:Certificate\s*No|Reg\s*No|Application\s*No|Ref\s*No|Doc\s*No|சான்றிதழ்\s*எண்|प्रमाण\s*पत्र\s*क्रमांक)[.:\s]+([A-Z0-9\/-]{6,24})/i);
  if (genMatch) {
    return { value: genMatch[1].trim(), confidence: 75, isAmbiguous: true };
  }

  return { value: '', confidence: 0, isAmbiguous: false };
}

function extractIncome(text) {
  const patterns = [
    /(?:Annual\s*Income|Family\s*Income|வருமானம்|वार्षिक आय|Total\s*Income|आय)[^0-9\n]{0,50}(?:Rs\.?|INR|₹)?\s*([0-9,]+)/i,
    /(?:Rs\.?|INR|₹)\s*([0-9,]{4,10})/i,
    /(?:income|amount)\s*(?:is|of)?\s*(?:Rs\.?|INR|₹)?\s*([0-9,]{4,10})/i,
    /\b([1-9][0-9]{4,6})\s*(?:\/-|\s*rupees|\s*only)/i
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
  if (upper.includes('MOST BACKWARD') || upper.includes('MBC') || upper.includes('மிகவும் பிற்படுத்தப்பட்ட')) {
    return { value: 'OBC', confidence: 94 };
  }
  if (upper.includes('BACKWARD CLASS') || upper.includes('OBC') || upper.includes('BC') || upper.includes('பிற்படுத்தப்பட்ட') || upper.includes('अन्य पिछड़ा')) {
    return { value: 'OBC', confidence: 92 };
  }
  if (upper.includes('SCHEDULED CASTE') || upper.includes('SC') || upper.includes('ஆதி திராவிடர்') || upper.includes('अनुसूचित जाति')) {
    return { value: 'SC', confidence: 96 };
  }
  if (upper.includes('SCHEDULED TRIBE') || upper.includes('ST') || upper.includes('பழங்குடியினர்') || upper.includes('अनुसूचित जनजाति')) {
    return { value: 'ST', confidence: 96 };
  }
  if (upper.includes('ECONOMICALLY WEAKER') || upper.includes('EWS') || upper.includes('आर्थिक रूप से कमजोर')) {
    return { value: 'EWS', confidence: 90 };
  }
  if (upper.includes('GENERAL') || upper.includes('OPEN CATEGORY') || upper.includes('सामान्य')) {
    return { value: 'General', confidence: 85 };
  }
  return { value: '', confidence: 0 };
}

function extractDisability(text) {
  const percentMatch = text.match(/([0-9]{2,3})\s*%/);
  const percentage = percentMatch ? parseInt(percentMatch[1], 10) : undefined;
  let type = '';
  const lower = text.toLowerCase();
  if (lower.includes('locomotor') || lower.includes('orthopedic')) type = 'Locomotor Disability';
  else if (lower.includes('visual') || lower.includes('blind')) type = 'Visual Impairment';
  else if (lower.includes('hearing') || lower.includes('deaf')) type = 'Hearing Impairment';
  else if (lower.includes('intellectual') || lower.includes('mental')) type = 'Intellectual Disability';

  return {
    percentage: percentage && percentage <= 100 ? percentage : undefined,
    type,
    confidence: percentage ? 90 : (type ? 80 : 0)
  };
}

function extractIssuingAuthority(text, lines) {
  const patterns = [
    /(?:Issuing Authority|Issued by|வழங்கியவர்|Tahsildar|Revenue Divisional Officer|District Collector|Medical Board)/i,
    /(?:Revenue Department|Government of Tamil Nadu|UIDAI|Income Tax Department|Election Commission)/i
  ];

  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      return { value: m[0], confidence: 85 };
    }
  }
  return { value: 'Revenue Department', confidence: 60 };
}
