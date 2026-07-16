import { Locator, Page } from "@playwright/test";
import { BasePage } from "./basePage";

export class CostUsagePage extends BasePage {
  private readonly costUsageMenuButton: Locator;
  private readonly costUsageExplorerButton: Locator;
  private readonly groupByTrigger: Locator;
  private readonly applyButton: Locator;
  private readonly calendarIcon: Locator;

  constructor(page: Page) {
    super(page);
    this.costUsageMenuButton = this.byId('sideBarItemTitle-costAndUsage');
    this.costUsageExplorerButton = this.byId('innerSideBarItemTitle-costAndUsageExplorer');
    this.groupByTrigger = this.byId('primaryGroupBy');
    this.applyButton = this.byId('apply-filters-button'); // або getByRole('button', {name: 'Apply'}), якщо automation-id нема
    this.calendarIcon = this.byId('???');
  }

  async open() {
    await this.costUsageMenuButton.click();
    await this.costUsageExplorerButton.click();
  }

  async groupBy(optionKey: string) {
    await this.groupByTrigger.click();
    await this.byId(`group-by-option-${optionKey}`).click();
    await this.applyButton.click();
  }

groupByOption(optionKey: string) {
    return this.byId(`group-by-option-${optionKey}`);
  }

  get breadcrumb(): Locator {
    return this.page.getByRole('navigation', { name: 'breadcrumb' });
  }
}