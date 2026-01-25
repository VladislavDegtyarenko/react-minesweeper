import { isBrowser } from "@/utils";
import { useSettingsStore } from "./store";

/**
 * Initializes touch screen detection listener.
 * Call this once when the app mounts.
 */
export const initTouchScreenListener = (): (() => void) | undefined => {
  if (!isBrowser() || typeof window.matchMedia !== "function") {
    return undefined;
  }

  const mediaQuery = window.matchMedia("(pointer: fine)");

  const handleChange = (event: MediaQueryListEvent) => {
    useSettingsStore.setState({ isTouchScreen: !event.matches });
  };

  // Set initial value
  useSettingsStore.setState({ isTouchScreen: !mediaQuery.matches });

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", handleChange);
  } else {
    mediaQuery.addListener(handleChange);
  }

  return () => {
    if (typeof mediaQuery.removeEventListener === "function") {
      mediaQuery.removeEventListener("change", handleChange);
    } else {
      mediaQuery.removeListener(handleChange);
    }
  };
};

