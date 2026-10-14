import type { Pagination, SortOrder } from "@/types/api";

/**
 * swagger: GET /dashboard/client-users — qubnix foydalanuvchisi + xarid statistikasi.
 * Id'lar va so'm summalari string (katta son aniqligi saqlanadi).
 */
export interface ClientUser {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  telegram_id: string;
  telegram_username: string | null;
  telegram_avatar_url: string | null;
  telegram_bot_active: boolean;
  registered_at: string;
  created_at: string;
  /** To'langan `create_organization` buyurtmalari bo'yicha alohida kompaniyalar (o'chirilganlari ham). */
  purchased_organizations_count: number;
  /** Hozir egasi bo'lgan jamoa kompaniyalari. */
  owned_organizations_count: number;
  active_paid_organizations_count: number;
  paid_payments_count: number;
  /** Faqat hozir `paid` buyurtmalar, so'm. */
  total_spent_uzs: string;
  last_payment_at: string | null;
}

export type ClientUsersSortBy =
  | "registered_at"
  | "first_name"
  | "purchased_organizations_count"
  | "owned_organizations_count"
  | "active_paid_organizations_count"
  | "paid_payments_count"
  | "total_spent_uzs"
  | "last_payment_at";

export interface ListUsersParams {
  page?: number;
  /** 1..100, standart 20. */
  limit?: number;
  /** Ism, telefon, username yoki id bo'yicha. */
  search?: string;
  sort_by?: ClientUsersSortBy;
  sort_order?: SortOrder;
}

export interface ListUsersResponse {
  users: ClientUser[];
  pagination: Pagination;
}
