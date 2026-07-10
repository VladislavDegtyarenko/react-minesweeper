import { getMyDailyState, saveDailyAttempt } from '@/app/(lobby)/actions';
import type { LevelId } from '@/types';
import {
  clampDailyElapsedMs,
  DAILY_SEED_VERSION,
  getDailyKey,
  type DailyAttemptStatus,
} from '@/game/daily';
import { useDailyStore } from './store';
import type {
  DailyHistoryByKey,
  DailyHistoryEntry,
  DailyRunKind,
  DailySource,
} from './types';
import {
  buildEntryKey,
  createEmptyDailyHistory,
  loadGuestDailyHistory,
  persistGuestDailyHistory,
  summarizeStreak,
  upsertEntry,
} from './utils';

const SYNC_ERROR_MESSAGE =
  'We could not sync your daily progress to your account. Check your connection and try again.';

export const refreshTodayKey = () => {
  const todayKey = getDailyKey();
  const { history, todayKey: previousTodayKey } = useDailyStore.getState();

  if (todayKey === previousTodayKey) {
    return;
  }

  useDailyStore.setState({
    todayKey,
    streak: summarizeStreak(history, todayKey),
  });
};

export const setDailySignedIn = async (isSignedIn: boolean) => {
  if (!isSignedIn) {
    const guestHistory = loadGuestDailyHistory();
    const todayKey = getDailyKey();
    useDailyStore.setState({
      source: 'guest',
      accountStateStatus: 'guest',
      todayKey,
      guestHistory,
      history: guestHistory,
      streak: summarizeStreak(guestHistory, todayKey),
      pendingSyncAttempt: null,
      isSyncing: false,
      syncError: null,
    });

    return;
  }

  useDailyStore.setState({
    accountStateStatus: 'loading',
    isSyncing: true,
    syncError: null,
  });

  try {
    const remote = await getMyDailyState();

    if (!remote) {
      const guestHistory = loadGuestDailyHistory();
      const todayKey = getDailyKey();
      useDailyStore.setState({
        source: 'guest',
        accountStateStatus: 'guest',
        todayKey,
        guestHistory,
        history: guestHistory,
        streak: summarizeStreak(guestHistory, todayKey),
        pendingSyncAttempt: null,
        isSyncing: false,
        syncError: null,
      });

      return;
    }

    const todayKey = getDailyKey();
    const history: DailyHistoryByKey = createEmptyDailyHistory();

    for (const attempt of remote.attempts) {
      history[buildEntryKey(attempt.dailyKey, attempt.levelId)] = {
        dailyKey: attempt.dailyKey,
        levelId: attempt.levelId,
        seedVersion: attempt.seedVersion,
        status: attempt.status,
        elapsedMs: attempt.elapsedMs,
        recordedAt: attempt.createdAt
          ? new Date(attempt.createdAt).getTime()
          : Date.now(),
      };
    }

    useDailyStore.setState({
      source: 'account',
      accountStateStatus: 'ready',
      todayKey,
      history,
      streak: remote.streak,
      pendingSyncAttempt: null,
      isSyncing: false,
      syncError: null,
    });
  } catch (error) {
    console.error('Failed to load daily state:', error);
    const guestHistory = loadGuestDailyHistory();
    const todayKey = getDailyKey();
    useDailyStore.setState({
      source: 'guest',
      accountStateStatus: 'failed',
      todayKey,
      guestHistory,
      history: guestHistory,
      streak: summarizeStreak(guestHistory, todayKey),
      pendingSyncAttempt: null,
      isSyncing: false,
      syncError: SYNC_ERROR_MESSAGE,
    });
  }
};

export const setActiveDailyRunKind = (activeRunKind: DailyRunKind) => {
  useDailyStore.setState({ activeRunKind });
};

export const clearActiveDailyRunKind = () => {
  useDailyStore.setState({ activeRunKind: null });
};

export const classifyDailyRun = (levelId: LevelId): DailyRunKind => {
  const { history, todayKey } = useDailyStore.getState();
  const activeRunKind = history[buildEntryKey(todayKey, levelId)]
    ? 'practice'
    : 'attempt';

  setActiveDailyRunKind(activeRunKind);

  return activeRunKind;
};

const recordLocalAttempt = (entry: DailyHistoryEntry): DailySource => {
  const { guestHistory, history, source, todayKey } = useDailyStore.getState();
  const nextGuestHistory = upsertEntry(guestHistory, entry);
  const nextHistory =
    source === 'account' ? upsertEntry(history, entry) : nextGuestHistory;
  const nextStreak = summarizeStreak(nextHistory, todayKey);

  persistGuestDailyHistory(nextGuestHistory);
  useDailyStore.setState({
    guestHistory: nextGuestHistory,
    history: nextHistory,
    streak: nextStreak,
  });

  return source;
};

type RecordDailyAttemptParams = {
  levelId: LevelId;
  dailyKey: string;
  seedVersion?: number;
  status: DailyAttemptStatus;
  elapsedMs: number;
};

const syncAccountAttempt = async (entry: DailyHistoryEntry) => {
  useDailyStore.setState({ isSyncing: true, syncError: null });
  const result = await saveDailyAttempt({
    levelId: entry.levelId,
    dailyKey: entry.dailyKey,
    seedVersion: entry.seedVersion,
    status: entry.status,
    elapsedMs: entry.elapsedMs,
  });

  if (result.status === 'guest') {
    useDailyStore.setState({
      accountStateStatus: 'guest',
      isSyncing: false,
      pendingSyncAttempt: null,
      source: 'guest',
    });

    return;
  }

  const { guestHistory, history, todayKey } = useDailyStore.getState();
  const key = buildEntryKey(result.attempt.dailyKey, result.attempt.levelId);

  const accountEntry: DailyHistoryEntry = {
    dailyKey: result.attempt.dailyKey,
    levelId: result.attempt.levelId,
    seedVersion: result.attempt.seedVersion,
    status: result.attempt.status,
    elapsedMs: result.attempt.elapsedMs,
    recordedAt: result.attempt.createdAt
      ? new Date(result.attempt.createdAt).getTime()
      : Date.now(),
  };

  const nextGuestHistory = { ...guestHistory, [key]: accountEntry };
  const nextHistory = { ...history, [key]: accountEntry };

  persistGuestDailyHistory(nextGuestHistory);
  useDailyStore.setState({
    accountStateStatus: 'ready',
    guestHistory: nextGuestHistory,
    history: nextHistory,
    streak: result.streak,
    todayKey,
    pendingSyncAttempt: null,
    isSyncing: false,
    syncError: null,
  });
};

/**
 * Record a daily attempt for the current user. Always writes to the guest
 * history (so logged-in users keep a local copy), and additionally calls
 * the server when signed-in. The server side enforces the first-write-wins
 * dedupe; the client mirrors the same behaviour locally.
 */
export const recordDailyAttempt = async (params: RecordDailyAttemptParams) => {
  const seedVersion = params.seedVersion ?? DAILY_SEED_VERSION;
  const entry: DailyHistoryEntry = {
    dailyKey: params.dailyKey,
    levelId: params.levelId,
    seedVersion,
    status: params.status,
    elapsedMs: clampDailyElapsedMs(params.elapsedMs),
    recordedAt: Date.now(),
  };

  const source = recordLocalAttempt(entry);

  if (source !== 'account') {
    return;
  }

  try {
    await syncAccountAttempt(entry);
  } catch (error) {
    console.error('Failed to sync daily attempt:', error);
    useDailyStore.setState({
      isSyncing: false,
      pendingSyncAttempt: entry,
      syncError: SYNC_ERROR_MESSAGE,
    });
  }
};

export const retryDailyAttemptSync = async () => {
  const { pendingSyncAttempt, source } = useDailyStore.getState();

  if (!pendingSyncAttempt || source !== 'account') {
    return;
  }

  try {
    await syncAccountAttempt(pendingSyncAttempt);
  } catch (error) {
    console.error('Failed to retry daily attempt sync:', error);
    useDailyStore.setState({
      isSyncing: false,
      pendingSyncAttempt,
      syncError: SYNC_ERROR_MESSAGE,
    });
  }
};
