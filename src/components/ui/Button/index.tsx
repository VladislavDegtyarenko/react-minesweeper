import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import styles from './styles.module.scss';
import { createCx } from '@/utils';

const cx = createCx(styles);

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = PropsWithChildren<
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> & {
    className?: string;
    isIcon?: boolean;
    isActive?: boolean;
    isDisabled?: boolean;
    variant?: ButtonVariant;
  }
>;

const Button = (props: ButtonProps) => {
  const {
    className,
    isIcon,
    isActive,
    isDisabled,
    variant,
    onClick,
    children,
    ...buttonProps
  } = props;

  return (
    <button
      {...buttonProps}
      className={cx(
        'button',
        !variant && 'solid',
        isIcon && 'icon',
        isActive && 'active',
        !isActive && isDisabled && 'disabled',
        variant,
        className,
      )}
      onClick={!isDisabled ? onClick : undefined}
      disabled={isDisabled}
    >
      {children}
    </button>
  );
};

export default Button;
