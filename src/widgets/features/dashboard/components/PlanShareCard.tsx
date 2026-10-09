import { useTranslation } from "react-i18next";
import { CusCardbox } from "@/components/ui/cardbox/CusCardbox";
import { CusTable, type ColumnDef } from "@/components/ui/table/CusTable";
import { useFormatters } from "@/utils/format";
import type { PlanShareRow } from "@/api/dashboard/dashboard.types";

type Row = PlanShareRow & { id: number };

/** Faol kompaniyalar va tushum — tariflar kesimida. */
export function PlanShareCard({ rows }: { rows: PlanShareRow[] }) {
  const { t } = useTranslation();
  const fmt = useFormatters();
  const data: Row[] = rows.map((row) => ({ ...row, id: row.plan_id }));

  const columns: ColumnDef<Row>[] = [
    { key: "plan_name", header: t("sections.dashboard.planShare.plan"), render: (row) => row.plan_name },
    {
      key: "companies",
      header: t("sections.dashboard.planShare.companies"),
      align: "right",
      render: (row) => fmt.number(row.companies),
    },
    {
      key: "revenue",
      header: t("sections.dashboard.planShare.revenue"),
      align: "right",
      render: (row) => fmt.money(row.revenue),
    },
  ];

  return (
    <CusCardbox className="flex min-w-0 flex-col gap-3 rounded-card p-5">
      <div>
        <h2 className="font-semibold text-primary">{t("sections.dashboard.planShare.title")}</h2>
        <p className="mt-0.5 text-xs text-secondary">{t("sections.dashboard.planShare.subtitle")}</p>
      </div>
      <CusTable data={data} columns={columns} size="sm" />
    </CusCardbox>
  );
}
