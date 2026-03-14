import Link from 'next/link';
import ROUTES from '@/config/routes.json';

import classNames from 'classnames/bind';
import styles from './styles.module.scss';
const cx = classNames.bind(styles);

const NAV_ITEMS = [
  {
    label: 'Game',
    href: ROUTES.GAME,
  },
  {
    label: 'How To Play',
    href: ROUTES.HOW_TO_PLAY,
  },
];

const Header = () => {
  return (
    <header className={cx('header')}>
      <div className={cx('logo')}>Minesweeper</div>
      <nav>
        <ul>
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
