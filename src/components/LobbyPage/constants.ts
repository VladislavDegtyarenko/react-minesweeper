import type { LevelId } from '@/types';
import type {
  IntroLevelDetails,
  IntroMode,
  IntroModeOption,
  PreviewBoardConfig,
} from './types';

export const DEFAULT_MODE: IntroMode = 'free';

export const DEFAULT_LEVEL_ID: LevelId = 'medium';

export const MODE_OPTIONS: IntroModeOption[] = [
  {
    value: 'free',
    label: 'Classic',
    eyebrow: 'Free play',
    description: 'Standard minesweeper',
  },
  {
    value: 'daily',
    label: 'Daily',
    eyebrow: 'Challenge',
    description: 'One challenge per day',
    badge: 'New',
  },
];

export const LEVEL_DETAILS: Record<LevelId, IntroLevelDetails> = {
  easy: {
    description: 'A compact board for a clean first run.',
    pace: 'Fast',
  },
  medium: {
    description: 'More space, more logic, and a steady rhythm.',
    pace: 'Balanced',
    badge: 'Recommended',
  },
  expert: {
    description: 'A wide board for deliberate, high-risk clears.',
    pace: 'Demanding',
  },
};

export const PREVIEW_BOARDS: Record<LevelId, PreviewBoardConfig> = {
  easy: {
    seed: 9137,
    openedSafeCells: 20,
    flags: 3,
  },
  medium: {
    seed: 42791,
    openedSafeCells: 48,
    flags: 6,
  },
  expert: {
    seed: 76523,
    openedSafeCells: 224,
    flags: 36,
  },
};
