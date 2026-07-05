import 'server-only';

import { and, asc, eq, gt } from 'drizzle-orm';
import type { LevelId } from '@/types';
import { db } from '../index';
import { bestScores } from '../schema';
import type { BestScore } from '../types';
import { validateUserBestScoreInput } from './utils';

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
    .where(and(eq(bestScores.userId, userId), eq(bestScores.levelId, levelId)))
    .limit(1);

  return row ?? null;
};

type SaveUserBestScoreInput = {
  userId: string;
  levelId: LevelId;
  bestTimeMs: number;
};

type SaveUserBestScoreResult = {
  didSave: boolean;
  score: BestScore;
};

export const saveUserBestScore = async (
  input: SaveUserBestScoreInput,
): Promise<SaveUserBestScoreResult> => {
  const validatedInput = validateUserBestScoreInput(input);
  const now = new Date();

  const [row] = await db
    .insert(bestScores)
    .values({
      userId: validatedInput.userId,
      levelId: validatedInput.levelId,
      bestTimeMs: validatedInput.bestTimeMs,
      achievedAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [bestScores.userId, bestScores.levelId],
      set: {
        bestTimeMs: validatedInput.bestTimeMs,
        achievedAt: now,
        updatedAt: now,
      },
      setWhere: gt(bestScores.bestTimeMs, validatedInput.bestTimeMs),
    })
    .returning();

  if (row) {
    return {
      didSave: true,
      score: row,
    };
  }

  const existingScore = await getUserBestScoreForLevel(
    validatedInput.userId,
    validatedInput.levelId,
  );

  if (!existingScore) {
    throw new Error('Failed to save best score.');
  }

  return {
    didSave: false,
    score: existingScore,
  };
};

export const deleteUserScores = async (userId: string): Promise<void> => {
  await db.delete(bestScores).where(eq(bestScores.userId, userId));
};
