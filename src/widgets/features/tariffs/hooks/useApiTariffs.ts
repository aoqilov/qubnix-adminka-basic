import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { plansApi } from "@/api/plans/plans.api";
import type { PlanInput, UpdatePlanInput } from "@/api/plans/plans.types";
import { DASHBOARD_KEYS } from "@/widgets/features/dashboard/hooks/useApiDashboard";

export const PLANS_KEYS = {
  all: () => ["plans"] as const,
};

export function usePlans() {
  return useQuery({ queryKey: PLANS_KEYS.all(), queryFn: () => plansApi.list() });
}

/** Tarif o aksa — ro yxat, dashboard (tariflar ulushi) va kompaniyalar filtri yangilanadi. */
function useInvalidatePlans() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: PLANS_KEYS.all() });
    void queryClient.invalidateQueries({ queryKey: DASHBOARD_KEYS.all() });
    void queryClient.invalidateQueries({ queryKey: ["companies"] });
  };
}

export function useCreatePlan() {
  const invalidate = useInvalidatePlans();
  return useMutation({ mutationFn: (input: PlanInput) => plansApi.create(input), onSuccess: invalidate });
}

export function useUpdatePlan() {
  const invalidate = useInvalidatePlans();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdatePlanInput }) => plansApi.update(id, input),
    onSuccess: invalidate,
  });
}

export function useDeletePlan() {
  const invalidate = useInvalidatePlans();
  return useMutation({ mutationFn: (id: number) => plansApi.remove(id), onSuccess: invalidate });
}
