import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import type { StatsState } from './types';
import { createEmptyBestTimes, getStoredGuestBestTimes } from './utils';

const initialGuestBestTimes = getStoredGuestBestTimes();

const initialState: StatsState = {
  bestTimesByLevel: initialGuestBestTimes,
  guestBestTimesByLevel: initialGuestBestTimes,
  hasPresentedWinDialog: false, // whether the win dialog has been opened first time
  isWinDialogOpen: false, // whether the win dialog is currently open
  lastWinSummary: null,
  scoreSource: 'guest',
};

export const useStatsStore = create<StatsState>()(
  subscribeWithSelector(
    devtools(
      () => ({
        ...initialState,
      }),
      { name: 'stats' },
    ),
  ),
);

export const resetStatsStore = () => {
  useStatsStore.setState({
    bestTimesByLevel: createEmptyBestTimes(),
    guestBestTimesByLevel: createEmptyBestTimes(),
    hasPresentedWinDialog: false,
    isWinDialogOpen: false,
    lastWinSummary: null,
    scoreSource: 'guest',
  });
};
