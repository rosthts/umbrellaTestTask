import { test as base, expect } from '../fixtures';
import { LoginPage } from '../../src/pages/loginPage';
import { CostUsagePage } from '../../src/pages/costUsagePage';

type UIFixtures = {
  loginPage: LoginPage;
  costUsagePage: CostUsagePage;
  trackPageErrors: void;
};

export const test = base.extend<UIFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  costUsagePage: async ({ page }, use) => {
    await use(new CostUsagePage(page));
  },

  trackPageErrors: [
    async ({ page }, use, testInfo) => {
      const criticalErrors: string[] = [];
      const consoleWarnings: string[] = [];

      page.on('pageerror', (err) => {
        criticalErrors.push(`Uncaught exception: ${err.message}`);
      });
      page.on('response', (response) => {
        if (response.status() >= 500) {
          criticalErrors.push(`Server error ${response.status()}: ${response.url()}`);
        }
      });
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleWarnings.push(msg.text());
        }
      });

      await use();

      if (consoleWarnings.length) {
        await testInfo.attach('console-errors', {
          body: consoleWarnings.join('\n'),
          contentType: 'text/plain',
        });
      }
      expect(criticalErrors, `Critical page errors:\n${criticalErrors.join('\n')}`).toEqual([]);
    },
    { auto: true },
  ],
});

export { expect } from '@playwright/test';
