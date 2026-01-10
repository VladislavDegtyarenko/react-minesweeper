import type { TimerState } from ".";
import { getTimeDiff } from "../../utils";

export const selectTimeDiff = (state: TimerState) =>
  getTimeDiff(state.timeNow, state.timeStarted);
export const selectIsTimerRunning = (state: TimerState) =>
  Boolean(state.timeStarted);
