export type AppEnvironment = 'mock' | 'production';

export const environment = {
  mode: (process.env.EXPO_PUBLIC_APP_ENV === 'production' ? 'production' : 'mock') as AppEnvironment,
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://www.anothergamemore.online/api',
  bypassAuth: process.env.EXPO_PUBLIC_BYPASS_AUTH === 'true',
  requestTimeoutMs: 10_000,
};
