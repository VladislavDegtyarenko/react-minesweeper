import Link from 'next/link';
import Avatar from '@/components/ui/Avatar';
import { createCx } from '@/utils';
import ROUTES from '@/config/routes.json';
import styles from './styles.module.scss';

const cx = createCx(styles);

type Props = {
  isAuthenticated: boolean;
  isMobile?: boolean;
  onClick?: () => void;
  avatarUrl?: string | null;
  accountLabel: string;
  onLogoutClick: () => void | Promise<void>;
};

const AuthActionGroup = (props: Props) => {
  const {
    isAuthenticated,
    isMobile,
    avatarUrl,
    accountLabel,
    onLogoutClick,
    onClick,
  } = props;
  const resolvedAccountLabel = accountLabel || 'Account';

  if (isAuthenticated) {
    if (!isMobile) {
      return (
        <div className={cx('desktopAccountZone')}>
          <Link
            aria-label="Open account page"
            className={cx('accountZoneLink')}
            href={ROUTES.ACCOUNT}
            onClick={onClick}
            title={resolvedAccountLabel}
          >
            <Avatar
              alt={resolvedAccountLabel}
              className={cx('accountAvatar')}
              imageUrl={avatarUrl}
              label={resolvedAccountLabel}
            />
          </Link>
        </div>
      );
    }

    return (
      <div className={cx('group', isMobile && 'mobileGroup')}>
        <Link
          className={cx('action', 'accountAction')}
          href={ROUTES.ACCOUNT}
          onClick={onClick}
        >
          {resolvedAccountLabel}
        </Link>
        <button
          className={cx('action', 'secondaryAction')}
          onClick={() => {
            onClick?.();
            void onLogoutClick();
          }}
          type="button"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className={cx('group', isMobile && 'mobileGroup')}>
      <Link
        className={cx('action', 'secondaryAction')}
        href={ROUTES.LOGIN}
        onClick={onClick}
      >
        Login
      </Link>
      <Link
        className={cx('action', 'primaryAction')}
        href={ROUTES.SIGNUP}
        onClick={onClick}
      >
        Sign Up
      </Link>
    </div>
  );
};

export default AuthActionGroup;
