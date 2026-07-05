import { selectGameStatus } from '@/store/game/selectors';
import { useGameStore } from '@/store/game/store';
import { useTimerStore } from '@/store/timer';
import {
  classifyDailyRun,
  clearActiveDailyRunKind,
  recordDailyAttempt,
} from './actions';
import { useDailyStore } from './store';
import { initDailyDateListener } from './listeners';

/**
 * Listens for game completions while in daily mode and records exactly one
 * attempt per (date, level) — first-write-wins both client-side and on the
 * server.
 */
export const initSubscriptions = (): void => {
  useGameStore.subscribe(selectGameStatus, (gameStatus, previousGameStatus) => {
    const { mode, dailyKey, dailySeedVersion, level } = useGameStore.getState();

    if (mode !== 'daily') {
      clearActiveDailyRunKind();

      return;
    }

    if (gameStatus === 'idle') {
      clearActiveDailyRunKind();

      return;
    }

    if (gameStatus === 'playing' && previousGameStatus === 'idle') {
      classifyDailyRun(level.id);

      return;
    }

    if (gameStatus !== 'won' && gameStatus !== 'lost') {
      return;
    }

    if (!dailyKey) {
      return;
    }

    const activeRunKind =
      useDailyStore.getState().activeRunKind ?? classifyDailyRun(level.id);

    if (activeRunKind !== 'attempt') {
      return;
    }

    const { elapsedMs } = useTimerStore.getState();

    void recordDailyAttempt({
      levelId: level.id,
      dailyKey,
      seedVersion: dailySeedVersion ?? undefined,
      status: gameStatus,
      elapsedMs,
    });
  });

  initDailyDateListener();
};

initSubscriptions();
