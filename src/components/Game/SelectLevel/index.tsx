import { LEVELS_CONFIG } from '@/constants';
import { useGameStore } from '@/store/game';
import { changeLevel } from '@/store/game/actions';

import { memo } from 'react';
import SelectButtons from '../../ui/SelectButtons';

import styles from './styles.module.scss';
import classNames from 'classnames/bind';
const cx = classNames.bind(styles);

const SelectLevel = memo(() => {
  const levelOptions = LEVELS_CONFIG.map((level) => ({
    value: level.id,
    label: level.label,
  }));
  const selectedLevelId = useGameStore((state) => state.level).id;

  return (
    <SelectButtons
      options={levelOptions}
      selectedOption={selectedLevelId}
      onSelect={changeLevel}
      className={cx('root')}
    />
  );
});

export default SelectLevel;
