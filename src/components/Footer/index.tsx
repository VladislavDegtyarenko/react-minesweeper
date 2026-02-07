import styles from './styles.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

const Footer = () => {
  return (
    <footer className={cx('footer')}>
      <div>
        &copy; Copyright {new Date().getFullYear()}. Created by{' '}
        <a href="https://vd-developer.online/" target="/blank">
          Vladyslav Dihtiarenko
        </a>
      </div>
    </footer>
  );
};

export default Footer;
