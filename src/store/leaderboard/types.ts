import type { LeaderboardEntry } from '@/types/supabase';
import type { LoadingState } from '@/types/loading';

export type LeaderboardState = {
  entries: LeaderboardEntry[];
  errorMessage: string | null;
  loadedKey: string | null;
  loadingState: LoadingState;
};
