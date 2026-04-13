import { useAuthStore } from '@/store/auth';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import { getAvatarPublicUrl } from '@/utils/supabase';
import { createCx } from '@/utils';
import styles from './styles.module.scss';

const cx = createCx(styles);

type Props = {
  nickname: string;
  isSaving: boolean;
  onAvatarUpload: (file: File) => void;
  onAvatarRemove: () => void;
};

const AvatarManagement = ({ nickname, isSaving, onAvatarUpload, onAvatarRemove }: Props) => {
  const { profile, user } = useAuthStore();

  const avatarUrl = getAvatarPublicUrl(profile?.avatar_path ?? null);

  return (
    <div className={cx('root')}>
      <Avatar
        alt={nickname || 'Avatar'}
        className={cx('avatar')}
        imageUrl={avatarUrl}
        label={nickname || user?.email || 'A'}
      />
      <div className={cx('avatarActions')}>
        <label className={cx('uploadLabel')}>
          Upload Avatar
          <input
            accept="image/*"
            hidden
            type="file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onAvatarUpload(file);
              }
              e.target.value = '';
            }}
          />
        </label>
        <Button
          variant="ghost"
          isDisabled={!profile?.avatar_path || isSaving}
          type="button"
          onClick={onAvatarRemove}
        >
          Remove
        </Button>
      </div>
    </div>
  );
};

export default AvatarManagement;
