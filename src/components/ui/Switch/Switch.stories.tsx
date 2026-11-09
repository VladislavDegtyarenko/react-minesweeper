import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn } from 'storybook/test';
import Switch from './index';
import InteractiveSwitch from './stories/InteractiveSwitch';

const META = {
  title: 'UI/Switch',
  component: Switch,
  args: {
    checked: false,
    disabled: false,
    ariaLabel: 'Sound effects',
    onCheckedChange: fn(),
  },
  argTypes: {
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    ariaLabel: {
      control: 'text',
      description:
        'Required accessible name, including when no visible label is present.',
    },
    onCheckedChange: { control: false },
  },
  render: (args) => <InteractiveSwitch {...args} />,
  parameters: {
    docs: {
      description: {
        component:
          'A controlled switch: its parent owns checked and updates it after onCheckedChange. The example parent uses temporary React state; it never changes application sound preferences. Changing checked in Controls also updates the example. The native button supports Space and Enter.',
      },
      source: {
        code: '<Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} ariaLabel="Sound effects" />',
      },
    },
  },
} satisfies Meta<typeof Switch>;

export default META;
type Story = StoryObj<typeof META>;

export const Off: Story = {};
export const On: Story = { args: { checked: true } };

export const ToggleWithMouseAndKeyboard: Story = {
  play: async ({ canvas, userEvent, args }) => {
    const toggle = canvas.getByRole('switch', { name: 'Sound effects' });
    await expect(toggle).not.toBeChecked();
    await userEvent.click(toggle);
    await expect(toggle).toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(true);
    await userEvent.keyboard(' ');
    await expect(toggle).not.toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenLastCalledWith(false);
    await expect(args.onCheckedChange).toHaveBeenCalledTimes(2);
  },
};

export const Disabled: Story = {
  args: { checked: true, disabled: true },
  play: async ({ canvas, userEvent, args }) => {
    const toggle = canvas.getByRole('switch', { name: 'Sound effects' });
    await expect(toggle).toBeDisabled();
    await userEvent.click(toggle);
    await expect(toggle).toBeChecked();
    await expect(args.onCheckedChange).not.toHaveBeenCalled();
  },
};
