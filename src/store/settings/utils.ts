import { LOCAL_STORAGE_KEYS } from '@/config';
import { isBrowser, localStorageService } from '@/utils';
import {
  DEFAULT_QUESTION_MARK_ENABLED,
  DEFAULT_ZOOM,
  MAX_ZOOM,
  MIN_ZOOM,
  MOBILE_CONTROL_MODES,
  ZOOM_OPTIONS,
  ZOOM_PRECISION,
  ZOOM_PRESET_MATCH_DELTA,
} from './constants';
import { ControlModes, DigFlag } from './types';

export const isMobileControlMode = (value: unknown): value is ControlModes => {
  return MOBILE_CONTROL_MODES.has(value as ControlModes);
};

export const getIsTouchScreen = (): boolean => {
  if (!isBrowser()) {
    return false;
  }

  if ('maxTouchPoints' in navigator && navigator.maxTouchPoints > 0) {
    return true;
  }

  if (typeof window.matchMedia === 'function') {
    return !window.matchMedia('(pointer: fine)').matches;
  }

  return false;
};

export const getPreferredControlMode = (
  isTouchScreen: boolean,
): ControlModes => {
  if (!isTouchScreen) {
    return ControlModes.Pointer;
  }

  const preferred = localStorageService.get<ControlModes>(
    LOCAL_STORAGE_KEYS.preferredControlMode,
  );

  if (isMobileControlMode(preferred)) {
    return preferred;
  }

  return ControlModes.Toggle;
};

export const clampZoomToRange = (zoom: number): number => {
  if (!Number.isFinite(zoom)) {
    return DEFAULT_ZOOM.value;
  }

  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
};

export const clampZoom = (zoom: number): number => {
  const rangedZoom = clampZoomToRange(zoom);

  return Math.round(rangedZoom * ZOOM_PRECISION) / ZOOM_PRECISION;
};

export const getPresetZoomValue = (zoom: number): number | undefined => {
  return ZOOM_OPTIONS.find(
    (option) => Math.abs(option.value - zoom) <= ZOOM_PRESET_MATCH_DELTA,
  )?.value;
};

export const isPresetZoom = (zoom: number): boolean => {
  return getPresetZoomValue(zoom) !== undefined;
};

export const getPreferredZoom = (): number => {
  const zoom = localStorageService.get<number>(LOCAL_STORAGE_KEYS.zoom);

  if (typeof zoom !== 'number') {
    return DEFAULT_ZOOM.value;
  }

  return clampZoom(zoom);
};

export const getPreferredDigFlag = (): DigFlag => {
  const digFlag = localStorageService.get<DigFlag>(LOCAL_STORAGE_KEYS.digFlag);
  return digFlag || DigFlag.Dig;
};

/**
 * Returns the preferred question mark usage for cell markers.
 */
export const getPreferredQuestionMarkEnabled = (): boolean => {
  const isQuestionMarkEnabled = localStorageService.get<boolean>(
    LOCAL_STORAGE_KEYS.isQuestionMarkEnabled,
  );

  return isQuestionMarkEnabled ?? DEFAULT_QUESTION_MARK_ENABLED;
};
