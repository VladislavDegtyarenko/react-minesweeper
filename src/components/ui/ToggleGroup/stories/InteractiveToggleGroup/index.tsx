import type { ComponentProps } from 'react';
import { LEVELS_CONFIG } from '@/config';
import ToggleGroupItem from '@/components/ui/ToggleGroupItem';
import { useStoryValue } from '@/storybook/useStoryValue';
import ToggleGroup from '../../index';

type Props = Extract<ComponentProps<typeof ToggleGroup>, { type: 'single' }>;

const InteractiveToggleGroup = ({
  value = '',
  onValueChange,
  ...props
}: Props) => {
  const [currentValue, setCurrentValue] = useStoryValue(value);

  return (
    <ToggleGroup
      {...props}
      value={currentValue}
      onValueChange={(nextValue: string) => {
        // Difficulty requires a selection; Radix otherwise permits deselection.
        if (!nextValue) {
          return undefined;
        }

        setCurrentValue(nextValue);
        onValueChange?.(nextValue);
      }}
    >
      {LEVELS_CONFIG.map((level) => (
        <ToggleGroupItem
          key={level.id}
          value={level.id}
          label={level.label}
          ariaLabel={level.label}
        />
      ))}
    </ToggleGroup>
  );
};

export default InteractiveToggleGroup;
