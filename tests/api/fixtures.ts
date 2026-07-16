import { test as base } from "../fixtures";
import { ApiManager } from "../../src/api/apiManager";

interface Fixture {
    apiManager: ApiManager;
    authToken: { jwtToken: string; userKey: string };
    accountApiKey: string;
}

export const test = base.extend<Fixture>({
    apiManager: async ({ request }, use) => {
        const apiManager = new ApiManager(request);
        await use(apiManager);
    },
    authToken: async ({ apiManager, credentials }, use) => {
        const response = await apiManager.auth.signIn(credentials);
        await use(response);
      },

    accountApiKey: async ({ apiManager, authToken }, use) => {
        const accountApiKey = await apiManager.auth.getAccountApiKey(authToken);
        await use(accountApiKey);
    }
    });

export { expect } from "@playwright/test";
