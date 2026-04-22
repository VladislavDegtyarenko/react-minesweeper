import {
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

type Args = {
  contentW: number;
  contentH: number;
};

type Translate = { x: number; y: number };

const clampAxis = (value: number, content: number, wrapper: number): number => {
  if (content <= wrapper) {
    return (wrapper - content) / 2;
  }

  const min = -(content - wrapper);
  const max = 0;

  return Math.max(min, Math.min(max, value));
};

/**
 * Drag-to-pan viewport for the SVG board. Tracks wrapper size (via
 * ResizeObserver), translate offsets, and an active pan gesture. Pan starts
 * only from "dead" background (no [data-cell] ancestor).
 */
export const usePanViewport = ({ contentW, contentH }: Args) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [wrapperSize, setWrapperSize] = useState<{ w: number; h: number }>({
    w: 0,
    h: 0,
  });
  const [translate, setTranslate] = useState<Translate>({ x: 0, y: 0 });

  const panStateRef = useRef<{
    pointerId: number;
    startPointer: { x: number; y: number };
    startTranslate: Translate;
    moved: boolean;
  } | null>(null);

  useLayoutEffect(() => {
    const el = wrapperRef.current;

    if (!el) {
      return undefined;
    }

    const update = () => {
      setWrapperSize({ w: el.clientWidth, h: el.clientHeight });
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    setTranslate((prev) => ({
      x: clampAxis(prev.x, contentW, wrapperSize.w),
      y: clampAxis(prev.y, contentH, wrapperSize.h),
    }));
  }, [contentW, contentH, wrapperSize.w, wrapperSize.h]);

  const startPan = useCallback(
    (e: ReactPointerEvent<SVGSVGElement>) => {
      panStateRef.current = {
        pointerId: e.pointerId,
        startPointer: { x: e.clientX, y: e.clientY },
        startTranslate: translate,
        moved: false,
      };

      const target = e.currentTarget;

      if (typeof target.setPointerCapture === 'function') {
        try {
          target.setPointerCapture(e.pointerId);
        } catch {
          // ignore — some browsers throw if capture is not permitted
        }
      }
    },
    [translate],
  );

  const updatePan = useCallback(
    (e: ReactPointerEvent<SVGSVGElement>) => {
      const panState = panStateRef.current;

      if (!panState || panState.pointerId !== e.pointerId) {
        return undefined;
      }

      const dx = e.clientX - panState.startPointer.x;
      const dy = e.clientY - panState.startPointer.y;

      if (!panState.moved && Math.hypot(dx, dy) > 1) {
        panState.moved = true;
      }

      setTranslate(() => ({
        x: clampAxis(
          panState.startTranslate.x + dx,
          contentW,
          wrapperSize.w,
        ),
        y: clampAxis(
          panState.startTranslate.y + dy,
          contentH,
          wrapperSize.h,
        ),
      }));

      return undefined;
    },
    [contentW, contentH, wrapperSize.w, wrapperSize.h],
  );

  const endPan = useCallback((e: ReactPointerEvent<SVGSVGElement>) => {
    const panState = panStateRef.current;

    if (!panState || panState.pointerId !== e.pointerId) {
      return undefined;
    }

    const target = e.currentTarget;

    if (typeof target.releasePointerCapture === 'function') {
      try {
        target.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }

    panStateRef.current = null;

    return undefined;
  }, []);

  const isPanning = useCallback(
    (pointerId: number): boolean =>
      !!panStateRef.current && panStateRef.current.pointerId === pointerId,
    [],
  );

  const onWheel = useCallback(
    (e: ReactWheelEvent<SVGSVGElement>) => {
      const canPanX = contentW > wrapperSize.w;
      const canPanY = contentH > wrapperSize.h;

      if (!canPanX && !canPanY) {
        return undefined;
      }

      setTranslate((prev) => ({
        x: canPanX
          ? clampAxis(prev.x - e.deltaX, contentW, wrapperSize.w)
          : prev.x,
        y: canPanY
          ? clampAxis(prev.y - e.deltaY, contentH, wrapperSize.h)
          : prev.y,
      }));

      return undefined;
    },
    [contentW, contentH, wrapperSize.w, wrapperSize.h],
  );

  return {
    wrapperRef: wrapperRef as RefObject<HTMLDivElement>,
    wrapperW: wrapperSize.w,
    wrapperH: wrapperSize.h,
    translate,
    startPan,
    updatePan,
    endPan,
    isPanning,
    onWheel,
  };
};
