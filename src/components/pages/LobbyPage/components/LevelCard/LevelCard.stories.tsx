import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn } from 'storybook/test';
import { LEVELS_CONFIG } from '@/config';
import { expectImagesLoaded } from '@/storybook/expectImagesLoaded';
import LevelCard from './index';
import InteractiveLevelCard from './stories/InteractiveLevelCard';

const META = {
  title: 'Lobby/LevelCard',
  component: LevelCard,
  args: { level: LEVELS_CONFIG[0], isSelected: false, onSelect: fn() },
  argTypes: {
    level: {
      control: 'select',
      options: LEVELS_CONFIG.map((level) => level.id),
      mapping: Object.fromEntries(
        LEVELS_CONFIG.map((level) => [level.id, level]),
      ),
      description:
        'Uses the application difficulty definitions, including rows, columns, and mine counts.',
    },
    isSelected: { control: 'boolean' },
    onSelect: { control: false },
  },
  render: (args) => <InteractiveLevelCard {...args} />,
  play: async ({ canvasElement }) => expectImagesLoaded(canvasElement),
  parameters: {
    docs: {
      description: {
        component:
          'A native button containing difficulty details and a deterministic preview board. The preview is decorative and hidden from assistive technology; the button’s name describes the difficulty, dimensions, and mines. aria-pressed exposes selection. The example parent selects the card without changing game state or navigating.',
      },
      source: {
        code: '<LevelCard level={level} isSelected={selectedLevel === level.id} onSelect={setSelectedLevel} />',
      },
    },
  },
} satisfies Meta<typeof LevelCard>;

export default META;
type Story = StoryObj<typeof META>;

export const Easy: Story = {};
export const MediumSelected: Story = {
  args: { level: LEVELS_CONFIG[1], isSelected: true },
};
export const Expert: Story = { args: { level: LEVELS_CONFIG[2] } };
export const Narrow: Story = {
  globals: { viewport: { value: 'iphone6', isRotated: false } },
};

export const KeyboardSelection: Story = {
  play: async ({ canvas, canvasElement, userEvent, args }) => {
    const card = canvas.getByRole('button', {
      name: 'Easy difficulty. 9 by 9. 10 mines',
    });
    await expect(card).toHaveAttribute('aria-pressed', 'false');
    await userEvent.tab();
    await expect(card).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(card).toHaveAttribute('aria-pressed', 'true');
    await expect(args.onSelect).toHaveBeenCalledOnce();
    await expect(args.onSelect).toHaveBeenCalledWith('easy');
    await expectImagesLoaded(canvasElement);
  },
};
