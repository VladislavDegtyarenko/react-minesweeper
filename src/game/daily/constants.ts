/**
 * Bumping this invalidates all cached daily boards across clients —
 * everyone with the same UTC date and difficulty gets a fresh deterministic
 * board after a bump. Treat as an append-only seed namespace.
 */
export const DAILY_SEED_VERSION = 1;

/**
 * Clamp values for daily attempt elapsed time. The lower bound rejects
 * obviously tampered submissions; the upper bound caps absurd values
 * before they hit the database.
 */
export const DAILY_MIN_ELAPSED_MS = 500;
export const DAILY_MAX_ELAPSED_MS = 60 * 60 * 1000;

export const DAILY_HISTORY_VERSION = 1;
export const DAILY_HISTORY_MAX_ENTRIES = 365;

export const DAILY_ATTEMPT_STATUSES = ['won', 'lost'] as const;
export type DailyAttemptStatus = (typeof DAILY_ATTEMPT_STATUSES)[number];
