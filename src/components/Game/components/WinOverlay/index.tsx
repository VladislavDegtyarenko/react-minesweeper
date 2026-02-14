import { useMemo } from 'react';
import Confetti from 'react-confetti';
import { useGameStore } from '@/store/game';
import useWindowSize from '@/hooks/useWindowSize';
import { selectGameStatus } from '@/store/game/selectors';
import styles from './styles.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);

const CSS_COLOR_VARIABLES = [
  '--one',
  '--two',
  '--three',
  '--four',
  '--five',
  '--six',
  //   "--seven",
  //   "--eight",
  '--red',
  '--green',
] as const;

const WinOverlay = () => {
  const gameStatus = useGameStore(selectGameStatus);
  const { width, height } = useWindowSize();

  const confettiColors = useMemo(() => {
    const rootStyles = getComputedStyle(document.documentElement);

    return CSS_COLOR_VARIABLES.map((variable) =>
      rootStyles.getPropertyValue(variable).trim(),
    );
  }, []);

  if (gameStatus !== 'won') {
    return null;
  }

  return (
    <Confetti
      width={width}
      height={height}
      colors={confettiColors}
      className={cx('confetti')}
    />
  );
};

export default WinOverlay;
