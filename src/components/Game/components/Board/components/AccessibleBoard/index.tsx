import { useId, type CSSProperties } from 'react';
import { useGameStore } from '@/store/game';
import type { GameStatus } from '@/store/game/store';
import type { TBoard } from '@/types';
import { useBoardKeyboard } from './hooks/useBoardKeyboard';
import { describeBoardCell } from '@/components/Game/components/Board/renderer/accessibility';
import styles from './styles.module.scss';

type Props = { board: TBoard; gameStatus: GameStatus };

const AccessibleBoard = ({ board, gameStatus }: Props) => {
  const instructionsId = useId();
  const rows = board.length;
  const cols = board[0]?.length ?? 0;
  const isTourOpen = useGameStore((state) => state.isOnboardingTourOpen);
  const isDisabled = gameStatus === 'paused' || gameStatus === 'lost';
  const { gridRef, activeIndex, setActiveIndex, handleKeyDown, activateCell } =
    useBoardKeyboard(rows, cols);

  return (
    <>
      <p id={instructionsId} className={styles.instructions}>
        {gameStatus === 'won'
          ? 'Game won. Enter or Space reopens your result. '
          : ''}
        Arrow keys move. Home and End move to the row edges; Control plus Home
        or End moves to the board edges. Enter or Space opens a cell. F cycles
        its marker. Tab leaves the board.
      </p>
      <div
        ref={gridRef}
        role="grid"
        aria-label="Minesweeper board"
        aria-describedby={instructionsId}
        aria-hidden={isTourOpen || undefined}
        aria-rowcount={rows}
        aria-colcount={cols}
        className={styles.grid}
        style={{ '--board-rows': rows, '--board-cols': cols } as CSSProperties}
      >
        {board.map((row, rowIndex) => (
          <div
            role="row"
            aria-rowindex={rowIndex + 1}
            key={rowIndex}
            className={styles.row}
          >
            {row.map((cell, cellIndex) => (
              <button
                type="button"
                role="gridcell"
                key={cellIndex}
                aria-colindex={cellIndex + 1}
                aria-label={`Row ${rowIndex + 1}, column ${cellIndex + 1}: ${gameStatus === 'paused' ? 'paused' : describeBoardCell(cell, gameStatus === 'lost')}`}
                aria-disabled={isDisabled}
                tabIndex={
                  !isTourOpen && activeIndex === rowIndex * cols + cellIndex
                    ? 0
                    : -1
                }
                className={styles.cell}
                onFocus={() => setActiveIndex(rowIndex * cols + cellIndex)}
                onKeyDown={(event) => handleKeyDown(event, rowIndex, cellIndex)}
                onClick={(event) => {
                  if (event.detail === 0)
                    activateCell(rowIndex, cellIndex, 'open');
                }}
              />
            ))}
          </div>
        ))}
      </div>
      <span role="status" className={styles.instructions}>
        {gameStatus === 'won'
          ? 'You won!'
          : gameStatus === 'lost'
            ? 'Game over.'
            : gameStatus === 'paused'
              ? 'Game paused.'
              : ''}
      </span>
    </>
  );
};

export default AccessibleBoard;
