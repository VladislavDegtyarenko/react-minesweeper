import Board from './components/Board';
import GameHeader from './components/GameHeader';
import LevelChangeDialog from './components/LevelChangeDialog';
import SelectLevelToggleGroup from './components/SelectLevelToggleGroup';
import SelectDigFlag from './components/SelectDigFlag';
import WinOverlay from './components/WinOverlay';
import styles from './styles.module.scss';
import { useLayoutEffect, useRef, useState } from 'react';
import { selectIsToggleMode } from '@/store/settings/selectors';
import { useSettingsStore } from '@/store/settings';
import { createCx } from '@/utils';

const cx = createCx(styles);

const Game = () => {
  const [gameFooterHeight, setGameFooterHeight] = useState<number>(0);

  // Temporary fix to make the game board fit into the screen
  const isToggleMode = useSettingsStore(selectIsToggleMode);
  const footerAreaRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!footerAreaRef.current) {
      return undefined;
    }

    setGameFooterHeight(footerAreaRef.current.clientHeight);
  }, [isToggleMode]);

  return (
    <div className={cx('gameWrapper')}>
      <div className={cx('gameAbsoluteContainer')}>
        <div className={cx('game')}>
          <GameHeader />
          {/* TODO: Extract into a separate component <BoardScrollableWrapper /> */}

          <Board gameFooterHeight={gameFooterHeight} />
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
