import GameClient from './Game.client';
import {
  generateGameJsonLd,
  generateMetadata as buildMetadata,
} from '@/utils/seo';
import ROUTES from '@/config/routes.json';
import type { GameSearchParams } from '@/components/Game/types';

export const metadata = buildMetadata({
  title: 'Play',
  description:
    'Play Minesweeper in Classic or Daily Challenge mode with Easy, Medium, and Expert difficulties.',
  path: ROUTES.GAME,
});

type Props = {
  searchParams: Promise<GameSearchParams>;
};

export default async function GamePage(props: Props) {
  const searchParams = (await props.searchParams) ?? {};

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: generateGameJsonLd() }}
      />
      <GameClient searchParams={searchParams} />
    </>
  );
}
