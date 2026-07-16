import type { Locator, Page } from '@playwright/test';
import { BasePage } from './basePage';

export class AccountPage extends BasePage {
  private readonly profileMenuButton: Locator;
  private readonly accountMenuItem: Locator;
  private readonly rolesAndUsersTab: Locator;

  constructor(page: Page) {
    super(page);
    this.profileMenuButton = this.byId('topbar_current_user');
    this.accountMenuItem = this.page.getByText('Account', { exact: true });
    this.rolesAndUsersTab = this.page.getByText('Roles & Users', { exact: true });
  }

  async openRolesAndUsers() {
    await this.profileMenuButton.click();
    await this.accountMenuItem.click();
    await this.rolesAndUsersTab.click();
  }

  get multiAssignmentButton(): Locator {
    return this.page.getByRole('button', { name: 'Multi Assignment' });
  }

  get addUserToRoleButton(): Locator {
    return this.page.locator('button:has(svg[data-icon="add-user"])');
  }
}
