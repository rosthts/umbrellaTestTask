import { expect, test } from './fixtures';

test('user can log in and group the Cost & Usage Explorer chart by Region', async ({ loginPage, costUsagePage, page, credentials: { username, password } }) => {
  await loginPage.goto();
  await loginPage.login(username, password);
  await expect(page).toHaveURL(/dashboard/);

  await costUsagePage.open();
  await costUsagePage.groupBy('region');
  await expect(costUsagePage.groupByOption('region')).toHaveAttribute('data-selected', 'true');
  await expect(costUsagePage.breadcrumb).toContainText('Region'); 
});