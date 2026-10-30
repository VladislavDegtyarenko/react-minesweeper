import * as Dialog from '@radix-ui/react-dialog';
import Button from '@/components/ui/Button';
import { createCx } from '@/utils';
import styles from './styles.module.scss';

const cx = createCx(styles);

type Props = {
  gameTitle: string;
  onStartNew: () => void;
};

const StartNewGameDialog = ({ gameTitle, onStartNew }: Props) => {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className={cx('dialogOverlay')} />
      <Dialog.Content className={cx('dialogContent')}>
        <div className={cx('dialogBody')}>
          <Dialog.Title className={cx('dialogTitle')}>
            Start a new game?
          </Dialog.Title>
          <Dialog.Description className={cx('dialogDescription')}>
            Your saved {gameTitle} board will be discarded.
          </Dialog.Description>
          <div className={cx('dialogActions')}>
            <Dialog.Close asChild>
              <Button type="button" variant="secondary">
                Keep Playing
              </Button>
            </Dialog.Close>
            <Dialog.Close asChild>
              <Button type="button" variant="primary" onClick={onStartNew}>
                Start New Game
              </Button>
            </Dialog.Close>
          </div>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  );
};

export default StartNewGameDialog;
