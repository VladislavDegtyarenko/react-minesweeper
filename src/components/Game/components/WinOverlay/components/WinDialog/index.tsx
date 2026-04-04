import * as Dialog from '@radix-ui/react-dialog';
import classNames from 'classnames/bind';
import ShareSheet from '../ShareSheet';
import styles from './styles.module.scss';
import type { WinOverlayPresentation } from '../../types';

const cx = classNames.bind(styles);

type WinDialogProps = Pick<
  WinOverlayPresentation,
  | 'copyFallbackVisible'
  | 'copyState'
  | 'dialogDescription'
  | 'dialogTitle'
  | 'handleDialogOpenChange'
  | 'handleNewGameClick'
  | 'handleShareActionClick'
  | 'handleShareClick'
  | 'isDialogOpen'
  | 'isNewBest'
  | 'isShareSheetOpen'
  | 'shareActionItems'
  | 'sharePayload'
>;

const WinDialog = ({
  copyFallbackVisible,
  copyState,
  dialogDescription,
  dialogTitle,
  handleDialogOpenChange,
  handleNewGameClick,
  handleShareActionClick,
  handleShareClick,
  isDialogOpen,
  isNewBest,
  isShareSheetOpen,
  shareActionItems,
  sharePayload,
}: WinDialogProps) => {
  if (!sharePayload) {
    return null;
  }

  return (
    <Dialog.Root open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={cx('dialogOverlay')} />

        <Dialog.Content
          className={cx('dialogContent', isNewBest && 'bestDialogContent')}
        >
          <div className={cx('dialogBody')}>
            <Dialog.Title className={cx('title')}>{dialogTitle}</Dialog.Title>
            <Dialog.Description className={cx('subtitle')}>
              {dialogDescription}
            </Dialog.Description>

            <dl className={cx('statsList')}>
              <div className={cx('statsRow')}>
                <dt>Your time</dt>
                <dd>{sharePayload.currentTimeLabel}</dd>
              </div>

              <div className={cx('statsRow')}>
                <dt>Best time</dt>
                <dd>{sharePayload.bestTimeLabel}</dd>
              </div>
            </dl>

            <div className={cx('actions')}>
              <button
                type="button"
                className={cx('actionButton', 'primaryAction')}
                onClick={handleNewGameClick}
              >
                New Game
              </button>

              <button
                type="button"
                className={cx('actionButton', 'secondaryAction')}
                onClick={() => void handleShareClick()}
              >
                Share
              </button>
            </div>

            {isShareSheetOpen && (
              <ShareSheet
                copyFallbackVisible={copyFallbackVisible}
                copyState={copyState}
                dialogTitle={dialogTitle}
                handleShareActionClick={handleShareActionClick}
                shareActionItems={shareActionItems}
                sharePayload={sharePayload}
              />
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default WinDialog;
