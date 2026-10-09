import { MockApiError, mockDelay } from "@/api-config/mock";
import { companyStatus, currentPeriod, getDb } from "@/mocks/db";
import type { PlanInput, RawSubscriptionPlan, UpdatePlanInput } from "@/api/plans/plans.types";

const nowIso = () => new Date().toISOString();

/** `price_monthly` / `price_yearly` / `is_free` — serverda `prices` dan hisoblanadi. */
function withDerivedFields(plan: RawSubscriptionPlan): RawSubscriptionPlan {
  const active = plan.prices.filter((price) => price.is_active);
  const amountOf = (months: number) => active.find((price) => price.duration_months === months)?.amount ?? null;
  return {
    ...plan,
    price_monthly: amountOf(1),
    price_yearly: amountOf(12),
    is_free: active.length === 0 || active.every((price) => price.amount === 0),
  };
}

function findPlan(id: number): RawSubscriptionPlan {
  const plan = getDb().plans.find((item) => item.id === id && !item.deleted_at);
  if (!plan) throw new MockApiError(404, "Тариф не найден");
  return plan;
}

function assertUniqueName(name: string, exceptId?: number) {
  const taken = getDb().plans.some(
    (item) => !item.deleted_at && item.id !== exceptId && item.name.trim().toLowerCase() === name.trim().toLowerCase(),
  );
  if (taken) throw new MockApiError(409, "Тариф с таким названием уже существует");
}

/** Shu tarifdagi faol (muddati tugamagan) kompaniyalar soni. */
function activeCompaniesOn(planId: number): number {
  const database = getDb();
  return database.companies.filter(
    (company) => currentPeriod(company).planId === planId && companyStatus(company, database.today) !== "expired",
  ).length;
}

export const plansMock = {
  async list(): Promise<RawSubscriptionPlan[]> {
    await mockDelay();
    return getDb()
      .plans.filter((plan) => !plan.deleted_at)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((plan) => ({ ...plan }));
  },

  async create(input: PlanInput): Promise<RawSubscriptionPlan> {
    await mockDelay();
    assertUniqueName(input.name);
    const database = getDb();
    const id = database.nextPlanId++;
    const now = nowIso();
    const plan = withDerivedFields({
      id,
      name: input.name.trim(),
      price_monthly: null,
      price_yearly: null,
      currency: "UZS",
      recommended: input.recommended,
      is_free: false,
      is_default: false,
      is_active: input.is_active,
      sort_order: input.sort_order,
      limits: input.limits,
      prices: input.prices.map((price, index) => ({ ...price, id: id * 10 + index + 1, sort_order: index + 1 })),
      created_at: now,
      updated_at: now,
      deleted_at: null,
    });
    if (plan.recommended) for (const other of database.plans) other.recommended = false;
    database.plans.push(plan);
    return { ...plan };
  },

  async update(id: number, input: UpdatePlanInput): Promise<RawSubscriptionPlan> {
    await mockDelay();
    const database = getDb();
    const current = findPlan(id);
    if (input.name !== undefined) assertUniqueName(input.name, id);
    if (input.is_active === false && current.is_default) {
      throw new MockApiError(409, "Тариф по умолчанию нельзя отключить");
    }
    const prices = input.prices
      ? input.prices.map((price, index) => ({ ...price, id: id * 10 + index + 1, sort_order: index + 1 }))
      : current.prices;
    const updated = withDerivedFields({
      ...current,
      ...input,
      name: input.name?.trim() ?? current.name,
      prices,
      updated_at: nowIso(),
    });
    // "Рекомендуем" — только у одного тарифа.
    if (updated.recommended) for (const other of database.plans) if (other.id !== id) other.recommended = false;
    database.plans[database.plans.findIndex((item) => item.id === id)] = updated;
    return { ...updated };
  },

  async remove(id: number): Promise<void> {
    await mockDelay();
    const plan = findPlan(id);
    if (plan.is_default) throw new MockApiError(409, "Тариф по умолчанию нельзя удалить");
    const inUse = activeCompaniesOn(id);
    if (inUse > 0) {
      throw new MockApiError(409, `Тариф используют ${inUse} активных компаний — сначала отключите его`);
    }
    plan.deleted_at = nowIso();
    plan.is_active = false;
  },
};
