import { API_BASE } from "./api";

export interface ActiveVoucher {
  code: string;
  discount_type: string;
  discount_value: string;
  min_order_value: string | null;
  grants_free_shipping: boolean;
}

export async function fetchActiveVouchers(): Promise<ActiveVoucher[]> {
  try {
    const res = await fetch(`${API_BASE}/vouchers/active`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}