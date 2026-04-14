import Switch from '@/components/ui/Switch';
import { useSFXStore } from '@/store/sfx';
import { setMuteSFX } from '@/store/sfx/actions';
import { createCx } from '@/utils';
import styles from '../styles.module.scss';

const cx = createCx(styles);

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
