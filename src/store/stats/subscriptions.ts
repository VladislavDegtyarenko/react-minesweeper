import { selectGameStatus } from '@/store/game/selectors';
import { useGameStore } from '@/store/game/store';
import { useTimerStore } from '@/store/timer';
import { handleCompletedGameWin, recordDailyWinSummary } from './actions';
import { clearLastWinSummary } from './utils';

export const initSubscriptions = (): void => {
  useGameStore.subscribe(selectGameStatus, (gameStatus, previousGameStatus) => {
    if (gameStatus === 'won') {
      const { level, mode } = useGameStore.getState();
      const { elapsedMs } = useTimerStore.getState();

      // Daily wins are tracked in the daily store and never update the
      // free-play best-score table or leaderboard. We still surface a win
      // dialog so the player can share the result.
      if (mode === 'daily') {
        recordDailyWinSummary(level.id, elapsedMs);
        return;
      }

      void handleCompletedGameWin(level.id, elapsedMs);
      return;
    }

    if (previousGameStatus === 'won') {
      clearLastWinSummary();
    }
  });
};

initSubscriptions();
