import type { GameMode } from '../store';
import { localStorageGameModeProvider } from './localStorageProvider';
import type { GameModePreferenceProvider } from './types';

let activeProvider: GameModePreferenceProvider = localStorageGameModeProvider;

/**
 * Replace the active game-mode preference provider. Intended for the future
 * account-backed implementation: once the user signs in, swap in a provider
 * that reads/writes the preference from the database. Until then, the
 * default localStorage provider is used.
 */
export const setGameModePreferenceProvider = (
  provider: GameModePreferenceProvider,
): void => {
  activeProvider = provider;
};

export const loadPreferredGameMode = (): GameMode | null =>
  activeProvider.load();

export const savePreferredGameMode = (mode: GameMode): void => {
  activeProvider.save(mode);
};

export { localStorageGameModeProvider } from './localStorageProvider';
export type { GameModePreferenceProvider } from './types';
