import './DiffStats.css';

interface DiffStatsProps {
  additions: number;
  removals: number;
  unchanged: number;
}

export function DiffStats({ additions, removals, unchanged }: DiffStatsProps) {
  const total = additions + removals + unchanged;
  const additionPercent = total > 0 ? (additions / total) * 100 : 0;
  const removalPercent = total > 0 ? (removals / total) * 100 : 0;

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
          <span className="stat-value">{removals}</span>
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
          style={{ width: `${removalPercent}%` }}
          title={`${removals} removals`}
        />
      </div>
    </div>
  );
}
