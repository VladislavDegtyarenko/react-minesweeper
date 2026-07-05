import { getDailyKey } from './seed';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const parseDailyKeyToUtc = (dailyKey: string): number | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dailyKey);

  if (!match) {
    return null;
  }

  const [, year, month, day] = match;

  return Date.UTC(Number(year), Number(month) - 1, Number(day));
};

const dayDiff = (laterKey: string, earlierKey: string): number | null => {
  const laterMs = parseDailyKeyToUtc(laterKey);
  const earlierMs = parseDailyKeyToUtc(earlierKey);

  if (laterMs == null || earlierMs == null) {
    return null;
  }

  return Math.round((laterMs - earlierMs) / ONE_DAY_MS);
};

export type WinDay = {
  dailyKey: string;
};

type StreakSummary = {
  currentStreak: number;
  bestStreak: number;
  lastWinKey: string | null;
};

/**
 * Streaks are derived from the set of distinct UTC days the user has WON at
 * least one daily attempt on. Loss-only days don't count as wins, but they
 * also don't break a streak retroactively unless they precede the next win.
 *
 * - currentStreak: consecutive winning days ending today (or yesterday — a
 *   streak only "expires" once today is missed AND yesterday wasn't a win).
 * - bestStreak: longest run of consecutive winning days ever recorded.
 */
export const computeStreaks = (
  winDays: WinDay[],
  todayKey: string = getDailyKey(),
): StreakSummary => {
  if (winDays.length === 0) {
    return { currentStreak: 0, bestStreak: 0, lastWinKey: null };
  }

  const distinctKeys = Array.from(
    new Set(winDays.map((win) => win.dailyKey).filter(Boolean)),
  ).sort();

  let bestStreak = 0;
  let runStreak = 0;
  let previousKey: string | null = null;

  for (const key of distinctKeys) {
    if (previousKey == null) {
      runStreak = 1;
    } else {
      const diff = dayDiff(key, previousKey);
      runStreak = diff === 1 ? runStreak + 1 : 1;
    }

    if (runStreak > bestStreak) {
      bestStreak = runStreak;
    }
    previousKey = key;
  }

  const lastWinKey = previousKey;

  if (!lastWinKey) {
    return { currentStreak: 0, bestStreak, lastWinKey: null };
  }

  const diffFromToday = dayDiff(todayKey, lastWinKey);
  const currentStreak =
    diffFromToday === 0 || diffFromToday === 1 ? runStreak : 0;

  return { currentStreak, bestStreak, lastWinKey };
};
