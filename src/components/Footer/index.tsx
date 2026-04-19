import Link from 'next/link';
import ROUTES from '@/config/routes.json';
import styles from './styles.module.scss';
import { createCx } from '@/utils';
import Copyright from '../Copyright';

const cx = createCx(styles);

const Footer = () => {
  return (
    <footer className={cx('footer')}>
      <nav className={cx('legalLinks')} aria-label="Legal">
        <Link href={ROUTES.PRIVACY}>Privacy Policy</Link>
        <Link href={ROUTES.TERMS_OF_SERVICE}>Terms of Service</Link>
      </nav>

      <div className={cx('credit', 'desktopOnly')}>
        <Copyright />
      </div>
    </footer>
  );
};

export default Footer;
