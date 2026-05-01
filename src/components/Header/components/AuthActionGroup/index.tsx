'use client';

import { Show, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import Avatar from '@/components/ui/Avatar';
import ROUTES from '@/config/routes.json';
import { createCx } from '@/utils';
import styles from './styles.module.scss';

const cx = createCx(styles);

type Props = {
  isMobile?: boolean;
  onAction?: () => void;
};

const useAccountLabel = () => {
  const { user } = useUser();

  return (
    user?.username ??
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ??
    user?.primaryEmailAddress?.emailAddress ??
    'Account'
  );
};

const AccountAvatarLink = ({ onAction }: { onAction?: () => void }) => {
  const { user } = useUser();
  const label = useAccountLabel();

  return (
    <Link
      className={cx('avatarLink')}
      href={ROUTES.ACCOUNT}
      aria-label="Open account"
      onClick={onAction}
    >
      <Avatar alt="Account" imageUrl={user?.imageUrl ?? null} label={label} />
    </Link>
  );
};

const MobileAccountLink = ({ onAction }: { onAction?: () => void }) => {
  const label = useAccountLabel();

  return (
    <div className={cx('group', 'mobileGroup')}>
      <Link
        className={cx('action', 'accountAction')}
        href={ROUTES.ACCOUNT}
        onClick={onAction}
      >
        <span className={cx('actionLabel')}>{label}</span>
      </Link>
    </div>
  );
};

const AuthActionGroup = ({ isMobile, onAction }: Props) => {
  return (
    <>
      <Show when="signed-in">
        {isMobile ? (
          <MobileAccountLink onAction={onAction} />
        ) : (
          <div className={cx('desktopAccountZone')}>
            <AccountAvatarLink onAction={onAction} />
          </div>
        )}
      </Show>
      <Show when="signed-out">
        <div className={cx('group', isMobile && 'mobileGroup')}>
          <Link
            href={ROUTES.LOGIN}
            className={cx('action', 'secondaryAction')}
            onClick={onAction}
          >
            Login
          </Link>
          <Link
            href={ROUTES.SIGNUP}
            className={cx('action', 'primaryAction')}
            onClick={onAction}
          >
            Sign Up
          </Link>
        </div>
      </Show>
    </>
  );
};

export default AuthActionGroup;
