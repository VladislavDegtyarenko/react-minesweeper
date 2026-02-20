import styles from './styles.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

const TextContent = ({ children }: { children: React.ReactNode }) => {
  return <div className={cx('textContent')}>{children}</div>;
};

export default TextContent;
