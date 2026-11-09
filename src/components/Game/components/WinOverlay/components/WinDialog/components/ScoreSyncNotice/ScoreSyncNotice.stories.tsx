import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, fn } from 'storybook/test';
import ScoreSyncNotice from './index';
import InteractiveRetry from './stories/InteractiveRetry';

const SIMULATED_RETRY_DELAY_MS = 800;
const RETRY_FAILURE_MESSAGE = 'Still offline. Your result has not been sent.';

const META = {
  title: 'Game/ScoreSyncNotice',
  component: ScoreSyncNotice,
  args: {
    isRetrying: false,
    message: null,
    onRetry: fn().mockResolvedValue(undefined),
  },
  argTypes: {
    isRetrying: { control: 'boolean' },
    message: { control: 'text' },
    title: { control: 'text' },
    retryingMessage: { control: 'text' },
    retryingButtonLabel: { control: 'text' },
    onRetry: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Presents account-sync feedback without making requests itself. The parent owns pending state, error handling, and the retry promise. role="status" announces updated feedback without moving focus; the native disabled button prevents repeat submissions while pending. Examples use synthetic messages and never contact an account service.',
      },
      source: {
        code: '<ScoreSyncNotice isRetrying={pending} message={errorMessage} onRetry={retryScoreSync} />',
      },
    },
  },
} satisfies Meta<typeof ScoreSyncNotice>;

export default META;
type Story = StoryObj<typeof META>;

export const DefaultError: Story = {
  play: async ({ canvas, userEvent, args }) => {
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Your score is saved locally for this dialog only.',
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Retry' }));
    await expect(args.onRetry).toHaveBeenCalledOnce();
  },
};

export const CustomError: Story = {
  args: { message: 'You are offline. Reconnect and try again.' },
};
export const DailyResult: Story = {
  args: {
    title: 'Daily result not synced',
    message: 'Your daily result could not be saved.',
    retryingButtonLabel: 'Syncing',
    retryingMessage: 'Saving your daily result to your account...',
  },
};

export const Retrying: Story = {
  args: { isRetrying: true },
  play: async ({ canvas, userEvent, args }) => {
    const retry = canvas.getByRole('button', { name: 'Retrying' });
    await expect(retry).toBeDisabled();
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Retrying account sync...',
    );
    await userEvent.click(retry);
    await expect(args.onRetry).not.toHaveBeenCalled();
  },
};

export const RetryThenFail: Story = {
  args: {
    message: 'You are offline. Reconnect and try again.',
    onRetry: fn(async () => {
      // A visible, local pending state for the demo; tests wait for UI changes.
      await new Promise((resolve) =>
        setTimeout(resolve, SIMULATED_RETRY_DELAY_MS),
      );
      throw new Error(RETRY_FAILURE_MESSAGE);
    }),
  },
  render: (args) => <InteractiveRetry {...args} />,
  parameters: {
    docs: {
      description: {
        story:
          'The example parent catches a simulated rejected promise, shows pending feedback, then displays the error. The 800 ms delay makes pending visible when trying the example by hand; the test waits for rendered state rather than sleeping.',
      },
    },
  },
  play: async ({ canvas, userEvent, args }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Retry' }));
    const pendingButton = await canvas.findByRole('button', {
      name: 'Retrying',
    });
    await expect(pendingButton).toBeDisabled();
    await userEvent.click(pendingButton);
    await expect(args.onRetry).toHaveBeenCalledOnce();
    await expect(await canvas.findByText(RETRY_FAILURE_MESSAGE)).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Retry' })).toBeEnabled();
  },
};
