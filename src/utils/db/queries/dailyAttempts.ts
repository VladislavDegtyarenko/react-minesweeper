import 'server-only';

import { and, asc, desc, eq, gte } from 'drizzle-orm';
import type { LevelId } from '@/types';
import { clampDailyElapsedMs, computeStreaks } from '@/utils/daily';
import type { DailyAttemptStatus } from '../constants';
import { db } from '../index';
import { dailyAttempts } from '../schema';
import type { DailyAttempt, DailyStreakSummary } from '../types';
import { validateDailyAttemptInput } from './utils';

const STREAK_HISTORY_DAYS = 365;

const subtractDaysUtc = (dailyKey: string, days: number): string => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dailyKey);

  if (!match) {
    return dailyKey;
  }

  const [, year, month, day] = match;
  const utcMs = Date.UTC(Number(year), Number(month) - 1, Number(day));
  const target = new Date(utcMs - days * 24 * 60 * 60 * 1000);
  const yyyy = target.getUTCFullYear();
  const mm = String(target.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(target.getUTCDate()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd}`;
};

type RecordDailyAttemptInput = {
  userId: string;
  levelId: LevelId;
  dailyKey: string;
  seedVersion: number;
  status: DailyAttemptStatus;
  elapsedMs: number;
};

type RecordDailyAttemptResult = {
  didInsert: boolean;
  attempt: DailyAttempt;
};

/**
 * Insert-only with first-write-wins. The unique index on
 * (user_id, level_id, daily_key) guarantees one row per user/level/day —
 * subsequent submissions for the same key return the existing row instead
 * of overwriting it. Elapsed time is clamped before storage.
 */
export const recordDailyAttempt = async (
  input: RecordDailyAttemptInput,
): Promise<RecordDailyAttemptResult> => {
  const validated = validateDailyAttemptInput(input);
  const elapsedMs = clampDailyElapsedMs(validated.elapsedMs);

  const [inserted] = await db
    .insert(dailyAttempts)
    .values({
      userId: validated.userId,
      levelId: validated.levelId,
      dailyKey: validated.dailyKey,
      seedVersion: validated.seedVersion,
      status: validated.status,
      elapsedMs,
    })
    .onConflictDoNothing({
      target: [
        dailyAttempts.userId,
        dailyAttempts.levelId,
        dailyAttempts.dailyKey,
      ],
    })
    .returning();

  if (inserted) {
    return { didInsert: true, attempt: inserted };
  }

  const [existing] = await db
    .select()
    .from(dailyAttempts)
    .where(
      and(
        eq(dailyAttempts.userId, validated.userId),
        eq(dailyAttempts.levelId, validated.levelId),
        eq(dailyAttempts.dailyKey, validated.dailyKey),
      ),
    )
    .limit(1);

  if (!existing) {
    throw new Error('Failed to record daily attempt.');
  }

  return { didInsert: false, attempt: existing };
};

export const deleteUserDailyAttempts = async (
  userId: string,
): Promise<void> => {
  await db.delete(dailyAttempts).where(eq(dailyAttempts.userId, userId));
};

export const getMyDailyAttempts = async (
  userId: string,
  options: { dailyKey?: string; sinceDailyKey?: string } = {},
): Promise<DailyAttempt[]> => {
  const conditions = [eq(dailyAttempts.userId, userId)];

  if (options.dailyKey) {
    conditions.push(eq(dailyAttempts.dailyKey, options.dailyKey));
  }

  if (options.sinceDailyKey) {
    conditions.push(gte(dailyAttempts.dailyKey, options.sinceDailyKey));
  }

  return db
    .select()
    .from(dailyAttempts)
    .where(and(...conditions))
    .orderBy(asc(dailyAttempts.dailyKey), desc(dailyAttempts.createdAt));
};

export const getUserDailyAttempts = async (
  userId: string,
): Promise<DailyAttempt[]> => {
  return db
    .select()
    .from(dailyAttempts)
    .where(eq(dailyAttempts.userId, userId))
    .orderBy(desc(dailyAttempts.dailyKey), desc(dailyAttempts.createdAt));
};

/**
 * Streaks are derived from stored attempts — never trusted from the client.
 * A "winning day" is any UTC day on which the user has at least one `won`
 * attempt across any difficulty.
 */
export const getMyDailyStreakSummary = async (
  userId: string,
  todayKey: string,
): Promise<DailyStreakSummary> => {
  const sinceDailyKey = subtractDaysUtc(todayKey, STREAK_HISTORY_DAYS);
  const winningAttempts = await db
    .select({ dailyKey: dailyAttempts.dailyKey })
    .from(dailyAttempts)
    .where(
      and(
        eq(dailyAttempts.userId, userId),
        eq(dailyAttempts.status, 'won'),
        gte(dailyAttempts.dailyKey, sinceDailyKey),
      ),
    );

  return computeStreaks(winningAttempts, todayKey);
};
