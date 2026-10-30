import { useEffect, useState } from 'react';

/** Keeps example state interactive while applying changes from Storybook Controls. */
export function useStoryValue<T>(value: T) {
  const [currentValue, setCurrentValue] = useState(value);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  return [currentValue, setCurrentValue] as const;
}
