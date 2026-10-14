import { useTranslation } from "react-i18next";
import { CusCardbox } from "@/components/ui/cardbox/CusCardbox";
import { CusTable, type ColumnDef } from "@/components/ui/table/CusTable";
import { useFormatters } from "@/utils/format";
import type { CompanyHistoryEvent } from "@/api/companies/companies.types";

/** Oxirgi to'lovlar — kompaniyalar tarixidagi xarid va uzaytirish voqealari. */
export function RecentOrdersCard({ rows }: { rows: CompanyHistoryEvent[] }) {
  const { t } = useTranslation();
  const fmt = useFormatters();

  const columns: ColumnDef<CompanyHistoryEvent>[] = [
    {
      key: "company",
      header: t("sections.dashboard.recent.company"),
      render: (row) => <span className="font-medium text-primary">{row.organization.name}</span>,
    },
    { key: "plan", header: t("sections.dashboard.recent.plan"), render: (row) => row.plan?.name ?? "—" },
    {
      key: "period",
      header: t("sections.dashboard.recent.period"),
      render: (row) => (row.duration_months ? t("domain.duration", { count: row.duration_months }) : "—"),
    },
    {
      key: "amount",
      header: t("sections.dashboard.recent.amount"),
      align: "right",
      render: (row) => (row.amount_uzs === null ? "—" : fmt.money(row.amount_uzs)),
    },
    {
      key: "paid_at",
      header: t("sections.dashboard.recent.paidAt"),
      render: (row) => fmt.isoDateTime(row.occurred_at),
    },
  ];

  return (
    <CusCardbox className="flex min-w-0 flex-col gap-3 rounded-card p-5">
      <h2 className="font-semibold text-primary">{t("sections.dashboard.recent.title")}</h2>
      <CusTable data={rows} columns={columns} size="sm" emptyText={t("sections.dashboard.recent.empty")} />
    </CusCardbox>
  );
}
