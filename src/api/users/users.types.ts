import type { Pagination } from "@/types/api";

/** qubnix `GET /api/v1/users/me` dagi `user` bilan bir xil shakl (swagger). */
export interface RawUser {
  id: number;
  telegram_id: string;
  telegram_username: string | null;
  telegram_first_name: string;
  telegram_last_name: string | null;
  telegram_avatar_url: string | null;
  first_name: string;
  last_name: string;
  phone_number: string;
  index_quality: number;
  registered_at: string;
}

/** Admin ro'yxati qatori: foydalanuvchi + u egasi bo'lgan (sotib olingan) kompaniyalar soni. */
export interface AdminUserRow extends RawUser {
  companies_count: number;
}

export interface ListUsersParams {
  page?: number;
  limit?: number;
  /** Ism, familiya, telefon yoki username bo'yicha. */
  search?: string;
}

export interface ListUsersResponse {
  users: AdminUserRow[];
  pagination: Pagination;
}
