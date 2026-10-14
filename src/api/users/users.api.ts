import { api } from "@/api-config/axiosInstance";
import type { ListUsersParams, ListUsersResponse } from "@/api/users/users.types";
import type { ApiEnvelope } from "@/types/api";

// Faqat o'qish.
export const usersApi = {
  list: (params?: ListUsersParams): Promise<ListUsersResponse> =>
    api
      .get<ApiEnvelope<ListUsersResponse>>("/api/v1/dashboard/client-users", { params })
      .then((r) => r.data.data),
};
