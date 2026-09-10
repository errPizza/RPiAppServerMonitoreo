import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { environment } from "../config/environment";

const ACCESS_TOKEN_KEY = "pi-command-center.access-token";
const REFRESH_TOKEN_KEY = "pi-command-center.refresh-token";
const DEVICE_ID_KEY = "pi-command-center.device-id";

export type MobileLoginResult =
  | {
      status: "approved";
      accessToken: string;
      refreshToken: string;
      accessTokenExpiresIn: number;
      refreshTokenExpiresIn: number;
    }
  | {
      status: "pending";
      session: { id: string; deviceName: string; requestedAt: number };
    };

class TokenStore {
  private accessToken: string | null = null;
  async load() {
    this.accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    return this.accessToken;
  }
  getAccessToken() {
    return this.accessToken;
  }
  async set(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
    ]);
  }
  async clear() {
    this.accessToken = null;
    await Promise.all([
      SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    ]);
  }
  async getRefreshToken() {
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  }
  async deviceId() {
    let id = await SecureStore.getItemAsync(DEVICE_ID_KEY);
    if (!id) {
      id = `mobile-${Date.now()}-${Math.random().toString(36).slice(2, 14)}`;
      await SecureStore.setItemAsync(DEVICE_ID_KEY, id);
    }
    return id;
  }
}
export const tokenStore = new TokenStore();

async function authRequest<T>(path: string, body: object): Promise<T> {
  const response = await fetch(`${environment.apiBaseUrl}/mobile/auth${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: body }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(
      payload.error ?? "Unable to authenticate with monitoring API.",
    );
  return payload as T;
}

export const authService = {
  async login(email: string, password: string): Promise<MobileLoginResult> {
    const deviceId = await tokenStore.deviceId();
    const result = await authRequest<MobileLoginResult>("/login", {
      email,
      password,
      deviceId,
      deviceName: `AGM Server Monitoring · ${Platform.OS}`,
      platform: Platform.OS,
      appVersion: "1.0.0",
    });
    if (result.status === "approved")
      await tokenStore.set(result.accessToken, result.refreshToken);
    return result;
  },
  async refresh() {
    const refreshToken = await tokenStore.getRefreshToken();
    if (!refreshToken) return false;
    try {
      const result = await authRequest<
        Extract<MobileLoginResult, { status: "approved" }>
      >("/refresh", { refreshToken });
      await tokenStore.set(result.accessToken, result.refreshToken);
      return true;
    } catch {
      await tokenStore.clear();
      return false;
    }
  },
  async logout() {
    const accessToken = tokenStore.getAccessToken();
    try {
      if (accessToken)
        await fetch(`${environment.apiBaseUrl}/mobile/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });
    } finally {
      await tokenStore.clear();
    }
  },
};
