import * as Dialog from '@radix-ui/react-dialog';
import Button from '@/components/ui/Button';
import { useGameStore } from '@/store/game';
import {
  cancelLevelChange,
  confirmLevelChange,
} from '@/store/game/actions';
import { LEVELS_CONFIG } from '@/config';
import { createCx } from '@/utils';
import styles from './styles.module.scss';

const cx = createCx(styles);

const LEVEL_CHANGE_TITLE = 'Change difficulty?';
const LEVEL_CHANGE_DESCRIPTION =
  'Your current game will be lost if you switch to a different difficulty.';
const MODE_CHANGE_TITLE = 'Switch mode?';
const MODE_CHANGE_DESCRIPTION =
  'Your current game will be reset if you switch between Free Play and Daily Challenge.';
const MODE_LABELS = {
  daily: 'Daily Challenge',
  free: 'Free Play',
} as const;

const LevelChangeDialog = () => {
  const isLevelChangeDialogOpen = useGameStore(
    (state) => state.isLevelChangeDialogOpen,
  );
  const pendingLevelId = useGameStore((state) => state.pendingLevelId);
  const pendingMode = useGameStore((state) => state.pendingMode);

  const isModeChange = Boolean(pendingMode);
  const nextModeLabel = pendingMode ? MODE_LABELS[pendingMode] : null;
  const nextLevelLabel = LEVELS_CONFIG.find(
    (level) => level.id === pendingLevelId,
  )?.label;
  const title = isModeChange ? MODE_CHANGE_TITLE : LEVEL_CHANGE_TITLE;
  const description = isModeChange
    ? MODE_CHANGE_DESCRIPTION
    : LEVEL_CHANGE_DESCRIPTION;
  const primaryActionLabel = isModeChange
    ? 'Switch mode'
    : 'Change difficulty';
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      cancelLevelChange();
    }
  };

  return (
    <Dialog.Root open={isLevelChangeDialogOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={cx('dialogOverlay')} />

        <Dialog.Content className={cx('dialogContent')}>
          <div className={cx('dialogBody')}>
            <Dialog.Title className={cx('title')}>{title}</Dialog.Title>
            <Dialog.Description className={cx('description')}>
              {description}
            </Dialog.Description>

            {nextModeLabel && (
              <p className={cx('nextLevel')}>
                Switch to <strong>{nextModeLabel}</strong>?
              </p>
            )}

            {!nextModeLabel && nextLevelLabel && (
              <p className={cx('nextLevel')}>
                Switch to <strong>{nextLevelLabel}</strong>?
              </p>
            )}

            <div className={cx('actions')}>
              <Button
                type="button"
                className={cx('actionButton', 'secondaryAction')}
                onClick={cancelLevelChange}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className={cx('actionButton', 'primaryAction')}
                onClick={confirmLevelChange}
              >
                {primaryActionLabel}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default LevelChangeDialog;
