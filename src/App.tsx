import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  PDFDropZone,
  DiffView,
  DiffStats as DiffStatsComponent,
  PrivacyBanner,
  PrivacyFeatures,
  ViewModeTabs,
  PageSelector,
  ThemeToggle,
  ExportButton,
} from './components';
import type { ViewMode, Theme } from './components';
import { extractTextFromPDF } from './utils/pdfUtils';
import type { PDFDocument } from './utils/pdfUtils';
import { computeTextDiff, computeStats } from './utils/diffUtils';
import type { DiffPart, DiffStats } from './utils/diffUtils';
import { exportDiffToPDF } from './utils/exportUtils';
import './App.css';
import pdfIcon from '/pdf-icon.svg';

interface PageDiffResult {
  pageNumber: number;
  parts: DiffPart[];
  originalText: string;
  modifiedText: string;
  stats: DiffStats;
}

function App() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [modifiedFile, setModifiedFile] = useState<File | null>(null);
  const [originalDoc, setOriginalDoc] = useState<PDFDocument | null>(null);
  const [modifiedDoc, setModifiedDoc] = useState<PDFDocument | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('side-by-side');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAllPages, setShowAllPages] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('pdf-diff-theme') as Theme;
    return savedTheme || 'system';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pdf-diff-theme', theme);
  }, [theme]);

  const handleOriginalFile = useCallback(async (file: File) => {
    setOriginalFile(file);
    setError(null);
    try {
      setIsProcessing(true);
      const doc = await extractTextFromPDF(file);
      setOriginalDoc(doc);
    } catch {
      setError('Failed to process the original PDF. Please try another file.');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleModifiedFile = useCallback(async (file: File) => {
    setModifiedFile(file);
    setError(null);
    try {
      setIsProcessing(true);
      const doc = await extractTextFromPDF(file);
      setModifiedDoc(doc);
    } catch {
      setError('Failed to process the modified PDF. Please try another file.');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setOriginalFile(null);
    setModifiedFile(null);
    setOriginalDoc(null);
    setModifiedDoc(null);
    setError(null);
    setCurrentPage(1);
  }, []);

  const { diffParts, stats, totalPages, allPagesDiffs } = useMemo(() => {
    if (!originalDoc || !modifiedDoc) {
      return { diffParts: null, stats: null, totalPages: 0, allPagesDiffs: null };
    }

    const maxPages = Math.max(originalDoc.totalPages, modifiedDoc.totalPages);
    
    if (showAllPages) {
      // Compute diffs for all pages
      const allDiffs: PageDiffResult[] = [];
      const allStats: DiffStats[] = [];
      
      for (let i = 0; i < maxPages; i++) {
        const originalText = originalDoc.pages[i]?.text || '';
        const modifiedText = modifiedDoc.pages[i]?.text || '';
        const parts = computeTextDiff(originalText, modifiedText);
        const pageStats = computeStats(parts);
        
        allDiffs.push({
          pageNumber: i + 1,
          parts,
          originalText,
          modifiedText,
          stats: pageStats
        });
        allStats.push(pageStats);
      }
      
      // Combine stats from all pages
      const combined = allStats.reduce((acc, s) => ({
        additions: acc.additions + s.additions,
        deletions: acc.deletions + s.deletions,
        unchanged: acc.unchanged + s.unchanged,
        totalChanges: acc.totalChanges + s.totalChanges,
        changePercentage: 0
      }), {
        additions: 0,
        deletions: 0,
        unchanged: 0,
        totalChanges: 0,
        changePercentage: 0
      });
      
      const totalWords = combined.additions + combined.deletions + combined.unchanged;
      combined.changePercentage = totalWords > 0 ? (combined.totalChanges / totalWords) * 100 : 0;
      
      return {
        diffParts: null,
        stats: combined,
        totalPages: maxPages,
        allPagesDiffs: allDiffs
      };
    } else {
      // Single page mode
      const pageIndex = currentPage - 1;
      const originalText = originalDoc.pages[pageIndex]?.text || '';
      const modifiedText = modifiedDoc.pages[pageIndex]?.text || '';
      const parts = computeTextDiff(originalText, modifiedText);
      const diffStats = computeStats(parts);

      return {
        diffParts: parts,
        stats: diffStats,
        totalPages: maxPages,
        allPagesDiffs: null as PageDiffResult[] | null
      };
    }
  }, [originalDoc, modifiedDoc, currentPage, showAllPages]);

  const handleExport = useCallback(() => {
    if (!originalDoc || !modifiedDoc) return;
    
    exportDiffToPDF(originalDoc, modifiedDoc);
  }, [originalDoc, modifiedDoc]);

  const showComparison = originalDoc && modifiedDoc && (diffParts || allPagesDiffs);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-top">
          <div className="logo-section">
            <div>
              <img src={pdfIcon} alt="PDF Diff" className="logo-icon" />
              <h1>PDF Diff</h1>
            </div>
            <p className="tagline">Compare PDFs privately and securely in your browser</p>
          </div>
          <ThemeToggle theme={theme} onThemeChange={setTheme} />
        </div>
      </header>

      <main className="app-main">
        <PrivacyBanner />

        {error && (
          <div className="error-banner">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error}</span>
          </div>
        )}

        <section className="upload-section">
          <div className="upload-grid">
            <PDFDropZone
              label="Original PDF"
              file={originalFile}
              onFileSelect={handleOriginalFile}
              disabled={isProcessing}
            />
            <PDFDropZone
              label="Modified PDF"
              file={modifiedFile}
              onFileSelect={handleModifiedFile}
              disabled={isProcessing}
            />
          </div>
          
          {(originalFile || modifiedFile) && (
            <button className="reset-btn" onClick={handleReset} disabled={isProcessing}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10"></polyline>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
              </svg>
              Start Over
            </button>
          )}
        </section>

        {isProcessing && (
          <div className="processing-indicator">
            <div className="spinner"></div>
            <span>Processing PDFs...</span>
          </div>
        )}

        {showComparison && (
          <section className="comparison-section">
            <div className="comparison-header">
              <h2>Comparison Results</h2>
              <div className="comparison-actions">
                <ViewModeTabs activeMode={viewMode} onModeChange={setViewMode} />
                <ExportButton onClick={handleExport} disabled={!originalDoc || !modifiedDoc} />
              </div>
            </div>

            {stats && <DiffStatsComponent {...stats} />}

            {totalPages > 1 && (
              <div className="page-controls">
                <PageSelector
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  disabled={showAllPages}
                />
                <label className="show-all-checkbox">
                  <input
                    type="checkbox"
                    checked={showAllPages}
                    onChange={(e) => setShowAllPages(e.target.checked)}
                  />
                  <span>Show all pages</span>
                </label>
              </div>
            )}

            {showAllPages ? (
              allPagesDiffs ? (
                <div className="all-pages-view">
                  {allPagesDiffs.map(({ pageNumber, parts, originalText, modifiedText, stats: pageStats }) => (
                    <div key={pageNumber} className="page-section">
                      <div className="page-section-header">
                        <h3>Page {pageNumber}</h3>
                        <div className="page-stats">
                          <span className="stat-badge additions">+{pageStats.additions}</span>
                          <span className="stat-badge deletions">-{pageStats.deletions}</span>
                        </div>
                      </div>
                      <DiffView
                        parts={parts}
                        mode={viewMode}
                        originalText={originalText}
                        modifiedText={modifiedText}
                      />
                    </div>
                    ))}
                  </div>
                ) : null
            ) : (
              diffParts && (
                <DiffView
                  parts={diffParts}
                  mode={viewMode}
                  originalText={originalDoc?.pages[currentPage - 1]?.text || ''}
                  modifiedText={modifiedDoc?.pages[currentPage - 1]?.text || ''}
                />
              )
            )}
          </section>
        )}

        <PrivacyFeatures />
      </main>

      <footer className="app-footer">
        <p>
          Made with ❤️ for privacy-conscious users.
          <a href="https://github.com/jamesmontemagno/pdf-diff" target="_blank" rel="noopener noreferrer">
            View on GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
