import type { DiffPart, DiffStats, PageDiff } from './diffUtils.js';
import type { PDFDocument } from './pdfUtils.js';

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\n/g, '<br>');
}

export interface ReportData {
  originalDoc: PDFDocument;
  modifiedDoc: PDFDocument;
  pageDiffs: PageDiff[];
  overallStats: DiffStats;
  generatedAt: string;
}

export function generateHtmlReport(data: ReportData): string {
  const { originalDoc, modifiedDoc, pageDiffs, overallStats, generatedAt } = data;
  const changedPages = pageDiffs.filter(p => p.hasChanges);
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PDF Diff Report</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
      padding: 20px;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    
    header {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      padding: 30px;
    }
    
    header h1 {
      font-size: 28px;
      margin-bottom: 10px;
    }
    
    header .meta {
      opacity: 0.9;
      font-size: 14px;
    }
    
    .summary {
      padding: 30px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .files {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .file-card {
      background: #f9fafb;
      padding: 15px;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }
    
    .file-card h3 {
      font-size: 12px;
      text-transform: uppercase;
      color: #6b7280;
      margin-bottom: 5px;
    }
    
    .file-card .filename {
      font-weight: 600;
      word-break: break-all;
    }
    
    .file-card .pages {
      color: #6b7280;
      font-size: 14px;
      margin-top: 5px;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
    }
    
    .stat-card {
      text-align: center;
      padding: 20px;
      border-radius: 8px;
      background: #f9fafb;
    }
    
    .stat-card.additions {
      background: #dcfce7;
      color: #166534;
    }
    
    .stat-card.deletions {
      background: #fee2e2;
      color: #991b1b;
    }
    
    .stat-card.unchanged {
      background: #f3f4f6;
      color: #4b5563;
    }
    
    .stat-card.percentage {
      background: #e0e7ff;
      color: #3730a3;
    }
    
    .stat-card .value {
      font-size: 32px;
      font-weight: 700;
    }
    
    .stat-card .label {
      font-size: 12px;
      text-transform: uppercase;
      margin-top: 5px;
    }
    
    .page-index {
      padding: 20px 30px;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .page-index h2 {
      font-size: 18px;
      margin-bottom: 15px;
    }
    
    .page-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .page-chip {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 14px;
      text-decoration: none;
      transition: transform 0.2s;
    }
    
    .page-chip:hover {
      transform: scale(1.05);
    }
    
    .page-chip.changed {
      background: #fef3c7;
      color: #92400e;
    }
    
    .page-chip.unchanged {
      background: #e5e7eb;
      color: #6b7280;
    }
    
    .diff-content {
      padding: 30px;
    }
    
    .page-diff {
      margin-bottom: 40px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .page-header {
      background: #f9fafb;
      padding: 15px 20px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .page-header h3 {
      font-size: 16px;
    }
    
    .page-header .badge {
      font-size: 12px;
      padding: 4px 10px;
      border-radius: 12px;
    }
    
    .page-header .badge.changed {
      background: #fef3c7;
      color: #92400e;
    }
    
    .page-header .badge.unchanged {
      background: #dcfce7;
      color: #166534;
    }
    
    .diff-text {
      padding: 20px;
      font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
      font-size: 13px;
      white-space: pre-wrap;
      word-wrap: break-word;
      background: #fafafa;
      line-height: 1.8;
    }
    
    .diff-added {
      background: #dcfce7;
      color: #166534;
      padding: 2px 0;
    }
    
    .diff-removed {
      background: #fee2e2;
      color: #991b1b;
      padding: 2px 0;
      text-decoration: line-through;
    }
    
    footer {
      background: #f9fafb;
      padding: 20px 30px;
      text-align: center;
      font-size: 14px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
    }
    
    footer a {
      color: #6366f1;
      text-decoration: none;
    }
    
    footer a:hover {
      text-decoration: underline;
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      
      .container {
        box-shadow: none;
      }
      
      .page-diff {
        page-break-inside: avoid;
      }
    }
    
    @media (max-width: 768px) {
      .files {
        grid-template-columns: 1fr;
      }
      
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>📄 PDF Diff Report</h1>
      <div class="meta">Generated on ${escapeHtml(generatedAt)}</div>
    </header>
    
    <section class="summary">
      <div class="files">
        <div class="file-card">
          <h3>Original File</h3>
          <div class="filename">${escapeHtml(originalDoc.name)}</div>
          <div class="pages">${originalDoc.totalPages} page${originalDoc.totalPages !== 1 ? 's' : ''}</div>
        </div>
        <div class="file-card">
          <h3>Modified File</h3>
          <div class="filename">${escapeHtml(modifiedDoc.name)}</div>
          <div class="pages">${modifiedDoc.totalPages} page${modifiedDoc.totalPages !== 1 ? 's' : ''}</div>
        </div>
      </div>
      
      <div class="stats-grid">
        <div class="stat-card additions">
          <div class="value">+${overallStats.additions}</div>
          <div class="label">Additions</div>
        </div>
        <div class="stat-card deletions">
          <div class="value">-${overallStats.deletions}</div>
          <div class="label">Deletions</div>
        </div>
        <div class="stat-card unchanged">
          <div class="value">${overallStats.unchanged}</div>
          <div class="label">Unchanged</div>
        </div>
        <div class="stat-card percentage">
          <div class="value">${overallStats.changePercentage.toFixed(1)}%</div>
          <div class="label">Changed</div>
        </div>
      </div>
    </section>
    
    <section class="page-index">
      <h2>Page Overview (${changedPages.length} of ${pageDiffs.length} pages changed)</h2>
      <div class="page-chips">
        ${pageDiffs.map(p => `
          <a href="#page-${p.pageNumber}" class="page-chip ${p.hasChanges ? 'changed' : 'unchanged'}">
            Page ${p.pageNumber}${p.hasChanges ? ' ✎' : ''}
          </a>
        `).join('')}
      </div>
    </section>
    
    <section class="diff-content">
      ${pageDiffs.map(pageDiff => `
        <div id="page-${pageDiff.pageNumber}" class="page-diff">
          <div class="page-header">
            <h3>Page ${pageDiff.pageNumber}</h3>
            <span class="badge ${pageDiff.hasChanges ? 'changed' : 'unchanged'}">
              ${pageDiff.hasChanges ? 'Changed' : 'Unchanged'}
            </span>
          </div>
          <div class="diff-text">${renderDiffParts(pageDiff.parts)}</div>
        </div>
      `).join('')}
    </section>
    
    <footer>
      Generated by <a href="https://www.pdf-diff.com" target="_blank" rel="noopener noreferrer">PDF Diff</a>
    </footer>
  </div>
</body>
</html>`;
}

function renderDiffParts(parts: DiffPart[]): string {
  return parts.map(part => {
    const text = escapeHtml(part.value);
    if (part.added) {
      return `<span class="diff-added">${text}</span>`;
    } else if (part.removed) {
      return `<span class="diff-removed">${text}</span>`;
    }
    return text;
  }).join('');
}

export function generateTextOutput(data: ReportData): string {
  const { originalDoc, modifiedDoc, pageDiffs, overallStats } = data;
  const lines: string[] = [];
  
  lines.push('═'.repeat(60));
  lines.push('                    PDF DIFF REPORT');
  lines.push('═'.repeat(60));
  lines.push('');
  lines.push(`Original: ${originalDoc.name} (${originalDoc.totalPages} pages)`);
  lines.push(`Modified: ${modifiedDoc.name} (${modifiedDoc.totalPages} pages)`);
  lines.push('');
  lines.push('─'.repeat(60));
  lines.push('                     STATISTICS');
  lines.push('─'.repeat(60));
  lines.push(`  + Additions:  ${overallStats.additions}`);
  lines.push(`  - Deletions:  ${overallStats.deletions}`);
  lines.push(`    Unchanged:  ${overallStats.unchanged}`);
  lines.push(`    Changed:    ${overallStats.changePercentage.toFixed(1)}%`);
  lines.push('');
  
  const changedPages = pageDiffs.filter(p => p.hasChanges);
  lines.push('─'.repeat(60));
  lines.push(`                  PAGE SUMMARY (${changedPages.length}/${pageDiffs.length} changed)`);
  lines.push('─'.repeat(60));
  
  for (const page of pageDiffs) {
    const status = page.hasChanges ? '✎ CHANGED' : '✓ OK';
    lines.push(`  Page ${page.pageNumber}: ${status}`);
  }
  
  lines.push('');
  lines.push('═'.repeat(60));
  
  return lines.join('\n');
}

export function generateJsonOutput(data: ReportData): string {
  return JSON.stringify({
    summary: {
      originalFile: data.originalDoc.name,
      originalPages: data.originalDoc.totalPages,
      modifiedFile: data.modifiedDoc.name,
      modifiedPages: data.modifiedDoc.totalPages,
      generatedAt: data.generatedAt,
    },
    statistics: data.overallStats,
    pages: data.pageDiffs.map(p => ({
      pageNumber: p.pageNumber,
      hasChanges: p.hasChanges,
    })),
  }, null, 2);
}

export function generateJunitOutput(data: ReportData): string {
  const changedPages = data.pageDiffs.filter(p => p.hasChanges);
  const failures = changedPages.length;
  const tests = data.pageDiffs.length;
  
  const testcases = data.pageDiffs.map(page => {
    if (page.hasChanges) {
      return `    <testcase name="Page ${page.pageNumber}" classname="pdf-diff">
      <failure message="Page ${page.pageNumber} has differences">Changes detected on page ${page.pageNumber}</failure>
    </testcase>`;
    }
    return `    <testcase name="Page ${page.pageNumber}" classname="pdf-diff"/>`;
  }).join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<testsuite name="PDF Diff" tests="${tests}" failures="${failures}" errors="0">
${testcases}
</testsuite>`;
}
