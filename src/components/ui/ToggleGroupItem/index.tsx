import { ToggleGroup } from 'radix-ui';
import styles from './styles.module.scss';

type Props = {
  value: number | string;
  label: string;
};

const ToggleGroupItem = ({ value, label }: Props) => {
  return (
    <ToggleGroup.Item
      className={styles.toggleGroupItem}
      value={String(value)}
      aria-label={label}
      title={label}
    >
      {label || value}
    </ToggleGroup.Item>
  );
};

export default ToggleGroupItem;
