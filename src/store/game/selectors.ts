import type { GameState } from "./index";

export const selectMinesLeft = (state: GameState) =>
  state.level.totalMines - state.totalFlags;

export const selectIsGameEnded = (state: GameState) =>
  state.isGameWin || state.isGameOver;
