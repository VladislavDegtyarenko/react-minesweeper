import classNames from 'classnames/bind';
import { useTimerStore } from '@/store/timer';
import { selectTimeDiff } from '@/store/timer/selectors';
import styles from './styles.module.scss';

const cx = classNames.bind(styles);

const TimerDisplay = () => {
  const timeDiff = useTimerStore(selectTimeDiff);

  return (
    <>
      <img
        src="/icons/timer.svg"
        className={cx('image', 'headerIcon')}
        alt="timer"
      />
      {timeDiff}
    </>
  );
};

export default TimerDisplay;
