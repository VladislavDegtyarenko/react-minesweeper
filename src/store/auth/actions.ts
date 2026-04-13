import type { Session, User } from '@supabase/supabase-js';
import type { Profile } from '@/types/supabase';
import { syncStatsWithSession } from '@/store/stats/actions';
import {
  getCurrentProfile,
  getCurrentSession,
  hasSupabaseEnv,
  upsertOwnProfile,
} from '@/utils/supabase';
import { useAuthStore } from './store';

type SetAuthPayload = {
  errorMessage?: string | null;
  isConfigured: boolean;
  profile?: Profile | null;
  session?: Session | null;
  status: 'loading' | 'guest' | 'authenticated';
  user?: User | null;
};

export const setAuthState = (payload: SetAuthPayload) => {
  useAuthStore.setState((state) => ({
    errorMessage: payload.errorMessage ?? state.errorMessage,
    hydrationErrorMessage: state.hydrationErrorMessage,
    hydrationLoadingState: state.hydrationLoadingState,
    isConfigured: payload.isConfigured,
    lastHydratedUserId: state.lastHydratedUserId,
    profile: payload.profile ?? null,
    session: payload.session ?? null,
    status: payload.status,
    user: payload.user ?? null,
  }));
};

export const setAuthError = (errorMessage: string | null) => {
  useAuthStore.setState({ errorMessage });
};

export const setAuthProfile = (profile: Profile | null) => {
  useAuthStore.setState({ profile });
};

export const resetAuthStateToGuest = () => {
  useAuthStore.setState({
    errorMessage: null,
    hydrationErrorMessage: null,
    hydrationLoadingState: 'success',
    isConfigured: hasSupabaseEnv(),
    lastHydratedUserId: null,
    profile: null,
    session: null,
    status: 'guest',
    user: null,
  });
};

export const hydrateAuthState = async () => {
  const currentState = useAuthStore.getState();

  if (!hasSupabaseEnv()) {
    useAuthStore.setState({
      errorMessage: null,
      hydrationErrorMessage: null,
      hydrationLoadingState: 'success',
      isConfigured: false,
      lastHydratedUserId: null,
      profile: null,
      session: null,
      status: 'guest',
      user: null,
    });
    await syncStatsWithSession(null);

    return;
  }

  if (currentState.hydrationLoadingState === 'loading') {
    return;
  }

  useAuthStore.setState({
    hydrationErrorMessage: null,
    hydrationLoadingState: 'loading',
    isConfigured: true,
    status: 'loading',
  });

  try {
    const session = await getCurrentSession();

    if (!session?.user) {
      useAuthStore.setState({
        errorMessage: null,
        hydrationErrorMessage: null,
        hydrationLoadingState: 'success',
        isConfigured: true,
        lastHydratedUserId: null,
        profile: null,
        session: null,
        status: 'guest',
        user: null,
      });
      await syncStatsWithSession(null);

      return;
    }

    if (
      currentState.hydrationLoadingState === 'success' &&
      currentState.lastHydratedUserId === session.user.id &&
      currentState.user?.id === session.user.id
    ) {
      useAuthStore.setState({
        isConfigured: true,
        session,
        status: 'authenticated',
        user: session.user,
      });

      return;
    }

    const fallbackProfile = {
      country: session.user.user_metadata.country ?? null,
      email: session.user.email ?? null,
      first_name: session.user.user_metadata.first_name ?? null,
      last_name: session.user.user_metadata.last_name ?? null,
      nickname:
        session.user.user_metadata.nickname ??
        session.user.email?.split('@')[0] ??
        'player',
    };

    const profile =
      (await getCurrentProfile(session.user.id)) ??
      (await upsertOwnProfile(session.user.id, fallbackProfile));

    useAuthStore.setState({
      errorMessage: null,
      hydrationErrorMessage: null,
      hydrationLoadingState: 'success',
      isConfigured: true,
      lastHydratedUserId: session.user.id,
      profile,
      session,
      status: 'authenticated',
      user: session.user,
    });
    await syncStatsWithSession(session.user.id);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Auth failed.';

    useAuthStore.setState({
      errorMessage,
      hydrationErrorMessage: errorMessage,
      hydrationLoadingState: 'error',
      isConfigured: true,
      lastHydratedUserId: null,
      profile: null,
      session: null,
      status: 'guest',
      user: null,
    });
    await syncStatsWithSession(null);
  }
};
