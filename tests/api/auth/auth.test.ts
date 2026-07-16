import { expect, test } from '../fixtures';

test.describe('Login', () => {
  test('success login return jwt token and user key', async ({ apiManager, credentials }) => {
    const response = await apiManager.auth.signIn(credentials);
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    expect(response.jwtToken, 'jwt token is not defined').toBeDefined();
    expect(response.userKey, 'user key is a valid UUID').toMatch(UUID_REGEX);
  });

  test('login with invalid password returns forbidden', async ({ apiManager, credentials }) => {
    const error = await apiManager.auth.signIn({ username: credentials.username, password: 'wrong-password' }, 403);

    expect(error.type, 'error type is forbidden').toBe('Forbidden');
  });
});
