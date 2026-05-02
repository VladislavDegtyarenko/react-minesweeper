'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useReverification, useUser } from '@clerk/nextjs';
import Button from '@/components/ui/Button';
import { createCx } from '@/utils';
import styles from './styles.module.scss';

const cx = createCx(styles);

const NicknamePrompt = () => {
  const { user, isLoaded } = useUser();
  const updateUser = useReverification(
    (params: { username: string }) =>
      user ? user.update(params) : Promise.reject(new Error('Not signed in.')),
  );
  const [username, setUsername] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setUsername(user?.username ?? '');
  }, [user?.username]);

  if (!isLoaded || !user) {
    return null;
  }

  const trimmedUsername = username.trim();
  const isDirty = trimmedUsername !== (user.username ?? '');
  const isSubmitDisabled =
    isSaving || !isDirty || trimmedUsername.length === 0;

  const handleRevealEditor = () => {
    setErrorMessage(null);
    setIsEditing(true);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitDisabled) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      await updateUser({ username: trimmedUsername });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to update nickname.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!isEditing) {
    return (
      <button
        type="button"
        className={cx('revealButton')}
        onClick={handleRevealEditor}
      >
        Set nickname
      </button>
    );
  }

  return (
    <form className={cx('form')} onSubmit={handleSubmit}>
      <label className={cx('field')}>
        <span>Nickname</span>
        <input
          autoComplete="username"
          autoFocus
          disabled={isSaving}
          placeholder="your-handle"
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
        />
      </label>
      <p className={cx('hint')}>
        Save a nickname to publish your stored best times on the leaderboard.
      </p>

      {errorMessage ? <p className={cx('errorText')}>{errorMessage}</p> : null}

      <div className={cx('actions')}>
        <Button
          className={cx('saveButton')}
          isDisabled={isSubmitDisabled}
          type="submit"
          variant="primary"
        >
          {isSaving ? 'Saving…' : 'Save nickname'}
        </Button>
      </div>
    </form>
  );
};

export default NicknamePrompt;
