import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import type { bestScores } from './schema';

export type BestScore = InferSelectModel<typeof bestScores>;
export type BestScoreInsert = InferInsertModel<typeof bestScores>;

export type LeaderboardEntry = BestScore & {
  username: string;
  imageUrl: string | null;
};
