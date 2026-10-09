import type { RawSubscriptionPlan, RawPlanPrice } from "@/api/plans/plans.types";
import type { AdminCompanyRow, RawSubscriptionOrder } from "@/api/companies/companies.types";
import type { AdminUserRow } from "@/api/users/users.types";
import type { PlanDurationMonths, SubscriptionStatus } from "@/types/domain";
import {
  COMPANY_PREFIXES,
  COMPANY_SUFFIXES,
  FEMALE_FIRST_NAMES,
  LAST_NAME_STEMS,
  MALE_FIRST_NAMES,
  TELEGRAM_USERNAME_SUFFIXES,
} from "./names";
import { createRng } from "./random";

/**
 * Seeded in-memory "baza": bir marta quriladi, ichida tarif CRUD o'zgarishlari saqlanadi
 * (sahifa yangilanguncha). Hamma bo'lim (dashboard, kompaniyalar, foydalanuvchilar) shu
 * xom yozuvlardan hisoblanadi — hech bir raqam qo'lda yozilmagan, shuning uchun bo'limlar mos.
 */

const USERS_COUNT = 120;
const COMPANIES_COUNT = 40;
const DAY_MS = 86_400_000;
/** To'lov oynasi — buyurtma shuncha daqiqa ochiq turadi. */
const ORDER_WINDOW_MINUTES = 30;

/** Bugunning boshi (mahalliy). */
function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

function addMonths(date: Date, months: number): Date {
  const copy = new Date(date);
  copy.setMonth(copy.getMonth() + months);
  return copy;
}

function iso(date: Date): string {
  return date.toISOString();
}

/** Tariflar jadvali — qubnix narxlari va limitlari (3 oy −5%, 6 oy −10%, 12 oy −17%). */
function buildPlans(now: Date): RawSubscriptionPlan[] {
  const createdAt = iso(addDays(now, -420));
  const prices = (monthly: number): RawPlanPrice[] =>
    (
      [
        [1, 0],
        [3, 5],
        [6, 10],
        [12, 17],
      ] as const
    ).map(([months, discount], index) => ({
      id: 0,
      duration_months: months as PlanDurationMonths,
      amount: Math.round((monthly * months * (100 - discount)) / 100 / 1000) * 1000,
      discount_percent: discount,
      is_active: true,
      sort_order: index + 1,
    }));
  const withIds = (planId: number, list: RawPlanPrice[]) =>
    list.map((price, index) => ({ ...price, id: planId * 10 + index + 1 }));

  const proPrices = withIds(2, prices(149_000));
  const businessPrices = withIds(3, prices(349_000));
  const amountOf = (list: RawPlanPrice[], months: number) =>
    list.find((price) => price.duration_months === months)?.amount ?? null;

  return [
    {
      id: 1,
      name: "Start",
      price_monthly: null,
      price_yearly: null,
      currency: "UZS",
      recommended: false,
      is_free: true,
      is_default: true,
      is_active: true,
      sort_order: 1,
      limits: { members: 2, projects: 1, routines: 3, stats: "today" },
      prices: [],
      created_at: createdAt,
      updated_at: createdAt,
      deleted_at: null,
    },
    {
      id: 2,
      name: "Pro",
      price_monthly: amountOf(proPrices, 1),
      price_yearly: amountOf(proPrices, 12),
      currency: "UZS",
      recommended: true,
      is_free: false,
      is_default: false,
      is_active: true,
      sort_order: 2,
      limits: { members: 10, projects: 5, routines: 30, stats: "3months" },
      prices: proPrices,
      created_at: createdAt,
      updated_at: createdAt,
      deleted_at: null,
    },
    {
      id: 3,
      name: "Business",
      price_monthly: amountOf(businessPrices, 1),
      price_yearly: amountOf(businessPrices, 12),
      currency: "UZS",
      recommended: false,
      is_free: false,
      is_default: false,
      is_active: true,
      sort_order: 3,
      limits: { members: 100, projects: null, routines: null, stats: "full" },
      prices: businessPrices,
      created_at: createdAt,
      updated_at: createdAt,
      deleted_at: null,
    },
  ];
}

/** Obuna davri: bitta `paid` buyurtma qoplaydigan muddat. */
interface Period {
  planId: number;
  start: Date;
  end: Date;
}

interface CompanyRecord {
  id: number;
  name: string;
  ownerId: number;
  createdAt: Date;
  membersCount: number;
  cancelled: boolean;
  periods: Period[];
}

export interface MockDb {
  today: Date;
  plans: RawSubscriptionPlan[];
  users: AdminUserRow[];
  companies: CompanyRecord[];
  orders: RawSubscriptionOrder[];
  nextPlanId: number;
}

function build(): MockDb {
  const rng = createRng(20261009);
  const today = startOfToday();
  const plans = buildPlans(today);

  // ── Foydalanuvchilar
  const users: AdminUserRow[] = Array.from({ length: USERS_COUNT }, (_, index) => {
    const female = rng.chance(0.45);
    const firstName = rng.pick(female ? FEMALE_FIRST_NAMES : MALE_FIRST_NAMES);
    const lastName = `${rng.pick(LAST_NAME_STEMS)}${female ? "ova" : "ov"}`;
    const registeredAt = addDays(today, -rng.int(8, 400));
    registeredAt.setHours(rng.int(8, 22), rng.int(0, 59), rng.int(0, 59), 0);
    const hasUsername = rng.chance(0.7);
    return {
      id: 1001 + index,
      telegram_id: String(500_000_000 + rng.int(0, 99_999_999)),
      telegram_username: hasUsername
        ? `${firstName.toLowerCase()}${rng.pick(TELEGRAM_USERNAME_SUFFIXES)}${rng.int(1, 99)}`
        : null,
      telegram_first_name: firstName,
      telegram_last_name: rng.chance(0.6) ? lastName : null,
      telegram_avatar_url: null,
      first_name: firstName,
      last_name: lastName,
      phone_number: `+99890${rng.int(1_000_000, 9_999_999)}`,
      index_quality: rng.int(55, 100),
      registered_at: iso(registeredAt),
      companies_count: 0,
    };
  });

  // ── Kompaniyalar va buyurtmalar
  const names = rng.shuffle(
    COMPANY_PREFIXES.flatMap((prefix) => COMPANY_SUFFIXES.map((suffix) => `${prefix} ${suffix}`)),
  );
  const owners = rng.shuffle(users).slice(0, COMPANIES_COUNT);
  const paidPlans = plans.filter((plan) => !plan.is_free);
  const companies: CompanyRecord[] = [];
  const orders: RawSubscriptionOrder[] = [];

  const pushOrder = (
    company: CompanyRecord,
    plan: RawSubscriptionPlan,
    months: PlanDurationMonths,
    at: Date,
    status: RawSubscriptionOrder["status"],
    purpose: RawSubscriptionOrder["purpose"],
  ) => {
    const price = plan.prices.find((item) => item.duration_months === months);
    const paid = status === "paid";
    orders.push({
      id: `${rng.hex(8)}-${rng.hex(4)}-4${rng.hex(3)}-a${rng.hex(3)}-${rng.hex(12)}`,
      organization_id: company.id,
      organization_name: company.name,
      purpose,
      plan_id: plan.id,
      duration_months: months,
      amount: price?.amount ?? 0,
      currency: "UZS",
      discount_percent: price?.discount_percent ?? 0,
      provider: "payme",
      status,
      expires_at: iso(new Date(at.getTime() + ORDER_WINDOW_MINUTES * 60_000)),
      paid_at: paid ? iso(new Date(at.getTime() + rng.int(40, 900) * 1000)) : null,
      created_at: iso(at),
    });
  };

  owners.forEach((owner, index) => {
    const ownerRegisteredDaysAgo = Math.round((today.getTime() - new Date(owner.registered_at).getTime()) / DAY_MS);
    const createdAt = addDays(today, -rng.int(1, Math.max(1, ownerRegisteredDaysAgo - 1)));
    createdAt.setHours(rng.int(9, 20), rng.int(0, 59), 0, 0);

    let plan = rng.chance(0.62) ? paidPlans[0] : paidPlans[paidPlans.length - 1];
    const company: CompanyRecord = {
      id: 201 + index,
      name: names[index],
      ownerId: owner.id,
      createdAt,
      membersCount: 0,
      cancelled: false,
      periods: [],
    };

    // Ba'zi kompaniyalarda birinchi urinish muvaffaqiyatsiz bo'lgan.
    if (rng.chance(0.18)) {
      pushOrder(
        company,
        plan,
        1,
        new Date(createdAt.getTime() - rng.int(5, 60) * 60_000),
        rng.pick(["failed", "cancelled"] as const),
        "create_organization",
      );
    }

    let start = createdAt;
    let first = true;
    while (start.getTime() < today.getTime()) {
      const months = rng.pick([1, 1, 1, 3, 6, 12] as const);
      // Yangilashda ba'zan yuqori tarifga o'tadi.
      if (!first && plan.id !== paidPlans[paidPlans.length - 1].id && rng.chance(0.12)) {
        plan = paidPlans[paidPlans.length - 1];
      }
      const end = addMonths(start, months);
      pushOrder(company, plan, months, start, "paid", first ? "create_organization" : "renew_subscription");
      company.periods.push({ planId: plan.id, start, end });
      first = false;
      start = end;
      if (rng.chance(0.2)) break; // yangilamagan — ketgan
    }

    const lastPeriod = company.periods[company.periods.length - 1];
    company.cancelled = lastPeriod.end.getTime() > today.getTime() && rng.chance(0.1);
    const memberCap = plans.find((item) => item.id === lastPeriod.planId)?.limits.members ?? 10;
    company.membersCount = rng.int(1, Math.min(memberCap ?? 40, 40));
    companies.push(company);
  });

  // ── Foydalanuvchilarda kompaniyalar soni
  const ownedCount = new Map<number, number>();
  for (const company of companies) ownedCount.set(company.ownerId, (ownedCount.get(company.ownerId) ?? 0) + 1);
  for (const user of users) user.companies_count = ownedCount.get(user.id) ?? 0;

  orders.sort((a, b) => b.created_at.localeCompare(a.created_at));

  return { today, plans, users, companies, orders, nextPlanId: 4 };
}

let db: MockDb | null = null;

/** Birinchi chaqiruvda quriladi, keyin bir xil obyekt (CRUD o'zgarishlari shu yerda yashaydi). */
export function getDb(): MockDb {
  db ??= build();
  return db;
}

export function companyStatus(company: CompanyRecord, today: Date): SubscriptionStatus {
  const last = company.periods[company.periods.length - 1];
  if (last.end.getTime() <= today.getTime()) return "expired";
  return company.cancelled ? "cancelled" : "active";
}

/** Kompaniyaning joriy (yoki oxirgi) obuna davri. */
export function currentPeriod(company: CompanyRecord): Period {
  return company.periods[company.periods.length - 1];
}

/** Kompaniya shu sanada faol obunaga egami (bekor qilinganlar ham muddati tugaguncha faol). */
export function isCoveredOn(company: CompanyRecord, date: Date): boolean {
  return company.periods.some((period) => period.start.getTime() <= date.getTime() && date.getTime() < period.end.getTime());
}

export function toCompanyRow(database: MockDb, company: CompanyRecord): AdminCompanyRow {
  const owner = database.users.find((user) => user.id === company.ownerId);
  if (!owner) throw new Error(`mock: kompaniya ${company.id} egasi topilmadi`);
  const period = currentPeriod(company);
  const plan = database.plans.find((item) => item.id === period.planId);
  const companyOrders = database.orders.filter((order) => order.organization_id === company.id);
  return {
    id: company.id,
    name: company.name,
    owner: {
      id: owner.id,
      first_name: owner.first_name,
      last_name: owner.last_name,
      phone_number: owner.phone_number,
      telegram_username: owner.telegram_username,
    },
    plan_id: period.planId,
    plan_name: plan?.name ?? "—",
    status: companyStatus(company, database.today),
    starts_at: iso(period.start),
    expires_at: iso(period.end),
    members_count: company.membersCount,
    orders_count: companyOrders.length,
    total_paid: companyOrders.filter((order) => order.status === "paid").reduce((sum, order) => sum + order.amount, 0),
    created_at: iso(company.createdAt),
  };
}

export function paginate<T>(items: T[], page: number, limit: number) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  return {
    items: items.slice((safePage - 1) * limit, safePage * limit),
    pagination: { page: safePage, limit, total, total_pages: totalPages },
  };
}
