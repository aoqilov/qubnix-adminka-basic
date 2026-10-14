import type { PlanDurationMonths, StatsDepth } from "@/types/domain";

// swagger: /api/v1/dashboard/subscription-plans. O'qish — owner va admin, yozish — faqat owner.

/** null — cheksiz. */
export interface RawPlanLimits {
  members: number | null;
  projects: number | null;
  routines: number | null;
  stats: StatsDepth;
}

export interface RawPlanPrice {
  id: number;
  duration_months: PlanDurationMonths;
  /** Chegirmagacha asl narx, so'm. */
  amount: number;
  /** Chegirmadan keyin to'lanadigan narx, so'm (yaxlitlangan). */
  final_amount: number;
  discount_percent: number;
  is_active: boolean;
  sort_order: number;
}

export interface RawSubscriptionPlan {
  id: number;
  name: string;
  /** 1 oylik to'lanadigan narx (chegirmadan keyin); bepul tarifda null. */
  price_monthly: number | null;
  /** 12 oylik to'lanadigan narx (chegirmadan keyin); bepul tarifda null. */
  price_yearly: number | null;
  currency: "UZS";
  recommended: boolean;
  /** Yaratilgandan keyin o'zgarmaydi; bepul tarifda narx bo'lmaydi. */
  is_free: boolean;
  /** Ro'yxatdan o'tganda beriladigan tarif — o'chirib ham, o'chirib qo'yib ham bo'lmaydi. */
  is_default: boolean;
  is_active: boolean;
  sort_order: number;
  limits: RawPlanLimits;
  /** O'chirilmagan narxlar, nofaollari ham. */
  prices: RawPlanPrice[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/** POST /{planID}/prices va yaratishdagi `prices[]`. Har bir muddat bir marta. */
export interface PlanPriceInput {
  duration_months: PlanDurationMonths;
  /** Chegirmagacha asl narx, so'm (≥ 1). */
  amount: number;
  /** 0..99 */
  discount_percent?: number;
  is_active?: boolean;
  sort_order?: number;
}

/** PATCH /{planID}/prices/{priceID} — kamida bitta maydon. Narxni o'chirish yo'q, faqat `is_active: false`. */
export interface UpdatePlanPriceInput {
  amount?: number;
  discount_percent?: number;
  is_active?: boolean;
  sort_order?: number;
}

/** POST /subscription-plans. Faol pullik tarifga kamida bitta faol narx kerak. */
export interface CreatePlanInput {
  name: string;
  currency?: "UZS";
  is_free?: boolean;
  is_active?: boolean;
  is_recommended?: boolean;
  sort_order?: number;
  limits: RawPlanLimits;
  prices?: PlanPriceInput[];
}

/** PATCH /{planID} — kamida bitta maydon. Narxlar bu yerda emas (alohida endpoint'lar), `is_free` o'zgarmaydi. */
export interface UpdatePlanInput {
  name?: string;
  is_active?: boolean;
  is_recommended?: boolean;
  sort_order?: number;
  limits?: Partial<RawPlanLimits>;
}
