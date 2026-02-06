import { LOCAL_STORAGE_KEYS } from '@/constants';
import { isBrowser, localStorageService } from '@/utils';
import {
  DEFAULT_QUESTION_MARK_ENABLED,
  DEFAULT_ZOOM,
  MOBILE_CONTROL_MODES,
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

export const getPreferredZoom = (): number => {
  const zoom = localStorageService.get<number>(LOCAL_STORAGE_KEYS.zoom);
  return zoom || DEFAULT_ZOOM.value;
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
