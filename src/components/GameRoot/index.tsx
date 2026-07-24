import { useEffect } from 'react';
import Game from '@/components/Game';
import { initTouchScreenListener } from '@/store/settings';
import type { GameSearchParams } from '@/components/Game/types';
import { useGameRouteInitializer } from '@/components/Game/hooks/useGameRouteInitializer';
import { getGameDebugMode } from '@/components/Game/utils/route';
import FpsDebugOverlay from '@/components/Game/components/FpsDebugOverlay';
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
  const debugMode = getGameDebugMode(searchParams);

  useEffect(() => {
    const cleanup = initTouchScreenListener();

    return cleanup;
  }, []);

  if (!isInitialized) {
    return null;
  }

  return (
    <>
      <Game shouldReplayTour={shouldReplayTour} />
      {debugMode ? <FpsDebugOverlay mode={debugMode} /> : null}
    </>
  );
}

export default GameRoot;
