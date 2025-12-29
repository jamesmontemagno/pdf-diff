import type { DiffPart } from '../utils/diffUtils';
import './DiffView.css';

interface DiffViewProps {
  parts: DiffPart[];
  mode: 'side-by-side' | 'unified' | 'additions' | 'removals';
  originalText?: string;
  modifiedText?: string;
}

export function DiffView({ parts, mode, originalText, modifiedText }: DiffViewProps) {
  if (mode === 'side-by-side' && originalText !== undefined && modifiedText !== undefined) {
    return (
      <div className="diff-view side-by-side">
        <div className="diff-panel original">
          <h4 className="panel-header">Original</h4>
          <div className="diff-content">
            {parts.map((part, index) => {
              if (part.added) return null;
              return (
                <span
                  key={index}
                  className={part.removed ? 'diff-removed' : ''}
                >
                  {part.value}
                </span>
              );
            })}
          </div>
        </div>
        <div className="diff-panel modified">
          <h4 className="panel-header">Modified</h4>
          <div className="diff-content">
            {parts.map((part, index) => {
              if (part.removed) return null;
              return (
                <span
                  key={index}
                  className={part.added ? 'diff-added' : ''}
                >
                  {part.value}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'additions') {
    const additionParts = parts.filter(part => part.added);
    if (additionParts.length === 0) {
      return (
        <div className="diff-view empty">
          <p>No additions found</p>
        </div>
      );
    }
    return (
      <div className="diff-view additions-only">
        <h4 className="panel-header additions-header">Additions</h4>
        <div className="diff-content">
          {additionParts.map((part, index) => (
            <div key={index} className="diff-block diff-added">
              {part.value}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (mode === 'removals') {
    const removalParts = parts.filter(part => part.removed);
    if (removalParts.length === 0) {
      return (
        <div className="diff-view empty">
          <p>No removals found</p>
        </div>
      );
    }
    return (
      <div className="diff-view removals-only">
        <h4 className="panel-header removals-header">Removals</h4>
        <div className="diff-content">
          {removalParts.map((part, index) => (
            <div key={index} className="diff-block diff-removed">
              {part.value}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Unified view
  return (
    <div className="diff-view unified">
      <h4 className="panel-header">Changes</h4>
      <div className="diff-content">
        {parts.map((part, index) => (
          <span
            key={index}
            className={
              part.added
                ? 'diff-added'
                : part.removed
                ? 'diff-removed'
                : ''
            }
          >
            {part.value}
          </span>
        ))}
      </div>
    </div>
  );
}
