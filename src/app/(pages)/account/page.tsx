import type { Metadata } from 'next';
import AccountPage from '@/components/AccountPage';
import ROUTES from '@/config/routes.json';
import { requireUserId } from '@/utils/auth';
import { getDailyKey } from '@/utils/daily';
import {
  getMyDailyStreakSummary,
  getUserBestScores,
  getUserDailyAttempts,
} from '@/utils/db/queries';
import { generateMetadata as buildMetadata } from '@/utils/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Account',
  description: 'Manage your Minesweeper profile and view your best scores.',
  path: ROUTES.ACCOUNT,
  noIndex: true,
});

export const dynamic = 'force-dynamic';

export default async function AccountRoutePage() {
  const userId = await requireUserId();
  const todayKey = getDailyKey();
  const [scores, dailyAttempts, dailyStreak] = await Promise.all([
    getUserBestScores(userId),
    getUserDailyAttempts(userId),
    getMyDailyStreakSummary(userId, todayKey),
  ]);

  return (
    <AccountPage
      dailyAttempts={dailyAttempts}
      dailyStreak={dailyStreak}
      scores={scores}
      todayKey={todayKey}
    />
  );
}
