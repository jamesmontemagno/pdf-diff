import './DiffStats.css';

interface DiffStatsProps {
  additions: number;
  deletions: number;
  unchanged: number;
  totalChanges: number;
  changePercentage: number;
}

export function DiffStats({ additions, deletions, unchanged }: DiffStatsProps) {
  const total = additions + deletions + unchanged;
  const additionPercent = total > 0 ? (additions / total) * 100 : 0;
  const deletionPercent = total > 0 ? (deletions / total) * 100 : 0;

  return (
    <div className="diff-stats">
      <div className="stat-item additions">
        <div className="stat-icon">+</div>
        <div className="stat-info">
          <span className="stat-value">{additions}</span>
          <span className="stat-label">words added</span>
        </div>
      </div>
      <div className="stat-item removals">
        <div className="stat-icon">−</div>
        <div className="stat-info">
          <span className="stat-value">{deletions}</span>
          <span className="stat-label">words removed</span>
        </div>
      </div>
      <div className="stat-item unchanged">
        <div className="stat-icon">=</div>
        <div className="stat-info">
          <span className="stat-value">{unchanged}</span>
          <span className="stat-label">words unchanged</span>
        </div>
      </div>
      <div className="stat-bar">
        <div 
          className="stat-bar-segment additions" 
          style={{ width: `${additionPercent}%` }}
          title={`${additions} additions`}
        />
        <div 
          className="stat-bar-segment removals" 
          style={{ width: `${deletionPercent}%` }}
          title={`${deletions} deletions`}
        />
      </div>
    </div>
  );
}
