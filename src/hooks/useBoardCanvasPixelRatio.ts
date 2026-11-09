import { useEffect, useRef } from 'react';

/** Redraws when moving between displays changes density without a resize. */
export function useBoardCanvasPixelRatio(onChange: () => void) {
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    let query = window.matchMedia(
      `(resolution: ${window.devicePixelRatio}dppx)`,
    );
    const handleChange = () => {
      query.removeEventListener('change', handleChange);
      query = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
      query.addEventListener('change', handleChange);
      onChangeRef.current();
    };

    query.addEventListener('change', handleChange);

    return () => query.removeEventListener('change', handleChange);
  }, []);
}
