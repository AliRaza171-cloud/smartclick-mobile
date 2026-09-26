import { API_BASE } from "./api";

export interface HeroImage {
  id: string;
  image_url: string;
  placement: "carousel" | "strip";
  sort_order: number;
}

export async function fetchHeroImages(): Promise<HeroImage[]> {
  try {
    const res = await fetch(`${API_BASE}/hero-images`);
    if (!res.ok) return [];
    const data: HeroImage[] = await res.json();
    return data.sort((a, b) => a.sort_order - b.sort_order);
  } catch {
    return [];
  }
}