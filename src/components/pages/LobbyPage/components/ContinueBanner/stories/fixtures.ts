import { LEVELS_CONFIG, CELL_MARKERS } from '@/config';
import { createPreviewBoard } from '@/components/pages/LobbyPage/components/PreviewBoard/utils';
import type { GameSnapshotV1 } from '@/store/game/snapshot/types';

const LEVEL = LEVELS_CONFIG[0];
const BOARD = createPreviewBoard(LEVEL);
const CELLS = BOARD.flat();

export const CLASSIC_SNAPSHOT: GameSnapshotV1 = {
  version: 1,
  savedAt: Date.UTC(2026, 9, 30, 12),
  mode: 'free',
  level: LEVEL,
  board: BOARD,
  totalFlags: CELLS.filter((cell) => cell.marker === CELL_MARKERS.FLAG).length,
  correctlyFlaggedMines: CELLS.filter(
    (cell) => cell.marker === CELL_MARKERS.FLAG && cell.value === 'mine',
  ).length,
  openedSafeCells: CELLS.filter(
    (cell) => cell.isOpened && cell.value !== 'mine',
  ).length,
  gameStatus: 'paused',
  elapsedMs: 83_000,
};

export const DAILY_SNAPSHOT: GameSnapshotV1 = {
  ...CLASSIC_SNAPSHOT,
  mode: 'daily',
  dailyKey: '2026-10-30',
  dailySeedVersion: 1,
};
