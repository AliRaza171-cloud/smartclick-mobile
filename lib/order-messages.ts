import { apiFetch } from "./api";

export interface OrderMessage {
  id: string;
  order_id: string;
  sender_role: "buyer" | "admin" | "system";
  sender_name: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export async function fetchOrderMessages(orderId: string): Promise<OrderMessage[]> {
  const res = await apiFetch(`/orders/${orderId}/messages`);
  if (!res.ok) return [];
  return res.json();
}

export async function sendOrderMessage(orderId: string, message: string) {
  return apiFetch(`/orders/${orderId}/messages`, {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}

export async function cancelOrder(orderId: string) {
  return apiFetch(`/orders/${orderId}/cancel`, { method: "POST" });
}

export async function requestCancellation(orderId: string) {
  return apiFetch(`/orders/${orderId}/request-cancellation`, { method: "POST" });
}