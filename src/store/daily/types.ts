import type { LevelId } from '@/types';
import type { DailyAttemptStatus } from '@/game/daily';

export type DailyHistoryEntry = {
  dailyKey: string;
  levelId: LevelId;
  seedVersion: number;
  status: DailyAttemptStatus;
  elapsedMs: number;
  recordedAt: number;
};

export type DailyHistoryByKey = Record<string, DailyHistoryEntry>;

export type StreakSummary = {
  currentStreak: number;
  bestStreak: number;
  lastWinKey: string | null;
};

export type DailySource = 'guest' | 'account';

export type DailyAccountStateStatus =
  | 'idle'
  | 'guest'
  | 'loading'
  | 'ready'
  | 'failed';

export type DailyRunKind = 'attempt' | 'practice';

export type DailyState = {
  source: DailySource;
  accountStateStatus: DailyAccountStateStatus;
  todayKey: string;
  guestHistory: DailyHistoryByKey;
  history: DailyHistoryByKey;
  streak: StreakSummary;
  activeRunKind: DailyRunKind | null;
  pendingSyncAttempt: DailyHistoryEntry | null;
  isSyncing: boolean;
  syncError: string | null;
};
