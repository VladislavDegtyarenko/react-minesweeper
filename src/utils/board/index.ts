import { useGameStore } from '@/store/game';
import { revealCell, toggleCellMarker } from '@/store/game/actions';
import { useSettingsStore } from '@/store/settings';
import {
  selectIsDigMode,
  selectIsFlagMode,
  selectIsGesturesMode,
  selectIsQuestionMarkEnabled,
  selectIsToggleMode,
} from '@/store/settings/selectors';
import { useSFXStore } from '@/store/sfx';
import { initSFX } from '@/store/sfx/actions';
import { getCellIndex } from './utils';
import type { HandleCellInteractionProps } from './types';

const HOLD_TIME = 250;

let touchDownTime: number | null = null;
let touchHoldTimeoutId: number | null = null;
let pointerDownCoordinates: { x: number; y: number } | null = null;
let latestPointerCoordinates: { x: number; y: number } | null = null;
let isPointerSequenceBlocked = false;

const getLatestPointerCoordinates = (): { x: number; y: number } | null => {
  if (latestPointerCoordinates) {
    return latestPointerCoordinates;
  }

  return pointerDownCoordinates;
};

const isPointerMoved = (x: number, y: number, delta = 0.5): boolean => {
  if (!pointerDownCoordinates) {
    return false;
  }

  const { x: pointerDownX, y: pointerDownY } = pointerDownCoordinates;
  const distance = Math.sqrt((x - pointerDownX) ** 2 + (y - pointerDownY) ** 2);

  return distance > delta;
};

const cleanupTimers = () => {
  if (touchHoldTimeoutId) {
    clearTimeout(touchHoldTimeoutId);
  }

  touchHoldTimeoutId = null;
  touchDownTime = null;
  pointerDownCoordinates = null;
  latestPointerCoordinates = null;
};

const runRevealCell = (row: number, col: number) => {
  const { cols } = useGameStore.getState().board;

  revealCell(getCellIndex(row, col, cols));
};

const runToggleCellMarker = (
  row: number,
  col: number,
  isQuestionMarkEnabled: boolean,
) => {
  const { cols } = useGameStore.getState().board;

  toggleCellMarker(getCellIndex(row, col, cols), isQuestionMarkEnabled);
};

export const handleCellInteraction = ({
  e,
  row,
  col,
}: HandleCellInteractionProps) => {
  const { isSettingsOpened } = useSettingsStore.getState();

  const isPointerMove = e.type === 'pointermove';
  const isPointerDown = e.type === 'pointerdown';
  const isPointerUp = e.type === 'pointerup';
  const isPointerCancelled = e.type === 'pointercancel';

  if (isSettingsOpened) {
    if (isPointerDown) {
      isPointerSequenceBlocked = true;
    }

    if (isPointerUp || isPointerCancelled) {
      isPointerSequenceBlocked = false;
      cleanupTimers();
    }

    return undefined;
  }

  if (isPointerMove) {
    latestPointerCoordinates = { x: e.screenX, y: e.screenY };

    return undefined;
  }

  const isLeftClick =
    e.type === 'pointerup' && e.button === 0 && e.pointerType === 'mouse';
  const isRightClick = e.type === 'contextmenu' && e.button === 2;
  const isTouchDown = e.type === 'pointerdown' && e.pointerType === 'touch';
  const isTouchUp = e.type === 'pointerup' && e.pointerType === 'touch';
  const pointerCoordinates = { x: e.screenX, y: e.screenY };
  const contextMenuByHoldingFinger =
    e.button === -1 && e.type === 'contextmenu';
  const settingsState = useSettingsStore.getState();
  const isToggleMode = selectIsToggleMode(settingsState);
  const isGesturesMode = selectIsGesturesMode(settingsState);
  const isDigMode = selectIsDigMode(settingsState);
  const isFlagMode = selectIsFlagMode(settingsState);
  const isQuestionMarkEnabled = selectIsQuestionMarkEnabled(settingsState);

  if (isPointerSequenceBlocked) {
    if (isPointerUp || isPointerCancelled) {
      isPointerSequenceBlocked = false;
      cleanupTimers();

      return undefined;
    }

    if (!isPointerDown) {
      return undefined;
    }

    isPointerSequenceBlocked = false;
  }

  if (isPointerCancelled) {
    cleanupTimers();

    return undefined;
  }

  if (isPointerDown && !useSFXStore.getState().isLoaded) {
    initSFX();
  }

  if (isLeftClick) {
    runRevealCell(row, col);
  }

  if (isRightClick) {
    e.preventDefault();
    runToggleCellMarker(row, col, isQuestionMarkEnabled);
  }

  if (isTouchDown) {
    pointerDownCoordinates = pointerCoordinates;
    latestPointerCoordinates = pointerCoordinates;

    if (isGesturesMode) {
      touchDownTime = Date.now();
      touchHoldTimeoutId = window.setTimeout(() => {
        const latestCoordinates = getLatestPointerCoordinates();

        if (!latestCoordinates) {
          return undefined;
        }

        if (!isPointerMoved(latestCoordinates.x, latestCoordinates.y)) {
          runToggleCellMarker(row, col, isQuestionMarkEnabled);
          cleanupTimers();
        }

        return undefined;
      }, HOLD_TIME);
    }
  }

  if (isTouchUp) {
    latestPointerCoordinates = pointerCoordinates;
    const latestCoordinates = getLatestPointerCoordinates();
    const isTouchMoved = latestCoordinates
      ? isPointerMoved(latestCoordinates.x, latestCoordinates.y)
      : false;

    if (isTouchMoved) {
      cleanupTimers();

      return undefined;
    }

    e.preventDefault();

    const touchUpTime = Date.now();

    if (
      (isToggleMode && !touchDownTime) ||
      touchUpTime - touchDownTime! < HOLD_TIME
    ) {
      if (isGesturesMode) {
        runRevealCell(row, col);
      }

      if (isToggleMode) {
        if (isDigMode) {
          runRevealCell(row, col);
        }

        if (isFlagMode) {
          runToggleCellMarker(row, col, isQuestionMarkEnabled);
        }
      }
    }

    cleanupTimers();
  }

  if (contextMenuByHoldingFinger) {
    e.preventDefault();
  }

  return undefined;
};
