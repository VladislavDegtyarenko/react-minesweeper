import type { LevelId } from '@/types';
import { LEVEL_IDS } from '../constants';

const MIN_BEST_TIME_MS = 1;
const VALID_LEVEL_IDS = new Set<string>(LEVEL_IDS);

type UserBestScoreInput = {
  bestTimeMs: unknown;
  levelId: unknown;
  userId: unknown;
};

type ValidatedUserBestScoreInput = {
  bestTimeMs: number;
  levelId: LevelId;
  userId: string;
};

const isLevelId = (value: unknown): value is LevelId => {
  return typeof value === 'string' && VALID_LEVEL_IDS.has(value);
};

const isValidBestTimeMs = (value: unknown): value is number => {
  return (
    typeof value === 'number' &&
    Number.isSafeInteger(value) &&
    value >= MIN_BEST_TIME_MS
  );
};

export const validateUserBestScoreInput = (
  input: UserBestScoreInput,
): ValidatedUserBestScoreInput => {
  if (
    typeof input.userId !== 'string' ||
    input.userId.length === 0 ||
    !isLevelId(input.levelId) ||
    !isValidBestTimeMs(input.bestTimeMs)
  ) {
    throw new Error('Invalid best score input.');
  }

  return {
    bestTimeMs: input.bestTimeMs,
    levelId: input.levelId,
    userId: input.userId,
  };
};
