import type { APIResponse } from '@playwright/test';
import { expect } from '@playwright/test';

export class ResponseChecks {
  static async assertStatus(response: APIResponse, expectedStatus: number) {
    expect(
      response.status(),
      `expected status ${expectedStatus}, got ${response.status()}: ${await response.text()}`,
    ).toBe(expectedStatus);
  }
}
