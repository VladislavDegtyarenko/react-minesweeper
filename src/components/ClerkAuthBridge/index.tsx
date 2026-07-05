'use client';

import { useAuth } from '@clerk/nextjs';
import { useEffect } from 'react';
import { setDailySignedIn } from '@/store/daily';
import { syncStatsWithUser } from '@/store/stats/actions';

const ClerkAuthBridge = () => {
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    void syncStatsWithUser(Boolean(isSignedIn));
    void setDailySignedIn(Boolean(isSignedIn));
  }, [isLoaded, isSignedIn]);

  return null;
};

export default ClerkAuthBridge;
