import Link from 'next/link';
import { useState } from 'react';
import ROUTES from '@/config/routes.json';
import DeleteAccountDialog from '../DeleteAccountDialog';
import Button from '@/components/ui/Button';
import { createCx } from '@/utils';
import styles from './styles.module.scss';

const cx = createCx(styles);

type AccountActionsProps = {
  expectedConfirmation: string;
  isDeleting: boolean;
  isSaving: boolean;
  onDeleteAccount: () => Promise<string | null>;
  onLogout: () => void;
};

const AccountActions = ({
  expectedConfirmation,
  isDeleting,
  isSaving,
  onDeleteAccount,
  onLogout,
}: AccountActionsProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [confirmationValue, setConfirmationValue] = useState('');
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(null);

  const handleDialogOpenChange = (isOpen: boolean) => {
    if (isDeleting) return;

    setIsDeleteDialogOpen(isOpen);

    if (!isOpen) {
      setConfirmationValue('');
      setDeleteErrorMessage(null);
    }
  };

  const handleConfirmDelete = async () => {
    const error = await onDeleteAccount();

    if (error) {
      setDeleteErrorMessage(error);
    }
  };

  return (
    <section className={cx('root')}>
      <div className={cx('header')}>
        <h2 className={cx('title')}>Profile Management</h2>
        <p className={cx('notice')}>
          Account data and public leaderboard participation are covered by the{' '}
          <Link href={ROUTES.PRIVACY}>Privacy Policy</Link> and{' '}
          <Link href={ROUTES.TERMS_OF_SERVICE}>Terms of Service</Link>.
        </p>
      </div>

      <div className={cx('actions')}>
        <Button
          variant="secondary"
          isDisabled={isSaving || isDeleting}
          type="button"
          onClick={onLogout}
        >
          Logout
        </Button>
        <Button
          variant="danger"
          isDisabled={isSaving || isDeleting}
          type="button"
          onClick={() => setIsDeleteDialogOpen(true)}
        >
          Delete account
        </Button>
      </div>

      <DeleteAccountDialog
        confirmationValue={confirmationValue}
        deleteErrorMessage={deleteErrorMessage}
        expectedConfirmation={expectedConfirmation}
        isDeleting={isDeleting}
        isOpen={isDeleteDialogOpen}
        onConfirmationChange={setConfirmationValue}
        onConfirmDelete={handleConfirmDelete}
        onOpenChange={handleDialogOpenChange}
      />
    </section>
  );
};

export default AccountActions;
