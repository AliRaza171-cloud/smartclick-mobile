import { apiFetch, API_BASE } from "./api";
import { Product } from "./products";

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
    imageUrls: (p.image_urls || []).map((url: string) => `${API_BASE}${url}`),
  };
}

export async function fetchWishlist(): Promise<Product[]> {
  const res = await apiFetch("/wishlist");
  if (!res.ok) return [];
  const data = await res.json();
  return data.map(mapProduct);
}

export async function checkWishlisted(productId: string): Promise<boolean> {
  const res = await apiFetch(`/wishlist/check/${productId}`);
  if (!res.ok) return false;
  const data = await res.json();
  return data.wishlisted;
}

export async function addToWishlist(productId: string) {
  await apiFetch(`/wishlist/${productId}`, { method: "POST" });
}

export async function removeFromWishlist(productId: string) {
  await apiFetch(`/wishlist/${productId}`, { method: "DELETE" });
}