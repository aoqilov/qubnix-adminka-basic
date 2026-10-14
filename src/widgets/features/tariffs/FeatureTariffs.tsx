import { useTranslation } from "react-i18next";
import { useState } from "react";
import { LuPencil, LuPlus, LuTrash2 } from "react-icons/lu";
import { CusPageTitle } from "@/components/ui/page-title/CusPageTitle";
import { CusCardbox } from "@/components/ui/cardbox/CusCardbox";
import { CusButton } from "@/components/ui/buttons/CusButton";
import { CusBadge } from "@/components/ui/badge/CusBadge";
import { CusTable, type ColumnDef } from "@/components/ui/table/CusTable";
import { CusDialogDelete } from "@/components/ui/dialog/CusDialogDelete";
import { CusToasterFull, useToasterFull } from "@/components/ui/toaster/CusToasterFull";
import { QueryBoundary } from "@/components/shared/query-state/QueryBoundary";
import { useFormatters } from "@/utils/format";
import { getApiErrorMessage } from "@/utils/apiErrorMessage";
import { useSessionStore } from "@/store/session.store";
import type { RawPlanLimits, RawSubscriptionPlan } from "@/api/plans/plans.types";
import { useDeletePlan, usePlans } from "./hooks/useApiTariffs";
import { PlanFormDrawer } from "./modals/PlanFormDrawer";

export default function FeatureTariffs() {
  const { t } = useTranslation();
  const fmt = useFormatters();
  const query = usePlans();
  const deletePlan = useDeletePlan();
  const toaster = useToasterFull();
  // Yaratish, tahrirlash va o'chirish — faqat owner (admin uchun backend 403 qaytaradi).
  const canManage = useSessionStore((s) => s.admin?.role === "owner");
  // `undefined` — forma yopiq, `null` — yangi tarif, son — tahrirlanayotgan tarif id'si. Tarifning o'zi
  // keshdan olinadi: saqlash qisman o'tsa ham, keyingi urinish yangilangan narxlardan hisoblanadi.
  const [editingId, setEditingId] = useState<number | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<RawSubscriptionPlan | null>(null);
  const editingPlan = editingId ? (query.data?.find((plan) => plan.id === editingId) ?? null) : null;

  const limitText = (value: number | null) => (value === null ? t("sections.tariffs.unlimited") : fmt.number(value));

  const limitsOf = (limits: RawPlanLimits) => [
    t("sections.tariffs.limitsShort.members", { value: limitText(limits.members) }),
    t("sections.tariffs.limitsShort.projects", { value: limitText(limits.projects) }),
    t("sections.tariffs.limitsShort.routines", { value: limitText(limits.routines) }),
    t("sections.tariffs.limitsShort.stats", { value: t(`domain.statsDepth.${limits.stats}`) }),
  ];

  function confirmDelete() {
    if (!deleting) return;
    deletePlan.mutate(deleting.id, {
      onSuccess: () => {
        toaster.show(t("sections.tariffs.toast.deleted"));
        setDeleting(null);
      },
      onError: (error) => {
        toaster.show(getApiErrorMessage(error), "error");
        setDeleting(null);
      },
    });
  }

  const columns: ColumnDef<RawSubscriptionPlan>[] = [
    {
      key: "name",
      header: t("sections.tariffs.columns.name"),
      render: (plan) => (
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-primary">{plan.name}</span>
          {plan.recommended && (
            <CusBadge tone="info" size="xs">
              {t("sections.tariffs.recommended")}
            </CusBadge>
          )}
          {plan.is_default && (
            <CusBadge tone="neutral" size="xs">
              {t("sections.tariffs.default")}
            </CusBadge>
          )}
        </span>
      ),
    },
    {
      key: "prices",
      header: t("sections.tariffs.columns.prices"),
      render: (plan) => {
        const prices = plan.prices.filter((price) => price.is_active);
        if (plan.is_free) return t("sections.tariffs.free");
        if (prices.length === 0) return <span className="text-secondary">{t("sections.tariffs.noPrices")}</span>;
        return (
          <span className="flex flex-col gap-0.5 text-sm">
            {prices.map((price) => (
              <span key={price.id}>
                <span className="text-secondary">{t("domain.duration", { count: price.duration_months })}: </span>
                <span className="font-medium text-primary">{fmt.money(price.final_amount)}</span>
                {price.discount_percent > 0 && (
                  <>
                    <span className="text-secondary line-through"> {fmt.money(price.amount)}</span>
                    <span className="text-success-strong"> −{price.discount_percent}%</span>
                  </>
                )}
              </span>
            ))}
          </span>
        );
      },
    },
    {
      key: "limits",
      header: t("sections.tariffs.columns.limits"),
      render: (plan) => (
        <span className="flex flex-col gap-0.5 text-sm text-secondary">
          {limitsOf(plan.limits).map((line) => (
            <span key={line}>{line}</span>
          ))}
        </span>
      ),
    },
    {
      key: "status",
      header: t("sections.tariffs.columns.status"),
      render: (plan) => (
        <CusBadge tone={plan.is_active ? "success" : "neutral"} dot>
          {plan.is_active ? t("sections.tariffs.active") : t("sections.tariffs.inactive")}
        </CusBadge>
      ),
    },
  ];

  const actionsColumn: ColumnDef<RawSubscriptionPlan> = {
    key: "actions",
    header: t("sections.tariffs.columns.actions"),
    align: "right",
    render: (plan) => (
      <span className="flex justify-end gap-1">
        <CusButton
          size="sm"
          variant="ghost"
          colorPalette="gray"
          aria-label={t("sections.tariffs.actions.edit")}
          onClick={() => setEditingId(plan.id)}
        >
          <LuPencil size={16} />
        </CusButton>
        <CusButton
          size="sm"
          variant="ghost"
          colorPalette="red"
          isDisabled={plan.is_default}
          aria-label={t("sections.tariffs.actions.delete")}
          onClick={() => setDeleting(plan)}
        >
          <LuTrash2 size={16} />
        </CusButton>
      </span>
    ),
  };

  return (
    <div className="flex flex-col gap-6">
      <CusPageTitle
        className=""
        title={t("sections.tariffs.title")}
        subtitle={t("sections.tariffs.subtitle")}
        action={
          canManage && (
            <CusButton leftIcon={<LuPlus size={16} />} onClick={() => setEditingId(null)}>
              {t("sections.tariffs.add")}
            </CusButton>
          )
        }
      />

      <QueryBoundary query={query}>
        {(plans) => (
          <CusCardbox className="rounded-card p-5">
            <CusTable
              data={plans}
              columns={canManage ? [...columns, actionsColumn] : columns}
              emptyText={t("sections.tariffs.empty")}
            />
          </CusCardbox>
        )}
      </QueryBoundary>

      <PlanFormDrawer
        open={editingId !== undefined}
        plan={editingPlan}
        onClose={() => setEditingId(undefined)}
        onSaved={(message) => {
          toaster.show(message);
          setEditingId(undefined);
        }}
      />

      <CusDialogDelete
        open={deleting !== null}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        isLoading={deletePlan.isPending}
        title={t("sections.tariffs.delete.title")}
        description={t("sections.tariffs.delete.description", { name: deleting?.name ?? "" })}
      />

      <CusToasterFull items={toaster.items} onRemove={toaster.remove} />
    </div>
  );
}
