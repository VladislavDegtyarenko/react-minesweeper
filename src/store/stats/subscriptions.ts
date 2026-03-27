import { LOCAL_STORAGE_KEYS } from '@/constants';
import { selectGameStatus } from '@/store/game/selectors';
import { useGameStore } from '@/store/game/store';
import { useTimerStore } from '@/store/timer';
import { localStorageService } from '@/utils';
import { recordBestTime } from './actions';
import { useStatsStore } from './store';
import { clearLastWinSummary } from './utils';

export const initSubscriptions = (): void => {
  useStatsStore.subscribe(
    (state) => state.bestTimesByLevel,
    (bestTimesByLevel) => {
      localStorageService.set(LOCAL_STORAGE_KEYS.bestTimes, bestTimesByLevel);
    },
  );

  useGameStore.subscribe(selectGameStatus, (gameStatus, previousGameStatus) => {
    if (gameStatus === 'won') {
      const { level } = useGameStore.getState();
      const { elapsedMs } = useTimerStore.getState();

      recordBestTime(level.id, elapsedMs);
      return;
    }

    if (previousGameStatus === 'won') {
      clearLastWinSummary();
    }
  });
};

initSubscriptions();
