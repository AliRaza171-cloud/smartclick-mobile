import { API_BASE } from "./api";

export async function fetchProductBadges(): Promise<Record<string, string>> {
  try {
    const res = await fetch(`${API_BASE}/products/badges`);
    if (!res.ok) return {};
    return await res.json();
  } catch {
    return {};
  }
}