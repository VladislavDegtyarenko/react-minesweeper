import type { AccountState } from './types';

export const selectAccountErrorMessage = (state: AccountState) =>
  state.errorMessage;

export const selectAccountScores = (state: AccountState) => state.scores;

export const selectAccountScoresLoadingState = (state: AccountState) =>
  state.scoresLoadingState;

export const selectAccountUpdateProfileLoadingState = (state: AccountState) =>
  state.updateProfileLoadingState;
