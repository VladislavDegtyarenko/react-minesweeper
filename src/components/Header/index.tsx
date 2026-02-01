import { useGameStore } from '@/store/game';
import GameStatus from '../GameStatus';
import TimerDisplay from '../TimerDisplay';
import { startNewGame, restartGame, togglePause } from '@/store/game/actions';
import { useSFXStore } from '@/store/sfx';
import { toggleMuteSFX } from '@/store/sfx/actions';
import { selectGameStatus } from '@/store/game/selectors';
import Button from '../ui/Button';
import { Popover } from 'radix-ui';
import ToggleControlMode from '../Settings/components/ToggleControlMode';
import ToggleQuestionMark from '../Settings/components/ToggleQuestionMark';
import ToggleGroupZoom from '../Settings/components/ToggleGroupZoom';
import ToggleSound from '../Settings/components/ToggleSound';
import { useSettingsStore } from '@/store/settings';
import { setIsSettingsOpened } from '@/store/settings/actions';
import { selectIsSettingsOpened } from '@/store/settings/selectors';
import Separator from '../ui/Separator';

import styles from './styles.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

const Header = () => {
  const isMuted = useSFXStore((state) => state.isMuted);
  const gameStatus = useGameStore(selectGameStatus);
  const isSettingsOpened = useSettingsStore(selectIsSettingsOpened);

  return (
    <header>
      <div className="header-label mines-left">
        <GameStatus />
      </div>
      <div className="header-buttons">
        <Button
          onClick={togglePause}
          isDisabled={
            gameStatus === 'idle' ||
            gameStatus === 'won' ||
            gameStatus === 'lost'
          }
          title={gameStatus === 'paused' ? 'Play' : 'Pause'}
        >
          {gameStatus === 'paused' ? (
            <img src="/icons/play.svg" alt="Play" />
          ) : (
            <img src="/icons/pause.svg" alt="Pause" />
          )}
        </Button>
        {/* <Button onClick={startNewGame} title="Start new game">
          New
        </Button> */}
        <Button onClick={startNewGame} title="Start new game">
          <img src="/icons/bomb-inv.svg" />
        </Button>
        <Button
          onClick={restartGame}
          isDisabled={gameStatus === 'idle'}
          title="Restart"
        >
          <img src="/icons/restart.svg" alt="Restart current game" />
        </Button>
        <Button
          isIcon
          onClick={toggleMuteSFX}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          <img
            src={isMuted ? '/icons/sound-muted.svg' : '/icons/sound.svg'}
            alt={isMuted ? 'Unmute' : 'Mute'}
          />
        </Button>

        <Popover.Root
          open={isSettingsOpened}
          onOpenChange={setIsSettingsOpened}
        >
          <Popover.Trigger asChild>
            <Button isIcon aria-label="Open settings">
              <img src="/icons/settings.svg" alt="Settings" />
            </Button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content className={cx('popoverContent')} sideOffset={5}>
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
              >
                <p className="Text" style={{ fontWeight: 700 }}>
                  Settings
                </p>

                <Separator />

                <ToggleControlMode />

                <ToggleQuestionMark />

                <ToggleSound />

                <ToggleGroupZoom />
              </div>
              <Popover.Arrow className="PopoverArrow" />
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
      <div className="header-label timer">
        <TimerDisplay />
      </div>
    </header>
  );
};

export default Header;
