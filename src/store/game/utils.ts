import type { CellMarkerState } from '@/types';
import type { Level } from '@/types';
import { CELL_MARKERS } from '@/constants';
import type { BoardLayout, BoardState } from '@/utils/board/types';
import type { GameState } from './types';

type CloneBoardOptions = {
  highlights?: boolean;
  incorrectFlags?: boolean;
  markers?: boolean;
  opened?: boolean;
};

export const createGameState = (
  level: Level,
  board: BoardState,
): GameState => {
  return {
    board,
    level,
    gameStatus: 'idle',
    isLevelChangeDialogOpen: false,
    pendingLevelId: null,
    gameStatusBeforeLevelChange: null,
  };
};

export const cloneBoard = (
  board: BoardState,
  options: CloneBoardOptions,
): BoardState => {
  return {
    ...board,
    mines: board.mines,
    numbers: board.numbers,
    opened: options.opened ? [...board.opened] : board.opened,
    markers: options.markers ? [...board.markers] : board.markers,
    highlights: options.highlights ? [...board.highlights] : board.highlights,
    incorrectFlags: options.incorrectFlags
      ? [...board.incorrectFlags]
      : board.incorrectFlags,
    cellViews: board.cellViews,
  };
};

export const getBoardLayout = (board: BoardState): BoardLayout | null => {
  if (!board.isLayoutReady) {
    return null;
  }

  return {
    mines: [...board.mines],
    numbers: [...board.numbers],
  };
};

export const getNextMarker = (
  marker: CellMarkerState,
  isQuestionMarkEnabled: boolean,
): CellMarkerState => {
  if (marker === CELL_MARKERS.FLAG) {
    return isQuestionMarkEnabled ? CELL_MARKERS.QUESTION : null;
  }

  if (marker === CELL_MARKERS.QUESTION) {
    return null;
  }

  return CELL_MARKERS.FLAG;
};
