import classNames from 'classnames/bind';
import Board from './components/Board';
import GameHeader from './components/GameHeader';
import SelectLevelToggleGroup from './components/SelectLevelToggleGroup';
import SelectDigFlag from './components/SelectDigFlag';
import WinOverlay from './components/WinOverlay';
import styles from './styles.module.scss';

const cx = classNames.bind(styles);

const Game = () => {
  return (
    <div className={cx('game')}>
      <GameHeader />
      <Board />
      <SelectLevelToggleGroup />
      <WinOverlay />
      <SelectDigFlag />
    </div>
  );
};

export default Game;
