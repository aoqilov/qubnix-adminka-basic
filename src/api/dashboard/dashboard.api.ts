import { api } from "@/api-config/axiosInstance";
import type {
  DashboardStats,
  MonthlyRevenueStats,
  MonthlyUsersStats,
  PlanStats,
} from "@/api/dashboard/dashboard.types";
import type { ApiEnvelope, DateRangeParams } from "@/types/api";

const BASE = "/api/v1/dashboard/stats";

export const dashboardApi = {
  stats: (params: DateRangeParams): Promise<DashboardStats> =>
    api.get<ApiEnvelope<DashboardStats>>(BASE, { params }).then((r) => r.data.data),

  revenueMonthly: (params: DateRangeParams): Promise<MonthlyRevenueStats> =>
    api.get<ApiEnvelope<MonthlyRevenueStats>>(`${BASE}/revenue/monthly`, { params }).then((r) => r.data.data),

  usersMonthly: (params: DateRangeParams): Promise<MonthlyUsersStats> =>
    api.get<ApiEnvelope<MonthlyUsersStats>>(`${BASE}/users/monthly`, { params }).then((r) => r.data.data),

  plans: (params: DateRangeParams): Promise<PlanStats> =>
    api.get<ApiEnvelope<PlanStats>>(`${BASE}/plans`, { params }).then((r) => r.data.data),
};
