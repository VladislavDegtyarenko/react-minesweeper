import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { DigFlag, type SettingsState } from "./types";
import { getIsTouchScreen, getPreferredControlMode } from "./utils";
import { DEFAULT_ZOOM } from "./constants";

const initialTouchScreen = getIsTouchScreen();

export const useSettingsStore = create<SettingsState>()(
  subscribeWithSelector(() => ({
    isTouchScreen: initialTouchScreen,
    controlMode: getPreferredControlMode(initialTouchScreen),
    digFlag: DigFlag.Dig as DigFlag,
    zoom: DEFAULT_ZOOM.value,
  }))
);
