import classNames from 'classnames/bind';
import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import styles from './styles.module.scss';

const cx = classNames.bind(styles);

type ButtonProps = PropsWithChildren<
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> & {
    className?: string;
    isIcon?: boolean;
    isActive?: boolean;
    isDisabled?: boolean;
  }
>;

const Button = (props: ButtonProps) => {
  const {
    className,
    isIcon,
    isActive,
    isDisabled,
    onClick,
    children,
    ...buttonProps
  } = props;

  return (
    <button
      {...buttonProps}
      className={cx(
        'button',
        'solid',
        isIcon && 'icon',
        isActive && 'active',
        !isActive && isDisabled && 'disabled',
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
