import { CELL_MARKERS } from '@/constants';

export type CellMarker = (typeof CELL_MARKERS)[keyof typeof CELL_MARKERS];
export type CellMarkerState = CellMarker | null;

type OpenedCell = {
  isOpened: true;
  marker: null;
};

export type ClosedCell = {
  isOpened: false;
  marker: CellMarkerState;
};

type MineCell = {
  value: 'mine';
  highlight?: 'red' | 'green';
};

type NumberCell = {
  value: number;
};

export type OpenedMineCell = OpenedCell & MineCell;
type ClosedMineCell = ClosedCell & MineCell;
export type OpenedNumberCell = OpenedCell & NumberCell;
type ClosedNumberCell = ClosedCell & NumberCell;

type EmptyCell = ClosedCell & {
  value: null;
};

export type GameCell =
  | OpenedMineCell
  | ClosedMineCell
  | OpenedNumberCell
  | ClosedNumberCell
  | EmptyCell;

export type TBoard = GameCell[][];

export type Level = {
  id: LevelId;
  label: string;
  rows: number;
  cols: number;
  totalMines: number;
};
export type LevelId = 'easy' | 'medium' | 'expert';
export type LevelsConfig = Level[];
