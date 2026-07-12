'use client';

import { useRouter } from 'next/navigation';
import { ROUTES } from '@/config/routes';
import { initSFX } from '@/store/sfx/actions';
import { clearSnapshot as clearSnapshotFromLocalStorage } from '@/store/game/snapshot';
import { createCx } from '@/utils';
import ContinueBanner from './components/ContinueBanner';
import LobbyLoadingState from './components/LobbyLoadingState';
import { useResumableSnapshot } from './hooks/useResumableSnapshot';
import styles from './styles.module.scss';
import LobbyHeader from './components/LobbyHeader';
import LobbyNewGameSection from './components/LobbyNewGameSection';

const cx = createCx(styles);

type Props = {
  shouldShowSetup?: boolean;
};

const LobbyPage = ({ shouldShowSetup = false }: Props) => {
  const router = useRouter();
  const {
    isLoaded: isSnapshotLoaded,
    snapshot,
    clearSnapshot,
  } = useResumableSnapshot();

  const shouldShowLobbyLoading = !isSnapshotLoaded;
  const shouldShowSavedGame = !!(
    isSnapshotLoaded &&
    snapshot &&
    !shouldShowSetup
  );

  const handleContinue = () => {
    initSFX();
    router.push(ROUTES.GAME);
  };

  const handleStartNew = () => {
    clearSnapshotFromLocalStorage();
    clearSnapshot();
  };

  return (
    <main className={cx('screen')}>
      <section className={cx('panel')} aria-labelledby="intro-title">
        <LobbyHeader
          title="Choose your game"
          subtitle="Pick a mode and difficulty to start your Minesweeper challenge."
        />

        {shouldShowLobbyLoading ? (
          <LobbyLoadingState />
        ) : shouldShowSavedGame ? (
          <ContinueBanner
            snapshot={snapshot}
            onContinue={handleContinue}
            onStartNew={handleStartNew}
          />
        ) : (
          <LobbyNewGameSection onStartNew={handleStartNew} />
        )}
      </section>
    </main>
  );
};

export default LobbyPage;
