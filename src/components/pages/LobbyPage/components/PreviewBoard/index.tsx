'use client';

import { useMemo, useRef, type CSSProperties } from 'react';
import BoardFrame from '@/components/Game/components/BoardFrame';
import type { Level, TBoard } from '@/types';
import { createCx } from '@/utils';
import { usePreviewBoardCanvasRenderer } from './hooks/usePreviewBoardCanvasRenderer';
import styles from './styles.module.scss';
import { createPreviewBoard } from './utils';

const cx = createCx(styles);

type Props = {
  board?: TBoard;
  level: Level;
};

const PreviewBoard = ({ board, level }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewBoard = useMemo(
    () => board ?? createPreviewBoard(level),
    [board, level],
  );
  const areAssetsReady = usePreviewBoardCanvasRenderer({
    board: previewBoard,
    canvasRef,
  });

  return (
    <span
      className={cx('preview')}
      style={
        {
          '--preview-cols': level.cols,
          '--preview-rows': level.rows,
        } as CSSProperties
      }
      aria-hidden="true"
    >
      <BoardFrame className={cx('frame')} as="span" variant="preview">
        <canvas
          ref={canvasRef}
          className={cx('canvas')}
          data-preview-board-canvas="true"
          data-preview-board-canvas-ready={areAssetsReady ? 'true' : 'false'}
          data-preview-board-cols={level.cols}
          data-preview-board-rows={level.rows}
        />
      </BoardFrame>
    </span>
  );
};

export default PreviewBoard;
