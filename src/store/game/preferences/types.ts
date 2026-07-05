import type { GameMode } from '../store';

/**
 * Pluggable persistence layer for the player's preferred game mode.
 *
 * The default provider stores the preference in `localStorage` (see
 * `localStorageProvider.ts`). When the app gains an account-backed
 * preferences API, a new provider can be implemented and installed via
 * `setGameModePreferenceProvider` without touching the store wiring.
 */
export type GameModePreferenceProvider = {
  load: () => GameMode | null;
  save: (mode: GameMode) => void;
};
