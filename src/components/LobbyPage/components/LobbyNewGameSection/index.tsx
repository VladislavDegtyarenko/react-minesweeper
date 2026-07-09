import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { PlayIcon } from '@radix-ui/react-icons';
import Button from '@/components/ui/Button';
import { LEVELS_CONFIG } from '@/constants';
import type { LevelId } from '@/types';
import { DEFAULT_LEVEL_ID, DEFAULT_MODE, MODE_OPTIONS } from '../../constants';
import LevelCard from '../LevelCard';
import ModeSelector from '../ModeSelector';
import SetupLabel from '../SetupLabel';
import type { IntroMode } from '../../types';
const DIFFICULTY_LABEL_ID = 'intro-difficulty-label';
import { initSFX } from '@/store/sfx/actions';

import ROUTES from '@/config/routes.json';
import { createCx } from '@/utils';
import styles from './styles.module.scss';

const cx = createCx(styles);

type Props = {
  onStartNew: () => void;
};

const LobbyNewGameSection = ({ onStartNew }: Props) => {
  const router = useRouter();

  const [selectedMode, setSelectedMode] = useState<IntroMode | null>(
    DEFAULT_MODE,
  );
  const [selectedLevelId, setSelectedLevelId] = useState<LevelId | null>(
    DEFAULT_LEVEL_ID,
  );

  const canStart = Boolean(selectedMode && selectedLevelId);
  const selectedModeLabel = selectedMode
    ? MODE_OPTIONS.find((mode) => mode.value === selectedMode)?.label
    : null;

  const handleStart = () => {
    if (selectedMode && selectedLevelId) {
      router.push(
        `${ROUTES.GAME}?mode=${selectedMode}&level=${selectedLevelId}`,
      );
      initSFX(); // FIXME: For some reason, loading sounds blocks router.push() from happening.
      onStartNew();
    }
  };

  return (
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
          <span className={cx('capitalized')}>
            {selectedModeLabel} • {selectedLevelId}
          </span>{' '}
          selected
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
  );
};

export default LobbyNewGameSection;
