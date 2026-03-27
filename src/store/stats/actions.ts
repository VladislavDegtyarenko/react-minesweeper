import type { LevelId } from '@/types';
import { useStatsStore } from './store';
import { normalizeElapsedMs } from './utils';

export const recordBestTime = (levelId: LevelId, elapsedMs: number) => {
  const normalizedElapsedMs = normalizeElapsedMs(elapsedMs);

  const { bestTimesByLevel } = useStatsStore.getState();
  const previousBestMs = bestTimesByLevel[levelId];

  const isNewBest =
    previousBestMs == null || normalizedElapsedMs < previousBestMs;
  const bestTimeMs = isNewBest ? normalizedElapsedMs : previousBestMs;

  useStatsStore.setState({
    bestTimesByLevel: {
      ...bestTimesByLevel,
      [levelId]: bestTimeMs,
    },
    lastWinSummary: {
      levelId,
      elapsedMs: normalizedElapsedMs,
      previousBestMs,
      bestTimeMs,
      isNewBest,
    },
  });
};
