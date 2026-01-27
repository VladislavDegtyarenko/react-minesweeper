// timerStore.ts
import { create } from "zustand";
import type { TimerState } from "./types";
import { devtools, subscribeWithSelector } from "zustand/middleware";

export const useTimerStore = create<TimerState>()(
  subscribeWithSelector(
    devtools(() => ({
      status: "idle",
      elapsedMs: 0,
      startedAtMs: null,
      rafId: null,
    }))
  )
);
