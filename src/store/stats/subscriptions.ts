import { selectGameStatus } from '@/store/game/selectors';
import { useGameStore } from '@/store/game/store';
import { useTimerStore } from '@/store/timer';
import { handleCompletedGameWin } from './actions';
import { clearLastWinSummary } from './utils';

export const initSubscriptions = (): void => {
  useGameStore.subscribe(selectGameStatus, (gameStatus, previousGameStatus) => {
    if (gameStatus === 'won') {
      const { level } = useGameStore.getState();
      const { elapsedMs } = useTimerStore.getState();

      void handleCompletedGameWin(level.id, elapsedMs);
      return;
    }

    if (previousGameStatus === 'won') {
      clearLastWinSummary();
    }
  });
};

initSubscriptions();
