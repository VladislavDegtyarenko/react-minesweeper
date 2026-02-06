import { LOCAL_STORAGE_KEYS } from '@/constants';
import { localStorageService } from '@/utils';
import { useSettingsStore } from './store';
import { getPreferredControlMode, isMobileControlMode } from './utils';

/**
 * Initializes all store subscriptions.
 * Called automatically when the module is imported.
 */
export const initSubscriptions = (): void => {
  // Update controlMode when isTouchScreen changes
  useSettingsStore.subscribe(
    (state) => state.isTouchScreen,
    (isTouchScreen) => {
      const preferredMode = getPreferredControlMode(isTouchScreen);
      useSettingsStore.setState({ controlMode: preferredMode });
    },
  );

  // Persist controlMode to localStorage (only mobile modes)
  useSettingsStore.subscribe(
    (state) => state.controlMode,
    (controlMode) => {
      if (isMobileControlMode(controlMode)) {
        localStorageService.set(
          LOCAL_STORAGE_KEYS.preferredControlMode,
          controlMode,
        );
      }
    },
  );

  // Persist zoom to localStorage
  useSettingsStore.subscribe(
    (state) => state.zoom,
    (zoom) => {
      localStorageService.set(LOCAL_STORAGE_KEYS.zoom, zoom);
    },
  );

  // Persist digFlag to localStorage
  useSettingsStore.subscribe(
    (state) => state.digFlag,
    (digFlag) => {
      localStorageService.set(LOCAL_STORAGE_KEYS.digFlag, digFlag);
    },
  );

  // Persist question mark toggle to localStorage
  useSettingsStore.subscribe(
    (state) => state.isQuestionMarkEnabled,
    (isQuestionMarkEnabled) => {
      localStorageService.set(
        LOCAL_STORAGE_KEYS.isQuestionMarkEnabled,
        isQuestionMarkEnabled,
      );
    },
  );
};
// Auto-initialize subscriptions
initSubscriptions();
