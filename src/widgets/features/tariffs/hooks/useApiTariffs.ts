import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { plansApi } from "@/api/plans/plans.api";
import type {
  CreatePlanInput,
  RawPlanLimits,
  RawSubscriptionPlan,
  UpdatePlanInput,
  UpdatePlanPriceInput,
} from "@/api/plans/plans.types";
import { PLAN_DURATIONS, type PlanDurationMonths } from "@/types/domain";
import { DASHBOARD_KEYS } from "@/widgets/features/dashboard/hooks/useApiDashboard";

export const PLANS_KEYS = {
  all: () => ["plans"] as const,
};

/** Formadan chiqadigan qiymatlar — yaratishda ham, tahrirlashda ham bir xil. */
export interface PlanFormValues {
  name: string;
  is_free: boolean;
  is_active: boolean;
  is_recommended: boolean;
  sort_order: number;
  limits: RawPlanLimits;
  /** Yoqilgan muddatlar; bepul tarifda bo'sh. */
  prices: { duration_months: PlanDurationMonths; amount: number; discount_percent: number }[];
}

export function usePlans() {
  return useQuery({ queryKey: PLANS_KEYS.all(), queryFn: () => plansApi.list() });
}

/** Tarif o'zgarsa — ro'yxat, dashboard (tariflar statistikasi) va kompaniyalar yangilanadi. */
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
  return useMutation({
    mutationFn: (values: PlanFormValues) => {
      const input: CreatePlanInput = {
        name: values.name,
        is_free: values.is_free,
        is_active: values.is_active,
        is_recommended: values.is_recommended,
        sort_order: values.sort_order,
        limits: values.limits,
        prices: values.is_free ? undefined : values.prices.map((price) => ({ ...price, is_active: true })),
      };
      return plansApi.create(input);
    },
    onSuccess: invalidate,
  });
}

/** Faqat o'zgargan maydonlar — PATCH bo'sh bo'lmasligi va o'zgarmagan `is_active` qayta tekshirilmasligi uchun. */
function planChanges(plan: RawSubscriptionPlan, values: PlanFormValues): UpdatePlanInput | null {
  const changes: UpdatePlanInput = {};
  if (values.name !== plan.name) changes.name = values.name;
  if (values.is_active !== plan.is_active) changes.is_active = values.is_active;
  if (values.is_recommended !== plan.recommended) changes.is_recommended = values.is_recommended;
  if (values.sort_order !== plan.sort_order) changes.sort_order = values.sort_order;

  const limits: Partial<RawPlanLimits> = {};
  (Object.keys(values.limits) as (keyof RawPlanLimits)[]).forEach((key) => {
    if (values.limits[key] !== plan.limits[key]) Object.assign(limits, { [key]: values.limits[key] });
  });
  if (Object.keys(limits).length > 0) changes.limits = limits;

  return Object.keys(changes).length > 0 ? changes : null;
}

/**
 * Backend narxlarni alohida endpoint'larda saqlaydi, shuning uchun bitta "Сохранить" bir nechta so'rov.
 * Tartib qoidalarga mos: "faol pullik tarifda faol narx bo'lsin" — avval narxlar qo'shiladi/yoqiladi,
 * keyin tarif o'zi, oxirida keraksiz narxlar o'chiriladi (narxni o'chirish yo'q — faqat `is_active: false`).
 */
async function savePlan(plan: RawSubscriptionPlan, values: PlanFormValues): Promise<void> {
  const enable: (() => Promise<unknown>)[] = [];
  const disable: (() => Promise<unknown>)[] = [];

  for (const months of PLAN_DURATIONS) {
    const existing = plan.prices.find((price) => price.duration_months === months);
    const wanted = values.prices.find((price) => price.duration_months === months);

    if (wanted && !existing) {
      enable.push(() => plansApi.addPrice(plan.id, { ...wanted, is_active: true }));
    } else if (wanted && existing) {
      const changes: UpdatePlanPriceInput = {};
      if (wanted.amount !== existing.amount) changes.amount = wanted.amount;
      if (wanted.discount_percent !== existing.discount_percent) changes.discount_percent = wanted.discount_percent;
      if (!existing.is_active) changes.is_active = true;
      if (Object.keys(changes).length > 0) enable.push(() => plansApi.updatePrice(plan.id, existing.id, changes));
    } else if (existing?.is_active) {
      disable.push(() => plansApi.updatePrice(plan.id, existing.id, { is_active: false }));
    }
  }

  for (const run of enable) await run();
  const changes = planChanges(plan, values);
  if (changes) await plansApi.update(plan.id, changes);
  for (const run of disable) await run();
}

export function useUpdatePlan() {
  const invalidate = useInvalidatePlans();
  return useMutation({
    mutationFn: ({ plan, values }: { plan: RawSubscriptionPlan; values: PlanFormValues }) => savePlan(plan, values),
    // Xato o'rtada bo'lsa ham qisman saqlangan narxlar ro'yxatga tushsin — keyingi urinish yangi holatdan hisoblanadi.
    onSettled: invalidate,
  });
}

export function useDeletePlan() {
  const invalidate = useInvalidatePlans();
  return useMutation({ mutationFn: (id: number) => plansApi.remove(id), onSuccess: invalidate });
}
