import 'server-only';

import { and, asc, eq } from 'drizzle-orm';
import type { LevelId } from '@/types';
import { db } from '../index';
import { bestScores } from '../schema';
import type { BestScore } from '../types';

export const getUserBestScores = async (
  userId: string,
): Promise<BestScore[]> => {
  return db
    .select()
    .from(bestScores)
    .where(eq(bestScores.userId, userId))
    .orderBy(asc(bestScores.bestTimeMs));
};

export const getUserBestScoreForLevel = async (
  userId: string,
  levelId: LevelId,
): Promise<BestScore | null> => {
  const [row] = await db
    .select()
    .from(bestScores)
    .where(
      and(eq(bestScores.userId, userId), eq(bestScores.levelId, levelId)),
    )
    .limit(1);

  return row ?? null;
};

type SaveUserBestScoreInput = {
  userId: string;
  levelId: LevelId;
  bestTimeMs: number;
};

export const saveUserBestScore = async (
  input: SaveUserBestScoreInput,
): Promise<BestScore> => {
  const now = new Date();

  const [row] = await db
    .insert(bestScores)
    .values({
      userId: input.userId,
      levelId: input.levelId,
      bestTimeMs: input.bestTimeMs,
      achievedAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [bestScores.userId, bestScores.levelId],
      set: {
        bestTimeMs: input.bestTimeMs,
        achievedAt: now,
        updatedAt: now,
      },
    })
    .returning();

  return row;
};

export const deleteUserScores = async (userId: string): Promise<void> => {
  await db.delete(bestScores).where(eq(bestScores.userId, userId));
};
