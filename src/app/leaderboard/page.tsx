import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import LeaderboardPage from '@/components/LeaderboardPage';
import ROUTES from '@/config/routes.json';
import { getDailyKey } from '@/utils/daily';
import {
  getDailyLeaderboardEntries,
  getDailyStreakLeaderboardEntries,
  getLeaderboardEntries,
} from '@/utils/db/queries';
import { generateMetadata as buildMetadata } from '@/utils/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Leaderboard',
  description:
    'See the fastest Minesweeper completion times across Easy, Medium, and Expert difficulties.',
  path: ROUTES.LEADERBOARD,
});

export const dynamic = 'force-dynamic';

type LeaderboardSearchParams = {
  view?: string | string[];
};

type LeaderboardRoutePageProps = {
  searchParams?: Promise<LeaderboardSearchParams>;
};

const getActiveView = (view?: string | string[]) => {
  const value = Array.isArray(view) ? view[0] : view;

  return value === 'daily' ? 'daily' : 'free';
};

export default async function LeaderboardRoutePage({
  searchParams,
}: LeaderboardRoutePageProps) {
  const { userId } = await auth();
  const params = searchParams ? await searchParams : {};
  const activeView = getActiveView(params.view);
  const todayKey = getDailyKey();
  const [entries, dailyEntries, dailyStreakEntries] = await Promise.all([
    getLeaderboardEntries(),
    getDailyLeaderboardEntries(todayKey),
    getDailyStreakLeaderboardEntries(todayKey),
  ]);

  return (
    <LeaderboardPage
      activeView={activeView}
      currentUserId={userId}
      dailyEntries={dailyEntries}
      dailyStreakEntries={dailyStreakEntries}
      entries={entries}
      todayKey={todayKey}
    />
  );
}
