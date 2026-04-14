import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { AuthState } from './types';

const initialState: AuthState = {
  errorMessage: null,
  hydrationErrorMessage: null,
  hydrationLoadingState: 'idle',
  isConfigured: false,
  lastHydratedUserId: null,
  profile: null,
  session: null,
  status: 'loading',
  user: null,
};

export const useAuthStore = create<AuthState>()(
  devtools(
    () => ({
      ...initialState,
    }),
    { name: 'auth' },
  ),
);
