export const BOARD_CANVAS_MAX_DPR = 2;
export const BOARD_CANVAS_MAX_BACKING_EDGE = 4096;
export const BOARD_CANVAS_MAX_BACKING_PIXELS = 8_388_608;
export const BOARD_HOVER_TWEEN_DURATION_MS = 120;
export const BOARD_INTERACTION_DIRTY_BLEED_PX = 32;
export const BOARD_INTERACTION_DIRTY_MAX_AREA_RATIO = 0.5;
export const BOARD_PRESS_TWEEN_DURATION_MS = 80;
export const BOARD_TWEEN_EPSILON = 0.0001;
// Match the legacy board padding so the bitmap can carry edge shadows without
// changing the board's intrinsic layout footprint on narrow viewports.
export const BOARD_CANVAS_DESKTOP_BLEED_PX = 16;
export const BOARD_CANVAS_MOBILE_BLEED_PX = 10;
export const CELL_ACTIVE_SCALE = 0.96;
export const CELL_IMAGE_SIZE_RATIO = 0.68;
export const CELL_NUMBER_BASELINE_OFFSET_RATIO = 0.03;
export const CELL_NUMBER_SIZE_RATIO = 0.58;
export const CELL_RADIUS_RATIO = 0.15;
export const MARKER_ANIMATION_DISTANCE_PX = 50;
export const MARKER_ANIMATION_DURATION_MS = 150;
export const BOARD_RESULT_HIGHLIGHT_TWEEN_DURATION_MS = 120;

export const BOARD_CANVAS_ASSET_PATHS = {
  bomb: '/themes/blue-graphite/icons/Bomb.png',
  cross: '/icons/cross.svg',
  flag: '/themes/blue-graphite/icons/Flag.svg',
  question: '/themes/blue-graphite/icons/Question.png',
} as const;
