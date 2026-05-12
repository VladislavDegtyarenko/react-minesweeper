import type { LevelId } from '@/types';

export const LEVEL_IDS = ['easy', 'medium', 'expert'] as const satisfies ReadonlyArray<LevelId>;

export const DAILY_ATTEMPT_STATUSES = ['won', 'lost'] as const;
export type DailyAttemptStatus = (typeof DAILY_ATTEMPT_STATUSES)[number];
