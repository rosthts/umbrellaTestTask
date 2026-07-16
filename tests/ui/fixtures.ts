import { test as base } from '../fixtures';
import { LoginPage } from '../../src/pages/loginPage';
import { CostUsagePage } from '../../src/pages/costUsagePage';

type UIFixtures = {
  loginPage: LoginPage;
  costUsagePage: CostUsagePage;
};

export const test = base.extend<UIFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  costUsagePage: async ({ page }, use) => {
    await use(new CostUsagePage(page));
  },
});

export { expect } from '@playwright/test';
