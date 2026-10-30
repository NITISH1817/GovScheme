import path from 'path';
import fs from 'fs';
import { extractStructuredFields, extractRawTextFromFile } from '../services/ocrEngine.js';

export const processOCR = async (req, res) => {
  try {
    const { docType, imageUrl, text, rawText, language } = req.body;
    const documentType = docType || 'Aadhaar';

    // 1. If raw text is provided directly, extract structured fields deterministically
    const inputText = text || rawText;
    if (inputText && typeof inputText === 'string' && inputText.trim().length > 0) {
      const structured = extractStructuredFields(inputText, documentType);
      return res.json({
        success: true,
        docType: documentType,
        docNumber: structured.fields.docNumber || '',
        confidenceScore: structured.confidences.overall || 75,
        extracted: structured.fields,
        fieldConfidences: structured.confidences,
        fieldFlags: structured.flags
      });
    }

    // 2. If a local file path is provided in imageUrl (e.g. /uploads/...)
    if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('/uploads/')) {
      const fileName = path.basename(imageUrl);
      const physicalPath = path.resolve('uploads', fileName);
      if (fs.existsSync(physicalPath)) {
        const mimeType = fileName.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg';
        const ocrResult = await extractRawTextFromFile(physicalPath, mimeType, language || 'eng');
        const structured = extractStructuredFields(ocrResult.rawText, documentType);

        return res.json({
          success: true,
          docType: documentType,
          docNumber: structured.fields.docNumber || '',
          confidenceScore: structured.confidences.overall || ocrResult.meanConfidence,
          rawText: ocrResult.rawText,
          extracted: structured.fields,
          fieldConfidences: structured.confidences,
          fieldFlags: structured.flags
        });
      }
    }

    // 3. Fallback when neither text nor valid file is provided
    return res.status(400).json({
      success: false,
      message: 'Please provide valid document text or upload a document file to perform OCR extraction.'
    });

  } catch (error) {
    console.error('[OCR Controller Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
