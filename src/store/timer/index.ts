import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import type { TimerState } from './types';

export const useTimerStore = create<TimerState>()(
  subscribeWithSelector(
    devtools(
      () => ({
        status: 'idle',
        elapsedMs: 0,
        startedAtMs: null,
      }),
      { name: 'timer' },
    ),
  ),
);
