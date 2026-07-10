import { computeStreaks } from '@/game/daily';
import type { DailyHistoryByKey, StreakSummary } from '../types';

export {
  buildEntryKey,
  createEmptyDailyHistory,
  loadGuestDailyHistory,
  persistGuestDailyHistory,
  upsertEntry,
} from './storage';

export const summarizeStreak = (
  history: DailyHistoryByKey,
  todayKey: string,
): StreakSummary => {
  const winDays = Object.values(history)
    .filter((entry) => entry.status === 'won')
    .map((entry) => ({ dailyKey: entry.dailyKey }));

  return computeStreaks(winDays, todayKey);
};
