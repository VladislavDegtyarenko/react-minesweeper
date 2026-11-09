import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent } from 'storybook/test';
import { CELL_MARKERS } from '@/config';
import CanvasCell from './stories/CanvasCell';
import NumberGallery from './stories/NumberGallery';
import InteractiveMarker from './stories/InteractiveMarker';
import { expectCanvasRendered } from './stories/expectCanvasRendered';

const META = {
  title: 'Game/Cell',
  component: CanvasCell,
  args: {
    value: 4,
    isOpened: false,
    marker: null,
    highlight: undefined,
    isGameLost: false,
    zoom: 1,
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
    zoom: { control: { type: 'range', min: 0.5, max: 2, step: 0.1 } },
  },
  play: async ({ canvasElement }) => expectCanvasRendered(canvasElement),
  parameters: {
    docs: {
      description: {
        component:
          'Single-cell examples mount the real BoardCanvas renderer and application styles. Controls update a fixed board without game stores or browser storage. Closed values stay concealed; opened cells have no marker (null opens as an empty cell). Red and green highlights apply to mines. Zoom changes the actual Canvas geometry. These are rendering examples; the application Board owns gameplay and keyboard input.',
      },
    },
  },
} satisfies Meta<typeof CanvasCell>;

export default META;
type Story = StoryObj<typeof META>;

export const Closed: Story = {
  play: async ({ canvas, canvasElement }) => {
    await expectCanvasRendered(canvasElement);
    await expect(canvas.getByRole('img')).toHaveAccessibleName(
      'Cell: closed',
    );
  },
};
export const Empty: Story = { args: { value: 0, isOpened: true } };
export const Number: Story = { args: { value: 3, isOpened: true } };
export const AllNumbers: Story = {
  render: () => <NumberGallery />,
  parameters: { controls: { disable: true } },
  play: async ({ canvas, canvasElement }) => {
    await expectCanvasRendered(canvasElement);
    for (const value of [1, 2, 3, 4, 5, 6, 7, 8]) {
      await expect(
        canvas.getByRole('img', {
          name: `Cell: ${value}`,
        }),
      ).toBeVisible();
    }
  },
};
export const Flagged: Story = {
  args: { value: 'mine', marker: CELL_MARKERS.FLAG },
};
export const QuestionMarked: Story = {
  args: { marker: CELL_MARKERS.QUESTION },
};
export const RevealedMine: Story = {
  args: { value: 'mine', isOpened: true, isGameLost: true },
};
export const DetonatedMine: Story = {
  args: { value: 'mine', isOpened: true, isGameLost: true, highlight: 'red' },
};
export const CorrectFlag: Story = {
  args: { value: 'mine', marker: CELL_MARKERS.FLAG, highlight: 'green' },
};
export const IncorrectFlag: Story = {
  args: { value: 2, marker: CELL_MARKERS.FLAG, isGameLost: true },
  play: async ({ canvas, canvasElement }) => {
    await expectCanvasRendered(canvasElement);
    await expect(canvas.getByRole('img')).toHaveAccessibleName(
      'Cell: incorrect flag',
    );
  },
};
export const MarkerUpdates: Story = {
  render: () => <InteractiveMarker />,
  parameters: { controls: { disable: true } },
  play: async ({ canvas, canvasElement }) => {
    await expectCanvasRendered(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Place flag' }));
    await expect(canvas.getByRole('img')).toHaveAccessibleName(/Cell: flag$/);
    await userEvent.click(canvas.getByRole('button', { name: 'Remove flag' }));
    await expect(canvas.getByRole('img')).toHaveAccessibleName(
      /Cell: closed$/,
    );
  },
};
