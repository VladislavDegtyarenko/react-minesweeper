import type { LeaderboardState } from './types';

export const selectLeaderboardEntries = (state: LeaderboardState) =>
  state.entries;

export const selectLeaderboardErrorMessage = (state: LeaderboardState) =>
  state.errorMessage;

export const selectLeaderboardLoadingState = (state: LeaderboardState) =>
  state.loadingState;
