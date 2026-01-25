import clsx from "clsx";
import { ButtonHTMLAttributes, PropsWithChildren } from "react";

type ButtonProps = PropsWithChildren<
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "disabled"> & {
    className?: string;
    isIcon?: boolean;
    isActive?: boolean;
    isDisabled?: boolean;
  }
>;

export default function Button(props: ButtonProps) {
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
      className={clsx(
        "button",
        "solid",
        isIcon && "icon",
        isActive ? "active" : isDisabled ? "disabled" : undefined,
        className
      )}
      onClick={!isDisabled ? onClick : undefined}
      disabled={isDisabled}
    >
      {children}
    </button>
  );
}
