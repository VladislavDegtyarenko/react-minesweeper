import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn, within } from 'storybook/test';
import ContinueBanner from './index';
import { CLASSIC_SNAPSHOT, DAILY_SNAPSHOT } from './stories/fixtures';

const META = {
  title: 'Lobby/ContinueBanner',
  component: ContinueBanner,
  args: { snapshot: CLASSIC_SNAPSHOT, onContinue: fn(), onStartNew: fn() },
  argTypes: {
    snapshot: {
      control: false,
      description:
        'A GameSnapshotV1 supplied by the parent. This component does not load or delete saved data itself.',
    },
    onContinue: { control: false },
    onStartNew: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Shows a saved board and asks before starting over. The fixed snapshot is sample data; callbacks only record intent. Radix renders the confirmation dialog in a portal, outside the story container. Its trigger forwards a button reference so Escape and cancellation return focus to Start New Game. The least destructive action receives initial focus.',
      },
      source: {
        code: '<ContinueBanner snapshot={savedGame} onContinue={resumeGame} onStartNew={chooseNewGame} />',
      },
    },
  },
} satisfies Meta<typeof ContinueBanner>;

export default META;
type Story = StoryObj<typeof META>;

export const Classic: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await expect(canvas.getByText('Classic · Easy')).toBeVisible();
    await expect(canvas.getByText('01:23')).toBeVisible();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Continue Game' }),
    );
    await expect(args.onContinue).toHaveBeenCalledOnce();
    await expect(args.onStartNew).not.toHaveBeenCalled();
  },
};

export const Daily: Story = { args: { snapshot: DAILY_SNAPSHOT } };
export const Narrow: Story = {
  globals: { viewport: { value: 'iphone6', isRotated: false } },
};

export const ConfirmationOpen: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: 'Start New Game' }),
    );
    const body = within(canvasElement.ownerDocument.body);
    const dialog = await body.findByRole('dialog', {
      name: 'Start a new game?',
    });
    await expect(dialog).toHaveAccessibleDescription(
      'Your saved Classic · Easy board will be discarded.',
    );
    await expect(
      within(dialog).getByRole('button', { name: 'Keep Playing' }),
    ).toHaveFocus();
    // Leave the portal open so the accessibility addon also scans this state.
  },
};

export const CancelAndEscape: Story = {
  play: async ({ canvas, canvasElement, userEvent, args }) => {
    const trigger = canvas.getByRole('button', { name: 'Start New Game' });
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(trigger);
    const dialog = within(await body.findByRole('dialog'));
    const keepPlaying = dialog.getByRole('button', { name: 'Keep Playing' });
    await expect(keepPlaying).toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect(
      dialog.getByRole('button', { name: 'Start New Game' }),
    ).toHaveFocus();
    await userEvent.tab();
    await expect(keepPlaying).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await expect(body.queryByRole('dialog')).not.toBeInTheDocument();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await userEvent.click(
      within(await body.findByRole('dialog')).getByRole('button', {
        name: 'Keep Playing',
      }),
    );
    await expect(body.queryByRole('dialog')).not.toBeInTheDocument();
    await expect(trigger).toHaveFocus();
    await expect(args.onStartNew).not.toHaveBeenCalled();
    await expect(args.onContinue).not.toHaveBeenCalled();
  },
};

export const ConfirmStartNew: Story = {
  play: async ({ canvas, canvasElement, userEvent, args }) => {
    await userEvent.click(
      canvas.getByRole('button', { name: 'Start New Game' }),
    );
    const body = within(canvasElement.ownerDocument.body);
    const dialog = within(await body.findByRole('dialog'));
    await userEvent.click(
      dialog.getByRole('button', { name: 'Start New Game' }),
    );
    await expect(args.onStartNew).toHaveBeenCalledOnce();
    await expect(args.onContinue).not.toHaveBeenCalled();
    await expect(body.queryByRole('dialog')).not.toBeInTheDocument();
  },
};
