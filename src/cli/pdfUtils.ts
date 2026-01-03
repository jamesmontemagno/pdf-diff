import * as fs from 'fs';
import * as path from 'path';

// Dynamic import for pdfjs-dist (use legacy build for Node.js compatibility)
let pdfjsLib: typeof import('pdfjs-dist/legacy/build/pdf.mjs') | null = null;

async function getPdfjs() {
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  }
  return pdfjsLib;
}

export interface PDFPage {
  pageNumber: number;
  text: string;
}

export interface PDFDocument {
  name: string;
  pages: PDFPage[];
  totalPages: number;
}

export async function extractTextFromPDFFile(filePath: string): Promise<PDFDocument> {
  const pdfjs = await getPdfjs();
  const absolutePath = path.resolve(filePath);
  
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`);
  }
  
  const data = new Uint8Array(fs.readFileSync(absolutePath));
  const pdf = await pdfjs.getDocument({ data }).promise;
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
    name: path.basename(filePath),
    pages,
    totalPages: pdf.numPages,
  };
}

export function parsePageSpec(spec: string, maxPages: number): number[] {
  const pages: Set<number> = new Set();
  const parts = spec.split(',');
  
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.includes('-')) {
      const [start, end] = trimmed.split('-').map(n => parseInt(n.trim(), 10));
      for (let i = start; i <= Math.min(end, maxPages); i++) {
        if (i >= 1) pages.add(i);
      }
    } else {
      const num = parseInt(trimmed, 10);
      if (num >= 1 && num <= maxPages) {
        pages.add(num);
      }
    }
  }
  
  return Array.from(pages).sort((a, b) => a - b);
}
