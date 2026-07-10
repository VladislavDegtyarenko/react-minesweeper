import { LOCAL_STORAGE_KEYS } from '@/config';
import { localStorageService } from '@/utils';
import type { GameMode } from '../store';
import type { GameModePreferenceProvider } from './types';

const VALID_MODES: ReadonlySet<GameMode> = new Set(['free', 'daily']);

const isGameMode = (value: unknown): value is GameMode =>
  typeof value === 'string' && VALID_MODES.has(value as GameMode);

export const localStorageGameModeProvider: GameModePreferenceProvider = {
  load: () => {
    const stored = localStorageService.get<GameMode>(
      LOCAL_STORAGE_KEYS.gameMode,
    );

    return isGameMode(stored) ? stored : null;
  },

  save: (mode) => {
    localStorageService.set(LOCAL_STORAGE_KEYS.gameMode, mode);
  },
};
