import type { TLevel } from "../types";

export const LEVELS = {
  easy: {
    rows: 9,
    cols: 9,
    totalMines: 10,
  },
  medium: {
    rows: 16,
    cols: 16,
    totalMines: 40,
  },
  expert: {
    rows: 16,
    cols: 30,
    totalMines: 99,
  },
};

export const DEFAULT_LEVEL: TLevel = "easy";

export const DIRECTIONS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

export const CELL_NUMBERS_COLORS = [
  null,
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
];
