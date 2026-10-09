import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/api/dashboard/dashboard.api";

export const DASHBOARD_KEYS = {
  all: () => ["dashboard"] as const,
};

export function useDashboard() {
  return useQuery({ queryKey: DASHBOARD_KEYS.all(), queryFn: () => dashboardApi.get() });
}
