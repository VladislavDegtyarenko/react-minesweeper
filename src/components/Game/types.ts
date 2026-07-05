import type { GameMode } from '@/store/game/store';
import type { LevelId } from '@/types';

export type GameSearchParams = Record<string, string | string[] | undefined>;

export type ParsedGameRouteParams = {
  mode?: GameMode;
  levelId?: LevelId;
  shouldReplayTour: boolean;
  hasGameConfig: boolean;
};
