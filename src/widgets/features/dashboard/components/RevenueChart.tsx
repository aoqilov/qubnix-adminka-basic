import { useTranslation } from "react-i18next";
import { ChartCard } from "@/components/shared/charts/ChartCard";
import { ColumnChart } from "@/components/shared/charts/ColumnChart";
import { SERIES_COLORS } from "@/components/shared/charts/chartTokens";
import type { ColumnDef } from "@/components/ui/table/CusTable";
import { useFormatters } from "@/utils/format";
import type { RevenuePoint } from "../hooks/useApiDashboard";

interface RevenueRow extends RevenuePoint {
  id: number;
}

/** Oylik tushum: ustunli grafik + "Таблица" ko rinishi. */
export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  const { t } = useTranslation();
  const fmt = useFormatters();
  const rows: RevenueRow[] = data.map((point, index) => ({ ...point, id: index }));

  const columns: ColumnDef<RevenueRow>[] = [
    { key: "date", header: t("charts.table.date"), render: (row) => fmt.bucketLabel(row.date, "month") },
    {
      key: "revenue",
      header: t("sections.dashboard.revenue.series"),
      align: "right",
      render: (row) => fmt.money(row.revenue),
    },
  ];

  return (
    <ChartCard
      title={t("sections.dashboard.revenue.title")}
      subtitle={t("sections.dashboard.revenue.subtitle")}
      table={{ columns, rows }}
    >
      <ColumnChart
        data={data}
        granularity="month"
        series={[{ key: "revenue", label: t("sections.dashboard.revenue.series"), color: SERIES_COLORS[0] }]}
        formatValue={fmt.money}
        formatAxis={fmt.compact}
      />
    </ChartCard>
  );
}
