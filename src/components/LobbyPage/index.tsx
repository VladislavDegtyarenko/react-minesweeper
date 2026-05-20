'use client';

import { PlayIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import { LEVELS_CONFIG } from '@/constants';
import ROUTES from '@/config/routes.json';
import { initSFX } from '@/store/sfx/actions';
import { clearSnapshot } from '@/store/game/snapshot';
import type { LevelId } from '@/types';
import { createCx } from '@/utils';
import { DEFAULT_LEVEL_ID, DEFAULT_MODE, MODE_OPTIONS } from './constants';
import ContinueBanner from './components/ContinueBanner';
import LevelCard from './components/LevelCard';
import LobbyLoadingState from './components/LobbyLoadingState';
import ModeSelector from './components/ModeSelector';
import SetupLabel from './components/SetupLabel';
import { useResumableSnapshot } from './hooks/useResumableSnapshot';
import type { IntroMode } from './types';
import styles from './styles.module.scss';

const cx = createCx(styles);
const DIFFICULTY_LABEL_ID = 'intro-difficulty-label';

const LobbyPage = () => {
  const router = useRouter();
  const { isLoaded: isSnapshotLoaded, snapshot } = useResumableSnapshot();
  const [selectedMode, setSelectedMode] = useState<IntroMode | null>(
    DEFAULT_MODE,
  );
  const [selectedLevelId, setSelectedLevelId] = useState<LevelId | null>(
    DEFAULT_LEVEL_ID,
  );
  const [isStartingFresh, setIsStartingFresh] = useState(false);
  const shouldShowLobbyLoading = !isSnapshotLoaded && !isStartingFresh;
  const shouldShowSavedGame = Boolean(
    isSnapshotLoaded && snapshot && !isStartingFresh,
  );
  const selectedLevelIdCapitalized = selectedLevelId
    ? selectedLevelId.charAt(0).toUpperCase() + selectedLevelId.slice(1)
    : null;
  const canStart = Boolean(selectedMode && selectedLevelId);
  const selectedModeLabel = selectedMode
    ? MODE_OPTIONS.find((mode) => mode.value === selectedMode)?.label
    : null;
  const handleStart = () => {
    if (selectedMode && selectedLevelId) {
      initSFX();
      clearSnapshot();
      router.push(
        `${ROUTES.GAME}?mode=${selectedMode}&level=${selectedLevelId}`,
      );
    }
  };

  const handleContinue = () => {
    initSFX();
    router.push(ROUTES.GAME);
  };

  const handleStartNew = () => {
    clearSnapshot();
    setIsStartingFresh(true);
  };

  return (
    <main className={cx('screen')}>
      <section className={cx('panel')} aria-labelledby="intro-title">
        <header className={cx('header')}>
          <div>
            <h1 id="intro-title">
              {shouldShowLobbyLoading
                ? 'Loading your game'
                : shouldShowSavedGame
                  ? 'Continue your game'
                  : 'Choose your game'}
            </h1>
            <p className={cx('subtitle')}>
              {shouldShowLobbyLoading
                ? 'Checking this device for a saved board.'
                : shouldShowSavedGame
                  ? 'Your last board is waiting.'
                  : 'Pick a mode and difficulty to start your Minesweeper challenge.'}
            </p>
          </div>
        </header>

        {shouldShowLobbyLoading ? (
          <LobbyLoadingState />
        ) : shouldShowSavedGame && snapshot ? (
          <ContinueBanner
            snapshot={snapshot}
            onContinue={handleContinue}
            onStartNew={handleStartNew}
          />
        ) : (
          <>
            <ModeSelector
              selectedMode={selectedMode}
              onModeChange={setSelectedMode}
            />

            <section
              aria-labelledby={DIFFICULTY_LABEL_ID}
              className={cx('setupSection')}
            >
              <SetupLabel id={DIFFICULTY_LABEL_ID}>Difficulty</SetupLabel>

              <div
                className={cx('cards')}
                role="group"
                aria-label="Choose difficulty"
              >
                {LEVELS_CONFIG.map((level) => (
                  <LevelCard
                    key={level.id}
                    isSelected={selectedLevelId === level.id}
                    level={level}
                    onSelect={setSelectedLevelId}
                  />
                ))}
              </div>
            </section>

            <div className={cx('startArea')}>
              <p className={cx('subtitle', 'selectedInfo')}>
                {selectedModeLabel} • {selectedLevelIdCapitalized} selected
              </p>

              <Button
                className={cx('startButton')}
                isDisabled={!canStart}
                type="button"
                variant="primary"
                onClick={handleStart}
              >
                <PlayIcon width={24} height={24} /> Start Playing
              </Button>

              {!canStart ? (
                <p className={cx('disabledHint')}>
                  Select a mode and difficulty to continue.
                </p>
              ) : null}
            </div>
          </>
        )}
      </section>
    </main>
  );
};

export default LobbyPage;
