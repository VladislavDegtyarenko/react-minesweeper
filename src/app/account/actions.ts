'use server';

import { revalidatePath } from 'next/cache';
import { clerkClient } from '@clerk/nextjs/server';
import ROUTES from '@/config/routes.json';
import { requireUserId } from '@/utils/auth';
import {
  deleteUserDailyAttempts,
  deleteUserScores,
} from '@/utils/db/queries';

export const deleteAccount = async (): Promise<void> => {
  const userId = await requireUserId();

  await deleteUserScores(userId);
  await deleteUserDailyAttempts(userId);

  const clerk = await clerkClient();
  await clerk.users.deleteUser(userId);

  revalidatePath(ROUTES.GAME);
  revalidatePath(ROUTES.LEADERBOARD);
  revalidatePath(ROUTES.ACCOUNT);
};
