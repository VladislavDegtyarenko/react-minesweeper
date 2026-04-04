import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import type { StatsState } from './types';
import { createEmptyBestTimes, getStoredBestTimes } from './utils';

const initialState: StatsState = {
  bestTimesByLevel: getStoredBestTimes(),
  hasPresentedWinDialog: false, // whether the win dialog has been opened first time
  isWinDialogOpen: false, // whether the win dialog is currently open
  lastWinSummary: null,
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
    hasPresentedWinDialog: false,
    isWinDialogOpen: false,
    lastWinSummary: null,
  });
};
