import type { LevelId } from '@/types';

export type BestTimesByLevel = Record<LevelId, number | null>;

export type LastWinSummary = {
  levelId: LevelId;
  elapsedMs: number;
  previousBestMs: number | null;
  bestTimeMs: number;
  isNewBest: boolean;
};

export type StatsState = {
  bestTimesByLevel: BestTimesByLevel;
  isWinDialogOpen: boolean;
  lastWinSummary: LastWinSummary | null;
};
