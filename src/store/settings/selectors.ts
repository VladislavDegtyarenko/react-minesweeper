import { MOBILE_CONTROL_MODES } from './constants';
import { ControlModes, DigFlag, type SettingsState } from './types';

export const selectControlMode = (state: SettingsState) => state.controlMode;

export const selectIsToggleMode = (state: SettingsState) =>
  state.controlMode === ControlModes.Toggle;
export const selectIsGesturesMode = (state: SettingsState) =>
  state.controlMode === ControlModes.Gestures;

export const selectDigFlag = (state: SettingsState) => state.digFlag;
export const selectIsDigMode = (state: SettingsState) =>
  state.digFlag === DigFlag.Dig;
export const selectIsFlagMode = (state: SettingsState) =>
  state.digFlag === DigFlag.Flag;

export const selectZoom = (state: SettingsState) => state.zoom;

export const selectIsTouchScreen = (state: SettingsState) =>
  state.isTouchScreen;

export const selectIsMobileControlMode = (state: SettingsState) =>
  MOBILE_CONTROL_MODES.has(state.controlMode);

export const selectIsSettingsOpened = (state: SettingsState) =>
  state.isSettingsOpened;

export const selectIsQuestionMarkEnabled = (state: SettingsState) =>
  state.isQuestionMarkEnabled;
