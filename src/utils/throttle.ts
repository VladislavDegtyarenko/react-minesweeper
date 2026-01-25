/**
 * Limits how often a function can be executed over a period of time.
 * Executes immediately (leading edge) and once more after the period ends (trailing edge).
 *
 * @param func The function to throttle.
 * @param limit The time limit (cooldown period) in milliseconds.
 * @returns A new function that throttles calls to the original function.
 *
 * @example
 * const throttledFunction = throttle(func, 1000);
 * throttledFunction();
 * throttledFunction();
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean = false;
  let lastArgs: Parameters<T> | null = null;
  let lastThis: ThisParameterType<T> | null = null;
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>): void {
    const context = this;

    if (!inThrottle) {
      // 1. Leading Edge: Execute immediately
      func.apply(context, args);
      inThrottle = true;

      // Set up the cooldown period
      timeout = setTimeout(() => {
        inThrottle = false;
        timeout = null;

        // 2. Trailing Edge: Execute one final time if there were calls during the throttle period
        if (lastArgs) {
          func.apply(lastThis, lastArgs);
          lastArgs = null;
          lastThis = null;
        }
      }, limit);
    } else {
      // Store the arguments and context of the latest call for the trailing edge
      lastArgs = args;
      lastThis = context;
    }
  };
};
