import * as SecureStore from "expo-secure-store";

// Your PC's LAN IP — your phone can't reach "localhost", since that means
// the phone itself. Update this if your PC's IP changes (e.g. reconnecting
// to a different WiFi network).
export const API_BASE = "http://192.168.0.101:8000";
const REFRESH_TOKEN_KEY = "smartclick_refresh_token";

let accessToken: string | null = null;
let refreshInFlight: Promise<boolean> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

async function getStoredRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

async function storeRefreshToken(token: string) {
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
}

async function clearStoredRefreshToken() {
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

async function doRefresh(): Promise<boolean> {
  const refreshToken = await getStoredRefreshToken();
  if (!refreshToken) {
    accessToken = null;
    return false;
  }

  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Client-Type": "mobile" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!res.ok) {
    accessToken = null;
    await clearStoredRefreshToken();
    return false;
  }

  const data = await res.json();
  accessToken = data.access_token;
  if (data.refresh_token) await storeRefreshToken(data.refresh_token);
  return true;
}

/**
 * Called once when the app starts, to silently restore a session from the
 * refresh token in secure storage — the mobile equivalent of the web app's
 * cookie-based session restore on page load.
 */
export async function initAuth(): Promise<boolean> {
  refreshInFlight = doRefresh();
  const ok = await refreshInFlight;
  refreshInFlight = null;
  return ok;
}

/** Called right after a successful login/register response. */
export async function persistAuthResponse(data: { access_token: string; refresh_token?: string }) {
  accessToken = data.access_token;
  if (data.refresh_token) await storeRefreshToken(data.refresh_token);
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function apiFetch(path: string, options: RequestOptions = {}) {
  const { skipAuth, headers, ...rest } = options;

  const doFetch = () =>
    fetch(`${API_BASE}${path}`, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        "X-Client-Type": "mobile",
        ...(skipAuth || !accessToken ? {} : { Authorization: `Bearer ${accessToken}` }),
        ...headers,
      },
    });

  let res = await doFetch();

  if (res.status === 401 && !skipAuth) {
    const refreshed = refreshInFlight ? await refreshInFlight : await initAuth();
    if (refreshed) {
      res = await doFetch();
    }
  }

  return res;
}

/** FastAPI error shape normalizer — same pattern as the web app. */
export function extractErrorMessage(body: any, fallback: string): string {
  if (typeof body?.detail === "string") return body.detail;
  if (Array.isArray(body?.detail)) {
    return body.detail.map((e: any) => e.msg).join(" ") || fallback;
  }
  return fallback;
}

export async function logout() {
  const refreshToken = await getStoredRefreshToken();
  await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Client-Type": "mobile" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  }).catch(() => {});
  accessToken = null;
  await clearStoredRefreshToken();
}