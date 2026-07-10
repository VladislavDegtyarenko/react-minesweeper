import type { GameSnapshotV1 } from '@/store/game/snapshot/types';

export const getModeLabel = (mode: GameSnapshotV1['mode']) => {
  return mode === 'daily' ? 'Daily' : 'Classic';
};
