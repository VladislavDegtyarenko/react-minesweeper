import { useEffect, useRef, useState } from 'react';
import {
  resumeFromSnapshot,
  startConfiguredGame,
} from '@/store/game/actions';
import { useGameStore } from '@/store/game';
import { clearSnapshot, readSnapshot, snapshotMatches } from '@/store/game/snapshot';
import type { GameSearchParams } from '../types';
import { parseGameRouteParams } from '../utils/route';

export const useGameRouteInitializer = (searchParams: GameSearchParams) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [shouldReplayTour, setShouldReplayTour] = useState(false);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (hasInitializedRef.current) {
      return;
    }

    hasInitializedRef.current = true;

    const routeParams = parseGameRouteParams(searchParams);
    const snapshot = readSnapshot();

    setShouldReplayTour(routeParams.shouldReplayTour);

    if (routeParams.hasGameConfig) {
      if (snapshot && snapshotMatches(snapshot, routeParams)) {
        resumeFromSnapshot(snapshot);
        setIsInitialized(true);

        return;
      }

      clearSnapshot();
      startConfiguredGame(
        routeParams.mode ?? useGameStore.getState().mode,
        routeParams.levelId,
      );
      setIsInitialized(true);

      return;
    }

    if (snapshot) {
      resumeFromSnapshot(snapshot);
    }

    setIsInitialized(true);
  }, [searchParams]);

  return {
    isInitialized,
    shouldReplayTour,
  };
};
