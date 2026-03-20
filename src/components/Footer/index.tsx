import styles from './styles.module.scss';
import classNames from 'classnames/bind';
import ExternalLinkIcon from '@/assets/ExternalLinkIcon';

const cx = classNames.bind(styles);

const Footer = () => {
  return (
    <footer className={cx('footer')}>
      <div>
        &copy; Copyright {new Date().getFullYear()}. Created by{' '}
        <a
          href="https://vd-developer.online/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Vladyslav Dihtiarenko
          <span className={cx('externalLinkIcon')} aria-hidden>
            <ExternalLinkIcon />
          </span>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
