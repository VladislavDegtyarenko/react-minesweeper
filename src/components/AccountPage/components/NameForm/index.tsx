'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useReverification, useUser } from '@clerk/nextjs';
import Button from '@/components/ui/Button';
import { createCx } from '@/utils';
import styles from './styles.module.scss';

const cx = createCx(styles);

const NameForm = () => {
  const { user, isLoaded } = useUser();
  const updateUser = useReverification(
    (params: { firstName: string; lastName: string }) =>
      user ? user.update(params) : Promise.reject(new Error('Not signed in.')),
  );

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? '');
      setLastName(user.lastName ?? '');
    }
  }, [user]);

  if (!isLoaded || !user) {
    return null;
  }

  const isDirty =
    firstName !== (user.firstName ?? '') ||
    lastName !== (user.lastName ?? '');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await updateUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      setSuccessMessage('Name updated.');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to update name.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className={cx('root')}>
      <header className={cx('header')}>
        <h2 className={cx('title')}>Name</h2>
        <p className={cx('subtitle')}>
          Used on the leaderboard alongside your best scores.
        </p>
      </header>
      <form className={cx('form')} onSubmit={handleSubmit}>
        <div className={cx('fieldGrid')}>
          <label className={cx('field')}>
            <span>First name</span>
            <input
              type="text"
              value={firstName}
              autoComplete="given-name"
              onChange={(event) => setFirstName(event.target.value)}
              disabled={isSaving}
            />
          </label>
          <label className={cx('field')}>
            <span>Last name</span>
            <input
              type="text"
              value={lastName}
              autoComplete="family-name"
              onChange={(event) => setLastName(event.target.value)}
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
          <Button
            variant="primary"
            type="submit"
            isDisabled={isSaving || !isDirty}
          >
            {isSaving ? 'Saving…' : 'Save name'}
          </Button>
        </div>
      </form>
    </section>
  );
};

export default NameForm;
