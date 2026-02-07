import classNames from 'classnames/bind';
import { togglePause } from '@/store/game/actions';
import { useSettingsStore } from '@/store/settings';
import { selectIsTouchScreen } from '@/store/settings/selectors';
import styles from './styles.module.scss';

const cx = classNames.bind(styles);

const PauseOverlay = () => {
  const isTouchScreen = useSettingsStore(selectIsTouchScreen);

  return (
    <div className={cx('pauseOverlay')} role="button" onClick={togglePause}>
      <div className={cx('pauseOverlayContent')}>
        <div className={cx('pauseOverlayIcon')}>
          <img
            src="/icons/pause.svg"
            alt="pause"
            className={cx('image', 'pauseOverlayIconImage')}
          />
        </div>
        <h2 className={cx('pauseOverlayTitle')}>Paused</h2>
        <p>{isTouchScreen ? 'Tap' : 'Click'} to resume</p>
      </div>
    </div>
  );
};

export default PauseOverlay;
