import { useEffect, useState } from 'react';
import {
  hasCompleteBoardCanvasAssets,
  loadBoardCanvasAssets,
  type BoardCanvasAssets,
} from '@/components/Game/components/Board/renderer';

/**
 * Loads the shared board Canvas images and retries one failed request.
 */
export function useBoardCanvasAssets() {
  const [assets, setAssets] = useState<BoardCanvasAssets>({});

  useEffect(() => {
    let isMounted = true;
    let retryTimeoutId: number | null = null;

    const requestAssets = (isRetry = false) => {
      loadBoardCanvasAssets()
        .then((loadedAssets) => {
          if (!isMounted) {
            return undefined;
          }

          setAssets(loadedAssets);

          return undefined;
        })
        .catch(() => {
          if (!isMounted || isRetry) {
            return undefined;
          }

          retryTimeoutId = window.setTimeout(() => requestAssets(true), 500);

          return undefined;
        });
    };

    requestAssets();

    return () => {
      isMounted = false;

      if (retryTimeoutId !== null) {
        window.clearTimeout(retryTimeoutId);
      }
    };
  }, []);

  return {
    areAssetsReady: hasCompleteBoardCanvasAssets(assets),
    assets,
  };
}
