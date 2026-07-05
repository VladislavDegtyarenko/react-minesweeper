import type { CSSProperties } from 'react';
import BoardFrame from '@/components/Game/components/BoardFrame';
import Cell from '@/components/Game/components/Cell';
import type { Level, OpenedMineCell, TBoard } from '@/types';
import { createCx } from '@/utils';
import styles from './styles.module.scss';
import { createPreviewBoard } from './utils';

const cx = createCx(styles);

type PreviewBoardProps = {
  board?: TBoard;
  level: Level;
};

const PreviewBoard = ({ board, level }: PreviewBoardProps) => {
  const previewBoard = board ?? createPreviewBoard(level);

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
      <BoardFrame as="span" variant="preview">
        {previewBoard.map((row, rowIndex) => (
          <span key={rowIndex} className={cx('row')}>
            {row.map((cell, cellIndex) => (
              <Cell
                as="span"
                key={`${rowIndex}-${cellIndex}`}
                rowIndex={rowIndex}
                cellIndex={cellIndex}
                value={cell.value}
                isOpened={cell.isOpened}
                marker={cell.marker}
                highlight={(cell as OpenedMineCell).highlight}
              />
            ))}
          </span>
        ))}
      </BoardFrame>
    </span>
  );
};

export default PreviewBoard;
