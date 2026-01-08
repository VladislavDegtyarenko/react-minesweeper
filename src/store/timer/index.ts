import { create } from "zustand";

export type TimerState = {
  timeStarted: Date | null;
  timeNow: Date | null;
  timerInterval: number | null;
};

export const useTimerStore = create<TimerState>()(() => {
  const timerState: TimerState = {
    timeStarted: null,
    timeNow: null,
    timerInterval: null,
  };

  return { ...timerState };
});
