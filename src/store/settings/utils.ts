import { LOCAL_STORAGE_KEYS } from "@/constants";
import { isBrowser, localStorageService } from "@/utils";
import { MOBILE_CONTROL_MODES } from "./constants";
import { ControlModes } from "./types";

export const isMobileControlMode = (value: unknown): value is ControlModes => {
  return MOBILE_CONTROL_MODES.has(value as ControlModes);
};

export const getIsTouchScreen = (): boolean => {
  if (!isBrowser()) {
    return false;
  }

  if ("maxTouchPoints" in navigator && navigator.maxTouchPoints > 0) {
    return true;
  }

  if (typeof window.matchMedia === "function") {
    return !window.matchMedia("(pointer: fine)").matches;
  }

  return false;
};

export const getPreferredControlMode = (
  isTouchScreen: boolean
): ControlModes => {
  if (!isTouchScreen) {
    return ControlModes.Pointer;
  }

  const preferred = localStorageService.get<ControlModes>(
    LOCAL_STORAGE_KEYS.preferredControlMode
  );

  if (isMobileControlMode(preferred)) {
    return preferred;
  }

  return ControlModes.Toggle;
};
