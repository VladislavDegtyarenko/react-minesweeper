import { ZOOM_OPTIONS } from './constants';

export enum ControlModes {
  Pointer = 'Pointer', // desktop
  Toggle = 'Toggle', // mobile method 1
  Gestures = 'Gestures', // mobile method 2
}

export enum DigFlag {
  Dig = 'dig',
  Flag = 'flag',
}

export type SettingsState = {
  isTouchScreen: boolean;
  controlMode: ControlModes;
  digFlag: DigFlag;
  zoom: (typeof ZOOM_OPTIONS)[number]['value'];
  isSettingsOpened: boolean;
  isQuestionMarkEnabled: boolean;
};
