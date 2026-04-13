import { createCx } from '@/utils';
import styles from './styles.module.scss';

const cx = createCx(styles);

type Props = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  ariaLabel: string;
  disabled?: boolean;
  className?: string;
};

const Switch = (props: Props) => {
  const { checked, onCheckedChange, ariaLabel, disabled, className } = props;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      className={cx('switch', checked && 'checked', disabled && 'disabled', className)}
      onClick={() => {
        if (!disabled) {
          onCheckedChange(!checked);
        }
      }}
    >
      <span className={cx('thumb')} />
    </button>
  );
};

export default Switch;
