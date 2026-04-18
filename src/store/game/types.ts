import type { Level, LevelId } from '@/types';
import type { BoardState } from '@/utils/board/types';

export type GameStatus = 'idle' | 'playing' | 'paused' | 'won' | 'lost';
export type GameStatusBeforeLevelChange = Extract<
  GameStatus,
  'playing' | 'paused'
>;

export type GameState = {
  board: BoardState;
  level: Level;
  gameStatus: GameStatus;
  isLevelChangeDialogOpen: boolean;
  pendingLevelId: LevelId | null;
  gameStatusBeforeLevelChange: GameStatusBeforeLevelChange | null;
};
