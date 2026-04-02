import confetti from 'canvas-confetti';
import type { ConfettiInstance } from '../types';

const CONFETTI_COLOR_VARIABLES = [
  '--one',
  '--two',
  '--three',
  '--four',
  '--five',
  '--six',
  '--red',
  '--green',
] as const;

const CONFETTI_BASE_OPTIONS = {
  colors: [] as string[],
  particleCount: 80,
  spread: 70,
  startVelocity: 45,
  gravity: 1,
  ticks: 220,
  scalar: 1,
};

const DEFAULT_WIN_CONFETTI_OPTIONS = {
  particleCount: 90,
  spread: 70,
  startVelocity: 45,
  ticks: 220,
  scalar: 1,
};

const BEST_WIN_CONFETTI_OPTIONS = {
  particleCount: 140,
  spread: 88,
  startVelocity: 56,
  ticks: 300,
  scalar: 1.12,
};

const BEST_WIN_CONFETTI_ENCORE_OPTIONS = {
  particleCount: 110,
  spread: 96,
  startVelocity: 50,
  ticks: 280,
  scalar: 1.08,
};

const BEST_WIN_CONFETTI_ENCORE_DELAY_MS = 220;

export const createConfettiInstance = (canvas: HTMLCanvasElement) => {
  return confetti.create(canvas, {
    resize: true,
    useWorker: false,
  });
};

export const getConfettiColors = () => {
  const rootStyles = getComputedStyle(document.documentElement);

  return CONFETTI_COLOR_VARIABLES.map((variable) =>
    rootStyles.getPropertyValue(variable).trim(),
  ).filter(Boolean);
};

export const fireWinConfetti = (
  confettiInstance: ConfettiInstance,
  colors: string[],
  isNewBest: boolean,
) => {
  if (!confettiInstance || colors.length === 0) {
    return [];
  }

  const fireBurstPair = (options: typeof DEFAULT_WIN_CONFETTI_OPTIONS) => {
    void Promise.all([
      confettiInstance({
        ...CONFETTI_BASE_OPTIONS,
        ...options,
        colors,
        angle: 60,
        origin: { x: 0, y: 0.6 },
      }),
      confettiInstance({
        ...CONFETTI_BASE_OPTIONS,
        ...options,
        colors,
        angle: 120,
        origin: { x: 1, y: 0.6 },
      }),
    ]);
  };

  fireBurstPair(
    isNewBest ? BEST_WIN_CONFETTI_OPTIONS : DEFAULT_WIN_CONFETTI_OPTIONS,
  );

  if (!isNewBest) {
    return [];
  }

  const encoreTimeoutId = window.setTimeout(() => {
    fireBurstPair(BEST_WIN_CONFETTI_ENCORE_OPTIONS);
  }, BEST_WIN_CONFETTI_ENCORE_DELAY_MS);

  return [encoreTimeoutId];
};
