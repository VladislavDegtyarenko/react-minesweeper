/**
 * Per-direction strength of the scroll hint, in the range [0, 1].
 * 0 means "fully scrolled to that edge" (hide hint); 1 means "lots of hidden
 * content in that direction" (hint at full opacity).
 */
export type BoardScrollHints = {
  bottom: number;
  left: number;
  right: number;
  top: number;
};

export type ScrollHintDirection = keyof BoardScrollHints;
