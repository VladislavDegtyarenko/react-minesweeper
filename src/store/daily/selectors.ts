import type { LevelId } from '@/types';
import type { DailyState } from './types';
import { buildEntryKey } from './utils';

export const selectDailySource = (state: DailyState) => state.source;
export const selectDailyAccountStateStatus = (state: DailyState) =>
  state.accountStateStatus;
export const selectDailyHistory = (state: DailyState) => state.history;
export const selectGuestDailyHistory = (state: DailyState) =>
  state.guestHistory;
export const selectDailyStreak = (state: DailyState) => state.streak;
export const selectDailyTodayKey = (state: DailyState) => state.todayKey;
export const selectActiveDailyRunKind = (state: DailyState) =>
  state.activeRunKind;
export const selectIsDailyPracticeRun = (state: DailyState) =>
  state.activeRunKind === 'practice';
export const selectIsDailyAttemptRun = (state: DailyState) =>
  state.activeRunKind === 'attempt';
export const selectPendingDailySyncAttempt = (state: DailyState) =>
  state.pendingSyncAttempt;
export const selectIsDailySyncing = (state: DailyState) => state.isSyncing;
export const selectDailySyncError = (state: DailyState) => state.syncError;
export const selectCanRetryDailySync = (state: DailyState) =>
  Boolean(state.pendingSyncAttempt && state.syncError && !state.isSyncing);

export const selectTodayEntryByLevel =
  (levelId: LevelId) => (state: DailyState) => {
    return state.history[buildEntryKey(state.todayKey, levelId)] ?? null;
  };

export const selectIsTodayCompletedByLevel =
  (levelId: LevelId) => (state: DailyState) => {
    const entry = state.history[buildEntryKey(state.todayKey, levelId)];

    return entry?.status === 'won';
  };

export const selectIsTodayAttemptedByLevel =
  (levelId: LevelId) => (state: DailyState) => {
    return Boolean(state.history[buildEntryKey(state.todayKey, levelId)]);
  };

export const selectHasPendingSyncAttemptByLevel =
  (levelId: LevelId) => (state: DailyState) => {
    const attempt = state.pendingSyncAttempt;

    return (
      attempt?.dailyKey === state.todayKey &&
      attempt.levelId === levelId
    );
  };
