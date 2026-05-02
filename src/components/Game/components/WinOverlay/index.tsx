import { createCx } from '@/utils';
import styles from './styles.module.scss';
import WinDialog from './components/WinDialog';
import { useWinOverlay } from './hooks/useWinOverlay';

const cx = createCx(styles);

const WinOverlay = () => {
  const { gameStatus, presentation, setConfettiCanvas } = useWinOverlay();
  console.log('presentation: ', presentation);

  if (gameStatus !== 'won') {
    return null;
  }

  if (!presentation.lastWinSummary) {
    return <canvas ref={setConfettiCanvas} className={cx('confettiCanvas')} />;
  }

  return (
    <>
      <canvas ref={setConfettiCanvas} className={cx('confettiCanvas')} />
      <WinDialog {...presentation} />
    </>
  );
};

export default WinOverlay;
