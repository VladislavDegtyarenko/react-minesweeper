import { Separator as RadixSeparator } from 'radix-ui';
import styles from './styles.module.scss';
import { createCx } from '@/utils';

const cx = createCx(styles);

const Separator = () => {
  return <RadixSeparator.Root className={cx('separator')} decorative={true} />;
};

export default Separator;
