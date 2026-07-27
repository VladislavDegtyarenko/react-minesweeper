import { useEffect, type RefObject } from 'react';

type UseBoardTouchDefaultSuppressionOptions = {
  boardRef: RefObject<HTMLElement>;
};

/**
 * Cancels the native touch defaults on the board frame.
 *
 * iOS runs a text-interaction gesture recognizer above the DOM: a tap →
 * release → press-and-hold sequence opens the selection magnifier over any
 * content, canvas included. Neither `-webkit-user-select: none`,
 * `-webkit-touch-callout: none`, `touch-action: none`, nor a viewport with
 * `user-scalable=no` (ignored by iOS Safari since iOS 10) suppresses it. The
 * recognizer only stands down when the page calls `preventDefault()` on a
 * non-passive native `touchstart`.
 *
 * React cannot do this for us: it registers `touchstart` and `touchmove` as
 * passive listeners on the root container, so `preventDefault()` inside
 * `onTouchStart` is a silent no-op. `preventDefault()` on `pointerdown` does
 * not help either — per the Pointer Events spec it does not cancel native
 * touch behaviour.
 *
 * Nothing is lost here: the board sets `touch-action: none` and pans/pinches
 * through its own pointer handlers, so no native scrolling depends on these
 * defaults. Pointer events keep firing; only the synthesized mouse/click
 * compatibility events and the system gestures are dropped.
 */
export function useBoardTouchDefaultSuppression({
  boardRef,
}: UseBoardTouchDefaultSuppressionOptions) {
  useEffect(() => {
    const boardElement = boardRef.current;

    if (!boardElement) {
      return undefined;
    }

    const suppressTouchDefault = (event: TouchEvent) => {
      if (event.cancelable) {
        event.preventDefault();
      }
    };

    boardElement.addEventListener('touchstart', suppressTouchDefault, {
      passive: false,
    });
    boardElement.addEventListener('touchmove', suppressTouchDefault, {
      passive: false,
    });

    return () => {
      boardElement.removeEventListener('touchstart', suppressTouchDefault);
      boardElement.removeEventListener('touchmove', suppressTouchDefault);
    };
  }, [boardRef]);
}
