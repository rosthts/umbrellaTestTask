import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './tests',
  workers: 4,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }], ['allure-playwright']],

  use: {
    baseURL: process.env.BASE_URL ?? 'https://dev.umbrellacost.dev',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: process.env.API_BASE_URL ?? 'https://api.dev.umbrellacost.dev',
      },
    },
    {
      name: 'ui',
      testDir: './tests/ui',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
