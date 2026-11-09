import { beforeEach, describe, expect, it, vi } from 'vitest';
import { activateBoardCell } from '@/game/board';
import { useGameStore } from '@/store/game';
import { useSettingsStore } from '@/store/settings';
import { ControlModes, DigFlag } from '@/store/settings/types';
import { useTimerStore } from '@/store/timer';
import { startTimer } from '@/store/timer/actions';
import { initSFX, playSFX } from '@/store/sfx/actions';
import type { GameState } from '@/store/game/store';
import type { TBoard } from '@/types';

// Keep real game rules and selectors, replacing only stores and browser effects.
vi.mock('@/store/game', async () => {
  const { createStore } = await import('zustand/vanilla');

  return { useGameStore: createStore<GameState>()(() => ({}) as GameState) };
});
vi.mock('@/store/settings', async () => {
  const { createStore } = await import('zustand/vanilla');

  return { useSettingsStore: createStore(() => ({})) };
});
vi.mock('@/store/timer', async () => {
  const { createStore } = await import('zustand/vanilla');

  return { useTimerStore: createStore(() => ({ status: 'idle' })) };
});
vi.mock('@/store/timer/actions', () => ({ startTimer: vi.fn() }));
vi.mock('@/store/sfx', () => ({
  useSFXStore: { getState: () => ({ isLoaded: false }) },
}));
vi.mock('@/store/sfx/actions', () => ({ initSFX: vi.fn(), playSFX: vi.fn() }));

const createBoard = (): TBoard => [
  [
    { value: 'mine', isOpened: false, marker: null },
    { value: 1, isOpened: false, marker: null },
  ],
  [
    { value: 1, isOpened: false, marker: null },
    { value: 1, isOpened: false, marker: null },
  ],
];

beforeEach(() => {
  vi.clearAllMocks();
  useGameStore.setState({
    board: createBoard(),
    level: { id: 'easy', label: 'Fixture', rows: 2, cols: 2, totalMines: 1 },
    gameStatus: 'idle',
    mode: 'free',
    isGameRestarted: false,
    totalFlags: 0,
    openedSafeCells: 0,
    correctlyFlaggedMines: 0,
    onboardingTourFlagOnlyCell: null,
  });
  useSettingsStore.setState({
    isTouchScreen: false,
    controlMode: ControlModes.Pointer,
    digFlag: DigFlag.Dig,
    zoom: 1,
    isSettingsOpened: false,
    isQuestionMarkEnabled: false,
  });
  useTimerStore.setState({ status: 'idle', elapsedMs: 0, startedAtMs: null });
  vi.mocked(startTimer).mockImplementation(() => {
    useTimerStore.setState({ status: 'running' });
  });
});

describe('explicit board commands', () => {
  it('opens a cell, starts play and counts it only once', () => {
    activateBoardCell(0, 1, 'open');
    activateBoardCell(0, 1, 'open');
    expect(useGameStore.getState()).toMatchObject({
      gameStatus: 'playing',
      openedSafeCells: 1,
    });
    expect(useGameStore.getState().board[0][1].isOpened).toBe(true);
    expect(startTimer).toHaveBeenCalledTimes(1);
    expect(playSFX).toHaveBeenCalledWith('REVEAL_NUMBER');
  });

  it('respects the marker setting and never opens a flagged cell', () => {
    useSettingsStore.setState({ isQuestionMarkEnabled: true });
    activateBoardCell(0, 1, 'mark');
    activateBoardCell(0, 1, 'open');
    expect(useGameStore.getState().board[0][1]).toMatchObject({
      marker: 'flag',
      isOpened: false,
    });
    activateBoardCell(0, 1, 'mark');
    expect(useGameStore.getState().board[0][1].marker).toBe('question');
    expect(useGameStore.getState().totalFlags).toBe(0);
    activateBoardCell(0, 1, 'mark');
    expect(useGameStore.getState().board[0][1].marker).toBeNull();
  });

  it('removes flags directly when question marks are disabled', () => {
    activateBoardCell(0, 1, 'mark');
    activateBoardCell(0, 1, 'mark');
    expect(useGameStore.getState().board[0][1].marker).toBeNull();
    expect(useGameStore.getState().totalFlags).toBe(0);
  });

  it.each(['paused', 'won', 'lost'] as const)(
    'leaves %s games unchanged',
    (gameStatus) => {
      useGameStore.setState({ gameStatus });
      const original = useGameStore.getState();
      activateBoardCell(0, 1, 'open');
      activateBoardCell(1, 1, 'mark');
      expect(useGameStore.getState()).toBe(original);
      expect(initSFX).not.toHaveBeenCalled();
      expect(startTimer).not.toHaveBeenCalled();
    },
  );

  it('blocks commands while settings are open', () => {
    useSettingsStore.setState({ isSettingsOpened: true });
    const original = useGameStore.getState();
    activateBoardCell(0, 1, 'open');
    activateBoardCell(1, 1, 'mark');
    expect(useGameStore.getState()).toBe(original);
    expect(initSFX).not.toHaveBeenCalled();
  });

  it('ignores stale, fractional and non-finite coordinates without side effects', () => {
    const original = useGameStore.getState();
    for (const [row, col] of [
      [-1, 0],
      [2, 0],
      [0, 2],
      [0.5, 0],
      [0, NaN],
      [Infinity, 0],
    ]) {
      expect(() => activateBoardCell(row, col, 'open')).not.toThrow();
      expect(() => activateBoardCell(row, col, 'mark')).not.toThrow();
    }
    expect(useGameStore.getState()).toBe(original);
    expect(initSFX).not.toHaveBeenCalled();
    expect(startTimer).not.toHaveBeenCalled();
  });

  it('does not place another flag when the flag limit is reached', () => {
    activateBoardCell(0, 1, 'mark');
    activateBoardCell(1, 1, 'mark');
    expect(useGameStore.getState().totalFlags).toBe(1);
    expect(useGameStore.getState().board[1][1].marker).toBeNull();
    activateBoardCell(0, 1, 'mark');
    activateBoardCell(1, 1, 'mark');
    expect(useGameStore.getState().board[1][1].marker).toBe('flag');
  });

  it('protects the first free-play click but retains loss on a restarted board', () => {
    activateBoardCell(0, 0, 'open');
    expect(useGameStore.getState().board[0][0].value).not.toBe('mine');
    expect(useGameStore.getState().board[0][0].isOpened).toBe(true);
    expect(useGameStore.getState().gameStatus).not.toBe('lost');
    useGameStore.setState({
      board: createBoard(),
      gameStatus: 'idle',
      isGameRestarted: true,
    });
    useTimerStore.setState({ status: 'idle' });
    activateBoardCell(0, 0, 'open');
    expect(useGameStore.getState().gameStatus).toBe('lost');
    expect(useGameStore.getState().board[0][0]).toMatchObject({
      isOpened: true,
      highlight: 'red',
    });
  });

  it('wins by opening all safe cells or correctly flagging all mines', () => {
    for (const [row, col] of [
      [0, 1],
      [1, 0],
      [1, 1],
    ])
      activateBoardCell(row, col, 'open');
    expect(useGameStore.getState()).toMatchObject({
      gameStatus: 'won',
      openedSafeCells: 3,
    });
    expect(playSFX).toHaveBeenCalledWith('GAME_WIN');
    useGameStore.setState({
      board: createBoard(),
      gameStatus: 'idle',
      openedSafeCells: 0,
    });
    activateBoardCell(0, 0, 'mark');
    expect(useGameStore.getState()).toMatchObject({
      gameStatus: 'won',
      correctlyFlaggedMines: 1,
      totalFlags: 1,
    });
  });

  it('preserves the onboarding flag-only cell restriction', () => {
    useGameStore.setState({
      onboardingTourFlagOnlyCell: { rowIndex: 0, cellIndex: 1 },
    });
    activateBoardCell(0, 1, 'open');
    expect(useGameStore.getState().board[0][1].isOpened).toBe(false);
    activateBoardCell(0, 1, 'mark');
    expect(useGameStore.getState().board[0][1].marker).toBe('flag');
  });
});
