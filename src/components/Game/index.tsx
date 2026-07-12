import Board from './components/Board';
import ChangeGameButton from './components/ChangeGameButton';
import DailyCard from './components/DailyCard';
import GameHeader from './components/GameHeader';
import LevelChangeDialog from './components/LevelChangeDialog';
import SelectLevelToggleGroup from './components/SelectLevelToggleGroup';
import SelectDigFlag from './components/SelectDigFlag';
import WinOverlay from './components/WinOverlay';
import styles from './styles.module.scss';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { selectIsToggleMode } from '@/store/settings/selectors';
import { useSettingsStore } from '@/store/settings';
import { useGameStore } from '@/store/game';
import { selectIsDailyMode } from '@/store/game/selectors';
import { createCx } from '@/utils';
import OnboardingTour from './components/OnboardingTour';
import { useSyncGameRouteParams } from './hooks/useSyncGameRouteParams';
import { useResizeObserver } from '@/hooks';
import { GAME_FEATURES } from '@/config';

const cx = createCx(styles);

type GameProps = {
  shouldReplayTour?: boolean;
};

const Game = ({ shouldReplayTour = false }: GameProps) => {
  useSyncGameRouteParams();
  // Total height of fixed regions outside the board (DailyCard + footer area).
  // The board uses this to compute its own max-height so it always fits the
  // viewport regardless of which non-board sections are visible.
  const [dailyCardHeight, setDailyCardHeight] = useState<number>(0);
  const [gameFooterHeight, setGameFooterHeight] = useState<number>(0);

  const isToggleMode = useSettingsStore(selectIsToggleMode);
  const isDailyMode = useGameStore(selectIsDailyMode);
  const dailyCardRef = useRef<HTMLElement>(null);
  const footerAreaRef = useRef<HTMLDivElement>(null);

  const updateBoardLayoutHeights = useCallback(() => {
    const nextDailyCardHeight = dailyCardRef.current?.clientHeight ?? 0;
    const nextFooterHeight = footerAreaRef.current?.clientHeight ?? 0;

    setDailyCardHeight((currentDailyCardHeight) =>
      currentDailyCardHeight === nextDailyCardHeight
        ? currentDailyCardHeight
        : nextDailyCardHeight,
    );
    setGameFooterHeight((currentFooterHeight) =>
      currentFooterHeight === nextFooterHeight
        ? currentFooterHeight
        : nextFooterHeight,
    );
  }, []);

  useLayoutEffect(() => {
    updateBoardLayoutHeights();
  }, [isToggleMode, isDailyMode, updateBoardLayoutHeights]);

  useResizeObserver(
    () => [document.body],
    updateBoardLayoutHeights,
    [updateBoardLayoutHeights],
  );

  return (
    <div className={cx('gameWrapper')}>
      <div className={cx('gameAbsoluteContainer')}>
        <div className={cx('game')}>
          <GameHeader />

          <DailyCard ref={dailyCardRef} />

          <Board
            dailyCardHeight={dailyCardHeight}
            gameFooterHeight={gameFooterHeight}
          />

          <div className={cx('footerArea')} ref={footerAreaRef}>
            <div className={cx('footerControlsRow')}>
              {GAME_FEATURES.isInGameLevelToggleEnabled ? (
                <SelectLevelToggleGroup />
              ) : null}
              <SelectDigFlag />
              <ChangeGameButton />
            </div>
          </div>
        </div>
        <LevelChangeDialog />
        <WinOverlay />
        <OnboardingTour shouldReplay={shouldReplayTour} />
      </div>
    </div>
  );
};

export default Game;
