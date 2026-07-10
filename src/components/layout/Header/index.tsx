'use client';

import * as Dialog from '@radix-ui/react-dialog';
import Link from 'next/link';
import { useState } from 'react';
import { ROUTES } from '@/config/routes';
import { createCx } from '@/utils';
import AuthActionGroup from './components/AuthActionGroup';
import MobileMenuDrawer from './components/MobileMenuDrawer';
import MobileMenuTrigger from './components/MobileMenuTrigger';
import styles from './styles.module.scss';

const cx = createCx(styles);

const NAV_ITEMS = [
  {
    label: 'Lobby',
    href: ROUTES.LOBBY,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const closeMobile = () => setIsMobileMenuOpen(false);

  return (
    <header className={cx('header')}>
      <div className={cx('brandArea')}>
        <div className={cx('logo')}>
          <Link href={ROUTES.LOBBY}>Minesweeper</Link>
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
          <AuthActionGroup />
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
          authContent={<AuthActionGroup isMobile onAction={closeMobile} />}
          navItems={NAV_ITEMS}
        />
      </Dialog.Root>
    </header>
  );
};

export default Header;
