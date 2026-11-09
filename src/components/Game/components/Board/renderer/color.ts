import { clamp } from '@/utils';

type RgbaColor = {
  alpha: number;
  blue: number;
  green: number;
  red: number;
};

const parseHexColor = (color: string): RgbaColor | null => {
  const hex = color.slice(1);

  if (![3, 4, 6, 8].includes(hex.length)) {
    return null;
  }

  const expanded =
    hex.length <= 4
      ? [...hex].map((character) => character.repeat(2)).join('')
      : hex;
  const value = Number.parseInt(expanded, 16);

  if (!Number.isFinite(value)) {
    return null;
  }

  const hasAlpha = expanded.length === 8;

  return {
    alpha: hasAlpha ? (value & 0xff) / 255 : 1,
    blue: hasAlpha ? (value >> 8) & 0xff : value & 0xff,
    green: hasAlpha ? (value >> 16) & 0xff : (value >> 8) & 0xff,
    red: hasAlpha ? (value >> 24) & 0xff : (value >> 16) & 0xff,
  };
};

const parseRgbColor = (color: string): RgbaColor | null => {
  const match = color.match(/^rgba?\(([^)]+)\)$/i);

  if (!match?.[1]) {
    return null;
  }

  const parts = match[1].split(',').map((part) => Number.parseFloat(part));

  if (
    parts.length < 3 ||
    parts.length > 4 ||
    parts.some((part) => !Number.isFinite(part))
  ) {
    return null;
  }

  return {
    alpha: clamp(parts[3] ?? 1, 0, 1),
    blue: clamp(parts[2] ?? 0, 0, 255),
    green: clamp(parts[1] ?? 0, 0, 255),
    red: clamp(parts[0] ?? 0, 0, 255),
  };
};

const parseColor = (color: string): RgbaColor | null => {
  const normalized = color.trim();

  return normalized.startsWith('#')
    ? parseHexColor(normalized)
    : parseRgbColor(normalized);
};

const formatColorChannel = (value: number): number =>
  Math.round(value * 1000) / 1000;

export const mixBoardCanvasColors = (
  from: string,
  to: string,
  progress: number,
): string => {
  const clampedProgress = clamp(progress, 0, 1);

  if (clampedProgress === 0) {
    return from;
  }

  if (clampedProgress === 1) {
    return to;
  }

  const fromColor = parseColor(from);
  const toColor = parseColor(to);

  if (!fromColor || !toColor) {
    return clampedProgress < 0.5 ? from : to;
  }

  const inverseProgress = 1 - clampedProgress;
  const alpha =
    fromColor.alpha * inverseProgress + toColor.alpha * clampedProgress;
  const mixColorChannel = (first: number, second: number) => {
    if (alpha === 0) {
      return 0;
    }

    return (
      (first * fromColor.alpha * inverseProgress +
        second * toColor.alpha * clampedProgress) /
      alpha
    );
  };

  return `rgba(${formatColorChannel(
    mixColorChannel(fromColor.red, toColor.red),
  )}, ${formatColorChannel(
    mixColorChannel(fromColor.green, toColor.green),
  )}, ${formatColorChannel(
    mixColorChannel(fromColor.blue, toColor.blue),
  )}, ${formatColorChannel(alpha)})`;
};
