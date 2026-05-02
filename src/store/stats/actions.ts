import { getMyBestScores, saveBestScore } from '@/app/(game)/actions';
import type { LevelId } from '@/types';
import { useStatsStore } from './store';
import {
  createEmptyBestTimes,
  getStoredGuestBestTimes,
  normalizeElapsedMs,
  persistGuestBestTimes,
} from './utils';

const setWinSummary = (
  levelId: LevelId,
  elapsedMs: number,
  previousBestMs: number | null,
  bestTimeMs: number,
) => {
  useStatsStore.setState({
    hasPresentedWinDialog: false,
    isWinDialogOpen: false,
    lastWinSummary: {
      levelId,
      elapsedMs,
      previousBestMs,
      bestTimeMs,
      isNewBest: previousBestMs == null || elapsedMs < previousBestMs,
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
    setWinSummary(levelId, normalizedElapsedMs, previousBestMs, previousBestMs);
    return;
  }

  try {
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
    setWinSummary(
      levelId,
      normalizedElapsedMs,
      previousBestMs,
      result.score.bestTimeMs,
    );
  } catch (error) {
    console.error('Failed to record account best time:', error);
    setWinSummary(
      levelId,
      normalizedElapsedMs,
      previousBestMs,
      previousBestMs ?? normalizedElapsedMs,
    );
  }
};

export const syncStatsWithUser = async (isSignedIn: boolean) => {
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
  const { scoreSource } = useStatsStore.getState();

  if (scoreSource === 'account') {
    await recordAccountBestTime(levelId, elapsedMs);
    return;
  }

  recordGuestBestTime(levelId, elapsedMs);
};

export const setIsWinDialogOpen = (isWinDialogOpen: boolean) => {
  useStatsStore.setState({ isWinDialogOpen });
};

export const setHasPresentedWinDialog = (hasPresentedWinDialog: boolean) => {
  useStatsStore.setState({ hasPresentedWinDialog });
};
