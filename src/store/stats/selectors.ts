import type { LevelId } from '@/types';
import type { StatsState } from './types';

export const selectBestTimesByLevel = (state: StatsState) =>
  state.bestTimesByLevel;

export const selectBestTimeByLevel =
  (levelId: LevelId) => (state: StatsState) => state.bestTimesByLevel[levelId];

export const selectIsWinDialogOpen = (state: StatsState) =>
  state.isWinDialogOpen;

export const selectLastWinSummary = (state: StatsState) => state.lastWinSummary;
