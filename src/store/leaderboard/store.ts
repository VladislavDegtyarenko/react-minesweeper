import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { LeaderboardState } from './types';

const initialState: LeaderboardState = {
  entries: [],
  errorMessage: null,
  loadedKey: null,
  loadingState: 'idle',
};

export const useLeaderboardStore = create<LeaderboardState>()(
  devtools(
    () => ({
      ...initialState,
    }),
    { name: 'leaderboard' },
  ),
);
