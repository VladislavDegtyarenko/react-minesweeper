import {
  resetAccountStore,
  setAccountScoresCache,
  setAccountScoresLoading,
  upsertAccountScore,
} from '@/store/account';
import { useAuthStore } from '@/store/auth';
import { resetLeaderboardStore } from '@/store/leaderboard';
import type { LevelId } from '@/types';
import { fetchUserBestScores, upsertBestScore } from '@/utils/supabase';
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
  userId: string,
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
    const nextScore = await upsertBestScore(
      userId,
      levelId,
      normalizedElapsedMs,
    );
    const nextBestTimes = {
      ...bestTimesByLevel,
      [levelId]: nextScore.best_time_ms,
    };

    useStatsStore.setState({
      bestTimesByLevel: nextBestTimes,
      scoreSource: 'account',
    });
    upsertAccountScore(userId, nextScore);
    resetLeaderboardStore();
    setWinSummary(
      levelId,
      normalizedElapsedMs,
      previousBestMs,
      nextScore.best_time_ms,
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

export const syncStatsWithSession = async (userId: string | null) => {
  if (!userId) {
    const { guestBestTimesByLevel } = useStatsStore.getState();

    useStatsStore.setState({
      bestTimesByLevel: guestBestTimesByLevel,
      scoreSource: 'guest',
    });
    resetAccountStore();
    resetLeaderboardStore();

    return;
  }

  try {
    setAccountScoresLoading(userId);

    const scores = await fetchUserBestScores(userId);
    const syncedBestTimes = createEmptyBestTimes();

    scores.forEach((score) => {
      syncedBestTimes[score.level_id] = score.best_time_ms;
    });

    useStatsStore.setState({
      bestTimesByLevel: syncedBestTimes,
      scoreSource: 'account',
    });
    setAccountScoresCache(userId, scores);
  } catch (error) {
    console.error('Failed to sync authenticated stats:', error);
    const { guestBestTimesByLevel } = useStatsStore.getState();

    useStatsStore.setState({
      bestTimesByLevel: guestBestTimesByLevel,
      scoreSource: 'guest',
    });
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
  const { user } = useAuthStore.getState();

  if (!user) {
    recordGuestBestTime(levelId, elapsedMs);
    return;
  }

  await recordAccountBestTime(user.id, levelId, elapsedMs);
};

export const setIsWinDialogOpen = (isWinDialogOpen: boolean) => {
  useStatsStore.setState({ isWinDialogOpen });
};

export const setHasPresentedWinDialog = (hasPresentedWinDialog: boolean) => {
  useStatsStore.setState({ hasPresentedWinDialog });
};
