import { API_BASE } from "./api";

export interface CategoryMeta {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  image_url: string | null;
}

export async function fetchCategories(): Promise<CategoryMeta[]> {
  try {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}