import { test as base } from "@playwright/test";
import { getApiCredentials } from "../src/api/common/env";

type CredentialsFixture = {
  credentials: { username: string; password: string };
};

export const test = base.extend<CredentialsFixture>({
  credentials: async ({}, use) => {
    await use(getApiCredentials());
  },
});

export { expect } from "@playwright/test";