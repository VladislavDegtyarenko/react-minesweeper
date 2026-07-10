import { useEffect, useState } from 'react';
import { readSnapshot } from '@/store/game/snapshot';
import type { GameSnapshotV1 } from '@/store/game/snapshot/types';

type ResumableSnapshotState = {
  isLoaded: boolean;
  snapshot: GameSnapshotV1 | null;
};

const INITIAL_RESUMABLE_SNAPSHOT_STATE: ResumableSnapshotState = {
  isLoaded: false,
  snapshot: null,
};

export const useResumableSnapshot = () => {
  const [state, setState] = useState<ResumableSnapshotState>(
    INITIAL_RESUMABLE_SNAPSHOT_STATE,
  );

  const clearSnapshot = () => {
    setState({
      isLoaded: true,
      snapshot: null,
    });
  };

  useEffect(() => {
    setState({
      isLoaded: true,
      snapshot: readSnapshot(),
    });
  }, []);

  return { ...state, clearSnapshot };
};
