import type { Preview } from '@storybook/nextjs-vite';
import { INITIAL_VIEWPORTS } from 'storybook/viewport';
import { resetSettings } from './mocks/settings';
import '@/styles/globals.scss';
import './preview.scss';

const PREVIEW: Preview = {
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    nextjs: { appDirectory: true },
    a11y: { test: 'error', context: 'body' },
    controls: { expanded: true, exclude: ['className', 'style', 'ref'] },
    viewport: { options: INITIAL_VIEWPORTS },
    options: { storySort: { order: ['Introduction', 'UI', 'Game', 'Lobby'] } },
    docs: { toc: true },
  },
  decorators: [
    (Story) => (
      <main className="story-surface">
        <Story />
      </main>
    ),
  ],
  beforeEach() {
    resetSettings();

    return resetSettings;
  },
};

export default PREVIEW;
