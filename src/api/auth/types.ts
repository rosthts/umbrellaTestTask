    export namespace Login {
    export interface LoginRequest {
        username: string;
        password: string;
    }
    export type Headers = Record<string, string> & {
        apikey: string;
    };

    export interface LoginResponse {
        jwtToken: string;
        username: string;
        refreshToken: string;
        }
    }

    export namespace GetUsers {

        export interface Account {
          accountKey: number;
          divisionId: number;
        }

        export interface GetUsersResponse {
          user_name: string;
          role_id: string;
          is_admin: boolean;
          accounts: Account[];
        }
      }