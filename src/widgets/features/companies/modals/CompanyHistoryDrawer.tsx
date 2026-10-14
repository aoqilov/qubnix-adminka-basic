import { useTranslation } from "react-i18next";
import { useState } from "react";
import { CusDrawer } from "@/components/ui/dialog/CusDrawer";
import { CusTable, type ColumnDef } from "@/components/ui/table/CusTable";
import { CusPagination } from "@/components/ui/table/CusPagination";
import { OrderStatusBadge, SubscriptionStatusBadge } from "@/components/shared/badges/StatusBadges";
import { useFormatters } from "@/utils/format";
import type { Company, CompanyHistoryEvent } from "@/api/companies/companies.types";
import { useCompanyHistory } from "../hooks/useApiCompanies";

const PAGE_SIZE = 20;

interface CompanyHistoryDrawerProps {
  /** null — yopiq. */
  company: Company | null;
  onClose: () => void;
}

/** Kompaniya tanlanganda: obuna xulosasi va xarid/obuna tarixi (yangidan eskiga). */
export function CompanyHistoryDrawer({ company, onClose }: CompanyHistoryDrawerProps) {
  const { t } = useTranslation();
  const fmt = useFormatters();
  // Sahifa kompaniyaga bog'langan — boshqa kompaniya ochilsa 1-sahifadan boshlanadi.
  const [paging, setPaging] = useState<{ companyId: string | null; page: number }>({ companyId: null, page: 1 });
  const page = paging.companyId === company?.id ? paging.page : 1;
  const historyQuery = useCompanyHistory(company?.id ?? null, page, PAGE_SIZE);
  const events = historyQuery.data?.events ?? [];
  const total = historyQuery.data?.pagination.total ?? 0;

  const planText = (event: CompanyHistoryEvent) => {
    const name = event.plan?.name ?? "—";
    return event.type === "plan_changed" ? `${event.previous_plan?.name ?? "—"} → ${name}` : name;
  };

  const columns: ColumnDef<CompanyHistoryEvent>[] = [
    {
      key: "date",
      header: t("sections.companies.history.date"),
      render: (row) => fmt.isoDateTime(row.occurred_at),
    },
    {
      key: "event",
      header: t("sections.companies.history.event"),
      render: (row) => t(`domain.companyEvent.${row.type}`),
    },
    { key: "plan", header: t("sections.companies.history.plan"), render: planText },
    {
      key: "period",
      header: t("sections.companies.history.period"),
      render: (row) => (row.duration_months ? t("domain.duration", { count: row.duration_months }) : "—"),
    },
    {
      key: "amount",
      header: t("sections.companies.history.amount"),
      align: "right",
      render: (row) => {
        if (row.amount_uzs === null) return "—";
        return (
          <span>
            {fmt.money(row.amount_uzs)}
            {row.discount_percent ? <span className="text-success-strong"> −{row.discount_percent}%</span> : null}
          </span>
        );
      },
    },
    {
      key: "status",
      header: t("sections.companies.history.status"),
      render: (row) => (row.payment_status ? <OrderStatusBadge status={row.payment_status} /> : "—"),
    },
  ];

  return (
    <CusDrawer
      open={company !== null}
      onClose={onClose}
      placement="end"
      size="lg"
      title={company?.name ?? t("sections.companies.history.title")}
    >
      <div className="flex flex-col gap-4">
        {company && (
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-3">
              {company.subscription && <SubscriptionStatusBadge status={company.subscription.status} />}
              <span className="text-sm text-secondary">
                {t("sections.companies.history.summary", {
                  plan: company.subscription?.plan_name ?? "—",
                  paid: company.total_paid_uzs === null ? "—" : fmt.money(company.total_paid_uzs),
                })}
              </span>
            </div>
            <span className="text-xs text-secondary">
              {t("sections.companies.history.counts", {
                members: fmt.number(company.members_count),
                projects: fmt.number(company.projects_count),
                tasks: fmt.number(company.tasks_count),
              })}
            </span>
          </div>
        )}
        <CusTable
          data={events}
          columns={columns}
          size="sm"
          isLoading={historyQuery.isPending}
          emptyText={t("sections.companies.history.empty")}
        />
        {total > PAGE_SIZE && (
          <div className="flex justify-end">
            <CusPagination
              count={total}
              pageSize={PAGE_SIZE}
              page={page}
              onPageChange={(next) => setPaging({ companyId: company?.id ?? null, page: next })}
            />
          </div>
        )}
      </div>
    </CusDrawer>
  );
}
