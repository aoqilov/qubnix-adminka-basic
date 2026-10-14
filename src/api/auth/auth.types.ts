/**
 * Panel akkaunti — qubnix foydalanuvchilaridan alohida (swagger: `/dashboard/auth/*`).
 * `owner` — hammasi; `admin` — faqat o'qish (tarif yaratish/tahrirlash/o'chirish 403).
 */
export type AdminRole = "owner" | "admin";

export interface AdminUser {
  /** Katta son — string. */
  id: string;
  login: string;
  name: string;
  role: AdminRole;
  is_active: boolean;
}

export interface LoginRequest {
  login: string;
  password: string;
}

/** POST /dashboard/auth/login. Token 24 soat amal qiladi, serverda sessiya yo'q. */
export interface LoginResponse {
  /** Har so'rovga `Authorization: Bearer` bo'lib qo'shiladi (interceptors.ts). */
  access_token: string;
  token_type: "Bearer";
  /** Soniya. */
  expires_in: number;
  user: AdminUser;
}
