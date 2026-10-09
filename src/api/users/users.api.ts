import { api } from "@/api-config/axiosInstance";
import { USE_MOCK } from "@/api-config/mock";
import { usersMock } from "@/api/users/users.mock";
import type { ListUsersParams, ListUsersResponse } from "@/api/users/users.types";
import type { ApiEnvelope } from "@/types/api";

// Endpoint yo'li — taklif (backend bilan hali kelishilmagan). Faqat o'qish.
export const usersApi = {
  list: (params?: ListUsersParams): Promise<ListUsersResponse> =>
    USE_MOCK
      ? usersMock.list(params)
      : api.get<ApiEnvelope<ListUsersResponse>>("/api/v1/admin/users", { params }).then((r) => r.data.data),
};
