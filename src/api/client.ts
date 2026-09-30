/**
 * LifeRoute API Client
 * Automatically attaches JWT authentication bearer token, handles error states,
 * and maintains seamless fallback for rapid zero-config local prototyping.
 */

export const API_BASE_URL =
  import.meta.env["VITE_API_BASE_URL"] ??
  (typeof window !== "undefined" && window.location.port === "8080" ? "http://localhost:3001" : "");

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("liferoute_auth_token");
}

export function setAuthToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("liferoute_auth_token", token);
  }
}

export function clearAuthToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("liferoute_auth_token");
  }
}

function getHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...customHeaders,
  };
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function apiGet<T>(path: string, fallback: T): Promise<T> {
  try {
    const url = API_BASE_URL ? `${API_BASE_URL}${path}` : path;
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) {
      if (res.status === 404 && fallback !== undefined) return fallback;
      throw new Error(`API GET ${path} returned HTTP ${res.status}`);
    }
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`[LifeRoute Client] Fetch fallback for ${path}:`, err);
    return fallback;
  }
}

export async function apiPost<T>(path: string, body: unknown, fallback: T): Promise<T> {
  try {
    const url = API_BASE_URL ? `${API_BASE_URL}${path}` : path;
    const res = await fetch(url, {
      method: "POST",
      headers: getHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      throw new Error(`API POST ${path} returned HTTP ${res.status}`);
    }
    const data = (await res.json()) as T;
    if (path.includes("/auth/") && data && typeof data === "object" && "token" in data) {
      setAuthToken((data as { token: string }).token);
    }
    return data;
  } catch (err) {
    console.warn(`[LifeRoute Client] Post fallback for ${path}:`, err);
    return fallback;
  }
}
