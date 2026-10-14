import { api } from "@/api-config/axiosInstance";
import type {
  CreatePlanInput,
  PlanPriceInput,
  RawSubscriptionPlan,
  UpdatePlanInput,
  UpdatePlanPriceInput,
} from "@/api/plans/plans.types";
import type { ApiEnvelope } from "@/types/api";

const BASE = "/api/v1/dashboard/subscription-plans";

type PlanEnvelope = ApiEnvelope<{ plan: RawSubscriptionPlan }>;

export const plansApi = {
  /** O'chirilmaganlar, nofaollari ham. */
  list: (): Promise<RawSubscriptionPlan[]> =>
    api.get<ApiEnvelope<{ plans: RawSubscriptionPlan[] }>>(BASE).then((r) => r.data.data.plans),

  create: (payload: CreatePlanInput): Promise<RawSubscriptionPlan> =>
    api.post<PlanEnvelope>(BASE, { data: payload }).then((r) => r.data.data.plan),

  update: (planId: number, payload: UpdatePlanInput): Promise<RawSubscriptionPlan> =>
    api.patch<PlanEnvelope>(`${BASE}/${planId}`, { data: payload }).then((r) => r.data.data.plan),

  /** Soft delete. Default tarif va ishlatilayotgan tarif — 409. */
  remove: (planId: number): Promise<void> => api.delete(`${BASE}/${planId}`).then(() => undefined),

  addPrice: (planId: number, payload: PlanPriceInput): Promise<RawSubscriptionPlan> =>
    api.post<PlanEnvelope>(`${BASE}/${planId}/prices`, { data: payload }).then((r) => r.data.data.plan),

  updatePrice: (planId: number, priceId: number, payload: UpdatePlanPriceInput): Promise<RawSubscriptionPlan> =>
    api
      .patch<PlanEnvelope>(`${BASE}/${planId}/prices/${priceId}`, { data: payload })
      .then((r) => r.data.data.plan),
};
