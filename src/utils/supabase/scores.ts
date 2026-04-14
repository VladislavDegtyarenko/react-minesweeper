import { createEmptyBestTimes } from '@/store/stats/utils/guest';
import type { LevelId } from '@/types';
import type { BestScore, LeaderboardEntry } from '@/types/supabase';
import { getSupabaseBrowserClient } from './client';

export const fetchUserBestScores = async (
  userId: string,
): Promise<BestScore[]> => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('best_scores')
    .select('*')
    .eq('user_id', userId)
    .order('best_time_ms', { ascending: true });

  if (error) {
    throw error;
  }

  return data;
};

export const fetchUserBestTimesByLevel = async (userId: string) => {
  const scores = await fetchUserBestScores(userId);
  const bestTimes = createEmptyBestTimes();

  scores.forEach((score) => {
    bestTimes[score.level_id] = score.best_time_ms;
  });

  return bestTimes;
};

export const upsertBestScore = async (
  userId: string,
  levelId: LevelId,
  bestTimeMs: number,
) => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    throw new Error('Supabase is not configured.');
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('best_scores')
    .upsert(
      {
        achieved_at: now,
        best_time_ms: bestTimeMs,
        level_id: levelId,
        user_id: userId,
      },
      {
        onConflict: 'user_id,level_id',
      },
    )
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const fetchLeaderboardEntries = async () => {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    return [] as LeaderboardEntry[];
  }

  const { data, error } = await supabase
    .from('leaderboard_entries')
    .select('*')
    .order('best_time_ms', { ascending: true })
    .order('achieved_at', { ascending: true });

  if (error) {
    throw error;
  }

  return data;
};
