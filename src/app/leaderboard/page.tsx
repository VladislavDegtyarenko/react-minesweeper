import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import LeaderboardPage from '@/components/LeaderboardPage';
import ROUTES from '@/config/routes.json';
import { getLeaderboardEntries } from '@/utils/db/queries';
import { generateMetadata as buildMetadata } from '@/utils/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Leaderboard',
  description:
    'See the fastest Minesweeper completion times across Easy, Medium, and Expert difficulties.',
  path: ROUTES.LEADERBOARD,
});

export const dynamic = 'force-dynamic';

export default async function LeaderboardRoutePage() {
  const { userId } = await auth();
  const entries = await getLeaderboardEntries();

  return <LeaderboardPage currentUserId={userId} entries={entries} />;
}
