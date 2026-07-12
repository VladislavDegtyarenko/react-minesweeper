import {
  useCallback,
  useEffect,
  useRef,
  type PointerEvent,
  type RefObject,
} from 'react';
import { cancelCellPointerSequence } from '@/game/board';
import { adjustZoom } from '@/store/settings/actions';
import { useSettingsStore } from '@/store/settings';
import { MAX_ZOOM } from '@/store/settings/constants';
import { clampZoomToRange } from '@/store/settings/utils';
import {
  getIsPinchPerfDebugEnabled,
  recordPinchPerfFrameApplied,
  recordPinchPerfFrameScheduled,
  recordPinchPerfFrameSkipped,
  recordPinchPerfPhase,
  recordPinchPerfPointerMove,
} from '@/components/Game/debug/pinchPerf';

type TouchPoint = {
  clientX: number;
  clientY: number;
};

type PendingZoom = {
  center: TouchPoint;
  zoom: number;
};

type PinchState = {
  boardLeft: number;
  boardTop: number;
  contentHeight: number;
  contentWidth: number;
  contentX: number;
  contentY: number;
  currentZoom: number;
  hasPreviewStarted: boolean;
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
  contentRef: RefObject<HTMLDivElement>;
  surfaceRef: RefObject<HTMLDivElement>;
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
): { height: number; width: number } => {
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
  contentRef,
  surfaceRef,
}: UseBoardPinchZoomOptions) {
  const activePointersRef = useRef(new Map<number, TouchPoint>());
  const pinchedPointerIdsRef = useRef(new Set<number>());
  const pinchStateRef = useRef<PinchState | null>(null);
  const panStateRef = useRef<PanState | null>(null);
  const isPinchingRef = useRef(false);
  const pendingZoomRef = useRef<PendingZoom | null>(null);
  const animationFrameRef = useRef<number | null>(null);

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

      return;
    }

    const boardElement = boardRef.current;
    const contentElement = contentRef.current;
    const surfaceElement = surfaceRef.current;
    const pinchState = pinchStateRef.current;

    if (!boardElement || !contentElement || !surfaceElement || !pinchState) {
      if (shouldRecordPerf) {
        recordPinchPerfFrameSkipped('missing-element');
      }

      return;
    }

    if (
      Math.abs(pendingZoom.zoom - pinchState.currentZoom) < ZOOM_CHANGE_EPSILON
    ) {
      if (shouldRecordPerf) {
        recordPinchPerfFrameSkipped('epsilon');
      }

      return;
    }

    const offsetX = pendingZoom.center.clientX - pinchState.boardLeft;
    const offsetY = pendingZoom.center.clientY - pinchState.boardTop;
    const scale = pendingZoom.zoom / pinchState.startZoom;
    const scaledContentX =
      pinchState.surfaceLeft +
      (pinchState.contentX - pinchState.surfaceLeft) * scale;
    const scaledContentY =
      pinchState.surfaceTop +
      (pinchState.contentY - pinchState.surfaceTop) * scale;

    // PERF PROBE: content spacer is pre-sized once in startPinch (to the max
    // scale this gesture can reach) instead of being resized every frame here.
    // This isolates whether the per-frame width/height writes (layout) were
    // the FPS culprit, vs. transform/scroll (compositor-only) writes.
    surfaceElement.style.transform = `scale(${scale})`;
    boardElement.scrollLeft = scaledContentX - offsetX;
    boardElement.scrollTop = scaledContentY - offsetY;
    pinchState.currentZoom = pendingZoom.zoom;

    if (shouldRecordPerf) {
      recordPinchPerfFrameApplied({
        applyMs: performance.now() - applyStartedAt,
        scale,
        scrollWrites: 2,
        zoom: pendingZoom.zoom,
      });
    }
  }, [boardRef, contentRef, surfaceRef]);

  const scheduleZoom = useCallback(
    (pendingZoom: PendingZoom) => {
      pendingZoomRef.current = pendingZoom;

      if (animationFrameRef.current !== null) {
        return;
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
      const contentElement = contentRef.current;
      const surfaceElement = surfaceRef.current;

      if (!pinchPoints || !boardElement || !contentElement || !surfaceElement) {
        return false;
      }

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

      contentElement.style.width = '';
      contentElement.style.height = '';
      surfaceElement.style.transform = '';

      const rect = boardElement.getBoundingClientRect();
      const contentRect = contentElement.getBoundingClientRect();
      const surfaceRect = surfaceElement.getBoundingClientRect();
      const offsetX = center.clientX - rect.left;
      const offsetY = center.clientY - rect.top;
      const startZoom = useSettingsStore.getState().zoom;

      const pinchState: PinchState = {
        boardLeft: rect.left,
        boardTop: rect.top,
        contentHeight: contentElement.offsetHeight,
        contentWidth: contentElement.offsetWidth,
        contentX: boardElement.scrollLeft + offsetX,
        contentY: boardElement.scrollTop + offsetY,
        currentZoom: startZoom,
        hasPreviewStarted: false,
        startDistance,
        startZoom,
        surfaceHeight: surfaceElement.offsetHeight,
        surfaceLeft: surfaceRect.left - contentRect.left,
        surfaceTop: surfaceRect.top - contentRect.top,
        surfaceWidth: surfaceElement.offsetWidth,
      };

      pinchStateRef.current = pinchState;

      // PERF PROBE: pre-size the spacer once, to the largest size this
      // gesture could ever reach (zooming out never needs more room than the
      // current layout already has), instead of resizing it every frame.
      const maxScale = MAX_ZOOM / startZoom;
      const maxContentSize = getContentSizeForScale(pinchState, maxScale);

      contentElement.style.width = `${maxContentSize.width}px`;
      contentElement.style.height = `${maxContentSize.height}px`;
      surfaceElement.style.willChange = 'transform';
      panStateRef.current = null;
      isPinchingRef.current = true;
      recordPinchPerfPhase('pinch', activePointersRef.current.size);
      cancelCellPointerSequence();
      event.preventDefault();

      return true;
    },
    [boardRef, contentRef, surfaceRef],
  );

  const commitPinchZoom = useCallback(() => {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
      applyPendingZoom();
    }

    const pinchState = pinchStateRef.current;
    const boardElement = boardRef.current;
    const contentElement = contentRef.current;
    const surfaceElement = surfaceRef.current;

    if (!pinchState || !contentElement || !surfaceElement) {
      return;
    }

    const finalZoom = pinchState.currentZoom;
    const scrollLeft = boardElement?.scrollLeft;
    const scrollTop = boardElement?.scrollTop;

    if (
      Math.abs(finalZoom - useSettingsStore.getState().zoom) >=
      ZOOM_CHANGE_EPSILON
    ) {
      adjustZoom(finalZoom);
    }

    recordPinchPerfPhase('commit', activePointersRef.current.size);

    window.requestAnimationFrame(() => {
      contentElement.style.width = '';
      contentElement.style.height = '';
      surfaceElement.style.transform = '';
      surfaceElement.style.willChange = '';

      if (boardElement && scrollLeft !== undefined && scrollTop !== undefined) {
        boardElement.scrollLeft = scrollLeft;
        boardElement.scrollTop = scrollTop;
      }
    });
  }, [applyPendingZoom, boardRef, contentRef, surfaceRef]);

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
    const contentElement = contentRef.current;
    const surfaceElement = surfaceRef.current;

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }

      activePointers.clear();
      pinchedPointerIds.clear();
      panStateRef.current = null;

      if (contentElement) {
        contentElement.style.width = '';
        contentElement.style.height = '';
      }

      if (surfaceElement) {
        surfaceElement.style.transform = '';
        surfaceElement.style.willChange = '';
      }
    };
  }, [contentRef, surfaceRef]);

  return {
    onPointerCancel: onPointerEnd,
    onPointerDown,
    onPointerMove,
    onPointerUp: onPointerEnd,
  };
}
