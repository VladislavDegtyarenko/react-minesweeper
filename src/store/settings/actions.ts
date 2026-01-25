import { useSettingsStore } from "./store";
import { ControlModes, DigFlag } from "./types";

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
 * Adjusts zoom level by a delta value.
 */
export const adjustZoom = (zoom: number): void => {
  useSettingsStore.setState({ zoom });
};
