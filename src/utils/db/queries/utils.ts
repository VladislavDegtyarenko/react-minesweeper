import type { LevelId } from '@/types';
import {
  DAILY_ATTEMPT_STATUSES,
  LEVEL_IDS,
  type DailyAttemptStatus,
} from '../constants';

const MIN_BEST_TIME_MS = 1;
const DAILY_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const VALID_LEVEL_IDS = new Set<string>(LEVEL_IDS);
const VALID_ATTEMPT_STATUSES = new Set<string>(DAILY_ATTEMPT_STATUSES);

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

const isAttemptStatus = (value: unknown): value is DailyAttemptStatus => {
  return typeof value === 'string' && VALID_ATTEMPT_STATUSES.has(value);
};

const isValidBestTimeMs = (value: unknown): value is number => {
  return (
    typeof value === 'number' &&
    Number.isSafeInteger(value) &&
    value >= MIN_BEST_TIME_MS
  );
};

const isValidElapsedMs = (value: unknown): value is number => {
  return typeof value === 'number' && Number.isFinite(value);
};

const isValidDailyKey = (value: unknown): value is string => {
  return typeof value === 'string' && DAILY_KEY_REGEX.test(value);
};

const isValidSeedVersion = (value: unknown): value is number => {
  return (
    typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
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

type DailyAttemptInputUnknown = {
  userId: unknown;
  levelId: unknown;
  dailyKey: unknown;
  seedVersion: unknown;
  status: unknown;
  elapsedMs: unknown;
};

type ValidatedDailyAttemptInput = {
  userId: string;
  levelId: LevelId;
  dailyKey: string;
  seedVersion: number;
  status: DailyAttemptStatus;
  elapsedMs: number;
};

export const validateDailyAttemptInput = (
  input: DailyAttemptInputUnknown,
): ValidatedDailyAttemptInput => {
  if (
    typeof input.userId !== 'string' ||
    input.userId.length === 0 ||
    !isLevelId(input.levelId) ||
    !isValidDailyKey(input.dailyKey) ||
    !isValidSeedVersion(input.seedVersion) ||
    !isAttemptStatus(input.status) ||
    !isValidElapsedMs(input.elapsedMs)
  ) {
    throw new Error('Invalid daily attempt input.');
  }

  return {
    userId: input.userId,
    levelId: input.levelId,
    dailyKey: input.dailyKey,
    seedVersion: input.seedVersion,
    status: input.status,
    elapsedMs: input.elapsedMs,
  };
};
