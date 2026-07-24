export type BoardElementStats = {
  boardClient: string;
  boardScroll: string;
  cellCount: number;
  contentBox: string;
  contentInline: string;
  scroll: string;
  surfaceBox: string;
  surfaceTransform: string;
  viewport: string;
};

export const EMPTY_BOARD_ELEMENT_STATS: BoardElementStats = {
  boardClient: '-',
  boardScroll: '-',
  cellCount: 0,
  contentBox: '-',
  contentInline: '-',
  scroll: '-',
  surfaceBox: '-',
  surfaceTransform: '-',
  viewport: '-',
};

const BOARD_SELECTOR = '[data-tour-id="board"]';
const CELL_SELECTOR = '[data-tour-cell]';

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
  const board = document.querySelector(BOARD_SELECTOR);

  if (!(board instanceof HTMLElement)) {
    return {
      ...EMPTY_BOARD_ELEMENT_STATS,
      viewport: getViewportStats(),
    };
  }

  const content = board.firstElementChild;
  const surface = content?.firstElementChild ?? null;
  const contentInline =
    content instanceof HTMLElement &&
    (content.style.width || content.style.height)
      ? `${content.style.width || '-'} x ${content.style.height || '-'}`
      : '-';
  const surfaceTransform =
    surface instanceof HTMLElement
      ? surface.style.transform || getComputedStyle(surface).transform
      : '-';

  return {
    boardClient: formatSize(board.clientWidth, board.clientHeight),
    boardScroll: formatSize(board.scrollWidth, board.scrollHeight),
    cellCount: document.querySelectorAll(CELL_SELECTOR).length,
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
