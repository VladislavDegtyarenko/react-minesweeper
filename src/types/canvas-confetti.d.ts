declare module 'canvas-confetti' {
  export type Origin = {
    x?: number;
    y?: number;
  };

  export type Options = {
    angle?: number;
    colors?: string[];
    decay?: number;
    disableForReducedMotion?: boolean;
    drift?: number;
    gravity?: number;
    origin?: Origin;
    particleCount?: number;
    scalar?: number;
    shapes?: string[];
    spread?: number;
    startVelocity?: number;
    ticks?: number;
    zIndex?: number;
  };

  export type GlobalOptions = {
    resize?: boolean;
    useWorker?: boolean;
  };

  export type CreateTypes = ((options?: Options) => Promise<void> | null) & {
    reset: () => void;
  };

  type ConfettiFunction = ((options?: Options) => Promise<void> | null) & {
    create: (
      canvas?: HTMLCanvasElement,
      globalOptions?: GlobalOptions,
    ) => CreateTypes;
    reset: () => void;
  };

  const confetti: ConfettiFunction;
  export default confetti;
}
