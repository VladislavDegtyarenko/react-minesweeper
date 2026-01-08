import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { initGame } from "@/utils";

// Constants
import { startNewGame } from "./actions";
import { DEFAULT_LEVEL } from "@/constants";
import { selectIsGameEnded } from "./selectors";
import { stopTimer } from "../timer/actions";
import type { TBoard, Level } from "@/types";

export type GameState = {
  board: TBoard;
  level: Level;
  totalFlags: number;
  isGameWin: boolean;
  isGameOver: boolean;
};

export const useGameStore = create<GameState>()(
  subscribeWithSelector(
    devtools(() => {
      const gameState = {
        board: initGame(DEFAULT_LEVEL),
        level: DEFAULT_LEVEL,
        totalFlags: 0,
        isGameWin: false,
        isGameOver: false,
      };

      return { ...gameState };
    })
  )
);

// Subscribers
useGameStore.subscribe(selectIsGameEnded, (isGameEnded) => {
  if (isGameEnded) {
    stopTimer();
  }
});

useGameStore.subscribe(
  (state) => state.level,
  () => {
    startNewGame();
  }
);
