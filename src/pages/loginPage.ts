import { Locator, Page } from "@playwright/test";
import { BasePage } from "./basePage";

export class LoginPage extends BasePage {

  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly mainLoginButton: Locator;

  constructor( page: Page) {
    super(page);
    this.emailInput = this.byId('login-email');
    this.passwordInput = this.byId('login-password');
    this.mainLoginButton = this.byId('mainLoginButton');
 }

  async goto() {
    await this.page.goto("/log_in");
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.mainLoginButton.click();
    await this.passwordInput.fill(password);
    await this.mainLoginButton.click();
  }
}