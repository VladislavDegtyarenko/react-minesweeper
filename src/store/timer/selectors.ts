import type { TimerState } from "./types";
import { getTimeDiff } from "../../utils";

export const selectTimeDiff = (state: TimerState) =>
  getTimeDiff(state.elapsedMs);
export const selectIsTimerRunning = (state: TimerState) =>
  state.status === "running";
