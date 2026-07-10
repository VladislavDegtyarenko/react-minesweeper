'use client';

import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useState } from 'react';
import { ROUTES } from '@/config/routes';
import Button from '@/components/ui/Button';
import { createCx } from '@/utils';
import { deleteAccount } from '@/app/(pages)/account/actions';
import { useAccountSessionActions } from './hooks/useAccountSessionActions';
import DeleteAccountDialog from '../DeleteAccountDialog';
import styles from './styles.module.scss';

const cx = createCx(styles);

const AccountActions = () => {
  const { user } = useUser();
  const { exitSession } = useAccountSessionActions();
  const expectedConfirmation =
    user?.username ?? user?.primaryEmailAddress?.emailAddress ?? '';

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [confirmationValue, setConfirmationValue] = useState('');
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isBusy = isDeleting || isLoggingOut;

  const handleDialogOpenChange = (isOpen: boolean) => {
    if (isBusy) {
      return;
    }

    setIsDeleteDialogOpen(isOpen);

    if (!isOpen) {
      setConfirmationValue('');
      setDeleteErrorMessage(null);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);

    await exitSession();
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    setDeleteErrorMessage(null);

    try {
      await deleteAccount();
      await exitSession();
    } catch (error) {
      setIsDeleting(false);
      setDeleteErrorMessage(
        error instanceof Error ? error.message : 'Failed to delete account.',
      );
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
          isDisabled={isBusy}
          type="button"
          onClick={handleLogout}
        >
          Logout
        </Button>
        <Button
          variant="danger"
          isDisabled={isBusy}
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
