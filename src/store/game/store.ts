import { initGame } from '@/utils';
import {
  DAILY_SEED_VERSION,
  generateDailyBoard,
  getDailyKey,
} from '@/utils/daily';
import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

// Constants
import { DEFAULT_LEVEL } from '@/constants';
import type { Level, LevelId, TBoard } from '@/types';
import { loadPreferredGameMode } from './preferences';

export type GameStatus = 'idle' | 'playing' | 'paused' | 'won' | 'lost';
export type GameStatusBeforeLevelChange = Extract<
  GameStatus,
  'playing' | 'paused'
>;

export type GameMode = 'free' | 'daily';

export type GameState = {
  board: TBoard;
  level: Level;
  totalFlags: number;
  gameStatus: GameStatus;
  isLevelChangeDialogOpen: boolean;
  pendingLevelId: LevelId | null; // target difficulty selected while confirmation dialog is open
  pendingMode: GameMode | null; // target mode selected while confirmation dialog is open
  gameStatusBeforeLevelChange: GameStatusBeforeLevelChange | null; // active gameStatus before opening the level-change confirmation dialog
  isGameRestarted: boolean; // if the game is restarted, the first click on mine won't generate a new board in a do/while loop
  openedSafeCells: number; // running count of revealed non-mine cells — used for O(1) win detection
  correctlyFlaggedMines: number; // running count of mines with a FLAG marker — used for O(1) win detection
  mode: GameMode; // 'free' for random boards, 'daily' for the deterministic daily challenge
  dailyKey: string | null; // UTC daily key (YYYY-MM-DD) of the current daily board, when in daily mode
  dailySeedVersion: number | null; // seed version used to generate the current daily board, when in daily mode
  isOnboardingTourOpen: boolean; // suppresses background auto-pause while the interactive tour needs the board
};

const buildInitialGameState = (): GameState => {
  const preferredMode = loadPreferredGameMode() ?? 'free';
  const isDaily = preferredMode === 'daily';

  if (isDaily) {
    const dailyKey = getDailyKey();

    return {
      board: generateDailyBoard({ dailyKey, level: DEFAULT_LEVEL }),
      level: DEFAULT_LEVEL,
      totalFlags: 0,
      gameStatus: 'idle',
      isLevelChangeDialogOpen: false,
      pendingLevelId: null,
      pendingMode: null,
      gameStatusBeforeLevelChange: null,
      isGameRestarted: false,
      openedSafeCells: 0,
      correctlyFlaggedMines: 0,
      mode: 'daily',
      dailyKey,
      dailySeedVersion: DAILY_SEED_VERSION,
      isOnboardingTourOpen: false,
    };
  }

  return {
    board: initGame(DEFAULT_LEVEL),
    level: DEFAULT_LEVEL,
    totalFlags: 0,
    gameStatus: 'idle',
    isLevelChangeDialogOpen: false,
    pendingLevelId: null,
    pendingMode: null,
    gameStatusBeforeLevelChange: null,
    isGameRestarted: false,
    openedSafeCells: 0,
    correctlyFlaggedMines: 0,
    mode: 'free',
    dailyKey: null,
    dailySeedVersion: null,
    isOnboardingTourOpen: false,
  };
};

export const useGameStore = create<GameState>()(
  subscribeWithSelector(
    devtools(buildInitialGameState, { name: 'game' }),
  ),
);
