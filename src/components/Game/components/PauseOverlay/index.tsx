import classNames from 'classnames/bind';
import { togglePause } from '@/store/game/actions';
import { useSettingsStore } from '@/store/settings';
import { selectIsTouchScreen } from '@/store/settings/selectors';
import styles from './styles.module.scss';

const cx = classNames.bind(styles);

const PauseOverlay = () => {
  const isTouchScreen = useSettingsStore(selectIsTouchScreen);

  return (
    <button
      type="button"
      className={cx('pauseOverlay')}
      onClick={togglePause}
      aria-label="Resume game"
    >
      <div className={cx('pauseOverlayContent')}>
        <div className={cx('pauseOverlayIcon')}>
          <img src="/icons/pause.svg" alt="pause" />
        </div>
        <h2 className={cx('title')}>Paused</h2>
        <p>{isTouchScreen ? 'Tap' : 'Click'} to resume</p>
      </div>
    </button>
  );
};

export default PauseOverlay;
