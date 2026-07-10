import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import type { bestScores, dailyAttempts } from './schema';

export type BestScore = InferSelectModel<typeof bestScores>;
export type BestScoreInsert = InferInsertModel<typeof bestScores>;

export type LeaderboardEntry = BestScore & {
  username: string;
  imageUrl: string | null;
};

export type DailyAttempt = InferSelectModel<typeof dailyAttempts>;
export type DailyAttemptInsert = InferInsertModel<typeof dailyAttempts>;

export type DailyLeaderboardEntry = DailyAttempt & {
  username: string;
  imageUrl: string | null;
};

export type DailyStreakSummary = {
  currentStreak: number;
  bestStreak: number;
  lastWinKey: string | null;
};

export type DailyStreakLeaderboardEntry = DailyStreakSummary & {
  userId: string;
  username: string;
  imageUrl: string | null;
};
