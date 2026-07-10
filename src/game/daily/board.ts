import type { Level, LevelId, TBoard } from '@/types';
import { initBoard } from '@/utils/init';
import { createSeededRandom, getDailySeed } from './seed';

type GenerateDailyBoardOptions = {
  dailyKey: string;
  level: Omit<Level, 'id' | 'label'> & { id: LevelId };
  excludeCell?: { row: number; col: number };
  seedVersion?: number;
};

/**
 * Deterministically build a Minesweeper board for a given UTC daily key,
 * level and seed version. Same inputs produce the exact same mine layout
 * across browsers, OSes, and architectures.
 */
export const generateDailyBoard = ({
  dailyKey,
  level,
  excludeCell,
  seedVersion,
}: GenerateDailyBoardOptions): TBoard => {
  const baseSeed = getDailySeed(dailyKey, level.id, seedVersion);
  const excludeOffset = excludeCell
    ? (excludeCell.row + 1) * 73856093 + (excludeCell.col + 1) * 19349663
    : 0;
  const seed = (baseSeed ^ excludeOffset) >>> 0;

  return initBoard(
    { rows: level.rows, cols: level.cols, totalMines: level.totalMines },
    { excludeCell, random: createSeededRandom(seed) },
  );
};

export const getDailySeedForLevel = (
  dailyKey: string,
  levelId: LevelId,
  seedVersion?: number,
) => {
  return getDailySeed(dailyKey, levelId, seedVersion);
};
