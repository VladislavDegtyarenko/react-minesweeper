import type { CellMarkerState } from '@/types';

export type CellValue = 'mine' | number | null;
export type CellHighlight = 'red' | 'green' | null;

export type BoardLayout = {
  mines: boolean[];
  numbers: number[];
};

export type BoardStaticState = {
  rows: number;
  cols: number;
  totalMines: number;
  isLayoutReady: boolean;
  mines: boolean[];
  numbers: number[];
};

export type BoardDynamicState = {
  opened: boolean[];
  markers: CellMarkerState[];
  highlights: CellHighlight[];
  incorrectFlags: boolean[];
  openedSafeCount: number;
  correctFlagCount: number;
  flagsPlaced: number;
  cellViews: CellView[];
};

export type BoardState = BoardStaticState & BoardDynamicState;

export type CellView = {
  index: number;
  row: number;
  col: number;
  value: CellValue;
  isMine: boolean;
  isOpened: boolean;
  marker: CellMarkerState;
  highlight: CellHighlight;
  showIncorrectFlag: boolean;
};

export type HandleCellInteractionProps = {
  e: globalThis.PointerEvent;
  row: number;
  col: number;
};
