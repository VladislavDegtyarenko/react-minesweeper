'use client';

import * as Dialog from '@radix-ui/react-dialog';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import ROUTES from '@/config/routes.json';
import { useAuthStore } from '@/store/auth';
import { createCx } from '@/utils';
import { getAvatarPublicUrl, signOut } from '@/utils/supabase';
import AuthActionGroup from './components/AuthActionGroup';
import MobileMenuDrawer from './components/MobileMenuDrawer';
import MobileMenuTrigger from './components/MobileMenuTrigger';
import styles from './styles.module.scss';

const cx = createCx(styles);

const NAV_ITEMS = [
  {
    label: 'Game',
    href: ROUTES.GAME,
  },
  {
    label: 'How To Play',
    href: ROUTES.HOW_TO_PLAY,
  },
  {
    label: 'Leaderboard',
    href: ROUTES.LEADERBOARD,
  },
];

const Header = () => {
  const router = useRouter();
  const { profile, status } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAuthenticated = status === 'authenticated';
  const accountLabel = profile?.nickname || 'Account';
  const avatarUrl = useMemo(
    () => getAvatarPublicUrl(profile?.avatar_path ?? null),
    [profile?.avatar_path],
  );

  const handleLogoutClick = async () => {
    await signOut();
    setIsMobileMenuOpen(false);

    router.replace(ROUTES.GAME);
  };

  const mobileNavItems = NAV_ITEMS.map((item) => ({
    href: item.href,
    label: item.label,
  }));

  return (
    <header className={cx('header')}>
      <div className={cx('brandArea')}>
        <div className={cx('logo')}>
          <Link href={ROUTES.GAME}>Minesweeper</Link>
        </div>
      </div>

      <div className={cx('desktopNavArea')}>
        <nav className={cx('nav')} aria-label="Primary navigation">
          <ul className={cx('navList')}>
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link className={cx('navLink')} href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={cx('authCluster')}>
          <AuthActionGroup
            avatarUrl={avatarUrl}
            accountLabel={accountLabel}
            isAuthenticated={isAuthenticated}
            onLogoutClick={handleLogoutClick}
          />
        </div>
      </div>

      <Dialog.Root open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <div className={cx('mobileMenuArea')}>
          <Dialog.Trigger asChild>
            <div>
              <MobileMenuTrigger isOpen={isMobileMenuOpen} />
            </div>
          </Dialog.Trigger>
        </div>

        <MobileMenuDrawer
          authContent={
            <AuthActionGroup
              isMobile
              avatarUrl={avatarUrl}
              accountLabel={accountLabel}
              isAuthenticated={isAuthenticated}
              onLogoutClick={handleLogoutClick}
              onClick={() => setIsMobileMenuOpen(false)}
            />
          }
          navItems={mobileNavItems}
        />
      </Dialog.Root>
    </header>
  );
};

export default Header;
