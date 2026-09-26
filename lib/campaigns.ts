import { API_BASE } from "./api";

export interface Campaign {
  message: string;
}

export async function fetchActiveCampaigns(): Promise<Campaign[]> {
  try {
    const res = await fetch(`${API_BASE}/campaigns/active`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}