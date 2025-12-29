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

export function filterAdditionsOnly(parts: DiffPart[]): DiffPart[] {
  return parts.filter(part => part.added);
}

export function filterRemovalsOnly(parts: DiffPart[]): DiffPart[] {
  return parts.filter(part => part.removed);
}

export function hasChanges(parts: DiffPart[]): boolean {
  return parts.some(part => part.added || part.removed);
}

export function computeStats(parts: DiffPart[]): { additions: number; removals: number; unchanged: number } {
  let additions = 0;
  let removals = 0;
  let unchanged = 0;

  parts.forEach(part => {
    const wordCount = part.value.trim().split(/\s+/).filter(w => w.length > 0).length;
    if (part.added) {
      additions += wordCount;
    } else if (part.removed) {
      removals += wordCount;
    } else {
      unchanged += wordCount;
    }
  });

  return { additions, removals, unchanged };
}
