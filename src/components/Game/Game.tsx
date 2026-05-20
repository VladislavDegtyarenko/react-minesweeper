import Board from './components/Board';
import DailyCard from './components/DailyCard';
import GameHeader from './components/GameHeader';
import LevelChangeDialog from './components/LevelChangeDialog';
import ModeToggle from './components/ModeToggle';
import SelectLevelToggleGroup from './components/SelectLevelToggleGroup';
import SelectDigFlag from './components/SelectDigFlag';
import WinOverlay from './components/WinOverlay';
import styles from './styles.module.scss';
import { useLayoutEffect, useRef, useState } from 'react';
import { selectIsToggleMode } from '@/store/settings/selectors';
import { useSettingsStore } from '@/store/settings';
import { useGameStore } from '@/store/game';
import { selectIsDailyMode } from '@/store/game/selectors';
import { createCx } from '@/utils';
import OnboardingTour from './components/OnboardingTour';
import { useSyncGameRouteParams } from './hooks/useSyncGameRouteParams';
import { useResizeObserver } from '@/hooks';

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

  useLayoutEffect(() => {
    const dailyCardHeight = dailyCardRef.current?.clientHeight ?? 0;
    const footerHeight = footerAreaRef.current?.clientHeight ?? 0;
    setDailyCardHeight(dailyCardHeight);
    setGameFooterHeight(footerHeight);
  }, [isToggleMode, isDailyMode]);

  useResizeObserver(
    () => [document.body],
    () => {
      const dailyCardHeight = dailyCardRef.current?.clientHeight ?? 0;
      const footerHeight = footerAreaRef.current?.clientHeight ?? 0;
      setDailyCardHeight(dailyCardHeight);
      setGameFooterHeight(footerHeight);
    },
    [dailyCardRef, footerAreaRef],
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
            <ModeToggle />
            <div className={cx('footerControlsRow')}>
              <SelectLevelToggleGroup />
              <SelectDigFlag />
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
