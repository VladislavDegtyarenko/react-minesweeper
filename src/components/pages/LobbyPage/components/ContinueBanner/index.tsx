import * as Dialog from '@radix-ui/react-dialog';
import { ResumeIcon } from '@radix-ui/react-icons';
import Button from '@/components/ui/Button';
import type { GameSnapshotV1 } from '@/store/game/snapshot/types';
import { createCx, getTimeDiff } from '@/utils';
import PreviewBoard from '@/components/pages/LobbyPage/components/PreviewBoard';
import LobbyCard from '@/components/pages/LobbyPage/components/LobbyCard';
import StartNewGameDialog from './components/StartNewGameDialog';
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
  const minesLeft = Math.max(
    0,
    snapshot.level.totalMines - snapshot.totalFlags,
  );
  const elapsedLabel = getTimeDiff(snapshot.elapsedMs);
  const gameTitle = `${getModeLabel(snapshot.mode)} · ${snapshot.level.label}`;

  return (
    <Dialog.Root>
      <section className={cx('resumeFlow')} aria-label="Saved game">
        <LobbyCard
          ariaLabel="Saved game summary"
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
                <ResumeIcon aria-hidden="true" /> Continue Game
              </Button>
              <Dialog.Trigger asChild>
                <Button
                  className={cx('startNewButton')}
                  type="button"
                  variant="secondary"
                >
                  Start New Game
                </Button>
              </Dialog.Trigger>
            </div>
          </div>
        </LobbyCard>
      </section>
      <StartNewGameDialog gameTitle={gameTitle} onStartNew={onStartNew} />
    </Dialog.Root>
  );
};

export default ContinueBanner;
