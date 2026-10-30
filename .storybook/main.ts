import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/nextjs-vite';
import { mergeConfig } from 'vite';

const ASSET_BASE_PATH = process.env.STORYBOOK_BASE_PATH ?? '';
const SETTINGS_MOCK_PATH = fileURLToPath(
  new URL('./mocks/settings.ts', import.meta.url),
);

const CONFIG: StorybookConfig = {
  stories: ['../src/**/*.stories.tsx', './Introduction.mdx'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
  ],
  framework: '@storybook/nextjs-vite',
  staticDirs: ['../public'],
  core: { disableTelemetry: true },
  async viteFinal(config) {
    return mergeConfig(config, {
      base: ASSET_BASE_PATH ? `${ASSET_BASE_PATH}/` : '/',
      optimizeDeps: {
        include: [
          '@radix-ui/react-dialog',
          '@radix-ui/react-icons',
          'classnames',
          'framer-motion',
          'radix-ui',
          'zustand',
        ],
      },
      define: {
        'process.env.NEXT_PUBLIC_ASSET_BASE_PATH':
          JSON.stringify(ASSET_BASE_PATH),
      },
      resolve: {
        alias: [
          // Match the settings entry point without replacing its types or selectors.
          { find: /^@\/store\/settings$/, replacement: SETTINGS_MOCK_PATH },
        ],
      },
    });
  },
};

export default CONFIG;
