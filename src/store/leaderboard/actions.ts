import { fetchLeaderboardEntries } from '@/utils/supabase';
import { useLeaderboardStore } from './store';

const LEADERBOARD_KEY = 'global';

export const fetchLeaderboard = async () => {
  const { loadedKey, loadingState } = useLeaderboardStore.getState();

  if (loadingState === 'loading') {
    return;
  }

  if (loadingState === 'success' && loadedKey === LEADERBOARD_KEY) {
    return;
  }

  useLeaderboardStore.setState({
    errorMessage: null,
    loadingState: 'loading',
  });

  try {
    const entries = await fetchLeaderboardEntries();

    useLeaderboardStore.setState({
      entries,
      errorMessage: null,
      loadedKey: LEADERBOARD_KEY,
      loadingState: 'success',
    });
  } catch (error) {
    useLeaderboardStore.setState({
      errorMessage:
        error instanceof Error
          ? error.message
          : 'Failed to load leaderboard.',
      loadedKey: LEADERBOARD_KEY,
      loadingState: 'error',
    });
  }
};

export const resetLeaderboardStore = () => {
  useLeaderboardStore.setState({
    entries: [],
    errorMessage: null,
    loadedKey: null,
    loadingState: 'idle',
  });
};
