import type { Locator, Page } from '@playwright/test';
import { BasePage } from './basePage';

export class AccountPage extends BasePage {
  private readonly rolesAndUsersTab: Locator;

  constructor(page: Page) {
    super(page);
    this.rolesAndUsersTab = this.page.getByText('Roles & Users', { exact: true });
  }

  async openRolesAndUsers() {
    // Navigate directly instead of through the profile dropdown — that menu re-renders
    // asynchronously (a notification badge loads in), which made clicking through it flaky.
    await this.page.goto('/account');
    await this.rolesAndUsersTab.click();
    // The roles table loads asynchronously after the tab switch; wait for a stable marker
    // from it before returning, so callers don't race the table's own render/data fetch
    // (this specifically caused a timeout on the slower CI runner).
    await this.page.getByText('Role ID:', { exact: false }).waitFor();
  }

  get multiAssignmentButton(): Locator {
    return this.page.getByRole('button', { name: 'Multi Assignment' });
  }

  get addUserToRoleButton(): Locator {
    return this.page.locator('button:has(svg[data-icon="add-user"])');
  }
}
