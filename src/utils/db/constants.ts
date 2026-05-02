import type { LevelId } from '@/types';

export const LEVEL_IDS = ['easy', 'medium', 'expert'] as const satisfies ReadonlyArray<LevelId>;
