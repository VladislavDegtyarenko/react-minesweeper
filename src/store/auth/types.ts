import type { Session, User } from '@supabase/supabase-js';
import type { LoadingState } from '@/types/loading';
import type { Profile } from '@/types/supabase';

export type AuthStatus = 'loading' | 'guest' | 'authenticated';

export type AuthState = {
  errorMessage: string | null;
  hydrationErrorMessage: string | null;
  hydrationLoadingState: LoadingState;
  isConfigured: boolean;
  lastHydratedUserId: string | null;
  profile: Profile | null;
  session: Session | null;
  status: AuthStatus;
  user: User | null;
};
