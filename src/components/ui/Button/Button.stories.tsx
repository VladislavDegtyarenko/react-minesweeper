import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn } from 'storybook/test';
import { ReloadIcon } from '@radix-ui/react-icons';
import Button from './index';

const META = {
  title: 'UI/Button',
  component: Button,
  args: {
    children: 'New game',
    variant: 'primary',
    onClick: fn(),
    type: 'button',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger'],
    },
    isActive: { control: 'boolean' },
    isDisabled: { control: 'boolean' },
    isIcon: { control: 'boolean' },
    children: { control: 'text' },
    onClick: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          'The application button forwards native attributes and its DOM reference, so it also works as a Radix dialog trigger. Use isDisabled to prevent activation, variant for text buttons, and an accessible name for icon-only buttons. Callback spies record events without starting a game.',
      },
    },
  },
} satisfies Meta<typeof Button>;

export default META;
type Story = StoryObj<typeof META>;

export const Primary: Story = {
  play: async ({ canvas, userEvent, args }) => {
    const button = canvas.getByRole('button', { name: 'New game' });
    await userEvent.click(button);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledTimes(2);
    await userEvent.keyboard(' ');
    await expect(args.onClick).toHaveBeenCalledTimes(3);
  },
};

export const Secondary: Story = {
  args: { variant: 'secondary', children: 'Keep playing' },
};
export const Ghost: Story = { args: { variant: 'ghost', children: 'Cancel' } };
export const Danger: Story = {
  args: { variant: 'danger', children: 'Discard game' },
};
export const Active: Story = {
  args: { variant: 'secondary', isActive: true, 'aria-pressed': true },
};

export const Disabled: Story = {
  args: { isDisabled: true },
  play: async ({ canvas, userEvent, args }) => {
    const button = canvas.getByRole('button', { name: 'New game' });
    await expect(button).toBeDisabled();
    await userEvent.click(button);
    await userEvent.tab();
    await expect(button).not.toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const Icon: Story = {
  args: {
    variant: undefined,
    isIcon: true,
    'aria-label': 'Restart game',
    children: <ReloadIcon aria-hidden="true" />,
  },
  argTypes: { children: { control: false } },
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.tab();
    await expect(
      canvas.getByRole('button', { name: 'Restart game' }),
    ).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};
