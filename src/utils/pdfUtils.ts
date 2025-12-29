import * as pdfjsLib from 'pdfjs-dist';

// Set up the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export interface PDFPage {
  pageNumber: number;
  text: string;
}

export interface PDFDocument {
  name: string;
  pages: PDFPage[];
  totalPages: number;
}

export async function extractTextFromPDF(file: File): Promise<PDFDocument> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages: PDFPage[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    
    // Preserve line breaks by checking Y positions
    let lastY = -1;
    const text = textContent.items
      .map((item, index) => {
        if (!('str' in item)) return '';
        
        const currentY = item.transform[5];
        const needsNewline = lastY !== -1 && Math.abs(currentY - lastY) > 5;
        lastY = currentY;
        
        const nextItem = textContent.items[index + 1];
        const needsSpace = nextItem && 'str' in nextItem && 
          nextItem.transform[4] - (item.transform[4] + item.width) > 2;
        
        return (needsNewline ? '\n' : '') + item.str + (needsSpace ? ' ' : '');
      })
      .join('');
    
    pages.push({ pageNumber: i, text });
  }

  return {
    name: file.name,
    pages,
    totalPages: pdf.numPages,
  };
}

export async function renderPageToCanvas(
  file: File,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  scale: number = 1.5
): Promise<void> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(pageNumber);
  
  const viewport = page.getViewport({ scale });
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not get canvas context');
  
  await page.render({
    canvasContext: context,
    viewport,
  }).promise;
}
