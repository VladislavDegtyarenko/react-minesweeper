import { defineConfig, devices } from '@playwright/test';

const APP_URL = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: APP_URL ?? 'http://localhost:3011',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: APP_URL
    ? undefined
    : {
        command: 'npm run dev -- --hostname localhost --port 3011',
        url: 'http://localhost:3011',
        reuseExistingServer: true,
        timeout: 120000,
      },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
