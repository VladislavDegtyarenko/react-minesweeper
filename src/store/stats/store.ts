import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import type { StatsState } from './types';
import { createEmptyBestTimes, getStoredBestTimes } from './utils';

const initialState: StatsState = {
  bestTimesByLevel: getStoredBestTimes(),
  isWinDialogOpen: false,
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
    isWinDialogOpen: false,
    lastWinSummary: null,
  });
};
