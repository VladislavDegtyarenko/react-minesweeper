import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { AccountState } from './types';

const initialState: AccountState = {
  errorMessage: null,
  loadedUserId: null,
  profileLoadingState: 'idle',
  scores: [],
  scoresLoadingState: 'idle',
  updateProfileLoadingState: 'idle',
};

export const useAccountStore = create<AccountState>()(
  devtools(
    () => ({
      ...initialState,
    }),
    { name: 'account' },
  ),
);
