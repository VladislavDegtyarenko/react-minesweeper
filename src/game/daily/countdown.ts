const MINUTES_PER_HOUR = 60;
const MS_PER_MINUTE = 60 * 1000;
const COUNTDOWN_PADDING = 2;

export const getMsUntilNextDailyKey = (date: Date = new Date()): number => {
  const nextResetMs = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate() + 1,
    0,
    0,
    0,
    0,
  );

  return Math.max(0, nextResetMs - date.getTime());
};

export const formatDailyResetCountdown = (msUntilReset: number): string => {
  const totalMinutes = Math.max(1, Math.ceil(msUntilReset / MS_PER_MINUTE));
  const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR);
  const minutes = totalMinutes % MINUTES_PER_HOUR;
  const hourLabel = String(hours).padStart(COUNTDOWN_PADDING, '0');
  const minuteLabel = String(minutes).padStart(COUNTDOWN_PADDING, '0');

  return `${hourLabel}:${minuteLabel}`;
};
