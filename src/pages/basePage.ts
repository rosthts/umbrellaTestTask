import { Page } from "@playwright/test";

export class BasePage {
  constructor(protected readonly page: Page) {}

  protected byId(id: string) {
    return this.page.locator(`[data-automation-id="${id}"]:visible, [automation-id="${id}"]:visible, [id="${id}"]:visible `);
  }
}