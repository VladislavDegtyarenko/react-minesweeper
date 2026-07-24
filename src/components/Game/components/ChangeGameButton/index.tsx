import { HomeIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { LOBBY_SETUP_QUERY } from '@/config/routes';
import { requestGameChange } from '@/store/game/actions';
import { createCx } from '@/utils';
import styles from './styles.module.scss';

const cx = createCx(styles);

const ChangeGameButton = () => {
  const router = useRouter();

  const handleClick = () => {
    const didOpenDialog = requestGameChange();

    // No game in progress — skip the confirmation and go straight to the lobby.
    if (!didOpenDialog) {
      router.push(LOBBY_SETUP_QUERY.href);
    }
  };

  return (
    <Button
      className={cx('button')}
      type="button"
      variant="secondary"
      onClick={handleClick}
    >
      <HomeIcon width={18} height={18} /> Change Game
    </Button>
  );
};

export default ChangeGameButton;
