import type { APIRequestContext } from '@playwright/test';
import type { Login } from './types';

export const DEFAULT_API_KEY = '-1:-1:-1';

export class AuthApiClient {
  constructor(private readonly request: APIRequestContext) {}

  async signIn(data: Login.LoginRequest, apiKey: string = DEFAULT_API_KEY) {
    return await this.request.post('/api/v1/users/signin', {
      data,
      headers: { apikey: apiKey },
    });
  }

  async getUsers(authorization: string, apikey: string) {
    return this.request.get('/api/v1/users', {
      headers: { authorization, apikey },
    });
  }

  async getUsersWithRoles(authorization: string, apikey: string) {
    return this.request.get('/api/v1/users/with-roles', {
      headers: { authorization, apikey },
    });
  }
}
