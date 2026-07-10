import { useEffect } from 'react';
import Game from '@/components/Game';
import { initTouchScreenListener } from '@/store/settings';
import type { GameSearchParams } from '@/components/Game/types';
import { useGameRouteInitializer } from '@/components/Game/hooks/useGameRouteInitializer';
// Initialize stats store subscriptions on app startup.
import '@/store/stats';
// Initialize daily store subscriptions on app startup.
import '@/store/daily';

type Props = {
  searchParams?: GameSearchParams;
};

function GameRoot({ searchParams = {} }: Props) {
  const { isInitialized, shouldReplayTour } =
    useGameRouteInitializer(searchParams);

  useEffect(() => {
    const cleanup = initTouchScreenListener();

    return cleanup;
  }, []);

  if (!isInitialized) {
    return null;
  }

  return <Game shouldReplayTour={shouldReplayTour} />;
}

export default GameRoot;
