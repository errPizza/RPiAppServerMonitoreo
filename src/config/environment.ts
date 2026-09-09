export type AppEnvironment = 'mock' | 'production';

export const environment = {
  mode: (process.env.EXPO_PUBLIC_APP_ENV === 'production' ? 'production' : 'mock') as AppEnvironment,
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://monitoring.example.com/api',
  requestTimeoutMs: 10_000,
};

// Authentication belongs in an OS secure-storage adapter when a real API is connected.
// Tokens are deliberately never kept in this configuration or in AsyncStorage.
