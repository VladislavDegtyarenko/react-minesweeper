import { Separator as RadixSeparator } from 'radix-ui';
import classNames from 'classnames/bind';
import styles from './styles.module.scss';

const cx = classNames.bind(styles);

const Separator = () => {
  return <RadixSeparator.Root className={cx('separator')} decorative={true} />;
};

export default Separator;
