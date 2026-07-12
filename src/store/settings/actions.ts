import { useSettingsStore } from './store';
import { ControlModes, DigFlag } from './types';
import { clampZoom } from './utils';

/**
 * Sets the control mode for the game.
 */
export const setControlMode = (controlMode: ControlModes): void => {
  useSettingsStore.setState({ controlMode });
};

/**
 * Sets the dig/flag mode for touch controls.
 */
export const setDigFlag = (digFlag: DigFlag): void => {
  useSettingsStore.setState({ digFlag });
};

/**
 * Sets the board zoom level.
 */
export const adjustZoom = (zoom: number): void => {
  useSettingsStore.setState({ zoom: clampZoom(zoom) });
};

/**
 * Sets the settings opened state.
 */
export const setIsSettingsOpened = (isSettingsOpened: boolean): void => {
  useSettingsStore.setState({ isSettingsOpened });
};

/**
 * Toggles whether question mark markers are enabled.
 */
export const setIsQuestionMarkEnabled = (
  isQuestionMarkEnabled: boolean,
): void => {
  useSettingsStore.setState({ isQuestionMarkEnabled });
};
