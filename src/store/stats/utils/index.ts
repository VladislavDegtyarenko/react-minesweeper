import { useStatsStore } from '../store';

export {
  createEmptyBestTimes,
  getStoredGuestBestTimes,
  persistGuestBestTimes,
} from './guest';

export const normalizeElapsedMs = (elapsedMs: number) => {
  return Math.max(0, Math.round(elapsedMs));
};

export const clearLastWinSummary = () => {
  useStatsStore.setState({
    hasPresentedWinDialog: false,
    isWinDialogOpen: false,
    lastWinSummary: null,
    scoreSyncState: {
      message: null,
      status: 'idle',
    },
  });
};
