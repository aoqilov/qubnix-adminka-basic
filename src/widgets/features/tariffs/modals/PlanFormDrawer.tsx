import { useTranslation } from "react-i18next";
import { useState } from "react";
import { CusDrawer } from "@/components/ui/dialog/CusDrawer";
import { CusButton } from "@/components/ui/buttons/CusButton";
import { CusInput } from "@/components/ui/inputs/CusInput";
import { CusSwitch } from "@/components/ui/inputs/CusSwitch";
import CusSelect from "@/components/ui/select/CusSelect";
import { getApiErrorMessage } from "@/utils/apiErrorMessage";
import { PLAN_DURATIONS, STATS_DEPTHS, type PlanDurationMonths, type StatsDepth } from "@/types/domain";
import type { PlanInput, RawSubscriptionPlan } from "@/api/plans/plans.types";
import { useCreatePlan, useUpdatePlan } from "../hooks/useApiTariffs";

interface PlanFormDrawerProps {
  open: boolean;
  /** null — yangi tarif. */
  plan: RawSubscriptionPlan | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}

type LimitKey = "members" | "projects" | "routines";
const LIMIT_KEYS: readonly LimitKey[] = ["members", "projects", "routines"];

interface LimitField {
  unlimited: boolean;
  value: string;
}

interface PriceField {
  enabled: boolean;
  amount: string;
  discount: string;
}

interface FormState {
  name: string;
  sortOrder: string;
  recommended: boolean;
  isActive: boolean;
  limits: Record<LimitKey, LimitField>;
  stats: StatsDepth;
  prices: Record<PlanDurationMonths, PriceField>;
}

function initialState(plan: RawSubscriptionPlan | null, nextSortOrder: number): FormState {
  const limit = (value: number | null | undefined, fallback: number): LimitField =>
    value === null ? { unlimited: true, value: "" } : { unlimited: false, value: String(value ?? fallback) };
  const price = (months: PlanDurationMonths): PriceField => {
    const found = plan?.prices.find((item) => item.duration_months === months);
    return found
      ? { enabled: found.is_active, amount: String(found.amount), discount: String(found.discount_percent) }
      : { enabled: false, amount: "", discount: "0" };
  };
  return {
    name: plan?.name ?? "",
    sortOrder: String(plan?.sort_order ?? nextSortOrder),
    recommended: plan?.recommended ?? false,
    isActive: plan?.is_active ?? true,
    limits: {
      members: limit(plan?.limits.members, 5),
      projects: limit(plan?.limits.projects, 3),
      routines: limit(plan?.limits.routines, 10),
    },
    stats: plan?.limits.stats ?? "3months",
    prices: {
      1: price(1),
      3: price(3),
      6: price(6),
      12: price(12),
    },
  };
}

const isPositiveInt = (value: string) => /^\d+$/.test(value) && Number(value) >= 1;

/** Tarif yaratish/tahrirlash: nom, tartib, limitlar, davrlar bo yicha narxlar. */
export function PlanFormDrawer(props: PlanFormDrawerProps) {
  // Har ochilishda forma yangidan boshlansin — `key` holatni tozalaydi.
  return <PlanForm key={props.open ? (props.plan?.id ?? "new") : "closed"} {...props} />;
}

function PlanForm({ open, plan, onClose, onSaved }: PlanFormDrawerProps) {
  const { t } = useTranslation();
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const [form, setForm] = useState<FormState>(() => initialState(plan, 1));
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const isPending = createPlan.isPending || updatePlan.isPending;

  const patch = (changes: Partial<FormState>) => setForm((current) => ({ ...current, ...changes }));
  const patchLimit = (key: LimitKey, changes: Partial<LimitField>) =>
    setForm((current) => ({ ...current, limits: { ...current.limits, [key]: { ...current.limits[key], ...changes } } }));
  const patchPrice = (months: PlanDurationMonths, changes: Partial<PriceField>) =>
    setForm((current) => ({
      ...current,
      prices: { ...current.prices, [months]: { ...current.prices[months], ...changes } },
    }));

  const nameError = !form.name.trim() ? t("sections.tariffs.form.nameRequired") : undefined;
  const limitError = (key: LimitKey) =>
    !form.limits[key].unlimited && !isPositiveInt(form.limits[key].value)
      ? t("sections.tariffs.form.limitRequired")
      : undefined;
  const amountError = (months: PlanDurationMonths) =>
    form.prices[months].enabled && !isPositiveInt(form.prices[months].amount)
      ? t("sections.tariffs.form.amountInvalid")
      : undefined;
  const discountError = (months: PlanDurationMonths) => {
    const value = form.prices[months].discount;
    return form.prices[months].enabled && !(/^\d+$/.test(value) && Number(value) <= 100)
      ? t("sections.tariffs.form.discountInvalid")
      : undefined;
  };

  const isValid =
    !nameError &&
    LIMIT_KEYS.every((key) => !limitError(key)) &&
    PLAN_DURATIONS.every((months) => !amountError(months) && !discountError(months)) &&
    /^\d+$/.test(form.sortOrder);

  function save() {
    setSubmitted(true);
    setServerError(null);
    if (!isValid) return;

    const limitValue = (key: LimitKey) => (form.limits[key].unlimited ? null : Number(form.limits[key].value));
    const input: PlanInput = {
      name: form.name.trim(),
      recommended: form.recommended,
      is_active: form.isActive,
      sort_order: Number(form.sortOrder),
      limits: {
        members: limitValue("members"),
        projects: limitValue("projects"),
        routines: limitValue("routines"),
        stats: form.stats,
      },
      prices: PLAN_DURATIONS.filter((months) => form.prices[months].enabled).map((months) => ({
        duration_months: months,
        amount: Number(form.prices[months].amount),
        discount_percent: Number(form.prices[months].discount),
        is_active: true,
      })),
    };
    const options = {
      onError: (error: unknown) => setServerError(getApiErrorMessage(error)),
    };
    if (plan) {
      updatePlan.mutate(
        { id: plan.id, input },
        { ...options, onSuccess: () => onSaved(t("sections.tariffs.toast.updated")) },
      );
    } else {
      createPlan.mutate(input, { ...options, onSuccess: () => onSaved(t("sections.tariffs.toast.created")) });
    }
  }

  const show = (message: string | undefined) => (submitted ? message : undefined);
  const limitLabels: Record<LimitKey, string> = {
    members: t("sections.tariffs.form.limitMembers"),
    projects: t("sections.tariffs.form.limitProjects"),
    routines: t("sections.tariffs.form.limitRoutines"),
  };

  return (
    <CusDrawer
      open={open}
      onClose={onClose}
      placement="end"
      size="lg"
      closeOnBackdrop={false}
      title={plan ? t("sections.tariffs.form.titleEdit") : t("sections.tariffs.form.titleAdd")}
      footer={
        <div className="flex w-full items-center justify-end gap-2">
          {serverError && <span className="mr-auto text-sm text-error-strong">{serverError}</span>}
          <CusButton variant="outline" colorPalette="gray" onClick={onClose}>
            {t("common.actions.cancel")}
          </CusButton>
          <CusButton isLoading={isPending} onClick={save}>
            {t("common.actions.save")}
          </CusButton>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        <section className="grid grid-cols-[1fr_140px] gap-3">
          <CusInput
            label={t("sections.tariffs.form.name")}
            placeholder={t("sections.tariffs.form.namePlaceholder")}
            value={form.name}
            errorText={show(nameError)}
            onChange={(event) => patch({ name: event.target.value })}
          />
          <CusInput
            label={t("sections.tariffs.form.sortOrder")}
            inputMode="numeric"
            value={form.sortOrder}
            onChange={(event) => patch({ sortOrder: event.target.value.replace(/\D/g, "") })}
          />
        </section>

        <section className="flex flex-col gap-3">
          <CusSwitch
            label={t("sections.tariffs.form.isActive")}
            checked={form.isActive}
            disabled={plan?.is_default}
            onCheckedChange={(checked) => patch({ isActive: checked })}
          />
          <CusSwitch
            label={t("sections.tariffs.form.recommended")}
            description={t("sections.tariffs.form.recommendedHint")}
            checked={form.recommended}
            onCheckedChange={(checked) => patch({ recommended: checked })}
          />
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-primary">{t("sections.tariffs.form.limitsTitle")}</h3>
          {LIMIT_KEYS.map((key) => (
            <div key={key} className="grid grid-cols-[1fr_160px] items-start gap-3">
              <CusInput
                label={limitLabels[key]}
                inputMode="numeric"
                disabled={form.limits[key].unlimited}
                value={form.limits[key].unlimited ? "" : form.limits[key].value}
                errorText={show(limitError(key))}
                onChange={(event) => patchLimit(key, { value: event.target.value.replace(/\D/g, "") })}
              />
              <div className="pt-7">
                <CusSwitch
                  label={t("sections.tariffs.form.unlimited")}
                  checked={form.limits[key].unlimited}
                  onCheckedChange={(checked) => patchLimit(key, { unlimited: checked })}
                />
              </div>
            </div>
          ))}
          <CusSelect
            label={t("sections.tariffs.form.stats")}
            options={STATS_DEPTHS.map((value) => ({ label: t(`domain.statsDepth.${value}`), value }))}
            value={form.stats}
            onChange={(value) => patch({ stats: value })}
          />
        </section>

        <section className="flex flex-col gap-3">
          <div>
            <h3 className="text-sm font-semibold text-primary">{t("sections.tariffs.form.pricesTitle")}</h3>
            <p className="mt-0.5 text-xs text-secondary">{t("sections.tariffs.form.pricesHint")}</p>
          </div>
          {PLAN_DURATIONS.map((months) => (
            <div
              key={months}
              className="grid grid-cols-[120px_1fr_120px] items-start gap-3 rounded-card border border-subtle p-3"
            >
              <div className="pt-1">
                <CusSwitch
                  label={t("domain.duration", { count: months })}
                  checked={form.prices[months].enabled}
                  onCheckedChange={(checked) => patchPrice(months, { enabled: checked })}
                />
              </div>
              <CusInput
                label={t("sections.tariffs.form.amount")}
                inputMode="numeric"
                disabled={!form.prices[months].enabled}
                value={form.prices[months].amount}
                errorText={show(amountError(months))}
                onChange={(event) => patchPrice(months, { amount: event.target.value.replace(/\D/g, "") })}
              />
              <CusInput
                label={t("sections.tariffs.form.discount")}
                inputMode="numeric"
                disabled={!form.prices[months].enabled}
                value={form.prices[months].discount}
                errorText={show(discountError(months))}
                onChange={(event) => patchPrice(months, { discount: event.target.value.replace(/\D/g, "") })}
              />
            </div>
          ))}
        </section>
      </div>
    </CusDrawer>
  );
}
