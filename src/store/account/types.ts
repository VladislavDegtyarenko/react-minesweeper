import type { BestScore, Profile } from '@/types/supabase';
import type { LoadingState } from '@/types/loading';

export type AccountState = {
  errorMessage: string | null;
  loadedUserId: string | null;
  profileLoadingState: LoadingState;
  scores: BestScore[];
  scoresLoadingState: LoadingState;
  updateProfileLoadingState: LoadingState;
};
