/**
 * Authentication boundary. A production implementation must use platform secure
 * storage (e.g. expo-secure-store), never plain text or AsyncStorage for tokens.
 */
export interface AuthService { getAccessToken(): Promise<string | null>; signOut(): Promise<void>; }
export class UnconfiguredAuthService implements AuthService { async getAccessToken() { return null; } async signOut() {} }
