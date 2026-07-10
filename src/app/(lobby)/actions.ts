'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { ROUTES } from '@/config/routes';
import type { LevelId } from '@/types';
import { getDailyKey } from '@/game/daily';
import type { BestScore, DailyAttempt, DailyAttemptStatus } from '@/server/db';
import {
  getMyDailyAttempts,
  getMyDailyStreakSummary,
  getUserBestScores,
  recordDailyAttempt,
  saveUserBestScore,
} from '@/server/db/queries';

type SaveBestScoreInput = {
  levelId: LevelId;
  bestTimeMs: number;
};

type SaveBestScoreResult =
  | { status: 'guest' }
  | { status: 'saved'; didSave: boolean; score: BestScore };

export const saveBestScore = async (
  input: SaveBestScoreInput,
): Promise<SaveBestScoreResult> => {
  const { userId } = await auth();

  if (!userId) {
    return { status: 'guest' };
  }

  const result = await saveUserBestScore({
    userId,
    levelId: input.levelId,
    bestTimeMs: input.bestTimeMs,
  });

  revalidatePath(ROUTES.LEADERBOARD);
  revalidatePath(ROUTES.ACCOUNT);

  return { status: 'saved', ...result };
};

export const getMyBestScores = async (): Promise<BestScore[] | null> => {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  return getUserBestScores(userId);
};

type RecordDailyAttemptInput = {
  levelId: LevelId;
  dailyKey: string;
  seedVersion: number;
  status: DailyAttemptStatus;
  elapsedMs: number;
};

type DailyStreakSummary = {
  currentStreak: number;
  bestStreak: number;
  lastWinKey: string | null;
};

type SaveDailyAttemptResult =
  | { status: 'guest' }
  | {
      status: 'saved';
      didInsert: boolean;
      attempt: DailyAttempt;
      streak: DailyStreakSummary;
    };

export const saveDailyAttempt = async (
  input: RecordDailyAttemptInput,
): Promise<SaveDailyAttemptResult> => {
  const { userId } = await auth();

  if (!userId) {
    return { status: 'guest' };
  }

  const result = await recordDailyAttempt({
    userId,
    levelId: input.levelId,
    dailyKey: input.dailyKey,
    seedVersion: input.seedVersion,
    status: input.status,
    elapsedMs: input.elapsedMs,
  });

  const streak = await getMyDailyStreakSummary(userId, input.dailyKey);

  revalidatePath(ROUTES.ACCOUNT);

  return {
    status: 'saved',
    didInsert: result.didInsert,
    attempt: result.attempt,
    streak,
  };
};

type GetDailyStateResult = {
  attempts: DailyAttempt[];
  streak: DailyStreakSummary;
} | null;

export const getMyDailyState = async (): Promise<GetDailyStateResult> => {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const todayKey = getDailyKey();
  const [attempts, streak] = await Promise.all([
    getMyDailyAttempts(userId),
    getMyDailyStreakSummary(userId, todayKey),
  ]);

  return { attempts, streak };
};
