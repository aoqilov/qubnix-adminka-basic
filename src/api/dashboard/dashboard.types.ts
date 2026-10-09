import type { KpiValue } from "@/types/analytics";
import type { RawSubscriptionOrder } from "@/api/companies/companies.types";

/** Oylik nuqta: `date` — oy boshi (YYYY-MM-01). */
export interface MonthlyRevenuePoint {
  date: string;
  /** Faqat `paid` buyurtmalar, so'm. */
  revenue: number;
  orders: number;
}

export interface MonthlyUsersPoint {
  date: string;
  new_users: number;
}

/** Faol obunalarning tariflar bo'yicha taqsimoti. */
export interface PlanShareRow {
  plan_id: number;
  plan_name: string;
  companies: number;
  /** Shu tarifdan jami tushum, so'm. */
  revenue: number;
}

export interface RecentOrderRow extends RawSubscriptionOrder {
  plan_name: string;
}

/** GET /api/v1/admin/dashboard — taklif (swagger'da yo'q). KPI'larda `previous` — o'tgan oy. */
export interface AdminDashboard {
  kpis: {
    users_total: KpiValue;
    companies_total: KpiValue;
    active_subscriptions: KpiValue;
    /** Joriy oy tushumi, so'm (o'tgan oy bilan). */
    revenue_month: KpiValue;
  };
  revenue_series: MonthlyRevenuePoint[];
  users_series: MonthlyUsersPoint[];
  plan_share: PlanShareRow[];
  recent_orders: RecentOrderRow[];
}
