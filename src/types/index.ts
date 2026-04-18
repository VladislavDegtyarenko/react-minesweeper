import { CELL_MARKERS } from '@/constants';

export type CellMarker = (typeof CELL_MARKERS)[keyof typeof CELL_MARKERS];
export type CellMarkerState = CellMarker | null;

export type Level = {
  id: LevelId;
  label: string;
  rows: number;
  cols: number;
  totalMines: number;
};
export type LevelId = 'easy' | 'medium' | 'expert';
export type LevelsConfig = Level[];
