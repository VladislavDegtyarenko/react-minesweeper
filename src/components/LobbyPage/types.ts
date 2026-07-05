import type { GameMode } from '@/store/game/store';
import type { LevelId } from '@/types';

export type IntroMode = GameMode;

export type IntroModeOption = {
  value: IntroMode;
  label: string;
  eyebrow: string;
  description: string;
  badge?: string;
};

export type IntroLevelDetails = {
  description: string;
  pace: string;
  badge?: string;
};

export type PreviewBoardConfig = {
  seed: number;
  openedSafeCells: number;
  flags: number;
};
