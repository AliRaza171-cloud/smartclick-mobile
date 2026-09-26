import { apiFetch } from "./api";

export interface OrderItem {
  product_id: string;
  title: string;
  unit_price: string;
  quantity: number;
  image_url: string | null;
}

export interface Order {
  id: string;
  items: OrderItem[];
  subtotal: string;
  voucher_code: string | null;
  discount_amount: string;
  free_shipping: boolean;
  total: string;
  payment_method: string;
  cod_fee: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  status: string;
  fulfillment_status: string;
  cancellation_requested: boolean;
  created_at: string;
}

export async function fetchOrders(): Promise<Order[]> {
  const res = await apiFetch("/orders");
  if (!res.ok) return [];
  return res.json();
}

export async function fetchOrder(id: string): Promise<Order | null> {
  const res = await apiFetch(`/orders/${id}`);
  if (!res.ok) return null;
  return res.json();
}