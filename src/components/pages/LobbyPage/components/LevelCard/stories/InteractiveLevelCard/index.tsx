import type { ComponentProps } from 'react';
import { useStoryValue } from '@/storybook/useStoryValue';
import LevelCard from '../../index';

type Props = ComponentProps<typeof LevelCard>;

const InteractiveLevelCard = ({ isSelected, onSelect, ...props }: Props) => {
  const [selected, setSelected] = useStoryValue(isSelected);

  return (
    <LevelCard
      {...props}
      isSelected={selected}
      onSelect={(levelId) => {
        setSelected(true);
        onSelect(levelId);
      }}
    />
  );
};

export default InteractiveLevelCard;
