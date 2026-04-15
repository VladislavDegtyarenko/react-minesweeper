import { useAuthStore } from '@/store/auth';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import { getAvatarPublicUrl } from '@/utils/supabase';
import { createCx } from '@/utils';
import styles from './styles.module.scss';
import AvatarUploadDialog from '../AvatarUploadDialog';

const cx = createCx(styles);

type Props = {
  nickname: string;
  isSaving: boolean;
  onAvatarUpload: (file: File) => Promise<void>;
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
        <div className={cx('avatarButtons')}>
          <AvatarUploadDialog onUpload={onAvatarUpload} isSaving={isSaving} />
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
    </div>
  );
};

export default AvatarManagement;
