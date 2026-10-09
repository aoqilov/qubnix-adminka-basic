import { mockDelay } from "@/api-config/mock";
import { getDb, isCoveredOn } from "@/mocks/db";
import type { AdminDashboard, MonthlyRevenuePoint, MonthlyUsersPoint } from "@/api/dashboard/dashboard.types";

const MONTHS_IN_SERIES = 12;
const RECENT_ORDERS = 5;

/** Oy boshi (mahalliy). `offset` — joriy oydan necha oy oldin. */
function monthStart(today: Date, offset: number): Date {
  return new Date(today.getFullYear(), today.getMonth() - offset, 1);
}

/** YYYY-MM-01 (mahalliy sana, UTC siljishisiz). */
function monthKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${date.getFullYear()}-${month}-01`;
}

export const dashboardMock = {
  async get(): Promise<AdminDashboard> {
    await mockDelay();
    const { today, users, companies, orders, plans } = getDb();
    const thisMonth = monthStart(today, 0);
    const lastMonth = monthStart(today, 1);

    const paid = orders.filter((order) => order.status === "paid" && order.paid_at);
    const paidIn = (from: Date, to: Date) =>
      paid.filter((order) => {
        const at = new Date(order.paid_at as string).getTime();
        return at >= from.getTime() && at < to.getTime();
      });

    // ── Oylik qatorlar (eskidan yangiga)
    const revenueSeries: MonthlyRevenuePoint[] = [];
    const usersSeries: MonthlyUsersPoint[] = [];
    for (let offset = MONTHS_IN_SERIES - 1; offset >= 0; offset--) {
      const from = monthStart(today, offset);
      const to = monthStart(today, offset - 1);
      const monthOrders = paidIn(from, to);
      revenueSeries.push({
        date: monthKey(from),
        revenue: monthOrders.reduce((sum, order) => sum + order.amount, 0),
        orders: monthOrders.length,
      });
      usersSeries.push({
        date: monthKey(from),
        new_users: users.filter((user) => {
          const at = new Date(user.registered_at).getTime();
          return at >= from.getTime() && at < to.getTime();
        }).length,
      });
    }

    // ── KPI'lar: joriy qiymat va o'tgan oy oxiridagi holat
    const usersBefore = (date: Date) => users.filter((user) => new Date(user.registered_at) < date).length;
    const companiesBefore = (date: Date) => companies.filter((company) => company.createdAt < date).length;
    const activeOn = (date: Date) => companies.filter((company) => isCoveredOn(company, date)).length;
    const revenueOf = (from: Date, to: Date) => paidIn(from, to).reduce((sum, order) => sum + order.amount, 0);
    const tomorrow = new Date(today.getTime() + 86_400_000);

    // ── Tariflar ulushi: hozir faol kompaniyalar va tarifdan jami tushum
    const planShare = plans
      .filter((plan) => !plan.is_free)
      .map((plan) => ({
        plan_id: plan.id,
        plan_name: plan.name,
        companies: companies.filter((company) => {
          const last = company.periods[company.periods.length - 1];
          return last.planId === plan.id && isCoveredOn(company, today);
        }).length,
        revenue: paid.filter((order) => order.plan_id === plan.id).reduce((sum, order) => sum + order.amount, 0),
      }));

    const recentOrders = paid
      .slice()
      .sort((a, b) => (b.paid_at as string).localeCompare(a.paid_at as string))
      .slice(0, RECENT_ORDERS)
      .map((order) => ({
        ...order,
        plan_name: plans.find((plan) => plan.id === order.plan_id)?.name ?? "—",
      }));

    return {
      kpis: {
        users_total: { value: users.length, previous: usersBefore(thisMonth) },
        companies_total: { value: companies.length, previous: companiesBefore(thisMonth) },
        active_subscriptions: { value: activeOn(today), previous: activeOn(thisMonth) },
        // O'tgan oyning shu sanagacha bo'lgan qismi bilan solishtiriladi - to'liq oy emas (adolatli taqqos).
        revenue_month: {
          value: revenueOf(thisMonth, tomorrow),
          previous: revenueOf(lastMonth, new Date(lastMonth.getTime() + (tomorrow.getTime() - thisMonth.getTime()))),
        },
      },
      revenue_series: revenueSeries,
      users_series: usersSeries,
      plan_share: planShare,
      recent_orders: recentOrders,
    };
  },
};
