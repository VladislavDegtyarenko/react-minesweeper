import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { getDailyKey } from '@/game/daily';
import type { DailyState } from './types';
import {
  createEmptyDailyHistory,
  loadGuestDailyHistory,
  summarizeStreak,
} from './utils';

const initialGuestHistory = loadGuestDailyHistory();
const initialTodayKey = getDailyKey();

const initialState: DailyState = {
  source: 'guest',
  accountStateStatus: 'idle',
  todayKey: initialTodayKey,
  guestHistory: initialGuestHistory,
  history: initialGuestHistory,
  streak: summarizeStreak(initialGuestHistory, initialTodayKey),
  activeRunKind: null,
  pendingSyncAttempt: null,
  isSyncing: false,
  syncError: null,
};

export const useDailyStore = create<DailyState>()(
  subscribeWithSelector(
    devtools(() => ({ ...initialState }), { name: 'daily' }),
  ),
);

export const resetDailyStore = () => {
  const empty = createEmptyDailyHistory();
  useDailyStore.setState({
    source: 'guest',
    accountStateStatus: 'guest',
    todayKey: getDailyKey(),
    guestHistory: empty,
    history: empty,
    streak: summarizeStreak(empty, getDailyKey()),
    activeRunKind: null,
    pendingSyncAttempt: null,
    isSyncing: false,
    syncError: null,
  });
};
