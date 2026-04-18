export { useGameStore } from './store';
export type {
  GameState,
  GameStatus,
  GameStatusBeforeLevelChange,
} from './types';

// Initialize subscriptions (side effect import)
import './subscriptions';
