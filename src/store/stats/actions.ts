import { getMyBestScores, saveBestScore } from '@/app/(game)/actions';
import type { LevelId } from '@/types';
import { useStatsStore } from './store';
import {
  createEmptyBestTimes,
  getStoredGuestBestTimes,
  normalizeElapsedMs,
  persistGuestBestTimes,
} from './utils';

const SCORE_SYNC_ERROR_MESSAGE =
  'We could not sync this score to your account. Check your connection and try again.';

const setWinSummary = (
  levelId: LevelId,
  elapsedMs: number,
  previousBestMs: number | null,
  bestTimeMs: number,
  isNewBest = previousBestMs == null || elapsedMs < previousBestMs,
) => {
  useStatsStore.setState({
    hasPresentedWinDialog: false,
    isWinDialogOpen: false,
    lastWinSummary: {
      levelId,
      elapsedMs,
      previousBestMs,
      bestTimeMs,
      isNewBest,
    },
  });
};

const resetScoreSyncState = () => {
  useStatsStore.setState({
    scoreSyncState: {
      message: null,
      status: 'idle',
    },
  });
};

const setScoreSyncFailed = () => {
  useStatsStore.setState({
    scoreSyncState: {
      message: SCORE_SYNC_ERROR_MESSAGE,
      status: 'failed',
    },
  });
};

const setScoreSyncing = () => {
  useStatsStore.setState({
    scoreSyncState: {
      message: null,
      status: 'syncing',
    },
  });
};

export const setActiveBestTimes = (
  bestTimesByLevel: ReturnType<typeof createEmptyBestTimes>,
  scoreSource: 'guest' | 'account',
) => {
  useStatsStore.setState({
    bestTimesByLevel,
    scoreSource,
  });
};

export const setGuestBestTimes = (
  guestBestTimesByLevel: ReturnType<typeof createEmptyBestTimes>,
) => {
  useStatsStore.setState({
    guestBestTimesByLevel,
  });
  persistGuestBestTimes(guestBestTimesByLevel);
};

export const restoreGuestStatsState = () => {
  const { guestBestTimesByLevel } = useStatsStore.getState();

  useStatsStore.setState({
    bestTimesByLevel: guestBestTimesByLevel,
    scoreSource: 'guest',
    hasPresentedWinDialog: false,
    isWinDialogOpen: false,
    lastWinSummary: null,
  });
  resetScoreSyncState();
};

export const recordGuestBestTime = (levelId: LevelId, elapsedMs: number) => {
  const normalizedElapsedMs = normalizeElapsedMs(elapsedMs);

  const { guestBestTimesByLevel } = useStatsStore.getState();
  const previousBestMs = guestBestTimesByLevel[levelId];

  const isNewBest =
    previousBestMs == null || normalizedElapsedMs < previousBestMs;
  const bestTimeMs = isNewBest ? normalizedElapsedMs : previousBestMs;
  const nextGuestBestTimes = {
    ...guestBestTimesByLevel,
    [levelId]: bestTimeMs,
  };

  useStatsStore.setState({
    bestTimesByLevel: nextGuestBestTimes,
    guestBestTimesByLevel: nextGuestBestTimes,
    scoreSource: 'guest',
  });
  persistGuestBestTimes(nextGuestBestTimes);
  resetScoreSyncState();
  setWinSummary(levelId, normalizedElapsedMs, previousBestMs, bestTimeMs);
};

export const recordAccountBestTime = async (
  levelId: LevelId,
  elapsedMs: number,
) => {
  const normalizedElapsedMs = normalizeElapsedMs(elapsedMs);
  const { bestTimesByLevel } = useStatsStore.getState();
  const previousBestMs = bestTimesByLevel[levelId];

  if (previousBestMs != null && normalizedElapsedMs >= previousBestMs) {
    resetScoreSyncState();
    setWinSummary(levelId, normalizedElapsedMs, previousBestMs, previousBestMs);
    return;
  }

  try {
    setScoreSyncing();

    const result = await saveBestScore({
      levelId,
      bestTimeMs: normalizedElapsedMs,
    });

    if (result.status === 'guest') {
      recordGuestBestTime(levelId, normalizedElapsedMs);
      return;
    }

    const nextBestTimes = {
      ...bestTimesByLevel,
      [levelId]: result.score.bestTimeMs,
    };

    useStatsStore.setState({
      bestTimesByLevel: nextBestTimes,
      scoreSource: 'account',
    });
    resetScoreSyncState();
    setWinSummary(
      levelId,
      normalizedElapsedMs,
      previousBestMs,
      result.score.bestTimeMs,
      result.didSave,
    );
  } catch (error) {
    console.error('Failed to record account best time:', error);
    setWinSummary(
      levelId,
      normalizedElapsedMs,
      previousBestMs,
      previousBestMs ?? normalizedElapsedMs,
    );
    setScoreSyncFailed();
  }
};

export const syncStatsWithUser = async (isSignedIn: boolean) => {
  useStatsStore.setState({ isSignedIn });

  if (!isSignedIn) {
    restoreGuestStatsState();

    return;
  }

  try {
    const scores = await getMyBestScores();

    if (!scores) {
      restoreGuestStatsState();

      return;
    }

    const syncedBestTimes = createEmptyBestTimes();

    scores.forEach((score) => {
      syncedBestTimes[score.levelId] = score.bestTimeMs;
    });

    useStatsStore.setState({
      bestTimesByLevel: syncedBestTimes,
      scoreSource: 'account',
    });
    resetScoreSyncState();
  } catch (error) {
    console.error('Failed to sync authenticated stats:', error);
    restoreGuestStatsState();
  }
};

export const hydrateGuestBestTimes = () => {
  const { bestTimesByLevel, guestBestTimesByLevel, scoreSource } =
    useStatsStore.getState();

  const storedGuestBestTimes = getStoredGuestBestTimes();

  useStatsStore.setState({
    bestTimesByLevel:
      scoreSource === 'guest' ? storedGuestBestTimes : bestTimesByLevel,
    guestBestTimesByLevel: storedGuestBestTimes,
  });
};

export const handleCompletedGameWin = async (
  levelId: LevelId,
  elapsedMs: number,
) => {
  const { isSignedIn } = useStatsStore.getState();

  if (isSignedIn) {
    await recordAccountBestTime(levelId, elapsedMs);
    return;
  }

  recordGuestBestTime(levelId, elapsedMs);
};

export const retryAccountBestTimeSync = async () => {
  const { isSignedIn, lastWinSummary } = useStatsStore.getState();

  if (!isSignedIn || !lastWinSummary) {
    return;
  }

  await recordAccountBestTime(lastWinSummary.levelId, lastWinSummary.elapsedMs);
};

export const setIsWinDialogOpen = (isWinDialogOpen: boolean) => {
  useStatsStore.setState({ isWinDialogOpen });
};

export const setHasPresentedWinDialog = (hasPresentedWinDialog: boolean) => {
  useStatsStore.setState({ hasPresentedWinDialog });
};

/**
 * Daily wins are recorded into the daily attempts store and don't touch the
 * free-play best score table. We still want to surface the win dialog, so
 * this sets a transient summary derived purely from the current run.
 */
export const recordDailyWinSummary = (
  levelId: LevelId,
  elapsedMs: number,
) => {
  const normalizedElapsedMs = normalizeElapsedMs(elapsedMs);
  resetScoreSyncState();
  setWinSummary(levelId, normalizedElapsedMs, null, normalizedElapsedMs, false);
};
