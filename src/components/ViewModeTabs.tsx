import type { ReactNode } from 'react';
import './ViewModeTabs.css';

export type ViewMode = 'side-by-side' | 'unified' | 'additions' | 'removals' | 'changes-only';

interface ViewModeTabsProps {
  activeMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

export function ViewModeTabs({ activeMode, onModeChange }: ViewModeTabsProps) {
  const tabs: { mode: ViewMode; label: string; icon: ReactNode }[] = [
    {
      mode: 'side-by-side',
      label: 'Side by Side',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="12" y1="3" x2="12" y2="21"></line>
        </svg>
      ),
    },
    {
      mode: 'unified',
      label: 'Unified',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      ),
    },
    {
      mode: 'additions',
      label: 'Additions',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="16"></line>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
      ),
    },
    {
      mode: 'removals',
      label: 'Removals',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
      ),
    },
    {
      mode: 'changes-only',
      label: 'Changes Only',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 3h5v5"></path>
          <path d="M8 3H3v5"></path>
          <path d="M12 22v-7"></path>
          <path d="m16 16 5 5"></path>
          <path d="m16 21 5-5"></path>
          <path d="m8 16-5 5"></path>
          <path d="m8 21-5-5"></path>
        </svg>
      ),
    },
  ];

  return (
    <div className="view-mode-tabs">
      {tabs.map(({ mode, label, icon }) => (
        <button
          key={mode}
          className={`view-mode-tab ${activeMode === mode ? 'active' : ''}`}
          onClick={() => onModeChange(mode)}
        >
          {icon}
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
