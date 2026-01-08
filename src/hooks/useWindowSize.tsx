import { useEffect, useMemo, useState } from "react";
import { debounce } from "../utils";

type WindowSize = {
  width: number;
  height: number;
};

/**
 * Returns the current window dimensions.
 * @returns Window width and height, or zeros if running on server.
 */
const getWindowSize = (): WindowSize => {
  if (typeof window === "undefined") {
    return { width: 0, height: 0 };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
};

/**
 * Tracks browser window dimensions with debounced resize handling.
 * @param delay - Debounce delay in milliseconds. Defaults to 150ms.
 * @returns Current window width and height.
 * @example
 * const { width, height } = useWindowSize();
 * const { width } = useWindowSize(300); // Custom debounce delay
 */
const useWindowSize = (delay = 150): WindowSize => {
  const [size, setSize] = useState<WindowSize>(getWindowSize);

  const debouncedResize = useMemo(
    () => debounce(() => setSize(getWindowSize()), delay),
    [delay]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    debouncedResize();
    window.addEventListener("resize", debouncedResize);

    return () => {
      window.removeEventListener("resize", debouncedResize);
      debouncedResize.cancel();
    };
  }, [debouncedResize]);

  return size;
};

export default useWindowSize;
