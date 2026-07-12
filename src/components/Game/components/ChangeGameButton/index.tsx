import { HomeIcon } from '@radix-ui/react-icons';
import Button from '@/components/ui/Button';
import { requestGameChange } from '@/store/game/actions';
import { createCx } from '@/utils';
import styles from './styles.module.scss';

const cx = createCx(styles);

const ChangeGameButton = () => {
  return (
    <Button
      className={cx('button')}
      type="button"
      variant="secondary"
      onClick={requestGameChange}
    >
      <HomeIcon width={18} height={18} /> Change Game
    </Button>
  );
};

export default ChangeGameButton;
