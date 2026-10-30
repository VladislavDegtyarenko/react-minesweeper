import type { ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn } from 'storybook/test';
import ToggleGroup from './index';
import InteractiveToggleGroup from './stories/InteractiveToggleGroup';

type SingleSelectionProps = Extract<
  ComponentProps<typeof ToggleGroup>,
  { type: 'single' }
>;

const META = {
  title: 'UI/ToggleGroup',
  component: ToggleGroup,
  args: {
    type: 'single',
    value: 'medium',
    disabled: false,
    label: 'Difficulty',
    'aria-label': 'Difficulty',
    onValueChange: fn(),
  },
  argTypes: {
    value: { control: 'select', options: ['easy', 'medium', 'expert'] },
    disabled: { control: 'boolean' },
    type: { control: false },
    children: { control: false },
    onValueChange: { control: false },
  },
  render: (args) => <InteractiveToggleGroup {...args} />,
  parameters: {
    docs: {
      description: {
        component:
          'Composes the existing ToggleGroup, ToggleGroupRoot, and ToggleGroupItem wrappers around Radix. Single-selection items expose radio semantics and aria-checked. Arrow keys move focus; Space or Enter selects. The example parent keeps one difficulty selected by ignoring Radix’s empty value when the selected item is clicked again. Its temporary value does not change the current game. Supply aria-label separately from the visible label.',
      },
      source: {
        code: '<ToggleGroup type="single" value={level} onValueChange={selectLevel} label="Difficulty" aria-label="Difficulty">\n  <ToggleGroupItem value="easy" label="Easy" ariaLabel="Easy" />\n  <ToggleGroupItem value="medium" label="Medium" ariaLabel="Medium" />\n  <ToggleGroupItem value="expert" label="Expert" ariaLabel="Expert" />\n</ToggleGroup>',
      },
    },
  },
} satisfies Meta<SingleSelectionProps>;

export default META;
type Story = StoryObj<typeof META>;

export const Selected: Story = {};

export const KeyboardSelection: Story = {
  play: async ({ canvas, userEvent, args }) => {
    const medium = canvas.getByRole('radio', { name: 'Medium' });
    const expert = canvas.getByRole('radio', { name: 'Expert' });
    await userEvent.tab();
    await expect(medium).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(expert).toHaveFocus();
    await expect(medium).toHaveAttribute('aria-checked', 'true');
    await userEvent.keyboard(' ');
    await expect(expert).toHaveAttribute('aria-checked', 'true');
    await expect(medium).toHaveAttribute('aria-checked', 'false');
    await expect(args.onValueChange).toHaveBeenLastCalledWith('expert');
    await userEvent.click(expert);
    await expect(expert).toHaveAttribute('aria-checked', 'true');
    await expect(args.onValueChange).toHaveBeenCalledOnce();
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvas, userEvent, args }) => {
    for (const button of canvas.getAllByRole('radio')) {
      await expect(button).toBeDisabled();
      await userEvent.click(button);
    }

    await expect(args.onValueChange).not.toHaveBeenCalled();
    await expect(canvas.getByRole('radio', { name: 'Medium' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
  },
};
