'use client';

import dynamic from 'next/dynamic';
import type { GameSearchParams } from '@/components/Game/types';

const App = dynamic(() => import('../../components/GameRoot'), {
  ssr: false,
  loading: () => (
    <p aria-busy="true" aria-label="Loading game">
      Loading game...
    </p>
  ),
});

type Props = {
  searchParams: GameSearchParams;
};

function GameClient({ searchParams }: Props) {
  return <App searchParams={searchParams} />;
}

export default GameClient;
