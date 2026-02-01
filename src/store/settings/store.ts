import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { type SettingsState } from './types';
import {
  getIsTouchScreen,
  getPreferredControlMode,
  getPreferredDigFlag,
  getPreferredQuestionMarkEnabled,
  getPreferredZoom,
} from './utils';

const initialTouchScreen = getIsTouchScreen();

const initialState: SettingsState = {
  isTouchScreen: initialTouchScreen,
  controlMode: getPreferredControlMode(initialTouchScreen),
  digFlag: getPreferredDigFlag(),
  zoom: getPreferredZoom(),
  isSettingsOpened: false,
  isQuestionMarkEnabled: getPreferredQuestionMarkEnabled(),
};

export const useSettingsStore = create<SettingsState>()(
  subscribeWithSelector(() => initialState),
);
