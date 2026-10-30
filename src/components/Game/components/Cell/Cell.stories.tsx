import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { CELL_MARKERS } from '@/config';
import { expectImagesLoaded } from '@/storybook/expectImagesLoaded';
import Cell from './index';
import NumberGallery from './stories/NumberGallery';

const META = {
  title: 'Game/Cell',
  component: Cell,
  args: {
    rowIndex: 0,
    cellIndex: 0,
    value: 4,
    isOpened: false,
    marker: null,
    highlight: undefined,
    isGameLost: false,
  },
  argTypes: {
    value: {
      control: 'select',
      options: [null, 0, 1, 2, 3, 4, 5, 6, 7, 8, 'mine'],
    },
    marker: {
      control: 'select',
      options: [null, CELL_MARKERS.FLAG, CELL_MARKERS.QUESTION],
    },
    highlight: { control: 'select', options: [undefined, 'red', 'green'] },
    isOpened: { control: 'boolean' },
    isGameLost: { control: 'boolean' },
    rowIndex: { control: false },
    cellIndex: { control: false },
  },
  play: async ({ canvasElement }) => expectImagesLoaded(canvasElement),
  parameters: {
    docs: {
      description: {
        component:
          'Renders a square; Board owns pointer handling and the game rules. Closed cells conceal their value. Markers belong on closed cells, red highlights identify a detonated mine, and green highlights identify correctly flagged mines after a win. Flag and question icons read a fixed zoom from a Storybook-only settings substitute. These are appearance examples, not a keyboard-accessible game grid. Controls expose individual props; named stories use valid game states.',
      },
    },
  },
} satisfies Meta<typeof Cell>;

export default META;
type Story = StoryObj<typeof META>;

export const Closed: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.queryByText('4')).not.toBeInTheDocument();
    await expect(canvas.queryByRole('img')).not.toBeInTheDocument();
  },
};

export const Empty: Story = { args: { value: 0, isOpened: true } };
export const Number: Story = { args: { value: 3, isOpened: true } };

export const AllNumbers: Story = {
  render: () => <NumberGallery />,
  parameters: { controls: { disable: true } },
  play: async ({ canvas }) => {
    for (const value of [1, 2, 3, 4, 5, 6, 7, 8]) {
      await expect(
        canvas.getByText(String(value), { exact: true }),
      ).toBeVisible();
    }
  },
};

export const Flagged: Story = {
  args: { value: 'mine', marker: CELL_MARKERS.FLAG },
  play: async ({ canvasElement }) =>
    expectImagesLoaded(canvasElement, ['flag']),
};
export const QuestionMarked: Story = {
  args: { marker: CELL_MARKERS.QUESTION },
  play: async ({ canvasElement }) =>
    expectImagesLoaded(canvasElement, ['question']),
};
export const RevealedMine: Story = {
  args: { value: 'mine', isOpened: true, isGameLost: true },
  play: async ({ canvasElement }) =>
    expectImagesLoaded(canvasElement, ['mine']),
};
export const DetonatedMine: Story = {
  args: { value: 'mine', isOpened: true, isGameLost: true, highlight: 'red' },
  play: async ({ canvasElement }) =>
    expectImagesLoaded(canvasElement, ['mine']),
};
export const CorrectFlag: Story = {
  args: { value: 'mine', marker: CELL_MARKERS.FLAG, highlight: 'green' },
  play: async ({ canvasElement }) =>
    expectImagesLoaded(canvasElement, ['flag']),
};

export const IncorrectFlag: Story = {
  args: { value: 2, marker: CELL_MARKERS.FLAG, isGameLost: true },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('img', { name: 'flag' })).toBeInTheDocument();
    await expect(canvas.getByRole('img', { name: 'cross' })).toBeVisible();
    await expect(canvas.queryByText('2')).not.toBeInTheDocument();
    await expectImagesLoaded(canvasElement);
  },
};
