import { useTranslation } from "react-i18next";
import { CusCardbox } from "@/components/ui/cardbox/CusCardbox";
import { CusTable, type ColumnDef } from "@/components/ui/table/CusTable";
import { useFormatters } from "@/utils/format";
import type { RecentOrderRow } from "@/api/dashboard/dashboard.types";

type Row = Omit<RecentOrderRow, "id"> & { id: number };

/** Oxirgi to langan buyurtmalar. */
export function RecentOrdersCard({ rows }: { rows: RecentOrderRow[] }) {
  const { t } = useTranslation();
  const fmt = useFormatters();
  // CusTable qatorlari `id: number` talab qiladi; buyurtma id si uuid (string).
  const data: Row[] = rows.map((row, index) => ({ ...row, id: index }));

  const columns: ColumnDef<Row>[] = [
    {
      key: "company",
      header: t("sections.dashboard.recent.company"),
      render: (row) => <span className="font-medium text-primary">{row.organization_name}</span>,
    },
    { key: "plan", header: t("sections.dashboard.recent.plan"), render: (row) => row.plan_name },
    {
      key: "period",
      header: t("sections.dashboard.recent.period"),
      render: (row) => t("domain.duration", { count: row.duration_months }),
    },
    {
      key: "amount",
      header: t("sections.dashboard.recent.amount"),
      align: "right",
      render: (row) => fmt.money(row.amount),
    },
    {
      key: "paid_at",
      header: t("sections.dashboard.recent.paidAt"),
      render: (row) => (row.paid_at ? fmt.isoDateTime(row.paid_at) : "—"),
    },
  ];

  return (
    <CusCardbox className="flex min-w-0 flex-col gap-3 rounded-card p-5">
      <h2 className="font-semibold text-primary">{t("sections.dashboard.recent.title")}</h2>
      <CusTable data={data} columns={columns} size="sm" />
    </CusCardbox>
  );
}
