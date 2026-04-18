import type { GameState } from './types';

export const selectMinesLeft = (state: GameState) =>
  state.board.totalMines - state.board.flagsPlaced;

export const selectGameStatus = (state: GameState) => state.gameStatus;
export const selectIsLevelChangeDialogOpen = (state: GameState) =>
  state.isLevelChangeDialogOpen;
export const selectGameStatusBeforeLevelChange = (state: GameState) =>
  state.gameStatusBeforeLevelChange;
export const selectIsGameIdle = (state: GameState) =>
  state.gameStatus === 'idle';
export const selectIsGamePlaying = (state: GameState) =>
  state.gameStatus === 'playing';
export const selectIsGamePaused = (state: GameState) =>
  state.gameStatus === 'paused';
export const selectIsGameWon = (state: GameState) => state.gameStatus === 'won';
export const selectIsGameLost = (state: GameState) =>
  state.gameStatus === 'lost';
