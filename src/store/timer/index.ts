import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { withOptionalDevtools } from '@/store/devtools';
import type { TimerState } from './types';

export const useTimerStore = create<TimerState>()(
  subscribeWithSelector(
    withOptionalDevtools(
      (): TimerState => ({
        status: 'idle',
        elapsedMs: 0,
        startedAtMs: null,
        rafId: null,
      }),
      'timer',
    ),
  ),
);
