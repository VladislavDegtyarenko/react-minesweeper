import { useSettingsStore } from '@/store/settings';
import { selectZoom } from '@/store/settings/selectors';
import { motion } from 'framer-motion';
import styles from '../../styles.module.scss';
import { createCx } from '@/utils';

const cx = createCx(styles);

const QuestionMark = () => {
  const zoom = useSettingsStore(selectZoom);

  return (
    <motion.img
      src="/themes/blue-graphite/icons/Question.png"
      alt="question"
      className={cx('image', 'cellImage')}
      initial={{ opacity: 0, y: -50 * zoom }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
    />
  );
};

export default QuestionMark;
