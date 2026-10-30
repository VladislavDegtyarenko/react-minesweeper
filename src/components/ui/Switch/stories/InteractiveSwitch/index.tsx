import type { ComponentProps } from 'react';
import { useStoryValue } from '@/storybook/useStoryValue';
import Switch from '../../index';

type Props = ComponentProps<typeof Switch>;

const InteractiveSwitch = ({ checked, onCheckedChange, ...props }: Props) => {
  const [currentChecked, setCurrentChecked] = useStoryValue(checked);

  return (
    <Switch
      {...props}
      checked={currentChecked}
      onCheckedChange={(nextChecked) => {
        setCurrentChecked(nextChecked);
        onCheckedChange(nextChecked);
      }}
    />
  );
};

export default InteractiveSwitch;
