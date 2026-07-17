import { test, expect } from './fixtures';

test('Editor role cannot manage roles or invite users', async ({
  page,
  loginPage,
  accountPage,
  credentials: { username, password },
}) => {
  await loginPage.goto();
  await loginPage.login(username, password);
  await expect(page).toHaveURL(/dashboard/);

  await accountPage.openRolesAndUsers();

  await expect(accountPage.multiAssignmentButton).toBeDisabled();
  await expect(accountPage.addUserToRoleButton).toHaveCSS('pointer-events', 'none');
});
