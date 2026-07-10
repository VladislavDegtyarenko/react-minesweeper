'use client';

import { FormEvent, useState } from 'react';
import { useReverification, useUser } from '@clerk/nextjs';
import Button from '@/components/ui/Button';
import { createCx } from '@/utils';
import styles from './styles.module.scss';

const cx = createCx(styles);

const PasswordSection = () => {
  const { user, isLoaded } = useUser();
  const updatePassword = useReverification(
    (params: {
      currentPassword: string;
      newPassword: string;
      signOutOfOtherSessions: boolean;
    }) =>
      user
        ? user.updatePassword(params)
        : Promise.reject(new Error('Not signed in.')),
  );

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isLoaded || !user) {
    return null;
  }

  if (!user.passwordEnabled) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match.');
      setSuccessMessage(null);

      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await updatePassword({
        currentPassword,
        newPassword,
        signOutOfOtherSessions: true,
      });
      setSuccessMessage('Password updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to update password.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className={cx('root')}>
      <header className={cx('header')}>
        <h2 className={cx('title')}>Password</h2>
        <p className={cx('subtitle')}>
          Other devices will be signed out when you change your password.
        </p>
      </header>
      <form className={cx('form')} onSubmit={handleSubmit}>
        <label className={cx('field')}>
          <span>Current password</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            disabled={isSaving}
          />
        </label>
        <div className={cx('fieldGrid')}>
          <label className={cx('field')}>
            <span>New password</span>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              disabled={isSaving}
            />
          </label>
          <label className={cx('field')}>
            <span>Confirm new password</span>
            <input
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              disabled={isSaving}
            />
          </label>
        </div>

        {errorMessage ? (
          <p className={cx('errorText')}>{errorMessage}</p>
        ) : null}
        {successMessage ? (
          <p className={cx('successText')}>{successMessage}</p>
        ) : null}

        <div className={cx('actions')}>
          <Button variant="primary" type="submit" isDisabled={isSaving}>
            {isSaving ? 'Saving…' : 'Update password'}
          </Button>
        </div>
      </form>
    </section>
  );
};

export default PasswordSection;
