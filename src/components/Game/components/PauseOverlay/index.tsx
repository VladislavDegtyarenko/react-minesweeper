import { createCx } from '@/utils';
import { togglePause } from '@/store/game/actions';
import { useSettingsStore } from '@/store/settings';
import { selectIsTouchScreen } from '@/store/settings/selectors';
import type { KeyboardEvent, MouseEvent, PointerEvent } from 'react';
import styles from './styles.module.scss';

const cx = createCx(styles);

const PauseOverlay = () => {
  const isTouchScreen = useSettingsStore(selectIsTouchScreen);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    togglePause();
  };

  const handlePointerEvent = (event: PointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  const handleContextMenu = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div
      className={cx('pauseOverlay')}
      role="button"
      tabIndex={0}
      onClick={togglePause}
      onContextMenu={handleContextMenu}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerEvent}
      onPointerMove={handlePointerEvent}
      onPointerUp={handlePointerEvent}
    >
      <div className={cx('pauseOverlayContent')}>
        <div className={cx('pauseOverlayIcon')}>
          <img src="/icons/pause.svg" alt="pause" />
        </div>
        <h2 className={cx('title')}>Paused</h2>
        <p>{isTouchScreen ? 'Tap' : 'Click'} to resume</p>
      </div>
    </div>
  );
};

export default PauseOverlay;
