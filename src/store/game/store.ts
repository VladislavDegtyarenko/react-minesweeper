import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { DEFAULT_LEVEL } from '@/constants';
import { withOptionalDevtools } from '@/store/devtools';
import { createBoardState } from '@/utils';
import { createGameState } from './utils';
import type { GameState } from './types';

export const useGameStore = create<GameState>()(
  subscribeWithSelector(
    withOptionalDevtools(
      () => {
        const gameState = createGameState(
          DEFAULT_LEVEL,
          createBoardState(DEFAULT_LEVEL),
        );

        return { ...gameState };
      },
      'game',
    ),
  ),
);
