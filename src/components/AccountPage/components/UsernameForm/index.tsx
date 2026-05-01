'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useReverification, useUser } from '@clerk/nextjs';
import Button from '@/components/ui/Button';
import { createCx } from '@/utils';
import styles from './styles.module.scss';

const cx = createCx(styles);

const UsernameForm = () => {
  const { user, isLoaded } = useUser();
  const updateUser = useReverification(
    (params: { username: string }) =>
      user ? user.update(params) : Promise.reject(new Error('Not signed in.')),
  );

  const [username, setUsername] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setUsername(user?.username ?? '');
  }, [user?.username]);

  if (!isLoaded || !user) {
    return null;
  }

  const trimmed = username.trim();
  const isDirty = trimmed !== (user.username ?? '');
  const hasUsername = Boolean(user.username);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await updateUser({ username: trimmed });
      setSuccessMessage(hasUsername ? 'Username updated.' : 'Username set.');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to update username.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className={cx('root')}>
      <header className={cx('header')}>
        <h2 className={cx('title')}>Username</h2>
        <p className={cx('subtitle')}>
          Shown on the leaderboard when set. Letters, numbers, and underscores
          are allowed.
        </p>
      </header>
      <form className={cx('form')} onSubmit={handleSubmit}>
        <label className={cx('field')}>
          <span>Username</span>
          <input
            type="text"
            autoComplete="username"
            value={username}
            placeholder="your-handle"
            onChange={(event) => setUsername(event.target.value)}
            disabled={isSaving}
          />
        </label>

        {errorMessage ? (
          <p className={cx('errorText')}>{errorMessage}</p>
        ) : null}
        {successMessage ? (
          <p className={cx('successText')}>{successMessage}</p>
        ) : null}

        <div className={cx('actions')}>
          <Button
            variant="primary"
            type="submit"
            isDisabled={isSaving || !isDirty || trimmed.length === 0}
          >
            {isSaving
              ? 'Saving…'
              : hasUsername
                ? 'Save username'
                : 'Set username'}
          </Button>
        </div>
      </form>
    </section>
  );
};

export default UsernameForm;
