import * as pdfjsLib from 'pdfjs-dist';

// Use local worker file via Vite's url import to avoid CORS issues
import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;

/**
 * Converts up to the first 5 pages of a PDF file into base64 Data URL images.
 */
export async function convertPDFToImageURLs(file: File): Promise<string[]> {
  if (file.type !== 'application/pdf') {
    throw new Error('File is not a PDF');
  }

  // Read file as ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();

  // Load the PDF document
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;

  if (pdf.numPages === 0) {
    throw new Error('PDF has no pages');
  }

  const imageUrls: string[] = [];
  // Scan up to 6 pages to ensure we catch the document if it's appended at the end
  const pagesToScan = Math.min(pdf.numPages, 6);

  for (let i = 1; i <= pagesToScan; i++) {
    const page = await pdf.getPage(i);

    // Set the scale for rendering (higher scale = better OCR resolution)
    const scale = 2.0;
    const viewport = page.getViewport({ scale });

    // Create a canvas element
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      continue;
    }

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Render PDF page into canvas context
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };
    
    await page.render(renderContext).promise;

    // Convert canvas to base64 jpeg
    imageUrls.push(canvas.toDataURL('image/jpeg', 0.8));
  }

  return imageUrls;
}
