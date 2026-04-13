import { createCx } from '@/utils';
import { useTimerStore } from '@/store/timer';
import { selectTimeDiff } from '@/store/timer/selectors';
import styles from './styles.module.scss';

const cx = createCx(styles);

const TimerDisplay = () => {
  const timeDiff = useTimerStore(selectTimeDiff);

  return (
    <>
      <img src="/icons/timer.svg" className={cx('headerIcon')} alt="timer" />
      {timeDiff}
    </>
  );
};

export default TimerDisplay;
