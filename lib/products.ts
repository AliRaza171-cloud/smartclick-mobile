import { API_BASE, resolveImageUrl } from "./api";

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  originalPrice?: number;
  discountPct?: number;
  freeShipping: boolean;
  imageUrls: string[];
  videoUrl?: string;
  averageRating?: number | null;
  reviewCount?: number;
}

function mapProduct(p: any): Product {
  const original = parseFloat(p.price);
  const discounted = p.discount_pct ? Math.round(original * (1 - p.discount_pct / 100)) : original;
  return {
    id: p.id,
    name: p.title,
    description: p.description,
    category: p.category,
    price: discounted,
    originalPrice: p.discount_pct ? original : undefined,
    discountPct: p.discount_pct ?? undefined,
    freeShipping: p.free_shipping,
    imageUrls: (p.image_urls || []).map((url: string) => resolveImageUrl(url)),
    videoUrl: p.video_url ? resolveImageUrl(p.video_url) : undefined,
    averageRating: p.average_rating,
    reviewCount: p.review_count,
  };
}

export async function fetchProducts(category?: string, search?: string): Promise<Product[]> {
  try {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    const qs = params.toString();
    const url = qs ? `${API_BASE}/products?${qs}` : `${API_BASE}/products`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return data.map(mapProduct);
  } catch {
    return [];
  }
}

export async function fetchProduct(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_BASE}/products/${id}`);
    if (!res.ok) return null;
    return mapProduct(await res.json());
  } catch {
    return null;
  }
}