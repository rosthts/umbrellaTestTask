import type { APIRequestContext } from '@playwright/test';
import { AuthApiClient } from './authApiClient';
import type { Login } from './types';
import { ResponseChecks } from '../common/responseChecks';

export class AuthService {
  private readonly client: AuthApiClient;

  constructor(request: APIRequestContext) {
    this.client = new AuthApiClient(request);
  }

  async signIn(data: Login.LoginRequest, expectedStatus = 200) {
    const response = await this.client.signIn(data);
    await ResponseChecks.assertStatus(response, expectedStatus);
    const body = await response.json();
    return expectedStatus === 200 ? { jwtToken: body.jwtToken, userKey: body.username } : body;
  }

  async getAccountApiKey(auth: { jwtToken: string; userKey: string }, expectedStatus = 200) {
    const response = await this.client.getUsers(auth.jwtToken, `${auth.userKey}:-1`);
    await ResponseChecks.assertStatus(response, expectedStatus);
    const body = await response.json();
    if (expectedStatus !== 200) return body;
    const account = body.accounts[0];
    return `${auth.userKey}:${account.accountKey}:${account.divisionId}`;
  }

  async whoAmI(params: { jwtToken: string; accountApiKey: string }, expectedStatus = 200) {
    const response = await this.client.getUsersWithRoles(params.jwtToken, params.accountApiKey);
    await ResponseChecks.assertStatus(response, expectedStatus);
    return response.json();
  }

  // Working whoami/role-verification alternative: /api/v1/users/with-roles returns 500 on
  // the dev environment (verified manually via curl), so we read the same identity/role
  // fields off the already-working /api/v1/users response instead.
  async getCurrentUser(auth: { jwtToken: string; userKey: string }, expectedStatus = 200) {
    const response = await this.client.getUsers(auth.jwtToken, `${auth.userKey}:-1`);
    await ResponseChecks.assertStatus(response, expectedStatus);
    const body = await response.json();
    if (expectedStatus !== 200) return body;
    return { userName: body.user_name, roleId: body.role_id, isAdmin: body.is_admin };
  }
}
