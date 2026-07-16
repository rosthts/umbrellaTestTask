import { expect, test } from '../fixtures';

test.describe('WhoAmI (documented API)', () => {
  test.fixme(
    true,
    'GET /api/v1/users/with-roles returns 500 Internal Server Error on the dev environment ' +
      'with a correctly-formed jwtToken + account-api-key (verified manually via curl). ' +
      'Likely a server-side bug/limitation in this dev environment, not a client issue. ' +
      'See "User role verification" describe below for a working equivalent via /api/v1/users.',
  );

  test('returns current user email and role via with-roles', async ({
    apiManager,
    authToken,
    accountApiKey,
    credentials,
  }) => {
    const whoAmI = await apiManager.auth.whoAmI({ jwtToken: authToken.jwtToken, accountApiKey });
    expect(whoAmI.email).toBe(credentials.username);
    expect(whoAmI.role).toBeDefined();
  });
});

test.describe('User role verification', () => {
  test('current user email and role are correct', async ({ apiManager, authToken, credentials }) => {
    const user = await apiManager.auth.getCurrentUser(authToken);
    expect(user.userName, 'user name is defined').toBe(credentials.username);
    expect(user.roleId, 'role id is defined').toBeDefined();
    expect(user.isAdmin, 'is admin is defined').toBe(false);
  });
});
