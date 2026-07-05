import { CalendarIcon, PlayIcon } from '@radix-ui/react-icons';
import { createCx } from '@/utils';
import { MODE_OPTIONS } from '../../constants';
import type { IntroMode } from '../../types';
import LobbyCard from '../LobbyCard';
import SetupLabel from '../SetupLabel';
import styles from './styles.module.scss';

const cx = createCx(styles);
const MODE_LABEL_ID = 'intro-mode-label';

type ModeSelectorProps = {
  selectedMode: IntroMode | null;
  onModeChange: (mode: IntroMode) => void;
};

const ModeSelector = ({ selectedMode, onModeChange }: ModeSelectorProps) => {
  return (
    <section className={cx('wrapper')} aria-labelledby={MODE_LABEL_ID}>
      <SetupLabel id={MODE_LABEL_ID}>Mode</SetupLabel>

      <div aria-labelledby={MODE_LABEL_ID} className={cx('cards')} role="group">
        {MODE_OPTIONS.map((mode) => {
          const { value, label, eyebrow, description, badge } = mode;
          const Icon = value === 'daily' ? CalendarIcon : PlayIcon;

          return (
            <LobbyCard
              key={value}
              ariaLabel={`${label}: ${description}`}
              badge={badge}
              description={description}
              eyebrow={eyebrow}
              isSelected={selectedMode === value}
              title={label}
              titleIcon={<Icon />}
              onSelect={() => onModeChange(value)}
            />
          );
        })}
      </div>
    </section>
  );
};

export default ModeSelector;
