import { api } from "@/api-config/axiosInstance";
import type { AdminUser, LoginRequest, LoginResponse } from "@/api/auth/auth.types";
import type { ApiEnvelope } from "@/types/api";

// Logout endpoint'i yo'q — token serverda saqlanmaydi, chiqish faqat lokal (useLogout).
export const authApi = {
  login: (payload: LoginRequest): Promise<LoginResponse> =>
    api
      .post<ApiEnvelope<LoginResponse>>("/api/v1/dashboard/auth/login", { data: payload })
      .then((r) => r.data.data),

  me: (): Promise<AdminUser> =>
    api.get<ApiEnvelope<{ user: AdminUser }>>("/api/v1/dashboard/auth/me").then((r) => r.data.data.user),
};
