import { LOCAL_STORAGE_KEYS } from '@/config';
import type { LevelId } from '@/types';
import { localStorageService } from '@/utils';
import type { BestTimesByLevel } from '../types';

const BEST_TIME_LEVEL_IDS: ReadonlyArray<LevelId> = [
  'easy',
  'medium',
  'expert',
];

const isValidBestTime = (value: unknown): value is number => {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
};

export const createEmptyBestTimes = (): BestTimesByLevel => ({
  easy: null,
  medium: null,
  expert: null,
});

export const getStoredGuestBestTimes = (): BestTimesByLevel => {
  const storedBestTimes = localStorageService.get<unknown>(
    LOCAL_STORAGE_KEYS.bestTimes,
  );
  const bestTimes = createEmptyBestTimes();

  if (!storedBestTimes || typeof storedBestTimes !== 'object') {
    return bestTimes;
  }

  for (const levelId of BEST_TIME_LEVEL_IDS) {
    const storedValue = (storedBestTimes as Record<LevelId, unknown>)[levelId];

    if (isValidBestTime(storedValue)) {
      bestTimes[levelId] = Math.round(storedValue);
    }
  }

  return bestTimes;
};

export const persistGuestBestTimes = (bestTimesByLevel: BestTimesByLevel) => {
  localStorageService.set(LOCAL_STORAGE_KEYS.bestTimes, bestTimesByLevel);
};
