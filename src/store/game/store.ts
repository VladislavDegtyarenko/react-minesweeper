import { initGame } from '@/utils';
import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

// Constants
import { DEFAULT_LEVEL } from '@/constants';
import type { Level, TBoard } from '@/types';

export type GameState = {
  board: TBoard;
  level: Level;
  totalFlags: number;
  gameStatus: 'idle' | 'playing' | 'paused' | 'won' | 'lost';
  isGameRestarted: boolean; // if the game is restarted, the first click on mine won't generate a new board in a do/while loop
};

export const useGameStore = create<GameState>()(
  subscribeWithSelector(
    devtools(() => {
      const gameState = {
        board: initGame(DEFAULT_LEVEL),
        level: DEFAULT_LEVEL,
        totalFlags: 0,
        gameStatus: 'idle',
      };

      return { ...gameState };
    }),
  ),
);
