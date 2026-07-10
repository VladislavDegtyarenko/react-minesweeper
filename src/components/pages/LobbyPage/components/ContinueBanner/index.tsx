import * as Dialog from '@radix-ui/react-dialog';
import { ResumeIcon } from '@radix-ui/react-icons';
import { useState } from 'react';
import Button from '@/components/ui/Button';
import type { GameSnapshotV1 } from '@/store/game/snapshot/types';
import { createCx, getTimeDiff } from '@/utils';
import PreviewBoard from '../PreviewBoard';
import LobbyCard from '../LobbyCard';
import { getModeLabel } from './utils';
import styles from './styles.module.scss';

const cx = createCx(styles);

type ContinueBannerProps = {
  snapshot: GameSnapshotV1;
  onContinue: () => void;
  onStartNew: () => void;
};

const ContinueBanner = ({
  snapshot,
  onContinue,
  onStartNew,
}: ContinueBannerProps) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const minesLeft = Math.max(
    0,
    snapshot.level.totalMines - snapshot.totalFlags,
  );
  const elapsedLabel = getTimeDiff(snapshot.elapsedMs);
  const gameTitle = `${getModeLabel(snapshot.mode)} · ${snapshot.level.label}`;
  const handleConfirmStartNew = () => {
    onStartNew();
  };

  return (
    <section className={cx('resumeFlow')} aria-label="Saved game">
      <LobbyCard
        ariaLabel="Saved game"
        className={cx('savedCard')}
        eyebrow="Saved game"
        isSelected={true}
        media={
          <span className={cx('previewWrap')}>
            <PreviewBoard board={snapshot.board} level={snapshot.level} />
          </span>
        }
        showSelectionMark={false}
        title={gameTitle}
        variant="horizontal"
      >
        <div className={cx('summary')}>
          <div className={cx('stats')} aria-label="Saved game stats">
            <span className={cx('stat')}>
              <span className={cx('statLabel')}>Elapsed</span>
              <span className={cx('statValue')}>{elapsedLabel}</span>
            </span>
            <span className={cx('stat')}>
              <span className={cx('statLabel')}>Mines left</span>
              <span className={cx('statValue')}>{minesLeft}</span>
            </span>
          </div>

          <div className={cx('actions')}>
            <Button
              className={cx('actionButton')}
              type="button"
              variant="primary"
              onClick={onContinue}
            >
              <ResumeIcon /> Continue Game
            </Button>
            <Button
              className={cx('startNewButton')}
              type="button"
              variant="secondary"
              onClick={() => setIsConfirmOpen(true)}
            >
              Start New Game
            </Button>
          </div>
        </div>
      </LobbyCard>

      <Dialog.Root open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className={cx('dialogOverlay')} />

          <Dialog.Content className={cx('dialogContent')}>
            <div className={cx('dialogBody')}>
              <Dialog.Title className={cx('dialogTitle')}>
                Start a new game?
              </Dialog.Title>
              <Dialog.Description className={cx('dialogDescription')}>
                Your saved {gameTitle} board will be discarded.
              </Dialog.Description>

              <div className={cx('dialogActions')}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsConfirmOpen(false)}
                >
                  Keep Playing
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleConfirmStartNew}
                >
                  Start New Game
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
};

export default ContinueBanner;
