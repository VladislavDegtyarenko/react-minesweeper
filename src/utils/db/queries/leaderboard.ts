import 'server-only';

import { clerkClient } from '@clerk/nextjs/server';
import { asc } from 'drizzle-orm';
import { getPublicUsername } from '@/utils/clerk';
import { db } from '../index';
import { bestScores } from '../schema';
import type { LeaderboardEntry } from '../types';

const CLERK_USER_LIST_BATCH_SIZE = 500;

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
  const userMap = new Map<string, { username: string; imageUrl: string | null }>();

  for (let i = 0; i < userIds.length; i += CLERK_USER_LIST_BATCH_SIZE) {
    const batch = userIds.slice(i, i + CLERK_USER_LIST_BATCH_SIZE);
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
