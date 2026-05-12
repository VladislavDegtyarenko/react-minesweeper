import { LOCAL_STORAGE_KEYS } from '@/constants';
import type { LevelId } from '@/types';
import { localStorageService } from '@/utils';
import {
  DAILY_HISTORY_MAX_ENTRIES,
  DAILY_HISTORY_VERSION,
} from '@/utils/daily';
import {
  DAILY_ATTEMPT_STATUSES,
  LEVEL_IDS,
  type DailyAttemptStatus,
} from '@/utils/db/constants';
import type { DailyHistoryByKey, DailyHistoryEntry } from '../types';

const VALID_LEVEL_IDS = new Set<string>(LEVEL_IDS);
const VALID_STATUSES = new Set<string>(DAILY_ATTEMPT_STATUSES);

type StoredDailyHistory = {
  version: number;
  entries: DailyHistoryByKey;
};

const isLevelId = (value: unknown): value is LevelId =>
  typeof value === 'string' && VALID_LEVEL_IDS.has(value);

const isStatus = (value: unknown): value is DailyAttemptStatus =>
  typeof value === 'string' && VALID_STATUSES.has(value);

const isEntry = (value: unknown): value is DailyHistoryEntry => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const entry = value as Partial<DailyHistoryEntry>;

  return (
    typeof entry.dailyKey === 'string' &&
    isLevelId(entry.levelId) &&
    typeof entry.seedVersion === 'number' &&
    isStatus(entry.status) &&
    typeof entry.elapsedMs === 'number' &&
    Number.isFinite(entry.elapsedMs) &&
    typeof entry.recordedAt === 'number'
  );
};

export const buildEntryKey = (dailyKey: string, levelId: LevelId) =>
  `${dailyKey}::${levelId}`;

export const createEmptyDailyHistory = (): DailyHistoryByKey => ({});

export const loadGuestDailyHistory = (): DailyHistoryByKey => {
  const stored =
    localStorageService.get<StoredDailyHistory | null>(
      LOCAL_STORAGE_KEYS.dailyHistory,
    ) ?? null;

  if (!stored || typeof stored !== 'object' || stored.version !== DAILY_HISTORY_VERSION) {
    return createEmptyDailyHistory();
  }

  const result: DailyHistoryByKey = {};

  for (const [key, value] of Object.entries(stored.entries ?? {})) {
    if (isEntry(value)) {
      result[key] = value;
    }
  }

  return result;
};

const trimToMaxEntries = (history: DailyHistoryByKey): DailyHistoryByKey => {
  const entries = Object.entries(history);

  if (entries.length <= DAILY_HISTORY_MAX_ENTRIES) {
    return history;
  }

  const sorted = entries.sort(
    ([, a], [, b]) => b.recordedAt - a.recordedAt,
  );

  return Object.fromEntries(sorted.slice(0, DAILY_HISTORY_MAX_ENTRIES));
};

export const persistGuestDailyHistory = (history: DailyHistoryByKey): void => {
  const trimmed = trimToMaxEntries(history);
  const payload: StoredDailyHistory = {
    version: DAILY_HISTORY_VERSION,
    entries: trimmed,
  };
  localStorageService.set(LOCAL_STORAGE_KEYS.dailyHistory, payload);
};

export const upsertEntry = (
  history: DailyHistoryByKey,
  entry: DailyHistoryEntry,
): DailyHistoryByKey => {
  const key = buildEntryKey(entry.dailyKey, entry.levelId);
  const existing = history[key];

  // First-write-wins: an existing recorded entry is preserved so that
  // retries / replays don't overwrite the original attempt outcome.
  if (existing) {
    return history;
  }

  return { ...history, [key]: entry };
};
