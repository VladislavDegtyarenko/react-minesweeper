import { defineConfig } from '@playwright/test';

const LOCAL_URL = 'http://127.0.0.1:6007/react-minesweeper/';
const PUBLIC_URL = process.env.STORYBOOK_URL;

export default defineConfig({
  testDir: './tests/storybook',
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: PUBLIC_URL ?? LOCAL_URL,
    browserName: 'chromium',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: PUBLIC_URL
    ? undefined
    : {
        command:
          'npx vite preview --outDir storybook-static --base /react-minesweeper/ --host 127.0.0.1 --port 6007 --strictPort',
        url: LOCAL_URL,
        reuseExistingServer: !process.env.CI,
      },
});
