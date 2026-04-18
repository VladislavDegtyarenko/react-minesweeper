import { initGame } from '@/utils';
import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

// Constants
import { DEFAULT_LEVEL } from '@/constants';
import type { Level, LevelId, TBoard } from '@/types';

export type GameStatus = 'idle' | 'playing' | 'paused' | 'won' | 'lost';
export type GameStatusBeforeLevelChange = Extract<
  GameStatus,
  'playing' | 'paused'
>;

export type GameState = {
  board: TBoard;
  level: Level;
  totalFlags: number;
  gameStatus: GameStatus;
  isLevelChangeDialogOpen: boolean;
  pendingLevelId: LevelId | null; // target difficulty selected while confirmation dialog is open
  gameStatusBeforeLevelChange: GameStatusBeforeLevelChange | null; // active gameStatus before opening the level-change confirmation dialog
  isGameRestarted: boolean; // if the game is restarted, the first click on mine won't generate a new board in a do/while loop
  openedSafeCells: number; // running count of revealed non-mine cells — used for O(1) win detection
  correctlyFlaggedMines: number; // running count of mines with a FLAG marker — used for O(1) win detection
};

export const useGameStore = create<GameState>()(
  subscribeWithSelector(
    devtools(
      () => {
        const gameState = {
          board: initGame(DEFAULT_LEVEL),
          level: DEFAULT_LEVEL,
          totalFlags: 0,
          gameStatus: 'idle',
          isLevelChangeDialogOpen: false,
          pendingLevelId: null,
          gameStatusBeforeLevelChange: null,
          openedSafeCells: 0,
          correctlyFlaggedMines: 0,
        };

        return { ...gameState };
      },
      { name: 'game' },
    ),
  ),
);
