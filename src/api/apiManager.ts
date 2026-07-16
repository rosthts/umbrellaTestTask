import { APIRequestContext } from "@playwright/test";
import { AuthService } from "./auth/authService";

// Thin composition root: one readonly property per domain, no business logic here.
// Business/orchestration methods live in each domain's *Service class.
export class ApiManager {
  readonly auth: AuthService;

  constructor(request: APIRequestContext) {
    this.auth = new AuthService(request);
  }
}