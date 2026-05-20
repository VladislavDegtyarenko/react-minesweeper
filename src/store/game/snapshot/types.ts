import type { Level, TBoard } from '@/types';
import type { GameMode, GameStatus } from '../store';

export type GameSnapshotV1 = {
  version: 1;
  savedAt: number;
  mode: GameMode;
  level: Level;
  dailyKey?: string;
  dailySeedVersion?: number;
  board: TBoard;
  totalFlags: number;
  openedSafeCells: number;
  correctlyFlaggedMines: number;
  gameStatus: Extract<GameStatus, 'playing' | 'paused'>;
  elapsedMs: number;
};

export type GameSnapshotRouteParams = {
  mode?: GameMode;
  levelId?: Level['id'];
};
