import { diffWords, diffLines } from 'diff';

export interface DiffPart {
  value: string;
  added?: boolean;
  removed?: boolean;
}

export interface PageDiff {
  pageNumber: number;
  parts: DiffPart[];
  hasChanges: boolean;
}

export function computeTextDiff(oldText: string, newText: string): DiffPart[] {
  return diffWords(oldText, newText);
}

export function computeLineDiff(oldText: string, newText: string): DiffPart[] {
  return diffLines(oldText, newText);
}

export function hasChanges(parts: DiffPart[]): boolean {
  return parts.some(part => part.added || part.removed);
}

export interface DiffStats {
  additions: number;
  deletions: number;
  unchanged: number;
  totalChanges: number;
  changePercentage: number;
}

export function computeStats(parts: DiffPart[]): DiffStats {
  let additions = 0;
  let deletions = 0;
  let unchanged = 0;

  parts.forEach(part => {
    const wordCount = part.value.trim().split(/\s+/).filter(w => w.length > 0).length;
    if (part.added) {
      additions += wordCount;
    } else if (part.removed) {
      deletions += wordCount;
    } else {
      unchanged += wordCount;
    }
  });

  const totalChanges = additions + deletions;
  const totalWords = additions + deletions + unchanged;
  const changePercentage = totalWords > 0 ? (totalChanges / totalWords) * 100 : 0;

  return { 
    additions, 
    deletions, 
    unchanged, 
    totalChanges,
    changePercentage 
  };
}

export function combineStats(statsArray: DiffStats[]): DiffStats {
  const combined = statsArray.reduce((acc, stats) => ({
    additions: acc.additions + stats.additions,
    deletions: acc.deletions + stats.deletions,
    unchanged: acc.unchanged + stats.unchanged,
    totalChanges: acc.totalChanges + stats.totalChanges,
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
  
  return combined;
}
