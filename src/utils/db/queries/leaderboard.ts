import 'server-only';

import { clerkClient } from '@clerk/nextjs/server';
import { asc } from 'drizzle-orm';
import { db } from '../index';
import { bestScores } from '../schema';
import type { LeaderboardEntry } from '../types';

const FALLBACK_USERNAME = 'Player';

export const getLeaderboardEntries = async (): Promise<LeaderboardEntry[]> => {
  const rows = await db
    .select()
    .from(bestScores)
    .orderBy(asc(bestScores.bestTimeMs), asc(bestScores.achievedAt));

  const userIds = Array.from(new Set(rows.map((row) => row.userId)));

  if (userIds.length === 0) {
    return [];
  }

  const clerk = await clerkClient();
  const response = await clerk.users.getUserList({
    userId: userIds,
    limit: Math.min(userIds.length, 500),
  });

  const userMap = new Map<string, { username: string; imageUrl: string | null }>();

  for (const user of response.data) {
    userMap.set(user.id, {
      username: user.username ?? FALLBACK_USERNAME,
      imageUrl: user.imageUrl ?? null,
    });
  }

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
