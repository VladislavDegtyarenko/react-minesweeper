import { CELL_RADIUS_RATIO } from './constants';
import type { BoardCanvasTheme } from './types';

const FALLBACK_THEME: BoardCanvasTheme = {
  cellBorder: 'rgba(255, 255, 255, 0.05)',
  cellClosed: '#2b3954',
  cellClosedHover: '#344362',
  cellRevealed: '#182234',
  fontFamily:
    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  numberColors: [
    'rgba(255, 255, 255, 0.92)',
    '#4da3ff',
    '#33d69f',
    '#ff5c7a',
    '#b48cff',
    '#ffb74d',
    '#40c4ff',
    'rgba(255, 255, 255, 0.92)',
    'rgba(255, 255, 255, 0.55)',
  ],
  radiusRatio: CELL_RADIUS_RATIO,
  textPrimary: 'rgba(255, 255, 255, 0.92)',
};

const readProperty = (
  styles: CSSStyleDeclaration,
  property: string,
  fallback: string,
): string => styles.getPropertyValue(property).trim() || fallback;

const readRadiusRatio = (styles: CSSStyleDeclaration): number => {
  const value = styles.getPropertyValue('--radius-cell').trim();

  if (!value.endsWith('%')) {
    return CELL_RADIUS_RATIO;
  }

  const percentage = Number.parseFloat(value);

  return Number.isFinite(percentage) ? percentage / 100 : CELL_RADIUS_RATIO;
};

export const readBoardCanvasTheme = (
  element: HTMLElement,
): BoardCanvasTheme => {
  const styles = getComputedStyle(element);
  const numberProperties = [
    '--text-primary',
    '--one',
    '--two',
    '--three',
    '--four',
    '--five',
    '--six',
    '--seven',
    '--eight',
  ];

  return {
    cellBorder: readProperty(
      styles,
      '--cell-border',
      FALLBACK_THEME.cellBorder,
    ),
    cellClosed: readProperty(
      styles,
      '--cell-closed',
      FALLBACK_THEME.cellClosed,
    ),
    cellClosedHover: readProperty(
      styles,
      '--cell-closed-hover',
      FALLBACK_THEME.cellClosedHover,
    ),
    cellRevealed: readProperty(
      styles,
      '--cell-revealed',
      FALLBACK_THEME.cellRevealed,
    ),
    fontFamily: styles.fontFamily || FALLBACK_THEME.fontFamily,
    numberColors: numberProperties.map((property, index) =>
      readProperty(
        styles,
        property,
        FALLBACK_THEME.numberColors[index] ?? FALLBACK_THEME.textPrimary,
      ),
    ),
    radiusRatio: readRadiusRatio(styles),
    textPrimary: readProperty(
      styles,
      '--text-primary',
      FALLBACK_THEME.textPrimary,
    ),
  };
};

export const subscribeBoardCanvasThemeChanges = (
  onChange: () => void,
): (() => void) => {
  const observer = new MutationObserver(onChange);
  const options: MutationObserverInit = {
    attributeFilter: ['class', 'style'],
    attributes: true,
  };

  observer.observe(document.documentElement, options);

  if (document.body) {
    observer.observe(document.body, options);
  }

  return () => observer.disconnect();
};
