import { useEffect } from 'react';
import { useGameStore } from '@/store/game';
import { selectGameMode } from '@/store/game/selectors';
import { ROUTES } from '@/config/routes';

export const useSyncGameRouteParams = () => {
  const mode = useGameStore(selectGameMode);
  const levelId = useGameStore((state) => state.level.id);

  useEffect(() => {
    if (window.location.pathname !== ROUTES.GAME) {
      return;
    }

    const currentParams = new URLSearchParams(window.location.search);
    const nextParams = new URLSearchParams({
      mode,
      level: levelId,
    });
    const debugParam = currentParams.get('debug');

    if (debugParam) {
      nextParams.set('debug', debugParam);
    }

    const nextUrl = `${ROUTES.GAME}?${nextParams.toString()}`;
    const currentUrl = `${window.location.pathname}${window.location.search}`;

    if (currentUrl === nextUrl) {
      return;
    }

    window.history.replaceState(null, '', nextUrl);
  }, [levelId, mode]);
};
