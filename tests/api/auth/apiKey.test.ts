import { expect, test } from '../fixtures';

test.describe('Account API Key', () => {
  test('get account api key', async ({ accountApiKey }) => {
    expect(accountApiKey, 'account api key is a valid API key').toMatch(/^[0-9a-f-]{36}:\d+:\d+$/i);
  });
});
