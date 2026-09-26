import { apiFetch } from "./api";

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export async function fetchNotifications(): Promise<Notification[]> {
  const res = await apiFetch("/notifications");
  if (!res.ok) return [];
  return res.json();
}

export async function fetchUnreadCount(): Promise<number> {
  const res = await apiFetch("/notifications/unread-count");
  if (!res.ok) return 0;
  const data = await res.json();
  return data.count;
}

export async function markRead(id: string) {
  await apiFetch(`/notifications/${id}/read`, { method: "PATCH" });
}

export async function markAllRead() {
  await apiFetch("/notifications/read-all", { method: "PATCH" });
}