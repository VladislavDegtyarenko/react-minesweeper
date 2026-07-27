import { useEffect } from 'react';
import {
  BOARD_FRAME_SELECTOR,
  BOARD_SURFACE_SELECTOR,
  BOARD_VIEWPORT_CHANGE_EVENT,
} from '@/components/Game/components/Board/constants';
import { useResizeObserver } from '@/hooks';
import type { TourTarget } from '../types';
import { scrollTourTargetIntoView } from '../utils';

type Options = {
  isOpen: boolean;
  target: TourTarget;
  updateTargetRect: () => void;
};

/**
 * Keeps the active tutorial target aligned with Canvas viewport changes.
 */
export function useTourTargetViewportSync({
  isOpen,
  target,
  updateTargetRect,
}: Options): void {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const boardElement = document.querySelector(BOARD_FRAME_SELECTOR);

    if (!(boardElement instanceof HTMLElement)) {
      return undefined;
    }

    let animationFrameId: number | null = null;
    const scheduleTargetRectUpdate = () => {
      if (animationFrameId !== null) {
        return undefined;
      }

      animationFrameId = window.requestAnimationFrame(() => {
        animationFrameId = null;
        updateTargetRect();
      });

      return undefined;
    };

    boardElement.addEventListener('scroll', scheduleTargetRectUpdate, {
      passive: true,
    });
    boardElement.addEventListener(
      BOARD_VIEWPORT_CHANGE_EVENT,
      scheduleTargetRectUpdate,
    );

    return () => {
      boardElement.removeEventListener('scroll', scheduleTargetRectUpdate);
      boardElement.removeEventListener(
        BOARD_VIEWPORT_CHANGE_EVENT,
        scheduleTargetRectUpdate,
      );

      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isOpen, updateTargetRect]);

  useResizeObserver(
    () =>
      isOpen
        ? [document.body, document.querySelector(BOARD_SURFACE_SELECTOR)]
        : [],
    () => {
      if (!isOpen) {
        return undefined;
      }

      updateTargetRect();
      scrollTourTargetIntoView(target);

      return undefined;
    },
    [isOpen, target],
  );
}
