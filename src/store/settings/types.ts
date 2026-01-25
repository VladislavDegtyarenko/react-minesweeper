import { ZOOM_OPTIONS } from "./constants";

export enum ControlModes {
  Pointer = "pointer", // desktop
  Toggle = "toggle", // mobile method 1
  Gestures = "gestures", // mobile method 2
}

export enum DigFlag {
  Dig = "dig",
  Flag = "flag",
}

export type SettingsState = {
  isTouchScreen: boolean;
  controlMode: ControlModes;
  digFlag: DigFlag;
  zoom: (typeof ZOOM_OPTIONS)[number]["value"];
};
