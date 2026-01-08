import type { Level, LevelId, LevelsConfig } from "../types";
import { getLevelById } from "@/utils/getLevelById";

export const LOCAL_STORAGE_KEYS = {
  gameBoard: "GAME_BOARD",
  isMutedSFX: "IS_MUTED_SFX",
};

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

export const LEVELS_CONFIG: LevelsConfig = [
  { id: "easy", rows: 9, cols: 9, totalMines: 10 },

  { id: "medium", rows: 16, cols: 16, totalMines: 40 },

  { id: "expert", rows: 16, cols: 30, totalMines: 99 },
];

export const DEFAULT_LEVEL_ID: LevelId = "easy";
export const DEFAULT_LEVEL: Level = getLevelById(DEFAULT_LEVEL_ID);
