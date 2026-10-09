import type { PlanDurationMonths, StatsDepth } from "@/types/domain";

/**
 * qubnix `GET /api/v1/subscription-plans` bilan bir xil shakllar (swagger). Admin yo'llari
 * (`/api/v1/admin/subscription-plans`) va CRUD so'rovlari — taklif, backend bilan kelishilmagan.
 */

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
  /** so'm */
  amount: number;
  discount_percent: number;
  is_active: boolean;
  sort_order: number;
}

export interface RawSubscriptionPlan {
  id: number;
  name: string;
  /** 1 oylik narx; bepul tarifda null. */
  price_monthly: number | null;
  /** 12 oylik narx; bepul tarifda null. */
  price_yearly: number | null;
  currency: "UZS";
  recommended: boolean;
  is_free: boolean;
  /** Ro'yxatdan o'tganda beriladigan tarif — o'chirib bo'lmaydi. */
  is_default: boolean;
  is_active: boolean;
  sort_order: number;
  limits: RawPlanLimits;
  prices: RawPlanPrice[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/** Formadagi bitta davr narxi: `id` serverda beriladi. */
export interface PlanPriceInput {
  duration_months: PlanDurationMonths;
  amount: number;
  discount_percent: number;
  is_active: boolean;
}

/** POST /admin/subscription-plans va PATCH (qisman) — `{ data: ... }` ichida yuboriladi. */
export interface PlanInput {
  name: string;
  recommended: boolean;
  is_active: boolean;
  sort_order: number;
  limits: RawPlanLimits;
  /** Narxlar to'liq almashtiriladi; `price_monthly`/`price_yearly` serverda shulardan hisoblanadi. */
  prices: PlanPriceInput[];
}

export type UpdatePlanInput = Partial<PlanInput>;
