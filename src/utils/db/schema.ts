import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { LEVEL_IDS } from './constants';

export const levelEnum = pgEnum('level', LEVEL_IDS);

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
