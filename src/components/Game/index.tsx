import Board from './components/Board';
import GameHeader from './components/GameHeader';
import LevelChangeDialog from './components/LevelChangeDialog';
import SelectLevelToggleGroup from './components/SelectLevelToggleGroup';
import SelectDigFlag from './components/SelectDigFlag';
import WinOverlay from './components/WinOverlay';
import styles from './styles.module.scss';
import { CSSProperties, useLayoutEffect, useRef, useState } from 'react';
import { selectIsToggleMode } from '@/store/settings/selectors';
import { useStatsStore } from '@/store/stats';
import { setIsWinDialogOpen } from '@/store/stats/actions';
import { useSettingsStore } from '@/store/settings';
import { useGameStore } from '@/store/game';
import { selectIsGameLost } from '@/store/game/selectors';
import { createCx } from '@/utils';

const cx = createCx(styles);

const Game = () => {
  const isGameLost = useGameStore(selectIsGameLost);

  // Temporary fix to make the game board fit into the screen
  const isToggleMode = useSettingsStore(selectIsToggleMode);
  const [gameFooterHeight, setGameFooterHeight] = useState<number>(0);
  const footerAreaRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!footerAreaRef.current) {
      return undefined;
    }

    setGameFooterHeight(footerAreaRef.current.clientHeight);
  }, [isToggleMode]);

  const handleBoardAreaClick = () => {
    const { gameStatus } = useGameStore.getState();
    const { hasPresentedWinDialog, isWinDialogOpen } = useStatsStore.getState();

    if (gameStatus !== 'won' || !hasPresentedWinDialog || isWinDialogOpen) {
      return undefined;
    }

    // Open the win dialog
    setIsWinDialogOpen(true);
  };

  return (
    <div className={cx('gameWrapper')}>
      <div className={cx('gameAbsoluteContainer')}>
        <div className={cx('game')}>
          <GameHeader />
          {/* TODO: Extract into a separate component <BoardScrollableWrapper /> */}
          <div
            className={cx('boardArea', isGameLost ? 'no-pointer-events' : '')}
            onClick={handleBoardAreaClick}
            style={
              {
                '--game-footer-height': gameFooterHeight + 'px',
              } as CSSProperties
            }
          >
            <Board />
          </div>
          <div className={cx('footerArea')} ref={footerAreaRef}>
            <SelectLevelToggleGroup />
            <SelectDigFlag />
          </div>
        </div>
        <LevelChangeDialog />
        <WinOverlay />
      </div>
    </div>
  );
};

export default Game;
