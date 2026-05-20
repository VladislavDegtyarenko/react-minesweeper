import { LOCAL_STORAGE_KEYS, LEVELS_CONFIG } from '@/constants';
import type { Level, LevelId, TBoard } from '@/types';
import { localStorageService } from '@/utils';
import { DAILY_SEED_VERSION, getDailyKey } from '@/utils/daily';
import type { GameMode, GameState } from '../store';
import type { GameSnapshotRouteParams, GameSnapshotV1 } from './types';

const GAME_SNAPSHOT_VERSION = 1;
const FREE_SNAPSHOT_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const RESUMABLE_GAME_STATUSES = new Set(['playing', 'paused']);

const LEVEL_IDS = new Set<LevelId>(LEVELS_CONFIG.map((level) => level.id));

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const isLevel = (value: unknown): value is Level => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    LEVEL_IDS.has(value.id as LevelId) &&
    typeof value.label === 'string' &&
    typeof value.rows === 'number' &&
    typeof value.cols === 'number' &&
    typeof value.totalMines === 'number'
  );
};

const isBoard = (value: unknown): value is TBoard => {
  return (
    Array.isArray(value) &&
    value.every(
      (row) =>
        Array.isArray(row) &&
        row.every(
          (cell) => isRecord(cell) && typeof cell.isOpened === 'boolean',
        ),
    )
  );
};

const hasOpenedCell = (board: TBoard) => {
  return board.some((row) => row.some((cell) => cell.isOpened));
};

export const isResumableSnapshot = (
  snapshot: GameSnapshotV1,
  now = Date.now(),
) => {
  if (!RESUMABLE_GAME_STATUSES.has(snapshot.gameStatus)) {
    return false;
  }

  if (!hasOpenedCell(snapshot.board)) {
    return false;
  }

  if (snapshot.mode === 'daily') {
    return snapshot.dailyKey === getDailyKey();
  }

  return now - snapshot.savedAt < FREE_SNAPSHOT_MAX_AGE_MS;
};

const parseSnapshot = (value: unknown): GameSnapshotV1 | null => {
  if (!isRecord(value)) {
    return null;
  }

  if (
    value.version !== GAME_SNAPSHOT_VERSION ||
    typeof value.savedAt !== 'number' ||
    (value.mode !== 'free' && value.mode !== 'daily') ||
    !isLevel(value.level) ||
    !isBoard(value.board) ||
    typeof value.totalFlags !== 'number' ||
    typeof value.openedSafeCells !== 'number' ||
    typeof value.correctlyFlaggedMines !== 'number' ||
    (value.gameStatus !== 'playing' && value.gameStatus !== 'paused') ||
    typeof value.elapsedMs !== 'number'
  ) {
    return null;
  }

  if (
    value.mode === 'daily' &&
    (typeof value.dailyKey !== 'string' ||
      typeof value.dailySeedVersion !== 'number')
  ) {
    return null;
  }

  return value as GameSnapshotV1;
};

export const clearSnapshot = () => {
  localStorageService.remove(LOCAL_STORAGE_KEYS.GAME_SNAPSHOT);
};

export const readSnapshot = () => {
  const snapshot = parseSnapshot(
    localStorageService.get<GameSnapshotV1>(LOCAL_STORAGE_KEYS.GAME_SNAPSHOT),
  );

  if (!snapshot || !isResumableSnapshot(snapshot)) {
    clearSnapshot();

    return null;
  }

  return snapshot;
};

export const writeSnapshot = (snapshot: GameSnapshotV1) => {
  localStorageService.set(LOCAL_STORAGE_KEYS.GAME_SNAPSHOT, snapshot);
};

export const snapshotMatches = (
  snapshot: GameSnapshotV1,
  params: GameSnapshotRouteParams,
) => {
  if (params.mode && snapshot.mode !== params.mode) {
    return false;
  }

  if (params.levelId && snapshot.level.id !== params.levelId) {
    return false;
  }

  if (snapshot.mode === 'daily' && snapshot.dailyKey !== getDailyKey()) {
    return false;
  }

  return true;
};

export const createSnapshot = (
  state: GameState,
  elapsedMs: number,
): GameSnapshotV1 | null => {
  if (state.gameStatus !== 'playing' && state.gameStatus !== 'paused') {
    return null;
  }

  if (state.openedSafeCells < 1 || !hasOpenedCell(state.board)) {
    return null;
  }

  return {
    version: GAME_SNAPSHOT_VERSION,
    savedAt: Date.now(),
    mode: state.mode,
    level: state.level,
    ...(state.mode === 'daily'
      ? {
          dailyKey: state.dailyKey ?? getDailyKey(),
          dailySeedVersion: state.dailySeedVersion ?? DAILY_SEED_VERSION,
        }
      : {}),
    board: state.board,
    totalFlags: state.totalFlags,
    openedSafeCells: state.openedSafeCells,
    correctlyFlaggedMines: state.correctlyFlaggedMines,
    gameStatus: state.gameStatus,
    elapsedMs,
  };
};
