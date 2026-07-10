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

    const nextUrl = `${ROUTES.GAME}?mode=${mode}&level=${levelId}`;
    const currentUrl = `${window.location.pathname}${window.location.search}`;

    if (currentUrl === nextUrl) {
      return;
    }

    window.history.replaceState(null, '', nextUrl);
  }, [levelId, mode]);
};
