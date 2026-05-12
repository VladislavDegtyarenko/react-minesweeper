import {
  formatDailyResetCountdown,
  getMsUntilNextDailyKey,
} from '@/utils/daily';
import { useEffect, useState } from 'react';

const DAILY_COUNTDOWN_REFRESH_MS = 60_000;
const getCountdownLabel = () => {
  return formatDailyResetCountdown(getMsUntilNextDailyKey());
};

export const useDailyResetCountdown = (isEnabled: boolean) => {
  const [countdown, setCountdown] = useState(getCountdownLabel);

  useEffect(() => {
    if (!isEnabled) {
      return undefined;
    }

    setCountdown(getCountdownLabel());
    const intervalId = window.setInterval(() => {
      setCountdown(getCountdownLabel());
    }, DAILY_COUNTDOWN_REFRESH_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isEnabled]);

  return countdown;
};
