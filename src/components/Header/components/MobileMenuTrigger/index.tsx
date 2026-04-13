import Button from '@/components/ui/Button';
import { createCx } from '@/utils';
import styles from './styles.module.scss';

const cx = createCx(styles);

type Props = {
  isOpen: boolean;
};

const MobileMenuTrigger = ({ isOpen }: Props) => {
  return (
    <Button
      isIcon
      aria-expanded={isOpen}
      aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
      className={cx('trigger')}
    >
      <span className={cx('bars')}>
        <span />
        <span />
        <span />
      </span>
    </Button>
  );
};

export default MobileMenuTrigger;
