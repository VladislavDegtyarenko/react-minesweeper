import styles from './styles.module.scss';
import { createCx } from '@/utils';

const cx = createCx(styles);

const TextContent = ({ children }: { children: React.ReactNode }) => {
  return <div className={cx('textContent')}>{children}</div>;
};

export default TextContent;
