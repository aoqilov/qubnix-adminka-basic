import { api } from "@/api-config/axiosInstance";
import { USE_MOCK } from "@/api-config/mock";
import { dashboardMock } from "@/api/dashboard/dashboard.mock";
import type { AdminDashboard } from "@/api/dashboard/dashboard.types";
import type { ApiEnvelope } from "@/types/api";

// Endpoint yo'li — taklif (backend bilan hali kelishilmagan).
export const dashboardApi = {
  get: (): Promise<AdminDashboard> =>
    USE_MOCK
      ? dashboardMock.get()
      : api.get<ApiEnvelope<AdminDashboard>>("/api/v1/admin/dashboard").then((r) => r.data.data),
};
