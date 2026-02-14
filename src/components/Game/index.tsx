import classNames from 'classnames/bind';
import Board from './components/Board';
import GameHeader from './components/GameHeader';
import SelectLevelToggleGroup from './components/SelectLevelToggleGroup';
import SelectDigFlag from './components/SelectDigFlag';
import WinOverlay from './components/WinOverlay';
import styles from './styles.module.scss';
import { CSSProperties, useLayoutEffect, useRef, useState } from 'react';
import { selectIsToggleMode } from '@/store/settings/selectors';
import { useSettingsStore } from '@/store/settings';
import { useGameStore } from '@/store/game';
import { selectIsGameLost, selectIsGameWon } from '@/store/game/selectors';

const cx = classNames.bind(styles);

const Game = () => {
  const isGameWon = useGameStore(selectIsGameWon);
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

  return (
    <div className={cx('gameWrapper')}>
      <div className={cx('gameAbsoluteContainer')}>
        <div className={cx('game')}>
          <GameHeader />
          <div
            className={cx(
              'boardArea',
              isGameWon || isGameLost ? 'no-pointer-events' : '',
            )}
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
        <WinOverlay />
      </div>
    </div>
  );
};

export default Game;
