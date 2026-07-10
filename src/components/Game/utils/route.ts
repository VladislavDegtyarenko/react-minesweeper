import { LEVELS_CONFIG } from '@/config';
import type { GameMode } from '@/store/game/store';
import type { LevelId } from '@/types';
import type { GameSearchParams, ParsedGameRouteParams } from '../types';

const GAME_MODES = new Set<GameMode>(['free', 'daily']);
const LEVEL_IDS = new Set<LevelId>(LEVELS_CONFIG.map((level) => level.id));

const getSingleParam = (
  searchParams: GameSearchParams,
  key: string,
): string | undefined => {
  const value = searchParams[key];

  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

export const parseGameRouteParams = (
  searchParams: GameSearchParams,
): ParsedGameRouteParams => {
  const modeParam = getSingleParam(searchParams, 'mode');
  const levelParam = getSingleParam(searchParams, 'level');
  const tourParam = getSingleParam(searchParams, 'tour');
  const mode = GAME_MODES.has(modeParam as GameMode)
    ? (modeParam as GameMode)
    : undefined;
  const levelId = LEVEL_IDS.has(levelParam as LevelId)
    ? (levelParam as LevelId)
    : undefined;

  return {
    mode,
    levelId,
    shouldReplayTour: tourParam === '1',
    hasGameConfig: Boolean(mode || levelId),
  };
};
