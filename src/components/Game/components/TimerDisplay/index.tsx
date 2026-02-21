import classNames from 'classnames/bind';
import { useTimerStore } from '@/store/timer';
import { selectTimeDiff } from '@/store/timer/selectors';
import styles from './styles.module.scss';
import { TimeIcon } from '@/assets/themes/classic/icons';

const cx = classNames.bind(styles);

const TimerDisplay = () => {
  const timeDiff = useTimerStore(selectTimeDiff);

  return (
    <>
      <TimeIcon className={cx('headerIcon')} aria-hidden="true" />
      {timeDiff}
    </>
  );
};

export default TimerDisplay;
