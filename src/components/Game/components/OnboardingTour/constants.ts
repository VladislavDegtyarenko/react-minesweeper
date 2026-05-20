import type { TourStepId } from './types';

export const TOUR_STEP_IDS: TourStepId[] = [
  'open-cell',
  'read-number',
  'place-flag',
  'win-condition',
  'settings',
];

export const TOUR_STEP_COUNT = TOUR_STEP_IDS.length;

export const TOUR_TARGET_IDS = {
  BOARD: 'board',
  FLAG_CONTROLS: 'flag-controls',
  SETTINGS_TRIGGER: 'settings-trigger',
  WIN_STATUS: 'win-status',
} as const;

export const TOUR_CARD_ESTIMATED_HEIGHT = 260;

export const TOUR_STEP_ADVANCE_DELAY_MS = 500;

export const TOUR_VIEWPORT_MARGIN = 16;
