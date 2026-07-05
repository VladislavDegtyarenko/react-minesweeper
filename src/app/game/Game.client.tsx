'use client';

import dynamic from 'next/dynamic';
import type { GameSearchParams } from '@/components/Game/types';

const App = dynamic(() => import('../../components/Game'), { ssr: false });

type Props = {
  searchParams: GameSearchParams;
};

function GameClient({ searchParams }: Props) {
  return <App searchParams={searchParams} />;
}

export default GameClient;
