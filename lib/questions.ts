import { apiFetch } from "./api";

export interface ProductQuestion {
  id: string;
  question: string;
  answer: string | null;
  asker_name: string;
  created_at: string;
  answered_at: string | null;
}

export async function fetchQuestions(productId: string): Promise<ProductQuestion[]> {
  const res = await apiFetch(`/products/${productId}/questions`, { skipAuth: true });
  if (!res.ok) return [];
  return res.json();
}

export async function askQuestion(productId: string, question: string) {
  return apiFetch(`/products/${productId}/questions`, {
    method: "POST",
    body: JSON.stringify({ question }),
  });
}