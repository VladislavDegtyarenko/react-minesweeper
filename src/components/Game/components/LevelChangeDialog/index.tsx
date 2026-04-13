import * as Dialog from '@radix-ui/react-dialog';
import Button from '@/components/ui/Button';
import { useGameStore } from '@/store/game';
import {
  cancelLevelChange,
  confirmLevelChange,
} from '@/store/game/actions';
import { LEVELS_CONFIG } from '@/constants';
import { createCx } from '@/utils';
import styles from './styles.module.scss';

const cx = createCx(styles);

const TITLE = 'Change difficulty?';
const DESCRIPTION =
  'Your current game will be lost if you switch to a different difficulty.';

const LevelChangeDialog = () => {
  const isLevelChangeDialogOpen = useGameStore(
    (state) => state.isLevelChangeDialogOpen,
  );
  const pendingLevelId = useGameStore((state) => state.pendingLevelId);

  const nextLevelLabel = LEVELS_CONFIG.find(
    (level) => level.id === pendingLevelId,
  )?.label;
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
            <Dialog.Title className={cx('title')}>{TITLE}</Dialog.Title>
            <Dialog.Description className={cx('description')}>
              {DESCRIPTION}
            </Dialog.Description>

            {nextLevelLabel && (
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
                Change difficulty
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default LevelChangeDialog;
