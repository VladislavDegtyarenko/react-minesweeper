import { create } from 'zustand';
import {
  ControlModes,
  DigFlag,
  type SettingsState,
} from '@/store/settings/types';

const INITIAL_SETTINGS: SettingsState = {
  zoom: 1,
  isTouchScreen: false,
  controlMode: ControlModes.Pointer,
  digFlag: DigFlag.Dig,
  isSettingsOpened: false,
  isQuestionMarkEnabled: false,
};

// This module replaces the production entry point before its storage effects run.
export const useSettingsStore = create<SettingsState>(() => ({
  ...INITIAL_SETTINGS,
}));

/** Restores display settings without reading or writing browser storage. */
export const resetSettings = () => {
  useSettingsStore.setState({ ...INITIAL_SETTINGS }, true);
};
