import clsx from "clsx";
import { memo } from "react";
import Button from "./Button";

type OptionLabel<T> = {
  value: T;
  label?: string;
};

type SelectButtonsProps<T> = {
  options: OptionLabel<T>[];
  selectedOption: T;
  onSelect: (option: T) => void;
  className?: string;
};

const SelectButtons = <T extends string | number | object>(
  props: SelectButtonsProps<T>
) => {
  const { options, selectedOption, onSelect, className } = props;

  return (
    <ul className={clsx("select-level", className)}>
      {options.map(({ value, label }) => (
        <li key={String(value)}>
          <Button
            isActive={value === selectedOption}
            onClick={() => onSelect(value)}
          >
            {label || String(value)}
          </Button>
        </li>
      ))}
    </ul>
  );
};

const MemoSelectButtons = memo(SelectButtons) as typeof SelectButtons;

export default MemoSelectButtons;
