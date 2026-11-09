type CanvasTransform = Pick<DOMMatrixReadOnly, 'a' | 'b' | 'c' | 'd'>;

export const getBoardCanvasShadowGeometry = ({
  blur,
  offsetX = 0,
  offsetY = 0,
  transform,
}: {
  blur: number;
  offsetX?: number;
  offsetY?: number;
  transform: CanvasTransform;
}) => {
  const scaleX = Math.hypot(transform.a, transform.b);
  const scaleY = Math.hypot(transform.c, transform.d);
  const blurScale = (scaleX + scaleY) / 2;

  return {
    blur: blur * blurScale,
    offsetX: offsetX * transform.a + offsetY * transform.c,
    offsetY: offsetX * transform.b + offsetY * transform.d,
  };
};
