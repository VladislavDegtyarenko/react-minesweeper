'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import ROUTES from '@/config/routes.json';
import type { LevelId } from '@/types';
import type { BestScore } from '@/utils/db';
import { getUserBestScores, saveUserBestScore } from '@/utils/db/queries';

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
