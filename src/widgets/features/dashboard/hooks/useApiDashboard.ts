import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/api/dashboard/dashboard.api";
import { companiesApi } from "@/api/companies/companies.api";
import type { PlanStatsRow } from "@/api/dashboard/dashboard.types";
import type { CompanyHistoryEvent } from "@/api/companies/companies.types";
import type { KpiValue } from "@/types/analytics";
import { addApiDays, daysInclusive, monthStartApiDate, tashkentTodayApiDate } from "@/utils/apiDate";

/** Grafiklar: joriy oy bilan birga oxirgi 12 oy. */
const MONTHS_IN_SERIES = 12;
const RECENT_PAYMENTS = 5;
/** Tarixda to'lovdan boshqa voqealar ham bor — 5 ta to'lov topilishi uchun ko'proq olinadi. */
const RECENT_HISTORY_LIMIT = 30;

export const DASHBOARD_KEYS = {
  all: () => ["dashboard"] as const,
  overview: (today: string) => ["dashboard", "overview", today] as const,
};

/** Oylik nuqta: `date` — oy boshi (YYYY-MM-01), grafiklar shu formatni kutadi. */
export interface RevenuePoint {
  date: string;
  revenue: number;
  purchases: number;
}

export interface UsersPoint {
  date: string;
  new_users: number;
}

/**
 * Dashboard bir nechta endpoint'dan yig'iladi. Backend KPI'larning o'tgan davr qiymatini bermaydi:
 * sonlar (foydalanuvchi, kompaniya, faol obuna) — faqat joriy holat, solishtirish faqat tushumda.
 */
export interface DashboardOverview {
  kpis: {
    users_total: KpiValue;
    companies_total: KpiValue;
    active_subscriptions: KpiValue;
    /** Joriy oy tushumi; `previous` — o'tgan oyning xuddi shu kunigacha bo'lgan qismi. */
    revenue_month: KpiValue;
  };
  revenue_series: RevenuePoint[];
  users_series: UsersPoint[];
  /** Grafik davri (12 oy) bo'yicha. */
  plan_stats: PlanStatsRow[];
  recent_payments: CompanyHistoryEvent[];
}

const monthToDate = (month: string) => `${month}-01`;

async function fetchOverview(today: string): Promise<DashboardOverview> {
  const thisMonth = monthStartApiDate(today);
  const lastMonth = monthStartApiDate(today, 1);
  // Adolatli taqqos: o'tgan oyning shu kungacha qismi (o'tgan oy qisqaroq bo'lsa — oxirigacha).
  const lastMonthEnd = addApiDays(thisMonth, -1);
  const lastMonthSameDay = addApiDays(lastMonth, daysInclusive(thisMonth, today) - 1);
  const seriesRange = { from: monthStartApiDate(today, MONTHS_IN_SERIES - 1), to: today };

  const [current, previous, revenue, users, plans, history] = await Promise.all([
    dashboardApi.stats({ from: thisMonth, to: today }),
    dashboardApi.stats({ from: lastMonth, to: lastMonthSameDay < lastMonthEnd ? lastMonthSameDay : lastMonthEnd }),
    dashboardApi.revenueMonthly(seriesRange),
    dashboardApi.usersMonthly(seriesRange),
    dashboardApi.plans(seriesRange),
    companiesApi.history({ page: 1, limit: RECENT_HISTORY_LIMIT }),
  ]);

  return {
    kpis: {
      users_total: { value: current.total_users, previous: null },
      companies_total: { value: current.total_organizations, previous: null },
      active_subscriptions: { value: current.active_subscriptions, previous: null },
      revenue_month: { value: Number(current.revenue_uzs), previous: Number(previous.revenue_uzs) },
    },
    revenue_series: revenue.months.map((item) => ({
      date: monthToDate(item.month),
      revenue: Number(item.total_revenue_uzs),
      purchases: item.total_purchases,
    })),
    users_series: users.months.map((item) => ({ date: monthToDate(item.month), new_users: item.new_users_count })),
    plan_stats: plans.plans,
    recent_payments: history.events
      .filter(
        (event) =>
          event.was_paid && (event.type === "organization_purchased" || event.type === "subscription_renewed"),
      )
      .slice(0, RECENT_PAYMENTS),
  };
}

export function useDashboard() {
  // Statistika Asia/Tashkent kunlarida — kun almashsa, kalit ham almashadi.
  const today = tashkentTodayApiDate();
  return useQuery({ queryKey: DASHBOARD_KEYS.overview(today), queryFn: () => fetchOverview(today) });
}
