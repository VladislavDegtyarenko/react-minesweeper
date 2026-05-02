'use client';

import { useClerk } from '@clerk/nextjs';
import ROUTES from '@/config/routes.json';
import { restoreGuestStatsState } from '@/store/stats/actions';

export const useAccountSessionActions = () => {
  const clerk = useClerk();

  const exitSession = async () => {
    restoreGuestStatsState();

    try {
      await clerk.signOut({ redirectUrl: ROUTES.GAME });
    } catch (error) {
      console.error('Failed to clear the client session:', error);
    }

    window.location.replace(ROUTES.GAME);
  };

  return {
    exitSession,
  };
};
