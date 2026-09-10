export type AppEnvironment = 'mock' | 'production';

export const environment = {
  mode: (process.env.EXPO_PUBLIC_APP_ENV === 'production' ? 'production' : 'mock') as AppEnvironment,
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://www.anothergamemore.online/api',
  requestTimeoutMs: 10_000,
};

// Credentials and session tokens never belong in public Expo variables.
// The production API uses the encrypted device storage adapter in AuthService.
