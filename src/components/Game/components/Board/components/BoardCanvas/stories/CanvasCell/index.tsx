import { useMemo, useRef } from 'react';
import BoardFrame from '@/components/Game/components/BoardFrame';
import { describeBoardCell } from '@/components/Game/components/Board/renderer/accessibility';
import type { CellMarkerState, TBoard } from '@/types';
import BoardCanvas from '../../index';
import styles from './styles.module.scss';

type Props = {
  value: number | 'mine' | null;
  isOpened: boolean;
  marker: CellMarkerState;
  highlight?: 'red' | 'green';
  isGameLost?: boolean;
  zoom?: number;
};

const CanvasCell = ({
  value,
  isOpened,
  marker,
  highlight,
  isGameLost = false,
  zoom = 1,
}: Props) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const bleedFrameRef = useRef<HTMLDivElement>(null);
  const renderLayerRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const board = useMemo<TBoard>(
    () => [
      [
        isOpened
          ? { value: value ?? 0, isOpened: true, marker: null, highlight }
          : { value, isOpened: false, marker, highlight },
      ],
    ],
    [value, isOpened, marker, highlight],
  );

  return (
    <BoardFrame ref={boardRef} className={styles.frame}>
      <BoardCanvas
        accessibleLabel={`Cell: ${describeBoardCell(board[0][0], isGameLost)}`}
        board={board}
        boardRef={boardRef}
        bleedFrameRef={bleedFrameRef}
        cols={1}
        hoverSnapRevision={0}
        hoveredCell={null}
        isGameLost={isGameLost}
        pressSnapRevision={0}
        pressedCell={null}
        renderLayerRef={renderLayerRef}
        rows={1}
        surfaceRef={surfaceRef}
        zoom={zoom}
      />
    </BoardFrame>
  );
};

export default CanvasCell;
