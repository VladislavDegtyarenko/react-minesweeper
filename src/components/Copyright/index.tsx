import ExternalLinkIcon from '@/assets/ExternalLinkIcon';
import styles from './styles.module.scss';
import { createCx } from '@/utils';
const cx = createCx(styles);

const Copyright = () => {
  return (
    <span className={cx('copyright')}>
      &copy; Copyright {new Date().getFullYear()}.{' '}
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
    </span>
  );
};

export default Copyright;
