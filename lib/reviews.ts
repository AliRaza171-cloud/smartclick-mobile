import { apiFetch } from "./api";

export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_name: string;
}

export interface ReviewSummary {
  average_rating: number | null;
  review_count: number;
}

export interface ReviewEligibility {
  can_review: boolean;
  reason: string | null;
  order_id: string | null;
}

export async function fetchReviews(productId: string): Promise<Review[]> {
  const res = await apiFetch(`/products/${productId}/reviews`, { skipAuth: true });
  if (!res.ok) return [];
  return res.json();
}

export async function fetchReviewSummary(productId: string): Promise<ReviewSummary | null> {
  const res = await apiFetch(`/products/${productId}/reviews/summary`, { skipAuth: true });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchReviewEligibility(productId: string): Promise<ReviewEligibility | null> {
  const res = await apiFetch(`/products/${productId}/reviews/eligibility`);
  if (!res.ok) return null;
  return res.json();
}

export async function submitReview(productId: string, orderId: string, rating: number, comment: string | null) {
  return apiFetch(`/products/${productId}/reviews`, {
    method: "POST",
    body: JSON.stringify({ order_id: orderId, rating, comment }),
  });
}