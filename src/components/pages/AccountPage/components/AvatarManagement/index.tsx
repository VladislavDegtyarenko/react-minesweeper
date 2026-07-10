'use client';

import { useState } from 'react';
import { useReverification, useUser } from '@clerk/nextjs';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import { createCx } from '@/utils';
import AvatarUploadDialog from '../AvatarUploadDialog';
import styles from './styles.module.scss';

const cx = createCx(styles);

const AvatarManagement = () => {
  const { user, isLoaded } = useUser();
  const setProfileImage = useReverification((file: File | null) =>
    user
      ? user.setProfileImage({ file })
      : Promise.reject(new Error('Not signed in.')),
  );
  const [isRemoving, setIsRemoving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isLoaded || !user) {
    return null;
  }

  const label =
    user.username ?? user.firstName ?? user.primaryEmailAddress?.emailAddress;

  const handleUpload = async (file: File) => {
    setErrorMessage(null);
    await setProfileImage(file);
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    setErrorMessage(null);

    try {
      await setProfileImage(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to remove image.',
      );
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className={cx('root')}>
      <Avatar
        alt="Profile avatar"
        className={cx('avatar')}
        imageUrl={user.imageUrl}
        label={label ?? undefined}
      />
      <div className={cx('avatarActions')}>
        <div className={cx('avatarButtons')}>
          <AvatarUploadDialog onUpload={handleUpload} isSaving={isRemoving} />
          {user.hasImage ? (
            <Button
              variant="ghost"
              isDisabled={isRemoving}
              type="button"
              onClick={handleRemove}
            >
              Remove
            </Button>
          ) : null}
        </div>
        {errorMessage ? (
          <p className={cx('errorText')}>{errorMessage}</p>
        ) : null}
      </div>
    </div>
  );
};

export default AvatarManagement;
