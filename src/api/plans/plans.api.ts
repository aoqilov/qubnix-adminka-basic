import { api } from "@/api-config/axiosInstance";
import { USE_MOCK } from "@/api-config/mock";
import { plansMock } from "@/api/plans/plans.mock";
import type { PlanInput, RawSubscriptionPlan, UpdatePlanInput } from "@/api/plans/plans.types";
import type { ApiEnvelope } from "@/types/api";

// Endpoint yo'llari — taklif (backend bilan hali kelishilmagan).
export const plansApi = {
  list: (): Promise<RawSubscriptionPlan[]> =>
    USE_MOCK
      ? plansMock.list()
      : api
          .get<ApiEnvelope<{ plans: RawSubscriptionPlan[] }>>("/api/v1/admin/subscription-plans")
          .then((r) => r.data.data.plans),

  create: (payload: PlanInput): Promise<RawSubscriptionPlan> =>
    USE_MOCK
      ? plansMock.create(payload)
      : api
          .post<ApiEnvelope<{ plan: RawSubscriptionPlan }>>("/api/v1/admin/subscription-plans", { data: payload })
          .then((r) => r.data.data.plan),

  update: (id: number, payload: UpdatePlanInput): Promise<RawSubscriptionPlan> =>
    USE_MOCK
      ? plansMock.update(id, payload)
      : api
          .patch<ApiEnvelope<{ plan: RawSubscriptionPlan }>>(`/api/v1/admin/subscription-plans/${id}`, {
            data: payload,
          })
          .then((r) => r.data.data.plan),

  remove: (id: number): Promise<void> =>
    USE_MOCK
      ? plansMock.remove(id)
      : api.delete(`/api/v1/admin/subscription-plans/${id}`).then(() => undefined),
};
