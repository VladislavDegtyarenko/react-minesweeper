import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { DAILY_ATTEMPT_STATUSES } from '@/game/daily';
import { LEVEL_IDS } from './constants';

export const levelEnum = pgEnum('level', LEVEL_IDS);
export const dailyAttemptStatusEnum = pgEnum(
  'daily_attempt_status',
  DAILY_ATTEMPT_STATUSES,
);

export const bestScores = pgTable(
  'best_scores',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id').notNull(),
    levelId: levelEnum('level_id').notNull(),
    bestTimeMs: integer('best_time_ms').notNull(),
    achievedAt: timestamp('achieved_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex('best_scores_user_level_unique').on(
      table.userId,
      table.levelId,
    ),
    index('best_scores_leaderboard_idx').on(
      table.levelId,
      table.bestTimeMs,
    ),
  ],
);

/**
 * One row per (user, level, dailyKey). First-write-wins for the Trust MVP
 * model: on conflict the existing row is preserved, so retries / repeat
 * submissions can't overwrite an earlier completion. Streaks are recomputed
 * from this table at read time — never trusted from the client.
 */
export const dailyAttempts = pgTable(
  'daily_attempts',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id').notNull(),
    levelId: levelEnum('level_id').notNull(),
    dailyKey: text('daily_key').notNull(), // YYYY-MM-DD UTC
    seedVersion: integer('seed_version').notNull(),
    status: dailyAttemptStatusEnum('status').notNull(),
    elapsedMs: integer('elapsed_ms').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex('daily_attempts_user_level_day_unique').on(
      table.userId,
      table.levelId,
      table.dailyKey,
    ),
    index('daily_attempts_user_day_idx').on(table.userId, table.dailyKey),
  ],
);
