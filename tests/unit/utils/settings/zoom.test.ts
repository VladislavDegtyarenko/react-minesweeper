import { describe, expect, it } from 'vitest';
import { MAX_ZOOM, MIN_ZOOM } from '@/store/settings/constants';
import {
  clampZoom,
  clampZoomToRange,
  getPresetZoomValue,
  isPresetZoom,
} from '@/store/settings/utils';

describe('zoom settings helpers', () => {
  it('clamps pinch zoom to the supported preset range', () => {
    expect(clampZoom(MIN_ZOOM - 0.5)).toBe(MIN_ZOOM);
    expect(clampZoom(MAX_ZOOM + 0.5)).toBe(MAX_ZOOM);
  });

  it('keeps live pinch zoom values unrounded inside the supported range', () => {
    expect(clampZoomToRange(1.23456)).toBe(1.23456);
    expect(clampZoomToRange(MIN_ZOOM - 0.5)).toBe(MIN_ZOOM);
    expect(clampZoomToRange(MAX_ZOOM + 0.5)).toBe(MAX_ZOOM);
  });

  it('rounds committed custom zoom values to the configured precision', () => {
    expect(clampZoom(1.2344)).toBe(1.234);
    expect(clampZoom(1.2346)).toBe(1.235);
  });

  it('detects preset and custom zoom values', () => {
    expect(getPresetZoomValue(1)).toBe(1);
    expect(isPresetZoom(1.25)).toBe(true);
    expect(getPresetZoomValue(1.13)).toBeUndefined();
    expect(isPresetZoom(1.13)).toBe(false);
  });
});
