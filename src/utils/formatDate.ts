const DATE_FORMATTER = new Intl.DateTimeFormat('en', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const DAILY_KEY_FORMATTER = new Intl.DateTimeFormat('en', {
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
  year: 'numeric',
});

export const formatDate = (date: Date) => {
  return DATE_FORMATTER.format(date);
};

/**
 * Formats a UTC daily key (YYYY-MM-DD) into a friendly display string.
 */
export const formatDailyKey = (dailyKey: string): string => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dailyKey);

  if (!match) {
    return dailyKey;
  }

  const [, year, month, day] = match;
  const date = new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day)),
  );

  return DAILY_KEY_FORMATTER.format(date);
};
