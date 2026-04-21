import { useSettingsStore } from '@/store/settings';
import { selectZoom } from '@/store/settings/selectors';
import { motion } from 'framer-motion';
import styles from '../../styles.module.scss';
import { createCx } from '@/utils';

const cx = createCx(styles);

const Flag = () => {
  const zoom = useSettingsStore(selectZoom);

  return (
    <motion.img
      src="/themes/blue-graphite/icons/Flag.svg"
      alt="flag"
      className={cx('image', 'cellImage')}
      draggable={false}
      initial={{ opacity: 0, y: -50 * zoom }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
    />
  );
};

export default Flag;
