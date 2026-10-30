import * as pdfjsLib from 'pdfjs-dist';

// @ts-ignore
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

export interface PDFProcessingResult {
  text: string;
  pageImages: string[];
  pageCount: number;
  hasEmbeddedText: boolean;
  isEncrypted?: boolean;
  error?: string;
}

/**
 * Converts up to the first 6 pages of a PDF file into base64 Data URL images.
 */
export async function convertPDFToImageURLs(file: File): Promise<string[]> {
  const result = await extractPDFTextAndImages(file);
  return result.pageImages;
}

/**
 * Intelligent PDF Extraction Pipeline:
 * 1. Validates PDF file and catches password protection or corrupted files.
 * 2. Extracts embedded text from all pages when available.
 * 3. Renders scanned pages (or pages with low text) into high-resolution images for OCR.
 */
export async function extractPDFTextAndImages(file: File): Promise<PDFProcessingResult> {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (!isPdf) {
    throw new Error('File is not a valid PDF document.');
  }

  if (file.size === 0) {
    return {
      text: '',
      pageImages: [],
      pageCount: 0,
      hasEmbeddedText: false,
      error: 'The uploaded PDF file is empty (0 bytes).'
    };
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const pdf = await loadingTask.promise;

    const pageCount = pdf.numPages || 0;
    if (pageCount === 0) {
      return {
        text: '',
        pageImages: [],
        pageCount: 0,
        hasEmbeddedText: false,
        error: 'The uploaded PDF document contains no pages.'
      };
    }

    let combinedEmbeddedText = '';
    const pageImages: string[] = [];
    const pagesToScan = Math.min(pageCount, 6);

    for (let i = 1; i <= pagesToScan; i++) {
      try {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageStrings = textContent.items
          .filter((item: any) => typeof item.str === 'string')
          .map((item: any) => item.str.trim())
          .filter(Boolean);
        const pageText = pageStrings.join(' ');

        if (pageText.length > 25) {
          combinedEmbeddedText += `\n--- Page ${i} ---\n${pageText}\n`;
        } else {
          // Insufficient embedded text: render page to canvas for OCR processing
          const scale = 2.0;
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          if (context) {
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
              canvasContext: context,
              viewport: viewport,
              canvas: canvas
            } as any).promise;

            pageImages.push(canvas.toDataURL('image/jpeg', 0.85));
          }
        }
      } catch (pageErr) {
        console.warn(`[PDF Helper] Error processing page ${i}:`, pageErr);
      }
    }

    return {
      text: combinedEmbeddedText.trim(),
      pageImages,
      pageCount,
      hasEmbeddedText: combinedEmbeddedText.trim().length > 30
    };
  } catch (err: any) {
    const errorMsg = err?.message || String(err);
    const isEncrypted = errorMsg.toLowerCase().includes('password') || err?.name === 'PasswordException';
    return {
      text: '',
      pageImages: [],
      pageCount: 0,
      hasEmbeddedText: false,
      isEncrypted,
      error: isEncrypted
        ? 'This PDF document is password-protected. Please upload an unprotected copy.'
        : `Unable to parse PDF document: ${errorMsg}`
    };
  }
}
