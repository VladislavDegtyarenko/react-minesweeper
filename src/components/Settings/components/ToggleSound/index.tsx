import ToggleGroup from '@/components/ui/ToggleGroup';
import ToggleGroupItem from '@/components/ui/ToggleGroupItem';
import { useSFXStore } from '@/store/sfx';
import { setMuteSFX } from '@/store/sfx/actions';

const SOUND_TOGGLE_VALUES = {
  On: 'on',
  Off: 'off',
} as const;

const SOUND_TOGGLE_OPTIONS = [
  { value: SOUND_TOGGLE_VALUES.On, label: 'On' },
  { value: SOUND_TOGGLE_VALUES.Off, label: 'Off' },
] as const;

const SOUND_LABEL = 'Sound';

const ToggleSound = () => {
  const isMuted = useSFXStore((state) => state.isMuted);
  const soundValue = isMuted ? SOUND_TOGGLE_VALUES.Off : SOUND_TOGGLE_VALUES.On;

  const handleSoundChange = (value: string) => {
    if (!value) {
      return undefined;
    }

    setMuteSFX(value === SOUND_TOGGLE_VALUES.Off);
  };

  return (
    <ToggleGroup
      label={SOUND_LABEL}
      type="single"
      value={soundValue}
      defaultValue={soundValue}
      aria-label={SOUND_LABEL}
      onValueChange={handleSoundChange}
      loop={true}
    >
      {SOUND_TOGGLE_OPTIONS.map((option) => (
        <ToggleGroupItem
          key={option.value}
          value={option.value}
          label={option.label}
        />
      ))}
    </ToggleGroup>
  );
};

export default ToggleSound;
