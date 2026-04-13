import type { AuthState } from './types';

export const selectAuthErrorMessage = (state: AuthState) => state.errorMessage;

export const selectAuthHydrationLoadingState = (state: AuthState) =>
  state.hydrationLoadingState;

export const selectAuthProfile = (state: AuthState) => state.profile;

export const selectAuthStatus = (state: AuthState) => state.status;

export const selectAuthUser = (state: AuthState) => state.user;

export const selectIsAuthenticated = (state: AuthState) =>
  state.status === 'authenticated';

export const selectIsSupabaseConfigured = (state: AuthState) =>
  state.isConfigured;
