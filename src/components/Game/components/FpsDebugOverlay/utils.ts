import {
  BOARD_CANVAS_SELECTOR,
  BOARD_FRAME_SELECTOR,
  BOARD_RENDER_LAYER_SELECTOR,
  BOARD_SURFACE_SELECTOR,
} from '@/components/Game/components/Board/constants';
import { getBoardGridSize } from '@/components/Game/components/Board/geometry';
import { EMPTY_BOARD_ELEMENT_STATS } from './constants';
import type { BoardElementStats } from './types';

const formatNumber = (value: number): string => {
  return value.toFixed(value % 1 === 0 ? 0 : 1);
};

const formatSize = (width: number, height: number): string => {
  return `${formatNumber(width)}x${formatNumber(height)}`;
};

const formatRect = (element: Element | null): string => {
  if (!(element instanceof HTMLElement)) {
    return '-';
  }

  const rect = element.getBoundingClientRect();

  return formatSize(rect.width, rect.height);
};

const getViewportStats = (): string => {
  const viewport = window.visualViewport;

  if (!viewport) {
    return `${formatSize(window.innerWidth, window.innerHeight)}@1`;
  }

  return `${formatSize(viewport.width, viewport.height)}@${viewport.scale.toFixed(
    2,
  )}`;
};

export const readBoardElementStats = (): BoardElementStats => {
  const board = document.querySelector(BOARD_FRAME_SELECTOR);

  if (!(board instanceof HTMLElement)) {
    return {
      ...EMPTY_BOARD_ELEMENT_STATS,
      viewport: getViewportStats(),
    };
  }

  const content = board.firstElementChild;
  const surface = document.querySelector(BOARD_SURFACE_SELECTOR);
  const renderLayer = document.querySelector(BOARD_RENDER_LAYER_SELECTOR);
  const canvas = document.querySelector(BOARD_CANVAS_SELECTOR);
  const contentInline =
    content instanceof HTMLElement &&
    (content.style.width || content.style.height)
      ? `${content.style.width || '-'} x ${content.style.height || '-'}`
      : '-';
  const surfaceTransform =
    renderLayer instanceof HTMLElement
      ? renderLayer.style.transform || getComputedStyle(renderLayer).transform
      : '-';
  const gridSize =
    surface instanceof HTMLElement ? getBoardGridSize(surface) : null;

  return {
    boardClient: formatSize(board.clientWidth, board.clientHeight),
    boardScroll: formatSize(board.scrollWidth, board.scrollHeight),
    canvasBitmap:
      canvas instanceof HTMLCanvasElement
        ? formatSize(canvas.width, canvas.height)
        : '-',
    canvasDpr:
      canvas instanceof HTMLCanvasElement
        ? canvas.dataset.boardCanvasDpr || '-'
        : '-',
    cellCount: gridSize ? gridSize.rows * gridSize.cols : 0,
    contentBox: formatRect(content),
    contentInline,
    scroll: `${formatNumber(board.scrollLeft)},${formatNumber(
      board.scrollTop,
    )}`,
    surfaceBox: formatRect(surface),
    surfaceTransform,
    viewport: getViewportStats(),
  };
};
