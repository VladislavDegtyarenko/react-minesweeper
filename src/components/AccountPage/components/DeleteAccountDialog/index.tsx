import * as Dialog from '@radix-ui/react-dialog';
import Button from '@/components/ui/Button';
import { createCx } from '@/utils';
import styles from './styles.module.scss';

const cx = createCx(styles);

type DeleteAccountDialogProps = {
  confirmationValue: string;
  deleteErrorMessage: string | null;
  expectedConfirmation: string;
  isDeleting: boolean;
  isOpen: boolean;
  onConfirmationChange: (value: string) => void;
  onConfirmDelete: () => void;
  onOpenChange: (isOpen: boolean) => void;
};

const DeleteAccountDialog = ({
  confirmationValue,
  deleteErrorMessage,
  expectedConfirmation,
  isDeleting,
  isOpen,
  onConfirmationChange,
  onConfirmDelete,
  onOpenChange,
}: DeleteAccountDialogProps) => {
  const isConfirmationMatched = confirmationValue.trim() === expectedConfirmation;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={cx('dialogOverlay')} />

        <Dialog.Content className={cx('dialogContent')}>
          <div className={cx('dialogBody')}>
            <Dialog.Title className={cx('title')}>
              Delete account permanently?
            </Dialog.Title>
            <Dialog.Description className={cx('description')}>
              This action cannot be undone. Your account and all account-backed
              data will be removed immediately.
            </Dialog.Description>

            <ul className={cx('consequencesList')}>
              <li>Your profile, avatar, and nickname will be deleted.</li>
              <li>Your leaderboard entries and best scores will be removed.</li>
              <li>You will be signed out on this device.</li>
            </ul>

            <label className={cx('field')}>
              <span>
                Type <strong>{expectedConfirmation}</strong> to confirm
              </span>
              <input
                autoComplete="off"
                disabled={isDeleting}
                value={confirmationValue}
                onChange={(event) => onConfirmationChange(event.target.value)}
              />
            </label>

            {deleteErrorMessage ? (
              <p className={cx('errorText')}>{deleteErrorMessage}</p>
            ) : null}

            <div className={cx('actions')}>
              <Button
                variant="secondary"
                isDisabled={isDeleting}
                type="button"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                isDisabled={!isConfirmationMatched || isDeleting}
                type="button"
                onClick={onConfirmDelete}
              >
                {isDeleting ? 'Deleting…' : 'Delete account'}
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default DeleteAccountDialog;
