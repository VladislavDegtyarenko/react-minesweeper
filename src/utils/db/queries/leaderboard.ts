import 'server-only';

import { clerkClient } from '@clerk/nextjs/server';
import { and, asc, desc, eq, gte } from 'drizzle-orm';
import { getPublicUsername } from '@/utils/clerk';
import { computeStreaks } from '@/utils/daily';
import { db } from '../index';
import { bestScores, dailyAttempts } from '../schema';
import type {
  DailyLeaderboardEntry,
  DailyStreakLeaderboardEntry,
  LeaderboardEntry,
} from '../types';

const CLERK_USER_LIST_BATCH_SIZE = 500;
const STREAK_LEADERBOARD_HISTORY_DAYS = 365;

type PublicUser = {
  username: string;
  imageUrl: string | null;
};

const subtractDaysUtc = (dailyKey: string, days: number): string => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dailyKey);

  if (!match) {
    return dailyKey;
  }

  const [, year, month, day] = match;
  const utcMs = Date.UTC(Number(year), Number(month) - 1, Number(day));
  const target = new Date(utcMs - days * 24 * 60 * 60 * 1000);
  const yyyy = target.getUTCFullYear();
  const mm = String(target.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(target.getUTCDate()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd}`;
};

const getPublicUsersById = async (
  userIds: string[],
): Promise<Map<string, PublicUser>> => {
  const uniqueUserIds = Array.from(new Set(userIds));
  const userMap = new Map<string, PublicUser>();

  if (uniqueUserIds.length === 0) {
    return userMap;
  }

  const clerk = await clerkClient();

  for (
    let i = 0;
    i < uniqueUserIds.length;
    i += CLERK_USER_LIST_BATCH_SIZE
  ) {
    const batch = uniqueUserIds.slice(i, i + CLERK_USER_LIST_BATCH_SIZE);
    const response = await clerk.users.getUserList({
      userId: batch,
      limit: batch.length,
    });

    for (const user of response.data) {
      const username = getPublicUsername(user.username);

      if (!username) {
        continue;
      }

      userMap.set(user.id, {
        username,
        imageUrl: user.imageUrl ?? null,
      });
    }
  }

  return userMap;
};

export const getLeaderboardEntries = async (): Promise<LeaderboardEntry[]> => {
  const rows = await db
    .select()
    .from(bestScores)
    .orderBy(asc(bestScores.bestTimeMs), asc(bestScores.achievedAt));

  const userMap = await getPublicUsersById(rows.map((row) => row.userId));

  return rows.flatMap((row) => {
    const user = userMap.get(row.userId);

    if (!user) {
      return [];
    }

    return [
      {
        ...row,
        username: user.username,
        imageUrl: user.imageUrl,
      },
    ];
  });
};

export const getDailyLeaderboardEntries = async (
  dailyKey: string,
): Promise<DailyLeaderboardEntry[]> => {
  const rows = await db
    .select()
    .from(dailyAttempts)
    .where(
      and(
        eq(dailyAttempts.dailyKey, dailyKey),
        eq(dailyAttempts.status, 'won'),
      ),
    )
    .orderBy(asc(dailyAttempts.elapsedMs), asc(dailyAttempts.createdAt));

  const userMap = await getPublicUsersById(rows.map((row) => row.userId));

  return rows.flatMap((row) => {
    const user = userMap.get(row.userId);

    if (!user) {
      return [];
    }

    return [
      {
        ...row,
        username: user.username,
        imageUrl: user.imageUrl,
      },
    ];
  });
};

export const getDailyStreakLeaderboardEntries = async (
  todayKey: string,
  limit = 10,
): Promise<DailyStreakLeaderboardEntry[]> => {
  const sinceDailyKey = subtractDaysUtc(
    todayKey,
    STREAK_LEADERBOARD_HISTORY_DAYS,
  );
  const rows = await db
    .select({
      userId: dailyAttempts.userId,
      dailyKey: dailyAttempts.dailyKey,
    })
    .from(dailyAttempts)
    .where(
      and(
        eq(dailyAttempts.status, 'won'),
        gte(dailyAttempts.dailyKey, sinceDailyKey),
      ),
    )
    .orderBy(desc(dailyAttempts.dailyKey));

  const winsByUser = new Map<string, { dailyKey: string }[]>();

  for (const row of rows) {
    const wins = winsByUser.get(row.userId) ?? [];
    wins.push({ dailyKey: row.dailyKey });
    winsByUser.set(row.userId, wins);
  }

  const summaries = Array.from(winsByUser.entries())
    .map(([userId, wins]) => ({
      userId,
      ...computeStreaks(wins, todayKey),
    }))
    .filter((entry) => entry.currentStreak > 0);

  const userMap = await getPublicUsersById(
    summaries.map((summary) => summary.userId),
  );

  return summaries
    .flatMap((summary) => {
      const user = userMap.get(summary.userId);

      if (!user) {
        return [];
      }

      return [
        {
          ...summary,
          username: user.username,
          imageUrl: user.imageUrl,
        },
      ];
    })
    .sort((first, second) => {
      if (second.currentStreak !== first.currentStreak) {
        return second.currentStreak - first.currentStreak;
      }

      if (second.bestStreak !== first.bestStreak) {
        return second.bestStreak - first.bestStreak;
      }

      const lastWinCompare = (second.lastWinKey ?? '').localeCompare(
        first.lastWinKey ?? '',
      );

      if (lastWinCompare !== 0) {
        return lastWinCompare;
      }

      return first.username.localeCompare(second.username);
    })
    .slice(0, limit);
};
