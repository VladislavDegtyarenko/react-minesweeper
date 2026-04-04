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
        };

        return { ...gameState };
      },
      { name: 'game' },
    ),
  ),
);
