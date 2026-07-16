export function getRequiredEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
      throw new Error(`${name} is not set`);
    }
    return value;
  }
  export function getApiCredentials() {
    return {
      username: getRequiredEnv("USER_EMAIL"),
      password: getRequiredEnv("USER_PASSWORD"),
    };
  }