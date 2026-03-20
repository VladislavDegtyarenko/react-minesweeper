import Switch from '@/components/ui/Switch';
import { useSFXStore } from '@/store/sfx';
import { setMuteSFX } from '@/store/sfx/actions';
import classNames from 'classnames/bind';
import styles from '../styles.module.scss';

const cx = classNames.bind(styles);

const SOUND_LABEL = 'Sound';
const SOUND_SWITCH_ARIA_LABEL = 'Sound';

const ToggleSound = () => {
  const isMuted = useSFXStore((state) => state.isMuted);

  return (
    <div className={cx('row')}>
      <span className={cx('label')}>{SOUND_LABEL}</span>
      <Switch
        checked={!isMuted}
        onCheckedChange={(checked) => setMuteSFX(!checked)}
        ariaLabel={SOUND_SWITCH_ARIA_LABEL}
      />
    </div>
  );
};

export default ToggleSound;
