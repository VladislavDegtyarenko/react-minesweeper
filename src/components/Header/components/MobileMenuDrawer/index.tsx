import * as Dialog from '@radix-ui/react-dialog';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { createCx } from '@/utils';
import styles from './styles.module.scss';
import Copyright from '@/components/Copyright';

const cx = createCx(styles);

export type MobileNavItem = {
  href: string;
  label: string;
};

type Props = {
  authContent: ReactNode;
  navItems: MobileNavItem[];
};

const MobileMenuDrawer = (props: Props) => {
  const { authContent, navItems } = props;

  return (
    <Dialog.Portal>
      <Dialog.Overlay className={cx('drawerOverlay')} />
      <Dialog.Content className={cx('drawerContent')}>
        <div className={cx('drawerHeader')}>
          <div>
            <Dialog.Title className={cx('title')}>Menu</Dialog.Title>
            {/* <Dialog.Description className={cx('subtitle')}>
              Navigation and account actions.
            </Dialog.Description> */}
          </div>
          <Dialog.Close className={cx('closeButton')} aria-label="Close menu">
            <span />
            <span />
          </Dialog.Close>
        </div>

        <section className={cx('section')}>
          <p className={cx('sectionLabel')}>Navigation</p>
          <div className={cx('linkList')}>
            {navItems.map((item) => (
              <Dialog.Close asChild key={item.href}>
                <Link className={cx('listLink')} href={item.href}>
                  {item.label}
                </Link>
              </Dialog.Close>
            ))}
          </div>
        </section>

        <section className={cx('section', 'authSection')}>
          <p className={cx('sectionLabel')}>Account</p>
          {authContent}
        </section>

        <Copyright />
      </Dialog.Content>
    </Dialog.Portal>
  );
};

export default MobileMenuDrawer;
