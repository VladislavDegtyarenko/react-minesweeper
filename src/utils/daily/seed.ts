import type { LevelId } from '@/types';
import { DAILY_SEED_VERSION } from './constants';

const UTC_DATE_PADDING = 2;

const padUtc = (value: number) => String(value).padStart(UTC_DATE_PADDING, '0');

export const getDailyKey = (date: Date = new Date()): string => {
  const year = date.getUTCFullYear();
  const month = padUtc(date.getUTCMonth() + 1);
  const day = padUtc(date.getUTCDate());

  return `${year}-${month}-${day}`;
};

/**
 * 32-bit FNV-1a — small, fast, well-distributed enough to seed mulberry32.
 */
const fnv1a = (input: string): number => {
  let hash = 0x811c9dc5;

  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }

  return hash >>> 0;
};

export const getDailySeed = (
  dailyKey: string,
  levelId: LevelId,
  seedVersion: number = DAILY_SEED_VERSION,
): number => {
  return fnv1a(`v${seedVersion}|${dailyKey}|${levelId}`);
};

export type SeededRandom = () => number;

/**
 * mulberry32 — tiny, deterministic PRNG. Same seed produces the same sequence
 * across browsers, which is what we need so every player sees the same daily
 * board for a given date + level + seed version.
 */
export const createSeededRandom = (seed: number): SeededRandom => {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
