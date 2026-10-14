// swagger: /api/v1/dashboard/stats*. Hammasida `from`/`to` majburiy (DateRangeParams, Asia/Tashkent).
// Tushum: faqat hozir `paid` buyurtmalar (`paid_at` bo'yicha), chegirma hisobga olingan, uzoq muddatli
// to'lov to'liq to'langan oyiga yoziladi. So'm summalari string.

interface RangeEcho {
  from: string;
  to: string;
  timezone: "Asia/Tashkent";
}

/** GET /stats — sonlar joriy holat (davrga bog'liq emas), faqat tushum davr bo'yicha. */
export interface DashboardStats extends RangeEcho {
  currency: "UZS";
  total_users: number;
  total_organizations: number;
  active_subscriptions: number;
  revenue_uzs: string;
}

export interface PlanRevenue {
  plan_id: number;
  plan_name: string;
  purchases_count: number;
  revenue_uzs: string;
}

/** `month` — YYYY-MM. Oylar eskidan yangiga, bo'sh oylar ham bor. */
export interface MonthlyRevenue {
  month: string;
  plans: PlanRevenue[];
  total_purchases: number;
  total_revenue_uzs: string;
}

/** GET /stats/revenue/monthly */
export interface MonthlyRevenueStats extends RangeEcho {
  currency: "UZS";
  months: MonthlyRevenue[];
  total_purchases: number;
  total_revenue_uzs: string;
}

/** GET /stats/users/monthly — `registered_at` bo'yicha, keyin o'chirilganlar ham. */
export interface MonthlyUsersStats extends RangeEcho {
  months: { month: string; new_users_count: number }[];
  total_new_users: number;
}

export interface PlanStatsRow extends PlanRevenue {
  new_organization_purchases: number;
  renewals_count: number;
  /** Davrda shu tarifni sotib olgan/uzaytirgan alohida kompaniyalar. */
  organizations_count: number;
}

/** GET /stats/plans — tirik tariflar (nollar bilan) va davrda to'lovi bor arxivdagilar. */
export interface PlanStats extends RangeEcho {
  currency: "UZS";
  plans: PlanStatsRow[];
  total_purchases: number;
  total_revenue_uzs: string;
}
