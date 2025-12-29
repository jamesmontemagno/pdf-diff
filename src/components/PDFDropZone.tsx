import { useCallback } from 'react';
import './PDFDropZone.css';

interface PDFDropZoneProps {
  label: string;
  file: File | null;
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

export function PDFDropZone({ label, file, onFileSelect, disabled = false }: PDFDropZoneProps) {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (disabled) return;
      
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile && droppedFile.type === 'application/pdf') {
        onFileSelect(droppedFile);
      }
    },
    [onFileSelect, disabled]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile && selectedFile.type === 'application/pdf') {
        onFileSelect(selectedFile);
      }
    },
    [onFileSelect]
  );

  return (
    <div
      className={`pdf-dropzone ${file ? 'has-file' : ''} ${disabled ? 'disabled' : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <input
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileInput}
        id={`file-input-${label.replace(/\s+/g, '-').toLowerCase()}`}
        disabled={disabled}
      />
      <label htmlFor={`file-input-${label.replace(/\s+/g, '-').toLowerCase()}`}>
        <div className="dropzone-content">
          <div className="dropzone-icon">
            {file ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <polyline points="9 15 12 18 15 15"></polyline>
                <line x1="12" y1="12" x2="12" y2="18"></line>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            )}
          </div>
          <div className="dropzone-text">
            <span className="dropzone-label">{label}</span>
            {file ? (
              <span className="dropzone-filename">{file.name}</span>
            ) : (
              <span className="dropzone-hint">Drop PDF here or click to browse</span>
            )}
          </div>
        </div>
      </label>
    </div>
  );
}
