import { getCurrentElapsedMs } from '@/store/timer/actions';
import { useGameStore } from '../store';
import { clearSnapshot, createSnapshot, writeSnapshot } from '.';

const SNAPSHOT_SAVE_DELAY_MS = 300;

let saveTimeout: number | null = null;

const clearSaveTimeout = () => {
  if (saveTimeout === null) {
    return;
  }

  window.clearTimeout(saveTimeout);
  saveTimeout = null;
};

const flushSnapshot = () => {
  const snapshot = createSnapshot(
    useGameStore.getState(),
    getCurrentElapsedMs(),
  );

  if (!snapshot) {
    return;
  }

  writeSnapshot(snapshot);
};

const scheduleSnapshotSave = () => {
  clearSaveTimeout();

  saveTimeout = window.setTimeout(() => {
    saveTimeout = null;
    flushSnapshot();
  }, SNAPSHOT_SAVE_DELAY_MS);
};

export const initSnapshotSubscription = () => {
  useGameStore.subscribe(
    (state) => ({
      board: state.board,
      totalFlags: state.totalFlags,
      openedSafeCells: state.openedSafeCells,
      correctlyFlaggedMines: state.correctlyFlaggedMines,
      gameStatus: state.gameStatus,
      mode: state.mode,
      levelId: state.level.id,
      dailyKey: state.dailyKey,
      dailySeedVersion: state.dailySeedVersion,
    }),
    (state) => {
      if (state.gameStatus === 'won' || state.gameStatus === 'lost') {
        clearSaveTimeout();
        clearSnapshot();

        return;
      }

      if (state.gameStatus === 'playing' || state.gameStatus === 'paused') {
        scheduleSnapshotSave();
      }
    },
  );

  window.addEventListener('pagehide', flushSnapshot);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushSnapshot();
    }
  });
};
