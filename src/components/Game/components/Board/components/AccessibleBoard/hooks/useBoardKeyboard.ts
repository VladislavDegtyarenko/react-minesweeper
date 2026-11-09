import { useRef, useState, type KeyboardEvent } from 'react';
import { activateBoardCell } from '@/game/board';
import { useGameStore } from '@/store/game';
import { useStatsStore } from '@/store/stats';
import { setIsWinDialogOpen } from '@/store/stats/actions';
import { getBoardKeyboardTarget } from '@/components/Game/components/Board/keyboard';

/** Keeps a single tab stop and moves native focus with the keyboard. */
export function useBoardKeyboard(rows: number, cols: number) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activateCell = (row: number, col: number, action: 'open' | 'mark') => {
    const { gameStatus, isOnboardingTourOpen } = useGameStore.getState();

    if (isOnboardingTourOpen) {
      return undefined;
    }

    if (
      gameStatus === 'won' &&
      action === 'open' &&
      useStatsStore.getState().hasPresentedWinDialog
    ) {
      setIsWinDialogOpen(true);

      return undefined;
    }

    return activateBoardCell(row, col, action);
  };
  const handleKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    rowIndex: number,
    cellIndex: number,
  ) => {
    if (event.altKey || event.metaKey) {
      return undefined;
    }

    const target = getBoardKeyboardTarget({
      rowIndex,
      cellIndex,
      rows,
      cols,
      key: event.key,
      ctrlKey: event.ctrlKey,
    });

    if (target) {
      event.preventDefault();
      const index = target.rowIndex * cols + target.cellIndex;
      gridRef.current
        ?.querySelectorAll<HTMLButtonElement>('[role="gridcell"]')
        [index]?.focus();
    } else if (!event.ctrlKey && ['Enter', ' ', 'f', 'F'].includes(event.key)) {
      event.preventDefault();
      if (!event.repeat) {
        activateCell(
          rowIndex,
          cellIndex,
          event.key.toLowerCase() === 'f' ? 'mark' : 'open',
        );
      }
    }

    return undefined;
  };

  return { gridRef, activeIndex, setActiveIndex, handleKeyDown, activateCell };
}
