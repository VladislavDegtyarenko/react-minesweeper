import { ControlModes, DigFlag } from './types';

export const MOBILE_CONTROL_MODES = new Set<ControlModes>([
  ControlModes.Toggle,
  ControlModes.Gestures,
]);

export const MOBILE_CONTROL_MODES_OPTIONS = Array.from(
  MOBILE_CONTROL_MODES,
).map((mode) => ({
  value: mode as ControlModes,
  label: String(mode),
}));

export const DIG_FLAG_OPTIONS = [
  { value: DigFlag.Dig, label: String(DigFlag.Dig) },
  { value: DigFlag.Flag, label: String(DigFlag.Flag) },
];

export const ZOOM_OPTIONS = [
  { value: 0.8, label: 'S' },
  { value: 1, label: 'M' },
  { value: 1.25, label: 'L' },
  { value: 1.5, label: 'XL' },
];

export const ZOOM_VALUES = ZOOM_OPTIONS.map((option) => option.value);

export const DEFAULT_ZOOM = ZOOM_OPTIONS.find(
  (option) => option.label === 'M',
)!;

export const DEFAULT_QUESTION_MARK_ENABLED = false;
