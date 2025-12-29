import jsPDF from 'jspdf';
import type { DiffPart } from './diffUtils';
import type { PDFDocument } from './pdfUtils';
import { computeTextDiff, computeStats, combineStats } from './diffUtils';
import type { DiffStats } from './diffUtils';

export function exportDiffToPDF(
  originalDoc: PDFDocument,
  modifiedDoc: PDFDocument
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Helper function to check if we need a new page
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Compute stats for all pages
  const maxPages = Math.max(originalDoc.totalPages, modifiedDoc.totalPages);
  const allStats: DiffStats[] = [];
  const allDiffs: Array<{ page: number; parts: DiffPart[] }> = [];

  for (let i = 0; i < maxPages; i++) {
    const originalText = originalDoc.pages[i]?.text || '';
    const modifiedText = modifiedDoc.pages[i]?.text || '';
    const parts = computeTextDiff(originalText, modifiedText);
    const pageStats = computeStats(parts);
    allStats.push(pageStats);
    allDiffs.push({ page: i + 1, parts });
  }

  const combinedStats = combineStats(allStats);

  // Title
  doc.setFontSize(20);
  doc.setTextColor(99, 102, 241);
  doc.text('PDF Diff Report', margin, yPosition);
  yPosition += 10;

  // Document info
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Total Pages: ${maxPages}`, margin, yPosition);
  yPosition += 10;

  // File names
  doc.setFontSize(11);
  doc.setTextColor(50, 50, 50);
  doc.text('Original:', margin, yPosition);
  doc.setTextColor(100, 100, 100);
  const origName = doc.splitTextToSize(originalDoc.name, maxWidth - 20);
  doc.text(origName, margin + 20, yPosition);
  yPosition += 6 * origName.length;
  
  doc.setTextColor(50, 50, 50);
  doc.text('Modified:', margin, yPosition);
  doc.setTextColor(100, 100, 100);
  const modName = doc.splitTextToSize(modifiedDoc.name, maxWidth - 20);
  doc.text(modName, margin + 20, yPosition);
  yPosition += 6 * modName.length + 4;

  // Statistics section
  checkPageBreak(35);
  doc.setFontSize(14);
  doc.setTextColor(50, 50, 50);
  doc.text('Overall Statistics', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  
  // Stats box background
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, yPosition - 5, maxWidth, 25, 'F');
  
  const statSpacing = maxWidth / 4;
  
  doc.setTextColor(34, 197, 94);
  doc.text(`+ ${combinedStats.additions}`, margin + 5, yPosition);
  doc.setTextColor(100, 100, 100);
  doc.text('Additions', margin + 5, yPosition + 5);
  
  doc.setTextColor(239, 68, 68);
  doc.text(`- ${combinedStats.deletions}`, margin + statSpacing, yPosition);
  doc.setTextColor(100, 100, 100);
  doc.text('Deletions', margin + statSpacing, yPosition + 5);
  
  doc.setTextColor(100, 116, 139);
  doc.text(`${combinedStats.unchanged}`, margin + statSpacing * 2, yPosition);
  doc.setTextColor(100, 100, 100);
  doc.text('Unchanged', margin + statSpacing * 2, yPosition + 5);
  
  doc.setTextColor(99, 102, 241);
  doc.text(`${combinedStats.changePercentage.toFixed(1)}%`, margin + statSpacing * 3, yPosition);
  doc.setTextColor(100, 100, 100);
  doc.text('Changed', margin + statSpacing * 3, yPosition + 5);
  
  yPosition += 28;

  // Diff content for all pages
  doc.setFontSize(14);
  
  for (const { page, parts } of allDiffs) {
    checkPageBreak(20);
    
    doc.setTextColor(50, 50, 50);
    doc.text(`Page ${page}`, margin, yPosition);
    yPosition += 8;

    doc.setFontSize(9);
    
    // Process diff parts for this page
    for (const part of parts) {
      if (!part.value.trim()) continue;

      const lines = part.value.split('\n');
      
      for (const line of lines) {
        if (!line.trim()) {
          yPosition += 3;
          continue;
        }
        
        checkPageBreak(6);

        // Wrap text if too long
        const wrappedText = doc.splitTextToSize(line, maxWidth - 5);
        
        for (let i = 0; i < wrappedText.length; i++) {
          checkPageBreak(6);
          
          // Background color based on change type
          if (part.added) {
            doc.setFillColor(220, 252, 231);
            doc.rect(margin, yPosition - 4, maxWidth, 5, 'F');
            doc.setTextColor(21, 128, 61);
            doc.text('+ ', margin + 2, yPosition);
          } else if (part.removed) {
            doc.setFillColor(254, 226, 226);
            doc.rect(margin, yPosition - 4, maxWidth, 5, 'F');
            doc.setTextColor(185, 28, 28);
            doc.text('- ', margin + 2, yPosition);
          } else {
            doc.setTextColor(100, 100, 100);
            doc.text('  ', margin + 2, yPosition);
          }
          
          doc.text(wrappedText[i], margin + 7, yPosition);
          yPosition += 5;
        }
      }
    }
    
    doc.setFontSize(14);
    yPosition += 5;
  }

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  const timestamp = new Date().toISOString().slice(0, 10);
  doc.save(`pdf-diff-${timestamp}.pdf`);
}
