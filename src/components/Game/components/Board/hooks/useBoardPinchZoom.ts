import {
  useCallback,
  useEffect,
  useRef,
  type PointerEvent,
  type RefObject,
} from 'react';
import { clamp } from '@/utils';
import { cancelCellPointerSequence } from '@/game/board';
import { adjustZoom } from '@/store/settings/actions';
import { useSettingsStore } from '@/store/settings';
import { clampZoomToRange } from '@/store/settings/utils';
import {
  getIsPinchPerfDebugEnabled,
  recordPinchPerfFrameApplied,
  recordPinchPerfFrameScheduled,
  recordPinchPerfFrameSkipped,
  recordPinchPerfPhase,
  recordPinchPerfPointerMove,
} from '@/components/Game/debug/pinchPerf';
import { BOARD_VIEWPORT_CHANGE_EVENT } from '../constants';

type TouchPoint = {
  clientX: number;
  clientY: number;
};

type PendingZoom = {
  center: TouchPoint;
  zoom: number;
};

type Size = {
  height: number;
  width: number;
};

type ScrollPosition = {
  scrollLeft: number;
  scrollTop: number;
};

type PinchState = {
  boardHeight: number;
  boardLeft: number;
  boardTop: number;
  boardWidth: number;
  centerX: number;
  centerY: number;
  contentHeight: number;
  contentWidth: number;
  contentX: number;
  contentY: number;
  currentZoom: number;
  frameHeight: number;
  frameWidth: number;
  hasPreviewStarted: boolean;
  maxFrameHeight: number;
  startDistance: number;
  startZoom: number;
  surfaceHeight: number;
  surfaceLeft: number;
  surfaceTop: number;
  surfaceWidth: number;
};

type PanState = {
  hasStarted: boolean;
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startScrollLeft: number;
  startScrollTop: number;
};

type UseBoardPinchZoomOptions = {
  boardRef: RefObject<HTMLDivElement>;
  bleedFrameRef: RefObject<HTMLElement>;
  contentRef: RefObject<HTMLDivElement>;
  pinchSurfaceRef: RefObject<HTMLElement>;
};

const MIN_PINCH_DISTANCE = 1;
const PAN_START_THRESHOLD_PX = 6;
const ZOOM_CHANGE_EPSILON = 0.001;
const MAX_REASONABLE_INPUT_LAG_MS = 10_000;

const getTouchPoint = (event: PointerEvent<HTMLDivElement>): TouchPoint => ({
  clientX: event.clientX,
  clientY: event.clientY,
});

const getDistance = (first: TouchPoint, second: TouchPoint): number => {
  return Math.hypot(
    first.clientX - second.clientX,
    first.clientY - second.clientY,
  );
};

const getCenter = (first: TouchPoint, second: TouchPoint): TouchPoint => ({
  clientX: (first.clientX + second.clientX) / 2,
  clientY: (first.clientY + second.clientY) / 2,
});

const getPinchPoints = (
  activePointers: Map<number, TouchPoint>,
): [TouchPoint, TouchPoint] | undefined => {
  const [first, second] = Array.from(activePointers.values());

  if (!first || !second) {
    return undefined;
  }

  return [first, second];
};

const getContentSizeForScale = (
  pinchState: PinchState,
  scale: number,
): Size => {
  const rightPadding =
    pinchState.contentWidth - pinchState.surfaceLeft - pinchState.surfaceWidth;
  const bottomPadding =
    pinchState.contentHeight - pinchState.surfaceTop - pinchState.surfaceHeight;

  return {
    height:
      pinchState.surfaceTop + pinchState.surfaceHeight * scale + bottomPadding,
    width:
      pinchState.surfaceLeft + pinchState.surfaceWidth * scale + rightPadding,
  };
};

const clearPinchFrameSize = (frameElement: HTMLElement | null): void => {
  if (frameElement) {
    frameElement.style.width = '';
    frameElement.style.height = '';
  }
};

const getPinchFrameSizeForScale = (
  pinchState: PinchState,
  scale: number,
): Size => ({
  height: pinchState.frameHeight + pinchState.surfaceHeight * (scale - 1),
  width: pinchState.frameWidth + pinchState.surfaceWidth * (scale - 1),
});

const getBoardFrameSize = (pinchState: PinchState, contentSize: Size): Size => {
  // boardWidth/boardHeight is the rest viewport size, i.e. the content size
  // already capped by the board's max-width/max-height. When the board
  // overflows that viewport, (boardWidth - contentWidth) is negative; adding it
  // would shrink the frame below the viewport, and because `.board` is
  // `margin: 0 auto` the too-small frame gets centered and clips the grid on
  // both sides. The delta only ever stands in for frame chrome (border /
  // scrollbar), which is never negative, so floor it at zero. The CSS
  // max-width/max-height caps still bound the rendered frame from above.
  const frameChromeWidth = Math.max(
    0,
    pinchState.boardWidth - pinchState.contentWidth,
  );
  const frameChromeHeight = Math.max(
    0,
    pinchState.boardHeight - pinchState.contentHeight,
  );

  return {
    // The board's CSS max-height over-reserves vertical space, so growing the
    // inline height unbounded lets the frame (and the scaled surface it clips)
    // spill past the footer. maxFrameHeight is the real slot the flex layout
    // constrains the board to, captured at pinch start; cap the frame there.
    height: Math.min(
      contentSize.height + frameChromeHeight,
      pinchState.maxFrameHeight,
    ),
    width: contentSize.width + frameChromeWidth,
  };
};

const getScaledContentPosition = (
  pinchState: PinchState,
  zoom: number,
): { scale: number; x: number; y: number } => {
  const scale = zoom / pinchState.startZoom;

  return {
    scale,
    x:
      pinchState.surfaceLeft +
      (pinchState.contentX - pinchState.surfaceLeft) * scale,
    y:
      pinchState.surfaceTop +
      (pinchState.contentY - pinchState.surfaceTop) * scale,
  };
};

const getScrollPositionForZoom = (
  pinchState: PinchState,
  zoom: number,
  boardLeft: number,
  boardTop: number,
): ScrollPosition => {
  const scaledPosition = getScaledContentPosition(pinchState, zoom);

  return {
    scrollLeft: scaledPosition.x - (pinchState.centerX - boardLeft),
    scrollTop: scaledPosition.y - (pinchState.centerY - boardTop),
  };
};

const getClampedScrollPosition = (
  boardElement: HTMLElement,
  scrollPosition: ScrollPosition,
): ScrollPosition => {
  const maxScrollLeft = Math.max(
    0,
    boardElement.scrollWidth - boardElement.clientWidth,
  );
  const maxScrollTop = Math.max(
    0,
    boardElement.scrollHeight - boardElement.clientHeight,
  );

  return {
    scrollLeft: clamp(scrollPosition.scrollLeft, 0, maxScrollLeft),
    scrollTop: clamp(scrollPosition.scrollTop, 0, maxScrollTop),
  };
};

const getInputLagMs = (event: PointerEvent<HTMLDivElement>): number => {
  const inputLagMs = performance.now() - event.timeStamp;

  if (inputLagMs < 0 || inputLagMs > MAX_REASONABLE_INPUT_LAG_MS) {
    return 0;
  }

  return inputLagMs;
};

const rebasePinchPreview = (
  boardElement: HTMLElement,
  pinchState: PinchState,
  center: TouchPoint,
  distance: number,
) => {
  const offsetX = center.clientX - pinchState.boardLeft;
  const offsetY = center.clientY - pinchState.boardTop;

  pinchState.contentX = boardElement.scrollLeft + offsetX;
  pinchState.contentY = boardElement.scrollTop + offsetY;
  pinchState.centerX = center.clientX;
  pinchState.centerY = center.clientY;
  pinchState.startDistance = distance;
  pinchState.currentZoom = pinchState.startZoom;
  pinchState.hasPreviewStarted = true;
};

// Only called once a real pinch (2+ touches) is confirmed, never on a plain
// single-finger touchdown. Chrome's DevTools touch emulation synthesizes
// touch pointer events from mouse clicks, and capturing that synthetic
// pointer on every touchdown confuses Chrome's internal gesture dispatch,
// silently dropping the follow-up pointerup (taps stop registering) - a
// known Chrome-only quirk that doesn't affect real touch hardware. Deferring
// capture to actual pinches avoids it while still keeping pinch tracking
// robust if a finger drifts outside the board mid-gesture.
const capturePointer = (element: HTMLElement, pointerId: number): void => {
  try {
    if (!element.hasPointerCapture(pointerId)) {
      element.setPointerCapture(pointerId);
    }
  } catch {
    return undefined;
  }
};

const releasePointerCapture = (event: PointerEvent<HTMLDivElement>): void => {
  try {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  } catch {
    return undefined;
  }
};

export function useBoardPinchZoom({
  boardRef,
  bleedFrameRef,
  contentRef,
  pinchSurfaceRef,
}: UseBoardPinchZoomOptions) {
  const activePointersRef = useRef(new Map<number, TouchPoint>());
  const pinchedPointerIdsRef = useRef(new Set<number>());
  const pinchStateRef = useRef<PinchState | null>(null);
  const panStateRef = useRef<PanState | null>(null);
  const isPinchingRef = useRef(false);
  const pendingZoomRef = useRef<PendingZoom | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const commitFrameRef = useRef<number | null>(null);
  const commitGenerationRef = useRef(0);

  const cancelCommitFrame = useCallback(() => {
    commitGenerationRef.current += 1;

    if (commitFrameRef.current !== null) {
      window.cancelAnimationFrame(commitFrameRef.current);
      commitFrameRef.current = null;
    }
  }, []);

  const applyPendingZoom = useCallback(() => {
    const shouldRecordPerf = getIsPinchPerfDebugEnabled();
    const applyStartedAt = shouldRecordPerf ? performance.now() : 0;

    animationFrameRef.current = null;

    const pendingZoom = pendingZoomRef.current;
    pendingZoomRef.current = null;

    if (!pendingZoom) {
      if (shouldRecordPerf) {
        recordPinchPerfFrameSkipped('empty');
      }

      return undefined;
    }

    const boardElement = boardRef.current;
    const pinchFrameElement = bleedFrameRef.current;
    const contentElement = contentRef.current;
    const surfaceElement = pinchSurfaceRef.current;
    const pinchState = pinchStateRef.current;

    if (!boardElement || !contentElement || !surfaceElement || !pinchState) {
      if (shouldRecordPerf) {
        recordPinchPerfFrameSkipped('missing-element');
      }

      return undefined;
    }

    if (
      Math.abs(pendingZoom.zoom - pinchState.currentZoom) < ZOOM_CHANGE_EPSILON
    ) {
      if (shouldRecordPerf) {
        recordPinchPerfFrameSkipped('epsilon');
      }

      return undefined;
    }

    pinchState.centerX = pendingZoom.center.clientX;
    pinchState.centerY = pendingZoom.center.clientY;

    const { scale } = getScaledContentPosition(pinchState, pendingZoom.zoom);
    const contentSize = getContentSizeForScale(pinchState, scale);
    const frameSize = getBoardFrameSize(pinchState, contentSize);
    const pinchFrameSize = getPinchFrameSizeForScale(pinchState, scale);
    // The fixed-bleed wrapper does not receive the scale transform. Resize its
    // border box to the inner board's visual size so pinch-out cannot retain
    // the larger committed scroll range.
    if (pinchFrameElement) {
      pinchFrameElement.style.width = `${pinchFrameSize.width}px`;
      pinchFrameElement.style.height = `${pinchFrameSize.height}px`;
    }

    boardElement.style.width = `${frameSize.width}px`;
    boardElement.style.height = `${frameSize.height}px`;
    contentElement.style.width = `${contentSize.width}px`;
    contentElement.style.height = `${contentSize.height}px`;

    const rect = boardElement.getBoundingClientRect();
    const { scrollLeft, scrollTop } = getClampedScrollPosition(
      boardElement,
      getScrollPositionForZoom(
        pinchState,
        pendingZoom.zoom,
        rect.left,
        rect.top,
      ),
    );

    // The frame and spacer both follow the current preview size. Keeping the
    // spacer at max zoom creates fake scroll range, which lets fitted boards
    // drift out of the frame before they actually overflow.
    surfaceElement.style.transform = `scale(${scale})`;
    boardElement.scrollLeft = scrollLeft;
    boardElement.scrollTop = scrollTop;
    boardElement.dispatchEvent(new Event(BOARD_VIEWPORT_CHANGE_EVENT));
    pinchState.currentZoom = pendingZoom.zoom;

    if (shouldRecordPerf) {
      recordPinchPerfFrameApplied({
        applyMs: performance.now() - applyStartedAt,
        scale,
        scrollWrites: 2,
        zoom: pendingZoom.zoom,
      });
    }
  }, [bleedFrameRef, boardRef, contentRef, pinchSurfaceRef]);

  const scheduleZoom = useCallback(
    (pendingZoom: PendingZoom) => {
      pendingZoomRef.current = pendingZoom;

      if (animationFrameRef.current !== null) {
        return undefined;
      }

      recordPinchPerfFrameScheduled();
      animationFrameRef.current =
        window.requestAnimationFrame(applyPendingZoom);
    },
    [applyPendingZoom],
  );

  const startPinch = useCallback(
    (event: PointerEvent<HTMLDivElement>): boolean => {
      const pinchPoints = getPinchPoints(activePointersRef.current);
      const boardElement = boardRef.current;
      const pinchFrameElement = bleedFrameRef.current;
      const contentElement = contentRef.current;
      const surfaceElement = pinchSurfaceRef.current;

      if (!pinchPoints || !boardElement || !contentElement || !surfaceElement) {
        return false;
      }

      cancelCommitFrame();

      const [firstPoint, secondPoint] = pinchPoints;
      const startDistance = getDistance(firstPoint, secondPoint);

      if (startDistance < MIN_PINCH_DISTANCE) {
        return false;
      }

      pinchedPointerIdsRef.current.clear();
      activePointersRef.current.forEach((_, pointerId) => {
        pinchedPointerIdsRef.current.add(pointerId);
        capturePointer(boardElement, pointerId);
      });
      const center = getCenter(firstPoint, secondPoint);

      boardElement.style.width = '';
      boardElement.style.height = '';
      contentElement.style.width = '';
      contentElement.style.height = '';
      surfaceElement.style.transform = '';
      clearPinchFrameSize(pinchFrameElement);

      const rect = boardElement.getBoundingClientRect();
      const contentRect = contentElement.getBoundingClientRect();
      const surfaceRect = surfaceElement.getBoundingClientRect();
      const offsetX = center.clientX - rect.left;
      const offsetY = center.clientY - rect.top;
      const startZoom = useSettingsStore.getState().zoom;

      // Capture the vertical slot the flex layout actually allows the board.
      // The board's CSS max-height over-reserves space (the game panel is
      // vertically centered, so the board starts lower than the static reserve
      // assumes), so relying on it lets the pinch frame - and the scaled
      // surface it clips - grow past the footer. Forcing the content to
      // overflow reveals the true slot; restore immediately, this is a
      // throwaway measurement taken while the content styles are still cleared.
      contentElement.style.height = '1000000px';
      const maxFrameHeight = boardElement.clientHeight;
      contentElement.style.height = '';

      const pinchState: PinchState = {
        boardHeight: rect.height,
        boardLeft: rect.left,
        boardTop: rect.top,
        boardWidth: rect.width,
        centerX: center.clientX,
        centerY: center.clientY,
        contentHeight: contentElement.offsetHeight,
        contentWidth: contentElement.offsetWidth,
        contentX: boardElement.scrollLeft + offsetX,
        contentY: boardElement.scrollTop + offsetY,
        currentZoom: startZoom,
        frameHeight:
          pinchFrameElement?.offsetHeight ?? surfaceElement.offsetHeight,
        frameWidth:
          pinchFrameElement?.offsetWidth ?? surfaceElement.offsetWidth,
        hasPreviewStarted: false,
        maxFrameHeight,
        startDistance,
        startZoom,
        surfaceHeight: surfaceElement.offsetHeight,
        surfaceLeft: surfaceRect.left - contentRect.left,
        surfaceTop: surfaceRect.top - contentRect.top,
        surfaceWidth: surfaceElement.offsetWidth,
      };

      pinchStateRef.current = pinchState;

      // Keep the centered frame stable while the second touch starts.
      boardElement.style.width = `${rect.width}px`;
      boardElement.style.height = `${rect.height}px`;

      surfaceElement.style.willChange = 'transform';
      panStateRef.current = null;
      isPinchingRef.current = true;
      recordPinchPerfPhase('pinch', activePointersRef.current.size);
      cancelCellPointerSequence();
      event.preventDefault();

      return true;
    },
    [bleedFrameRef, boardRef, cancelCommitFrame, contentRef, pinchSurfaceRef],
  );

  const commitPinchZoom = useCallback(() => {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
      applyPendingZoom();
    }

    const pinchState = pinchStateRef.current;
    const boardElement = boardRef.current;
    const pinchFrameElement = bleedFrameRef.current;
    const contentElement = contentRef.current;
    const surfaceElement = pinchSurfaceRef.current;

    if (!pinchState || !contentElement || !surfaceElement) {
      return undefined;
    }

    const finalZoom = pinchState.currentZoom;
    if (
      Math.abs(finalZoom - useSettingsStore.getState().zoom) >=
      ZOOM_CHANGE_EPSILON
    ) {
      adjustZoom(finalZoom);
    }

    recordPinchPerfPhase('commit', activePointersRef.current.size);

    cancelCommitFrame();
    const commitGeneration = commitGenerationRef.current;

    commitFrameRef.current = window.requestAnimationFrame(() => {
      if (commitGeneration !== commitGenerationRef.current) {
        return undefined;
      }

      commitFrameRef.current = null;
      contentElement.style.width = '';
      contentElement.style.height = '';
      surfaceElement.style.transform = '';
      surfaceElement.style.willChange = '';
      clearPinchFrameSize(pinchFrameElement);

      if (boardElement) {
        boardElement.style.width = '';
        boardElement.style.height = '';
        const rect = boardElement.getBoundingClientRect();
        const { scrollLeft, scrollTop } = getClampedScrollPosition(
          boardElement,
          getScrollPositionForZoom(pinchState, finalZoom, rect.left, rect.top),
        );

        boardElement.scrollLeft = scrollLeft;
        boardElement.scrollTop = scrollTop;
        boardElement.dispatchEvent(new Event(BOARD_VIEWPORT_CHANGE_EVENT));
      }
    });
  }, [
    applyPendingZoom,
    bleedFrameRef,
    boardRef,
    cancelCommitFrame,
    contentRef,
    pinchSurfaceRef,
  ]);

  const onPointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>): boolean => {
      if (event.pointerType !== 'touch') {
        return false;
      }

      activePointersRef.current.set(event.pointerId, getTouchPoint(event));
      recordPinchPerfPhase('pan', activePointersRef.current.size);

      if (isPinchingRef.current) {
        pinchedPointerIdsRef.current.add(event.pointerId);
        event.preventDefault();

        return true;
      }

      if (activePointersRef.current.size < 2) {
        panStateRef.current = {
          hasStarted: false,
          pointerId: event.pointerId,
          startClientX: event.clientX,
          startClientY: event.clientY,
          startScrollLeft: event.currentTarget.scrollLeft,
          startScrollTop: event.currentTarget.scrollTop,
        };

        return false;
      }

      return startPinch(event);
    },
    [startPinch],
  );

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>): boolean => {
      if (event.pointerType !== 'touch') {
        return false;
      }

      if (activePointersRef.current.has(event.pointerId)) {
        activePointersRef.current.set(event.pointerId, getTouchPoint(event));
      }

      if (getIsPinchPerfDebugEnabled()) {
        recordPinchPerfPointerMove(
          activePointersRef.current.size,
          getInputLagMs(event),
        );
      }

      if (!isPinchingRef.current && activePointersRef.current.size >= 2) {
        return startPinch(event);
      }

      const shouldBlockPointer =
        isPinchingRef.current ||
        pinchedPointerIdsRef.current.has(event.pointerId);

      const pinchState = pinchStateRef.current;
      const pinchPoints = getPinchPoints(activePointersRef.current);

      if (isPinchingRef.current && pinchState && pinchPoints) {
        const [firstPoint, secondPoint] = pinchPoints;
        const nextDistance = getDistance(firstPoint, secondPoint);
        const center = getCenter(firstPoint, secondPoint);

        if (!pinchState.hasPreviewStarted) {
          const boardElement = boardRef.current;

          if (!boardElement) {
            return true;
          }

          rebasePinchPreview(boardElement, pinchState, center, nextDistance);
          event.preventDefault();

          return true;
        }

        const nextZoom = clampZoomToRange(
          pinchState.startZoom * (nextDistance / pinchState.startDistance),
        );

        scheduleZoom({
          center,
          zoom: nextZoom,
        });

        event.preventDefault();

        return true;
      }

      if (shouldBlockPointer) {
        event.preventDefault();

        return true;
      }

      const panState = panStateRef.current;

      if (panState?.pointerId !== event.pointerId) {
        return false;
      }

      const deltaX = event.clientX - panState.startClientX;
      const deltaY = event.clientY - panState.startClientY;
      const panDistance = Math.hypot(deltaX, deltaY);

      if (!panState.hasStarted) {
        if (panDistance < PAN_START_THRESHOLD_PX) {
          return false;
        }

        panState.hasStarted = true;
        cancelCellPointerSequence();
      }

      const boardElement = event.currentTarget;
      boardElement.scrollLeft = panState.startScrollLeft - deltaX;
      boardElement.scrollTop = panState.startScrollTop - deltaY;
      event.preventDefault();

      return true;
    },
    [boardRef, scheduleZoom, startPinch],
  );

  const onPointerEnd = useCallback(
    (event: PointerEvent<HTMLDivElement>): boolean => {
      if (event.pointerType !== 'touch') {
        return false;
      }

      const shouldBlockPointer =
        isPinchingRef.current ||
        pinchedPointerIdsRef.current.has(event.pointerId) ||
        (panStateRef.current?.pointerId === event.pointerId &&
          panStateRef.current.hasStarted);

      activePointersRef.current.delete(event.pointerId);
      releasePointerCapture(event);

      const wasPinching = isPinchingRef.current;

      if (activePointersRef.current.size < 2) {
        isPinchingRef.current = false;
        if (wasPinching) {
          commitPinchZoom();
        }
        pinchStateRef.current = null;
      }

      if (panStateRef.current?.pointerId === event.pointerId) {
        panStateRef.current = null;
      }

      if (activePointersRef.current.size === 0) {
        pinchedPointerIdsRef.current.clear();
        recordPinchPerfPhase('idle', 0);
      }

      if (!shouldBlockPointer) {
        return false;
      }

      event.preventDefault();

      return true;
    },
    [commitPinchZoom],
  );

  useEffect(() => {
    const activePointers = activePointersRef.current;
    const pinchedPointerIds = pinchedPointerIdsRef.current;
    const boardElement = boardRef.current;
    const pinchFrameElement = bleedFrameRef.current;
    const contentElement = contentRef.current;
    const surfaceElement = pinchSurfaceRef.current;

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }

      cancelCommitFrame();
      activePointers.clear();
      pinchedPointerIds.clear();
      panStateRef.current = null;

      if (boardElement) {
        boardElement.style.width = '';
        boardElement.style.height = '';
      }

      if (contentElement) {
        contentElement.style.width = '';
        contentElement.style.height = '';
      }

      if (surfaceElement) {
        surfaceElement.style.transform = '';
        surfaceElement.style.willChange = '';
      }

      clearPinchFrameSize(pinchFrameElement);
    };
  }, [bleedFrameRef, boardRef, cancelCommitFrame, contentRef, pinchSurfaceRef]);

  return {
    onPointerCancel: onPointerEnd,
    onPointerDown,
    onPointerMove,
    onPointerUp: onPointerEnd,
  };
}
