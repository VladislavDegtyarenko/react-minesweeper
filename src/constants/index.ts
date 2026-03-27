import { getLevelById } from '@/utils/getLevelById';
import type { Level, LevelId, LevelsConfig } from '../types';

export const LOCAL_STORAGE_KEYS = {
  bestTimes: 'BEST_TIMES',
  gameBoard: 'GAME_BOARD',
  isMutedSFX: 'IS_MUTED_SFX',
  preferredControlMode: 'PREFERRED_CONTROL_MODE',
  zoom: 'ZOOM',
  digFlag: 'DIG_FLAG',
  isQuestionMarkEnabled: 'IS_QUESTION_MARK_ENABLED',
} as const;

export const CELL_MARKERS = {
  FLAG: 'flag',
  QUESTION: 'question',
} as const;

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
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
];

export const LEVELS_CONFIG: LevelsConfig = [
  { id: 'easy', rows: 9, cols: 9, totalMines: 10, label: 'Easy' },

  { id: 'medium', rows: 16, cols: 16, totalMines: 40, label: 'Medium' },

  { id: 'expert', rows: 16, cols: 30, totalMines: 99, label: 'Expert' },
];

export const DEFAULT_LEVEL_ID: LevelId = 'easy';
export const DEFAULT_LEVEL: Level = getLevelById(DEFAULT_LEVEL_ID);
